const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const slugify = require('slugify');
const path = require('path');
const imageOverlayHandler = require('./image-overlay');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Connect MongoDB (cached promise for serverless cold-start safety)
let mongoConnectPromise = null;
function connectMongo() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!mongoConnectPromise) {
    mongoConnectPromise = mongoose.connect(process.env.MONGODB_URI)
      .then(() => { console.log('MongoDB connected'); })
      .catch(err => { mongoConnectPromise = null; throw err; });
  }
  return mongoConnectPromise;
}
connectMongo().catch(err => console.log('Initial mongo connect failed:', err));

// Article Schema
const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  source_url: String,
  caption: String,
  slug: { type: String, unique: true },
  published_at: { type: Date, default: Date.now },
  category: { type: String, default: 'Technology' }
});

const Article = mongoose.model('Article', articleSchema);

// Image overlay route
app.post('/api/image-overlay', imageOverlayHandler);

// ✅ POST — n8n calls this
app.post('/api/publish', async (req, res) => {
  try {
    const { title, content, source_url, caption } = req.body;

    // ✅ Null check
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // ✅ Parse content if JSON string
    let cleanContent = content;
    let cleanCaption = caption;

    try {
      const parsed = JSON.parse(content);
      if (parsed.article) cleanContent = parsed.article;
      if (parsed.caption) cleanCaption = parsed.caption;
    } catch(e) {}

    try {
      const parsedCaption = JSON.parse(caption);
      if (parsedCaption.caption) cleanCaption = parsedCaption.caption;
    } catch(e) {}

    const slug = slugify(title.trim(), {
      lower: true,
      strict: true,
      trim: true
    }).slice(0, 60);

    // ✅ Slug null check
    if (!slug || slug === '') {
      return res.status(400).json({ error: 'Could not generate slug from title' });
    }

    const exists = await Article.findOne({ slug });
    if (exists) {
      return res.json({
        success: false,
        message: 'Already exists',
        article_url: `${process.env.SITE_URL}/article/${slug}`
      });
    }

    const article = new Article({
      title: title.trim(),
      content: cleanContent,
      source_url,
      caption: cleanCaption,
      slug
    });

    await article.save();

    res.json({
      success: true,
      article_url: `${process.env.SITE_URL}/article/${slug}`,
      slug
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET — All articles (supports pagination via ?limit=&skip=)
app.get('/api/articles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const [articles, total] = await Promise.all([
      Article.find()
        .sort({ published_at: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug published_at category content'),
      Article.countDocuments()
    ]);

    res.json({ articles, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET — Single article
app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check duplicate — MongoDB
app.post('/api/check-duplicate', async (req, res) => {
  try {
    const { articleId } = req.body;
    if (!articleId) return res.status(400).json({ error: 'articleId required' });
    await connectMongo();
    const existing = await mongoose.connection.db.collection('posted_articles').findOne({ articleId });
    res.json({ isDuplicate: !!existing });
  } catch(err) {
    console.error('check-duplicate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save posted article — MongoDB
app.post('/api/save-posted', async (req, res) => {
  try {
    const { articleId } = req.body;
    if (!articleId) return res.status(400).json({ error: 'articleId required' });
    await connectMongo();
    const result = await mongoose.connection.db.collection('posted_articles').insertOne({
      articleId,
      postedAt: new Date()
    });
    res.json({ success: true, insertedId: result.insertedId });
  } catch(err) {
    console.error('save-posted error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Article page route
app.get('/article/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/article.html'));
});

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;