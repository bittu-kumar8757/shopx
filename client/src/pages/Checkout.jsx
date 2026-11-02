import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { placeOrder, getImageUrl } from '../api';

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // 👈 Check if coming from "Buy Now" for a single product
  const buyNowItem = location.state?.buyNowItem;

  // Single item for Buy Now, otherwise full cart
  const checkoutItems = buyNowItem ? [buyNowItem] : cart;

  // Calculate dynamic subtotal
  const calculatedSubtotal = buyNowItem
    ? (buyNowItem.price * (buyNowItem.qty || buyNowItem.quantity || 1))
    : totalPrice;

  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');
  const [payment, setPayment] = useState('cod');

  // PhonePe QR & UPI ID Details
  const upiId = '8757109220-2@ybl'; 
  const upiQrUrl = getImageUrl('qr_code.jpeg'); 

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: 'Bihar',
    pincode: ''
  });

  const discount = couponApplied ? Math.round(calculatedSubtotal * 0.2) : 0;
  const shipping = calculatedSubtotal >= 999 ? 0 : 99;
  const total = calculatedSubtotal - discount + shipping;

  const handleCoupon = () => {
    if (coupon.toUpperCase() === 'SHOPX20') {
      setCouponApplied(true);
      setCouponMsg('✓ 20% discount applied!');
    } else {
      setCouponMsg('Invalid code. Try SHOPX20');
      setCouponApplied(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    showToast('UPI ID copied to clipboard!', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkoutItems.length === 0) { showToast('Cart is empty!', 'error'); return; }
    setLoading(true);

    const fullFormattedAddress = `${form.houseNo}, ${form.street}${form.landmark ? ', Near ' + form.landmark : ''}, ${form.city}, ${form.state} - ${form.pincode}`;

    const orderPayload = {
      customer: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      alternatePhone: form.alternatePhone,
      address: fullFormattedAddress,
      houseNo: form.houseNo,
      street: form.street,
      landmark: form.landmark,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      payment,
      items: checkoutItems.map(i => ({
        id: i.id || i.product?._id || i.product?.id,
        name: i.product?.name || i.name || 'Product Item',
        image: i.product?.image || i.image || 'product_tshirt.jpg',
        price: i.product?.price || i.price || 0,
        size: i.size || 'M',
        quantity: i.qty || i.quantity || 1,
        colorIndex: i.colorIndex || 0
      })),
      subtotal: calculatedSubtotal,
      discount,
      shipping,
      totalAmount: total,
      total: total,
      status: 'Processing',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await placeOrder(orderPayload);
      const backendSavedOrder = res.data?.data || res.data || orderPayload;

      const existingOrders = JSON.parse(localStorage.getItem('shopx-orders') || '[]');
      const uniqueOrders = [backendSavedOrder, ...existingOrders.filter(o => o.id !== backendSavedOrder.id)];
      localStorage.setItem('shopx-orders', JSON.stringify(uniqueOrders));

      if (!buyNowItem) clearCart();
      showToast('Order placed successfully!', 'success');
      navigate('/success', { state: { orderId: backendSavedOrder.id || `SX${Date.now()}` } });
    } catch (err) {
      console.error('Order placement API failed:', err);

      const existingOrders = JSON.parse(localStorage.getItem('shopx-orders') || '[]');
      localStorage.setItem('shopx-orders', JSON.stringify([orderPayload, ...existingOrders]));

      if (!buyNowItem) clearCart();
      navigate('/success', { state: { orderId: orderPayload.id || `SX${Date.now()}` } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page-container">
      <div className="checkout-wrap">
        <h1 className="checkout-title">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">
            
            {/* Shipping & Address Section */}
            <div>
              <div className="checkout-section">
                <h2 className="cs-title">📍 Delivery Address</h2>

                {/* Name & Phone */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input required value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} placeholder="Rahul" />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} placeholder="Sharma" />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" required value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="10-digit mobile number" />
                  </div>
                  <div className="form-group">
                    <label>Alternate Phone (Optional)</label>
                    <input type="tel" value={form.alternatePhone} onChange={e => setForm(f => ({...f, alternatePhone: e.target.value}))} placeholder="Alternate number" />
                  </div>
                </div>

                <div className="form-group single-group">
                  <label>Email Address *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="rahul@example.com" />
                </div>

                {/* House No & Street */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Flat, House No., Building *</label>
                    <input required value={form.houseNo} onChange={e => setForm(f => ({...f, houseNo: e.target.value}))} placeholder="Flat No. 402, Shivam Apts" />
                  </div>
                  <div className="form-group">
                    <label>Area, Street, Sector, Village *</label>
                    <input required value={form.street} onChange={e => setForm(f => ({...f, street: e.target.value}))} placeholder="MG Road, Sector 4" />
                  </div>
                </div>

                {/* Landmark & Pincode */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Landmark (Optional)</label>
                    <input value={form.landmark} onChange={e => setForm(f => ({...f, landmark: e.target.value}))} placeholder="Near City Bank / Temple" />
                  </div>
                  <div className="form-group">
                    <label>6-Digit PIN Code *</label>
                    <input required maxLength={6} value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value}))} placeholder="843103" />
                  </div>
                </div>

                {/* City & State */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Town / City *</label>
                    <input required value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Muzaffarpur" />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <select value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}>
                      <option value="Bihar">Bihar</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Payment Section */}
              <div className="checkout-section">
                <h2 className="cs-title">Payment Mode</h2>
                <div className="payment-methods">
                  
                  {/* COD */}
                  <label className={`payment-option ${payment === 'cod' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                    💵 Cash on Delivery (COD)
                  </label>

                  {/* UPI */}
                  <label className={`payment-option ${payment === 'upi' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="upi" checked={payment === 'upi'} onChange={() => setPayment('upi')} />
                    📱 UPI / PhonePe / GPay / Paytm
                  </label>

                </div>

                {/* UPI Scanner Display */}
                {payment === 'upi' && (
                  <div className="upi-qr-card">
                    <h4>Scan PhonePe QR Code to Pay ₹{total.toLocaleString('en-IN')}</h4>
                    <p>Open PhonePe, Google Pay, or Paytm to scan and pay</p>
                    
                    <div className="qr-img-wrap">
                      <img 
                        src={upiQrUrl} 
                        alt="PhonePe Scanner QR" 
                        onError={(e) => {
                          e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${upiId}&pn=ShopX%20Store&am=${total}`;
                        }}
                      />
                    </div>

                    <div className="upi-copy-bar">
                      <span>{upiId}</span>
                      <button type="button" onClick={copyUpiId}>Copy</button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary-card">
              <h2 className="cs-title">Order Summary</h2>
              
              <div className="order-items-list">
                {checkoutItems.map((item, i) => (
                  <div key={i} className="summary-item">
                    <img src={getImageUrl(item.product?.image || item.image)} alt={item.product?.name || item.name} onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} />
                    <div className="item-details">
                      <p className="item-name">{item.product?.name || item.name}</p>
                      <p className="item-meta">Size: {item.size} · Qty: {item.qty || item.quantity || 1}</p>
                    </div>
                    <span className="item-price">₹{((item.product?.price || item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="coupon-box">
                <input placeholder="Coupon (SHOPX20)" value={coupon} onChange={e => setCoupon(e.target.value)} />
                <button type="button" onClick={handleCoupon}>Apply</button>
              </div>
              {couponMsg && <p className="coupon-msg" style={{ color: couponApplied ? '#2ea44f' : '#ff4d4d' }}>{couponMsg}</p>}

              <div className="totals-breakdown">
                <div className="total-line"><span>Subtotal</span><span>₹{calculatedSubtotal.toLocaleString('en-IN')}</span></div>
                <div className="total-line"><span>Discount</span><span className="discount-val">-₹{discount.toLocaleString('en-IN')}</span></div>
                <div className="total-line"><span>Shipping</span><span>{shipping === 0 ? 'Free' : '₹' + shipping}</span></div>
                <div className="total-line grand-total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
              </div>

              <button type="submit" disabled={loading} className="btn-place-order">
                {loading ? 'Processing Order...' : 'Place Order →'}
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Embedded 100% Mobile Responsive Styles */}
      <style>{`
        .checkout-page-container {
          padding-top: var(--nav-h, 100px);
          padding-bottom: 80px;
          color: #fff;
        }

        .checkout-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .checkout-title {
          color: #fff;
          font-size: 1.8rem;
          margin-bottom: 24px;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
        }

        .checkout-section {
          background: var(--bg-2, #181824);
          padding: 24px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 24px;
        }

        .cs-title {
          color: #fff;
          font-size: 1.2rem;
          margin: 0 0 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 12px;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .single-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          color: #aaa;
          font-size: 0.85rem;
          margin-bottom: 6px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 14px;
          background: #111;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 0.9rem;
          box-sizing: border-box;
        }

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .payment-option {
          padding: 14px 16px;
          border-radius: 10px;
          background: #111;
          border: 1px solid #333;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .payment-option.active {
          background: rgba(226, 185, 99, 0.12);
          border-color: var(--gold, #e2b963);
        }

        .upi-qr-card {
          margin-top: 16px;
          padding: 20px;
          border-radius: 12px;
          background: #111;
          border: 1px dashed var(--gold, #e2b963);
          text-align: center;
          color: #fff;
        }

        .upi-qr-card h4 {
          margin: 0 0 8px;
          color: var(--gold, #e2b963);
        }

        .upi-qr-card p {
          margin: 0 0 16px;
          color: #aaa;
          font-size: 0.85rem;
        }

        .qr-img-wrap {
          display: inline-block;
          padding: 12px;
          background: #fff;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .qr-img-wrap img {
          width: 180px;
          height: 180px;
          object-fit: contain;
          display: block;
        }

        .upi-copy-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          max-width: 340px;
          margin: 0 auto;
        }

        .upi-copy-bar span {
          font-size: 0.85rem;
          color: #aaa;
          background: #222;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #333;
          flex: 1;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .upi-copy-bar button {
          padding: 8px 14px;
          background: var(--gold, #e2b963);
          color: #000;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .order-summary-card {
          background: var(--bg-2, #181824);
          padding: 24px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          height: fit-content;
        }

        .summary-item {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          align-items: center;
        }

        .summary-item img {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
          background: #111;
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          margin: 0;
          color: #fff;
          font-size: 0.88rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-meta {
          margin: 2px 0 0;
          color: #888;
          font-size: 0.78rem;
        }

        .item-price {
          color: var(--gold, #e2b963);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .coupon-box {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .coupon-box input {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          background: #111;
          border: 1px solid #333;
          color: #fff;
          font-size: 0.85rem;
        }

        .coupon-box button {
          padding: 8px 16px;
          background: var(--gold, #e2b963);
          color: #000;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        }

        .totals-breakdown {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 12px;
          font-size: 0.88rem;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #aaa;
        }

        .discount-val {
          color: #2ea44f;
        }

        .grand-total {
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
          color: #fff;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .grand-total span:last-child {
          color: var(--gold, #e2b963);
        }

        .btn-place-order {
          width: 100%;
          padding: 14px;
          margin-top: 20px;
          border-radius: 8px;
          background: var(--gold, #e2b963);
          color: #000;
          font-weight: bold;
          font-size: 1rem;
          border: none;
          cursor: pointer;
        }

        /* 📱 MOBILE RESPONSIVE MEDIA QUERIES (< 868px) */
        @media (max-width: 868px) {
          .checkout-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .form-grid-2 {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .checkout-section,
          .order-summary-card {
            padding: 16px;
          }

          .checkout-title {
            font-size: 1.5rem;
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
}