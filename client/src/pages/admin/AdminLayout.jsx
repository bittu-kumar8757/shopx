import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin'); };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '👕' },
    { path: '/admin/orders', label: 'Orders', icon: '📋' },
  ];

  return (
    <div className="admin-panel" style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">Shop<span>X</span></div>
        <p className="sidebar-role">Admin Dashboard</p>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {!collapsed && item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">A</div>
            {!collapsed && <div><p className="admin-name">Admin</p><p className="admin-email">admin@shopx.in</p></div>}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      <div className="admin-main" style={{ marginLeft: collapsed ? '72px' : 'var(--sidebar-w)' }}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <h1 className="topbar-title">
                {navItems.find(n => n.path === location.pathname)?.label || 'Admin'}
              </h1>
              <p className="topbar-sub">ShopX Control Panel</p>
            </div>
          </div>
          <div className="topbar-right">
            <Link to="/" target="_blank" className="view-store-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View Store
            </Link>
          </div>
        </header>
        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
