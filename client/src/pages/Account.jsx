import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Account.css';

const API = 'http://localhost:5000/api';

export default function Account() {
  const { user, token, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [addrForm, setAddrForm] = useState({ label: 'Home', full_name: '', street: '', city: '', postal_code: '', phone: '' });
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setForm({ name: user.name, phone: user.phone || '' });
    fetchData();
  }, [user]);

  const fetchData = () => {
    const h = { Authorization: `Bearer ${token}` };
    fetch(`${API}/auth/orders`, { headers: h }).then(r => r.json()).then(setOrders).catch(() => {});
    fetch(`${API}/auth/wishlist`, { headers: h }).then(r => r.json()).then(setWishlist).catch(() => {});
    fetch(`${API}/auth/addresses`, { headers: h }).then(r => r.json()).then(setAddresses).catch(() => {});
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    await fetch(`${API}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setUser({ ...user, ...form });
    setEditing(false);
  };

  const removeWishlistItem = async (productId) => {
    await fetch(`${API}/products/${productId}/wishlist`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setWishlist(prev => prev.filter(w => w.product_id !== productId));
  };

  const addAddress = async (e) => {
    e.preventDefault();
    await fetch(`${API}/auth/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(addrForm),
    });
    setShowAddrForm(false);
    setAddrForm({ label: 'Home', full_name: '', street: '', city: '', postal_code: '', phone: '' });
    fetchData();
  };

  const deleteAddress = async (id) => {
    await fetch(`${API}/auth/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  if (!user) return null;

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'orders', label: 'Orders' },
    { key: 'wishlist', label: 'Wishlist' },
    { key: 'addresses', label: 'Addresses' },
  ];

  return (
    <div className="account container fade-in">
      <h1 className="section-title">My Account</h1>

      <div className="account__layout">
        {/* Sidebar tabs */}
        <nav className="account__tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`account__tab ${tab === t.key ? 'account__tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
          <button className="account__tab account__tab--danger" onClick={() => { logout(); navigate('/'); }}>
            Sign Out
          </button>
        </nav>

        {/* Content */}
        <div className="account__content">
          {/* Profile */}
          {tab === 'profile' && (
            <div className="glass-card">
              <h2>Profile Information</h2>
              {editing ? (
                <form onSubmit={updateProfile} className="account__profile-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="account__profile-actions">
                    <button className="btn btn-primary" type="submit">Save</button>
                    <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="account__profile-view">
                  <div className="account__profile-row"><span>Name</span><span>{user.name}</span></div>
                  <div className="account__profile-row"><span>Email</span><span>{user.email}</span></div>
                  <div className="account__profile-row"><span>Phone</span><span>{user.phone || '—'}</span></div>
                  <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit Profile</button>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {tab === 'orders' && (
            <div className="glass-card">
              <h2>Order History</h2>
              {orders.length === 0 ? (
                <p className="account__empty">No orders yet. <Link to="/catalog">Start shopping!</Link></p>
              ) : (
                <div className="account__orders">
                  {orders.map(o => (
                    <div key={o.id} className="account__order-card">
                      <div className="account__order-header">
                        <span>Order #{o.id}</span>
                        <span className={`badge badge-${o.status === 'Completed' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'info'}`}>{o.status}</span>
                      </div>
                      <div className="account__order-details">
                        <span>${o.total.toFixed(2)}</span>
                        <span>{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist */}
          {tab === 'wishlist' && (
            <div className="glass-card">
              <h2>Wishlist</h2>
              {wishlist.length === 0 ? (
                <p className="account__empty">Your wishlist is empty.</p>
              ) : (
                <div className="account__wishlist">
                  {wishlist.map(w => (
                    <div key={w.product_id} className="account__wish-item">
                      <Link to={`/product/${w.product_id}`} className="account__wish-info">
                        <img src={w.image_url || '/placeholder.jpg'} alt={w.title} />
                        <div>
                          <p className="account__wish-title">{w.title}</p>
                          <p className="account__wish-artist">{w.artist}</p>
                        </div>
                      </Link>
                      <div className="account__wish-actions">
                        <span className="account__wish-price">${w.price?.toFixed(2)}</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => removeWishlistItem(w.product_id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses */}
          {tab === 'addresses' && (
            <div className="glass-card">
              <div className="account__addr-header">
                <h2>Delivery Addresses</h2>
                <button className="btn btn-outline btn-sm" onClick={() => setShowAddrForm(!showAddrForm)}>
                  {showAddrForm ? 'Cancel' : '+ Add Address'}
                </button>
              </div>

              {showAddrForm && (
                <form onSubmit={addAddress} className="checkout__form-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Label</label>
                    <input value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input value={addrForm.full_name} onChange={e => setAddrForm(f => ({ ...f, full_name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Street</label>
                    <input value={addrForm.street} onChange={e => setAddrForm(f => ({ ...f, street: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input value={addrForm.postal_code} onChange={e => setAddrForm(f => ({ ...f, postal_code: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input value={addrForm.phone} onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1' }}>Save Address</button>
                </form>
              )}

              {addresses.length === 0 && !showAddrForm ? (
                <p className="account__empty">No saved addresses.</p>
              ) : (
                <div className="account__addresses">
                  {addresses.map(a => (
                    <div key={a.id} className="account__addr-item">
                      <div>
                        <strong>{a.label}</strong> {a.is_default ? <span className="badge">Default</span> : null}
                        <p>{a.full_name}</p>
                        <p>{a.street}, {a.city} {a.postal_code}</p>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteAddress(a.id)}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
