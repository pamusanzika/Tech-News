const sharp = require('sharp');
const path = require('path');
const TextToSVG = require('text-to-svg');

// Load font once at module init (converts text -> SVG paths, no runtime font lookup)
const fontPath = path.join(__dirname, '../public/fonts/Montserrat-ExtraBold.ttf');
let textToSVG = null;
try {
  textToSVG = TextToSVG.loadSync(fontPath);
} catch (e) {
  console.error('Failed to load font:', fontPath, e.message);
}

async function imageOverlayHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { image_url, title, highlight_words } = req.body;

    if (!image_url || !title) {
      return res.status(400).json({ error: 'image_url and title required' });
    }

    // Parse highlight_words — accept array or JSON-string
    let highlightList = [];
    if (highlight_words) {
      try {
        highlightList = typeof highlight_words === 'string'
          ? JSON.parse(highlight_words)
          : Array.isArray(highlight_words) ? highlight_words : [];
      } catch (e) {
        highlightList = [];
      }
    }
    const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const highlightSet = new Set(highlightList.map(normalize).filter(Boolean));

    // Download image with retry (Pollinations often 500s on first try)
    async function fetchWithRetry(url, attempts = 4) {
      let lastErr;
      for (let i = 0; i < attempts; i++) {
        try {
          const r = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0',
              'Accept': 'image/jpeg,image/png,image/*'
            },
            redirect: 'follow'
          });
          if (r.ok) return r;
          lastErr = new Error('HTTP ' + r.status);
          console.log(`Attempt ${i + 1} failed: ${r.status}, retrying...`);
        } catch (e) {
          lastErr = e;
          console.log(`Attempt ${i + 1} error: ${e.message}, retrying...`);
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
      }
      throw new Error('Failed to fetch image after ' + attempts + ' attempts: ' + lastErr.message);
    }

    const imgResponse = await fetchWithRetry(image_url);

    const contentType = imgResponse.headers.get('content-type');
    console.log('Content-Type:', contentType);

    const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
    console.log('Buffer size:', imgBuffer.length);

    const WIDTH = 1080;
    const HEIGHT = 1080;

    // Resize/normalize incoming image to 1080x1080 JPEG
    const resizedImage = await sharp(imgBuffer)
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .jpeg()
      .toBuffer();

    // Word-wrap title (max 3 lines, ~28 chars per line)
    const maxCharsPerLine = 28;
    const words = title.split(' ');
    const wrappedLines = [];
    let line = '';
    words.forEach(word => {
      if ((line + word).length > maxCharsPerLine) {
        if (line) wrappedLines.push(line.trim());
        line = word + ' ';
      } else {
        line += word + ' ';
      }
    });
    if (line) wrappedLines.push(line.trim());
    const displayLines = wrappedLines.slice(0, 3);

    if (!textToSVG) {
      throw new Error('Font not loaded at module init — check public/fonts/Montserrat-SemiBold.ttf');
    }

    const fontSize = 54;
    const lineHeight = 72;
    const titleStartY = HEIGHT - 100 - (displayLines.length - 1) * lineHeight;
    const HIGHLIGHT_COLOR = '#FF6200';
    const SPACE_WIDTH = textToSVG.getMetrics(' ', { fontSize }).width || fontSize * 0.28;

    // Render each line word-by-word, centered horizontally
    const lineBlocks = displayLines.map((lineText, lineIdx) => {
      const y = titleStartY + lineIdx * lineHeight;
      const wordsInLine = lineText.split(' ').filter(Boolean);

      // Measure each word once, compute total line width
      const wordWidths = wordsInLine.map(w => textToSVG.getMetrics(w, { fontSize }).width);
      const totalWidth =
        wordWidths.reduce((sum, w) => sum + w, 0) +
        SPACE_WIDTH * Math.max(0, wordsInLine.length - 1);
      let cursorX = (WIDTH - totalWidth) / 2;

      const paths = [];
      wordsInLine.forEach((word, wi) => {
        const isHighlight = highlightSet.has(normalize(word));
        paths.push(
          textToSVG.getPath(word, {
            x: cursorX,
            y,
            fontSize,
            anchor: 'left baseline',
            attributes: { fill: isHighlight ? HIGHLIGHT_COLOR : 'white' }
          })
        );
        cursorX += wordWidths[wi];
        if (wi < wordsInLine.length - 1) cursorX += SPACE_WIDTH;
      });

      return paths.join('\n');
    }).join('\n');

    const watermarkPath = textToSVG.getPath('Alphatechwire.com', {
      x: WIDTH / 2,
      y: HEIGHT - 15,
      fontSize: 24,
      anchor: 'center baseline',
      attributes: { fill: 'white', 'fill-opacity': '0.85' }
    });

    const overlayHeight = 500;
    const overlayY = HEIGHT - overlayHeight;

    const overlaySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="40%" stop-color="black" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${overlayY}" width="${WIDTH}" height="${overlayHeight}" fill="url(#grad)"/>
  ${lineBlocks}
  ${watermarkPath}
</svg>`;

    // Composite overlay onto image
    const finalBuffer = await sharp(resizedImage)
      .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();

    const base64 = finalBuffer.toString('base64');

    // Upload to imgbb
    const imgbbRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `image=${encodeURIComponent(base64)}&name=tech-news-${Date.now()}`
      }
    );

    const imgbbData = await imgbbRes.json();

    if (!imgbbData.success) {
      throw new Error('imgbb upload failed: ' + JSON.stringify(imgbbData));
    }

    res.json({
      success: true,
      image_url: imgbbData.data.url,
      title: title,
      highlights_applied: highlightList
    });

  } catch (err) {
    console.error('Image overlay error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = imageOverlayHandler;
