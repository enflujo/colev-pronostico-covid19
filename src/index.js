import './scss/estilos.scss';
import { diferir } from './utilidades/ayudas';
import componerDatos from './utilidades/componerDatos';
import GraficaPrincipal from './componentes/GraficaPrincipal';

const contenedorGrafica = document.getElementById('grafica');

const grafica = new GraficaPrincipal(contenedorGrafica);
const dims = { superior: 100, derecha: 30, inferior: 150, izquierda: 60 };
dims.margenHorizontal = dims.derecha + dims.izquierda;
dims.margenVertical = dims.superior + dims.inferior;

const obtenerResolucion = () => (resolucionBtn.checked ? 'semanal' : 'diario');
const obtenerIndicador = () => (indicadorBtn.checked ? 'muertes' : 'casos');
const obtenerPronostico = () => (pronosticoBtn.checked ? 'graficar' : 'esconder');

function actualizarDimensiones() {
  dims.antiguoAncho = dims.ancho;
  dims.ancho = contenedorGrafica.offsetWidth - dims.margenHorizontal;
  dims.alto = contenedorGrafica.offsetHeight - dims.margenVertical;
  grafica.escalar(dims);
}

async function inicio() {
  const datos = await componerDatos();

  grafica
    .cambiarIndicador(obtenerIndicador())
    .cambiarResolucion(obtenerResolucion())
    .cambiarPronostico(obtenerPronostico())
    .conectarDatos(datos)
    .actualizarEjeX()
    .actualizarEjeY();
  dibujar();
  grafica.dibujarLeyenda();
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
  //       .x((d) => x(d.))
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
  grafica.focus();

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
const pronosticoBtn = document.getElementById('pronostico');

const opcionCasos = document.getElementById('opcionCasos');
const opcionMuertes = document.getElementById('opcionMuertes');
const opcionSemanas = document.getElementById('opcionSemanas');
const opcionDias = document.getElementById('opcionDias');
const opcionPronosticoOn = document.getElementById('opcionPronosticoOn');
const opcionPronosticoOff = document.getElementById('opcionPronosticoOff');

const fechaPronostico = document.getElementById('seleccionePronostico');

const antes = document.getElementById('antes');
const despues = document.getElementById('despues');

resolucionBtn.onchange = () => {
  // grafica.cambiarResolucion(obtenerResolucion()).actualizarEjeY().dibujar(0);
  inicio();
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
  // grafica.cambiarIndicador(obtenerIndicador()).actualizarEjeY().dibujar();
  inicio();
  if (indicadorBtn.checked) {
    opcionMuertes.classList.add('seleccionado');
    opcionCasos.classList.remove('seleccionado');
  } else {
    opcionMuertes.classList.remove('seleccionado');
    opcionCasos.classList.add('seleccionado');
  }
};

opcionPronosticoOff.onclick = () => {
  if (!pronosticoBtn.checked) return;
  pronosticoBtn.click();
};

opcionPronosticoOn.onclick = () => {
  if (pronosticoBtn.checked) return;
  pronosticoBtn.click();
};

pronosticoBtn.onchange = () => {
  grafica.cambiarIndicador(obtenerPronostico());
  inicio();
  if (pronosticoBtn.checked) {
    opcionPronosticoOn.classList.add('seleccionado');
    opcionPronosticoOff.classList.remove('seleccionado');
  } else {
    opcionPronosticoOn.classList.remove('seleccionado');
    opcionPronosticoOff.classList.add('seleccionado');
  }
};

fechaPronostico.onchange = () => {
  console.log('actualizar pronóstico');
  inicio();
  // // grafica.actualizarEjeX()
  // // grafica.actualizarEjeY()
  // grafica.dibujar();
};

// var i = 0
// Array.from(fechaPronostico.options).forEach(function(option_element) {
//   console.log(option_element.value)
//   setTimeout(function() {
//     i++
//     fechaPronostico.value = option_element.value
//     inicio()
//   }, 1000 * i);
// })

antes.onclick = () => {
  const i = fechaPronostico.selectedIndex;
  if (i > 0) {
    fechaPronostico.selectedIndex = i - 1;
    inicio();
  }
};

despues.onclick = () => {
  const i = fechaPronostico.selectedIndex;
  if (i < fechaPronostico.length) {
    fechaPronostico.selectedIndex = i + 1;
    inicio();
  }
};

window.addEventListener('resize', diferir(actualizarDimensiones, 150));
