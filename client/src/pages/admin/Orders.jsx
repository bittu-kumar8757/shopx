import { useState, useEffect } from 'react';
import { fetchOrders, updateOrderStatus, deleteOrder, getImageUrl } from '../../api';
import { useToast } from '../../components/Toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null); // Address & Items Details Modal
  const { showToast } = useToast();

  const loadOrders = () => {
    setLoading(true);
    const localSaved = JSON.parse(localStorage.getItem('shopx-orders') || '[]');

    fetchOrders()
      .then(res => {
        const apiOrders = res.data?.data || res.data || [];
        const combined = [...apiOrders, ...localSaved];
        const uniqueOrders = Array.from(new Map(combined.map(o => [o.id || o.createdAt, o])).values());
        
        setOrders(uniqueOrders.length > 0 ? uniqueOrders : localSaved);
        setLoading(false);
      })
      .catch(() => {
        setOrders(localSaved);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDeliver = async (id) => {
    try {
      await updateOrderStatus(id, 'Delivered');
      showToast('Order marked as Delivered!');
    } catch {
      showToast('Status updated locally!', 'info');
    }

    setOrders(prevOrders => {
      const updated = prevOrders.map(o => o.id === id ? { ...o, status: 'Delivered' } : o);
      localStorage.setItem('shopx-orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await deleteOrder(id);
      showToast('Order deleted successfully!');
    } catch {
      showToast('Order removed!', 'info');
    }

    setOrders(prevOrders => {
      const updated = prevOrders.filter(o => o.id !== id);
      localStorage.setItem('shopx-orders', JSON.stringify(updated));
      return updated;
    });
  };

  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status !== 'Delivered').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = String(o.id || '').toLowerCase().includes(search.toLowerCase()) || 
                          String(o.customer || o.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          String(o.city || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'pending' && o.status !== 'Delivered') || 
                          (statusFilter === 'delivered' && o.status === 'Delivered');
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div style={{ padding: '40px', color: '#aaa', textAlign: 'center' }}>Loading Admin Orders...</div>;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#fff' }}>Orders</h1>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.9rem' }}>ShopX Control Panel</p>
      </div>

      {/* Stats Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ background: '#181824', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{totalCount}</h3>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>Total</span>
        </div>
        <div style={{ background: '#181824', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--gold, #e2b963)' }}>{pendingCount}</h3>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>Pending</span>
        </div>
        <div style={{ background: '#181824', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#2ea44f' }}>{deliveredCount}</h3>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>Delivered</span>
        </div>
        <div style={{ background: '#181824', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--gold, #e2b963)' }}>₹{totalRevenue.toLocaleString('en-IN')}</h3>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>Revenue</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          placeholder="Search by order ID, customer, city..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', background: '#181824', border: '1px solid #333', color: '#fff' }}
        />
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', background: '#181824', border: '1px solid #333', color: '#fff' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div style={{ background: '#181824', borderRadius: '12px', border: '1px solid #333', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', color: '#888', fontSize: '0.85rem' }}>
              <th style={{ padding: '16px' }}>ORDER ID</th>
              <th style={{ padding: '16px' }}>CUSTOMER</th>
              <th style={{ padding: '16px' }}>ADDRESS</th>
              <th style={{ padding: '16px' }}>ORDERED PRODUCT</th>
              <th style={{ padding: '16px' }}>TOTAL</th>
              <th style={{ padding: '16px' }}>STATUS</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No orders found.</td>
              </tr>
            ) : (
              filteredOrders.map((o, idx) => {
                const isDelivered = o.status === 'Delivered';
                const orderId = String(o.id || `SX${10000 + idx}`).replace(/#/g, '');
                const fullAddress = `${o.address || 'N/A'}, ${o.city || ''} ${o.pincode ? '- ' + o.pincode : ''}`;
                const items = o.items || [];
                const firstItem = items[0] || {};

                return (
                  <tr key={o.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px', color: 'var(--gold, #e2b963)', fontWeight: '600' }}>
                      #{orderId}
                    </td>
                    
                    {/* Customer */}
                    <td style={{ padding: '16px', color: '#fff' }}>
                      <div><strong>{o.customer || 'Guest'}</strong></div>
                      <div style={{ fontSize: '0.78rem', color: '#888' }}>{o.phone || o.email || ''}</div>
                    </td>
                    
                    {/* Address */}
                    <td style={{ padding: '16px', color: '#ddd', fontSize: '0.85rem', maxWidth: '180px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={fullAddress}>
                        📍 {fullAddress}
                      </div>
                    </td>

                    {/* 👈 PRODUCT DETAILS COLUMN (IMAGE + NAME + SIZE + QTY) */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {firstItem.image && (
                          <img 
                            src={getImageUrl(firstItem.image)} 
                            alt={firstItem.name}
                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', background: '#111' }}
                            onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }}
                          />
                        )}
                        <div>
                          <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '500', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {firstItem.name || 'Product'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>
                            Size: {firstItem.size || 'M'} | Qty: {firstItem.quantity || firstItem.qty || 1}
                            {items.length > 1 && <span style={{ color: 'var(--gold, #e2b963)', marginLeft: '4px' }}>+{items.length - 1} more</span>}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedOrder(o)}
                        style={{ background: 'none', border: 'none', color: 'var(--gold, #e2b963)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, marginTop: '4px' }}
                      >
                        🔍 View Full Order Details
                      </button>
                    </td>

                    <td style={{ padding: '16px', color: '#fff', fontWeight: '600' }}>₹{o.totalAmount || o.total || 0}</td>
                    
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700',
                        background: isDelivered ? 'rgba(46, 164, 79, 0.2)' : 'rgba(226, 185, 99, 0.2)',
                        color: isDelivered ? '#2ea44f' : 'var(--gold, #e2b963)'
                      }}>
                        {isDelivered ? 'DELIVERED' : 'PENDING'}
                      </span>
                    </td>

                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!isDelivered && (
                          <button 
                            onClick={() => handleDeliver(o.id)}
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: '6px', 
                              background: 'transparent', 
                              border: '1px solid #2ea44f', 
                              color: '#2ea44f', 
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            ✓ Deliver
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(o.id)}
                          style={{ 
                            padding: '6px 10px', 
                            borderRadius: '6px', 
                            background: 'rgba(255, 0, 0, 0.1)', 
                            border: '1px solid #ff4d4d', 
                            color: '#ff4d4d', 
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Full Order & Product Details Modal Popup */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div style={{ background: '#181824', borderRadius: '16px', border: '1px solid #444', width: '100%', maxWidth: '520px', padding: '24px', color: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
              📦 Order Details (#{String(selectedOrder.id).replace(/#/g, '')})
            </h3>
            
            <div style={{ marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ margin: '4px 0' }}><strong>Customer:</strong> {selectedOrder.customer || 'Guest'}</p>
              <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {selectedOrder.phone || 'N/A'}</p>
              <p style={{ margin: '4px 0' }}><strong>Email:</strong> {selectedOrder.email || 'N/A'}</p>
              <p style={{ margin: '4px 0' }}><strong>Address:</strong> {selectedOrder.address || 'N/A'}, {selectedOrder.city || ''} - {selectedOrder.pincode || ''}</p>
              <p style={{ margin: '4px 0' }}><strong>Payment Mode:</strong> {(selectedOrder.payment || 'COD').toUpperCase()}</p>
            </div>

            <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '12px', color: 'var(--gold, #e2b963)' }}>
              Ordered Items:
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {(selectedOrder.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', alignItems: 'center' }}>
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name} 
                    style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', background: '#111' }}
                    onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name || 'Product'}</div>
                    <div style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '2px' }}>
                      Size: <strong style={{ color: '#fff' }}>{item.size || 'M'}</strong> | Qty: <strong style={{ color: '#fff' }}>{item.quantity || item.qty || 1}</strong>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--gold, #e2b963)' }}>
                    ₹{item.price}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '12px', marginBottom: '16px' }}>
              <span>Total Paid Amount:</span>
              <strong style={{ fontSize: '1.1rem', color: '#2ea44f' }}>₹{selectedOrder.totalAmount || selectedOrder.total || 0}</strong>
            </div>
            
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--gold, #e2b963)',
                color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer'
              }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}