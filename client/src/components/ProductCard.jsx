import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const inStock = product.stock_count > 0;

  return (
    <div className="product-card fade-in">
      <Link to={`/product/${product.id}`} className="product-card__image-wrap">
        <img
          src={product.image_url || '/placeholder.jpg'}
          alt={product.title}
          className="product-card__image"
          loading="lazy"
        />
        {product.compare_price && (
          <span className="product-card__sale-badge">Sale</span>
        )}
        {!inStock && <div className="product-card__out-of-stock">Out of Stock</div>}
      </Link>

      <div className="product-card__body">
        <p className="product-card__artist">{product.artist}</p>
        <Link to={`/product/${product.id}`} className="product-card__title">{product.title}</Link>

        <div className="product-card__footer">
          <div className="product-card__pricing">
            <span className="product-card__price">${product.price.toFixed(2)}</span>
            {product.compare_price && (
              <span className="product-card__compare">${product.compare_price.toFixed(2)}</span>
            )}
          </div>
          <button
            className="product-card__add-btn"
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            disabled={!inStock}
            title={inStock ? 'Add to cart' : 'Out of stock'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
