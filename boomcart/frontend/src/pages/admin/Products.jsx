import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import { getAdminProducts, createProduct, updateProduct, deleteProduct, toggleProductStatus } from '../../services/productService';
import Loader from '../../components/common/Loader';
import { AdminNav } from './Dashboard';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import './Admin.css';

const CATS    = ['men','women','bridal','boys','girls','unisex'];
const SUBCATS = ['shirts','pants','kurta','saree','lehenga','dress','jeans','jacket','suit','sherwani','tops','skirts','ethnic','western','accessories'];
const SIZES   = ['XS','S','M','L','XL','XXL','XXXL','Free Size'];
const EMPTY   = { name:'', description:'', price:'', discountPrice:'', category:'men', subCategory:'shirts', sizes:[], colors:'', stock:'', tags:'', isFeatured:false };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [files, setFiles]       = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const fileRef = useRef();
  const videoRef = useRef();

  const load = () => {
    setLoading(true);
    getAdminProducts().then(({ data }) => setProducts(data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setFiles([]); setPreviews([]); setVideoFile(null); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name:p.name, description:p.description, price:p.price, discountPrice:p.discountPrice||'', category:p.category, subCategory:p.subCategory, sizes:p.sizes||[], colors:(p.colors||[]).join(', '), stock:p.stock, tags:(p.tags||[]).join(', '), isFeatured:p.isFeatured||false });
    setFiles([]); setPreviews(p.images.map(i=>i.url)); setVideoFile(null); setShowModal(true);
  };

  const handleFiles = (e) => {
    const f = Array.from(e.target.files);
    setFiles(f);
    setPreviews(f.map(fi => URL.createObjectURL(fi)));
  };

  const toggleSize = (s) => setForm(prev => ({ ...prev, sizes: prev.sizes.includes(s) ? prev.sizes.filter(x=>x!==s) : [...prev.sizes, s] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && files.length === 0) { toast.error('Please upload at least one image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => {
        if (k === 'sizes') fd.append(k, JSON.stringify(v));
        else if (k === 'colors') fd.append(k, JSON.stringify(v.split(',').map(s=>s.trim()).filter(Boolean)));
        else if (k === 'tags')   fd.append(k, JSON.stringify(v.split(',').map(s=>s.trim()).filter(Boolean)));
        else fd.append(k, v);
      });
      files.forEach(f => fd.append('images', f));
      if (videoFile) fd.append('video', videoFile);
      if (editing) { await updateProduct(editing._id, fd); toast.success('Product updated!'); }
      else         { await createProduct(fd); toast.success('Product created!'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id, isActive) => {
    try { await toggleProductStatus(id); toast.success(isActive ? 'Product deactivated' : 'Product activated'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await deleteProduct(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  /* Filtered products */
  const filtered = products.filter(p => 
    !search || 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase()) || 
    p.subCategory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      <Helmet><title>Products — Admin | Boomcart</title></Helmet>
      <AdminNav />

      <main className="flex-1 min-w-0 overflow-x-hidden bg-[#FAF7F2]">
        <div className="px-12 py-10">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif text-[#123026]">Products</h2>
            <button 
              className="inline-flex items-center gap-2 bg-[#123026] text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-[#0d221b] hover:shadow-lg transition-all duration-200 font-semibold text-sm" 
              onClick={openAdd}
            >
              <FiPlus size={16} /> Add Product
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-80 pl-4 pr-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 shadow-sm transition-all"
                value={search} onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <span className="text-sm text-stone-400 font-medium">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {/* Products Table */}
          {loading ? <Loader /> : (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-100">
                      <th className="py-4 pl-8 pr-6 text-xs font-bold uppercase tracking-wider text-stone-500">Image</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Name</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Category</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Price</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Stock</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Status</th>
                      <th className="py-4 pr-8 pl-6 text-xs font-bold uppercase tracking-wider text-stone-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-400 text-sm">No products found.</td>
                      </tr>
                    ) : (
                      filtered.map(p => (
                        <tr key={p._id} className="hover:bg-stone-50 transition-colors duration-100">
                          {/* Image */}
                          <td className="py-5 pl-8 pr-6">
                            <img src={p.images[0]?.url} alt={p.name} className="w-12 h-14 object-cover rounded-lg shadow-sm border border-stone-100" />
                          </td>

                          {/* Name */}
                          <td className="py-5 px-6" style={{ maxWidth: 220 }}>
                            <p className="font-medium text-[#123026] text-sm truncate">{p.name}</p>
                            <p className="text-xs text-stone-400 uppercase tracking-wide mt-0.5">{p.subCategory}</p>
                          </td>

                          {/* Category */}
                          <td className="py-5 px-6">
                            <span className="inline-flex text-xs uppercase px-2.5 py-1 bg-stone-100 text-stone-600 font-semibold rounded-full tracking-wide">
                              {p.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-5 px-6">
                            <p className="font-bold text-[#123026] text-sm">₹{(p.discountPrice || p.price).toLocaleString()}</p>
                            {p.discountPrice > 0 && <p className="text-xs text-stone-400 line-through mt-0.5">₹{p.price.toLocaleString()}</p>}
                          </td>

                          {/* Stock */}
                          <td className="py-5 px-6">
                            <span className={`text-sm font-bold ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.stock}</span>
                          </td>

                          {/* Status */}
                          <td className="py-5 px-6">
                            <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-semibold ${
                              p.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                            }`}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-5 pr-8 pl-6 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              <button 
                                className="p-2 rounded-lg text-stone-400 hover:text-[#D4AF37] hover:bg-stone-50 transition-all" 
                                onClick={() => openEdit(p)} 
                                title="Edit"
                              >
                                <FiEdit2 size={15} />
                              </button>
                              <button 
                                className={`text-xs font-semibold px-3 py-1.5 border rounded-lg transition-all ${
                                  p.isActive 
                                    ? 'border-stone-200 text-stone-500 hover:bg-stone-50 hover:border-stone-300' 
                                    : 'bg-[#123026] text-white hover:bg-[#0d221b] border-transparent'
                                }`}
                                onClick={() => handleToggle(p._id, p.isActive)} 
                                title={p.isActive ? 'Hide Product' : 'Show Product'}
                              >
                                {p.isActive ? 'Hide' : 'Show'}
                              </button>
                              <button 
                                className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all" 
                                onClick={() => handleDelete(p._id, p.name)} 
                                title="Delete"
                              >
                                <FiTrash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Add/Edit Product Modal ────────────────────── */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-box" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editing ? 'Edit Product' : 'Add New Product'}</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}><FiX size={18} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="admin-form-grid">
                    {/* Name */}
                    <div className="form-group full">
                      <label>Product Name *</label>
                      <input className="form-input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required />
                    </div>

                    {/* Description */}
                    <div className="form-group full">
                      <label>Description *</label>
                      <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} required />
                    </div>

                    {/* Price */}
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input type="number" className="form-input" value={form.price} onChange={e => setForm({...form,price:e.target.value})} required min="0" />
                    </div>

                    {/* Discount Price */}
                    <div className="form-group">
                      <label>Discount Price (₹)</label>
                      <input type="number" className="form-input" value={form.discountPrice} onChange={e => setForm({...form,discountPrice:e.target.value})} min="0" />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                      <label>Category *</label>
                      <select className="form-input" value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                        {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                      </select>
                    </div>

                    {/* Sub-Category */}
                    <div className="form-group">
                      <label>Sub-Category *</label>
                      <select className="form-input" value={form.subCategory} onChange={e => setForm({...form,subCategory:e.target.value})}>
                        {SUBCATS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                      </select>
                    </div>

                    {/* Stock */}
                    <div className="form-group">
                      <label>Stock *</label>
                      <input type="number" className="form-input" value={form.stock} onChange={e => setForm({...form,stock:e.target.value})} required min="0" />
                    </div>

                    {/* Colors */}
                    <div className="form-group">
                      <label>Colors (comma-separated)</label>
                      <input className="form-input" placeholder="#ff0000, #00ff00" value={form.colors} onChange={e => setForm({...form,colors:e.target.value})} />
                    </div>

                    {/* Tags */}
                    <div className="form-group">
                      <label>Tags (comma-separated)</label>
                      <input className="form-input" placeholder="cotton, festive, sale" value={form.tags} onChange={e => setForm({...form,tags:e.target.value})} />
                    </div>

                    {/* Featured */}
                    <div className="form-group">
                      <label className="sr-only">Featured</label>
                      <label htmlFor="feat" className="flex items-center gap-2.5 cursor-pointer pt-5">
                        <input 
                          type="checkbox" 
                          id="feat" 
                          checked={form.isFeatured} 
                          onChange={e => setForm({...form,isFeatured:e.target.checked})} 
                          className="w-4 h-4 accent-[#123026] cursor-pointer"
                        />
                        <span className="text-sm font-medium text-stone-600">Mark as Featured</span>
                      </label>
                    </div>

                    {/* Sizes */}
                    <div className="form-group full">
                      <label>Sizes</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {SIZES.map(s => (
                          <button 
                            key={s} 
                            type="button" 
                            className={`size-btn ${form.sizes.includes(s) ? 'active' : ''}`}
                            onClick={() => toggleSize(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="form-group full">
                      <label>Product Images {editing ? '(upload to replace)' : '*'}</label>
                      <div className="upload-zone" onClick={() => fileRef.current.click()}>
                        <FiUpload size={24} className="mx-auto mb-2 text-stone-400" />
                        <p className="text-sm text-stone-500">Click to upload images (max 5, JPG/PNG/WebP)</p>
                        <p className="text-xs text-stone-400 mt-1">Max 5 MB each</p>
                        <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} />
                      </div>
                      {previews.length > 0 && (
                        <div className="img-preview-grid">
                          {previews.map((src, i) => <img key={i} src={src} alt={`Preview ${i+1}`} className="img-preview" />)}
                        </div>
                      )}
                    </div>

                    {/* Video Upload */}
                    <div className="form-group full">
                      <label>Product Video (optional — max 50 MB)</label>
                      <div className="upload-zone" onClick={() => videoRef.current.click()} style={{ padding: '20px 24px' }}>
                        <p className="text-sm text-stone-500">🎥 Click to upload a product video (MP4, MOV)</p>
                        {videoFile && <p className="text-sm text-green-600 mt-2 font-semibold">✅ {videoFile.name}</p>}
                        <input ref={videoRef} type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0] || null)} />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-stone-100">
                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
