const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(uploadsDir, { recursive: true });

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed. Allowed: ${allowed.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// POST /api/upload — single image upload (admin only)
router.post('/', auth, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }
  const imageUrl = `/uploads/products/${req.file.filename}`;
  res.json({
    url: imageUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// POST /api/upload/multiple — multi-image upload (admin only)
router.post('/multiple', auth, adminOnly, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No image files provided' });
  }
  const files = req.files.map(f => ({
    url: `/uploads/products/${f.filename}`,
    filename: f.filename,
    size: f.size,
    mimetype: f.mimetype,
  }));
  res.json(files);
});

// POST /api/upload/product/:id/gallery — upload and attach gallery images to a product
router.post('/product/:id/gallery', auth, adminOnly, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No image files provided' });
  }

  try {
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as val FROM product_images WHERE product_id = ?').get(req.params.id).val;

    const insert = db.prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)');
    const images = [];

    req.files.forEach((f, i) => {
      const url = `/uploads/products/${f.filename}`;
      insert.run(req.params.id, url, maxOrder + i + 1);
      images.push({ url, filename: f.filename });
    });

    // If product has no primary image, set the first uploaded one
    const current = db.prepare('SELECT image_url FROM products WHERE id = ?').get(req.params.id);
    if (!current.image_url) {
      db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run(images[0].url, req.params.id);
    }

    res.json({ message: `${images.length} image(s) uploaded`, images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/upload/product/:productId/gallery/:imageId — remove a gallery image
router.delete('/product/:productId/gallery/:imageId', auth, adminOnly, (req, res) => {
  try {
    const img = db.prepare('SELECT * FROM product_images WHERE id = ? AND product_id = ?').get(req.params.imageId, req.params.productId);
    if (!img) return res.status(404).json({ message: 'Image not found' });

    // Delete from filesystem
    const filePath = path.join(__dirname, '..', img.image_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Delete from DB
    db.prepare('DELETE FROM product_images WHERE id = ?').run(req.params.imageId);

    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handler for multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum size is 5 MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err.message && err.message.includes('File type')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = router;
