import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, CheckCircle, ArrowLeft, Banknote, CreditCard, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PAYMENT_METHODS = [
  { value: 'Efectivo', label: 'Efectivo', icon: <Banknote size={18} /> },
  { value: 'Tarjeta', label: 'Tarjeta', icon: <CreditCard size={18} /> },
];

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

  const acceptingOrders = restaurant?.acceptingOrders !== false;

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
          <CheckCircle size={64} strokeWidth={1.5} className="success-icon" />
          <h2 className="success-title">¡Pedido enviado!</h2>
          <p className="success-sub">Revisá tu WhatsApp para confirmar el pedido con el local.</p>
          <button className="btn-checkout" onClick={() => { clearCart(); navigate('/'); }}>
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  const buildWhatsAppMessage = () => {
    const lines = items.map(({ product, quantity, selectedVariants, unitPrice }) => {
      const varParts = [];
      if (selectedVariants && product.variants?.length) {
        for (const g of product.variants) {
          const opt = g.options.find(o => o._id === selectedVariants[g._id]);
          if (opt) varParts.push(opt.label);
        }
      }
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
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`;

    saveProfile(user?.uid, { name: form.name, phone: form.phone, address: form.address });
    window.open(waLink, '_blank');

    try {
      const orderHeaders = restaurant?.slug ? { 'X-Tenant': restaurant.slug } : {};
      await axios.post(`${API_URL}/api/orders`, {
        items: items.map(({ product, quantity, selectedVariants, unitPrice }) => ({
          productId: product._id,
          name: product.name,
          price: unitPrice,
          quantity,
          selectedVariants: selectedVariants || undefined,
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
              const varParts = [];
              if (selectedVariants && product.variants?.length) {
                for (const g of product.variants) {
                  const opt = g.options.find(o => o._id === selectedVariants[g._id]);
                  if (opt) varParts.push(opt.label);
                }
              }
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
              placeholder="Ej: Juan García"
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
          <div className="form-label" style={{ marginBottom: 0 }}>Tipo de entrega</div>
          <div className="delivery-toggle">
            <button
              type="button"
              className={`delivery-btn ${form.deliveryType === 'envio' ? 'delivery-btn--active' : ''}`}
              onClick={() => setForm(f => ({ ...f, deliveryType: 'envio' }))}
            >
              Envío
            </button>
            <button
              type="button"
              className={`delivery-btn ${form.deliveryType === 'levantar' ? 'delivery-btn--active' : ''}`}
              onClick={() => setForm(f => ({ ...f, deliveryType: 'levantar', address: '' }))}
            >
              A levantar
            </button>
          </div>

          {form.deliveryType === 'envio' && (
            <label className="form-label">
              Dirección de entrega
              <input
                className={`form-input ${errors.address ? 'form-input--error' : ''}`}
                type="text"
                placeholder="Ej: Av. Corrientes 1234, Piso 2"
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
            {PAYMENT_METHODS.map(({ value, label, icon }) => (
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
        </section>

        <button className="btn-whatsapp" type="submit" disabled={loading}>
          {loading ? 'Enviando...' : <><MessageCircle size={18} /> Confirmar pedido</>}
        </button>
      </form>
    </div>
  );
}
