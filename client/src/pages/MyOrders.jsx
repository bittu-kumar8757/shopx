import { useState, useEffect } from 'react';
import { fetchOrders, getImageUrl } from '../api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then(res => {
        setOrders(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 16px', minHeight: '60vh' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>My Orders 📦</h1>

      {loading ? (
        <p style={{ color: 'var(--text-3, #aaa)' }}>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-2, #1e1e2d)', borderRadius: '12px' }}>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>No orders found!</p>
          <p style={{ color: '#aaa' }}>Aapne abhi tak koi order place nahi kiya hai.</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{ 
            background: 'var(--bg-2, #1e1e2d)', 
            borderRadius: '12px', 
            padding: '20px', 
            marginBottom: '20px',
            border: '1px solid var(--border, #333)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>Order #{order.id}</strong>
                <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>
                  Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  background: order.status === 'Delivered' ? '#28a745' : '#ffc107', 
                  color: '#000', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontWeight: 'bold',
                  fontSize: '12px' 
                }}>
                  {order.status || 'Processing'}
                </span>
                <p style={{ fontSize: '13px', color: 'var(--gold, #e2b963)', marginTop: '6px' }}>
                  🚚 Expected Delivery: <strong>3-5 Days</strong>
                </p>
              </div>
            </div>

            {/* Ordered Products */}
            {(order.items || []).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <img 
                  src={getImageUrl(item.image)} 
                  alt={item.name} 
                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} 
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '600' }}>{item.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#aaa' }}>
                    Qty: {item.quantity || 1} × ₹{item.price}
                  </p>
                </div>
              </div>
            ))}
            
            <div style={{ borderTop: '1px solid #333', paddingTop: '12px', marginTop: '12px', textAlign: 'right' }}>
              <strong>Total Amount: <span style={{ color: 'var(--gold, #e2b963)' }}>₹{order.total || order.totalAmount}</span></strong>
            </div>
          </div>
        ))
      )}
    </div>
  );
}