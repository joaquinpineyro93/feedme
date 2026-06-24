import React from 'react';
import { UtensilsCrossed, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ restaurant }) {
  const name        = restaurant?.name        || 'Burger Bros';
  const description = restaurant?.description || 'Las mejores burgers de la ciudad';
  const logo        = restaurant?.logo;
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          {logo
            ? <img src={logo} alt={name} className="header-logo-img" />
            : <UtensilsCrossed size={36} color="#fff" />
          }
          <div>
            <h1 className="header-title">{name}</h1>
            <p className="header-subtitle">{description}</p>
          </div>
        </div>

        <div className="header-auth">
          {user ? (
            <div className="header-user">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="header-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserCircle size={32} color="#F59E0B" />
              )}
              <button className="header-logout" onClick={logout} title="Cerrar sesión">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button className="header-avatar-btn" onClick={loginWithGoogle} title="Iniciar sesión">
              <UserCircle size={32} color="#6B7280" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
