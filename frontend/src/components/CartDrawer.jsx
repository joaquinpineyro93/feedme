import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

function variantSummary(product, selectedVariants) {
  if (!selectedVariants || !product.variants?.length) return null;
  const parts = [];
  for (const group of product.variants) {
    if (group.type === 'extra') {
      const ids = selectedVariants[group._id] || [];
      group.options.filter(o => ids.includes(o._id)).forEach(o => parts.push(o.label));
    } else {
      const opt = group.options.find(o => o._id === selectedVariants[group._id]);
      if (opt) parts.push(opt.label);
    }
  }
  return parts.length ? parts.join(', ') : null;
}

export default function CartDrawer({ isOpen, onClose }) {
  const { items, addItem, removeItem, deleteItem, totalItems, totalPrice, notes, setNotes } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleGoToMenu = () => {
    onClose();
    navigate('/');
  };

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? 'drawer-backdrop--visible' : ''}`} onClick={onClose} />

      <div className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`}>
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">Tu pedido</h2>
          <button className="cart-drawer-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <p>Todavía no agregaste nada de la carta.</p>
              <button className="btn-dark-cta" style={{ marginTop: 20 }} onClick={handleGoToMenu}>Ver la carta</button>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map(({ key, product, quantity, selectedVariants, unitPrice }) => {
                const varStr = variantSummary(product, selectedVariants);
                return (
                  <li key={key} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">{product.name}</span>
                      {varStr && <span className="cart-item-variants">{varStr}</span>}
                      <span className="cart-item-unit-price">${unitPrice.toLocaleString('es-AR')} c/u</span>
                    </div>
                    <div className="cart-item-right">
                      <div className="quantity-controls">
                        <button className="qty-btn" onClick={() => removeItem(key)}>−</button>
                        <span className="qty-value">{quantity}</span>
                        <button className="qty-btn qty-btn--add" onClick={() => addItem(product, selectedVariants, unitPrice)}>+</button>
                      </div>
                      <span className="cart-item-subtotal">${(unitPrice * quantity).toLocaleString('es-AR')}</span>
                      <button className="cart-item-delete" onClick={() => deleteItem(key)} title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total">
              <span>Total ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              <span className="cart-total-price">${totalPrice.toLocaleString('es-AR')}</span>
            </div>
            <textarea
              className="form-input form-textarea"
              placeholder="Observaciones: ej. sin cebolla, tocar timbre 2B..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              style={{ marginBottom: 10 }}
            />
            <button className="btn-checkout" onClick={handleCheckout}>Finalizar compra</button>
          </div>
        )}
      </div>
    </>
  );
}
