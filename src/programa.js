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
  /**
   * Linea de muertes
   */

  grafica.dibujar();
  grafica.focus();
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

fechaPronostico.onchange = inicio;

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
