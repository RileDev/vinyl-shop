import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const API = 'http://localhost:5000/api';

export default function Footer() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__col">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon">◉</span>
              {settings.site_name || 'Vinyl Shop'}
            </Link>
            <p className="footer__tagline">{settings.site_tagline || 'Premium Records & CDs'}</p>
            <div className="footer__socials">
              {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>}
              {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>}
              {settings.twitter_url && <a href={settings.twitter_url} target="_blank" rel="noreferrer" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4>Quick Links</h4>
            <Link to="/catalog">Full Catalog</Link>
            <Link to="/catalog?category=vinyls">Vinyls</Link>
            <Link to="/catalog?category=cds">CDs</Link>
            <Link to="/catalog?region=ex-yu">EX-YU Collection</Link>
          </div>

          {/* Account */}
          <div className="footer__col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/account">My Account</Link>
            <Link to="/cart">Shopping Cart</Link>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4>Contact</h4>
            {settings.physical_address && <p className="footer__contact-item">📍 {settings.physical_address}</p>}
            {settings.contact_phone && <p className="footer__contact-item">📞 {settings.contact_phone}</p>}
            {settings.contact_email && <p className="footer__contact-item">✉️ {settings.contact_email}</p>}
            {settings.working_hours && <p className="footer__contact-item">🕐 {settings.working_hours}</p>}
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} {settings.site_name || 'Vinyl Shop'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
