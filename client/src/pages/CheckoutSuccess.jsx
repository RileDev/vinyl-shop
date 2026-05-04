import { Link } from 'react-router-dom';

export default function CheckoutSuccess() {
  return (
    <div className="auth-page container">
      <div className="glass-card fade-in" style={{ textAlign: 'center', maxWidth: 480, padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>Order Placed!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
          <Link to="/account" className="btn btn-outline">My Orders</Link>
        </div>
      </div>
    </div>
  );
}
