import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders, getImageUrl } from '../api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const localSaved = JSON.parse(localStorage.getItem('shopx-orders') || '[]');
    
    fetchOrders()
      .then(res => {
        const apiOrders = res.data?.data || res.data || [];
        const combined = [...localSaved, ...apiOrders];
        const uniqueOrders = Array.from(new Map(combined.map(o => [o.id || o.createdAt, o])).values());
        setOrders(uniqueOrders.length > 0 ? uniqueOrders : localSaved);
        setLoading(false);
      })
      .catch(() => {
        setOrders(localSaved);
        setLoading(false);
      });
  }, []);

  const formatOrderId = (rawId, index) => {
    if (!rawId) return `SX${10000 + index}`;
    const cleanStr = String(rawId).replace(/#/g, '');
    return cleanStr.startsWith('SX') ? cleanStr : `SX${cleanStr}`;
  };

  if (loading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', minHeight: '60vh' }}>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 16px 80px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, color: '#fff' }}>My Orders 📦</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#888' }}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed so far
            </p>
          </div>
          <Link to="/shop" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            Continue Shopping →
          </Link>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-2, #181824)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛍️</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#fff' }}>No Orders Yet</h3>
            <p style={{ color: '#888', marginBottom: '20px', fontSize: '0.9rem' }}>Aapne abhi tak koi order place nahi kiya hai.</p>
            <Link to="/shop" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              Explore Shop
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order, orderIdx) => {
              const formattedId = formatOrderId(order.id, orderIdx);
              const isDelivered = order.status === 'Delivered';
              const statusColor = isDelivered ? '#2ea44f' : '#e2b963';
              const orderTotal = order.totalAmount || order.total || 0;
              const items = order.items || [];
              const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';

              return (
                <div key={order.id || orderIdx} style={{
                  background: 'var(--bg-2, #181824)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                }}>
                  {/* Card Header Strip */}
                  <div style={{
                    padding: '14px 20px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    fontSize: '0.88rem'
                  }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#888', fontSize: '0.78rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ORDER NO.</span>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>#{formattedId}</strong>
                      </div>
                      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
                      <div>
                        <span style={{ color: '#888', fontSize: '0.78rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PLACED ON</span>
                        <span style={{ color: '#ddd', fontSize: '0.88rem' }}>{orderDate}</span>
                      </div>
                    </div>

                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: isDelivered ? 'rgba(46, 164, 79, 0.15)' : 'rgba(226, 185, 99, 0.15)',
                      color: statusColor,
                      border: `1px solid ${isDelivered ? 'rgba(46, 164, 79, 0.3)' : 'rgba(226, 185, 99, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }}></span>
                      {order.status || 'Processing'}
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ padding: '8px 20px' }}>
                    {items.map((item, itemIdx) => (
                      <div key={itemIdx} style={{
                        padding: '16px 0',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        borderBottom: itemIdx === items.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name}
                          style={{
                            width: '75px',
                            height: '75px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            background: '#111',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            flexShrink: 0
                          }}
                          onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{
                            margin: '0 0 6px',
                            fontSize: '0.98rem',
                            fontWeight: '600',
                            color: '#fff',
                            lineHeight: '1.4'
                          }}>
                            {item.name || 'Product Item'}
                          </h4>
                          
                          <div style={{ display: 'flex', gap: '16px', fontSize: '0.83rem', color: '#aaa', flexWrap: 'wrap' }}>
                            {item.size && <span>Size: <strong style={{ color: '#fff' }}>{item.size}</strong></span>}
                            <span>Qty: <strong style={{ color: '#fff' }}>{item.quantity || item.qty || 1}</strong></span>
                            <span>Item Price: <strong style={{ color: '#fff' }}>₹{item.price}</strong></span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.78rem', color: '#888', display: 'block', marginBottom: '2px' }}>Delivery Expectation</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--gold, #e2b963)' }}>3-5 Business Days</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div style={{
                    padding: '14px 20px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.88rem'
                  }}>
                    <span style={{ color: '#888', fontSize: '0.83rem' }}>
                      Payment: <strong style={{ color: '#ddd', textTransform: 'uppercase' }}>{order.payment || 'COD'}</strong>
                    </span>
                    <div>
                      <span style={{ color: '#aaa', fontSize: '0.88rem' }}>Total Paid: </span>
                      <strong style={{ color: 'var(--gold, #e2b963)', fontSize: '1.15rem', marginLeft: '6px' }}>
                        ₹{orderTotal.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}