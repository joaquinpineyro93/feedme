import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, CheckCircle, ArrowLeft, Banknote, CreditCard, Smartphone, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PAYMENT_METHODS = ['Efectivo', 'Mercado Pago', 'Tarjeta'];

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
    address: saved.address || '',
    payment: 'Efectivo',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

  if (success) {
    return (
      <div className="app-container">
        <div className="success-screen">
          <CheckCircle size={64} strokeWidth={1.5} className="success-icon" />
          <h2 className="success-title">¡Pedido enviado!</h2>
          <p className="success-sub">Revisá tu WhatsApp para confirmar el pedido con el local.</p>
          <button
            className="btn-checkout"
            onClick={() => {
              clearCart();
              navigate('/');
            }}
          >
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  const buildWhatsAppMessage = () => {
    const lines = items.map(
      ({ product, quantity }) =>
        `- ${quantity}x ${product.name} — $${(product.price * quantity).toLocaleString('es-AR')}`
    );
    const msg = [
      '---------------------------------',
      'Hola! Quiero hacer un pedido:',
      '---------------------------------',
      '*PEDIDO:*',
      ...lines,
      '---------------------------------',
      `*Total: $${totalPrice.toLocaleString('es-AR')}*`,
      `*Direccion: ${form.address}*`,
      `*Pago: ${form.payment}*`,
      `*Nombre: ${form.name}*`,
      `*Telefono: ${form.phone}*`,
      ...(notes?.trim() ? [`*Nota: ${notes.trim()}*`] : []),
      '---------------------------------',
    ].join('\n');
    return msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Por favor completá todos los campos.');
      return;
    }
    setError('');
    setLoading(true);

    const waMessage = buildWhatsAppMessage();
    const phone = (restaurant?.phone || '').replace(/\D/g, '');
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`;

    // Save address/name/phone for next time
    saveProfile(user?.uid, { name: form.name, phone: form.phone, address: form.address });

    // Open WhatsApp
    window.open(waLink, '_blank');

    // Save order to backend
    try {
      await axios.post(`${API_URL}/api/orders`, {
        items: items.map(({ product, quantity }) => ({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
        })),
        customerName: form.name,
        customerPhone: form.phone,
        address: form.address,
        paymentMethod: form.payment,
        notes: notes?.trim() || '',
        total: totalPrice,
        whatsappSent: true,
      });
    } catch (err) {
      // Order save failure shouldn't block the user — WhatsApp already opened
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
            {items.map(({ product, quantity }) => (
              <li key={product._id} className="order-summary-item">
                <span className="order-item-qty">{quantity}x</span>
                <span className="order-item-name">{product.name}</span>
                <span className="order-item-price">
                  ${(product.price * quantity).toLocaleString('es-AR')}
                </span>
              </li>
            ))}
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
              className="form-input"
              type="text"
              placeholder="Ej: Juan García"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </label>

          <label className="form-label">
            Teléfono (WhatsApp)
            <PhoneInput
              value={form.phone}
              onChange={val => setForm(f => ({ ...f, phone: val }))}
              placeholder="98 478 604"
            />
          </label>

          <label className="form-label">
            Dirección de entrega
            <input
              className="form-input"
              type="text"
              placeholder="Ej: Av. Corrientes 1234, Piso 2"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              required
            />
          </label>
        </section>

        {/* Payment method */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">Método de pago</h2>
          <div className="payment-options">
            {PAYMENT_METHODS.map(method => (
              <label key={method} className={`payment-option ${form.payment === method ? 'payment-option--selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={form.payment === method}
                  onChange={() => setForm(f => ({ ...f, payment: method }))}
                />
                <span className="payment-icon">
                  {method === 'Efectivo' ? <Banknote size={18} /> : method === 'Mercado Pago' ? <Smartphone size={18} /> : <CreditCard size={18} />}
                </span>
                <span>{method}</span>
              </label>
            ))}
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}

        <button className="btn-whatsapp" type="submit" disabled={loading}>
          {loading ? 'Enviando...' : <><MessageCircle size={18} /> Confirmar pedido</>}
        </button>
      </form>
    </div>
  );
}
