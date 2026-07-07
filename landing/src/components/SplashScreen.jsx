import { useState, useEffect } from 'react';

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
          <img src="/favicon.svg" alt="Pedi" width="76" height="76" />
        </div>
        <span className="splash-wordmark">
          ped<span className="wordmark-i">&#305;<span className="wordmark-acc" /></span>
        </span>
        <div className="splash-progress-track">
          <div className="splash-progress-bar" />
        </div>
      </div>
    </div>
  );
}
