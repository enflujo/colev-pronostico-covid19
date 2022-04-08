import './scss/estilos.scss';
import { diferir } from './utilidades/ayudas';
import componerDatos from './utilidades/componerDatos';
import GraficaPrincipal from './componentes/GraficaPrincipal';
import Zoom from './componentes/Zoom';

const contenedorGrafica = document.getElementById('grafica');
const contenedorZoom = document.getElementById('zoom');
const grafica = new GraficaPrincipal(contenedorGrafica);
const zoom = new Zoom(contenedorZoom);

const dims = {
  principal: {
    superior: 0,
    derecha: 0,
    inferior: 40,
    izquierda: 60,
  },
  zoom: {
    izquierda: 60,
  },
};
dims.principal.margenHorizontal = dims.principal.derecha + dims.principal.izquierda;
dims.principal.margenVertical = dims.principal.superior + dims.principal.inferior;

const obtenerResolucion = () => (resolucionBtn.checked ? 'semanal' : 'diario');
const obtenerIndicador = () => (indicadorBtn.checked ? 'muertes' : 'casos');

function actualizarDimensiones() {
  dims.principal.ancho = contenedorGrafica.offsetWidth - dims.principal.margenHorizontal;
  dims.principal.alto = contenedorGrafica.offsetHeight - dims.principal.margenVertical;
  dims.zoom.ancho = contenedorZoom.offsetWidth - dims.principal.margenHorizontal;
  dims.zoom.alto = contenedorZoom.offsetHeight;
  grafica.escalar(dims.principal);
  zoom.escalar(dims.zoom);
}

async function inicio() {
  const datos = await componerDatos();
  const indicador = obtenerIndicador();
  const resolucion = obtenerResolucion();
  grafica
    .cambiarIndicador(indicador)
    .cambiarResolucion(resolucion)
    .conectarDatos(datos)
    .actualizarEjeX()
    .actualizarEjeY();

  zoom.cambiarIndicador().cambiarIndicador(indicador).cambiarResolucion(resolucion).conectarDatos(datos);

  dibujar();
}

function dibujar() {
  grafica.dibujar();
  zoom.dibujar();
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
const indicadorBtn = document.getElementById('indicador');
const resolucionBtn = document.getElementById('resolucion');
const opcionCasos = document.getElementById('opcionCasos');
const opcionMuertes = document.getElementById('opcionMuertes');
const opcionSemanas = document.getElementById('opcionSemanas');
const opcionDias = document.getElementById('opcionDias');

resolucionBtn.onchange = () => {
  grafica.cambiarResolucion(obtenerResolucion()).actualizarEjeY().dibujar(0);
  zoom.cambiarResolucion(obtenerResolucion()).dibujar(0);

  if (resolucionBtn.checked) {
    opcionSemanas.classList.add('seleccionado');
    opcionDias.classList.remove('seleccionado');
  } else {
    opcionSemanas.classList.remove('seleccionado');
    opcionDias.classList.add('seleccionado');
  }
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
  zoom.cambiarIndicador(obtenerIndicador()).dibujar();
  if (indicadorBtn.checked) {
    opcionMuertes.classList.add('seleccionado');
    opcionCasos.classList.remove('seleccionado');
  } else {
    opcionMuertes.classList.remove('seleccionado');
    opcionCasos.classList.add('seleccionado');
  }
};

window.addEventListener('resize', diferir(actualizarDimensiones, 150));
