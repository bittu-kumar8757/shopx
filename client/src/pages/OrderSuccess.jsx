import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const { state } = useLocation();
  const orderId = state?.orderId || '#SX00000';
  return (
    <div className="page active">
      <div className="success-wrap">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h1 className="success-title">Order Placed! 🎉</h1>
        <p className="success-sub">Thank you for shopping with ShopX. Your order has been confirmed and will be delivered within 3–5 business days.</p>
        <div className="success-order-id">Order ID: <strong>{orderId}</strong></div>
        <Link to="/" className="btn btn-primary">Continue Shopping →</Link>
      </div>
    </div>
  );
}
