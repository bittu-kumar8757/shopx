import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

export default function Cart() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQty } = useCart();
  const navigate = useNavigate();

  // Safety Fallback Calculations
  const calculatedTotalItems = cart ? cart.reduce((acc, item) => acc + (item.qty || 1), 0) : 0;
  
  const calculatedTotalPrice = cart ? cart.reduce((acc, item) => {
    const itemPrice = Number(item.product?.price || item.price || 0);
    const itemQty = Number(item.qty || 1);
    return acc + (itemPrice * itemQty);
  }, 0) : 0;

  const actualItemsCount = totalItems || calculatedTotalItems;
  const actualTotalPrice = totalPrice || calculatedTotalPrice;

  // Empty Cart Screen Fix (Strict SVG Size)
  if (!cart || cart.length === 0) {
    return (
      <div className="cart-empty-wrapper">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          width="70" 
          height="70" 
          style={{ width: '70px', height: '70px', maxWidth: '70px', minWidth: '70px', color: '#666' }}
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h2 style={{ margin: '12px 0 4px', fontSize: '1.6rem', color: '#fff', fontWeight: 700 }}>Your cart is empty</h2>
        <p style={{ margin: '0 0 16px', color: '#888', fontSize: '0.95rem' }}>Add some amazing clothes to get started!</p>
        <Link 
          to="/shop" 
          style={{ 
            padding: '12px 24px', 
            background: '#e2b963', 
            color: '#000', 
            borderRadius: '8px', 
            fontWeight: 700, 
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Start Shopping
        </Link>

        <style>{`
          .cart-empty-wrapper {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 20px 40px;
            text-align: center;
            box-sizing: border-box;
          }
        `}</style>
      </div>
    );
  }

  const shippingCharge = actualTotalPrice >= 999 ? 0 : 99;
  const grandTotal = actualTotalPrice + shippingCharge;

  return (
    <div className="shopx-cart-page">
      
      <h1 className="shopx-cart-title">
        Your Cart <span>({actualItemsCount} items)</span>
      </h1>

      <div className="shopx-cart-grid">
        
        {/* Cart Products List */}
        <div className="shopx-cart-items-container">
          {cart.map((item, i) => {
            const name = item.product?.name || item.name || 'Product';
            const price = Number(item.product?.price || item.price || 0);
            const rawImage = item.product?.image || item.image;
            const image = Array.isArray(rawImage) ? rawImage[0] : rawImage;
            const size = typeof item.size === 'object' ? (item.size?.name || 'M') : (item.size || 'M');
            const qty = item.qty || 1;
            const itemId = item.product?._id || item.product?.id || item.id || item._id;

            return (
              <div key={i} className="shopx-cart-card">
                <div className="shopx-cart-img-box">
                  <img 
                    src={getImageUrl(image)} 
                    alt={name} 
                    onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} 
                  />
                </div>

                <div className="shopx-cart-details">
                  <div className="shopx-cart-card-top">
                    <span className="shopx-cart-item-name">{name}</span>
                    <button 
                      className="shopx-cart-delete-btn" 
                      onClick={() => removeFromCart(itemId, size, item.colorIndex)}
                      title="Remove"
                    >
                      🗑
                    </button>
                  </div>

                  <div className="shopx-cart-size">Size: {size}</div>

                  <div className="shopx-cart-card-bottom">
                    <span className="shopx-cart-item-price">
                      ₹{(price * qty).toLocaleString('en-IN')}
                    </span>

                    <div className="shopx-qty-counter">
                      <button onClick={() => updateQty(itemId, size, item.colorIndex, -1)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => updateQty(itemId, size, item.colorIndex, 1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="shopx-cart-summary">
          <h2>Order Summary</h2>

          <div className="shopx-summary-line">
            <span>Subtotal ({actualItemsCount} items)</span>
            <span>₹{actualTotalPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className="shopx-summary-line">
            <span>Shipping</span>
            <span style={{ color: shippingCharge === 0 ? '#2ea44f' : '#fff', fontWeight: 600 }}>
              {shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}
            </span>
          </div>

          <div className="shopx-summary-divider"></div>

          <div className="shopx-summary-line shopx-total-line">
            <span>Total</span>
            <span className="shopx-gold-text">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <button 
            className="shopx-btn-checkout" 
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout →
          </button>

          <Link to="/shop" className="shopx-btn-continue">
            Continue Shopping
          </Link>
        </div>

      </div>

      <style>{`
        .shopx-cart-page {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          padding: 100px 16px 100px;
          box-sizing: border-box;
          color: #fff;
        }

        .shopx-cart-title {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 24px;
        }

        .shopx-cart-title span {
          color: #888;
          font-size: 1.1rem;
          font-weight: 400;
        }

        .shopx-cart-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }

        .shopx-cart-items-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }

        .shopx-cart-card {
          display: flex;
          gap: 14px;
          background: #181824;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          align-items: center;
          box-sizing: border-box;
          width: 100%;
        }

        .shopx-cart-img-box {
          width: 80px;
          height: 90px;
          border-radius: 8px;
          overflow: hidden;
          background: #111;
          flex-shrink: 0;
        }

        .shopx-cart-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .shopx-cart-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .shopx-cart-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .shopx-cart-item-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .shopx-cart-delete-btn {
          background: none;
          border: none;
          color: #ff4d4d;
          font-size: 1rem;
          cursor: pointer;
          padding: 2px 4px;
        }

        .shopx-cart-size {
          font-size: 0.8rem;
          color: #aaa;
        }

        .shopx-cart-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }

        .shopx-cart-item-price {
          font-weight: 700;
          color: #e2b963;
          font-size: 1.05rem;
        }

        .shopx-qty-counter {
          display: flex;
          align-items: center;
          background: #111;
          border: 1px solid #333;
          border-radius: 6px;
          overflow: hidden;
        }

        .shopx-qty-counter button {
          width: 28px;
          height: 28px;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .shopx-qty-counter span {
          padding: 0 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .shopx-cart-summary {
          background: #181824;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          box-sizing: border-box;
          width: 100%;
        }

        .shopx-cart-summary h2 {
          margin: 0 0 16px;
          font-size: 1.15rem;
          font-weight: 700;
        }

        .shopx-summary-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #aaa;
          font-size: 0.9rem;
        }

        .shopx-summary-divider {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin: 12px 0;
        }

        .shopx-total-line {
          font-size: 1.15rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 16px;
        }

        .shopx-gold-text {
          color: #e2b963;
        }

        .shopx-btn-checkout {
          width: 100%;
          padding: 14px;
          background: #e2b963;
          color: #000;
          border: none;
          border-radius: 8px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
        }

        .shopx-btn-continue {
          display: block;
          text-align: center;
          margin-top: 12px;
          color: #aaa;
          text-decoration: none;
          font-size: 0.85rem;
        }

        /* 📱 Mobile Responsive Rules (< 768px) */
        @media (max-width: 768px) {
          .shopx-cart-page {
            padding-top: 75px;
            padding-bottom: 120px;
          }

          .shopx-cart-grid {
            grid-template-columns: 1fr !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 18px;
          }

          .shopx-cart-card {
            padding: 10px;
          }

          .shopx-cart-img-box {
            width: 70px;
            height: 80px;
          }
        }
      `}</style>

    </div>
  );
}