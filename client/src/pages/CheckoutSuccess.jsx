import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function CheckoutSuccess() {
  const { t } = useLanguage();
  return (
    <div className="auth-page container">
      <div className="glass-card fade-in" style={{ textAlign: 'center', maxWidth: 480, padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>{t('checkoutSuccess.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {t('checkoutSuccess.message')}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">{t('checkoutSuccess.continueShopping')}</Link>
          <Link to="/account" className="btn btn-outline">{t('checkoutSuccess.viewOrders')}</Link>
        </div>
      </div>
    </div>
  );
}
