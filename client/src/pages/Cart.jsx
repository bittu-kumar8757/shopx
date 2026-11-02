import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

export default function Cart() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQty } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="empty-cart-icon">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h2 className="empty-cart-title">Your cart is empty</h2>
        <p className="empty-cart-subtitle">Add some amazing clothes to get started!</p>
        <Link to="/shop" className="btn-start-shopping">Start Shopping</Link>
      </div>
    );
  }

  const shippingCharge = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shippingCharge;

  return (
    <div className="cart-page-wrap">
      <div className="cart-container">
        
        <h1 className="cart-header-title">
          Your Cart <span className="cart-count">({totalItems} items)</span>
        </h1>

        <div className="cart-main-grid">
          
          {/* Items List Section */}
          <div className="cart-items-list">
            {cart.map((item, i) => (
              <div key={i} className="cart-item-card">
                <div className="cart-item-img-wrap">
                  <img 
                    src={getImageUrl(item.product?.image)} 
                    alt={item.product?.name} 
                    onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} 
                  />
                </div>

                <div className="cart-item-info">
                  <div className="cart-item-header">
                    <p className="cart-item-name">{item.product?.name || item.name}</p>
                    <button 
                      className="cart-item-remove-btn" 
                      onClick={() => removeFromCart(item.id, item.size, item.colorIndex)}
                      title="Remove Item"
                    >
                      🗑
                    </button>
                  </div>

                  <p className="cart-item-meta">Size: <strong>{item.size}</strong></p>

                  <div className="cart-item-footer">
                    <span className="cart-item-price">
                      ₹{((item.product?.price || item.price || 0) * item.qty).toLocaleString('en-IN')}
                    </span>

                    <div className="cart-item-qty-selector">
                      <button 
                        className="ci-qty-btn" 
                        onClick={() => updateQty(item.id, item.size, item.colorIndex, -1)}
                      >−</button>
                      <span className="ci-qty-num">{item.qty}</span>
                      <button 
                        className="ci-qty-btn" 
                        onClick={() => updateQty(item.id, item.size, item.colorIndex, 1)}
                      >+</button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Summary Section (Sticky on Desktop, Stacked on Mobile) */}
          <div className="cart-summary-card">
            <h2 className="summary-card-title">Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal ({totalItems} items)</span>
              <span className="summary-val">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="shipping-val">{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Total</span>
              <span className="total-gold-price">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <button 
              className="btn-proceed-checkout" 
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout →
            </button>

            <Link to="/shop" className="btn-continue-shopping">
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>

      {/* Embedded 100% Mobile Responsive Styles */}
      <style>{`
        .cart-page-wrap {
          padding-top: var(--nav-h, 90px);
          padding-bottom: 80px;
          color: #fff;
          min-height: 80vh;
        }

        .cart-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px 16px;
        }

        .cart-header-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 28px;
          letter-spacing: -0.5px;
          color: #fff;
        }

        .cart-count {
          color: #888;
          font-size: 1.2rem;
          font-weight: 400;
        }

        /* 💻 Desktop Grid Layout */
        .cart-main-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 28px;
          align-items: start;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-item-card {
          display: flex;
          gap: 16px;
          background: #181824;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          align-items: center;
        }

        .cart-item-img-wrap {
          width: 90px;
          height: 100px;
          background: #111;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .cart-item-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cart-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .cart-item-name {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cart-item-remove-btn {
          background: none;
          border: none;
          color: #ff4d4d;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
        }

        .cart-item-meta {
          margin: 0;
          color: #aaa;
          font-size: 0.85rem;
        }

        .cart-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        .cart-item-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--gold, #e2b963);
        }

        .cart-item-qty-selector {
          display: flex;
          align-items: center;
          background: #111;
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
        }

        .ci-qty-btn {
          width: 32px;
          height: 32px;
          background: none;
          border: none;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
        }

        .ci-qty-num {
          padding: 0 10px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Order Summary Card */
        .cart-summary-card {
          background: #181824;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 24px;
          position: sticky;
          top: calc(var(--nav-h, 90px) + 20px);
        }

        .summary-card-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 20px;
          color: #fff;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: #aaa;
          font-size: 0.95rem;
        }

        .summary-val {
          font-weight: 600;
          color: #fff;
        }

        .shipping-val {
          color: #2ea44f;
          font-weight: 600;
        }

        .summary-divider {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin: 16px 0;
        }

        .total-row {
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 20px;
        }

        .total-gold-price {
          color: var(--gold, #e2b963);
        }

        .btn-proceed-checkout {
          width: 100%;
          padding: 16px;
          background: var(--gold, #e2b963);
          color: #000;
          border: none;
          border-radius: 10px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-proceed-checkout:active {
          transform: scale(0.98);
        }

        .btn-continue-shopping {
          display: block;
          text-align: center;
          width: 100%;
          margin-top: 14px;
          color: #aaa;
          text-decoration: none;
          font-size: 0.9rem;
        }

        /* Empty State */
        .cart-empty-state {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 20px 40px;
          gap: 16px;
          text-align: center;
        }

        .empty-cart-icon {
          width: 70px;
          height: 70px;
          color: #555;
        }

        .empty-cart-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
        }

        .empty-cart-subtitle {
          color: #888;
          margin: 0;
        }

        .btn-start-shopping {
          padding: 14px 28px;
          background: var(--gold, #e2b963);
          color: #000;
          border-radius: 10px;
          font-weight: 700;
          text-decoration: none;
          margin-top: 8px;
        }

        /* 📱 MOBILE RESPONSIVE MEDIA QUERIES (< 768px) */
        @media (max-width: 768px) {
          .cart-main-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .cart-header-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
          }

          .cart-item-card {
            padding: 12px;
          }

          .cart-item-img-wrap {
            width: 75px;
            height: 85px;
          }

          .cart-item-name {
            font-size: 0.95rem;
          }

          .cart-summary-card {
            position: relative;
            top: 0;
            padding: 20px 16px;
            margin-top: 10px;
          }
        }
      `}</style>
    </div>
  );
}