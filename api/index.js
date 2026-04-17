const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const slugify = require('slugify');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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
  category: { type: String, default: 'Technology' },
  featured: { type: Boolean, default: false },
  popular: { type: Boolean, default: false }
});

const Article = mongoose.model('Article', articleSchema);

// In-memory OTP store { code, expiresAt }
let pendingOtp = null;

// Gmail transporter for sending OTP codes
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

// Generate a 6-digit OTP
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Send OTP email
async function sendOtpEmail(toEmail, code) {
  await mailTransporter.sendMail({
    from: `"AlphaTech Wire" <${process.env.SMTP_EMAIL}>`,
    to: toEmail,
    subject: 'Your Admin Login Code',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Admin Login Verification</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Enter this code to complete your login to AlphaTech Wire admin dashboard.</p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">This code expires in 5 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

// Auth middleware — verifies JWT from Authorization header
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ✅ POST — Admin login (step 1: email + password → sends OTP)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Decode base64-encoded hash (avoids $ escaping issues in env vars)
    const passwordHash = Buffer.from(process.env.ADMIN_PASSWORD_HASH, 'base64').toString('utf-8');
    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate OTP and send to admin email
    const code = generateOtp();
    pendingOtp = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    await sendOtpEmail(process.env.ADMIN_EMAIL, code);

    // Issue a temporary token for the 2FA step
    const tempToken = jwt.sign(
      { email, step: '2fa_pending' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    res.json({ requires2FA: true, tempToken, maskedEmail });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to send verification code. Check SMTP settings.' });
  }
});

// ✅ POST — Verify email OTP code
app.post('/api/admin/verify-2fa', (req, res) => {
  try {
    const { code, tempToken } = req.body;
    if (!code || !tempToken) {
      return res.status(400).json({ error: 'Code and token required' });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.email !== process.env.ADMIN_EMAIL || decoded.step !== '2fa_pending') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!pendingOtp || Date.now() > pendingOtp.expiresAt) {
      pendingOtp = null;
      return res.status(401).json({ error: 'Code expired. Please login again.' });
    }

    if (pendingOtp.code !== code) {
      return res.status(401).json({ error: 'Invalid code' });
    }

    // OTP verified — clear it and issue full session token
    pendingOtp = null;
    const token = jwt.sign(
      { email: decoded.email, authenticated: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ success: true, token });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// ✅ POST — Resend OTP code
app.post('/api/admin/resend-otp', (req, res) => {
  try {
    const { tempToken } = req.body;
    if (!tempToken) return res.status(400).json({ error: 'Token required' });

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.email !== process.env.ADMIN_EMAIL || decoded.step !== '2fa_pending') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const code = generateOtp();
    pendingOtp = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    sendOtpEmail(process.env.ADMIN_EMAIL, code)
      .then(() => res.json({ success: true, message: 'Code resent' }))
      .catch(() => res.status(500).json({ error: 'Failed to resend code' }));
  } catch {
    res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
});

// ✅ GET — Check session validity
app.get('/api/admin/session', requireAuth, (req, res) => {
  res.json({ authenticated: true, email: req.admin.email });
});

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
        .select('title slug published_at category content featured popular'),
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

// ✅ GET — Featured articles
app.get('/api/articles/filter/featured', async (req, res) => {
  try {
    const articles = await Article.find({ featured: true })
      .sort({ published_at: -1 })
      .select('title slug published_at category caption content featured popular');
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET — Popular articles
app.get('/api/articles/filter/popular', async (req, res) => {
  try {
    const articles = await Article.find({ popular: true })
      .sort({ published_at: -1 })
      .limit(10)
      .select('title slug published_at category caption featured popular');
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT — Update article
app.put('/api/articles/:id', async (req, res) => {
  try {
    const { title, content, caption, category, source_url } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (caption !== undefined) update.caption = caption;
    if (category !== undefined) update.category = category;
    if (source_url !== undefined) update.source_url = source_url;

    const article = await Article.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!article) return res.status(404).json({ error: 'Not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE — Remove article
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PATCH — Toggle featured status
app.patch('/api/articles/:id/featured', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Not found' });
    article.featured = !article.featured;
    await article.save();
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PATCH — Toggle popular status
app.patch('/api/articles/:id/popular', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Not found' });
    article.popular = !article.popular;
    await article.save();
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