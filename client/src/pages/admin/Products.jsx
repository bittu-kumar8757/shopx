import { useState, useEffect } from 'react';
import { fetchProducts, addProduct, updateProduct, deleteProduct, getImageUrl } from '../../api';

const EMPTY_FORM = { 
  name:'', 
  category:'', 
  description:'', 
  price:'', 
  originalPrice:'', 
  tag:'', 
  rating:'4.5', 
  material:'', 
  fit:'', 
  sizes:'S, M, L, XL', 
  outOfStock:'', 
  image:'product_tshirt.jpg', 
  featured:false 
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    fetchProducts().then(res => {
      setProducts(res.data.data);
      setFiltered(res.data.data);
      setLoading(false);
    });
  };
  
  useEffect(() => { load(); }, []);

  const handleSearch = (q) => {
    setSearch(q);
    setFiltered(products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())));
  };

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setModal(true); };
  
  const openEdit = (p) => {
    setEditId(p.id);
    setForm({ 
      ...p, 
      sizes: (p.sizes||[]).join(', '), 
      outOfStock: (p.outOfStock||[]).join(', '), 
      originalPrice: p.originalPrice || '', 
      tag: p.tag || '' 
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    const payload = { 
      ...form, 
      sizes: form.sizes.split(',').map(s=>s.trim()).filter(Boolean), 
      outOfStock: form.outOfStock.split(',').map(s=>s.trim()).filter(Boolean), 
      price: parseFloat(form.price), 
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null, 
      rating: parseFloat(form.rating)||4.5 
    };
    
    try {
      if (editId) { 
        await updateProduct(editId, payload); 
      } else { 
        await addProduct(payload); 
      }
      setModal(false); 
      load();
    } catch (err) { 
      alert('Error saving product. Make sure server is running!'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async () => {
    await deleteProduct(deleteId); 
    setDeleteId(null); 
    load();
  };

  return (
    <div>
      <div className="section-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search products..." value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <button className="btn-add" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">All Products <span className="count-chip">{filtered.length}</span></h2>
        </div>
        <div className="table-wrap">
          {loading ? <p style={{ padding: '32px', color: 'var(--text-3)' }}>Loading...</p> : (
            <table className="data-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Tag</th><th>Rating</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="empty-row">No products found.</td></tr>}
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-product-cell">
                        <div className="table-product-img">
                          <img 
                            src={getImageUrl(p.image)} 
                            alt={p.name} 
                            onError={e => { e.target.src = getImageUrl('product_tshirt.jpg'); }} 
                          />
                        </div>
                        <div><p className="table-product-name">{p.name}</p><p className="table-product-id">#P{String(p.id).padStart(4,'0')}</p></div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                    <td style={{ fontWeight: '700', color: 'var(--gold)' }}>₹{p.price?.toLocaleString('en-IN')}{p.originalPrice && <span style={{ color:'var(--text-3)', textDecoration:'line-through', fontSize:'12px', marginLeft:'6px' }}>₹{p.originalPrice.toLocaleString('en-IN')}</span>}</td>
                    <td>{p.tag ? <span className={`badge badge-${p.tag}`}>{p.tagLabel || p.tag}</span> : <span className="badge badge-none">—</span>}</td>
                    <td><span style={{ color: 'var(--gold)' }}>★</span> {p.rating}</td>
                    <td>
                      <div className="action-btns">
                        <button className="act-btn act-edit" onClick={() => openEdit(p)} title="Edit">✏️</button>
                        <button className="act-btn act-delete" onClick={() => setDeleteId(p.id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <>
          <div className="modal-overlay open" onClick={() => setModal(false)} />
          <div className="modal open">
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group"><label>Product Name *</label><input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Classic White Tee" /></div>
                  <div className="form-group"><label>Category *</label>
                    <select required value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                      <option value="">Select</option>
                      <option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Description *</label><textarea required rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the product..." /></div>
                <div className="form-row">
                  <div className="form-group"><label>Selling Price (₹) *</label><input required type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="1299" /></div>
                  <div className="form-group"><label>Original Price (₹)</label><input type="number" value={form.originalPrice} onChange={e=>setForm(f=>({...f,originalPrice:e.target.value}))} placeholder="1999" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Tag</label>
                    <select value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))}>
                      <option value="">No Tag</option><option value="new">New</option><option value="hot">Hot</option><option value="sale">Sale</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Rating</label><input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Material</label><input value={form.material} onChange={e=>setForm(f=>({...f,material:e.target.value}))} placeholder="100% Cotton" /></div>
                  <div className="form-group"><label>Fit</label><input value={form.fit} onChange={e=>setForm(f=>({...f,fit:e.target.value}))} placeholder="Regular / Relaxed" /></div>
                </div>
                <div className="form-group"><label>Sizes (comma separated)</label><input value={form.sizes} onChange={e=>setForm(f=>({...f,sizes:e.target.value}))} placeholder="XS, S, M, L, XL, XXL" /></div>
                <div className="form-group"><label>Out of Stock Sizes</label><input value={form.outOfStock} onChange={e=>setForm(f=>({...f,outOfStock:e.target.value}))} placeholder="XS, XXL" /></div>
                
                {/* Updated Image Field */}
                <div className="form-group">
                  <label>Image URL or Filename</label>
                  <input 
                    value={form.image} 
                    onChange={e=>setForm(f=>({...f,image:e.target.value}))} 
                    placeholder="https://example.com/image.jpg or product_tshirt.jpg" 
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={()=>setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Product'}</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <>
          <div className="modal-overlay open" onClick={() => setDeleteId(null)} />
          <div className="modal delete-modal open">
            <div className="delete-icon"><span style={{ fontSize: '32px' }}>🗑️</span></div>
            <h2>Delete Product?</h2>
            <p>This will permanently remove the product from your store.</p>
            <div className="delete-actions">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-delete-confirm" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}