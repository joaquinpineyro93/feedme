import { useState, useEffect, useRef } from 'react';
import { Pencil, X, Check, Trash2, ImagePlus, Upload, Download, Star } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api';
import { today as todayStr } from '../utils/date';

const EMPTY_PRODUCT = {
  name: '', description: '', price: '', category: '', image: '', available: true,
  isDaily: false, recurrence: 'weekly', dayOfWeek: 1, date: '', dailyActive: true,
  variants: [],
};

const EMPTY_GROUP  = { name: '', type: 'variant', required: false, options: [] };
const EMPTY_OPTION = { label: '', priceAdd: 0 };

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function ProductsPage() {
  const newProductRef  = useRef(null);
  const newCategoryRef = useRef(null);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showImport, setShowImport] = useState(false);

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

      {!loading && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn-secondary" onClick={() => newCategoryRef.current?.()}>+ Nueva categoría</button>
          <button className="btn-primary"   onClick={() => newProductRef.current?.()}>+ Nuevo producto</button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowImport(true)}>
            <Upload size={15} /> Importar Excel
          </button>
        </div>
      )}

      {loading ? <p className="loading-text">Cargando...</p> : (
        <ProductsTab
          products={products}
          setProducts={setProducts}
          categories={categories}
          setCategories={setCategories}
          newProductRef={newProductRef}
          newCategoryRef={newCategoryRef}
          showImport={showImport}
          setShowImport={setShowImport}
        />
      )}
    </div>
  );
}

// ── ProductsTab ───────────────────────────────────────────────────────────────

function ProductsTab({ products, setProducts, categories, setCategories, newProductRef, newCategoryRef, showImport, setShowImport }) {
  const [showForm, setShowForm]     = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_PRODUCT);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    newProductRef.current = () => {
      setEditingId(null);
      setForm({ ...EMPTY_PRODUCT, category: categories[0] || '', date: todayStr() });
      setFormError(''); setShowForm(true);
    };
  }, [newProductRef, categories]);

  useEffect(() => {
    newCategoryRef.current = () => setShowCatForm(true);
  }, [newCategoryRef]);

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name, description: product.description, price: product.price,
      category: product.isDaily ? 'Menú del día' : product.category, image: product.image || '', available: product.available,
      isDaily: product.isDaily || false, recurrence: product.recurrence || 'weekly',
      dayOfWeek: product.dayOfWeek ?? 1, date: product.date || todayStr(),
      dailyActive: product.dailyActive ?? true,
      variants: product.variants || [],
    });
    setFormError(''); setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const isDaily = form.category === 'Menú del día';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { setFormError('Nombre, precio y categoría son requeridos'); return; }
    setSaving(true); setFormError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        isDaily,
        variants: form.variants.map(g => ({
          ...g,
          options: g.options.map(o => ({ ...o, priceAdd: Number(o.priceAdd) || 0 })),
        })),
        ...(isDaily ? {} : { recurrence: undefined, dayOfWeek: undefined, date: undefined, dailyActive: undefined }),
      };
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

  const toggleDailyActive = async (product) => {
    try {
      const { data } = await api.patch(`/api/admin/products/${product._id}`, { dailyActive: !product.dailyActive });
      setProducts(prev => prev.map(p => p._id === product._id ? data : p));
    } catch { alert('Error al actualizar'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try { await api.delete(`/api/admin/products/${id}`); setProducts(prev => prev.filter(p => p._id !== id)); }
    catch { alert('Error al eliminar'); }
  };

  const dailyProducts   = products.filter(p => p.isDaily);
  const regularProducts = products.filter(p => !p.isDaily);
  const grouped         = categories.reduce((acc, cat) => { acc[cat] = regularProducts.filter(p => p.category === cat); return acc; }, {});
  const uncategorized   = regularProducts.filter(p => !categories.includes(p.category));

  return (
    <>
      <div className="products-main">
        {/* Menú del día */}
        {dailyProducts.length > 0 && (
          <section className="products-section">
            <h3 className="section-label">
              <Star size={13} style={{ color: '#F59E0B', marginRight: 4 }} />
              Menú del día
              <span className="cat-badge">{dailyProducts.length}</span>
            </h3>
            <div className="products-list">
              {dailyProducts.map(product => (
                <ProductRow key={product._id} product={product} onToggle={toggleAvailable} onToggleDaily={toggleDailyActive} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}

        {categories.map(cat => (
          <section key={cat} className="products-section">
            <h3 className="section-label">
              {cat}
              <span className="cat-badge">{(grouped[cat] || []).length}</span>
            </h3>
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

        {products.length === 0 && (
          <p className="empty-text">No hay productos. Creá uno o importá desde Excel.</p>
        )}
      </div>

      {/* Nueva categoría modal */}
      {showCatForm && (
        <CategoryModal
          categories={categories}
          products={products}
          setCategories={setCategories}
          onClose={() => setShowCatForm(false)}
        />
      )}

      {/* Producto modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
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
                    {!categories.includes('Menú del día') && <option value="Menú del día">Menú del día</option>}
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

              {isDaily && (
                <>
                  <div className="form-group">
                    <label className="form-label">Tipo de repetición</label>
                    <div className="recurrence-toggle">
                      <button type="button" className={`recurrence-btn ${form.recurrence === 'weekly' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, recurrence: 'weekly' }))}>
                        Recurrente (cada semana)
                      </button>
                      <button type="button" className={`recurrence-btn ${form.recurrence === 'once' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, recurrence: 'once' }))}>
                        Fecha puntual
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
                </>
              )}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                  <span className="form-label" style={{ margin: 0 }}>Activo (visible en el menú)</span>
                </label>
              </div>

              {/* Variantes */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>Variantes</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      className="form-input"
                      value=""
                      style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
                      onChange={e => {
                        const source = products.find(p => p._id === e.target.value);
                        if (!source) return;
                        const copiedGroups = (source.variants || []).map(g => ({
                          name: g.name,
                          type: g.type || 'variant',
                          required: g.required,
                          options: g.options.map(o => ({ label: o.label, priceAdd: o.priceAdd })),
                        }));
                        setForm(f => ({ ...f, variants: [...f.variants, ...copiedGroups] }));
                        e.target.value = '';
                      }}
                    >
                      <option value="" disabled>Copiar de otro producto...</option>
                      {products.filter(p => p._id !== editingId && p.variants?.length > 0).map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                    <button type="button" className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}
                      onClick={() => setForm(f => ({ ...f, variants: [...f.variants, { ...EMPTY_GROUP, options: [] }] }))}>
                      + Grupo
                    </button>
                  </div>
                </div>
                {form.variants.map((group, gi) => (
                  <div key={gi} className="variant-group-admin">
                    <div className="variant-group-admin-header">
                      <input
                        className="form-input"
                        placeholder="Nombre del grupo (ej: Relleno)"
                        value={group.name}
                        onChange={e => setForm(f => ({ ...f, variants: f.variants.map((g, i) => i === gi ? { ...g, name: e.target.value } : g) }))}
                        style={{ flex: 1 }}
                      />
                      <select
                        className="form-input"
                        value={group.type || 'variant'}
                        onChange={e => setForm(f => ({ ...f, variants: f.variants.map((g, i) => i === gi ? { ...g, type: e.target.value } : g) }))}
                        style={{ width: 110, flexShrink: 0 }}
                      >
                        <option value="variant">Variante</option>
                        <option value="extra">Extra</option>
                      </select>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, whiteSpace: 'nowrap' }}>
                        <input type="checkbox" checked={group.required}
                          onChange={e => setForm(f => ({ ...f, variants: f.variants.map((g, i) => i === gi ? { ...g, required: e.target.checked } : g) }))} />
                        {group.type === 'extra' ? 'Mínimo 1' : 'Requerido'}
                      </label>
                      <button type="button" className="btn-delete" title="Eliminar grupo"
                        onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== gi) }))}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="variant-group-admin-hint">
                      {group.type === 'extra'
                        ? 'Extra: el cliente puede sumar varias opciones a la vez (ej: agregar panceta y huevo).'
                        : 'Variante: el cliente elige una sola opción (ej: milanesa de carne o de pollo).'}
                    </p>
                    {group.options.map((opt, oi) => (
                      <div key={oi} className="variant-option-admin">
                        <input className="form-input" placeholder="Opción (ej: Muzarella)" value={opt.label}
                          onChange={e => setForm(f => ({ ...f, variants: f.variants.map((g, i) => i === gi ? { ...g, options: g.options.map((o, j) => j === oi ? { ...o, label: e.target.value } : o) } : g) }))}
                          style={{ flex: 1 }} />
                        <input className="form-input" type="number" placeholder="+$0" value={opt.priceAdd}
                          onChange={e => setForm(f => ({ ...f, variants: f.variants.map((g, i) => i === gi ? { ...g, options: g.options.map((o, j) => j === oi ? { ...o, priceAdd: e.target.value } : o) } : g) }))}
                          style={{ width: 80 }} />
                        <button type="button" className="btn-delete"
                          onClick={() => setForm(f => ({ ...f, variants: f.variants.map((g, i) => i === gi ? { ...g, options: g.options.filter((_, j) => j !== oi) } : g) }))}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn-secondary" style={{ fontSize: 12, padding: '3px 10px', marginTop: 6 }}
                      onClick={() => setForm(f => ({ ...f, variants: f.variants.map((g, i) => i === gi ? { ...g, options: [...g.options, { ...EMPTY_OPTION }] } : g) }))}>
                      + Opción
                    </button>
                  </div>
                ))}
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

      {showImport && (
        <ImportModal
          categories={categories}
          onClose={() => setShowImport(false)}
          onImported={(newProducts, newCategories) => {
        setProducts(prev => [...prev, ...newProducts]);
        if (newCategories?.length) setCategories(newCategories);
      }}
        />
      )}
    </>
  );
}

// ── CategoryModal ─────────────────────────────────────────────────────────────

function CategoryModal({ categories, products, setCategories, onClose }) {
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [catError, setCatError]     = useState('');
  const [savingCats, setSavingCats] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat && !p.isDaily);
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
    if (products.some(p => p.category === cat && !p.isDaily)) {
      setCatError(`No se puede eliminar "${cat}" porque tiene productos asignados`); return;
    }
    setCatError('');
    saveCategories(categories.filter(c => c !== cat));
  };

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Categorías</h3>

        <ul className="cat-list" style={{ marginBottom: 16 }}>
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
          {categories.length === 0 && <p className="empty-text" style={{ margin: '12px 0' }}>No hay categorías.</p>}
        </ul>

        {catError && <p className="form-error" style={{ marginBottom: 12 }}>{catError}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            className="form-input"
            placeholder="Nueva categoría..."
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={addCategory} disabled={!newCatName.trim() || savingCats}>
            {savingCats ? '...' : 'Agregar'}
          </button>
        </div>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── ProductRow ────────────────────────────────────────────────────────────────

function ProductRow({ product, onToggle, onToggleDaily, onEdit, onDelete }) {
  return (
    <div className={`product-row ${!product.available ? 'unavailable' : ''}`}>
      {product.image
        ? <img src={product.image} alt={product.name} className="product-thumb" />
        : <div className="product-thumb product-thumb--empty" />
      }
      <div className="product-info">
        <span className="product-name">
          {product.isDaily && <Star size={11} style={{ color: '#F59E0B', marginRight: 4, verticalAlign: 'middle' }} />}
          {product.name}
        </span>
        <span className="product-desc">{product.description}</span>
        <span className="product-price">${Number(product.price).toLocaleString('es-AR')}</span>
      </div>
      <div className="product-row-actions">
        {product.isDaily && onToggleDaily && (
          <button className={`btn-toggle ${product.dailyActive ? 'on' : 'off'}`} onClick={() => onToggleDaily(product)}>
            {product.dailyActive ? 'Activo' : 'Inactivo'}
          </button>
        )}
        <button className={`btn-toggle ${product.available ? 'on' : 'off'}`} onClick={() => onToggle(product)}>
          {product.available ? 'Disponible' : 'Oculto'}
        </button>
        <button className="btn-edit" onClick={() => onEdit(product)}>Editar</button>
        <button className="btn-delete" onClick={() => onDelete(product._id)} title="Eliminar"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

// ── ImportModal ───────────────────────────────────────────────────────────────

const EXCEL_COLUMNS = ['nombre', 'descripcion', 'precio', 'categoria', 'disponible', 'menu_dia', 'recurrencia', 'dia', 'fecha'];
const DAYS_MAP = { 'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6 };

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    EXCEL_COLUMNS,
    ['Milanesa', 'Con papas y ensalada', 1200, 'Platos', 'SI', 'NO', '', '', ''],
    ['Menú Lunes', 'Pollo + guarnición', 1500, 'Menú del día', 'SI', 'SI', 'weekly', 'Lunes', ''],
    ['Menú especial', 'Asado + postre', 2000, 'Menú del día', 'SI', 'SI', 'once', '', '2026-07-10'],
  ]);
  ws['!cols'] = EXCEL_COLUMNS.map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');
  XLSX.writeFile(wb, 'template_productos.xlsx');
}

function parseExcelRows(rows) {
  return rows.map((row, i) => {
    const get = (col) => {
      const val = row[col];
      return val !== undefined && val !== null ? String(val).trim() : '';
    };
    const isDaily = get('menu_dia').toLowerCase() === 'si';
    const recurrence = get('recurrencia').toLowerCase() === 'once' ? 'once' : 'weekly';
    const dayName = get('dia').toLowerCase();
    const dayOfWeek = DAYS_MAP[dayName] ?? 1;
    return {
      _rowIndex: i,
      name: get('nombre'),
      description: get('descripcion'),
      price: Number(get('precio')) || 0,
      category: get('categoria') || 'General',
      available: get('disponible').toLowerCase() !== 'no',
      isDaily,
      recurrence: isDaily ? recurrence : undefined,
      dayOfWeek: isDaily && recurrence === 'weekly' ? dayOfWeek : undefined,
      date: isDaily && recurrence === 'once' ? get('fecha') : undefined,
      dailyActive: true,
    };
  }).filter(r => r.name);
}

function ImportModal({ categories, onClose, onImported }) {
  const [preview, setPreview]         = useState(null);
  const [errors, setErrors]           = useState([]);
  const [importing, setImporting]     = useState(false);
  const [importError, setImportError] = useState('');
  const [done, setDone]               = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const parsed = parseExcelRows(rows);
        const errs = parsed
          .filter(r => !r.name || !r.price || !r.category)
          .map(r => `Fila ${r._rowIndex + 2}: falta nombre, precio o categoría`);
        setErrors(errs);
        setPreview(parsed.filter(r => r.name && r.price));
      } catch {
        setErrors(['No se pudo leer el archivo. Asegurate de usar el template.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!preview?.length) return;
    setImporting(true); setImportError('');
    try {
      const payload = preview.map(({ _rowIndex, ...p }) => p);
      const { data } = await api.post('/api/admin/products/bulk', { products: payload });
      onImported(data.products, data.categories);
      setDone(true);
    } catch (err) {
      setImportError(err.response?.data?.error || 'Error al importar');
    } finally { setImporting(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Importar productos desde Excel</h3>

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 16 }}>
              ✓ {preview.length} productos importados correctamente
            </p>
            <button className="btn-primary" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <div className="modal-form">
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={downloadTemplate}>
                <Download size={14} /> Descargar template
              </button>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => fileRef.current.click()}>
                <Upload size={14} /> Seleccionar archivo
              </button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            {errors.length > 0 && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                {errors.map((e, i) => <p key={i} style={{ color: '#DC2626', fontSize: 13 }}>{e}</p>)}
              </div>
            )}

            {preview && (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {preview.length} producto{preview.length !== 1 ? 's' : ''} encontrado{preview.length !== 1 ? 's' : ''}
                </p>
                <div style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg)', position: 'sticky', top: 0 }}>
                        {['Nombre', 'Descripción', 'Precio', 'Categoría', 'Menú del día'].map(h => (
                          <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((r, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '7px 10px' }}>{r.name}</td>
                          <td style={{ padding: '7px 10px', color: 'var(--text-secondary)' }}>{r.description}</td>
                          <td style={{ padding: '7px 10px' }}>${Number(r.price).toLocaleString('es-AR')}</td>
                          <td style={{ padding: '7px 10px' }}>{r.category}</td>
                          <td style={{ padding: '7px 10px' }}>{r.isDaily ? '★' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {importError && <p className="form-error" style={{ marginTop: 10 }}>{importError}</p>}

                <div className="modal-actions" style={{ marginTop: 16 }}>
                  <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                  <button className="btn-primary" onClick={handleImport} disabled={importing || !preview.length}>
                    {importing ? 'Importando...' : `Importar ${preview.length} producto${preview.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
