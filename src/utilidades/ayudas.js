export const fechaValida = (fecha) => {
  return fecha instanceof Date && !isNaN(fecha);
};

/**
 * Convierte de millisegundos a días.
 * @param {number} ms Millisegundos a convertir en días.
 * @returns numero de días
 */
export const msADias = (ms) => ms / (1000 * 60 * 60 * 24);

/**
 * Calcula el numero de meses entre dos fechas.
 *
 * @param {Date} inicio Fecha inicial en formato Date.
 * @param {Date} final Fecha final en formato Date.
 * @returns Numero de meses entre las dos fechas.
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
 * Valida y limpia los datos. (De momento simplemente valida fechas)
 *
 * @param {Array} csv Datos a limpiar.
 * @returns El mismo array procesado y validado.
 */
export const limpiarDatos = (csv) => {
  return csv.map((fila, i) => {
    const fechaTexto = fila.hasOwnProperty('date') ? fila.date : fila.date_time;
    const fecha = new Date(fechaTexto);

    if (fechaValida(fecha)) {
      fila.date = fecha;
      return fila;
    } else {
      throw new Error(
        `La fecha en la fila ${i} no es valida, debe estar en formato "YYYY-MM-DD" y esta así: ${JSON.stringify(
          fila.date
        )}`
      );
    }
  });
};
