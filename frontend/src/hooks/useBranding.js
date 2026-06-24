import { useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useBranding() {
  useEffect(() => {
    axios.get(`${API_URL}/api/restaurant`)
      .then(({ data }) => {
        const b = data.branding;
        if (!b) return;
        const root = document.documentElement;
        if (b.primary)    root.style.setProperty('--color-primary',    b.primary);
        if (b.secondary)  root.style.setProperty('--color-secondary',  b.secondary);
        if (b.accent)     root.style.setProperty('--color-accent',     b.accent);
        if (b.background) root.style.setProperty('--color-background', b.background);
        if (b.text)       root.style.setProperty('--color-text',       b.text);
      })
      .catch(() => {});
  }, []);
}
