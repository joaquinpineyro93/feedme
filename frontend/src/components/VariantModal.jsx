import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function VariantModal({ product, onConfirm, onClose }) {
  const groups = product.variants || [];
  const [selected, setSelected] = useState(() => {
    const init = {};
    groups.forEach(g => { init[g._id] = g.type === 'extra' ? [] : null; });
    return init;
  });

  const totalAdd = groups.reduce((sum, g) => {
    if (g.type === 'extra') {
      const ids = selected[g._id] || [];
      return sum + g.options.filter(o => ids.includes(o._id)).reduce((s, o) => s + (o.priceAdd || 0), 0);
    }
    const opt = g.options.find(o => o._id === selected[g._id]);
    return sum + (opt?.priceAdd || 0);
  }, 0);

  const canConfirm = groups.every(g => {
    if (!g.required) return true;
    return g.type === 'extra' ? (selected[g._id] || []).length > 0 : selected[g._id] !== null;
  });

  const toggleExtra = (groupId, optionId) => {
    setSelected(s => {
      const ids = s[groupId] || [];
      const next = ids.includes(optionId) ? ids.filter(id => id !== optionId) : [...ids, optionId];
      return { ...s, [groupId]: next };
    });
  };

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
          {groups.map(group => {
            const isExtra = group.type === 'extra';
            return (
              <div key={group._id} className="variant-group">
                <div className="variant-group-header">
                  <span className="variant-group-name">{group.name}</span>
                  {group.required && (
                    <span className="variant-required-badge">{isExtra ? 'Mínimo 1' : 'Requerido'}</span>
                  )}
                </div>
                <div className="variant-options">
                  {group.options.map(opt => {
                    const isSelected = isExtra
                      ? (selected[group._id] || []).includes(opt._id)
                      : selected[group._id] === opt._id;
                    return (
                      <label key={opt._id} className={`variant-option ${isSelected ? 'variant-option--selected' : ''}`}>
                        <input
                          type={isExtra ? 'checkbox' : 'radio'}
                          name={isExtra ? undefined : group._id}
                          checked={isSelected}
                          onChange={() => isExtra
                            ? toggleExtra(group._id, opt._id)
                            : setSelected(s => ({ ...s, [group._id]: opt._id }))}
                        />
                        <span className="variant-option-label">{opt.label}</span>
                        {opt.priceAdd > 0 && <span className="variant-option-price">+${opt.priceAdd.toLocaleString('es-AR')}</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
