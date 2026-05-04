import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Checkout.css';

const API = 'http://localhost:5000/api';

export default function Checkout() {
  const { user, token, login } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', street: '', city: '', postal: '', phone: '' });
  const [payment, setPayment] = useState('credit_card');
  const [useNewAddr, setUseNewAddr] = useState(!user);
  const [saveAddr, setSaveAddr] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || ''
      }));
    }

    if (user && token) {
      fetch(`${API}/auth/addresses`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          setAddresses(data);
          const def = data.find(a => a.is_default);
          if (def) setSelectedAddr(def.id);
          else if (data.length > 0) setSelectedAddr(data[0].id);
          
          if (data.length === 0) setUseNewAddr(true);
        })
        .catch(() => {});
    }
  }, [user, token]);

  const shipping = totalPrice >= 50 ? 0 : 5;
  const total = totalPrice + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user && createAccount && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    let addr;
    if (user && !useNewAddr && selectedAddr) {
      addr = addresses.find(a => a.id === selectedAddr);
    }

    const orderData = {
      items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      payment_method: payment,
      ship_name: addr ? addr.full_name : form.name,
      ship_street: addr ? addr.street : form.street,
      ship_city: addr ? addr.city : form.city,
      ship_postal: addr ? addr.postal_code : form.postal,
      ship_phone: addr ? addr.phone : form.phone,
      guest_email: !user ? form.email : undefined,
      save_address: Boolean(user && !addr && saveAddr),
      create_account: !user ? createAccount : false,
      password: !user && createAccount ? password : null,
    };

    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderData),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Order failed');
      }

      if (!user && createAccount) {
        try {
          await login(form.email, password);
        } catch (e) {
          console.error('Auto-login failed after account creation', e);
        }
      }

      clearCart();
      navigate('/checkout/success');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout container fade-in">
        <div className="cart__empty glass-card">
          <p>{t('cart.empty')}</p>
          <Link to="/catalog" className="btn btn-primary">{t('cart.browseProducts')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout container fade-in">
      <h1 className="section-title">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit} className="checkout__layout">
        <div className="checkout__main">
          {/* Auth prompt for guests */}
          {!user && (
            <div className="checkout__guest-banner glass-card">
              <p>{t('checkout.haveAccount')} <Link to="/login">{t('checkout.signIn')}</Link> {t('checkout.fasterCheckout')}</p>
            </div>
          )}

          {/* Delivery info */}
          <div className="checkout__section glass-card">
            <h2>{t('checkout.deliveryInfo')}</h2>

            {user && addresses.length > 0 && (
              <div className="checkout__addr-toggle">
                <button type="button" className={`btn btn-sm ${!useNewAddr ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUseNewAddr(false)}>
                  {t('checkout.savedAddress')}
                </button>
                <button type="button" className={`btn btn-sm ${useNewAddr ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUseNewAddr(true)}>
                  {t('checkout.newAddress')}
                </button>
              </div>
            )}

            {user && !useNewAddr && addresses.length > 0 ? (
              <div className="checkout__addresses">
                {addresses.map(a => (
                  <label key={a.id} className={`checkout__addr-card ${selectedAddr === a.id ? 'checkout__addr-card--active' : ''}`}>
                    <input type="radio" name="address" value={a.id} checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} />
                    <div>
                      <strong>{a.label}</strong>
                      <p>{a.full_name}</p>
                      <p>{a.street}, {a.city} {a.postal_code}</p>
                      {a.phone && <p>{a.phone}</p>}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="checkout__form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>{t('checkout.fullName')}</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>{t('checkout.email')}</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>{t('checkout.street')}</label>
                  <input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>{t('checkout.city')}</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>{t('checkout.postalCode')}</label>
                  <input value={form.postal} onChange={e => setForm(f => ({ ...f, postal: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>{t('checkout.phone')}</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                {user && (
                  <label className="checkout__save-addr">
                    <input type="checkbox" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)} />
                    {t('checkout.saveAddress')}
                  </label>
                )}
                {!user && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <label className="checkout__save-addr" style={{ marginBottom: createAccount ? '1rem' : '0' }}>
                      <input type="checkbox" checked={createAccount} onChange={e => setCreateAccount(e.target.checked)} />
                      Create an account for faster checkout next time
                    </label>
                    {createAccount && (
                      <div className="checkout__form-grid" style={{ marginTop: '0.5rem' }}>
                        <div className="form-group">
                          <label>Password</label>
                          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Confirm Password</label>
                          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="checkout__section glass-card">
            <h2>{t('checkout.paymentMethod')}</h2>
            <div className="checkout__payment-options">
              {[
                { 
                  value: 'credit_card', 
                  label: t('checkout.creditCard'), 
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  )
                },
                { 
                  value: 'cash', 
                  label: t('checkout.cashOnDelivery'), 
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <path d="M6 12h.01M18 12h.01"/>
                    </svg>
                  )
                },
                { 
                  value: 'local_pickup', 
                  label: t('checkout.localPickup'), 
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  )
                },
              ].map(pm => (
                <label key={pm.value} className={`checkout__payment-card ${payment === pm.value ? 'checkout__payment-card--active' : ''}`}>
                  <input type="radio" name="payment" value={pm.value} checked={payment === pm.value} onChange={() => setPayment(pm.value)} />
                  <span className="checkout__payment-icon">{pm.icon}</span>
                  <span>{pm.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="checkout__sidebar">
          <div className="glass-card">
            <h3>{t('checkout.orderSummary')}</h3>
            <div className="checkout__items-list">
              {items.map(item => (
                <div key={item.id} className="checkout__item-row">
                  <span>{item.title} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="cart__summary-row">
              <span>{t('cart.subtotal')}</span><span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="cart__summary-row">
              <span>{t('cart.shipping')}</span><span>{shipping === 0 ? t('cart.free') : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="cart__summary-row cart__summary-row--total">
              <span>{t('checkout.total')}</span><span>${total.toFixed(2)}</span>
            </div>
            {error && <div className="auth-card__error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? t('checkout.placingOrder') : `${t('checkout.placeOrder')} — $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
