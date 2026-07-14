import { useState } from 'react';
import api from '../../api';

const BANKS = ['BBVA', 'BROU', 'Citi Bank', 'Itaú', 'Mi Dinero', 'Prex', 'Santander', 'Scotiabank'];

export default function PaymentMethodsSection({ restaurant, onSaved }) {
  const [paymentMethods, setPaymentMethods] = useState({
    cash: restaurant.paymentMethods?.cash ?? true,
    card: restaurant.paymentMethods?.card ?? false,
    mercadoPago: {
      enabled: restaurant.paymentMethods?.mercadoPago?.enabled ?? false,
      link:    restaurant.paymentMethods?.mercadoPago?.link    ?? '',
    },
    bankTransfer: {
      enabled:       restaurant.paymentMethods?.bankTransfer?.enabled       ?? false,
      bank:          restaurant.paymentMethods?.bankTransfer?.bank          ?? '',
      accountNumber: restaurant.paymentMethods?.bankTransfer?.accountNumber ?? '',
    },
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    const { cash, card, mercadoPago, bankTransfer } = paymentMethods;
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
      const { data } = await api.patch('/api/admin/restaurant', { paymentMethods });
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
          <h3 className="section-card-title">Medios de pago aceptados</h3>

          <label className="payment-method-row">
            <input
              type="checkbox"
              checked={paymentMethods.cash}
              onChange={(e) => setPaymentMethods((pm) => ({ ...pm, cash: e.target.checked }))}
            />
            <span>Efectivo</span>
          </label>

          <label className="payment-method-row">
            <input
              type="checkbox"
              checked={paymentMethods.card}
              onChange={(e) => setPaymentMethods((pm) => ({ ...pm, card: e.target.checked }))}
            />
            <span>Tarjeta</span>
          </label>

          <label className="payment-method-row payment-method-row--disabled" title="Próximamente disponible">
            <input type="checkbox" checked={false} disabled />
            <span>Mercado Pago</span>
            <span className="payment-method-soon">Próximamente</span>
          </label>

          <label className="payment-method-row">
            <input
              type="checkbox"
              checked={paymentMethods.bankTransfer.enabled}
              onChange={(e) => setPaymentMethods((pm) => ({
                ...pm,
                bankTransfer: { ...pm.bankTransfer, enabled: e.target.checked },
              }))}
            />
            <span>Transferencia bancaria</span>
          </label>

          {paymentMethods.bankTransfer.enabled && (
            <>
              <div className="form-group" style={{ marginTop: 4 }}>
                <label className="form-label">Entidad bancaria</label>
                <select
                  className="form-input"
                  value={paymentMethods.bankTransfer.bank}
                  onChange={(e) => setPaymentMethods((pm) => ({
                    ...pm,
                    bankTransfer: { ...pm.bankTransfer, bank: e.target.value },
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
                  value={paymentMethods.bankTransfer.accountNumber}
                  onChange={(e) => setPaymentMethods((pm) => ({
                    ...pm,
                    bankTransfer: { ...pm.bankTransfer, accountNumber: e.target.value },
                  }))}
                />
              </div>
            </>
          )}
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
