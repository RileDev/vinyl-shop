import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/getImageUrl';
import './ProductDetail.css';

const API = 'http://localhost:5000/api';

export default function ProductDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { addItem, setNotification } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishAdded, setWishAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products/${id}`).then(r => r.json()),
      fetch(`${API}/products/${id}/stores`).then(r => r.ok ? r.json() : []),
    ]).then(([prod, st]) => {
      setProduct(prod);
      setStores(st);
      setSelectedImage(0);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleWishlist = async () => {
    if (!user) return navigate('/login');
    try {
      await fetch(`${API}/products/${id}/wishlist`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishAdded(true);
      setNotification({
        type: 'success',
        message: t('productDetail.addedToWishlistClickToView'),
        onClick: () => navigate('/account/wishlist')
      });
    } catch {}
  };

  const handleAddToCart = () => {
    if (product) addItem(product, qty);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="skeleton" style={{ height: 500 }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container catalog__empty">
        <p>{t('productDetail.productNotFound')}</p>
        <Link to="/catalog" className="btn btn-outline">{t('productDetail.backToCatalog')}</Link>
      </div>
    );
  }

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);
  const inStock = product.stock_count > 0;

  return (
    <div className="pd container fade-in">
      <nav className="pd__breadcrumb">
        <Link to="/">{t('productDetail.home')}</Link> / <Link to="/catalog">{t('productDetail.catalog')}</Link> / <span>{product.title}</span>
      </nav>

      <div className="pd__layout">
        {/* Gallery */}
        <div className="pd__gallery">
          <div className="pd__main-image-wrap">
            <img src={getImageUrl(allImages[selectedImage])} alt={product.title} className="pd__main-image" />
          </div>
          {allImages.length > 1 && (
            <div className="pd__thumbs">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`pd__thumb ${i === selectedImage ? 'pd__thumb--active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={getImageUrl(img)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd__info">
          <p className="pd__artist">{product.artist}</p>
          <h1 className="pd__title">{product.title}</h1>

          <div className="pd__meta">
            {product.category_name && (
              <span className="badge badge--format">
                {product.category_slug === 'vinyls' ? 'Vinyl' : 
                 product.category_slug === 'cds' ? 'CD' : product.category_name}
              </span>
            )}
            {product.release_year && <span className="badge">{product.release_year}</span>}
            {product.condition && <span className="badge">{product.condition}</span>}
            {product.label && <span className="badge">{product.label}</span>}
          </div>

          <div className="pd__pricing">
            <span className="pd__price">${product.price.toFixed(2)}</span>
            {product.compare_price && (
              <span className="pd__compare">${product.compare_price.toFixed(2)}</span>
            )}
          </div>

          <p className={`pd__stock ${inStock ? 'pd__stock--in' : 'pd__stock--out'}`}>
            {inStock ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polyline points="20 6 9 17 4 12"/></svg>
                {t('productDetail.inStock', { count: product.stock_count })}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                {t('productDetail.outOfStock')}
              </>
            )}
          </p>

          <p className="pd__desc">{product.description}</p>

          {/* Add to Cart */}
          <div className="pd__actions">
            <div className="pd__qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={!inStock}>
              {t('productDetail.addToCart')}
            </button>
            <button
              className={`btn ${wishAdded ? 'btn-primary' : 'btn-outline'}`}
              onClick={handleWishlist}
              title={user ? t('productDetail.addToWishlist') : t('productDetail.signInToWishlist')}
            >
              {wishAdded ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              )}
            </button>
          </div>

          {/* Store availability */}
          {stores.length > 0 && (
            <div className="pd__stores">
              <h3>{t('productDetail.availableInStores')}</h3>
              {stores.map(s => (
                <div key={s.id} className="pd__store-item">
                  <span className="pd__store-name">{s.name}</span>
                  <span className="pd__store-qty">{t('productDetail.inStockCount', { count: s.quantity })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
