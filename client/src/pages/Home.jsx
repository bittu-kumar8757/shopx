import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';
import { getImageUrl } from '../api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then(res => {
      setProducts(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const featured = products.filter(p => p.featured);

  return (
    <div id="page-home" className="page active">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <img src={getImageUrl('hero_banner.jpg')} alt="ShopX Fashion" className="hero-img" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <p className="hero-tag">New Collection 2026</p>
          <h1 className="hero-title">Wear Your<br /><em>True Story</em></h1>
          <p className="hero-sub">Curated premium fashion for those who set the trend — not follow it.</p>
          <div className="hero-btns">
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            <Link to="/shop?tag=new" className="btn btn-ghost">New Arrivals</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="stat"><span className="stat-num">2.4K+</span><span className="stat-label">Products</span></div>
        <div className="stat-divider"></div>
        <div className="stat"><span className="stat-num">98%</span><span className="stat-label">Satisfaction</span></div>
        <div className="stat-divider"></div>
        <div className="stat"><span className="stat-num">Free</span><span className="stat-label">Shipping ₹999+</span></div>
        <div className="stat-divider"></div>
        <div className="stat"><span className="stat-num">Easy</span><span className="stat-label">Returns</span></div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="section-header">
          <div><h2 className="section-title">Shop by Category</h2><p className="section-sub">Find your perfect style</p></div>
        </div>
        <div className="categories-grid">
          {[
            { label: 'Men', cat: 'men', img: 'product_tshirt.jpg' },
            { label: 'Women', cat: 'women', img: 'product_sweater.jpg' },
            { label: 'Unisex', cat: 'unisex', img: 'product_hoodie.jpg' },
          ].map(c => (
            <Link to={`/shop?cat=${c.cat}`} key={c.cat} className="category-card">
              <div className="cat-img-wrap"><img src={getImageUrl(c.img)} alt={c.label} /></div>
              <div className="cat-info"><h3>{c.label}</h3><p>Explore →</p></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured-section">
        <div className="section-header">
          <div><h2 className="section-title">Trending Now</h2></div>
        </div>
        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton-card"></div>)}
          </div>
        ) : (
          <>
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            
            {/* Direct inline layout for center button using existing btn class */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
              <Link to="/shop" className="btn btn-primary">
                View All Products →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="promo-content">
          <p className="promo-tag">Limited Time Offer</p>
          <h2>Get 20% Off Your<br />First Order</h2>
          <p>Use code <strong>SHOPX20</strong> at checkout</p>
          <Link to="/shop" className="btn btn-primary">Shop the Sale</Link>
        </div>
        <div className="promo-visual">
          <img src={getImageUrl('product_jacket.jpg')} alt="Promo" />
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <h2>Stay in the Loop</h2>
        <p>Get early access to new drops, exclusive deals, and style tips.</p>
        <form className="newsletter-form" onSubmit={e => { e.preventDefault(); alert('Subscribed! 🎉'); }}>
          <input type="email" placeholder="Enter your email address" required />
          <button type="submit" className="btn btn-primary">Subscribe</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="logo footer-logo">Shop<span>X</span></Link>
            <p>Premium fashion for the modern soul.</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop?cat=men">Men</Link>
            <Link to="/shop?cat=women">Women</Link>
            <Link to="/shop?cat=unisex">Unisex</Link>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <a href="#">Size Guide</a>
            <a href="#">Track Order</a>
            <a href="#">Returns</a>
          </div>
          <div className="footer-col">
            <h4>Admin</h4>
            <Link to="/admin">Admin Panel</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 ShopX. All rights reserved. Made with ♥ in India.</p>
        </div>
      </footer>
    </div>
  );
}