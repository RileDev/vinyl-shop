const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/settings — public
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/genres — genre list for filter management
router.get('/genres', (req, res) => {
  try {
    const genres = db.prepare('SELECT * FROM genres ORDER BY sort_order').all();
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
