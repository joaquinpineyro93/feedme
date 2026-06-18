import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CATEGORY_ORDER = ['Burgers', 'Acompañamientos', 'Bebidas', 'Postres'];

const MOCK_PRODUCTS = [
  { _id: '1', name: 'Burger Clásica', description: 'Medallón de carne, lechuga, tomate, cheddar', price: 1500, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
  { _id: '2', name: 'Burger Doble', description: 'Doble medallón, bacon, cheddar doble', price: 2200, category: 'Burgers', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop' },
  { _id: '3', name: 'Burger Veggie', description: 'Medallón de garbanzos, rúcula, tomate, mostaza', price: 1600, category: 'Burgers', image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop' },
  { _id: '4', name: 'Papas Fritas', description: 'Papas doradas con sal', price: 800, category: 'Acompañamientos', image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop' },
  { _id: '5', name: 'Papas con Cheddar', description: 'Papas con salsa cheddar casera', price: 1100, category: 'Acompañamientos', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&h=300&fit=crop' },
  { _id: '6', name: 'Coca-Cola 500ml', description: 'Bien fría', price: 600, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop' },
  { _id: '7', name: 'Agua Mineral', description: 'Sin gas', price: 400, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop' },
  { _id: '8', name: 'Helado Casero', description: 'Vainilla o chocolate, 2 bochas', price: 900, category: 'Postres', image: 'https://images.unsplash.com/photo-1567206563114-c179706a56b0?w=400&h=300&fit=crop' },
];

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        setProducts(res.data);
      } catch (err) {
        // Fall back to mock data when backend is unreachable (e.g. preview/demo)
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const catProducts = products.filter(p => p.category === cat);
    if (catProducts.length > 0) acc[cat] = catProducts;
    return acc;
  }, {});

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Cargando menú...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="menu-section">
            <h2 className="category-title">{category}</h2>
            <div className="product-grid">
              {items.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Floating cart button */}
      {totalItems > 0 && (
        <button className="floating-cart" onClick={() => setCartOpen(true)}>
          <span className="floating-cart-icon">🛒</span>
          <span className="floating-cart-text">Ver pedido</span>
          <span className="floating-cart-badge">{totalItems}</span>
        </button>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
