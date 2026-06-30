import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import HistoryPage from './pages/HistoryPage';
import RestaurantPage from './pages/RestaurantPage';
import DailyMenuPage from './pages/DailyMenuPage';
import api from './api';
import './index.css';

function AdminLayout() {
  const { user, logout } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const location = useLocation();

  useEffect(() => {
    api.get('/api/restaurant')
      .then(({ data }) => {
        setRestaurant(data);
        if (data.name) document.title = `${data.name} — Pedi [Admin]`;
      })
      .catch(() => {});
  }, []); // load once on mount

  if (!user) return <Navigate to="/login" replace />;

  const name = restaurant?.name || 'Mi local';
  const logo = restaurant?.logo;

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          {logo
            ? <img src={logo} alt={name} className="sidebar-logo-img" />
            : <UtensilsCrossed size={28} color="#fff" className="sidebar-logo-icon" />
          }
          <span className="sidebar-logo-text">{name}</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} to="/pedidos">Pedidos</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} to="/productos">Productos</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} to="/historico">Historico</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} to="/menu-del-dia">Menú del día</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} to="/mi-local">Mi local</NavLink>
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user">{user.username}</span>
          <button className="btn-logout" onClick={logout}>Salir</button>
        </div>
      </aside>
      <main className="admin-main">
        <Routes>
          <Route path="/pedidos"   element={<OrdersPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/historico"    element={<HistoryPage />} />
          <Route path="/menu-del-dia" element={<DailyMenuPage />} />
          <Route path="/mi-local"     element={<RestaurantPage />} />
          <Route path="*"          element={<Navigate to="/pedidos" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AuthGuard() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user && location.pathname !== '/login') return <Navigate to="/login" replace />;
  if (user  && location.pathname === '/login')  return <Navigate to="/pedidos" replace />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*"     element={<AdminLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGuard />
      </BrowserRouter>
    </AuthProvider>
  );
}
