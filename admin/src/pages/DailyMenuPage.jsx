import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Calendar, RefreshCw, ImagePlus } from 'lucide-react';
import api from '../api';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const EMPTY = {
  name: '', description: '', price: '', image: '',
  recurrence: 'weekly', dayOfWeek: 1, date: '', active: true,
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyMenuPage() {
  const [menus, setMenus]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const fileRef = useRef(null);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/restaurant/daily-menus');
      setMenus(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadMenus(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, date: todayStr() });
    setError('');
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditingId(m._id);
    setForm({
      name: m.name, description: m.description, price: m.price, image: m.image || '',
      recurrence: m.recurrence, dayOfWeek: m.dayOfWeek ?? 1,
      date: m.date || todayStr(), active: m.active,
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { setError('Nombre y precio son requeridos'); return; }
    setSaving(true); setError('');
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image: form.image,
      recurrence: form.recurrence,
      active: form.active,
      ...(form.recurrence === 'weekly'
        ? { dayOfWeek: Number(form.dayOfWeek) }
        : { date: form.date }),
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
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const toggleActive = async (m) => {
    try {
      const { data } = await api.patch(`/api/admin/restaurant/daily-menus/${m._id}`, { active: !m.active });
      setMenus(prev => prev.map(x => x._id === m._id ? data : x));
    } catch { alert('Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este menú del día?')) return;
    try {
      await api.delete(`/api/admin/restaurant/daily-menus/${id}`);
      setMenus(prev => prev.filter(m => m._id !== id));
    } catch { alert('Error al eliminar'); }
  };

  const labelFor = (m) => m.recurrence === 'weekly'
    ? `Todos los ${DAYS[m.dayOfWeek]}`
    : `Solo el ${m.date}`;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Menú del día</h2>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo</button>
      </div>

      {loading ? <p className="loading-text">Cargando...</p> : menus.length === 0 ? (
        <p className="empty-text">No hay menús del día configurados.</p>
      ) : (
        <div className="daily-menu-list">
          {menus.map(m => (
            <div key={m._id} className={`daily-menu-card ${!m.active ? 'daily-menu-card--inactive' : ''}`}>
              {m.image && (
                <img src={m.image} alt={m.name} className="daily-menu-card-img" />
              )}
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

              {/* Image upload */}
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

              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" placeholder="Ej: Menú del Lunes" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" placeholder="Ej: Milanesa + ensalada + postre" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Precio</label>
                <input className="form-input" type="number" placeholder="Ej: 350" value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de repetición</label>
                <div className="recurrence-toggle">
                  <button type="button"
                    className={`recurrence-btn ${form.recurrence === 'weekly' ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, recurrence: 'weekly' }))}>
                    <RefreshCw size={14} /> Recurrente (cada semana)
                  </button>
                  <button type="button"
                    className={`recurrence-btn ${form.recurrence === 'once' ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, recurrence: 'once' }))}>
                    <Calendar size={14} /> Fecha puntual
                  </button>
                </div>
              </div>

              {form.recurrence === 'weekly' ? (
                <div className="form-group">
                  <label className="form-label">Día de la semana</label>
                  <select className="form-input" value={form.dayOfWeek}
                    onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input className="form-input" type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              )}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  <span className="form-label" style={{ margin: 0 }}>Activo (visible en el menú)</span>
                </label>
              </div>

              {error && <p className="form-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
