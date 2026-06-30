import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const COUNTRIES = [
  { code: 'UY', name: 'Uruguay',   prefix: '598', flag: '🇺🇾' },
  { code: 'AR', name: 'Argentina', prefix: '54',  flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil',    prefix: '55',  flag: '🇧🇷' },
  { code: 'PY', name: 'Paraguay',  prefix: '595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia',   prefix: '591', flag: '🇧🇴' },
  { code: 'CL', name: 'Chile',     prefix: '56',  flag: '🇨🇱' },
  { code: 'PE', name: 'Perú',      prefix: '51',  flag: '🇵🇪' },
  { code: 'CO', name: 'Colombia',  prefix: '57',  flag: '🇨🇴' },
  { code: 'VE', name: 'Venezuela', prefix: '58',  flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador',   prefix: '593', flag: '🇪🇨' },
  { code: 'MX', name: 'México',    prefix: '52',  flag: '🇲🇽' },
  { code: 'US', name: 'EE.UU.',    prefix: '1',   flag: '🇺🇸' },
  { code: 'ES', name: 'España',    prefix: '34',  flag: '🇪🇸' },
];

function detectCountry(digits) {
  if (!digits) return null;
  const sorted = [...COUNTRIES].sort((a, b) => b.prefix.length - a.prefix.length);
  return sorted.find(c => digits.startsWith(c.prefix)) || null;
}

function parseValue(val) {
  const digits = (val || '').replace(/\D/g, '');
  const sorted = [...COUNTRIES].sort((a, b) => b.prefix.length - a.prefix.length);
  const match = sorted.find(c => digits.startsWith(c.prefix));
  if (match) return { country: match, local: digits.slice(match.prefix.length) };
  return { country: COUNTRIES[0], local: digits };
}

export default function PhoneInput({ value, onChange, placeholder = '98 478 604', className = '' }) {
  const parsed = parseValue(value);
  const [country, setCountry] = useState(parsed.country);
  const [local, setLocal] = useState(parsed.local);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 260 });
  const wrapRef = useRef(null);

  const emit = (c, l) => onChange(`+${c.prefix}${l}`);

  useEffect(() => {
    const p = parseValue(value);
    setCountry(p.country);
    setLocal(p.local);
  }, [value]);

  const handleLocal = (e) => {
    const raw = e.target.value.replace(/[^\d\s\-().]/g, '');
    const digits = raw.replace(/\D/g, '');
    const detected = detectCountry(digits);
    if (detected && detected.code !== country.code) {
      const stripped = digits.slice(detected.prefix.length);
      setCountry(detected);
      setLocal(stripped);
      emit(detected, stripped);
    } else {
      setLocal(raw);
      emit(country, raw);
    }
  };

  const handleSelect = (c) => {
    setCountry(c);
    setOpen(false);
    setSearch('');
    emit(c, local);
  };

  const handleOpen = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      });
    }
    setOpen(o => !o);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        // check if click is inside the portal dropdown
        const portal = document.getElementById('phone-dropdown-portal');
        if (portal && portal.contains(e.target)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.prefix.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const dropdown = open ? createPortal(
    <div
      id="phone-dropdown-portal"
      className="phone-dropdown"
      style={{ position: 'absolute', top: dropPos.top, left: dropPos.left, zIndex: 9999, width: 260 }}
    >
      <div className="phone-search-wrap">
        <input
          className="phone-search"
          type="text"
          placeholder="Buscar país..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <ul className="phone-country-list">
        {filtered.map(c => (
          <li key={c.code}>
            <button
              type="button"
              className={`phone-country-opt ${c.code === country.code ? 'phone-country-opt--active' : ''}`}
              onClick={() => handleSelect(c)}
            >
              <span>{c.flag}</span>
              <span className="phone-country-name">{c.name}</span>
              <span className="phone-country-prefix">+{c.prefix}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`phone-input-wrap ${className}`} ref={wrapRef}>
      <button type="button" className="phone-prefix-btn" onClick={handleOpen}>
        <span className="phone-flag">{country.flag}</span>
        <span className="phone-prefix-text">+{country.prefix}</span>
        <ChevronDown size={13} className={`phone-chevron ${open ? 'phone-chevron--open' : ''}`} />
      </button>

      <input
        className="phone-local-input"
        type="tel"
        value={local}
        onChange={handleLocal}
        placeholder={placeholder}
      />

      {dropdown}
    </div>
  );
}
