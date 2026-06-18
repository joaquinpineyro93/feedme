import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const initialState = {
  items: [], // [{ product, quantity }]
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product._id === action.product._id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.product._id === action.product._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case 'REMOVE_ITEM': {
      const existing = state.items.find(i => i.product._id === action.productId);
      if (!existing) return state;
      if (existing.quantity === 1) {
        return { ...state, items: state.items.filter(i => i.product._id !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.product._id === action.productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        ),
      };
    }
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(i => i.product._id !== action.productId) };
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', product });
  const removeItem = (productId) => dispatch({ type: 'REMOVE_ITEM', productId });
  const deleteItem = (productId) => dispatch({ type: 'DELETE_ITEM', productId });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, deleteItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
