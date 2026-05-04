import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import './Home.css';

const API = 'http://localhost:5000/api';

export default function Home() {
  const [sections, setSections] = useState({ recent_arrivals: [], top_vinyl: [], top_cd: [], ex_yu: [] });
  const [loading, setLoading] = useState(true);

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
          <span className="hero__badge">New Collection 2026</span>
          <h1 className="hero__title">
            Discover the<br />
            <span className="hero__title-accent">Sound of Vinyl</span>
          </h1>
          <p className="hero__subtitle">
            Premium records, CDs, and rare EX-YU pressings — hand-picked for true music lovers.
          </p>
          <div className="hero__actions">
            <Link to="/catalog" className="btn btn-primary btn-lg">Browse Collection</Link>
            <Link to="/catalog?region=ex-yu" className="btn btn-outline btn-lg">EX-YU Rarities</Link>
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
            <Carousel title="Recent Arrivals" products={sections.recent_arrivals} />
            <Carousel title="Top Vinyl Releases" products={sections.top_vinyl} />
            <Carousel title="Top CD Releases" products={sections.top_cd} />
            <Carousel title="EX-YU Selections" products={sections.ex_yu} />
          </>
        )}
      </div>

      {/* CTA Banner */}
      <section className="home__cta container">
        <div className="home__cta-card glass-card">
          <div>
            <h2>Can't find what you're looking for?</h2>
            <p>Visit one of our three stores or browse our full catalog online.</p>
          </div>
          <Link to="/catalog" className="btn btn-primary btn-lg">Full Catalog</Link>
        </div>
      </section>
    </div>
  );
}
