/**
 * Definición del idioma según estructura de D3
 * https://github.com/d3/d3-time-format/blob/main/README.md#locales
 */
export default {
  dateTime: '%x, %X',
  date: '%d/%m/%Y',
  time: '%-I:%M:%S %p',
  periods: ['am', 'pm'],
  days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  months: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  shortMonths: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
};
