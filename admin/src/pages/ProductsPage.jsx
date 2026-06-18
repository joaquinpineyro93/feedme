import { useState, useEffect } from 'react';
import api from '../api';

const CATEGORIES = ['Burgers', 'Acompañamientos', 'Bebidas', 'Postres'];
const EMPTY_FORM = { name: '', description: '', price: '', category: 'Burgers', image: '', available: true };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      available: product.available,
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      setError('Nombre, precio y categoría son requeridos');
      return;
    }
    setSaving(true);
    setError('');
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
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async (product) => {
    try {
      const { data } = await api.patch(`/api/admin/products/${product._id}`, { available: !product.available });
      setProducts((prev) => prev.map((p) => (p._id === product._id ? data : p)));
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <button className="btn-primary" onClick={openCreate}>+ Nuevo producto</button>
      </div>

      {loading ? (
        <p className="loading-text">Cargando productos...</p>
      ) : (
        CATEGORIES.map((cat) =>
          grouped[cat].length > 0 ? (
            <section key={cat} className="products-section">
              <h3 className="section-label">{cat}</h3>
              <div className="products-list">
                {grouped[cat].map((product) => (
                  <div key={product._id} className={`product-row ${!product.available ? 'unavailable' : ''}`}>
                    <img src={product.image} alt={product.name} className="product-thumb" />
                    <div className="product-info">
                      <span className="product-name">{product.name}</span>
                      <span className="product-desc">{product.description}</span>
                      <span className="product-price">${product.price.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="product-row-actions">
                      <button
                        className={`btn-toggle ${product.available ? 'on' : 'off'}`}
                        onClick={() => toggleAvailable(product)}
                      >
                        {product.available ? 'Activo' : 'Inactivo'}
                      </button>
                      <button className="btn-edit" onClick={() => openEdit(product)}>Editar</button>
                      <button className="btn-delete" onClick={() => handleDelete(product._id)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null
        )
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
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">URL de imagen</label>
                <input className="form-input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
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
    </div>
  );
}
