import { useState, useEffect } from 'react';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Parse "Lun-Vie: 12:00-23:00 | Sáb: 13:00-00:00" into block array
function parse(str) {
  if (!str || !str.trim()) return [];
  return str.split('|').map(s => s.trim()).filter(Boolean).map(block => {
    const colonIdx = block.indexOf(':');
    if (colonIdx === -1) return null;
    const daysPart = block.slice(0, colonIdx).trim();
    const timePart = block.slice(colonIdx + 1).trim();
    if (!daysPart || !timePart) return null;
    // timePart is "10:00-15:00" — split on the dash between the two times
    const timeMatch = timePart.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    const from = timeMatch ? timeMatch[1] : '12:00';
    const to   = timeMatch ? timeMatch[2] : '23:00';
    // Expand day ranges like "Lun-Vie" into array
    const days = expandDays(daysPart);
    return { days, from: from || '12:00', to: to || '23:00' };
  }).filter(Boolean);
}

function expandDays(str) {
  const selected = [];
  str.split(',').forEach(part => {
    part = part.trim();
    if (part.includes('-')) {
      const [startDay, endDay] = part.split('-').map(d => d.trim());
      const si = DAYS.indexOf(startDay);
      const ei = DAYS.indexOf(endDay);
      if (si !== -1 && ei !== -1 && ei >= si) {
        for (let i = si; i <= ei; i++) selected.push(DAYS[i]);
      }
    } else if (DAYS.includes(part)) {
      selected.push(part);
    }
  });
  return [...new Set(selected)];
}

// Compress ["Lun","Mar","Mié","Jue","Vie"] → "Lun-Vie"
function compressDays(days) {
  if (!days.length) return '';
  const sorted = [...days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
  const groups = [];
  let start = sorted[0], prev = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    const cur = sorted[i];
    const prevIdx = DAYS.indexOf(prev);
    const curIdx = cur ? DAYS.indexOf(cur) : -1;
    if (curIdx === prevIdx + 1) {
      prev = cur;
    } else {
      groups.push(start === prev ? start : `${start}-${prev}`);
      start = cur;
      prev = cur;
    }
  }
  return groups.join(', ');
}

function serialize(blocks) {
  return blocks
    .filter(b => b.days.length > 0 && b.from && b.to)
    .map(b => `${compressDays(b.days)}: ${b.from}-${b.to}`)
    .join(' | ');
}

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

export default function OpenHoursPicker({ value, onChange }) {
  const [blocks, setBlocks] = useState(() => parse(value) || []);

  // Sync inward if value changes externally
  useEffect(() => {
    setBlocks(parse(value) || []);
  }, []);  // eslint-disable-line

  const emit = (newBlocks) => {
    setBlocks(newBlocks);
    onChange(serialize(newBlocks));
  };

  const addBlock = () => emit([...blocks, { days: [], from: '12:00', to: '23:00' }]);

  const removeBlock = (i) => emit(blocks.filter((_, idx) => idx !== i));

  const toggleDay = (blockIdx, day) => {
    const newBlocks = blocks.map((b, i) => {
      if (i !== blockIdx) return b;
      const days = b.days.includes(day)
        ? b.days.filter(d => d !== day)
        : [...b.days, day];
      return { ...b, days };
    });
    emit(newBlocks);
  };

  const setTime = (blockIdx, field, val) => {
    emit(blocks.map((b, i) => i === blockIdx ? { ...b, [field]: val } : b));
  };

  return (
    <div className="ohp-root">
      {blocks.length === 0 && (
        <p className="ohp-empty">Sin horario configurado</p>
      )}
      {blocks.map((block, i) => (
        <div key={i} className="ohp-block">
          <div className="ohp-days">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                className={`ohp-day${block.days.includes(day) ? ' ohp-day--on' : ''}`}
                onClick={() => toggleDay(i, day)}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="ohp-times">
            <div className="ohp-time-group">
              <span className="ohp-time-label">Desde</span>
              <select className="ohp-select" value={block.from} onChange={e => setTime(i, 'from', e.target.value)}>
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <span className="ohp-dash">–</span>
            <div className="ohp-time-group">
              <span className="ohp-time-label">Hasta</span>
              <select className="ohp-select" value={block.to} onChange={e => setTime(i, 'to', e.target.value)}>
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button type="button" className="ohp-remove" onClick={() => removeBlock(i)} title="Eliminar franja">✕</button>
          </div>
        </div>
      ))}
      <button type="button" className="ohp-add" onClick={addBlock}>+ Agregar franja horaria</button>
    </div>
  );
}
