import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Header.css';

const NAV_CATEGORIES = [
  { tKey: 'allProducts', to: '/catalog' },
  { tKey: 'vinyls', to: '/catalog?category=vinyls' },
  { tKey: 'cds', to: '/catalog?category=cds' },
  { tKey: 'international', to: '/catalog?region=international' },
  { tKey: 'exYu', to: '/catalog?region=ex-yu' },
];

const NAV_GENRES = [
  'Rock', 'Metal', 'Hip-Hop', 'Jazz', 'Pop', 'Electronic', 'Punk', 'Blues',
];

export default function Header() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
          .then(r => r.json())
          .then(data => {
            setSearchResults(data.products || []);
            setShowResults(true);
          })
          .catch(() => setSearchResults([]));
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleResultClick(searchResults[selectedIndex].id);
      } else {
        navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
        setShowResults(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    setSearchQuery('');
    setSelectedIndex(-1);
  };

  return (
    <header className="header">
      <div className="header__inner container">
        {/* Left: Logo & Hamburger */}
        <div className="header__left">
          <button className="header__hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span className={`header__hamburger-bar ${mobileOpen ? 'open' : ''}`}></span>
          </button>
          
          <Link to="/" className="header__logo">
            <span className="header__logo-icon">◉</span>
            <span className="header__logo-text">Vinyl Shop</span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="header__center" ref={searchRef}>
          <form className="header__search" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              className="header__search-input" 
              placeholder={t('header.searchPlaceholder') || "Search records, artists..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onFocus={() => searchQuery.trim().length > 1 && setShowResults(true)}
              onKeyDown={handleKeyDown}
            />
            <button type="submit" className="header__search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 10 12 13 22 3"></polyline>
                <path d="M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9"></path>
              </svg>
            </button>

            {showResults && searchResults.length > 0 && (
              <div className="header__search-results glass-card">
                {searchResults.map((p, idx) => (
                  <div 
                    key={p.id} 
                    className={`header__search-result-item ${selectedIndex === idx ? 'header__search-result-item--active' : ''}`} 
                    onClick={() => handleResultClick(p.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <img src={p.image_url.startsWith('http') ? p.image_url : `http://localhost:5000${p.image_url}`} alt="" />
                    <div className="header__search-result-info">
                      <span className="header__search-result-title">{p.title}</span>
                      <span className="header__search-result-artist">{p.artist}</span>
                    </div>
                    <span className="header__search-result-price">${p.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="header__search-result-footer" onClick={handleSearchSubmit}>
                  See all results for "{searchQuery}"
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right actions */}
        <div className="header__actions">
          {/* Desktop Nav hidden in mobile but we need it here for desktop */}
          <nav className="header__nav">
            <div className="header__nav-item header__nav-item--mega">
              <span className="header__nav-trigger">
                {t('header.browse')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '4px'}}><polyline points="6 9 12 15 18 9"/></svg>
              </span>
              <div className="header__mega">
                <div className="header__mega-inner">
                  <div className="header__mega-col">
                    <h4>{t('header.categories')}</h4>
                    {NAV_CATEGORIES.map(c => (
                      <Link key={c.to} to={c.to} className="header__mega-link">{t(`header.${c.tKey}`)}</Link>
                    ))}
                  </div>
                  <div className="header__mega-col">
                    <h4>{t('header.genres')}</h4>
                    {NAV_GENRES.map(g => (
                      <Link key={g} to={`/catalog?genre=${g.toLowerCase()}`} className="header__mega-link">{g}</Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <div className="header__dropdown-wrapper header__lang-menu">
            <button className="header__lang-trigger">
              {language.toUpperCase()}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="header__dropdown">
              <button className={`header__dropdown-item ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>
                English (EN)
              </button>
              <button className={`header__dropdown-item ${language === 'sr' ? 'active' : ''}`} onClick={() => setLanguage('sr')}>
                Srpski (SR)
              </button>
            </div>
          </div>

          <Link to="/cart" className="header__action-btn" title={t('header.cart')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {totalItems > 0 && <span className="header__badge">{totalItems}</span>}
          </Link>

          {user ? (
            <div className="header__dropdown-wrapper header__user-menu">
              <button className="header__action-btn header__user-trigger">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
              <div className="header__dropdown">
                <div className="header__dropdown-header">
                  <span className="header__dropdown-name">{user.name}</span>
                  <span className="header__dropdown-email">{user.email}</span>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" className="header__dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    {t('header.adminPanel')}
                  </Link>
                )}
                <Link to="/account" className="header__dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {t('header.myAccount')}
                </Link>
                <Link to="/account/wishlist" className="header__dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {t('header.wishlist')}
                </Link>
                <Link to="/account/orders" className="header__dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  {t('header.orderHistory')}
                </Link>
                <div className="header__dropdown-divider"></div>
                <button onClick={() => { logout(); navigate('/'); }} className="header__dropdown-item header__dropdown-item--danger">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  {t('header.signOut')}
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">{t('header.signIn')}</Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`header__mobile ${mobileOpen ? 'header__mobile--open' : ''}`}>
        <div className="header__mobile-section">
          <h4>{t('header.categories')}</h4>
          {NAV_CATEGORIES.map(c => (
            <Link key={c.to} to={c.to} onClick={() => setMobileOpen(false)}>{t(`header.${c.tKey}`)}</Link>
          ))}
        </div>
        <div className="header__mobile-section">
          <h4>{t('header.genres')}</h4>
          {NAV_GENRES.map(g => (
            <Link key={g} to={`/catalog?genre=${g.toLowerCase()}`} onClick={() => setMobileOpen(false)}>{g}</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
