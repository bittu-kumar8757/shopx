import { useState, useEffect } from 'react';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState(null);

  const load = () => {
    fetchOrders().then(res => {
      const data = [...res.data.data].reverse();
      setOrders(data); setFiltered(data); setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const applyFilter = (s, q) => {
    let result = [...orders];
    if (s !== 'all') result = result.filter(o => o.status === s);
    if (q) result = result.filter(o => o.id.toLowerCase().includes(q.toLowerCase()) || o.customer?.toLowerCase().includes(q.toLowerCase()));
    setFiltered(result);
  };

  const handleSearch = (q) => { setSearch(q); applyFilter(statusFilter, q); };
  const handleStatusFilter = (s) => { setStatusFilter(s); applyFilter(s, search); };

  const toggleStatus = async (order) => {
    const newStatus = order.status === 'pending' ? 'delivered' : 'pending';
    await updateOrderStatus(order.id, newStatus);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return;
    await deleteOrder(id); load();
  };

  const total = orders.length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div>
      <div className="order-stats-strip">
        <div className="ostat"><span>{total}</span><small>Total</small></div>
        <div className="ostat-div" />
        <div className="ostat pending"><span>{pending}</span><small>Pending</small></div>
        <div className="ostat-div" />
        <div className="ostat delivered"><span>{delivered}</span><small>Delivered</small></div>
        <div className="ostat-div" />
        <div className="ostat revenue"><span>₹{revenue.toLocaleString('en-IN')}</span><small>Revenue</small></div>
      </div>

      <div className="section-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search by order ID or customer..." value={search} onChange={e=>handleSearch(e.target.value)} />
        </div>
        <div className="toolbar-actions">
          <select className="filter-select" value={statusFilter} onChange={e=>handleStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">All Orders <span className="count-chip">{filtered.length}</span></h2>
        </div>
        <div className="table-wrap">
          {loading ? <p style={{ padding: '32px', color: 'var(--text-3)' }}>Loading orders...</p> : (
            <table className="data-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={8} className="empty-row">No orders yet. Place an order from the store!</td></tr>}
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td><strong style={{ color:'var(--gold)', cursor:'pointer' }} onClick={()=>setViewOrder(o)}>{o.id}</strong></td>
                    <td>{o.customer}</td>
                    <td>{o.items?.length || 0} item(s)</td>
                    <td style={{ fontWeight: '700' }}>₹{(o.total||0).toLocaleString('en-IN')}</td>
                    <td style={{ textTransform:'capitalize', color:'var(--text-2)' }}>{o.payment}</td>
                    <td style={{ color:'var(--text-3)', fontSize:'13px' }}>{new Date(o.date).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className={`toggle-delivered ${o.status}`} onClick={() => toggleStatus(o)} style={{ padding:'6px 12px', fontSize:'12px' }}>
                          {o.status === 'delivered' ? '↩ Pending' : '✓ Deliver'}
                        </button>
                        <button className="act-btn act-delete" onClick={() => handleDelete(o.id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <>
          <div className="modal-overlay open" onClick={() => setViewOrder(null)} />
          <div className="modal order-modal open">
            <div className="modal-header">
              <h2 className="modal-title">Order {viewOrder.id}</h2>
              <button className="modal-close" onClick={() => setViewOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-section">
                <h3>Customer Info</h3>
                {[['Name',viewOrder.customer],['Email',viewOrder.email||'—'],['Phone',viewOrder.phone||'—'],['Address',viewOrder.address||'—'],['City',viewOrder.city||'—']].map(([k,v])=>(
                  <div key={k} className="order-detail-row"><span>{k}</span><span>{v}</span></div>
                ))}
              </div>
              <div className="order-detail-section">
                <h3>Payment & Summary</h3>
                {[['Payment',viewOrder.payment],['Subtotal','₹'+(viewOrder.subtotal||0).toLocaleString('en-IN')],['Discount',viewOrder.discount>0?'-₹'+viewOrder.discount.toLocaleString('en-IN'):'—'],['Shipping',viewOrder.shipping===0?'Free':'₹'+viewOrder.shipping],['Total','₹'+(viewOrder.total||0).toLocaleString('en-IN')],['Date',new Date(viewOrder.date).toLocaleString('en-IN')],['Status',viewOrder.status]].map(([k,v])=>(
                  <div key={k} className="order-detail-row"><span>{k}</span><span style={k==='Total'?{color:'var(--gold)',fontWeight:'800',fontSize:'17px'}:{textTransform:'capitalize'}}>{v}</span></div>
                ))}
              </div>
              <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'16px' }}>
                <button className={`toggle-delivered ${viewOrder.status}`} onClick={()=>{toggleStatus(viewOrder);setViewOrder(null);}} style={{ padding:'10px 20px' }}>
                  {viewOrder.status==='delivered' ? 'Mark as Pending' : '✓ Mark as Delivered'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
