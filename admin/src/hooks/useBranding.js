import { useEffect } from 'react';
import api from '../api';

export function useBranding() {
  useEffect(() => {
    api.get('/api/restaurant')
      .then(({ data }) => {
        const b = data.branding;
        if (!b) return;
        const root = document.documentElement;
        if (b.primary)    root.style.setProperty('--accent',      b.primary);
        if (b.secondary)  root.style.setProperty('--sidebar-bg',  b.secondary);
        if (b.accent)     root.style.setProperty('--accent-dark',  b.accent);
      })
      .catch(() => {});
  }, []);
}
