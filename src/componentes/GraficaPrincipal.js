import { select, pointer } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line } from 'd3-shape';
import { bisector, max } from 'd3-array';
import { timeWeek } from 'd3-time';
import { transition } from 'd3-transition';
import { thresholdScott } from 'd3-array';

import { fechaEnEspañol } from '../utilidades/ayudas';
import { sumarRestarDias } from '../utilidades/ayudas';

/**
 *
 */
export default class GraficaPrincipal {
  datos;
  dims;
  indicador = 'muertes';
  resolucion = 'semanal';
  /**
   *
   * @param {HTMLElement} contenedor Contenedor donde ubicar la gráfica.
   */
  constructor(contenedor) {
    this.grafica = select('#grafica');
    this.svg = select(contenedor).append('svg');
    this.vis = this.svg.append('g').attr('class', 'visualizacionPrincipal');
    this.indicadorX = this.vis.append('g').attr('class', 'eje');
    this.indicadorY = this.vis.append('g').attr('class', 'eje');
    this.puntosCasos = this.vis.append('g').attr('class', 'puntos');
    this.linea = this.vis.append('path').attr('class', 'lineaPrincipal sinFondo');
    this.lineaPreliminar = this.vis.append('path').attr('class', 'lineaPreliminar sinFondo');
    this.lineaPronostico = this.vis.append('path').attr('class', 'lineaPronostico sinFondo');
    this.foco = this.vis.append('circle').attr('class', 'foco sinFondo').attr('r', 8.5);
    this.infoFoco = this.grafica
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip')
      .style('background-color', '#fffdf8')
      .style('color', '#08173e')
      .style('border', 'solid')
      .style('border-width', '1px')
      .style('border-radius', '5px')
      .style('border-color', '#af2828')
      .style('padding', '5px')
      .style('position', 'absolute')
      .style('width', '200px')
      .style('height', '100px');

    this.ejeX = scaleTime();
    this.ejeY = scaleLinear();

    this.areaInteraccion = this.vis
      .append('rect')
      .attr('class', 'areaInteraccion sinFondo')
      .on('mouseover', this.#sobreGrafica)
      .on('mouseout', this.#salidaDeGrafica)
      .on('mousemove', this.#movSobreGrafica);
  }

  #interseccionX = bisector((d) => d.fecha).left;
  #posX = (d) => this.ejeX(d.fecha);
  #posY = (d) => this.ejeY(d[this.indicador]);
  #radioPuntos = () => (this.resolucion === 'semanal' ? 3.5 : 1.5);
  #attrLinea = (grupo) => {
    grupo
      .attr('stroke-width', () => (this.resolucion === 'semanal' ? 1.5 : 0.5))
      .attr('d', line().x(this.#posX).y(this.#posY));
  };

  #sobreGrafica = (e) => {
    e.stopPropagation();
    this.foco.style('opacity', 1);
  };

  #salidaDeGrafica = (e) => {
    e.stopPropagation();
    this.foco.style('opacity', 0);
    this.infoFoco.style('opacity', 0);
  };

  #movSobreGrafica = (e) => {
    e.stopPropagation();
    if (!this.ejeX) return;
    const datos = this.datos.casos[this.resolucion];
    const x0 = this.ejeX.invert(pointer(e)[0]);
    const i = this.#interseccionX(datos, x0);
    const registro = datos[i];
    if (registro) {
      this.foco.attr('cx', this.ejeX(registro.fecha)).attr('cy', this.ejeY(registro[this.indicador]));
      this.sobreFoco(registro, e);
    }
  };

  sobreFoco(registro, e) {
    const pos = pointer(e);
    this.infoFoco
      .style('opacity', 0.9)
      .style('z-index', 99)
      .style('left', pos[0] + 90 + 'px')
      .style('top', pos[1] + 180 + 'px');
    if (this.resolucion === 'semanal') {
      let fechaInicial = sumarRestarDias(registro.fecha, -6);
      this.infoFoco.html(
        'Del ' +
          '<b>' +
          fechaEnEspañol(fechaInicial) +
          '</b>' +
          ' ' +
          'al ' +
          '<b>' +
          fechaEnEspañol(registro.fecha) +
          '</b>' +
          ': ' +
          registro[this.indicador] +
          ' ' +
          this.indicador
      );
    } else if (this.resolucion === 'diario') {
      this.infoFoco.html(
        '<b>' + fechaEnEspañol(registro.fecha) + '</b>' + ': ' + registro[this.indicador] + ' ' + this.indicador
      );
    }
  }

  escalar(dims) {
    const { ancho, alto } = dims;
    this.svg.attr('width', ancho + dims.margenHorizontal).attr('height', alto + dims.margenVertical);
    this.vis.attr('transform', `translate(${dims.izquierda},${dims.superior})`);
    this.indicadorX.attr('transform', `translate(0, ${alto})`);
    this.areaInteraccion.attr('width', ancho).attr('height', alto);

    if (this.datos) {
      this.actualizarEjeX();
      this.actualizarEjeY();
      this.dibujar();
    }

    this.dims = dims;
    // if (this.datos) this.dibujar();
    return this;
  }

  actualizarEjeX(duracion = 500) {
    this.ejeX.domain([this.datos.fechaInicial, this.datos.fechaFinal]).range([0, this.dims.ancho]);
    this.indicadorX
      .transition()
      .duration(duracion)
      .call(axisBottom(this.ejeX).ticks(timeWeek.every(4)));

    return this;
  }

  actualizarEjeY(duracion = 500) {
    this.ejeY
      .domain([0, max(this.datos.casos[this.resolucion].map((obj) => obj[this.indicador]))])
      .range([this.dims.alto, 0]);
    this.indicadorY.transition().duration(duracion).call(axisLeft(this.ejeY));
    return this;
  }

  dibujar(duracion = 500) {
    const transicion = transition().duration(duracion);
    const datos = this.datos.casos[this.resolucion];
    const datos2 = this.datos.intervalos[this.resolucion];

    this.linea.datum(datos).transition(transicion);
    this.#attrLinea(this.linea);

    // this.lineaPreliminar.datum(datos.preliminar).transition(transicion);
    // this.#attrLinea(this.lineaPreliminar);

    if (this.indicador === 'muertes') {
      this.lineaPronostico
        .datum(datos2.pronostico)
        .transition(transicion)
        .attr('stroke-width', () => (this.resolucion === 'semanal' ? 1.5 : 0.5))
        .attr(
          'd',
          line()
            .x(this.#posX)
            .y((d) => this.ejeY(d.promedio))
        );
    } else {
      this.lineaPronostico.attr('d', '');
    }

    this.puntosCasos
      .selectAll('circle')
      .data(datos)
      .join(
        (enter) =>
          enter
            .append('circle')
            .attr('class', 'caso')
            .attr('cx', this.#posX)
            .attr('cy', this.#posY)
            .call((enter) => enter.transition(transicion).attr('r', this.#radioPuntos)),
        (update) =>
          update.call((update) =>
            update.transition(transicion).attr('cx', this.#posX).attr('cy', this.#posY).attr('r', this.#radioPuntos)
          ),
        (exit) =>
          exit.call((exit) =>
            exit
              .transition()
              .duration(500 / 2)
              .attr('r', 0)
              .remove()
          )
      );
    return this;
  }

  conectarDatos(datos) {
    this.datos = datos;
    console.log(datos);
    return this;
  }

  cambiarIndicador(indicador) {
    this.indicador = indicador;
    return this;
  }

  cambiarResolucion(resolucion) {
    this.resolucion = resolucion;
    return this;
  }
}
