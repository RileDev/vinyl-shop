const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { auth, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const info = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);
    const token = jwt.sign({ id: info.lastInsertRowid, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: info.lastInsertRowid, name, email, role: 'customer' },
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status === 'suspended') return res.status(403).json({ message: 'Account suspended' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET /api/auth/me — get current user
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// PUT /api/auth/profile — update profile
router.put('/profile', auth, (req, res) => {
  const { name, phone } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), updated_at = datetime(\'now\') WHERE id = ?')
    .run(name, phone, req.user.id);
  res.json({ message: 'Profile updated' });
});

// GET /api/auth/addresses
router.get('/addresses', auth, (req, res) => {
  const addresses = db.prepare('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
  res.json(addresses);
});

// POST /api/auth/addresses
router.post('/addresses', auth, (req, res) => {
  const { label, full_name, street, city, postal_code, country, phone, is_default } = req.body;
  if (!full_name || !street || !city || !postal_code) {
    return res.status(400).json({ message: 'Full name, street, city, and postal code are required' });
  }
  if (is_default) {
    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  }
  const info = db.prepare(
    'INSERT INTO user_addresses (user_id, label, full_name, street, city, postal_code, country, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, label || 'Home', full_name, street, city, postal_code, country || 'Serbia', phone || null, is_default ? 1 : 0);
  res.status(201).json({ id: info.lastInsertRowid, message: 'Address added' });
});

// DELETE /api/auth/addresses/:id
router.delete('/addresses/:id', auth, (req, res) => {
  db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Address deleted' });
});

// GET /api/auth/orders — user's own orders
router.get('/orders', auth, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, GROUP_CONCAT(oi.product_id || ':' || oi.quantity || ':' || oi.unit_price) as items_raw
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all(req.user.id);
  res.json(orders);
});

// GET /api/auth/wishlist — user's wishlist with product details
router.get('/wishlist', auth, (req, res) => {
  const items = db.prepare(`
    SELECT w.product_id, w.created_at as added_at, p.title, p.artist, p.price, p.image_url, p.stock_count
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `).all(req.user.id);
  res.json(items);
});

module.exports = router;
