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
  const [payment, setPayment] = useState('cod');

  // Aapka Scanner Image & UPI ID Details
  const upiId = 'bittukumar865758@okaxis'; // 👈 Aapka UPI ID yahan change kar sakte hain
  const upiQrUrl = getImageUrl('qr_code.png'); // 👈 Public folder me scanner image link

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

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    showToast('UPI ID copied to clipboard!', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { showToast('Cart is empty!', 'error'); return; }
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
      const res = await placeOrder(orderPayload);
      const backendSavedOrder = res.data?.data || res.data || orderPayload;

      const existingOrders = JSON.parse(localStorage.getItem('shopx-orders') || '[]');
      const uniqueOrders = [backendSavedOrder, ...existingOrders.filter(o => o.id !== backendSavedOrder.id)];
      localStorage.setItem('shopx-orders', JSON.stringify(uniqueOrders));

      clearCart();
      showToast('Order placed successfully!', 'success');
      navigate('/success', { state: { orderId: backendSavedOrder.id || `SX${Date.now()}` } });
    } catch (err) {
      console.error('Order placement API failed:', err);

      const existingOrders = JSON.parse(localStorage.getItem('shopx-orders') || '[]');
      localStorage.setItem('shopx-orders', JSON.stringify([orderPayload, ...existingOrders]));

      clearCart();
      navigate('/success', { state: { orderId: orderPayload.id || `SX${Date.now()}` } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active" style={{ paddingTop: 'var(--nav-h, 100px)', paddingBottom: '80px' }}>
      <div className="checkout-wrap" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>
        <h1 className="checkout-title" style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '24px' }}>Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
            
            {/* Shipping & Address Section */}
            <div>
              <div className="checkout-section" style={{ background: 'var(--bg-2, #181824)', padding: '24px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
                <h2 className="cs-title" style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                  📍 Delivery Address
                </h2>

                {/* Name & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group"><label style={{ color: '#aaa', fontSize: '0.85rem' }}>First Name *</label><input required value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} placeholder="Rahul" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                  <div className="form-group"><label style={{ color: '#aaa', fontSize: '0.85rem' }}>Last Name</label><input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} placeholder="Sharma" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group"><label style={{ color: '#aaa', fontSize: '0.85rem' }}>Phone Number *</label><input type="tel" required value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="10-digit mobile number" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                  <div className="form-group"><label style={{ color: '#aaa', fontSize: '0.85rem' }}>Alternate Phone (Optional)</label><input type="tel" value={form.alternatePhone} onChange={e => setForm(f => ({...f, alternatePhone: e.target.value}))} placeholder="Alternate number" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Email Address *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="rahul@example.com" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                </div>

                {/* Flat / House No & Street */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group"><label style={{ color: '#aaa', fontSize: '0.85rem' }}>Flat, House No., Building *</label><input required value={form.houseNo} onChange={e => setForm(f => ({...f, houseNo: e.target.value}))} placeholder="Flat No. 402, Shivam Apts" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                  <div className="form-group"><label style={{ color: '#aaa', fontSize: '0.85rem' }}>Area, Street, Sector, Village *</label><input required value={form.street} onChange={e => setForm(f => ({...f, street: e.target.value}))} placeholder="MG Road, Sector 4" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                </div>

                {/* Landmark & Pincode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group"><label style={{ color: '#aaa', fontSize: '0.85rem' }}>Landmark (Optional)</label><input value={form.landmark} onChange={e => setForm(f => ({...f, landmark: e.target.value}))} placeholder="Near City Bank / Temple" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                  <div className="form-group"><label style={{ color: '#aaa', fontSize: '0.85rem' }}>6-Digit PIN Code *</label><input required maxLength={6} value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value}))} placeholder="843103" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                </div>

                {/* City & State */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label style={{ color: '#aaa', fontSize: '0.85rem' }}>Town / City *</label><input required value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Muzaffarpur" style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                  <div className="form-group">
                    <label style={{ color: '#aaa', fontSize: '0.85rem' }}>State *</label>
                    <select value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))} style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}>
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

              {/* Payment Section (Without Card & With UPI Scanner Box) */}
              <div className="checkout-section" style={{ background: 'var(--bg-2, #181824)', padding: '24px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 className="cs-title" style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 16px' }}>Payment Mode</h2>
                <div className="payment-methods" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* COD Option */}
                  <label style={{
                    padding: '14px 16px', borderRadius: '10px', background: payment === 'cod' ? 'rgba(226, 185, 99, 0.12)' : '#111',
                    border: `1px solid ${payment === 'cod' ? 'var(--gold, #e2b963)' : '#333'}`, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'
                  }}>
                    <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                    💵 Cash on Delivery (COD)
                  </label>

                  {/* UPI Option */}
                  <label style={{
                    padding: '14px 16px', borderRadius: '10px', background: payment === 'upi' ? 'rgba(226, 185, 99, 0.12)' : '#111',
                    border: `1px solid ${payment === 'upi' ? 'var(--gold, #e2b963)' : '#333'}`, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'
                  }}>
                    <input type="radio" name="payment" value="upi" checked={payment === 'upi'} onChange={() => setPayment('upi')} />
                    📱 UPI / PhonePe / GPay / Paytm
                  </label>

                </div>

                {/* 👈 Dynamic Scanner Box when UPI is selected */}
                {payment === 'upi' && (
                  <div style={{
                    marginTop: '16px', padding: '20px', borderRadius: '12px', background: '#111',
                    border: '1px dashed var(--gold, #e2b963)', textAlign: 'center', color: '#fff'
                  }}>
                    <h4 style={{ margin: '0 0 8px', color: 'var(--gold, #e2b963)' }}>Scan QR Code to Pay ₹{total.toLocaleString('en-IN')}</h4>
                    <p style={{ margin: '0 0 16px', color: '#aaa', fontSize: '0.85rem' }}>Open PhonePe, Google Pay, or Paytm to scan and pay</p>
                    
                    {/* QR Image Box */}
                    <div style={{ display: 'inline-block', padding: '12px', background: '#fff', borderRadius: '12px', marginBottom: '16px' }}>
                      <img 
                        src={upiQrUrl} 
                        alt="UPI Scanner QR" 
                        style={{ width: '180px', height: '180px', objectFit: 'contain', display: 'block' }}
                        onError={(e) => {
                          // Fallback QR generator if image missing
                          e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${upiId}&pn=ShopX%20Store&am=${total}`;
                        }}
                      />
                    </div>

                    {/* Copy UPI ID Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', maxWidth: '320px', margin: '0 auto' }}>
                      <span style={{ fontSize: '0.85rem', color: '#aaa', background: '#222', padding: '8px 12px', borderRadius: '6px', border: '1px solid #333', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {upiId}
                      </span>
                      <button 
                        type="button" 
                        onClick={copyUpiId}
                        style={{ padding: '8px 14px', background: 'var(--gold, #e2b963)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Order Summary Right Panel */}
            <div className="order-summary" style={{ background: 'var(--bg-2, #181824)', padding: '24px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', height: 'fit-content' }}>
              <h2 className="cs-title" style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 16px' }}>Order Summary</h2>
              
              <div className="order-items" style={{ marginBottom: '16px' }}>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                    <img src={getImageUrl(item.product?.image || item.image)} alt={item.product?.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', background: '#111' }} onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, color: '#fff', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name || item.name}</p>
                      <p style={{ margin: '2px 0 0', color: '#888', fontSize: '0.78rem' }}>Size: {item.size} · Qty: {item.qty || item.quantity || 1}</p>
                    </div>
                    <span style={{ color: 'var(--gold, #e2b963)', fontWeight: '600', fontSize: '0.9rem' }}>₹{((item.product?.price || item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input placeholder="Coupon (SHOPX20)" value={coupon} onChange={e => setCoupon(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: '#111', border: '1px solid #333', color: '#fff', fontSize: '0.85rem' }} />
                <button type="button" onClick={handleCoupon} style={{ padding: '8px 16px', background: 'var(--gold, #e2b963)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Apply</button>
              </div>
              {couponMsg && <p style={{ fontSize: '0.8rem', margin: '0 0 12px', color: couponApplied ? '#2ea44f' : '#ff4d4d' }}>{couponMsg}</p>}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#aaa' }}><span>Subtotal</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#aaa' }}><span>Discount</span><span style={{ color: '#2ea44f' }}>-₹{discount.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#aaa' }}><span>Shipping</span><span>{shipping === 0 ? 'Free' : '₹' + shipping}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}><span>Total</span><span style={{ color: 'var(--gold, #e2b963)' }}>₹{total.toLocaleString('en-IN')}</span></div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: '20px', borderRadius: '8px', background: 'var(--gold, #e2b963)', color: '#000', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
                {loading ? 'Processing Order...' : 'Place Order →'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}