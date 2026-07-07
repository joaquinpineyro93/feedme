import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function VariantModal({ product, onConfirm, onClose }) {
  const groups = product.variants || [];
  const [selected, setSelected] = useState(() => {
    const init = {};
    groups.forEach(g => { init[g._id] = null; });
    return init;
  });

  const totalAdd = groups.reduce((sum, g) => {
    const opt = g.options.find(o => o._id === selected[g._id]);
    return sum + (opt?.priceAdd || 0);
  }, 0);

  const canConfirm = groups.every(g => !g.required || selected[g._id] !== null);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(selected, product.price + totalAdd);
  };

  return createPortal(
    <div className="variant-overlay" onClick={onClose}>
      <div className="variant-sheet" onClick={e => e.stopPropagation()}>
        <div className="variant-sheet-header">
          <div>
            <h3 className="variant-sheet-title">{product.name}</h3>
            {product.description && <p className="variant-sheet-desc">{product.description}</p>}
          </div>
          <div className="variant-sheet-header-right">
            <button className="variant-sheet-close" onClick={onClose}><X size={20} /></button>
            <span className="variant-total">
              ${(product.price + totalAdd).toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        <div className="variant-sheet-body">
          {groups.map(group => (
            <div key={group._id} className="variant-group">
              <div className="variant-group-header">
                <span className="variant-group-name">{group.name}</span>
                {group.required && <span className="variant-required-badge">Requerido</span>}
              </div>
              <div className="variant-options">
                {group.options.map(opt => (
                  <label key={opt._id} className={`variant-option ${selected[group._id] === opt._id ? 'variant-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name={group._id}
                      checked={selected[group._id] === opt._id}
                      onChange={() => setSelected(s => ({ ...s, [group._id]: opt._id }))}
                    />
                    <span className="variant-option-label">{opt.label}</span>
                    {opt.priceAdd > 0 && <span className="variant-option-price">+${opt.priceAdd.toLocaleString('es-AR')}</span>}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="variant-sheet-footer">
          <button className="btn-add-variant" onClick={handleConfirm} disabled={!canConfirm}>
            Agregar al pedido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
