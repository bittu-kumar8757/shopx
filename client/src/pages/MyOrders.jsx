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

  // Order ID me double ## clean karne ke liye helper function
  const formatOrderId = (rawId, index) => {
    if (!rawId) return `SX${10000 + index}`;
    const cleanStr = String(rawId).replace(/#/g, '');
    return cleanStr.startsWith('SX') ? cleanStr : `SX${cleanStr}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto 80px', padding: '0 16px', minHeight: '70vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', margin: 0, color: '#fff' }}>My Orders</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>
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
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛍️</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#fff' }}>No Orders Found</h3>
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

            return (
              <div key={order.id || orderIdx} style={{
                background: 'var(--bg-2, #181824)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden'
              }}>
                {/* Order Top Strip (Order ID & Date) */}
                <div style={{
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#888' }}>Order</span>
                    <strong style={{ color: '#fff' }}>#{formattedId}</strong>
                  </div>
                  <div style={{ color: '#888', fontSize: '0.8rem' }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                  </div>
                </div>

                {/* Products List - Flipkart / Meesho Style Horizontal Item */}
                <div>
                  {items.map((item, itemIdx) => (
                    <div key={itemIdx} style={{
                      padding: '16px 20px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      borderBottom: itemIdx === items.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)'
                    }}>
                      {/* Product Thumbnail */}
                      <img 
                        src={getImageUrl(item.image)} 
                        alt={item.name}
                        style={{
                          width: '70px',
                          height: '70px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          background: '#111',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          flexShrink: 0
                        }}
                        onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }}
                      />

                      {/* Product Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          margin: '0 0 6px',
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.name || 'Product Item'}
                        </h4>
                        
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#aaa' }}>
                          {item.size && <span>Size: <strong style={{ color: '#ddd' }}>{item.size}</strong></span>}
                          <span>Qty: <strong style={{ color: '#ddd' }}>{item.quantity || item.qty || 1}</strong></span>
                        </div>
                      </div>

                      {/* Flipkart Style Delivery Status Column */}
                      <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, display: 'inline-block' }}></span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: statusColor }}>
                            {order.status || 'Processing'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>
                          Expected by <strong style={{ color: '#ddd' }}>3-5 Days</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer - Payment & Total */}
                <div style={{
                  padding: '12px 20px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.88rem'
                }}>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>
                    Payment Mode: <strong style={{ color: '#ddd', textTransform: 'uppercase' }}>{order.payment || 'Card'}</strong>
                  </span>
                  <div>
                    <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Total Amount: </span>
                    <strong style={{ color: 'var(--gold, #e2b963)', fontSize: '1.05rem', marginLeft: '4px' }}>
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
  );
}