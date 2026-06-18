import React from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { items, addItem, removeItem } = useCart();
  const cartItem = items.find(i => i.product._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
      </div>
      <div className="product-info">
        <div>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
        </div>
        <div className="product-footer">
          <span className="product-price">${product.price.toLocaleString('es-AR')}</span>
          {quantity === 0 ? (
            <button className="btn-add" onClick={() => addItem(product)}>
              + Agregar
            </button>
          ) : (
            <div className="quantity-controls">
              <button className="qty-btn" onClick={() => removeItem(product._id)}>−</button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-btn qty-btn--add" onClick={() => addItem(product)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
