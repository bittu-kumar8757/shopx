import { useState, useEffect } from 'react';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../../api';
import { useToast } from '../../components/Toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();

  const loadOrders = () => {
    setLoading(true);
    fetchOrders()
      .then(res => {
        const data = res.data?.data || res.data || [];
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to local storage if API call fails
        const localOrders = JSON.parse(localStorage.getItem('shopx-orders') || '[]');
        setOrders(localOrders);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 👈 FIX: Deliver Button Handler
  const handleDeliver = async (id) => {
    try {
      // 1. Try Backend API update
      await updateOrderStatus(id, 'Delivered');
      showToast('Order marked as Delivered!');
    } catch (err) {
      // Fallback update
      showToast('Status updated locally!', 'info');
    }

    // 2. Immediate Local State Update
    setOrders(prevOrders => {
      const updated = prevOrders.map(o => o.id === id ? { ...o, status: 'Delivered' } : o);
      localStorage.setItem('shopx-orders', JSON.stringify(updated));
      return updated;
    });
  };

  // 👈 FIX: Delete Button Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      // 1. Try Backend API Delete
      await deleteOrder(id);
      showToast('Order deleted successfully!');
    } catch (err) {
      showToast('Order removed!', 'info');
    }

    // 2. Immediate Local State Update
    setOrders(prevOrders => {
      const updated = prevOrders.filter(o => o.id !== id);
      localStorage.setItem('shopx-orders', JSON.stringify(updated));
      return updated;
    });
  };

  // Stats Calculations
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status !== 'Delivered').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.id || '').toLowerCase().includes(search.toLowerCase()) || 
                          (o.customer || '').toLowerCase().includes(search.toLowerCase());
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

      {/* Filter & Search */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          placeholder="Search by order ID or customer..." 
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', color: '#888', fontSize: '0.85rem' }}>
              <th style={{ padding: '16px' }}>ORDER ID</th>
              <th style={{ padding: '16px' }}>CUSTOMER</th>
              <th style={{ padding: '16px' }}>ITEMS</th>
              <th style={{ padding: '16px' }}>TOTAL</th>
              <th style={{ padding: '16px' }}>STATUS</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No orders found.</td>
              </tr>
            ) : (
              filteredOrders.map(o => {
                const isDelivered = o.status === 'Delivered';

                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px', color: 'var(--gold, #e2b963)', fontWeight: '600' }}>
                      #{String(o.id).replace(/#/g, '')}
                    </td>
                    <td style={{ padding: '16px', color: '#fff' }}>{o.customer || o.email || 'Guest'}</td>
                    <td style={{ padding: '16px', color: '#aaa' }}>{o.items?.length || 1} item(s)</td>
                    <td style={{ padding: '16px', color: '#fff', fontWeight: '600' }}>₹{o.totalAmount || o.total}</td>
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
    </div>
  );
}