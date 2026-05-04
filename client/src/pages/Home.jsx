import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

const API = 'http://localhost:5000/api';

export default function Home() {
  const [sections, setSections] = useState({ recent_arrivals: [], top_vinyl: [], top_cd: [], ex_yu: [] });
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetch(`${API}/products/sections`)
      .then(r => r.json())
      .then(setSections)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg"></div>
        <div className="hero__content container">
          <span className="hero__badge">{t('home.newCollection')}</span>
          <h1 className="hero__title">
            {t('home.discoverThe')}<br />
            <span className="hero__title-accent">{t('home.soundOfVinyl')}</span>
          </h1>
          <p className="hero__subtitle">
            {t('home.subtitle')}
          </p>
          <div className="hero__actions">
            <Link to="/catalog" className="btn btn-primary btn-lg">
              {t('home.browseCollection')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hero__btn-icon">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <Link to="/catalog?region=ex-yu" className="btn btn-outline btn-lg">{t('home.exYuRarities')}</Link>
          </div>
        </div>
        <div className="hero__vinyl-art">
          <div className="hero__vinyl-disc">
            <div className="hero__vinyl-label"></div>
          </div>
        </div>
      </section>

      {/* Carousels */}
      <div className="container home__carousels">
        {loading ? (
          <div className="home__loading">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton" style={{ height: 320, marginBottom: '2rem' }}></div>
            ))}
          </div>
        ) : (
          <>
            <Carousel title={t('home.recentArrivals')} products={sections.recent_arrivals} />
            <Carousel title={t('home.topVinyl')} products={sections.top_vinyl} />
            <Carousel title={t('home.topCd')} products={sections.top_cd} />
            <Carousel title={t('home.exYuSelections')} products={sections.ex_yu} />
          </>
        )}
      </div>

      {/* CTA Banner */}
      <section className="home__cta container">
        <div className="home__cta-card glass-card">
          <div>
            <h2>{t('home.cantFind')}</h2>
            <p>{t('home.visitStores')}</p>
          </div>
          <Link to="/catalog" className="btn btn-primary btn-lg">{t('home.fullCatalog')}</Link>
        </div>
      </section>
    </div>
  );
}
