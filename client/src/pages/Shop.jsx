import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({ cat: 'all', price: 'all', sort: 'default' });

  useEffect(() => {
    fetchProducts().then(res => {
      setProducts(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cat = searchParams.get('cat') || 'all';
    const tag = searchParams.get('tag');
    const search = searchParams.get('search') || '';
    setFilters(f => ({ ...f, cat }));
    applyFiltersLogic(products, { ...filters, cat }, tag, search);
  }, [searchParams, products]);

  const applyFiltersLogic = (prods, f, tag = null, search = '') => {
    let result = [...prods];
    if (f.cat !== 'all') result = result.filter(p => p.category === f.cat);
    if (tag) result = result.filter(p => p.tag === tag);
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (f.price === 'under1000') result = result.filter(p => p.price < 1000);
    else if (f.price === '1000-2000') result = result.filter(p => p.price >= 1000 && p.price <= 2000);
    else if (f.price === 'over2000') result = result.filter(p => p.price > 2000);
    if (f.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (f.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (f.sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    setFiltered(result);
  };

  const handleFilter = (key, val) => {
    const newF = { ...filters, [key]: val };
    setFilters(newF);
    applyFiltersLogic(products, newF);
  };

  return (
    <div id="page-shop" className="page active">
      <div className="shop-header">
        <h1 className="shop-title">Our Collection</h1>
        <p className="shop-sub">Discover styles made for every moment</p>
      </div>
      <div className="shop-layout">
        {/* Sidebar */}
        <aside className={`shop-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {['cat', 'price', 'sort'].map(group => (
            <div className="filter-group" key={group}>
              <h3 className="filter-title">
                {group === 'cat' ? 'Category' : group === 'price' ? 'Price Range' : 'Sort By'}
              </h3>
              {group === 'cat' && ['all','men','women','unisex'].map(v => (
                <label key={v} className="filter-option">
                  <input type="radio" name="cat" value={v} checked={filters.cat === v} onChange={() => handleFilter('cat', v)} />
                  {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                </label>
              ))}
              {group === 'price' && [['all','All Prices'],['under1000','Under ₹1,000'],['1000-2000','₹1,000–₹2,000'],['over2000','Over ₹2,000']].map(([v, l]) => (
                <label key={v} className="filter-option">
                  <input type="radio" name="price" value={v} checked={filters.price === v} onChange={() => handleFilter('price', v)} />
                  {l}
                </label>
              ))}
              {group === 'sort' && [['default','Featured'],['price-asc','Price: Low to High'],['price-desc','Price: High to Low'],['rating','Top Rated']].map(([v, l]) => (
                <label key={v} className="filter-option">
                  <input type="radio" name="sort" value={v} checked={filters.sort === v} onChange={() => handleFilter('sort', v)} />
                  {l}
                </label>
              ))}
            </div>
          ))}
        </aside>

        {/* Products */}
        <div className="shop-main">
          <div className="shop-toolbar">
            <div className="filter-tags"></div>
            <div className="toolbar-right">
              <span className="result-count">{filtered.length} products</span>
              <button className="filter-toggle" onClick={() => setSidebarOpen(o => !o)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/></svg>
                Filters
              </button>
            </div>
          </div>
          {loading ? (
            <div className="products-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card"></div>)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-3)', fontSize: '18px' }}>
              No products found. Try a different filter.
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
