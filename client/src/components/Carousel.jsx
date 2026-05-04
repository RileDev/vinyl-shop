import { useRef, useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './Carousel.css';

export default function Carousel({ title, products = [] }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => { checkScroll(); }, [products]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
    setTimeout(checkScroll, 400);
  };

  if (!products.length) return null;

  return (
    <section className="carousel">
      <div className="carousel__header">
        <h2 className="section-title">{title}</h2>
        <div className="carousel__controls">
          <button
            className="carousel__arrow"
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            className="carousel__arrow"
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div className="carousel__track" ref={trackRef} onScroll={checkScroll}>
        {products.map(p => (
          <div className="carousel__item" key={p.id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
