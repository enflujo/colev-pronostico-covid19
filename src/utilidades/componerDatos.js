import dayjs from 'dayjs';
import UTC from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { csv as fetchCSV } from 'd3-fetch';
import { esquemaIntervalos, esquemaCasos } from './esquemas';

dayjs.extend(UTC);
dayjs.extend(timezone);

export default async () => {
  const datos = {
    intervalos: {},
    casos: { diario: {}, semanal: {} },
  };

  const datosMuertes = await fetchCSV('/datos/deaths_df.csv');
  const datosCasos = await fetchCSV('/datos/cases.csv');
  const muertes = limpiarDatos(datosMuertes, 'deaths');
  const casos = limpiarDatos(datosCasos, 'cases');

  datos.intervalos.estimados = muertes.filter((caso) => caso.tipo === 'estimado');
  datos.intervalos.pronostico = muertes.filter((caso) => caso.tipo === 'pronostico');
  datos.casos.diario = {
    ajustados: casos.filter((caso) => caso.tipo === 'ajustado'),
    preliminar: casos.filter((caso) => caso.tipo === 'preliminar'),
  };
  const semanalA = normalizarSemanal(datos.casos.diario.ajustados);
  datos.casos.semanal = {
    ajustados: semanalA,
    // Incluir el último de los ajustados para iniciar linea de preliminares desde ese punto.
    preliminar: [semanalA[semanalA.length - 1], ...normalizarSemanal(datos.casos.diario.preliminar)],
  };

  datos.fechaInicial = muertes[0].fecha;
  datos.fechaFinal = muertes[muertes.length - 1].fecha;

  return datos;
};

function validarEsquema(esquema, fila) {
  const procesado = {};

  for (let campo in esquema) {
    const definicion = esquema[campo];
    const llave = definicion.llaveFuente;

    if (fila.hasOwnProperty(llave)) {
      if (definicion.tipo === Number) {
        procesado[campo] = +fila[llave];
      } else if (definicion.hasOwnProperty('opciones')) {
        procesado[campo] = definicion.opciones[fila[llave]];
      } else {
        procesado[campo] = fila[llave];
      }
    }
  }

  return procesado;
}

/**
 * Valida y limpia los datos.
 *
 * @param {Array} csv Datos a limpiar.
 * @returns El mismo array procesado y validado.
 */
function limpiarDatos(csv, tipo) {
  return csv.map((fila, i) => {
    const fechaTexto = fila.hasOwnProperty('date') ? fila.date : fila.date_time;
    const fecha = dayjs.tz(fechaTexto, 'America/Bogota');

    if (fecha.isValid()) {
      fila.date = fecha.toDate();
      const esquema = tipo === 'cases' ? esquemaCasos : esquemaIntervalos;
      const limpio = validarEsquema(esquema, fila);
      limpio.i = i;
      return limpio;
    } else {
      throw new Error(
        `La fecha en la fila ${i} no es valida, debe estar en formato "YYYY-MM-DD" y esta así: ${JSON.stringify(
          fila.fecha
        )}`
      );
    }
  });
}

function normalizarSemanal(datos) {
  const registrosSemanales = [];
  let inicioSemana = datos[0].fecha;
  let casosSemana = 0;
  let muertesSemana = 0;
  let contadorI = 0;

  datos.forEach((dia, i) => {
    casosSemana += dia.casos;
    muertesSemana += dia.muertes;

    // 0 es Domingo, agregar semana y reiniciar los contadores
    if (dia.fecha.getDay() === 0) {
      registrosSemanales.push({
        fecha: inicioSemana,
        fechaFinal: dia.fecha,
        casos: casosSemana,
        muertes: muertesSemana,
        i: contadorI,
      });

      inicioSemana = i < datos.length - 2 ? datos[i + 1].fecha : null;
      casosSemana = 0;
      muertesSemana = 0;
      contadorI++;
    }
  });
  return registrosSemanales;
}
