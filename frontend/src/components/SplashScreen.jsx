import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1700);
    const doneTimer = setTimeout(() => onDone(), 2100);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div className={`splash-screen${fading ? ' splash-screen--fade' : ''}`}>
      <div className="splash-logo-wrap">
        <div className="splash-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="56" height="56" rx="16" fill="rgba(255,255,255,0.15)" />
            <path d="M18 20C18 18.9 18.9 18 20 18H24C25.1 18 26 18.9 26 20V36C26 37.1 25.1 38 24 38H20C18.9 38 18 37.1 18 36V20Z" fill="white"/>
            <path d="M30 20C30 18.9 30.9 18 32 18H36C37.1 18 38 18.9 38 20V28C38 29.1 37.1 30 36 30H32C30.9 30 30 29.1 30 28V20Z" fill="white"/>
            <path d="M30 34C30 32.9 30.9 32 32 32H36C37.1 32 38 32.9 38 34V36C38 37.1 37.1 38 36 38H32C30.9 38 30 37.1 30 36V34Z" fill="white"/>
          </svg>
        </div>
        <span className="splash-wordmark">PEDI</span>
        <div className="splash-progress-track">
          <div className="splash-progress-bar" />
        </div>
      </div>
    </div>
  );
}
