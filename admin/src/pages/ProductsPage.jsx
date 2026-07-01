import { useState, useEffect, useRef } from 'react';
import { Pencil, X, Check, Trash2, ImagePlus, Plus, Calendar, RefreshCw } from 'lucide-react';
import api from '../api';

const EMPTY_PRODUCT = { name: '', description: '', price: '', category: '', image: '', available: true };

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const EMPTY_DAILY = { name: '', description: '', price: '', image: '', recurrence: 'weekly', dayOfWeek: 1, date: '', active: true };
function todayStr() { return new Date().toISOString().slice(0, 10); }

const TABS = ['Categorías', 'Productos', 'Menú del día'];

export default function ProductsPage() {
  const [tab, setTab] = useState('Categorías');

  // ── shared data ──────────────────────────────────────────
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, restRes] = await Promise.all([
        api.get('/api/admin/products'),
        api.get('/api/admin/restaurant'),
      ]);
      setProducts(prodRes.data);
      setCategories(restRes.data.categories || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
      </div>

      <div className="page-tabs">
        {TABS.map(t => (
          <button key={t} className={`page-tab${tab === t ? ' page-tab--active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <p className="loading-text">Cargando...</p> : (
        <>
          {tab === 'Categorías' && (
            <CategoriesTab
              categories={categories}
              products={products}
              setCategories={setCategories}
            />
          )}
          {tab === 'Menú del día' && <DailyMenuTab />}
          {tab === 'Productos' && (
            <ProductsTab
              products={products}
              setProducts={setProducts}
              categories={categories}
            />
          )}
        </>
      )}
    </div>
  );
}

// ── TAB: Categorías ───────────────────────────────────────────────────────────

function CategoriesTab({ categories, products, setCategories }) {
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [catError, setCatError]     = useState('');
  const [savingCats, setSavingCats] = useState(false);

  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat);
    return acc;
  }, {});

  const saveCategories = async (updated) => {
    setSavingCats(true); setCatError('');
    try {
      await api.patch('/api/admin/restaurant/categories', { categories: updated });
      setCategories(updated);
    } catch (err) {
      setCatError(err.response?.data?.error || 'Error al guardar categorías');
    } finally { setSavingCats(false); }
  };

  const addCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    if (categories.includes(name)) { setCatError('Ya existe esa categoría'); return; }
    setCatError(''); setNewCatName('');
    saveCategories([...categories, name]);
  };

  const renameCategory = (index) => {
    const name = editingCat.value.trim();
    if (!name) return;
    if (categories.includes(name) && categories[index] !== name) { setCatError('Ya existe esa categoría'); return; }
    setCatError('');
    saveCategories(categories.map((c, i) => i === index ? name : c));
    setEditingCat(null);
  };

  const deleteCategory = (cat) => {
    if (products.some(p => p.category === cat)) { setCatError(`No se puede eliminar "${cat}" porque tiene productos asignados`); return; }
    setCatError('');
    saveCategories(categories.filter(c => c !== cat));
  };

  return (
    <div className="section-card" style={{ maxWidth: 480 }}>
      <h3 className="section-card-title">Categorías</h3>
      <ul className="cat-list">
        {categories.map((cat, i) => (
          <li key={cat} className="cat-row">
            {editingCat?.index === i ? (
              <input
                className="form-input cat-rename-input"
                value={editingCat.value}
                autoFocus
                onChange={e => setEditingCat({ index: i, value: e.target.value })}
                onKeyDown={e => {
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
          onChange={e => setNewCatName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
        />
        <button className="btn-primary" onClick={addCategory} disabled={!newCatName.trim() || savingCats}>
          Agregar
        </button>
      </div>
    </div>
  );
}

// ── TAB: Menú del día ─────────────────────────────────────────────────────────

function DailyMenuTab() {
  const [menus, setMenus]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_DAILY);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const fileRef = useRef(null);

  const loadMenus = async () => {
    setLoading(true);
    try { const { data } = await api.get('/api/admin/restaurant/daily-menus'); setMenus(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadMenus(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const openCreate = () => { setEditingId(null); setForm({ ...EMPTY_DAILY, date: todayStr() }); setError(''); setShowForm(true); };
  const openEdit = (m) => {
    setEditingId(m._id);
    setForm({ name: m.name, description: m.description, price: m.price, image: m.image || '', recurrence: m.recurrence, dayOfWeek: m.dayOfWeek ?? 1, date: m.date || todayStr(), active: m.active });
    setError(''); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { setError('Nombre y precio son requeridos'); return; }
    setSaving(true); setError('');
    const payload = {
      name: form.name.trim(), description: form.description.trim(),
      price: Number(form.price), image: form.image,
      recurrence: form.recurrence, active: form.active,
      ...(form.recurrence === 'weekly' ? { dayOfWeek: Number(form.dayOfWeek) } : { date: form.date }),
    };
    try {
      if (editingId) {
        const { data } = await api.patch(`/api/admin/restaurant/daily-menus/${editingId}`, payload);
        setMenus(prev => prev.map(m => m._id === editingId ? data : m));
      } else {
        const { data } = await api.post('/api/admin/restaurant/daily-menus', payload);
        setMenus(prev => [...prev, data]);
      }
      setShowForm(false);
    } catch (e) { setError(e.response?.data?.error || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (m) => {
    try {
      const { data } = await api.patch(`/api/admin/restaurant/daily-menus/${m._id}`, { active: !m.active });
      setMenus(prev => prev.map(x => x._id === m._id ? data : x));
    } catch { alert('Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este menú del día?')) return;
    try { await api.delete(`/api/admin/restaurant/daily-menus/${id}`); setMenus(prev => prev.filter(m => m._id !== id)); }
    catch { alert('Error al eliminar'); }
  };

  const labelFor = (m) => m.recurrence === 'weekly' ? `Todos los ${DAYS[m.dayOfWeek]}` : `Solo el ${m.date}`;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo</button>
      </div>

      {loading ? <p className="loading-text">Cargando...</p> : menus.length === 0 ? (
        <p className="empty-text">No hay menús del día configurados.</p>
      ) : (
        <div className="daily-menu-list">
          {menus.map(m => (
            <div key={m._id} className={`daily-menu-card ${!m.active ? 'daily-menu-card--inactive' : ''}`}>
              {m.image && <img src={m.image} alt={m.name} className="daily-menu-card-img" />}
              <div className="daily-menu-card-body">
                <div className="daily-menu-card-header">
                  <div className="daily-menu-info">
                    <span className="daily-menu-name">{m.name}</span>
                    <span className={`daily-menu-recurrence ${m.recurrence === 'weekly' ? 'weekly' : 'once'}`}>
                      {m.recurrence === 'weekly' ? <RefreshCw size={11} /> : <Calendar size={11} />}
                      {labelFor(m)}
                    </span>
                  </div>
                  <span className="daily-menu-price">${Number(m.price).toLocaleString('es-AR')}</span>
                </div>
                {m.description && <p className="daily-menu-desc">{m.description}</p>}
                <div className="daily-menu-actions">
                  <button className={`btn-toggle ${m.active ? 'on' : 'off'}`} onClick={() => toggleActive(m)}>
                    {m.active ? 'Activo' : 'Inactivo'}
                  </button>
                  <button className="btn-edit" onClick={() => openEdit(m)}><Pencil size={14} /></button>
                  <button className="btn-delete" onClick={() => handleDelete(m._id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editingId ? 'Editar menú del día' : 'Nuevo menú del día'}</h3>
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Imagen</label>
                <div className="daily-img-upload" onClick={() => fileRef.current.click()}
                  style={form.image ? { backgroundImage: `url(${form.image})` } : {}}>
                  {!form.image && <div className="daily-img-placeholder"><ImagePlus size={22} color="#9CA3AF" /><span>Subir imagen</span></div>}
                  {form.image && <button type="button" className="daily-img-remove" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, image: '' })); }}>✕</button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" placeholder="Ej: Menú del Lunes" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" placeholder="Ej: Milanesa + ensalada + postre" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Precio</label>
                <input className="form-input" type="number" placeholder="Ej: 350" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de repetición</label>
                <div className="recurrence-toggle">
                  <button type="button" className={`recurrence-btn ${form.recurrence === 'weekly' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, recurrence: 'weekly' }))}>
                    <RefreshCw size={14} /> Recurrente (cada semana)
                  </button>
                  <button type="button" className={`recurrence-btn ${form.recurrence === 'once' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, recurrence: 'once' }))}>
                    <Calendar size={14} /> Fecha puntual
                  </button>
                </div>
              </div>
              {form.recurrence === 'weekly' ? (
                <div className="form-group">
                  <label className="form-label">Día de la semana</label>
                  <select className="form-input" value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              )}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  <span className="form-label" style={{ margin: 0 }}>Activo (visible en el menú)</span>
                </label>
              </div>
              {error && <p className="form-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── TAB: Productos ────────────────────────────────────────────────────────────

function ProductsTab({ products, setProducts, categories }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_PRODUCT);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const openCreate = () => { setEditingId(null); setForm({ ...EMPTY_PRODUCT, category: categories[0] || '' }); setFormError(''); setShowForm(true); };
  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({ name: product.name, description: product.description, price: product.price, category: product.category, image: product.image, available: product.available });
    setFormError(''); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { setFormError('Nombre, precio y categoría son requeridos'); return; }
    setSaving(true); setFormError('');
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        const { data } = await api.patch(`/api/admin/products/${editingId}`, payload);
        setProducts(prev => prev.map(p => p._id === editingId ? data : p));
      } else {
        const { data } = await api.post('/api/admin/products', payload);
        setProducts(prev => [...prev, data]);
      }
      setShowForm(false);
    } catch (err) { setFormError(err.response?.data?.error || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const toggleAvailable = async (product) => {
    try {
      const { data } = await api.patch(`/api/admin/products/${product._id}`, { available: !product.available });
      setProducts(prev => prev.map(p => p._id === product._id ? data : p));
    } catch { alert('Error al actualizar'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try { await api.delete(`/api/admin/products/${id}`); setProducts(prev => prev.filter(p => p._id !== id)); }
    catch { alert('Error al eliminar'); }
  };

  const grouped = categories.reduce((acc, cat) => { acc[cat] = products.filter(p => p.category === cat); return acc; }, {});
  const uncategorized = products.filter(p => !categories.includes(p.category));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn-primary" onClick={openCreate} disabled={categories.length === 0}>
          + Nuevo producto
        </button>
      </div>

      <div className="products-main">
        {categories.map(cat => (
          <section key={cat} className="products-section">
            <h3 className="section-label">{cat} <span className="cat-badge">{(grouped[cat] || []).length}</span></h3>
            {(grouped[cat] || []).length === 0 ? (
              <p className="cat-empty">Sin productos en esta categoría.</p>
            ) : (
              <div className="products-list">
                {grouped[cat].map(product => (
                  <ProductRow key={product._id} product={product} onToggle={toggleAvailable} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </section>
        ))}
        {uncategorized.length > 0 && (
          <section className="products-section">
            <h3 className="section-label">Sin categoría</h3>
            <div className="products-list">
              {uncategorized.map(product => (
                <ProductRow key={product._id} product={product} onToggle={toggleAvailable} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Precio</label>
                  <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Imagen</label>
                <div className="daily-img-upload" onClick={() => fileRef.current.click()}
                  style={form.image ? { backgroundImage: `url(${form.image})` } : {}}>
                  {!form.image && <div className="daily-img-placeholder"><ImagePlus size={22} color="#9CA3AF" /><span>Subir imagen</span></div>}
                  {form.image && <button type="button" className="daily-img-remove" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, image: '' })); }}>✕</button>}
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
    </>
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
