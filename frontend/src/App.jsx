import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
      <Analytics />
    </AuthProvider>
  );
}
