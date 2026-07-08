const { toZonedTime, fromZonedTime, format } = require('date-fns-tz');

const APP_TIMEZONE = 'America/Montevideo';

// Fecha "YYYY-MM-DD" -> instante UTC real de la medianoche de ese día en GMT-3.
// Reemplaza `new Date(dateString)`, que interpreta el string como medianoche UTC.
function startOfDayInAppTz(dateString) {
  return fromZonedTime(`${dateString}T00:00:00`, APP_TIMEZONE);
}

// Instante UTC -> string "YYYY-MM-DD" según la fecha de calendario en GMT-3.
// Reemplaza `date.toISOString().slice(0, 10)`, que da la fecha en UTC.
function toDateStringInAppTz(date) {
  return format(toZonedTime(date, APP_TIMEZONE), 'yyyy-MM-dd', { timeZone: APP_TIMEZONE });
}

module.exports = { APP_TIMEZONE, startOfDayInAppTz, toDateStringInAppTz };
