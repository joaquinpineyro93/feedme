import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          <span className="header-emoji">🍔</span>
          <div>
            <h1 className="header-title">Burger Bros</h1>
            <p className="header-subtitle">Las mejores burgers de la ciudad</p>
          </div>
        </div>
      </div>
    </header>
  );
}
