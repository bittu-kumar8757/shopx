import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

export default function Cart() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQty, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="page active" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', gap: '20px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '80px', height: '80px', color: 'var(--text-3)' }}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-2)' }}>Add some amazing clothes to get started!</p>
        <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page active" style={{ paddingTop: 'var(--nav-h)', maxWidth: '900px', margin: '0 auto', padding: 'calc(var(--nav-h) + 40px) 24px 80px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '32px', letterSpacing: '-1px' }}>
        Your Cart <span style={{ color: 'var(--text-3)', fontWeight: '400', fontSize: '20px' }}>({totalItems} items)</span>
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.map((item, i) => (
            <div key={i} className="cart-item">
              <div className="cart-item-img">
                <img src={getImageUrl(item.product?.image)} alt={item.product?.name} onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} />
              </div>
              <div className="cart-item-details">
                <p className="cart-item-name">{item.product?.name}</p>
                <p className="cart-item-meta">Size: {item.size}</p>
                <div className="cart-item-bottom">
                  <span className="cart-item-price">₹{((item.product?.price || 0) * item.qty).toLocaleString('en-IN')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="cart-item-qty">
                      <button className="ci-qty-btn" onClick={() => updateQty(item.id, item.size, item.colorIndex, -1)}>−</button>
                      <span className="ci-qty-num">{item.qty}</span>
                      <button className="ci-qty-btn" onClick={() => updateQty(item.id, item.size, item.colorIndex, 1)}>+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id, item.size, item.colorIndex)}>🗑</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', position: 'sticky', top: 'calc(var(--nav-h) + 20px)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-2)' }}>
            <span>Subtotal ({totalItems} items)</span>
            <span style={{ fontWeight: '700', color: 'var(--text)' }}>₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-2)' }}>
            <span>Shipping</span>
            <span style={{ color: 'var(--green)' }}>{totalPrice >= 999 ? 'Free' : '₹99'}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800' }}>
            <span>Total</span>
            <span style={{ color: 'var(--gold)' }}>₹{(totalPrice + (totalPrice >= 999 ? 0 : 99)).toLocaleString('en-IN')}</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '20px', padding: '16px', fontSize: '16px' }} onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
          <Link to="/shop" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
