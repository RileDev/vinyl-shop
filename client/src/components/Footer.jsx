import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

const API = 'http://localhost:5000/api';

export default function Footer() {
  const [settings, setSettings] = useState({});
  const { t } = useLanguage();

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
            <p className="footer__tagline">{settings.site_tagline || t('footer.tagline')}</p>
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
            <h4>{t('footer.quickLinks')}</h4>
            <Link to="/catalog">{t('footer.fullCatalog')}</Link>
            <Link to="/catalog?category=vinyls">{t('footer.vinyls')}</Link>
            <Link to="/catalog?category=cds">{t('footer.cds')}</Link>
            <Link to="/catalog?region=ex-yu">{t('footer.exYuCollection')}</Link>
          </div>

          {/* Account */}
          <div className="footer__col">
            <h4>{t('footer.account')}</h4>
            <Link to="/login">{t('footer.signIn')}</Link>
            <Link to="/register">{t('footer.createAccount')}</Link>
            <Link to="/account">{t('footer.myAccount')}</Link>
            <Link to="/cart">{t('footer.shoppingCart')}</Link>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4>{t('footer.contact')}</h4>
            {settings.physical_address && (
              <p className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer__contact-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {settings.physical_address}
              </p>
            )}
            {settings.contact_phone && (
              <p className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer__contact-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {settings.contact_phone}
              </p>
            )}
            {settings.contact_email && (
              <p className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer__contact-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {settings.contact_email}
              </p>
            )}
            {settings.working_hours && (
              <p className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer__contact-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {settings.working_hours}
              </p>
            )}
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} {settings.site_name || 'Vinyl Shop'}. {t('footer.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
}
