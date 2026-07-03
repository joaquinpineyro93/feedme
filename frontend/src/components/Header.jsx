import React from 'react';
import { UtensilsCrossed, LogOut, UserCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function expandDays(str) {
  const result = [];
  str.split(',').forEach(part => {
    part = part.trim();
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(d => d.trim());
      const si = DAY_NAMES.indexOf(a), ei = DAY_NAMES.indexOf(b);
      if (si !== -1 && ei !== -1) for (let i = si; i <= ei; i++) result.push(DAY_NAMES[i]);
    } else if (DAY_NAMES.includes(part)) {
      result.push(part);
    }
  });
  return result;
}

function isOpenNow(openHours) {
  if (!openHours) return null;
  const now = new Date();
  const todayName = DAY_NAMES[now.getDay()];
  const cur = now.getHours() * 60 + now.getMinutes();

  // Support multi-block format: "Lun-Vie: 12:00-23:00 | Sáb-Dom: 13:00-00:00"
  const blocks = openHours.split('|').map(s => s.trim());
  for (const block of blocks) {
    const colonIdx = block.indexOf(':');
    if (colonIdx === -1) continue;
    const daysPart = block.slice(0, colonIdx).trim();
    const timePart = block.slice(colonIdx + 1).trim();
    const days = expandDays(daysPart);
    if (days.length && !days.includes(todayName)) continue;
    const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    if (!timeMatch) continue;
    let open  = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
    let close = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);
    if (close <= open) close += 24 * 60;
    const adjustedCur = cur < open ? cur + 24 * 60 : cur;
    if (adjustedCur >= open && adjustedCur < close) return true;
  }
  // If we found blocks for today but none matched, return false; if no blocks at all, null
  const todayBlocks = blocks.filter(b => {
    const colonIdx = b.indexOf(':');
    if (colonIdx === -1) return false;
    return expandDays(b.slice(0, colonIdx).trim()).includes(todayName);
  });
  return todayBlocks.length > 0 ? false : null;
}

export default function Header({ restaurant }) {
  const name        = restaurant?.name        || '';
  const description = restaurant?.description || '';
  const logo        = restaurant?.logo;
  const openHours   = restaurant?.openHours;
  const open        = isOpenNow(openHours);
  const acceptingOrders = restaurant?.acceptingOrders !== false;
  const { user, logout } = useAuth();

  return (
    <header className="header-hero" style={logo ? { backgroundImage: `url(${logo})` } : {}}>
      <div className="header-hero-overlay" />

      {/* Auth — top right */}
      {user && (
        <div className="header-hero-auth">
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
        </div>
      )}

      {/* Bottom-left: name + description + badges */}
      <div className="header-hero-content">
        {!logo && <UtensilsCrossed size={40} color="#F59E0B" strokeWidth={1.5} style={{ marginBottom: 8 }} />}
        <h1 className="header-hero-title">{name}</h1>
        {description && <p className="header-hero-sub">{description}</p>}
        <div className="header-hero-badges">
          {!acceptingOrders && <span className="hero-badge hero-badge--closed">No acepta pedidos en el momento</span>}
          {acceptingOrders && open === true  && <span className="hero-badge hero-badge--open">Abierto</span>}
          {acceptingOrders && open === false && <span className="hero-badge hero-badge--closed">Cerrado</span>}
          {openHours && <span className="hero-badge hero-badge--hours"><Clock size={11} /> {openHours}</span>}
        </div>
      </div>
    </header>
  );
}
