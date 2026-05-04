import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

const NAV_CATEGORIES = [
  { label: 'All Products', to: '/catalog' },
  { label: 'Vinyls', to: '/catalog?category=vinyls' },
  { label: 'CDs', to: '/catalog?category=cds' },
  { label: 'International', to: '/catalog?region=international' },
  { label: 'EX-YU', to: '/catalog?region=ex-yu' },
];

const NAV_GENRES = [
  'Rock', 'Metal', 'Hip-Hop', 'Jazz', 'Pop', 'Electronic', 'Punk', 'Blues',
];

export default function Header() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header__inner container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">◉</span>
          <span className="header__logo-text">Vinyl Shop</span>
        </Link>

        {/* Desktop Nav — hover-triggered mega menu */}
        <nav className="header__nav">
          <div className="header__nav-item header__nav-item--mega">
            <span className="header__nav-trigger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              Browse
            </span>
            <div className="header__mega">
              <div className="header__mega-inner">
                <div className="header__mega-col">
                  <h4>Categories</h4>
                  {NAV_CATEGORIES.map(c => (
                    <Link key={c.to} to={c.to} className="header__mega-link">{c.label}</Link>
                  ))}
                </div>
                <div className="header__mega-col">
                  <h4>Genres</h4>
                  {NAV_GENRES.map(g => (
                    <Link key={g} to={`/catalog?genre=${g.toLowerCase()}`} className="header__mega-link">{g}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Right actions */}
        <div className="header__actions">
          <Link to="/cart" className="header__action-btn" title="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {totalItems > 0 && <span className="header__badge">{totalItems}</span>}
          </Link>

          {user ? (
            <div className="header__user-menu">
              <button className="header__action-btn header__user-trigger">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
              <div className="header__dropdown">
                <div className="header__dropdown-header">
                  <span className="header__dropdown-name">{user.name}</span>
                  <span className="header__dropdown-email">{user.email}</span>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" className="header__dropdown-item">Admin Panel</Link>
                )}
                <Link to="/account" className="header__dropdown-item">My Account</Link>
                <Link to="/account/wishlist" className="header__dropdown-item">Wishlist</Link>
                <Link to="/account/orders" className="header__dropdown-item">Order History</Link>
                <button onClick={() => { logout(); navigate('/'); }} className="header__dropdown-item header__dropdown-item--danger">
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}

          {/* Mobile hamburger */}
          <button className="header__hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span className={`header__hamburger-bar ${mobileOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`header__mobile ${mobileOpen ? 'header__mobile--open' : ''}`}>
        <div className="header__mobile-section">
          <h4>Categories</h4>
          {NAV_CATEGORIES.map(c => (
            <Link key={c.to} to={c.to} onClick={() => setMobileOpen(false)}>{c.label}</Link>
          ))}
        </div>
        <div className="header__mobile-section">
          <h4>Genres</h4>
          {NAV_GENRES.map(g => (
            <Link key={g} to={`/catalog?genre=${g.toLowerCase()}`} onClick={() => setMobileOpen(false)}>{g}</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
