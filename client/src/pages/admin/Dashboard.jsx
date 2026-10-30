import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, fetchOrders } from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, delivered: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchProducts(), fetchOrders()]).then(([pRes, oRes]) => {
      const products = pRes.data.data;
      const orders = oRes.data.data;
      const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      const delivered = orders.filter(o => o.status === 'delivered').length;
      const pending = orders.filter(o => o.status === 'pending').length;
      setStats({ products: products.length, orders: orders.length, revenue, delivered, pending });
      setRecentOrders([...orders].reverse().slice(0, 5));
    }).catch(console.error);
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: '👕', color: 'var(--gold)', sub: 'Active in store' },
    { label: 'Total Orders', value: stats.orders, icon: '📋', color: 'var(--blue)', sub: `${stats.pending} pending` },
    { label: 'Total Revenue', value: '₹' + stats.revenue.toLocaleString('en-IN'), icon: '💰', color: 'var(--green)', sub: 'From all orders' },
    { label: 'Delivered', value: stats.delivered, icon: '✅', color: 'var(--purple)', sub: stats.orders ? Math.round(stats.delivered/stats.orders*100)+'% rate' : '0% rate' },
  ];

  return (
    <div>
      <div className="stats-grid">
        {cards.map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-icon" style={{ background: c.color + '20', color: c.color, width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{c.icon}</div>
            <div className="stat-info">
              <p className="stat-label">{c.label}</p>
              <p className="stat-value">{c.value}</p>
              <p className="stat-trend up">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Recent Orders</h2>
          <button className="text-btn" onClick={() => navigate('/admin/orders')}>View All →</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">No orders yet. Place an order from the store!</td></tr>
              ) : recentOrders.map(o => (
                <tr key={o.id}>
                  <td><strong style={{ color: 'var(--gold)' }}>{o.id}</strong></td>
                  <td>{o.customer}</td>
                  <td style={{ fontWeight: '700' }}>₹{(o.total || 0).toLocaleString('en-IN')}</td>
                  <td style={{ color: 'var(--text-3)', fontSize: '13px' }}>{new Date(o.date).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="quick-actions">
        <h2 className="panel-title" style={{ marginBottom: '16px' }}>Quick Actions</h2>
        <div className="qa-grid">
          {[
            { icon: '➕', label: 'Add New Product', action: () => navigate('/admin/products') },
            { icon: '📋', label: 'Manage Orders', action: () => navigate('/admin/orders') },
            { icon: '🛍️', label: 'Visit Store', action: () => window.open('/', '_blank') },
          ].map(qa => (
            <button key={qa.label} className="qa-card" onClick={qa.action}>
              <span style={{ fontSize: '28px' }}>{qa.icon}</span>
              {qa.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
