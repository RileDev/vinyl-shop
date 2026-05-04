import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const API = 'http://localhost:5000/api';

export default function ProductDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { addItem } = useCart();
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
        <p>Product not found.</p>
        <Link to="/catalog" className="btn btn-outline">Back to Catalog</Link>
      </div>
    );
  }

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);
  const inStock = product.stock_count > 0;

  return (
    <div className="pd container fade-in">
      <nav className="pd__breadcrumb">
        <Link to="/">Home</Link> / <Link to="/catalog">Catalog</Link> / <span>{product.title}</span>
      </nav>

      <div className="pd__layout">
        {/* Gallery */}
        <div className="pd__gallery">
          <div className="pd__main-image-wrap">
            <img src={allImages[selectedImage] || '/placeholder.jpg'} alt={product.title} className="pd__main-image" />
          </div>
          {allImages.length > 1 && (
            <div className="pd__thumbs">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`pd__thumb ${i === selectedImage ? 'pd__thumb--active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt="" />
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
            {inStock ? `✓ In Stock (${product.stock_count} available)` : '✕ Out of Stock'}
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
              Add to Cart
            </button>
            <button
              className={`btn ${wishAdded ? 'btn-primary' : 'btn-outline'}`}
              onClick={handleWishlist}
              title={user ? 'Add to wishlist' : 'Sign in to add to wishlist'}
            >
              {wishAdded ? '♥' : '♡'}
            </button>
          </div>

          {/* Store availability */}
          {stores.length > 0 && (
            <div className="pd__stores">
              <h3>Available in Stores</h3>
              {stores.map(s => (
                <div key={s.id} className="pd__store-item">
                  <span className="pd__store-name">{s.name}</span>
                  <span className="pd__store-qty">{s.quantity} in stock</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
