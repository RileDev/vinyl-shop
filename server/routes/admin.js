const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(auth, adminOnly);

// ─── Dashboard Stats ───────────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const total_revenue = db.prepare("SELECT COALESCE(SUM(total), 0) as val FROM orders WHERE status != 'Cancelled'").get().val;
    const pending_orders = db.prepare("SELECT COUNT(*) as val FROM orders WHERE status IN ('New', 'Processing')").get().val;
    const low_stock = db.prepare('SELECT COUNT(*) as val FROM products WHERE stock_count < 5 AND is_active = 1').get().val;
    const total_users = db.prepare("SELECT COUNT(*) as val FROM users WHERE role = 'customer'").get().val;
    const total_products = db.prepare('SELECT COUNT(*) as val FROM products').get().val;
    const total_orders = db.prepare('SELECT COUNT(*) as val FROM orders').get().val;

    const recent_orders = db.prepare(`
      SELECT o.id, o.ship_name, o.status, o.total, o.payment_method, o.created_at
      FROM orders o ORDER BY o.created_at DESC LIMIT 10
    `).all();

    const pending_orders_list = db.prepare(`
      SELECT o.id, o.ship_name, o.status, o.total, o.payment_method, o.created_at
      FROM orders o WHERE o.status IN ('New', 'Processing') ORDER BY o.created_at DESC
    `).all();

    const low_stock_list = db.prepare(`
      SELECT p.id, p.title, p.artist, p.stock_count, p.price, p.image_url 
      FROM products p WHERE p.stock_count < 5 AND p.is_active = 1 ORDER BY p.stock_count ASC
    `).all();

    res.json({ total_revenue, pending_orders, low_stock, total_users, total_products, total_orders, recent_orders, pending_orders_list, low_stock_list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Product Management ────────────────────────────────────────

// GET all products (including inactive)
router.get('/products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name, g.name as genre_name, r.name as region_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN genres g ON p.genre_id = g.id
      LEFT JOIN regions r ON p.region_id = r.id
      ORDER BY p.id DESC
    `).all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create product
router.post('/products', (req, res) => {
  const { title, artist, description, price, compare_price, category_id, genre_id, region_id,
          stock_count, image_url, label, release_year, condition, section } = req.body;

  if (!title || !artist || !price || !category_id) {
    return res.status(400).json({ message: 'Title, artist, price, and category are required' });
  }

  try {
    const info = db.prepare(`
      INSERT INTO products (title, artist, description, price, compare_price, category_id, genre_id, region_id,
        stock_count, image_url, label, release_year, condition)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, artist, description || null, price, compare_price || null, category_id, genre_id || null,
           region_id || null, stock_count || 0, image_url || null, label || null, release_year || null, condition || 'New');

    // Add to featured section if specified
    if (section) {
      db.prepare('INSERT OR IGNORE INTO featured_products (product_id, section) VALUES (?, ?)').run(info.lastInsertRowid, section);
    }

    res.status(201).json({ id: info.lastInsertRowid, message: 'Product created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
router.put('/products/:id', (req, res) => {
  const { title, artist, description, price, compare_price, category_id, genre_id, region_id,
          stock_count, image_url, label, release_year, condition, is_active, section } = req.body;

  try {
    db.prepare(`
      UPDATE products SET
        title = COALESCE(?, title), artist = COALESCE(?, artist), description = COALESCE(?, description),
        price = COALESCE(?, price), compare_price = ?, category_id = COALESCE(?, category_id),
        genre_id = ?, region_id = ?, stock_count = COALESCE(?, stock_count),
        image_url = COALESCE(?, image_url), label = ?, release_year = ?,
        condition = COALESCE(?, condition), is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(title, artist, description, price, compare_price ?? null, category_id,
           genre_id ?? null, region_id ?? null, stock_count, image_url, label ?? null,
           release_year ?? null, condition, is_active, req.params.id);

    // Update featured section
    if (section !== undefined) {
      db.prepare('DELETE FROM featured_products WHERE product_id = ?').run(req.params.id);
      if (section) {
        db.prepare('INSERT INTO featured_products (product_id, section) VALUES (?, ?)').run(req.params.id, section);
      }
    }

    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update product stock only
router.put('/products/:id/stock', (req, res) => {
  const { stock_count } = req.body;
  if (stock_count === undefined) return res.status(400).json({ message: 'stock_count is required' });
  
  try {
    db.prepare("UPDATE products SET stock_count = ?, updated_at = datetime('now') WHERE id = ?").run(stock_count, req.params.id);
    res.json({ message: 'Stock updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete('/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Order Management ──────────────────────────────────────────

// GET all orders with optional status filter
router.get('/orders', (req, res) => {
  const { status, search } = req.query;
  let where = ['1=1'];
  const params = [];

  if (status) { where.push('o.status = ?'); params.push(status); }
  if (search) { where.push('(o.ship_name LIKE ? OR o.guest_email LIKE ? OR CAST(o.id AS TEXT) = ?)'); params.push(`%${search}%`, `%${search}%`, search); }

  try {
    const orders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE ${where.join(' AND ')}
      ORDER BY o.created_at DESC
    `).all(...params);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order detail
router.get('/orders/:id', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const items = db.prepare(`
      SELECT oi.*, p.title, p.artist, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(req.params.id);

    const history = db.prepare(`
      SELECT osh.*, u.name as changed_by_name
      FROM order_status_history osh
      LEFT JOIN users u ON osh.changed_by = u.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at
    `).all(req.params.id);

    res.json({ ...order, items, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update order status
router.put('/orders/:id/status', (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['New', 'Processing', 'Shipped', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = db.prepare('SELECT status FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);

    db.prepare('INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, note) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, order.status, status, req.user.id, note || null);

    // If cancelled, restore stock
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(req.params.id);
      for (const item of items) {
        db.prepare('UPDATE products SET stock_count = stock_count + ? WHERE id = ?').run(item.quantity, item.product_id);
      }
    }

    res.json({ message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── User Management ───────────────────────────────────────────

// GET all users
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, role, phone, status, created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count
      FROM users ORDER BY created_at DESC
    `).all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user detail
router.get('/users/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const addresses = db.prepare('SELECT * FROM user_addresses WHERE user_id = ?').all(req.params.id);
    const orders = db.prepare('SELECT id, status, total, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id);
    const wishlist = db.prepare(`
      SELECT w.product_id, p.title, p.artist
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `).all(req.params.id);

    res.json({ ...user, addresses, orders, wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update user (status, role)
router.put('/users/:id', (req, res) => {
  const { status, role, name, email } = req.body;
  try {
    db.prepare(`
      UPDATE users SET
        status = COALESCE(?, status),
        role = COALESCE(?, role),
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(status, role, name, email, req.params.id);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
router.delete('/users/:id', (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Settings Management ───────────────────────────────────────

// PUT update settings (bulk)
router.put('/settings', (req, res) => {
  try {
    const upsert = db.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')");
    for (const [key, value] of Object.entries(req.body)) {
      upsert.run(key, value, value);
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Category & Genre Management ───────────────────────────────

// POST create genre
router.post('/genres', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  try {
    const info = db.prepare('INSERT INTO genres (name, slug) VALUES (?, ?)').run(name, slug);
    res.status(201).json({ id: info.lastInsertRowid, name, slug });
  } catch (err) {
    res.status(400).json({ message: 'Genre already exists' });
  }
});

// DELETE genre
router.delete('/genres/:id', (req, res) => {
  db.prepare('DELETE FROM genres WHERE id = ?').run(req.params.id);
  res.json({ message: 'Genre deleted' });
});

// POST create category
router.post('/categories', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  try {
    const info = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(name, slug, description || null);
    res.status(201).json({ id: info.lastInsertRowid, name, slug });
  } catch (err) {
    res.status(400).json({ message: 'Category already exists' });
  }
});

// DELETE category
router.delete('/categories/:id', (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

// ─── Featured Products Management ──────────────────────────────

// GET featured products by section
router.get('/featured', (req, res) => {
  try {
    const featured = db.prepare(`
      SELECT fp.*, p.title, p.artist, p.image_url
      FROM featured_products fp
      JOIN products p ON fp.product_id = p.id
      ORDER BY fp.section, fp.sort_order
    `).all();
    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add product to featured section
router.post('/featured', (req, res) => {
  const { product_id, section, sort_order } = req.body;
  try {
    db.prepare('INSERT OR REPLACE INTO featured_products (product_id, section, sort_order) VALUES (?, ?, ?)').run(product_id, section, sort_order || 0);
    res.status(201).json({ message: 'Product featured' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove from featured
router.delete('/featured/:id', (req, res) => {
  db.prepare('DELETE FROM featured_products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Removed from featured' });
});

module.exports = router;
