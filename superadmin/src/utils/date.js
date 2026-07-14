import { toZonedTime, format } from 'date-fns-tz';

const APP_TIMEZONE = 'America/Montevideo';

function dateStringInAppTz(date) {
  return format(toZonedTime(date, APP_TIMEZONE), 'yyyy-MM-dd', { timeZone: APP_TIMEZONE });
}

// Fecha de hoy ("YYYY-MM-DD") según el calendario en GMT-3, no en UTC.
export function today() {
  return dateStringInAppTz(new Date());
}

// Primer día del mes corriente ("YYYY-MM-DD") según el calendario en GMT-3.
export function startOfMonth() {
  return `${today().slice(0, 7)}-01`;
}
