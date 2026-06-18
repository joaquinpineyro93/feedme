import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import HistoryPage from './pages/HistoryPage';
import './index.css';

function AdminApp() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('orders');

  if (!user) return <LoginPage />;

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🍔</span>
          <span className="sidebar-logo-text">Burger Bros</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            Pedidos
          </button>
          <button
            className={`sidebar-link ${tab === 'products' ? 'active' : ''}`}
            onClick={() => setTab('products')}
          >
            Productos
          </button>
          <button
            className={`sidebar-link ${tab === 'history' ? 'active' : ''}`}
            onClick={() => setTab('history')}
          >
            Historico
          </button>
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user">{user.username}</span>
          <button className="btn-logout" onClick={logout}>Salir</button>
        </div>
      </aside>
      <main className="admin-main">
        {tab === 'orders' && <OrdersPage />}
        {tab === 'products' && <ProductsPage />}
        {tab === 'history' && <HistoryPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}
