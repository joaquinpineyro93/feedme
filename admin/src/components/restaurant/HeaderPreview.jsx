import { Clock } from 'lucide-react';
import Bubble from '../Bubble';

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

// Réplica de la lógica en frontend/src/components/Header.jsx — mantener en sync si cambia allá.
function isOpenNow(openHours) {
  if (!openHours) return null;
  const now = new Date();
  const todayName = DAY_NAMES[now.getDay()];
  const yesterdayName = DAY_NAMES[(now.getDay() + 6) % 7];
  const cur = now.getHours() * 60 + now.getMinutes();

  const blocks = openHours.split('|').map(s => s.trim());
  let hasValidBlock = false;
  for (const block of blocks) {
    const colonIdx = block.indexOf(':');
    if (colonIdx === -1) continue;
    const daysPart = block.slice(0, colonIdx).trim();
    const timePart = block.slice(colonIdx + 1).trim();
    const days = expandDays(daysPart);
    const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    if (!timeMatch) continue;
    hasValidBlock = true;
    let open  = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
    let close = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);
    const crossesMidnight = close <= open;
    if (crossesMidnight) close += 24 * 60;

    if (!days.length || days.includes(todayName)) {
      const adjustedCur = cur < open ? cur + 24 * 60 : cur;
      if (adjustedCur >= open && adjustedCur < close) return true;
    }
    if (crossesMidnight && (!days.length || days.includes(yesterdayName))) {
      if (cur < (close - 24 * 60)) return true;
    }
  }
  return hasValidBlock ? false : null;
}

// Vista previa en miniatura del header real de la app cliente (frontend/src/components/Header.jsx).
export default function HeaderPreview({ name, description, logo, heroImage, openHours, acceptingOrders }) {
  const open = isOpenNow(openHours);
  const bgImage = heroImage || logo;

  return (
    <div className="header-preview-frame">
      <div
        className="header-preview-hero"
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
      >
        <div className="header-preview-overlay" />
        <div className="header-preview-content">
          <div className="header-preview-name-row">
            {logo ? (
              <div className="header-preview-avatar header-preview-avatar--img">
                <img src={logo} alt={name} className="header-preview-avatar-img" />
              </div>
            ) : (
              <div className="header-preview-avatar">
                <Bubble size={16} />
              </div>
            )}
            <span className="header-preview-title">{name || 'Nombre del local'}</span>
          </div>
          {description && <p className="header-preview-sub">{description}</p>}
          <div className="header-preview-badges">
            {!acceptingOrders && <span className="hp-badge hp-badge--closed">No acepta pedidos</span>}
            {acceptingOrders && open === true  && <span className="hp-badge hp-badge--open">Abierto</span>}
            {acceptingOrders && open === false && <span className="hp-badge hp-badge--closed">Cerrado</span>}
            {openHours && <span className="hp-badge hp-badge--hours"><Clock size={10} /> {openHours}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
