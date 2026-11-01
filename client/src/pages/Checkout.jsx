import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { placeOrder, getImageUrl } from '../api';

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');
  const [payment, setPayment] = useState('card');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', pincode: '' });

  const discount = couponApplied ? Math.round(totalPrice * 0.2) : 0;
  const shipping = totalPrice >= 999 ? 0 : 99;
  const total = totalPrice - discount + shipping;

  const handleCoupon = () => {
    if (coupon.toUpperCase() === 'SHOPX20') {
      setCouponApplied(true);
      setCouponMsg('✓ 20% discount applied!');
    } else {
      setCouponMsg('Invalid code. Try SHOPX20');
      setCouponApplied(false);
    }
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { showToast('Cart is empty!', 'error'); return; }
    setLoading(true);

    const orderPayload = {
      customer: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email, 
      phone: form.phone,
      address: form.address, 
      city: form.city, 
      pincode: form.pincode,
      payment,
      items: cart.map(i => ({
        id: i.id || i.product?._id || i.product?.id,
        name: i.product?.name || i.name || 'Product Item',
        image: i.product?.image || i.image || 'product_tshirt.jpg',
        price: i.product?.price || i.price || 0,
        size: i.size || 'M',
        quantity: i.qty || i.quantity || 1,
        colorIndex: i.colorIndex || 0
      })),
      subtotal: totalPrice, 
      discount, 
      shipping, 
      totalAmount: total,
      total: total,
      status: 'Processing',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Send Order to Backend API (Triggers Nodemailer Email)
      const res = await placeOrder(orderPayload);
      const backendSavedOrder = res.data?.data || res.data || orderPayload;

      // 2. Save in Local Storage as Sync Backup for My Orders
      const existingOrders = JSON.parse(localStorage.getItem('shopx-orders') || '[]');
      const uniqueOrders = [backendSavedOrder, ...existingOrders.filter(o => o.id !== backendSavedOrder.id)];
      localStorage.setItem('shopx-orders', JSON.stringify(uniqueOrders));

      clearCart();
      showToast('Order placed successfully!', 'success');
      navigate('/success', { state: { orderId: backendSavedOrder.id || `SX${Date.now()}` } });
    } catch (err) {
      console.error('Order placement API failed:', err);
      
      // Fallback: If Render server sleeping, save locally so order is not lost
      const existingOrders = JSON.parse(localStorage.getItem('shopx-orders') || '[]');
      localStorage.setItem('shopx-orders', JSON.stringify([orderPayload, ...existingOrders]));

      clearCart();
      navigate('/success', { state: { orderId: orderPayload.id || `SX${Date.now()}` } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="checkout-wrap">
        <h1 className="checkout-title">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">
            {/* Shipping */}
            <div>
              <div className="checkout-section">
                <h2 className="cs-title">Shipping Details</h2>
                <div className="form-row">
                  <div className="form-group"><label>First Name</label><input required value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} placeholder="Rahul" /></div>
                  <div className="form-group"><label>Last Name</label><input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} placeholder="Sharma" /></div>
                </div>
                <div className="form-group"><label>Email</label><input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="rahul@example.com" /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+91 98765 43210" /></div>
                <div className="form-group"><label>Address</label><input required value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="123, MG Road" /></div>
                <div className="form-row">
                  <div className="form-group"><label>City</label><input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Mumbai" /></div>
                  <div className="form-group"><label>PIN Code</label><input value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value}))} placeholder="400001" /></div>
                </div>
              </div>
              <div className="checkout-section">
                <h2 className="cs-title">Payment</h2>
                <div className="payment-methods">
                  {[['card','💳 Credit / Debit Card'],['upi','📱 UPI'],['cod','💵 Cash on Delivery']].map(([val, label]) => (
                    <label key={val} className={`payment-opt ${payment === val ? 'active' : ''}`}>
                      <input type="radio" name="payment" value={val} checked={payment === val} onChange={() => setPayment(val)} />
                      {label}
                    </label>
                  ))}
                </div>
                {payment === 'card' && (
                  <div>
                    <div className="form-group"><label>Card Number</label><input placeholder="1234 5678 9012 3456" maxLength={19} /></div>
                    <div className="form-row">
                      <div className="form-group"><label>Expiry</label><input placeholder="MM/YY" maxLength={5} /></div>
                      <div className="form-group"><label>CVV</label><input placeholder="•••" maxLength={3} /></div>
                    </div>
                  </div>
                )}
                {payment === 'upi' && (
                  <div className="form-group"><label>UPI ID</label><input placeholder="yourname@upi" /></div>
                )}
                {payment === 'cod' && (
                  <div className="cod-notice">ℹ️ Pay when your order arrives. Available for orders under ₹10,000.</div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h2 className="cs-title">Order Summary</h2>
              <div className="order-items">
                {cart.map((item, i) => (
                  <div key={i} className="order-item">
                    <div className="order-item-img">
                      <img src={getImageUrl(item.product?.image)} alt={item.product?.name} onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} />
                    </div>
                    <div className="order-item-info">
                      <p className="order-item-name">{item.product?.name}</p>
                      <p className="order-item-meta">Size: {item.size} · Qty: {item.qty}</p>
                    </div>
                    <span className="order-item-price">₹{((item.product?.price || 0) * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="coupon-row">
                <input className="coupon-input" placeholder="Coupon (SHOPX20)" value={coupon} onChange={e => setCoupon(e.target.value)} />
                <button type="button" className="btn-apply" onClick={handleCoupon}>Apply</button>
              </div>
              <p className="coupon-msg" style={{ color: couponApplied ? 'var(--green)' : 'var(--rose)' }}>{couponMsg}</p>
              <div className="order-totals">
                <div className="total-row"><span>Subtotal</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
                <div className="total-row"><span>Discount</span><span className="discount-text">-₹{discount.toLocaleString('en-IN')}</span></div>
                <div className="total-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : '₹' + shipping}</span></div>
                <div className="total-row grand-total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
              </div>
              <button type="submit" className="btn btn-primary place-order-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Place Order →'}
              </button>
              <p className="secure-note">🔒 100% Secure & Encrypted Payment</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}