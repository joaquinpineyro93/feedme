import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Check, ArrowLeft, Banknote, CreditCard, Wallet, Landmark, MessageCircle, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';
import { playSuccessSound } from '../utils/sound';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DEFAULT_PAYMENT_METHODS = { cash: true, card: true, mercadoPago: { enabled: false, link: '' }, bankTransfer: { enabled: false } };

function getPaymentOptions(restaurant) {
  const pm = restaurant?.paymentMethods || DEFAULT_PAYMENT_METHODS;
  const options = [];
  if (pm.cash) options.push({ value: 'Efectivo', label: 'Efectivo', icon: <Banknote size={18} /> });
  if (pm.card) options.push({ value: 'Tarjeta', label: 'Tarjeta', icon: <CreditCard size={18} /> });
  if (pm.mercadoPago?.enabled) options.push({ value: 'Mercado Pago', label: 'Mercado Pago', icon: <Wallet size={18} />, link: pm.mercadoPago.link });
  if (pm.bankTransfer?.enabled) options.push({ value: 'Transferencia bancaria', label: 'Transferencia bancaria', icon: <Landmark size={18} /> });
  return options;
}

function getFulfillmentOptions(restaurant) {
  const fm = restaurant?.fulfillmentMethods;
  const options = [];
  if (fm?.delivery !== false) options.push({ value: 'envio', label: 'Envío' });
  if (fm?.pickup !== false) options.push({ value: 'levantar', label: 'A levantar' });
  return options;
}

function getSavedProfile(uid) {
  try {
    const key = uid ? `pedi_profile_${uid}` : 'pedi_profile_guest';
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch { return {}; }
}

function saveProfile(uid, data) {
  const key = uid ? `pedi_profile_${uid}` : 'pedi_profile_guest';
  localStorage.setItem(key, JSON.stringify(data));
}

function getVariantParts(product, selectedVariants) {
  if (!selectedVariants || !product.variants?.length) return [];
  const parts = [];
  for (const g of product.variants) {
    if (g.type === 'extra') {
      const ids = selectedVariants[g._id] || [];
      g.options.filter(o => ids.includes(o._id)).forEach(o => parts.push(o.label));
    } else {
      const opt = g.options.find(o => o._id === selectedVariants[g._id]);
      if (opt) parts.push(opt.label);
    }
  }
  return parts;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, restaurant, notes } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const saved = getSavedProfile(user?.uid);
  const [form, setForm] = useState({
    name: user?.displayName || saved.name || '',
    phone: saved.phone || '',
    deliveryType: 'envio',
    address: saved.address || '',
    payment: 'Efectivo',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const paymentOptions = getPaymentOptions(restaurant);
  const fulfillmentOptions = getFulfillmentOptions(restaurant);

  useEffect(() => {
    if (paymentOptions.length === 0) return;
    if (!paymentOptions.some(o => o.value === form.payment)) {
      setForm(f => ({ ...f, payment: paymentOptions[0].value }));
    }
  }, [restaurant]);

  useEffect(() => {
    if (fulfillmentOptions.length === 0) return;
    if (!fulfillmentOptions.some(o => o.value === form.deliveryType)) {
      const next = fulfillmentOptions[0].value;
      setForm(f => ({ ...f, deliveryType: next, address: next === 'envio' ? f.address : '' }));
    }
  }, [restaurant]);

  const acceptingOrders = restaurant?.acceptingOrders !== false;

  const isFormValid = form.name.trim() && form.phone.trim() &&
    (form.deliveryType !== 'envio' || form.address.trim());

  if (items.length === 0 && !success) {
    return (
      <div className="app-container">
        <div className="checkout-empty">
          <ShoppingCart size={40} strokeWidth={1.5} />
          <p>Tu carrito está vacío.</p>
          <button className="btn-back" onClick={() => navigate('/')}>Volver al menú</button>
        </div>
      </div>
    );
  }

  if (!acceptingOrders && !success) {
    return (
      <div className="app-container">
        <div className="checkout-empty">
          <ShoppingCart size={40} strokeWidth={1.5} />
          <p>El local no está aceptando pedidos en este momento.</p>
          <button className="btn-back" onClick={() => navigate('/')}>Volver al menú</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="app-container">
        <div className="success-screen">
          <div className="success-icon-badge"><Check size={30} /></div>
          <h2 className="success-title">¡Pedido enviado!</h2>
          <p className="success-sub">Enviado a {restaurant?.name || 'el local'}</p>
          <button className="btn-dark-cta" onClick={() => { clearCart(); navigate('/'); }}>
            Volver a la carta
          </button>
        </div>
      </div>
    );
  }

  const buildWhatsAppMessage = () => {
    const lines = items.map(({ product, quantity, selectedVariants, unitPrice }) => {
      const varParts = getVariantParts(product, selectedVariants);
      const varStr = varParts.length ? ` (${varParts.join(', ')})` : '';
      return `- ${quantity}x ${product.name}${varStr} — $${(unitPrice * quantity).toLocaleString('es-AR')}`;
    });
    const entrega = form.deliveryType === 'envio'
      ? `*Dirección:* ${form.address}`
      : `*Entrega:* A levantar`;
    const msg = [
      '---------------------------------',
      'Hola! Quiero hacer un pedido:',
      '---------------------------------',
      '*PEDIDO:*',
      ...lines,
      '---------------------------------',
      `*Total:* $${totalPrice.toLocaleString('es-AR')}`,
      entrega,
      `*Pago:* ${form.payment}`,
      `*Nombre:* ${form.name}`,
      `*Teléfono:* ${form.phone}`,
      ...(notes?.trim() ? [`*Nota:* ${notes.trim()}`] : []),
      '---------------------------------',
    ].join('\n');
    return msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Ingresá tu nombre';
    if (!form.phone.trim()) newErrors.phone = 'Ingresá tu teléfono';
    if (form.deliveryType === 'envio' && !form.address.trim()) newErrors.address = 'Ingresá la dirección de entrega';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setErrors({});
    setLoading(true);

    const waMessage = buildWhatsAppMessage();
    const phone = (restaurant?.phone || '').replace(/\D/g, '');
    const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(waMessage)}`;

    saveProfile(user?.uid, { name: form.name, phone: form.phone, address: form.address });

    if (form.payment === 'Mercado Pago') {
      const mpLink = paymentOptions.find(o => o.value === 'Mercado Pago')?.link;
      if (mpLink) window.open(mpLink, '_blank');
    }

    try {
      const orderHeaders = restaurant?.slug ? { 'X-Tenant': restaurant.slug } : {};
      await axios.post(`${API_URL}/api/orders`, {
        items: items.map(({ product, quantity, selectedVariants, unitPrice }) => ({
          productId: product._id,
          name: product.name,
          price: unitPrice,
          quantity,
          variantLabels: getVariantParts(product, selectedVariants),
        })),
        customerName: form.name,
        customerPhone: form.phone,
        address: form.deliveryType === 'envio' ? form.address : 'A levantar',
        paymentMethod: form.payment,
        notes: notes?.trim() || '',
        total: totalPrice,
        whatsappSent: true,
      }, { headers: orderHeaders });
    } catch (err) {
      console.error('Error guardando pedido:', err.message);
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(playSuccessSound, 500);
    setTimeout(() => window.open(waLink, '_blank'), 1000);
  };

  const bankTransfer = restaurant?.paymentMethods?.bankTransfer;
  const bankDetailsText = bankTransfer?.enabled
    ? `${bankTransfer.bank} - Cuenta: ${bankTransfer.accountNumber}`
    : '';

  const handleCopyBankDetails = async () => {
    try {
      await navigator.clipboard.writeText(bankDetailsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err.message);
    }
  };

  return (
    <div className="app-container">
      <div className="checkout-header">
        <button className="btn-back-icon" onClick={() => navigate('/')}><ArrowLeft size={20} /></button>
        <h1 className="checkout-title">Checkout</h1>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        {/* Order summary */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">Tu pedido</h2>
          <ul className="order-summary">
            {items.map(({ key, product, quantity, selectedVariants, unitPrice }) => {
              const varParts = getVariantParts(product, selectedVariants);
              return (
                <li key={key} className="order-summary-item">
                  <span className="order-item-qty">{quantity}x</span>
                  <span className="order-item-name">
                    {product.name}
                    {varParts.length > 0 && <span className="order-item-variants"> ({varParts.join(', ')})</span>}
                  </span>
                  <span className="order-item-price">${(unitPrice * quantity).toLocaleString('es-AR')}</span>
                </li>
              );
            })}
          </ul>
          {notes?.trim() && (
            <div className="order-notes">
              <span className="order-notes-label">Observaciones</span>
              <p className="order-notes-text">{notes.trim()}</p>
            </div>
          )}
          <div className="order-total">
            <span>Total</span>
            <span className="order-total-price">${totalPrice.toLocaleString('es-AR')}</span>
          </div>
        </section>

        {/* Customer info */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">Tus datos</h2>

          <label className="form-label">
            Nombre
            <input
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label className="form-label">
            Teléfono (WhatsApp)
            <PhoneInput
              value={form.phone}
              onChange={val => setForm(f => ({ ...f, phone: val }))}
              placeholder="98 123 456"
              hasError={!!errors.phone}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </label>

          {/* Delivery type */}
          {fulfillmentOptions.length > 1 && (
            <>
              <div className="form-label" style={{ marginBottom: 0 }}>Tipo de entrega</div>
              <div className="delivery-toggle">
                {fulfillmentOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`delivery-btn ${form.deliveryType === value ? 'delivery-btn--active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, deliveryType: value, address: value === 'envio' ? f.address : '' }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {form.deliveryType === 'envio' && (
            <label className="form-label">
              Dirección de entrega
              <input
                className={`form-input ${errors.address ? 'form-input--error' : ''}`}
                type="text"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </label>
          )}
        </section>

        {/* Payment method */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">Método de pago</h2>
          <div className="payment-options">
            {paymentOptions.map(({ value, label, icon }) => (
              <label key={value} className={`payment-option ${form.payment === value ? 'payment-option--selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={value}
                  checked={form.payment === value}
                  onChange={() => setForm(f => ({ ...f, payment: value }))}
                />
                <span className="payment-icon">{icon}</span>
                <span>{label}</span>
              </label>
            ))}
          </div>

          {form.payment === 'Transferencia bancaria' && bankTransfer?.enabled && (
            <button
              type="button"
              className="bank-details-row"
              onClick={handleCopyBankDetails}
            >
              <span className="bank-details-text">{bankDetailsText}</span>
              <Copy size={15} />
              {copied && <span className="bank-details-copied">¡Copiado!</span>}
            </button>
          )}
        </section>

        <button className="btn-whatsapp" type="submit" disabled={loading || !isFormValid}>
          {loading ? 'Enviando...' : <><MessageCircle size={18} /> Confirmar pedido</>}
        </button>
      </form>
    </div>
  );
}
