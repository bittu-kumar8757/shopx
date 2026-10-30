import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleCardClick = (e) => {
    // Card par click hone par route navigate karein
    navigate(`/product/${product.id}`);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Link/Card click Event ko roko taaki Product Detail page na khule
    const size = product.sizes?.find(s => !product.outOfStock?.includes(s)) || product.sizes?.[0] || 'M';
    addToCart(product, size, 0, 1);
  };

  return (
    <div 
      className="product-card" 
      onClick={handleCardClick} 
      style={{ cursor: 'pointer' }}
    >
      <div className="product-card-img">
        <img src={getImageUrl(product.image)} alt={product.name} loading="lazy"
          onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} />
        {product.tag && (
          <span className={`product-tag tag-${product.tag}`}>{product.tagLabel}</span>
        )}
        <div className="product-quick-add" onClick={handleQuickAdd}>+ Quick Add</div>
      </div>
      <div className="product-info">
        <p className="product-category-tag">{product.categoryLabel}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <span className="stars">{getStars(product.rating)}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>
        <div className="product-price-row">
          <span className="product-price">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice && <span className="product-og-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
          {discount > 0 && <span className="product-discount">{discount}% off</span>}
        </div>
      </div>
    </div>
  );
}