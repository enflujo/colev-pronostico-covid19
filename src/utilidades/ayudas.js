export const fechaValida = (fecha) => {
  return fecha instanceof Date && !isNaN(fecha);
};

/**
 * Convierte de millisegundos a días.
 * @param {number} ms Milisegundos a convertir en días
 * @returns numero de días
 */
export const msADias = (ms) => ms / (1000 * 60 * 60 * 24);

/**
 * Calcula el numero de meses entre dos fechas.
 *
 * @param {Date} inicio Fecha inicial en formato `Date`
 * @param {Date} final Fecha final en formato `Date`
 * @returns Numero de meses entre las dos fechas
 */
export const calcularMeses = (inicio, final) => {
  let meses = (final.getFullYear() - inicio.getFullYear()) * 12;
  meses -= inicio.getMonth();
  meses += final.getMonth();
  return meses <= 0 ? 0 : meses;
};

/**
 * Convierte un numero de mes en su correspondiente texto en español.
 *
 * @param {number} mes Numero del mes a convertir en texto, los meses van de 0 a 11. Ejemplo: Enero es 0, diciembre es 11.
 * @returns Nombre del mes en español.
 */
export const mesATexto = (mes) => {
  return new Date(new Date().setMonth(mes))
    .toLocaleString('es', {
      month: 'short',
    })
    .toString();
};

/**
 * Difiere la ejecución de una función por un tiempo determinado.
 * Útil para diferir la ejecución de eventos que se activan muy frecuentemente como el cambio de tamaño de la pantalla.
 *
 * @param {Function} func Función que se ejecuta al final
 * @param {Number} tiempo Cuanto tiempo esperar entre para ejecutar la función
 * @returns {Function} algo
 */
export const diferir = (func, tiempo) => {
  tiempo = tiempo || 100;
  let reloj;

  return (e) => {
    if (reloj) clearTimeout(reloj);
    reloj = setTimeout(func, tiempo, e);
  };
};

/***
 * Traduce una variable tipo `Date` a español con el formato que se especifica en las opciones.
 *
 * @param {Date} fecha Fecha que quiere traducirse
 * @returns {Function} Fecha traducida
 */
export const fechaEnEspañol = (fecha) => {
  const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
  return fecha.toLocaleDateString('es-CO', opciones);
};

/***
 * Sumar o restar días a una fecha en formato `Date` para calcular una nueva fecha.
 * @param {Date} fecha Fecha inicial conocida
 * @param {Number} dias Cantidad de días que se quiere sumar o restar. Si se quiere restar, el valor debe ser negativo
 * @returns {Date} Nueva fecha en formato `Date`
 */
export function sumarRestarDias(fecha, dias) {
  var resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}
