import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import { getImageUrl } from '../utils/getImageUrl';
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
    { key: 'dashboard', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg> },
    { key: 'products', label: 'Products', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
    { key: 'orders', label: 'Orders', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { key: 'users', label: 'Users', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { key: 'settings', label: 'Settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
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
              <span className="admin__sidebar-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin__main">
        {tab === 'dashboard' && <DashboardTab h={h} />}
        {tab === 'products' && <ProductsTab h={h} token={token} />}
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
  const [activeList, setActiveList] = useState('recent_orders');
  const [showChart, setShowChart] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [annualGrowth, setAnnualGrowth] = useState(0);
  const [chartRange, setChartRange] = useState('week');
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [orderDateFilter, setOrderDateFilter] = useState(''); // 'today', 'yesterday', or 'YYYY-MM-DD'
  const [customDate, setCustomDate] = useState('');

  const fetchStats = () => {
    let q = '';
    if (orderDateFilter) q = `?date=${orderDateFilter}`;
    fetch(`${API}/admin/stats${q}`, { headers: h }).then(r => r.json()).then(setStats).catch(() => {});
  };

  const fetchRevenueStats = () => {
    const q = `?range=${chartRange}${chartRange === 'specific_year' ? `&year=${chartYear}` : ''}`;
    fetch(`${API}/admin/revenue-stats${q}`, { headers: h })
      .then(r => r.json())
      .then(data => {
        setRevenueData(data.data);
        setAnnualGrowth(data.annual_growth);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
  }, [orderDateFilter]);

  useEffect(() => {
    if (showChart) fetchRevenueStats();
  }, [showChart, chartRange, chartYear]);

  const updateOrderStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'New' ? 'Processing' : 
                       currentStatus === 'Processing' ? 'Shipped' : 'Completed';
    
    await fetch(`${API}/admin/orders/${id}/status`, {
      method: 'PUT', headers: h, body: JSON.stringify({ status: nextStatus }),
    });
    fetchStats();
  };

  if (!stats) return <div className="skeleton" style={{ height: 200 }}></div>;

  const cards = [
    { id: 'recent_orders', label: 'Total Revenue', value: `$${stats.total_revenue?.toFixed(2) || '0.00'}`, color: 'var(--accent)' },
    { id: 'pending_orders', label: 'Pending Orders', value: stats.pending_orders || 0, color: 'var(--warning)' },
    { id: 'low_stock', label: 'Low Stock Items', value: stats.low_stock || 0, color: 'var(--danger)' },
    { id: 'total_users', label: 'Total Users', value: stats.total_users || 0, color: 'var(--info)' },
  ];

  return (
    <div className="fade-in">
      <h1 className="admin__page-title">Dashboard</h1>
      <div className="admin__stats-grid">
        {cards.map(c => (
          <div 
            key={c.id} 
            className="admin__stat-card glass-card"
            style={{ 
              cursor: c.id !== 'total_users' ? 'pointer' : 'default',
              boxShadow: activeList === c.id ? `0 0 0 1px ${c.color}` : '' 
            }}
            onClick={() => {
              if (c.id === 'recent_orders') {
                setShowChart(!showChart);
              }
              if (c.id !== 'total_users') setActiveList(c.id);
            }}
          >
            <p className="admin__stat-label">{c.label}</p>
            <p className="admin__stat-value" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {showChart && activeList === 'recent_orders' && (
        <div className="admin__chart-container glass-card fade-in">
          <div className="admin__chart-header">
            <div className="admin__chart-title">
              Cash Flow Analysis
              {annualGrowth !== 0 && (
                <span className={`admin__chart-growth ${annualGrowth > 0 ? 'admin__chart-growth--up' : 'admin__chart-growth--down'}`}>
                  {annualGrowth > 0 ? '↑' : '↓'} {Math.abs(annualGrowth)}% Annual Growth
                </span>
              )}
            </div>
            <div className="admin__chart-filters">
              {['daily', 'week', 'month', '3months', '6months', 'year', 'specific_year'].map(r => (
                <button
                  key={r}
                  className={`admin__chart-range-btn ${chartRange === r ? 'admin__chart-range-btn--active' : ''}`}
                  onClick={() => setChartRange(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' ')}
                </button>
              ))}
              {chartRange === 'specific_year' && (
                <select 
                  className="admin__chart-year-select"
                  value={chartYear}
                  onChange={e => setChartYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={v => `$${v}`}
                />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--accent)' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--accent)" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="admin__recent glass-card">
        <div className="admin__recent-header">
          <h3>
            {activeList === 'recent_orders' && 'Recent Orders'}
            {activeList === 'pending_orders' && 'Pending Orders'}
            {activeList === 'low_stock' && 'Low Stock Items'}
          </h3>
          {activeList === 'recent_orders' && (
            <div className="admin__recent-filters">
              <button 
                className={`catalog__chip ${!orderDateFilter ? 'catalog__chip--active' : ''}`}
                onClick={() => { setOrderDateFilter(''); setCustomDate(''); }}
              >All</button>
              <button 
                className={`catalog__chip ${orderDateFilter === 'today' ? 'catalog__chip--active' : ''}`}
                onClick={() => setOrderDateFilter('today')}
              >Today</button>
              <button 
                className={`catalog__chip ${orderDateFilter === 'yesterday' ? 'catalog__chip--active' : ''}`}
                onClick={() => setOrderDateFilter('yesterday')}
              >Yesterday</button>
              <input 
                type="date" 
                className="admin__date-input"
                value={customDate}
                onChange={e => {
                  setCustomDate(e.target.value);
                  setOrderDateFilter(e.target.value);
                }}
              />
            </div>
          )}
        </div>
        
        {activeList === 'recent_orders' && (stats.recent_orders || []).map(o => (
          <div key={o.id} className="admin__recent-row">
            <span>#{o.id}</span>
            <span>{o.ship_name}</span>
            <span className={`badge badge-${o.status === 'Completed' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'info'}`}>{o.status}</span>
            <span>${o.total.toFixed(2)}</span>
          </div>
        ))}

        {activeList === 'pending_orders' && (stats.pending_orders_list || []).map(o => (
          <div key={o.id} className="admin__recent-row">
            <span>#{o.id}</span>
            <span>{o.ship_name}</span>
            <span className={`badge badge-${o.status === 'Completed' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'warning'}`}>{o.status}</span>
            <span>${o.total.toFixed(2)}</span>
            {(o.status === 'New' || o.status === 'Processing') && (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => updateOrderStatus(o.id, o.status)}
                style={{ marginLeft: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              >
                {o.status === 'New' ? 'Mark Processing' : 'Mark Shipped'}
              </button>
            )}
          </div>
        ))}

        {activeList === 'low_stock' && (stats.low_stock_list || []).map(p => (
          <LowStockRow key={p.id} p={p} h={h} fetchStats={fetchStats} />
        ))}
        
        {activeList === 'recent_orders' && (stats.recent_orders || []).length === 0 && <p className="text-muted" style={{marginTop: '1rem'}}>No recent orders.</p>}
        {activeList === 'pending_orders' && (stats.pending_orders_list || []).length === 0 && <p className="text-muted" style={{marginTop: '1rem'}}>No pending orders.</p>}
        {activeList === 'low_stock' && (stats.low_stock_list || []).length === 0 && <p className="text-muted" style={{marginTop: '1rem'}}>No low stock items.</p>}
      </div>
    </div>
  );
}

function LowStockRow({ p, h, fetchStats }) {
  const [stock, setStock] = useState('');

  const updateStock = async () => {
    const val = parseInt(stock, 10);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid positive number.');
      return;
    }
    if (confirm(`Are you sure you want to update stock for "${p.title}" to ${val}?`)) {
      await fetch(`${API}/admin/products/${p.id}/stock`, {
        method: 'PUT',
        headers: h,
        body: JSON.stringify({ stock_count: val })
      });
      setStock('');
      fetchStats();
    }
  };

  return (
    <div className="admin__recent-row">
      <span>#{p.id}</span>
      <span style={{ flex: 2 }}>{p.title} - {p.artist}</span>
      <span className="text-danger" style={{ minWidth: '80px' }}>Stock: {p.stock_count}</span>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
        <input 
          type="number" 
          value={stock} 
          onChange={e => setStock(e.target.value)} 
          placeholder="Qty"
          min="0"
          style={{ width: '60px', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem' }}
        />
        <button 
          className="btn btn-primary btn-sm" 
          onClick={updateStock}
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
        >
          Restore
        </button>
      </div>
    </div>
  );
}

/* ── Products Tab ── */
function ProductsTab({ h, token }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [gallery, setGallery] = useState([]);

  // Filter/Pagination/Sort states
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('DESC');

  useEffect(() => {
    fetch(`${API}/products/filters`).then(r => r.json()).then(f => {
      setCategories(f.categories || []);
      setGenres(f.genres || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, catFilter, genreFilter, page, limit, sort, order]);

  const loadProducts = () => {
    const params = new URLSearchParams({
      page,
      limit,
      sort,
      order,
      search: search || '',
      category_id: catFilter || '',
      genre_id: genreFilter || ''
    });
    fetch(`${API}/admin/products?${params.toString()}`, { headers: h })
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      })
      .catch(() => {});
  };

  const handleSort = (col) => {
    if (sort === col) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSort(col);
      setOrder('ASC');
    }
    setPage(1);
  };

  const startEdit = (p) => {
    setEditing(p ? p.id : 'new');
    setForm(p || { title: '', artist: '', description: '', price: 0, category_id: 1, genre_id: 1, stock_count: 0, image_url: '', section: '' });
    if (p) {
      fetch(`${API}/products/${p.id}`).then(r => r.json()).then(prod => {
        const imgs = (prod.images || []).map((url, i) => ({ id: i + 1, image_url: url }));
        setGallery(imgs);
      }).catch(() => setGallery([]));
    } else {
      setGallery([]);
    }
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="fade-in">
      <div className="admin__page-header">
        <h1 className="admin__page-title">Products</h1>
        <button className="btn btn-primary btn-sm" onClick={() => startEdit(null)}>+ Add Product</button>
      </div>

      <div className="admin__controls glass-card">
        <div className="admin__search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            placeholder="Search by title or artist..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
          />
        </div>
        <div className="admin__filters-row">
          <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={genreFilter} onChange={e => { setGenreFilter(e.target.value); setPage(1); }}>
            <option value="">All Genres</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <div className="admin__limit-select">
            <label>Show:</label>
            <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }}>
              <option value="20">20</option>
              <option value="40">40</option>
              <option value="60">60</option>
            </select>
          </div>
        </div>
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
            <ImageUploader
              value={form.image_url}
              onChange={(url) => setForm(f => ({ ...f, image_url: url }))}
              token={token}
              productId={editing !== 'new' ? editing : null}
              gallery={gallery}
              onGalleryChange={editing !== 'new' ? setGallery : undefined}
            />
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
            <tr>
              <th></th>
              <th onClick={() => handleSort('id')} className="admin__sortable">ID {sort === 'id' && (order === 'ASC' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('title')} className="admin__sortable">Title {sort === 'title' && (order === 'ASC' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('artist')} className="admin__sortable">Artist {sort === 'artist' && (order === 'ASC' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('price')} className="admin__sortable">Price {sort === 'price' && (order === 'ASC' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('stock_count')} className="admin__sortable">Stock {sort === 'stock_count' && (order === 'ASC' ? '↑' : '↓')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  {p.image_url ? (
                    <img src={getImageUrl(p.image_url)} alt="" className="admin__product-thumb" />
                  ) : (
                    <div className="admin__product-thumb admin__product-thumb--empty">📷</div>
                  )}
                </td>
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

      {totalPages > 1 && (
        <div className="admin__pagination">
          <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          <div className="admin__page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button 
                key={n} 
                className={`admin__page-btn ${page === n ? 'admin__page-btn--active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        </div>
      )}
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
