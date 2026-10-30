import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQ.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false); setSearchQ('');
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="logo">Shop<span>X</span></Link>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="nav-link" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/shop?cat=men" className="nav-link" onClick={() => setMenuOpen(false)}>Men</Link>
          <Link to="/shop?cat=women" className="nav-link" onClick={() => setMenuOpen(false)}>Women</Link>
          <Link to="/shop?cat=unisex" className="nav-link" onClick={() => setMenuOpen(false)}>Unisex</Link>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => setSearchOpen(o => !o)} aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {totalItems > 0 && <span className="cart-badge show">{totalItems}</span>}
          </Link>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </div>
      {searchOpen && (
        <div className="search-bar open">
          <input
            type="text" value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search for clothes, brands, styles... (Press Enter)"
            autoFocus
          />
          <button className="search-close" onClick={() => setSearchOpen(false)}>✕</button>
        </div>
      )}
    </header>
  );
}
