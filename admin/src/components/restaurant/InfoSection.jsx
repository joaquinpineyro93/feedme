import { useState } from 'react';
import api from '../../api';
import OpenHoursPicker from '../OpenHoursPicker';
import PhoneInput from '../PhoneInput';

export default function InfoSection({ restaurant, onSaved }) {
  const [form, setForm] = useState({
    name:        restaurant.name        || '',
    phone:       restaurant.phone       || '',
    address:     restaurant.address     || '',
    description: restaurant.description || '',
    openHours:   restaurant.openHours   || '',
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Nombre y teléfono son requeridos');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const { data } = await api.patch('/api/admin/restaurant', form);
      onSaved(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="section-tab-wrap" onSubmit={handleSave}>
      <div className="section-tab-col">
        <div className="section-card">
          <h3 className="section-card-title">Información básica</h3>

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
        </div>

        <div className="section-tab-save-bar">
          {error   && <p className="form-error">{error}</p>}
          {success && <p className="form-success">Cambios guardados correctamente.</p>}
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  );
}
