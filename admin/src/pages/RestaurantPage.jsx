import { useState, useEffect, useRef } from 'react';
import { UtensilsCrossed, MapPin, Clock } from 'lucide-react';
import api from '../api';
import OpenHoursPicker from '../components/OpenHoursPicker';
import PhoneInput from '../components/PhoneInput';

const BANKS = ['BBVA', 'BROU', 'Citi Bank', 'Itaú', 'Mi Dinero', 'Prex', 'Santander', 'Scotiabank'];

const DEFAULT_PAYMENT_METHODS = {
  cash: true,
  card: false,
  mercadoPago: { enabled: false, link: '' },
  bankTransfer: { enabled: false, bank: '', accountNumber: '' },
};

export default function RestaurantPage() {
  const [form, setForm] = useState({
    name: '', phone: '', address: '', openHours: '', description: '', logo: '',
    paymentMethods: DEFAULT_PAYMENT_METHODS,
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
          paymentMethods: {
            cash: data.paymentMethods?.cash ?? true,
            card: data.paymentMethods?.card ?? false,
            mercadoPago: {
              enabled: data.paymentMethods?.mercadoPago?.enabled ?? false,
              link:    data.paymentMethods?.mercadoPago?.link    ?? '',
            },
            bankTransfer: {
              enabled:       data.paymentMethods?.bankTransfer?.enabled       ?? false,
              bank:          data.paymentMethods?.bankTransfer?.bank          ?? '',
              accountNumber: data.paymentMethods?.bankTransfer?.accountNumber ?? '',
            },
          },
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
    const { cash, card, mercadoPago, bankTransfer } = form.paymentMethods;
    if (!cash && !card && !mercadoPago.enabled && !bankTransfer.enabled) {
      setError('Activá al menos un medio de pago');
      return;
    }
    if (mercadoPago.enabled && !mercadoPago.link.trim()) {
      setError('Ingresá el link de pago de Mercado Pago');
      return;
    }
    if (bankTransfer.enabled && (!bankTransfer.bank || !bankTransfer.accountNumber.trim())) {
      setError('Seleccioná el banco e ingresá el número de cuenta para la transferencia');
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
          </div>

          {/* Medios de pago */}
          <div className="section-card">
            <h3 className="section-card-title">Medios de pago aceptados</h3>

            <label className="payment-method-row">
              <input
                type="checkbox"
                checked={form.paymentMethods.cash}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  paymentMethods: { ...f.paymentMethods, cash: e.target.checked },
                }))}
              />
              <span>Efectivo</span>
            </label>

            <label className="payment-method-row">
              <input
                type="checkbox"
                checked={form.paymentMethods.card}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  paymentMethods: { ...f.paymentMethods, card: e.target.checked },
                }))}
              />
              <span>Tarjeta</span>
            </label>

            <label className="payment-method-row">
              <input
                type="checkbox"
                checked={form.paymentMethods.mercadoPago.enabled}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  paymentMethods: {
                    ...f.paymentMethods,
                    mercadoPago: { ...f.paymentMethods.mercadoPago, enabled: e.target.checked },
                  },
                }))}
              />
              <span>Mercado Pago</span>
            </label>

            {form.paymentMethods.mercadoPago.enabled && (
              <div className="form-group" style={{ marginTop: 4 }}>
                <label className="form-label">Link de pago de Mercado Pago</label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://mpago.la/..."
                  value={form.paymentMethods.mercadoPago.link}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    paymentMethods: {
                      ...f.paymentMethods,
                      mercadoPago: { ...f.paymentMethods.mercadoPago, link: e.target.value },
                    },
                  }))}
                />
              </div>
            )}

            <label className="payment-method-row">
              <input
                type="checkbox"
                checked={form.paymentMethods.bankTransfer.enabled}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  paymentMethods: {
                    ...f.paymentMethods,
                    bankTransfer: { ...f.paymentMethods.bankTransfer, enabled: e.target.checked },
                  },
                }))}
              />
              <span>Transferencia bancaria</span>
            </label>

            {form.paymentMethods.bankTransfer.enabled && (
              <>
                <div className="form-group" style={{ marginTop: 4 }}>
                  <label className="form-label">Entidad bancaria</label>
                  <select
                    className="form-input"
                    value={form.paymentMethods.bankTransfer.bank}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      paymentMethods: {
                        ...f.paymentMethods,
                        bankTransfer: { ...f.paymentMethods.bankTransfer, bank: e.target.value },
                      },
                    }))}
                  >
                    <option value="">Seleccioná un banco</option>
                    {BANKS.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Número de cuenta</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Ej: 000123456789"
                    value={form.paymentMethods.bankTransfer.accountNumber}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      paymentMethods: {
                        ...f.paymentMethods,
                        bankTransfer: { ...f.paymentMethods.bankTransfer, accountNumber: e.target.value },
                      },
                    }))}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Guardar */}
        <div className="restaurant-save-bar">
          {error   && <p className="form-error">{error}</p>}
          {success && <p className="form-success">Cambios guardados correctamente.</p>}

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
