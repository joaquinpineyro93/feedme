import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1700);
    const doneTimer = setTimeout(() => onDone(), 2100);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div className={`splash-screen ${fading ? 'splash-screen--fade' : ''}`}>
      <div className="splash-logo-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="splash-icon">
          <rect width="32" height="32" rx="7" fill="rgba(255,255,255,0.15)"/>
          <g transform="translate(4,4)" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/>
            <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/>
            <path d="m2.1 21.8 6.4-6.3"/>
            <path d="m19 5-7 7"/>
          </g>
        </svg>
        <span className="splash-wordmark">PEDI</span>
        <div className="splash-progress-track">
          <div className="splash-progress-bar" />
        </div>
      </div>
    </div>
  );
}
