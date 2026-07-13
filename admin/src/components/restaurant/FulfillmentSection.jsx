import { useState } from 'react';
import api from '../../api';

export default function FulfillmentSection({ restaurant, onSaved }) {
  const [fulfillmentMethods, setFulfillmentMethods] = useState({
    delivery: restaurant.fulfillmentMethods?.delivery ?? true,
    pickup:   restaurant.fulfillmentMethods?.pickup   ?? true,
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    const { delivery, pickup } = fulfillmentMethods;
    if (!delivery && !pickup) {
      setError('Activá al menos un método de envío');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const { data } = await api.patch('/api/admin/restaurant', { fulfillmentMethods });
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
    <form className="section-tab-grid" onSubmit={handleSave}>
      <div className="section-tab-col section-tab-col--wide">
        <div className="section-card">
          <h3 className="section-card-title">Métodos de envío/take away disponibles</h3>

          <label className="payment-method-row">
            <input
              type="checkbox"
              checked={fulfillmentMethods.delivery}
              onChange={(e) => setFulfillmentMethods((fm) => ({ ...fm, delivery: e.target.checked }))}
            />
            <span>Envío</span>
          </label>

          <label className="payment-method-row">
            <input
              type="checkbox"
              checked={fulfillmentMethods.pickup}
              onChange={(e) => setFulfillmentMethods((fm) => ({ ...fm, pickup: e.target.checked }))}
            />
            <span>Retiro (take away)</span>
          </label>
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
