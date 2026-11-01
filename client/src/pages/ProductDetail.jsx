import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct, getImageUrl } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct(id)
      .then(res => {
        setProduct(res.data?.data || res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: '80px 20px', color: '#fff', textAlign: 'center' }}>Loading Product Details...</div>;
  if (!product) return <div style={{ padding: '80px 20px', color: '#fff', textAlign: 'center' }}>Product not found.</div>;

  const images = product.images && product.images.length > 0 ? product.images : [product.image || 'product_tshirt.jpg'];
  const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = product.colors || ['#4a4a38', '#2b2c3a', '#2d4d36', '#4a3338'];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    showToast('Added to Cart successfully!', 'success');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/checkout');
  };

  return (
    <div className="product-page-wrap">
      <div className="product-detail-container">
        
        {/* Left Side: Images Section */}
        <div className="product-images-layout">
          <div className="main-image-box">
            <img 
              src={getImageUrl(images[selectedImage])} 
              alt={product.name} 
              onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }}
            />
          </div>

          <div className="thumbnail-list">
            {images.map((img, idx) => (
              <button 
                key={idx} 
                className={`thumb-btn ${selectedImage === idx ? 'active' : ''}`}
                onClick={() => setSelectedImage(idx)}
              >
                <img src={getImageUrl(img)} alt={`Thumb ${idx}`} onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Product Information */}
        <div className="product-info-section">
          <span className="product-category">{product.category || 'UNISEX BOTTOMS'}</span>
          <h1 className="product-title">{product.name}</h1>

          <div className="product-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-text">4.6 · 227 reviews</span>
          </div>

          <div className="product-price-box">
            <span className="price">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice && <span className="original-price">₹{product.originalPrice?.toLocaleString('en-IN')}</span>}
            <span className="save-tag">You save ₹{(product.originalPrice || product.price + 600) - product.price}</span>
          </div>

          <p className="product-desc">{product.description || 'Comfortable elasticated waistband with drawstring, zip pockets, and a tapered leg that works as well in the gym as at a café.'}</p>

          {/* Select Size */}
          <div className="options-group">
            <label>SELECT SIZE</label>
            <div className="size-picker">
              {sizes.map(size => (
                <button 
                  key={size} 
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Select Color */}
          <div className="options-group">
            <label>SELECT COLOR</label>
            <div className="color-picker">
              {colors.map((color, idx) => (
                <button 
                  key={idx} 
                  className={`color-btn ${selectedColor === idx ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setSelectedColor(idx)}
                />
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart Action */}
          <div className="action-row">
            <div className="qty-control">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            
            <button className="btn-add-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>

          <button className="btn-buy-now" onClick={handleBuyNow}>
            Buy Now
          </button>

          <div className="free-shipping-card">
            🚚 <strong>Free Shipping</strong>
            <p>On orders above ₹999</p>
          </div>
        </div>

      </div>

      {/* Embedded Mobile Responsive Styles */}
      <style>{`
        .product-page-wrap {
          padding-top: var(--nav-h, 90px);
          padding-bottom: 60px;
          color: #fff;
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 16px;
          padding-right: 16px;
        }

        .product-detail-container {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 32px;
          background: #181824;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .product-images-layout {
          display: flex;
          gap: 16px;
        }

        .main-image-box {
          flex: 1;
          background: #111;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 4/5;
        }

        .main-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .thumb-btn {
          width: 60px;
          height: 70px;
          border-radius: 8px;
          border: 1px solid #333;
          background: #111;
          cursor: pointer;
          overflow: hidden;
          padding: 0;
        }

        .thumb-btn.active {
          border-color: var(--gold, #e2b963);
        }

        .thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-category {
          color: var(--gold, #e2b963);
          font-size: 0.8rem;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .product-title {
          font-size: 2rem;
          margin: 8px 0 12px;
          color: #fff;
        }

        .product-rating {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 16px;
        }

        .stars { color: var(--gold, #e2b963); }
        .rating-text { color: #888; font-size: 0.85rem; }

        .product-price-box {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .price { font-size: 1.8rem; font-weight: 700; color: #fff; }
        .original-price { color: #777; text-decoration: line-through; }
        .save-tag { background: rgba(46, 164, 79, 0.2); color: #2ea44f; padding: 4px 10px; borderRadius: 20px; font-size: 0.8rem; font-weight: 600; }

        .product-desc { color: #aaa; font-size: 0.9rem; line-height: 1.6; margin-bottom: 24px; }

        .options-group { margin-bottom: 20px; }
        .options-group label { display: block; color: #888; font-size: 0.8rem; font-weight: 700; margin-bottom: 8px; }

        .size-picker { display: flex; gap: 8px; flex-wrap: wrap; }
        .size-btn { padding: 8px 16px; background: #111; border: 1px solid #333; color: #fff; border-radius: 6px; cursor: pointer; }
        .size-btn.active { border-color: var(--gold, #e2b963); background: rgba(226, 185, 99, 0.15); color: var(--gold, #e2b963); }

        .color-picker { display: flex; gap: 12px; }
        .color-btn { width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
        .color-btn.active { border-color: var(--gold, #e2b963); }

        .action-row { display: flex; gap: 12px; margin-bottom: 12px; }

        .qty-control { display: flex; align-items: center; background: #111; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
        .qty-control button { width: 38px; height: 44px; background: none; border: none; color: #fff; cursor: pointer; font-size: 1.1rem; }
        .qty-control span { padding: 0 12px; font-weight: 600; }

        .btn-add-cart { flex: 1; background: var(--gold, #e2b963); color: #000; border: none; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; height: 44px; }
        .btn-buy-now { width: 100%; background: #262738; color: #fff; border: 1px solid #444; border-radius: 8px; font-weight: 700; height: 44px; cursor: pointer; margin-bottom: 20px; }

        .free-shipping-card { background: #111; padding: 14px; border-radius: 8px; border: 1px solid #333; font-size: 0.85rem; color: #aaa; }
        .free-shipping-card p { margin: 2px 0 0; color: #666; font-size: 0.75rem; }

        /* 📱 MOBILE RESPONSIVE MEDIA QUERY (< 768px) */
        @media (max-width: 768px) {
          .product-detail-container {
            grid-template-columns: 1fr;
            padding: 16px;
            gap: 20px;
          }

          .product-images-layout {
            flex-direction: column;
          }

          .thumbnail-list {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 4px;
          }

          .thumb-btn {
            width: 65px;
            height: 75px;
            flex-shrink: 0;
          }

          .product-title {
            font-size: 1.5rem;
          }

          .action-row {
            flex-direction: column;
          }

          .qty-control {
            justify-content: space-between;
            width: 100%;
          }

          .qty-control button {
            width: 50px;
          }
        }
      `}</style>

    </div>
  );
}