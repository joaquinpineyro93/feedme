import { useState, useEffect } from 'react';

function Bubble({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M12 10h40a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H30l-12 10v-10h-6a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6Z" fill="#F2A31A" />
      <path d="M28 20v24M28 20c-3 0-5 2-5 6s2 5 5 5M36 20v9c0 2 1 3 3 3s3-1 3-3v-9M39 20v24" stroke="#141210" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
          <Bubble size={76} />
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
