import { useState, useEffect, useCallback } from 'react';
import api from './api';
import OpenHoursPicker from './OpenHoursPicker';
import PhoneInput from './PhoneInput';
import './index.css';

// ---- Icons (inline SVG to avoid lucide dep) ----
const Icon = {
  Pedi: () => (
    <svg width="20" height="20" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Store: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Pencil: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Key: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Eye: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
};

// ---- Login ----
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('superadmin_token', res.data.token);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-icon">
            <Icon.Pedi />
          </div>
          <h1>Pedi Superadmin</h1>
          <p>Acceso restringido</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="superadmin"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---- Restaurant Modal (create & edit) ----
function RestaurantModal({ onClose, onSaved, restaurant }) {
  const isEdit = !!restaurant;
  const [form, setForm] = useState({
    name: restaurant?.name || '',
    slug: restaurant?.slug || '',
    phone: restaurant?.phone || '',
    address: restaurant?.address || '',
    description: restaurant?.description || '',
    openHours: restaurant?.openHours || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    let val = e.target.value;
    if (k === 'slug') val = val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setForm(f => ({ ...f, [k]: val }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    // Only auto-slug on create
    if (!isEdit) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setForm(f => ({ ...f, name, slug }));
    } else {
      setForm(f => ({ ...f, name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Nombre, slug, teléfono y dirección son requeridos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await api.patch(`/restaurants/${restaurant._id}`, form);
      } else {
        res = await api.post('/restaurants', form);
      }
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el local');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{isEdit ? 'Editar local' : 'Nuevo local'}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del local *</label>
            <input className="form-input" value={form.name} onChange={handleNameChange} placeholder="Ej: La Pizzería de Juan" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Slug (URL) *</label>
            <input className="form-input" value={form.slug} onChange={set('slug')} placeholder="la-pizzeria-de-juan" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono (WhatsApp) *</label>
            <PhoneInput
              value={form.phone}
              onChange={val => setForm(f => ({ ...f, phone: val }))}
              placeholder="98 478 604"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección *</label>
            <input className="form-input" value={form.address} onChange={set('address')} placeholder="Av. Corrientes 1234" />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input className="form-input" value={form.description} onChange={set('description')} placeholder="Las mejores pizzas de la ciudad" />
          </div>
          <div className="form-group">
            <label className="form-label">Horario</label>
            <OpenHoursPicker value={form.openHours} onChange={(val) => setForm(f => ({ ...f, openHours: val }))} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear local'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Credentials Panel ----
function CredentialsPanel({ restaurantId }) {
  const [data, setData] = useState(null);       // { username } or null
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get(`/restaurants/${restaurantId}/user`)
      .then(r => {
        setData(r.data);
        if (r.data) setForm(f => ({ ...f, username: r.data.username }));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [restaurantId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Usuario y contraseña son requeridos');
      return;
    }
    setError(''); setSuccess(''); setSaving(true);
    try {
      const res = await api.put(`/restaurants/${restaurantId}/user`, form);
      setData(res.data);
      setForm(f => ({ ...f, password: '' }));
      setSuccess(data ? 'Credenciales actualizadas' : 'Usuario creado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div className="creds-panel"><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando...</span></div>;

  return (
    <div className="creds-panel">
      <div className="creds-title">
        <Icon.Key /> Credenciales del panel admin
      </div>
      {data ? (
        <div className="creds-current">
          Usuario actual: <strong>{data.username}</strong>
        </div>
      ) : (
        <div className="creds-current creds-empty">Sin usuario asignado</div>
      )}
      <form className="creds-form" onSubmit={handleSave}>
        <div className="creds-fields">
          <div>
            <label className="form-label">Usuario</label>
            <input
              className="form-input"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Ej: admin_pizzeria"
            />
          </div>
          <div style={{ position: 'relative' }}>
            <label className="form-label">{data ? 'Nueva contraseña' : 'Contraseña'}</label>
            <input
              className="form-input"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder={data ? 'Dejar en blanco para no cambiar' : '••••••••'}
              style={{ paddingRight: 36 }}
            />
            <button type="button" className="creds-eye" onClick={() => setShowPass(v => !v)}>
              {showPass ? <Icon.EyeOff /> : <Icon.Eye />}
            </button>
          </div>
        </div>
        {error && <p className="form-error" style={{ marginTop: 6 }}>{error}</p>}
        {success && <p style={{ color: 'var(--success)', fontSize: 13, marginTop: 6 }}>{success}</p>}
        <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop: 10 }}>
          {saving ? 'Guardando...' : data ? 'Actualizar credenciales' : 'Crear usuario'}
        </button>
      </form>
    </div>
  );
}

// ---- Toggle ----
function Toggle({ checked, onChange, disabled }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

// ---- Restaurant Row ----
function RestaurantRow({ r, toggling, deleting, onToggle, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="restaurant-card">
      <div className="restaurant-row">
        <div className="restaurant-avatar">🍽</div>
        <div className="restaurant-info">
          <div className="restaurant-name">{r.name}</div>
          <div className="restaurant-meta">/{r.slug} · {r.phone} · {r.address}</div>
        </div>
        <div className="restaurant-actions">
          <span className={`badge badge--${r.active ? 'active' : 'inactive'}`}>
            {r.active ? 'Activo' : 'Inactivo'}
          </span>
          <Toggle checked={r.active} onChange={() => onToggle(r)} disabled={toggling === r._id} />
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => onEdit(r)} title="Editar local">
            <Icon.Pencil />
          </button>
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => onDelete(r)} disabled={deleting === r._id} title="Eliminar local">
            <Icon.Trash />
          </button>
          <button
            className={`btn btn-ghost creds-toggle${expanded ? ' creds-toggle--open' : ''}`}
            style={{ padding: '6px 10px' }}
            onClick={() => setExpanded(v => !v)}
            title="Credenciales admin"
          >
            <Icon.Key />
            <Icon.ChevronDown />
          </button>
        </div>
      </div>
      {expanded && <CredentialsPanel restaurantId={r._id} />}
    </div>
  );
}

// ---- Restaurants Page ----
function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await api.get('/restaurants');
      setRestaurants(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleToggle = async (r) => {
    setToggling(r._id);
    try {
      const res = await api.patch(`/restaurants/${r._id}/active`, { active: !r.active });
      setRestaurants(prev => prev.map(x => x._id === r._id ? res.data : x));
    } catch {
      alert('Error al actualizar el estado');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (r) => {
    if (!confirm(`¿Eliminar "${r.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(r._id);
    try {
      await api.delete(`/restaurants/${r._id}`);
      setRestaurants(prev => prev.filter(x => x._id !== r._id));
    } catch {
      alert('Error al eliminar el local');
    } finally {
      setDeleting(null);
    }
  };

  const active = restaurants.filter(r => r.active).length;
  const inactive = restaurants.length - active;

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{restaurants.length}</div>
          <div className="stat-label">Locales totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{active}</div>
          <div className="stat-label">Activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{inactive}</div>
          <div className="stat-label">Inactivos</div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <div className="page-title">Locales</div>
          <div className="page-sub">Gestioná todos los locales de la plataforma</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon.Plus /> Nuevo local
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <Icon.Store />
          <p>No hay locales registrados. ¡Creá el primero!</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map(r => (
            <RestaurantRow
              key={r._id}
              r={r}
              toggling={toggling}
              deleting={deleting}
              onToggle={handleToggle}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <RestaurantModal
          onClose={() => setShowModal(false)}
          onSaved={r => setRestaurants(prev => [r, ...prev])}
        />
      )}
      {editing && (
        <RestaurantModal
          restaurant={editing}
          onClose={() => setEditing(null)}
          onSaved={r => setRestaurants(prev => prev.map(x => x._id === r._id ? r : x))}
        />
      )}
    </>
  );
}

// ---- App shell ----
export default function App() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('superadmin_token'));

  const logout = () => {
    localStorage.removeItem('superadmin_token');
    setAuthed(false);
  };

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Icon.Pedi />
          </div>
          Superadmin
        </div>
        <button className="sidebar-nav-item active">
          <Icon.Store /> Locales
        </button>
        <div className="sidebar-footer">
          <button className="sidebar-nav-item" onClick={logout}>
            <Icon.LogOut /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main-content">
        <RestaurantsPage />
      </main>
    </div>
  );
}
