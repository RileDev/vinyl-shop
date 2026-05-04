import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const API = 'http://localhost:5000/api';

export default function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/login');
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const tabs = [
    { key: 'dashboard', label: '📊 Dashboard', icon: '' },
    { key: 'products', label: '📦 Products', icon: '' },
    { key: 'orders', label: '🧾 Orders', icon: '' },
    { key: 'users', label: '👥 Users', icon: '' },
    { key: 'settings', label: '⚙️ Settings', icon: '' },
  ];

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__sidebar-header">
          <span className="admin__sidebar-logo">◉</span>
          <span>Admin Panel</span>
        </div>
        <nav className="admin__sidebar-nav">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`admin__sidebar-item ${tab === t.key ? 'admin__sidebar-item--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin__main">
        {tab === 'dashboard' && <DashboardTab h={h} />}
        {tab === 'products' && <ProductsTab h={h} />}
        {tab === 'orders' && <OrdersTab h={h} />}
        {tab === 'users' && <UsersTab h={h} />}
        {tab === 'settings' && <SettingsTab h={h} />}
      </main>
    </div>
  );
}

/* ── Dashboard Tab ── */
function DashboardTab({ h }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API}/admin/stats`, { headers: h }).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="skeleton" style={{ height: 200 }}></div>;

  const cards = [
    { label: 'Total Revenue', value: `$${stats.total_revenue?.toFixed(2) || '0.00'}`, color: 'var(--accent)' },
    { label: 'Pending Orders', value: stats.pending_orders || 0, color: 'var(--warning)' },
    { label: 'Low Stock Items', value: stats.low_stock || 0, color: 'var(--danger)' },
    { label: 'Total Users', value: stats.total_users || 0, color: 'var(--info)' },
  ];

  return (
    <div className="fade-in">
      <h1 className="admin__page-title">Dashboard</h1>
      <div className="admin__stats-grid">
        {cards.map(c => (
          <div key={c.label} className="admin__stat-card glass-card">
            <p className="admin__stat-label">{c.label}</p>
            <p className="admin__stat-value" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="admin__recent glass-card">
        <h3>Recent Orders</h3>
        {(stats.recent_orders || []).map(o => (
          <div key={o.id} className="admin__recent-row">
            <span>#{o.id}</span>
            <span>{o.ship_name}</span>
            <span className={`badge badge-${o.status === 'Completed' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'info'}`}>{o.status}</span>
            <span>${o.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Products Tab ── */
function ProductsTab({ h }) {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    loadProducts();
    fetch(`${API}/products/filters`).then(r => r.json()).then(f => {
      setCategories(f.categories || []);
      setGenres(f.genres || []);
    }).catch(() => {});
  }, []);

  const loadProducts = () => {
    fetch(`${API}/admin/products`, { headers: h }).then(r => r.json()).then(setProducts).catch(() => {});
  };

  const startEdit = (p) => {
    setEditing(p ? p.id : 'new');
    setForm(p || { title: '', artist: '', description: '', price: 0, category_id: 1, genre_id: 1, stock_count: 0, image_url: '', section: '' });
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const method = editing === 'new' ? 'POST' : 'PUT';
    const url = editing === 'new' ? `${API}/admin/products` : `${API}/admin/products/${editing}`;
    await fetch(url, { method, headers: h, body: JSON.stringify(form) });
    setEditing(null);
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API}/admin/products/${id}`, { method: 'DELETE', headers: h });
    loadProducts();
  };

  return (
    <div className="fade-in">
      <div className="admin__page-header">
        <h1 className="admin__page-title">Products</h1>
        <button className="btn btn-primary btn-sm" onClick={() => startEdit(null)}>+ Add Product</button>
      </div>

      {editing !== null && (
        <form onSubmit={saveProduct} className="admin__form glass-card">
          <div className="checkout__form-grid">
            <div className="form-group"><label>Title</label><input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="form-group"><label>Artist</label><input value={form.artist || ''} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} required /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Description</label><textarea rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-group"><label>Price</label><input type="number" step="0.01" value={form.price || 0} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} required /></div>
            <div className="form-group"><label>Stock</label><input type="number" value={form.stock_count || 0} onChange={e => setForm(f => ({ ...f, stock_count: parseInt(e.target.value) }))} /></div>
            <div className="form-group"><label>Category</label>
              <select value={form.category_id || ''} onChange={e => setForm(f => ({ ...f, category_id: parseInt(e.target.value) }))}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Genre</label>
              <select value={form.genre_id || ''} onChange={e => setForm(f => ({ ...f, genre_id: parseInt(e.target.value) }))}>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Image URL</label><input value={form.image_url || ''} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <div className="form-group"><label>Homepage Section</label>
              <select value={form.section || ''} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}>
                <option value="">None</option>
                <option value="recent_arrivals">Recent Arrivals</option>
                <option value="top_vinyl">Top Vinyl</option>
                <option value="top_cd">Top CD</option>
                <option value="ex_yu">EX-YU</option>
              </select>
            </div>
          </div>
          <div className="admin__form-actions">
            <button className="btn btn-primary" type="submit">Save</button>
            <button className="btn btn-secondary" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr><th>ID</th><th>Title</th><th>Artist</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>{p.artist}</td>
                <td>${p.price.toFixed(2)}</td>
                <td><span className={p.stock_count < 5 ? 'text-danger' : ''}>{p.stock_count}</span></td>
                <td>
                  <div className="admin__table-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Orders Tab ── */
function OrdersTab({ h }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadOrders(); }, [filter]);

  const loadOrders = () => {
    const q = filter ? `?status=${filter}` : '';
    fetch(`${API}/admin/orders${q}`, { headers: h }).then(r => r.json()).then(setOrders).catch(() => {});
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/admin/orders/${id}/status`, {
      method: 'PUT', headers: h, body: JSON.stringify({ status }),
    });
    loadOrders();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const statuses = ['New', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

  return (
    <div className="fade-in">
      <h1 className="admin__page-title">Orders</h1>

      <div className="admin__filters">
        <button className={`catalog__chip ${!filter ? 'catalog__chip--active' : ''}`} onClick={() => setFilter('')}>All</button>
        {statuses.map(s => (
          <button key={s} className={`catalog__chip ${filter === s ? 'catalog__chip--active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr><th>ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className={selected?.id === o.id ? 'admin__table-row--active' : ''}>
                <td>#{o.id}</td>
                <td>{o.ship_name}</td>
                <td>${o.total.toFixed(2)}</td>
                <td>{o.payment_method}</td>
                <td><span className={`badge badge-${o.status === 'Completed' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'info'}`}>{o.status}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="admin__status-select">
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Users Tab ── */
function UsersTab({ h }) {
  const [users, setUsers] = useState([]);

  useEffect(() => { loadUsers(); }, []);
  const loadUsers = () => {
    fetch(`${API}/admin/users`, { headers: h }).then(r => r.json()).then(setUsers).catch(() => {});
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await fetch(`${API}/admin/users/${id}`, {
      method: 'PUT', headers: h, body: JSON.stringify({ status: newStatus }),
    });
    loadUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`${API}/admin/users/${id}`, { method: 'DELETE', headers: h });
    loadUsers();
  };

  return (
    <div className="fade-in">
      <h1 className="admin__page-title">Users</h1>
      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.role}</span></td>
                <td><span className={`badge badge-${u.status === 'active' ? 'success' : 'danger'}`}>{u.status}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="admin__table-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(u.id, u.status)}>
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Settings Tab ── */
function SettingsTab({ h }) {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/settings`).then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch(`${API}/admin/settings`, { method: 'PUT', headers: h, body: JSON.stringify(settings) });
    setSaving(false);
  };

  const fields = [
    { key: 'site_name', label: 'Site Name' },
    { key: 'site_tagline', label: 'Tagline' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'contact_phone', label: 'Contact Phone' },
    { key: 'physical_address', label: 'Physical Address' },
    { key: 'working_hours', label: 'Working Hours' },
    { key: 'facebook_url', label: 'Facebook URL' },
    { key: 'instagram_url', label: 'Instagram URL' },
    { key: 'twitter_url', label: 'Twitter URL' },
    { key: 'tiktok_url', label: 'TikTok URL' },
    { key: 'shipping_info', label: 'Shipping Info' },
    { key: 'return_policy', label: 'Return Policy' },
  ];

  return (
    <div className="fade-in">
      <div className="admin__page-header">
        <h1 className="admin__page-title">Site Settings</h1>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div className="glass-card">
        <div className="checkout__form-grid">
          {fields.map(f => (
            <div key={f.key} className="form-group">
              <label>{f.label}</label>
              <input
                value={settings[f.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
