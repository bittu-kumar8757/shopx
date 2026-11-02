import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

export default function Cart() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQty } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty-view">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="cart-empty-icon">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h2>Your cart is empty</h2>
        <p>Add some amazing clothes to get started!</p>
        <Link to="/shop" className="btn-shop-now">Start Shopping</Link>
      </div>
    );
  }

  const shippingCharge = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shippingCharge;

  return (
    <div className="mobile-cart-wrapper">
      
      <h1 className="cart-heading">
        Your Cart <span>({totalItems} items)</span>
      </h1>

      <div className="cart-content-layout">
        
        {/* Products List */}
        <div className="cart-products-list">
          {cart.map((item, i) => (
            <div key={i} className="cart-item-card">
              <div className="cart-item-thumb">
                <img 
                  src={getImageUrl(item.product?.image)} 
                  alt={item.product?.name} 
                  onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} 
                />
              </div>

              <div className="cart-item-details">
                <div className="cart-item-top">
                  <span className="cart-item-title">{item.product?.name || item.name}</span>
                  <button 
                    className="cart-delete-btn" 
                    onClick={() => removeFromCart(item.id, item.size, item.colorIndex)}
                  >
                    🗑
                  </button>
                </div>

                <span className="cart-item-size">Size: {item.size}</span>

                <div className="cart-item-bottom">
                  <span className="cart-item-price">
                    ₹{((item.product?.price || item.price || 0) * item.qty).toLocaleString('en-IN')}
                  </span>

                  <div className="cart-qty-box">
                    <button onClick={() => updateQty(item.id, item.size, item.colorIndex, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.size, item.colorIndex, 1)}>+</button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary-box">
          <h3>Order Summary</h3>

          <div className="summary-line">
            <span>Subtotal ({totalItems} items)</span>
            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-line">
            <span>Shipping</span>
            <span style={{ color: shippingCharge === 0 ? '#2ea44f' : '#fff' }}>
              {shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}
            </span>
          </div>

          <div className="summary-line total-line">
            <span>Total</span>
            <span className="total-price">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <button 
            className="checkout-action-btn" 
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout →
          </button>

          <Link to="/shop" className="continue-shop-link">
            Continue Shopping
          </Link>
        </div>

      </div>

      <style>{`
        .mobile-cart-wrapper {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 16px 120px;
          box-sizing: border-box;
          color: #fff;
        }

        .cart-heading {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 24px;
        }

        .cart-heading span {
          color: #888;
          font-size: 1.1rem;
          font-weight: 400;
        }

        .cart-content-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }

        .cart-products-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .cart-item-card {
          display: flex;
          gap: 14px;
          background: #181824;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          align-items: center;
        }

        .cart-item-thumb {
          width: 80px;
          height: 90px;
          border-radius: 8px;
          overflow: hidden;
          background: #111;
          flex-shrink: 0;
        }

        .cart-item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .cart-item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .cart-item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cart-delete-btn {
          background: none;
          border: none;
          color: #ff4d4d;
          font-size: 1rem;
          cursor: pointer;
        }

        .cart-item-size {
          font-size: 0.8rem;
          color: #aaa;
        }

        .cart-item-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }

        .cart-item-price {
          font-weight: 700;
          color: #e2b963;
          font-size: 1.05rem;
        }

        .cart-qty-box {
          display: flex;
          align-items: center;
          background: #111;
          border: 1px solid #333;
          border-radius: 6px;
        }

        .cart-qty-box button {
          width: 28px;
          height: 28px;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .cart-qty-box span {
          padding: 0 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .cart-summary-box {
          background: #181824;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          position: sticky;
          top: 100px;
        }

        .cart-summary-box h3 {
          margin: 0 0 16px;
          font-size: 1.15rem;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #aaa;
          font-size: 0.9rem;
        }

        .total-line {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 12px;
          margin-top: 12px;
          font-size: 1.15rem;
          font-weight: 800;
          color: #fff;
        }

        .total-price {
          color: #e2b963;
        }

        .checkout-action-btn {
          width: 100%;
          padding: 14px;
          background: #e2b963;
          color: #000;
          border: none;
          border-radius: 8px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 16px;
        }

        .continue-shop-link {
          display: block;
          text-align: center;
          margin-top: 12px;
          color: #aaa;
          text-decoration: none;
          font-size: 0.85rem;
        }

        .cart-empty-view {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-top: 100px;
          text-align: center;
          gap: 12px;
        }

        .cart-empty-icon {
          width: 60px;
          height: 60px;
          color: #666;
        }

        .btn-shop-now {
          padding: 12px 24px;
          background: #e2b963;
          color: #000;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
        }

        /* 📱 RESPONSIVE MOBILE FIX (< 768px) */
        @media (max-width: 768px) {
          .mobile-cart-wrapper {
            padding-top: 80px;
            padding-bottom: 140px;
          }

          .cart-content-layout {
            grid-template-columns: 1fr !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 20px;
          }

          .cart-summary-box {
            position: static !important;
            width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>

    </div>
  );
}