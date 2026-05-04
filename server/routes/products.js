const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, optionalAuth } = require('../middleware/auth');

// GET /api/products — list with filters
router.get('/', (req, res) => {
  const { category, genre, region, search } = req.query;
  let where = ['p.is_active = 1'];
  const params = [];

  if (category) {
    where.push('c.slug = ?');
    params.push(category);
  }
  if (genre) {
    where.push('g.slug = ?');
    params.push(genre);
  }
  if (region) {
    where.push('r.slug = ?');
    params.push(region);
  }
  if (search) {
    where.push('(p.title LIKE ? OR p.artist LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const sql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug,
           g.name as genre_name, g.slug as genre_slug,
           r.name as region_name, r.slug as region_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN genres g ON p.genre_id = g.id
    LEFT JOIN regions r ON p.region_id = r.id
    WHERE ${where.join(' AND ')}
    ORDER BY p.created_at DESC
  `;

  try {
    const products = db.prepare(sql).all(...params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/filters — available filter options
router.get('/filters', (req, res) => {
  try {
    const categories = db.prepare('SELECT id, name, slug FROM categories ORDER BY sort_order').all();
    const genres = db.prepare('SELECT id, name, slug FROM genres ORDER BY sort_order').all();
    const regions = db.prepare('SELECT id, name, slug FROM regions ORDER BY name').all();
    res.json({ categories, genres, regions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/sections — homepage carousel data
router.get('/sections', (req, res) => {
  try {
    const getSectionProducts = (section) => {
      return db.prepare(`
        SELECT p.*, c.name as category_name, g.name as genre_name, r.name as region_name
        FROM featured_products fp
        JOIN products p ON fp.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN genres g ON p.genre_id = g.id
        LEFT JOIN regions r ON p.region_id = r.id
        WHERE fp.section = ? AND p.is_active = 1
        ORDER BY fp.sort_order
      `).all(section);
    };

    res.json({
      recent_arrivals: getSectionProducts('recent_arrivals'),
      top_vinyl: getSectionProducts('top_vinyl'),
      top_cd: getSectionProducts('top_cd'),
      ex_yu: getSectionProducts('ex_yu'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — single product with gallery
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             g.name as genre_name, g.slug as genre_slug,
             r.name as region_name, r.slug as region_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN genres g ON p.genre_id = g.id
      LEFT JOIN regions r ON p.region_id = r.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const images = db.prepare('SELECT id, image_url, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order').all(req.params.id);
    product.images = images.map(img => img.image_url);

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id/stores — store availability
router.get('/:id/stores', (req, res) => {
  try {
    const stores = db.prepare(`
      SELECT sl.id, sl.name, sl.address, sl.city, sl.phone, si.quantity
      FROM store_inventory si
      JOIN store_locations sl ON si.store_id = sl.id
      WHERE si.product_id = ? AND si.quantity > 0 AND sl.is_active = 1
      ORDER BY sl.name
    `).all(req.params.id);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/wishlist — add to wishlist
router.post('/:id/wishlist', auth, (req, res) => {
  try {
    db.prepare('INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id/wishlist — remove from wishlist
router.delete('/:id/wishlist', auth, (req, res) => {
  db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.id);
  res.json({ message: 'Removed from wishlist' });
});

module.exports = router;
