import { useCart } from '../context/CartContext';
import './Notification.css';

export default function Notification() {
  const { notification, setNotification } = useCart();

  if (!notification) return null;

  const handleClick = () => {
    if (notification.onClick) {
      notification.onClick();
    }
    setNotification(null);
  };

  return (
    <div 
      className={`notification notification--${notification.type} ${notification.onClick ? 'notification--clickable' : ''}`} 
      onClick={handleClick}
      role={notification.onClick ? 'button' : 'alert'}
    >
      <div className="notification__icon">
        {notification.type === 'success' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        )}
      </div>
      <div className="notification__message">{notification.message}</div>
      <button className="notification__close" aria-label="Close notification" onClick={(e) => { e.stopPropagation(); setNotification(null); }}>×</button>
    </div>
  );
}
