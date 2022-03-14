import './scss/estilos.scss';
import { diferir } from './utilidades/ayudas';
import componerDatos from './utilidades/componerDatos';
import GraficaPrincipal from './componentes/GraficaPrincipal';
import fechas from './utilidades/fechas';

timeFormatDefaultLocale(fechas);

const contenedorGrafica = document.getElementById('grafica');
const indicadorBtn = document.getElementById('indicador');
const resolucionBtn = document.getElementById('resolucion');
const grafica = new GraficaPrincipal(contenedorGrafica);
console.log(grafica);
const dims = { superior: 100, derecha: 30, inferior: 150, izquierda: 60 };
dims.margenHorizontal = dims.derecha + dims.izquierda;
dims.margenVertical = dims.superior + dims.inferior;

const obtenerResolucion = () => (resolucionBtn.checked ? 'semanal' : 'diario');
const obtenerIndicador = () => (indicadorBtn.checked ? 'muertes' : 'casos');

function actualizarDimensiones() {
  dims.ancho = contenedorGrafica.offsetWidth - dims.margenHorizontal;
  dims.alto = contenedorGrafica.offsetHeight - dims.margenVertical;
  grafica.escalar(dims);
}

async function inicio() {
  const datos = await componerDatos();

  grafica
    .cambiarIndicador(obtenerIndicador())
    .cambiarResolucion(obtenerResolucion())
    .conectarDatos(datos)
    .actualizarEjeX()
    .actualizarEjeY();

  dibujar();
}

function dibujar() {
  // const clip = grafica
  //   .append('defs')
  //   .append('svg:clipPath')
  //   .attr('id', 'clip')
  //   .append('svg:rect')
  //   .attr('width', width)
  //   .attr('height', height)
  //   .attr('x', 0)
  //   .attr('y', 0);

  // const brush = brushX // Add the brush feature using the d3.brush function
  //   .extent([
  //     [0, 0],
  //     [width, height],
  //   ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
  //   .on('end', updateChart);

  // grafica
  //   .append('path')
  //   .datum(muertesEstimado)
  //   .attr('fill', '#cce5df')
  //   .attr('stroke', 'none')
  //   .attr(
  //     'd',
  //     area()
  //       .x((d) => x(d.fecha))
  //       .y0((d) => y(d.low_95))
  //       .y1((d) => y(d.high_95))
  //   );

  // grafica
  //   .append('path')
  //   .datum(muertesEstimado)
  //   .attr('fill', 'none')
  //   .attr('stroke', 'steelblue')
  //   .attr('stroke-width', 1.5)
  //   .attr(
  //     'd',
  //     line()
  //       .x((d) => x(d.fecha))
  //       .y((d) => y(d.median))
  //   );

  /**
   * Linea de muertes
   */

  grafica.dibujar();

  // grafica
  //   .selectAll('casos')
  //   .data(casosComprobados)
  //   .enter()
  //   .append('circle')
  //   .attr('class', 'puntoCasoComprobado')
  //   .attr('r', 2)
  //   .attr('cx', (d) => ejeX(d.date))
  //   .attr('cy', (d) => ejeY(d.num_diseased));

  // grafica
  //   .append('path')
  //   .datum(muertesPrediccion)
  //   .attr('fill', rojoClaro)
  //   .attr('stroke', 'none')
  //   .attr(
  //     'd',
  //     area()
  //       .x((d) => x(d.date))
  //       .y0((d) => y(d.low_95))
  //       .y1((d) => y(d.high_95))
  //   );

  // grafica
  //   .append('path')
  //   .datum(muertesPrediccion)
  //   .attr('fill', rojoMenosClaro)
  //   .attr('stroke', 'none')
  //   .attr(
  //     'd',
  //     area()
  //       .x((d) => x(d.date))
  //       .y0((d) => y(d.low_80))
  //       .y1((d) => y(d.high_80))
  //   );

  // grafica
  //   .append('path')
  //   .datum(muertesPrediccion)
  //   .attr('fill', rojoOscuro)
  //   .attr('stroke', 'none')
  //   .attr(
  //     'd',
  //     area()
  //       .x((d) => x(d.date))
  //       .y0((d) => y(d.low_50))
  //       .y1((d) => y(d.high_50))
  //   );

  // grafica
  //   .selectAll('prediccion')
  //   .data(casosPreliminares)
  //   .enter()
  //   .append('circle')
  //   .attr('fill', 'red')
  //   .attr('r', 2)
  //   .attr('cx', (d) => x(d.date))
  //   .attr('cy', (d) => y(d.num_diseased));
}

actualizarDimensiones();
inicio();
const opcionCasos = document.getElementById('opcionCasos');
const opcionMuertes = document.getElementById('opcionMuertes');

resolucionBtn.onchange = () => {
  grafica.cambiarResolucion(obtenerResolucion()).actualizarEjeY().dibujar(0);
};

opcionCasos.onclick = () => {
  if (!indicadorBtn.checked) return;
  indicadorBtn.click();
};

opcionMuertes.onclick = () => {
  if (indicadorBtn.checked) return;
  indicadorBtn.click();
};

indicadorBtn.onchange = () => {
  grafica.cambiarIndicador(obtenerIndicador()).actualizarEjeY().dibujar();
};

window.addEventListener('resize', diferir(actualizarDimensiones, 150));
