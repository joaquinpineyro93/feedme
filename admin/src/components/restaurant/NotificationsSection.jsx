import { useState } from 'react';
import api from '../../api';
import {
  isDesktopNotificationSupported,
  isDesktopNotificationEnabled,
  enableDesktopNotifications,
  disableDesktopNotifications,
} from '../../utils/desktopNotifications';

export default function NotificationsSection({ restaurant, onSaved }) {
  const [notifications, setNotifications] = useState({
    whatsappOrders: restaurant.notifications?.whatsappOrders ?? false,
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const desktopSupported = isDesktopNotificationSupported();
  const [desktopEnabled, setDesktopEnabled] = useState(isDesktopNotificationEnabled());
  const [desktopError, setDesktopError]     = useState('');

  const handleDesktopToggle = async (e) => {
    const checked = e.target.checked;
    setDesktopError('');
    if (!checked) {
      disableDesktopNotifications();
      setDesktopEnabled(false);
      return;
    }
    const result = await enableDesktopNotifications();
    if (result.ok) {
      setDesktopEnabled(true);
    } else {
      setDesktopEnabled(false);
      setDesktopError(
        result.reason === 'denied'
          ? 'Bloqueaste las notificaciones para este sitio. Habilitalas desde la configuración del navegador.'
          : 'Tu navegador no soporta notificaciones de escritorio.'
      );
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await api.patch('/api/admin/restaurant', { notifications });
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
          <h3 className="section-card-title">Notificaciones - Cliente</h3>

          <label className="payment-method-row">
            <input
              type="checkbox"
              checked={notifications.whatsappOrders}
              onChange={(e) => setNotifications((n) => ({ ...n, whatsappOrders: e.target.checked }))}
            />
            <span>Recibir pedidos por WhatsApp</span>
          </label>
        </div>

        <div className="section-card">
          <h3 className="section-card-title">Notificaciones - Admin</h3>

          <label className={`payment-method-row ${!desktopSupported ? 'payment-method-row--disabled' : ''}`}>
            <input
              type="checkbox"
              checked={desktopEnabled}
              disabled={!desktopSupported}
              onChange={handleDesktopToggle}
            />
            <span>Avisarme en este navegador cuando llegue un pedido nuevo</span>
          </label>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            Esta preferencia es solo para este dispositivo y navegador. Requiere mantener el panel de Pedidos abierto.
          </p>
          {desktopError && <p className="form-error">{desktopError}</p>}
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
