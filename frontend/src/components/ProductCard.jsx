import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import VariantModal from './VariantModal';

const FALLBACK_IMG = '/favicon.svg';

export default function ProductCard({ product, dailyBadge }) {
  const { items, addItem, removeItem, restaurant } = useCart();
  const [showVariants, setShowVariants] = useState(false);

  const hasVariants = product.variants?.length > 0;
  const fallback = restaurant?.logo || FALLBACK_IMG;

  // Para productos sin variantes: item único
  const simpleItem = !hasVariants ? items.find(i => i.key === product._id) : null;
  // Para productos con variantes: suma de todas las entradas del carrito para este producto
  const totalVariantQty = hasVariants
    ? items.filter(i => i.product._id === product._id).reduce((s, i) => s + i.quantity, 0)
    : 0;

  const quantity = hasVariants ? totalVariantQty : (simpleItem?.quantity || 0);

  const handleAdd = () => {
    if (hasVariants) {
      setShowVariants(true);
    } else {
      addItem(product);
    }
  };

  const handleVariantConfirm = (selectedVariants, unitPrice) => {
    addItem(product, selectedVariants, unitPrice);
    setShowVariants(false);
  };

  return (
    <>
      <div className={`product-card ${dailyBadge ? 'product-card--daily' : ''}`}>
        {!product.image ? (
          <div className="product-image-wrap product-image-wrap--fallback">
            <img src={fallback} alt={product.name} className="product-fallback-logo" onError={e => { e.target.src = FALLBACK_IMG; }} />
            <span className="product-fallback-label">SIN IMAGEN</span>
          </div>
        ) : (
          <div className="product-image-wrap">
            <img src={product.image} alt={product.name} className="product-image" loading="lazy" onError={e => { e.target.src = fallback; }} />
          </div>
        )}
        <div className="product-info">
          <div>
            {dailyBadge && <div className="daily-badge">{dailyBadge}</div>}
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
          </div>
          <div className="product-footer">
            <span className="product-price">${Number(product.price).toLocaleString('es-AR')}</span>
            {quantity === 0 ? (
              <button className="btn-add" onClick={handleAdd}>+</button>
            ) : (
              <div className="quantity-controls">
                {hasVariants ? (
                  <>
                    <button className="qty-btn qty-btn--add" onClick={() => setShowVariants(true)}>+</button>
                    <span className="qty-value">{quantity}</span>
                  </>
                ) : (
                  <>
                    <button className="qty-btn" onClick={() => removeItem(simpleItem.key)}>−</button>
                    <span className="qty-value">{quantity}</span>
                    <button className="qty-btn qty-btn--add" onClick={handleAdd}>+</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showVariants && (
        <VariantModal
          product={product}
          onConfirm={handleVariantConfirm}
          onClose={() => setShowVariants(false)}
        />
      )}
    </>
  );
}
