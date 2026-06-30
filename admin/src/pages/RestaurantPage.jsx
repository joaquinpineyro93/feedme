import { useState, useEffect, useRef } from 'react';
import { UtensilsCrossed, MapPin, Clock } from 'lucide-react';
import api from '../api';
import OpenHoursPicker from '../components/OpenHoursPicker';
import PhoneInput from '../components/PhoneInput';

export default function RestaurantPage() {
  const [form, setForm] = useState({
    name: '', phone: '', address: '', openHours: '', description: '', logo: '',
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/api/admin/restaurant')
      .then(({ data }) => {
        setForm({
          name:        data.name        || '',
          phone:       data.phone       || '',
          address:     data.address     || '',
          openHours:   data.openHours   || '',
          description: data.description || '',
          logo:        data.logo        || '',
        });
      })
      .catch(() => setError('Error al cargar datos del restaurante'))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, logo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Nombre y teléfono son requeridos');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await api.patch('/api/admin/restaurant', form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><p className="loading-text">Cargando...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Mi local</h2>
      </div>

      <form className="restaurant-grid" onSubmit={handleSave}>

        {/* Logo */}
        <div className="restaurant-left">
          <div className="section-card">
            <h3 className="section-card-title">Logo del local</h3>
            <div className="logo-upload-area" onClick={() => fileRef.current.click()}>
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="logo-preview-img" />
              ) : (
                <div className="logo-upload-placeholder">
                  <span className="logo-upload-icon">+</span>
                  <span>Subir logo</span>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>JPG, PNG o SVG</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {form.logo && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setForm((f) => ({ ...f, logo: '' })); fileRef.current.value = ''; }}
              >
                Quitar logo
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="section-card">
            <h3 className="section-card-title">Vista previa</h3>
            <div className="restaurant-preview-card">
              {form.logo
                ? <img src={form.logo} alt="logo" className="preview-logo-img" />
                : <div className="preview-logo-placeholder"><UtensilsCrossed size={32} /></div>
              }
              <div className="preview-info">
                <strong>{form.name || 'Nombre del local'}</strong>
                {form.description && <span>{form.description}</span>}
                {form.address   && <span><MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />{form.address}</span>}
                {form.openHours && <span><Clock size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />{form.openHours}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="restaurant-right">
          <div className="section-card">
            <h3 className="section-card-title">Información</h3>

            {[
              { key: 'name',        label: 'Nombre del local', type: 'text',     placeholder: 'Ej: La Pizzería de Juan' },
              { key: 'address',     label: 'Dirección',        type: 'text',     placeholder: 'Av. Corrientes 1234' },
              { key: 'description', label: 'Descripción',      type: 'textarea', placeholder: 'Las mejores hamburguesas...' },
            ].map(({ key, label, type, placeholder }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                {type === 'textarea' ? (
                  <textarea
                    className="form-input form-textarea"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <input
                    className="form-input"
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Teléfono (WhatsApp)</label>
              <PhoneInput
                value={form.phone}
                onChange={(val) => setForm((f) => ({ ...f, phone: val }))}
                placeholder="98 478 604"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Horario de atención</label>
              <OpenHoursPicker
                value={form.openHours}
                onChange={(val) => setForm((f) => ({ ...f, openHours: val }))}
              />
            </div>

            {error   && <p className="form-error">{error}</p>}
            {success && <p className="form-success">Cambios guardados correctamente.</p>}

            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
