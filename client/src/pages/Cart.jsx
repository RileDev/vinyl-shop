import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/getImageUrl';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="cart container fade-in">
        <h1 className="section-title">{t('cart.title')}</h1>
        <div className="cart__empty glass-card">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)' }}>
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p>{t('cart.empty')}</p>
          <Link to="/catalog" className="btn btn-primary">{t('cart.browseProducts')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart container fade-in">
      <div className="cart__header">
        <h1 className="section-title">{t('cart.title')}</h1>
        <button className="btn btn-secondary btn-sm" onClick={clearCart}>{t('cart.clearCart')}</button>
      </div>

      <div className="cart__layout">
        <div className="cart__items">
          {items.map(item => (
            <div key={item.id} className="cart__item glass-card">
              <Link to={`/product/${item.id}`} className="cart__item-image">
                <img src={getImageUrl(item.image_url)} alt={item.title} />
              </Link>
              <div className="cart__item-info">
                <p className="cart__item-artist">{item.artist}</p>
                <Link to={`/product/${item.id}`} className="cart__item-title">{item.title}</Link>
                <p className="cart__item-price">${item.price.toFixed(2)}</p>
              </div>
              <div className="cart__item-actions">
                <div className="pd__qty">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <p className="cart__item-subtotal">${(item.price * item.quantity).toFixed(2)}</p>
                <button className="cart__item-remove" onClick={() => removeItem(item.id)} title={t('cart.remove')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart__summary glass-card">
          <h3>{t('cart.orderSummary')}</h3>
          <div className="cart__summary-row">
            <span>{t('cart.subtotal')}</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="cart__summary-row">
            <span>{t('cart.shipping')}</span>
            <span>{totalPrice >= 50 ? t('cart.free') : '$5.00'}</span>
          </div>
          <div className="cart__summary-row cart__summary-row--total">
            <span>{t('cart.total')}</span>
            <span>${(totalPrice + (totalPrice >= 50 ? 0 : 5)).toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            {t('cart.checkout')}
          </Link>
        </div>
      </div>
    </div>
  );
}
