import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

function itemKey(productId, selectedVariants) {
  if (!selectedVariants || Object.keys(selectedVariants).length === 0) return productId;
  const varStr = Object.entries(selectedVariants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${Array.isArray(v) ? [...v].sort().join(',') : v}`)
    .join('|');
  return `${productId}__${varStr}`;
}

const initialState = { items: [], restaurant: null, notes: '' };

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const key = itemKey(action.product._id, action.selectedVariants);
      const existing = state.items.find(i => i.key === key);
      if (existing) {
        return { ...state, items: state.items.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { ...state, items: [...state.items, { key, product: action.product, quantity: 1, selectedVariants: action.selectedVariants || null, unitPrice: action.unitPrice ?? action.product.price }] };
    }
    case 'REMOVE_ITEM': {
      const existing = state.items.find(i => i.key === action.key);
      if (!existing) return state;
      if (existing.quantity === 1) return { ...state, items: state.items.filter(i => i.key !== action.key) };
      return { ...state, items: state.items.map(i => i.key === action.key ? { ...i, quantity: i.quantity - 1 } : i) };
    }
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(i => i.key !== action.key) };
    case 'SET_RESTAURANT':
      return { ...state, restaurant: action.restaurant };
    case 'SET_NOTES':
      return { ...state, notes: action.notes };
    case 'CLEAR_CART':
      return { ...initialState, restaurant: state.restaurant };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (product, selectedVariants, unitPrice) =>
    dispatch({ type: 'ADD_ITEM', product, selectedVariants, unitPrice });
  const removeItem = (key) => dispatch({ type: 'REMOVE_ITEM', key });
  const deleteItem = (key) => dispatch({ type: 'DELETE_ITEM', key });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const setRestaurant = (restaurant) => dispatch({ type: 'SET_RESTAURANT', restaurant });
  const setNotes = (notes) => dispatch({ type: 'SET_NOTES', notes });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, restaurant: state.restaurant, notes: state.notes, addItem, removeItem, deleteItem, clearCart, setRestaurant, setNotes, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
