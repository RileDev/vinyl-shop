import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const API = 'http://localhost:5000/api';

export default function Checkout() {
  const { user, token } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', street: '', city: '', postal: '', phone: '' });
  const [payment, setPayment] = useState('credit_card');
  const [useNewAddr, setUseNewAddr] = useState(!user);
  const [saveAddr, setSaveAddr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && token) {
      fetch(`${API}/auth/addresses`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          setAddresses(data);
          const def = data.find(a => a.is_default);
          if (def) setSelectedAddr(def.id);
        })
        .catch(() => {});
    }
  }, [user, token]);

  const shipping = totalPrice >= 50 ? 0 : 5;
  const total = totalPrice + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      save_address: user && useNewAddr && saveAddr,
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
      if (!res.ok) throw new Error('Order failed');
      clearCart();
      navigate('/checkout/success');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout container fade-in">
        <div className="cart__empty glass-card">
          <p>Your cart is empty</p>
          <Link to="/catalog" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout container fade-in">
      <h1 className="section-title">Checkout</h1>

      <form onSubmit={handleSubmit} className="checkout__layout">
        <div className="checkout__main">
          {/* Auth prompt for guests */}
          {!user && (
            <div className="checkout__guest-banner glass-card">
              <p>Have an account? <Link to="/login">Sign in</Link> for a faster checkout.</p>
            </div>
          )}

          {/* Delivery info */}
          <div className="checkout__section glass-card">
            <h2>Delivery Information</h2>

            {user && addresses.length > 0 && (
              <div className="checkout__addr-toggle">
                <button type="button" className={`btn btn-sm ${!useNewAddr ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUseNewAddr(false)}>
                  Saved Address
                </button>
                <button type="button" className={`btn btn-sm ${useNewAddr ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUseNewAddr(true)}>
                  New Address
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
                  <label>Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                {!user && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                )}
                <div className="form-group">
                  <label>Street</label>
                  <input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input value={form.postal} onChange={e => setForm(f => ({ ...f, postal: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                {user && (
                  <label className="checkout__save-addr">
                    <input type="checkbox" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)} />
                    Save this address for future orders
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="checkout__section glass-card">
            <h2>Payment Method</h2>
            <div className="checkout__payment-options">
              {[
                { value: 'credit_card', label: 'Credit Card', icon: '💳' },
                { value: 'cash', label: 'Cash on Delivery', icon: '💵' },
                { value: 'local_pickup', label: 'Local Pick-up', icon: '🏪' },
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
            <h3>Order Summary</h3>
            <div className="checkout__items-list">
              {items.map(item => (
                <div key={item.id} className="checkout__item-row">
                  <span>{item.title} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="cart__summary-row">
              <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="cart__summary-row">
              <span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="cart__summary-row cart__summary-row--total">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            {error && <div className="auth-card__error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
