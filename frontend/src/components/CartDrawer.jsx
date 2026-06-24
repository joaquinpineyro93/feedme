import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, addItem, removeItem, deleteItem, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`drawer-backdrop ${isOpen ? 'drawer-backdrop--visible' : ''}`}
        onClick={onClose}
      />

      <div className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`}>
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">Tu pedido</h2>
          <button className="cart-drawer-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={40} strokeWidth={1.5} className="cart-empty-icon" />
              <p>Tu carrito está vacío</p>
              <p className="cart-empty-sub">Agregá productos del menú</p>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map(({ product, quantity }) => (
                <li key={product._id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{product.name}</span>
                    <span className="cart-item-unit-price">${product.price.toLocaleString('es-AR')} c/u</span>
                  </div>
                  <div className="cart-item-right">
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => removeItem(product._id)}>−</button>
                      <span className="qty-value">{quantity}</span>
                      <button className="qty-btn qty-btn--add" onClick={() => addItem(product)}>+</button>
                    </div>
                    <span className="cart-item-subtotal">
                      ${(product.price * quantity).toLocaleString('es-AR')}
                    </span>
                    <button className="cart-item-delete" onClick={() => deleteItem(product._id)} title="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total">
              <span>Total ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              <span className="cart-total-price">${totalPrice.toLocaleString('es-AR')}</span>
            </div>
            <button className="btn-checkout" onClick={handleCheckout}>
              Ir al checkout →
            </button>
          </div>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
