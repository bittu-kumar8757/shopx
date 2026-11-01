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

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2, #aaa)' }}>
        <p style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '950px', margin: '40px auto 80px', padding: '0 20px', minHeight: '65vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            My Orders 📦
          </h1>
          <p style={{ color: 'var(--text-3, #777)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Track and manage your recent purchases
          </p>
        </div>
        <Link to="/shop" className="btn btn-ghost" style={{ borderRadius: '10px', fontSize: '0.85rem' }}>
          Continue Shopping →
        </Link>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛍️</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '8px' }}>No Orders Found</h3>
          <p style={{ color: 'var(--text-3, #888)', maxWidth: '400px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
            Aapne abhi tak koi order place nahi kiya hai. Explore karein hamara collection!
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '12px 28px', borderRadius: '10px' }}>
            Explore Shop
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order, i) => {
            const isDelivered = order.status === 'Delivered';
            const orderTotal = order.totalAmount || order.total || 0;
            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';

            return (
              <div key={order.id || i} style={{
                background: 'var(--bg-2, #181824)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
              }}>
                
                {/* Card Top Header */}
                <div style={{
                  padding: '16px 24px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(226, 185, 99, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      fontSize: '18px'
                    }}>
                      🛍️
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</span>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem', color: '#fff' }}>
                        #{order.id || `ORD-${String(i + 1).padStart(4, '0')}`}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>Placed On</span>
                      <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem', color: '#ddd' }}>{orderDate}</p>
                    </div>

                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '30px',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      background: isDelivered ? 'rgba(40, 167, 69, 0.15)' : 'rgba(226, 185, 99, 0.15)',
                      color: isDelivered ? '#2ea44f' : 'var(--gold, #e2b963)',
                      border: `1px solid ${isDelivered ? 'rgba(40, 167, 69, 0.3)' : 'rgba(226, 185, 99, 0.3)'}`
                    }}>
                      ● {order.status || 'Processing'}
                    </span>
                  </div>
                </div>

                {/* Delivery Tracker Bar */}
                <div style={{ padding: '16px 24px 8px', background: 'rgba(0, 0, 0, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#aaa', marginBottom: '8px' }}>
                    <span>🚚 Status: <strong style={{ color: '#fff' }}>{isDelivered ? 'Delivered' : 'In Transit'}</strong></span>
                    <span>Expected: <strong style={{ color: 'var(--gold, #e2b963)' }}>3 - 5 Days</strong></span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: isDelivered ? '100%' : '65%',
                      background: 'linear-gradient(90deg, var(--gold, #e2b963) 0%, #28a745 100%)',
                      borderRadius: '10px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                {/* Ordered Items List */}
                <div style={{ padding: '20px 24px' }}>
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 0',
                      borderBottom: idx === (order.items?.length - 1) ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{
                        width: '65px',
                        height: '65px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#111',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        flexShrink: 0
                      }}>
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: '600', color: '#fff' }}>
                          {item.name || 'Premium Product'}
                        </h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.83rem', color: '#aaa' }}>
                          {item.size && <span>Size: <strong style={{ color: '#fff' }}>{item.size}</strong></span>}
                          <span>Qty: <strong style={{ color: '#fff' }}>{item.quantity || item.qty || 1}</strong></span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '1rem', color: 'var(--gold, #e2b963)' }}>
                        ₹{((item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Total */}
                <div style={{
                  padding: '16px 24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.88rem', color: '#888' }}>
                    Payment: <strong style={{ color: '#ddd', textTransform: 'uppercase' }}>{order.payment || 'Card / Online'}</strong>
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                    Total Paid: <span style={{ color: 'var(--gold, #e2b963)', fontSize: '1.25rem', marginLeft: '6px' }}>₹{orderTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}