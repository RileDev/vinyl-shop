import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/getImageUrl';
import './Account.css';

const API = 'http://localhost:5000/api';

export default function Account() {
  const { user, token, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();
  const { t } = useLanguage();
  const [tab, setTab] = useState(tabParam || 'profile');
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [addrForm, setAddrForm] = useState({ label: 'Home', full_name: '', street: '', city: '', postal_code: '', phone: '' });
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setForm({ name: user.name, phone: user.phone || '' });
    fetchData();
  }, [user]);

  useEffect(() => {
    setTab(tabParam || 'profile');
  }, [tabParam]);

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
    { key: 'profile', label: t('account.profile') },
    { key: 'orders', label: t('account.orders') },
    { key: 'wishlist', label: t('account.wishlist') },
    { key: 'addresses', label: t('account.addresses') },
  ];

  return (
    <div className="account container fade-in">
      <h1 className="section-title">{t('account.title')}</h1>

      <div className="account__layout">
        {/* Sidebar tabs */}
        <nav className="account__tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`account__tab ${tab === t.key ? 'account__tab--active' : ''}`}
              onClick={() => {
                setTab(t.key);
                navigate(`/account/${t.key}`);
              }}
            >
              {t.label}
            </button>
          ))}
          <button className="account__tab account__tab--danger" onClick={() => { logout(); navigate('/'); }}>
            {t('header.signOut')}
          </button>
        </nav>

        {/* Content */}
        <div className="account__content">
          {/* Profile */}
          {tab === 'profile' && (
            <div className="glass-card">
              <h2>{t('account.profileInfo')}</h2>
              {editing ? (
                <form onSubmit={updateProfile} className="account__profile-form">
                  <div className="form-group">
                    <label>{t('account.name')}</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>{t('account.phone')}</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="account__profile-actions">
                    <button className="btn btn-primary" type="submit">{t('account.save')}</button>
                    <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>{t('account.cancel')}</button>
                  </div>
                </form>
              ) : (
                <div className="account__profile-view">
                  <div className="account__profile-row"><span>{t('account.name')}</span><span>{user.name}</span></div>
                  <div className="account__profile-row"><span>{t('account.email')}</span><span>{user.email}</span></div>
                  <div className="account__profile-row"><span>{t('account.phone')}</span><span>{user.phone || '—'}</span></div>
                  <button className="btn btn-outline" onClick={() => setEditing(true)}>{t('account.editProfile')}</button>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {tab === 'orders' && (
            <div className="glass-card">
              <h2>{t('account.orderHistory')}</h2>
              {orders.length === 0 ? (
                <p className="account__empty">{t('account.noOrders')} <Link to="/catalog">{t('account.startShopping')}</Link></p>
              ) : (
                <div className="account__orders">
                  {orders.map(o => {
                    const isExpanded = expandedOrder === o.id;
                    return (
                    <div key={o.id} className={`account__order-card ${isExpanded ? 'account__order-card--expanded' : ''}`}>
                      <div className="account__order-summary" onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                        <div className="account__order-header">
                          <span>{t('account.orderId').replace('ID', '#' + o.id)}</span>
                          <span className={`badge badge-${o.status === 'Completed' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'info'}`}>{o.status}</span>
                        </div>
                        <div className="account__order-details">
                          <span>${o.total.toFixed(2)}</span>
                          <span>{new Date(o.created_at).toLocaleDateString()}</span>
                          <svg className={`account__order-icon ${isExpanded ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="account__order-expanded">
                          <div className="account__order-items">
                            <h4>Items</h4>
                            {o.items && o.items.map(item => (
                              <div key={item.product_id} className="account__order-item-row">
                                <img src={getImageUrl(item.image_url)} alt={item.title} className="account__order-item-img" />
                                <div className="account__order-item-info">
                                  <span className="account__order-item-title">{item.title}</span>
                                  <span className="account__order-item-qty">Qty: {item.quantity} &times; ${item.unit_price.toFixed(2)}</span>
                                </div>
                                <span className="account__order-item-price">${(item.unit_price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="account__order-meta">
                            <div className="account__order-meta-col">
                              <h4>Shipping Address</h4>
                              <p>{o.ship_name}</p>
                              <p>{o.ship_street}</p>
                              <p>{o.ship_city}, {o.ship_postal}</p>
                              {o.ship_phone && <p>{o.ship_phone}</p>}
                            </div>
                            <div className="account__order-meta-col">
                              <h4>Payment Method</h4>
                              <p style={{ textTransform: 'capitalize' }}>
                                {o.payment_method === 'credit_card' ? 'Credit Card' : 
                                 o.payment_method === 'cash' ? 'Cash on Delivery' : 
                                 o.payment_method === 'local_pickup' ? 'Local Pick-up' : 
                                 o.payment_method.replace('_', ' ')}
                              </p>
                            </div>
                          </div>

                          <div className="account__order-summary-block">
                            {o.shipping_cost > 0 && (
                              <>
                                <div className="account__order-sub-row">
                                  <span>Subtotal</span>
                                  <span>${o.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="account__order-sub-row">
                                  <span>Shipping</span>
                                  <span>${o.shipping_cost.toFixed(2)}</span>
                                </div>
                              </>
                            )}
                            <div className="account__order-total-row">
                              <span>Total</span>
                              <span>${o.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {/* Wishlist */}
          {tab === 'wishlist' && (
            <div className="glass-card">
              <h2>{t('account.wishlist')}</h2>
              {wishlist.length === 0 ? (
                <p className="account__empty">{t('account.emptyWishlist')}</p>
              ) : (
                <div className="account__wishlist">
                  {wishlist.map(w => (
                    <div key={w.product_id} className="account__wish-item">
                      <Link to={`/product/${w.product_id}`} className="account__wish-info">
                        <img src={getImageUrl(w.image_url)} alt={w.title} />
                        <div>
                          <p className="account__wish-title">{w.title}</p>
                          <p className="account__wish-artist">{w.artist}</p>
                        </div>
                      </Link>
                      <div className="account__wish-actions">
                        <span className="account__wish-price">${w.price?.toFixed(2)}</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => removeWishlistItem(w.product_id)}>{t('account.remove')}</button>
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
                <h2>{t('account.deliveryAddresses')}</h2>
                <button className="btn btn-outline btn-sm" onClick={() => setShowAddrForm(!showAddrForm)}>
                  {showAddrForm ? t('account.cancel') : t('account.addAddress')}
                </button>
              </div>

              {showAddrForm && (
                <form onSubmit={addAddress} className="checkout__form-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>{t('account.label')}</label>
                    <input value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>{t('account.fullName')}</label>
                    <input value={addrForm.full_name} onChange={e => setAddrForm(f => ({ ...f, full_name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>{t('account.street')}</label>
                    <input value={addrForm.street} onChange={e => setAddrForm(f => ({ ...f, street: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>{t('account.city')}</label>
                    <input value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>{t('account.postalCode')}</label>
                    <input value={addrForm.postal_code} onChange={e => setAddrForm(f => ({ ...f, postal_code: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>{t('account.phone')}</label>
                    <input value={addrForm.phone} onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1' }}>{t('account.saveAddress')}</button>
                </form>
              )}

              {addresses.length === 0 && !showAddrForm ? (
                <p className="account__empty">{t('account.noAddresses')}</p>
              ) : (
                <div className="account__addresses">
                  {addresses.map(a => (
                    <div key={a.id} className="account__addr-item">
                      <div>
                        <strong>{a.label}</strong> {a.is_default ? <span className="badge">{t('account.default')}</span> : null}
                        <p>{a.full_name}</p>
                        <p>{a.street}, {a.city} {a.postal_code}</p>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteAddress(a.id)}>{t('account.delete')}</button>
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
