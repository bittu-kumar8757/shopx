import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProduct, getImageUrl } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

function getStars(r) {
  const f = Math.floor(r); const h = r % 1 >= 0.5;
  return '★'.repeat(f) + (h ? '½' : '') + '☆'.repeat(5 - f - (h ? 1 : 0));
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  // 👈 Here: Destructure buyNow along with addToCart
  const { addToCart, buyNow } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setLoading(true);
    setActiveImg(0);
    setSelectedSize(null);
    setSelectedColor(0);
    setQty(1);

    fetchProduct(id)
      .then(res => {
        setProduct(res.data.data);
        setLoading(false);
      })
      .catch(() => { 
        setLoading(false); 
        navigate('/shop'); 
      });
  }, [id, navigate]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', color: 'var(--text-2)' }}>Loading product...</div>;
  if (!product) return null;

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  const handleAddToCart = () => {
    if (!selectedSize) { showToast('Please select a size!', 'error'); return; }
    addToCart(product, selectedSize, selectedColor, qty);
    showToast(`${product.name} added to cart!`);
  };

  // 👈 FIXED: Use buyNow instead of addToCart to clear old cart items on Direct Purchase
  const handleBuyNow = () => {
    if (!selectedSize) { showToast('Please select a size!', 'error'); return; }
    buyNow(product, selectedSize, selectedColor, qty);
    navigate('/checkout');
  };

  return (
    <div id="page-product" className="page active">
      <div className="breadcrumb">
        <Link to="/" className="bc-link">Home</Link>
        <span className="bc-sep">›</span>
        <Link to="/shop" className="bc-link">Shop</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">{product.name}</span>
      </div>

      <div className="product-detail">
        {/* Gallery */}
        <div className="detail-gallery">
          <div className="detail-main-img">
            <img src={getImageUrl(product.images?.[activeImg] || product.image)}
              alt={product.name}
              onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} />
          </div>
          <div className="detail-thumbs">
            {(product.images || [product.image]).map((img, i) => (
              <div 
                key={i} 
                className={`detail-thumb ${activeImg === i ? 'active' : ''}`} 
                onClick={() => setActiveImg(i)}
                style={{ cursor: 'pointer' }}
              >
                <img src={getImageUrl(img)} alt={`View ${i+1}`} onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="detail-info">
          <p className="detail-category">{product.categoryLabel}</p>
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-rating">
            <span className="stars">{getStars(product.rating)}</span>
            <span className="detail-rating-text">{product.rating} · {product.reviews} reviews</span>
          </div>
          <div className="detail-price-wrap">
            <span className="detail-price">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice && <span className="detail-og-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
            {savings > 0 && <span className="detail-save">You save ₹{savings.toLocaleString('en-IN')}</span>}
          </div>
          <p className="detail-desc">{product.description}</p>

          <p className="detail-section-label">Select Size</p>
          <div className="size-grid">
            {product.sizes?.map(s => (
              <button key={s}
                className={`size-btn ${selectedSize === s ? 'active' : ''} ${product.outOfStock?.includes(s) ? 'out-of-stock' : ''}`}
                onClick={() => !product.outOfStock?.includes(s) && setSelectedSize(s)}
                disabled={product.outOfStock?.includes(s)}
              >{s}</button>
            ))}
          </div>

          <p className="detail-section-label">Select Color</p>
          <div className="color-grid">
            {product.colors?.map((c, i) => (
              <button key={i} className={`color-btn ${selectedColor === i ? 'active' : ''}`}
                style={{ background: c }} onClick={() => setSelectedColor(i)} />
            ))}
          </div>

          <div className="detail-actions">
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
            </div>
            <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
          <button className="btn buy-now-btn" onClick={handleBuyNow}>Buy Now</button>

          <div className="detail-features">
            {[
              ['🚚', 'Free Shipping', 'On orders above ₹999'],
              ['🔄', 'Easy Returns', '15-day hassle-free returns'],
              ['🛡️', 'Authentic Quality', '100% genuine products'],
              ['👕', 'Material', `${product.material} · ${product.fit} fit`],
            ].map(([icon, title, desc]) => (
              <div key={title} className="feature-row">
                <span className="feature-icon" style={{ fontSize: '20px' }}>{icon}</span>
                <span className="feature-text"><strong>{title}</strong>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}