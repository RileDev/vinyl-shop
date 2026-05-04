import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

const API = 'http://localhost:5000/api';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') || '';
  const activeGenre = searchParams.get('genre') || '';
  const activeRegion = searchParams.get('region') || '';
  const activeSearch = searchParams.get('search') || '';

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products/filters`).then(r => r.json()),
    ]).then(([filters]) => {
      setCategories(filters.categories || []);
      setGenres(filters.genres || []);
      setRegions(filters.regions || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (activeGenre) params.set('genre', activeGenre);
    if (activeRegion) params.set('region', activeRegion);
    if (activeSearch) params.set('search', activeSearch);

    fetch(`${API}/products?${params}`)
      .then(r => r.json())
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, activeGenre, activeRegion, activeSearch]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = activeCategory || activeGenre || activeRegion || activeSearch;

  return (
    <div className="catalog container">
      <div className="catalog__header">
        <h1 className="section-title">Catalog</h1>
        <p className="catalog__count">{products.length} product{products.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="catalog__layout">
        {/* Sidebar Filters */}
        <aside className="catalog__sidebar">
          {/* Search */}
          <div className="catalog__filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Artist or title..."
              value={activeSearch}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="catalog__filter-group">
            <label>Category</label>
            <div className="catalog__chips">
              {categories.map(c => (
                <button
                  key={c.slug}
                  className={`catalog__chip ${activeCategory === c.slug ? 'catalog__chip--active' : ''}`}
                  onClick={() => setFilter('category', activeCategory === c.slug ? '' : c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Genre */}
          <div className="catalog__filter-group">
            <label>Genre</label>
            <div className="catalog__chips">
              {genres.map(g => (
                <button
                  key={g.slug}
                  className={`catalog__chip ${activeGenre === g.slug ? 'catalog__chip--active' : ''}`}
                  onClick={() => setFilter('genre', activeGenre === g.slug ? '' : g.slug)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="catalog__filter-group">
            <label>Region</label>
            <div className="catalog__chips">
              {regions.map(r => (
                <button
                  key={r.slug}
                  className={`catalog__chip ${activeRegion === r.slug ? 'catalog__chip--active' : ''}`}
                  onClick={() => setFilter('region', activeRegion === r.slug ? '' : r.slug)}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button className="btn btn-secondary" onClick={clearFilters} style={{ width: '100%', marginTop: '0.5rem' }}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Grid */}
        <main className="catalog__grid-area">
          {loading ? (
            <div className="catalog__grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 340, borderRadius: 'var(--radius-md)' }}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="catalog__empty">
              <p>No products found matching your criteria.</p>
              <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="catalog__grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
