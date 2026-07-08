import { toZonedTime, format } from 'date-fns-tz';

const APP_TIMEZONE = 'America/Montevideo';

function dateStringInAppTz(date) {
  return format(toZonedTime(date, APP_TIMEZONE), 'yyyy-MM-dd', { timeZone: APP_TIMEZONE });
}

// Fecha de hoy ("YYYY-MM-DD") según el calendario en GMT-3, no en UTC.
export function today() {
  return dateStringInAppTz(new Date());
}

// Fecha de hace `n` días ("YYYY-MM-DD") según el calendario en GMT-3.
export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStringInAppTz(d);
}
