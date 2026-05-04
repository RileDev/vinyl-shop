const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { auth, optionalAuth } = require('../middleware/auth');

// POST /api/orders — create order (guest or authenticated)
router.post('/', optionalAuth, async (req, res) => {
  const {
    items, payment_method,
    ship_name, ship_street, ship_city, ship_postal, ship_phone,
    guest_email, save_address, create_account, password
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }
  if (!payment_method || !ship_name || !ship_street || !ship_city || !ship_postal) {
    return res.status(400).json({ message: 'Delivery information is required' });
  }

  try {
    let finalUserId = req.user?.id || null;

    if (!finalUserId && create_account && guest_email && password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(guest_email);
      if (existing) {
        return res.status(400).json({ message: 'Email already registered. Please sign in or use a different email.' });
      }
      const hash = await bcrypt.hash(password, 10);
      const info = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(ship_name, guest_email, hash);
      finalUserId = info.lastInsertRowid;
    }

    // Calculate totals from DB prices (don't trust client prices)
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT id, price, stock_count, title FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
      if (!product) return res.status(400).json({ message: `Product ${item.product_id} not found` });
      if (product.stock_count < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for "${product.title}"` });
      }
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      resolvedItems.push({ ...item, unit_price: product.price, total_price: lineTotal });
    }

    const shipping_cost = subtotal >= 50 ? 0 : 5;
    const total = subtotal + shipping_cost;

    // Insert order
    const orderInfo = db.prepare(`
      INSERT INTO orders (user_id, status, payment_method, subtotal, shipping_cost, total,
        ship_name, ship_street, ship_city, ship_postal, ship_country, ship_phone, guest_email)
      VALUES (?, 'New', ?, ?, ?, ?, ?, ?, ?, ?, 'Serbia', ?, ?)
    `).run(
      finalUserId, payment_method, subtotal, shipping_cost, total,
      ship_name, ship_street, ship_city, ship_postal, ship_phone || null, guest_email || null
    );

    const orderId = orderInfo.lastInsertRowid;

    // Insert order items and update stock
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)');
    const updateStock = db.prepare('UPDATE products SET stock_count = stock_count - ? WHERE id = ?');

    for (const item of resolvedItems) {
      insertItem.run(orderId, item.product_id, item.quantity, item.unit_price, item.total_price);
      updateStock.run(item.quantity, item.product_id);
    }

    // Status history
    db.prepare("INSERT INTO order_status_history (order_id, new_status, note) VALUES (?, 'New', 'Order placed')").run(orderId);

    // Save address if requested
    if (finalUserId && save_address) {
      db.prepare(
        'INSERT INTO user_addresses (user_id, label, full_name, street, city, postal_code, phone) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(finalUserId, 'Shipping', ship_name, ship_street, ship_city, ship_postal, ship_phone || null);
    }

    res.status(201).json({ id: orderId, total, message: 'Order placed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Order failed', error: err.message });
  }
});

// GET /api/orders/:id — get order detail (own order or admin)
router.get('/:id', auth, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const items = db.prepare(`
      SELECT oi.*, p.title, p.artist, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(req.params.id);

    const history = db.prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at').all(req.params.id);

    res.json({ ...order, items, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
