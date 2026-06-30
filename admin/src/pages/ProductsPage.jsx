import { useState, useEffect, useRef } from 'react';
import { Pencil, X, Check, Trash2, ImagePlus } from 'lucide-react';
import api from '../api';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', image: '', available: true };

export default function ProductsPage() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const fileRef = useRef(null);

  // Category editor state
  const [newCatName, setNewCatName]       = useState('');
  const [editingCat, setEditingCat]       = useState(null); // { index, value }
  const [catError, setCatError]           = useState('');
  const [savingCats, setSavingCats]       = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, restRes] = await Promise.all([
        api.get('/api/admin/products'),
        api.get('/api/admin/restaurant'),
      ]);
      setProducts(prodRes.data);
      setCategories(restRes.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const saveCategories = async (updated) => {
    setSavingCats(true);
    setCatError('');
    try {
      await api.patch('/api/admin/restaurant/categories', { categories: updated });
      setCategories(updated);
    } catch (err) {
      setCatError(err.response?.data?.error || 'Error al guardar categorías');
    } finally {
      setSavingCats(false);
    }
  };

  const addCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    if (categories.includes(name)) { setCatError('Ya existe esa categoría'); return; }
    setCatError('');
    setNewCatName('');
    saveCategories([...categories, name]);
  };

  const renameCategory = (index) => {
    const name = editingCat.value.trim();
    if (!name) return;
    if (categories.includes(name) && categories[index] !== name) { setCatError('Ya existe esa categoría'); return; }
    setCatError('');
    const updated = categories.map((c, i) => (i === index ? name : c));
    saveCategories(updated);
    setEditingCat(null);
  };

  const deleteCategory = (cat) => {
    const inUse = products.some((p) => p.category === cat);
    if (inUse) { setCatError(`No se puede eliminar "${cat}" porque tiene productos asignados`); return; }
    setCatError('');
    saveCategories(categories.filter((c) => c !== cat));
  };

  // Product CRUD
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category: categories[0] || '' });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name, description: product.description,
      price: product.price, category: product.category,
      image: product.image, available: product.available,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      setFormError('Nombre, precio y categoría son requeridos');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        const { data } = await api.patch(`/api/admin/products/${editingId}`, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingId ? data : p)));
      } else {
        const { data } = await api.post('/api/admin/products', payload);
        setProducts((prev) => [...prev, data]);
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async (product) => {
    try {
      const { data } = await api.patch(`/api/admin/products/${product._id}`, { available: !product.available });
      setProducts((prev) => prev.map((p) => (p._id === product._id ? data : p)));
    } catch { alert('Error al actualizar'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch { alert('Error al eliminar'); }
  };

  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat);
    return acc;
  }, {});
  // Products without a known category
  const uncategorized = products.filter((p) => !categories.includes(p.category));

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <button className="btn-primary" onClick={openCreate} disabled={categories.length === 0}>
          + Nuevo producto
        </button>
      </div>

      {loading ? <p className="loading-text">Cargando...</p> : (
        <div className="products-layout">

          {/* LEFT: category editor */}
          <div className="cat-editor">
            <div className="section-card">
              <h3 className="section-card-title">Categorías</h3>

              <ul className="cat-list">
                {categories.map((cat, i) => (
                  <li key={cat} className="cat-row">
                    {editingCat?.index === i ? (
                      <input
                        className="form-input cat-rename-input"
                        value={editingCat.value}
                        autoFocus
                        onChange={(e) => setEditingCat({ index: i, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); renameCategory(i); }
                          if (e.key === 'Escape') setEditingCat(null);
                        }}
                      />
                    ) : (
                      <span className="cat-name">
                        {cat}
                        <span className="cat-count">
                          {(grouped[cat] || []).length} producto{(grouped[cat] || []).length !== 1 ? 's' : ''}
                        </span>
                      </span>
                    )}
                    <div className="cat-actions">
                      {editingCat?.index === i ? (
                        <>
                          <button className="cat-btn save" onClick={() => renameCategory(i)} disabled={savingCats}><Check size={13} /></button>
                          <button className="cat-btn cancel" onClick={() => setEditingCat(null)}><X size={13} /></button>
                        </>
                      ) : (
                        <>
                          <button className="cat-btn edit" title="Renombrar" onClick={() => setEditingCat({ index: i, value: cat })}><Pencil size={13} /></button>
                          <button className="cat-btn delete" title="Eliminar" onClick={() => deleteCategory(cat)} disabled={savingCats}><X size={13} /></button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {catError && <p className="form-error">{catError}</p>}

              <div className="cat-add-row">
                <input
                  className="form-input"
                  placeholder="Nueva categoría..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
                />
                <button
                  className="btn-primary"
                  onClick={addCategory}
                  disabled={!newCatName.trim() || savingCats}
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: products list */}
          <div className="products-main">
            {categories.map((cat) => (
              <section key={cat} className="products-section">
                <h3 className="section-label">{cat} <span className="cat-badge">{(grouped[cat] || []).length}</span></h3>
                {(grouped[cat] || []).length === 0 ? (
                  <p className="cat-empty">Sin productos en esta categoría.</p>
                ) : (
                  <div className="products-list">
                    {grouped[cat].map((product) => (
                      <ProductRow
                        key={product._id}
                        product={product}
                        onToggle={toggleAvailable}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
            {uncategorized.length > 0 && (
              <section className="products-section">
                <h3 className="section-label">Sin categoría</h3>
                <div className="products-list">
                  {uncategorized.map((product) => (
                    <ProductRow
                      key={product._id}
                      product={product}
                      onToggle={toggleAvailable}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Precio</label>
                  <input className="form-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Imagen</label>
                <div
                  className="daily-img-upload"
                  onClick={() => fileRef.current.click()}
                  style={form.image ? { backgroundImage: `url(${form.image})` } : {}}
                >
                  {!form.image && (
                    <div className="daily-img-placeholder">
                      <ImagePlus size={22} color="#9CA3AF" />
                      <span>Subir imagen</span>
                    </div>
                  )}
                  {form.image && (
                    <button
                      type="button"
                      className="daily-img-remove"
                      onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, image: '' })); }}
                    >✕</button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
              {formError && <p className="form-error">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, onToggle, onEdit, onDelete }) {
  return (
    <div className={`product-row ${!product.available ? 'unavailable' : ''}`}>
      <img src={product.image} alt={product.name} className="product-thumb" />
      <div className="product-info">
        <span className="product-name">{product.name}</span>
        <span className="product-desc">{product.description}</span>
        <span className="product-price">${product.price.toLocaleString('es-AR')}</span>
      </div>
      <div className="product-row-actions">
        <button className={`btn-toggle ${product.available ? 'on' : 'off'}`} onClick={() => onToggle(product)}>
          {product.available ? 'Activo' : 'Inactivo'}
        </button>
        <button className="btn-edit" onClick={() => onEdit(product)}>Editar</button>
        <button className="btn-delete" onClick={() => onDelete(product._id)} title="Eliminar"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
