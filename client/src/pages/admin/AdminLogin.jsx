import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid username or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">Shop<span style={{ color: 'var(--gold)' }}>X</span></div>
        <p className="login-subtitle">Admin Portal</p>
        <h1 className="login-title">Welcome Back 👋</h1>
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Username</label>
            <input value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} placeholder="admin" required />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="••••••••" required />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Use: <strong style={{ color: 'var(--gold)' }}>admin</strong> / <strong style={{ color: 'var(--gold)' }}>admin123</strong></p>
          {error && <p style={{ color: 'var(--rose)', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
          <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Signing in...' : 'Sign In →'}</button>
        </form>
      </div>
      <div className="login-art">
        <img src="http://localhost:5000/images/hero_banner.jpg" alt="ShopX" />
        <div className="login-art-overlay">
          <div className="art-quote">"Style is a way to say who you are without having to speak."</div>
        </div>
      </div>
    </div>
  );
}
