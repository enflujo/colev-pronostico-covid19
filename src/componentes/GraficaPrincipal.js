import { select, pointer } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { area, line } from 'd3-shape';
import { bisector, max } from 'd3-array';
import { timeWeek } from 'd3-time';
import { transition } from 'd3-transition';
import { brushSelection, brushX } from 'd3-brush';
import { utcDay } from 'd3-time';
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
  pronostico = 'graficar';

  /**
   *
   * @param {HTMLElement} contenedor Contenedor donde ubicar la gráfica.
   */
  constructor(contenedor) {
    this.grafica = select('#grafica');
    this.svg = select(contenedor).append('svg');
    this.vis = this.svg.append('g').attr('class', 'visualizacionPrincipal');

    this.enfoque = select('#zoom')
      .append('svg')
      .attr('class', 'visualizacionEnfoque')
      .attr('id', 'visualizacionEnfoque');

    this.indicadorX = this.vis.append('g').attr('class', 'eje').attr('id', 'ejeX');
    this.indicadorY = this.vis.append('g').attr('class', 'eje').attr('id', 'ejeY');

    this.linea = this.vis.append('path').attr('class', 'lineaPrincipal sinLinea').attr('id', 'lineaPrincipal');
    this.lineaPreliminar = this.vis.append('path').attr('class', 'lineaPreliminar sinFondo');
    this.intervaloDeConfianza95 = this.vis.append('path').attr('class', 'intervaloDeConfianza');
    this.intervaloDeConfianza80 = this.vis.append('path').attr('class', 'intervaloDeConfianza');

    this.intervaloDeConfianza50 = this.vis.append('path').attr('class', 'intervaloDeConfianza');
    this.lineaPronostico = this.vis.append('path').attr('class', 'lineaPronostico sinFondo');

    this.puntosCasos = this.vis.append('g').attr('class', 'puntos');
    this.foco = this.vis.append('circle').attr('class', 'foco sinLinea').attr('r', 3);
    this.infoFoco = this.grafica.append('div').style('opacity', 0).attr('class', 'infoFoco');
    this.lineaFoco = this.vis.append('path').attr('class', 'lineaFoco sinFondo');

    this.leyenda = select('#leyenda').append('svg').attr('class', 'leyenda');

    this.ejeX = scaleTime();
    this.ejeY = scaleLinear();
    this.ejeYFocus = this.ejeY.copy();

    this.areaInteraccion = this.vis
      .append('rect')
      .attr('class', 'areaInteraccion sinFondo')
      .on('mouseover', this.#sobreGrafica)
      .on('mouseout', this.#salidaDeGrafica)
      .on('mousemove', this.#movSobreGrafica);

    this.vis.append('clipPath').attr('id', 'clip');
  }

  #interseccionX = bisector((d) => d.fecha).left;
  #posX = (d) => this.ejeX(d.fecha);
  #posY = (d) => this.ejeY(d[this.indicador]);

  #posYFocus = (d) => this.ejeYFocus(d[this.indicador]);

  #radioPuntos = () => (this.resolucion === 'semanal' ? 3.5 : 1.5);
  #attrLinea = (grupo) => {
    grupo
      // .attr('stroke-width', () => (this.resolucion === 'semanal' ? 1.5 : 0.5))
      .attr('d', area(this.#posX, this.#posY, this.dims.alto));
  };

  #sobreGrafica = (e) => {
    e.stopPropagation();
    this.foco.style('opacity', 1);
  };

  #salidaDeGrafica = (e) => {
    e.stopPropagation();
    this.foco.style('opacity', 0);
    this.infoFoco.style('opacity', 0);
    this.lineaFoco.style('opacity', 0);
  };

  #movSobreGrafica = (e) => {
    e.stopPropagation();
    if (!this.datos) return;
    if (!this.ejeX) return;
    if (this.fechaInicialFocus || this.fechaFinalFocus) {
      this.ejeX.domain([this.fechaInicialFocus, this.fechaFinalFocus]).range([0, this.dims.ancho]);
    }

    const datos = this.datos.casos[this.resolucion];
    const x0 = this.ejeX.invert(pointer(e)[0]);
    const i = this.#interseccionX(datos, x0);
    const registro = datos[i];

    const datos1 = this.datos.intervalos[this.resolucion].pronostico;
    const x1 = this.ejeX.invert(pointer(e)[0]);
    const j = this.#interseccionX(datos1, x1);

    if (datos1[j] && datos1[j].fecha.getTime() == datos[i].fecha.getTime()) {
      registro.promedio = datos1[j].promedio;
    }

    if (registro) {
      this.foco.attr('cx', this.ejeX(registro.fecha)).attr('cy', this.ejeY(registro[this.indicador]));
      this.sobreFoco(registro);
    }
  };

  sobreFoco(registro) {
    const posPuntoX = this.ejeX(registro.fecha);
    const posPuntoY = this.ejeY(registro[this.indicador]);
    const linea = 'M' + posPuntoX + ',' + posPuntoY + ' L' + posPuntoX + ', -40';

    this.lineaFoco.style('opacity', 1);
    this.infoFoco
      .style('opacity', 0.9)
      .style('left', posPuntoX + 60 + 'px')
      .style('top', 200 + 'px');

    if (registro.promedio) {
      this.pronosticoString = registro.promedio.toFixed() + ' pronóstico';
    } else {
      this.pronosticoString = '';
    }

    this.lineaFoco.attr('d', linea);
    if (this.resolucion === 'semanal') {
      let fechaInicial = sumarRestarDias(registro.fecha, -6);

      this.infoFoco.html(
        fechaEnEspañol(fechaInicial) +
          ' ' +
          ' - ' +
          fechaEnEspañol(registro.fecha) +
          ': <br/>' +
          registro[this.indicador] +
          ' ' +
          this.indicador +
          ' <br/>' +
          this.pronosticoString
      );
    } else if (this.resolucion === 'diario') {
      this.infoFoco.html(
        fechaEnEspañol(registro.fecha) +
          ': <br/>' +
          registro[this.indicador] +
          ' ' +
          this.indicador +
          ' <br/>' +
          this.pronosticoString
      );
    }
  }

  escalar(dims) {
    const { antiguoAncho, ancho, alto } = dims;

    this.svg.attr('width', ancho + dims.margenHorizontal).attr('height', alto + dims.margenVertical);
    this.vis.attr('transform', `translate(${dims.izquierda},${dims.superior})`);
    this.indicadorX.attr('transform', `translate(0, ${alto})`);
    this.areaInteraccion.attr('width', ancho).attr('height', alto);

    select('#clip').append('rect').attr('width', ancho).attr('height', alto);
    select('#visualizacionEnfoque')
      .attr('width', ancho + dims.margenHorizontal)
      .attr('viewBox', [0, 0, dims.ancho + dims.margenHorizontal, dims.alto / 2 + 50])
      .attr('max-width', dims.ancho)
      .style('display', 'block');
    this.enfoque.attr('transform', `translate(${dims.izquierda},${-dims.superior})`);

    if (select('#brush').node() || this.fechaInicialFocus) {
      const sel = brushSelection(select('#brush').node()).map(function (x) {
        return x * (ancho / antiguoAncho);
      });

      this.gb.attr('width', dims.ancho);

      this.brush.extent([
        [0, 0],
        [dims.ancho, dims.alto / 2],
      ]);

      if (this.datos) {
        this.update([this.fechaInicialFocus, this.fechaFinalFocus]);
      }
    }
    this.dims = dims;
    return this;
  }

  actualizarEjeX(duracion = 500) {
    if (select('#brush').node()) {
      this.ejeX.domain([this.fechaInicialFocus, this.fechaFinalFocus]).range([0, this.dims.ancho]);
      this.indicadorX.transition().duration(duracion).call(axisBottom(this.ejeX));
    } else {
      this.ejeX.domain([this.datos.fechaInicial, this.datos.fechaFinal]).range([0, this.dims.ancho]);
      this.indicadorX
        .transition()
        .duration(duracion)
        .call(axisBottom(this.ejeX).ticks(timeWeek.every(4)));
    }
    return this;
  }

  actualizarEjeY(duracion = 500) {
    if (this.indicador == 'muertes' && this.pronostico === 'graficar') {
      const maxCasos = max(this.datos.casos[this.resolucion].map((obj) => obj[this.indicador]));
      const maxAlto95 = max(this.datos.intervalos[this.resolucion]['pronostico'].map((obj) => obj['alto95']));
      const maxPromedio = max(this.datos.intervalos[this.resolucion]['pronostico'].map((obj) => obj['promedio']));
      this.ejeYFocus.domain([0, maxCasos]).range([this.dims.alto, 0]);
      this.ejeY
        .domain([0, max(this.datos.casos[this.resolucion].map((obj) => obj[this.indicador]))])
        .range([this.dims.alto, 0]);
      this.indicadorY.transition().duration(duracion).call(axisLeft(this.ejeY));
      return this;
    } else {
      this.ejeYFocus
        .domain([0, max(this.datos.casos[this.resolucion].map((obj) => obj[this.indicador]))])
        .range([this.dims.alto, 0]);
      this.ejeY
        .domain([0, max(this.datos.casos[this.resolucion].map((obj) => obj[this.indicador]))])
        .range([this.dims.alto, 0]);
      this.indicadorY.transition().duration(duracion).call(axisLeft(this.ejeY));
      return this;
    }
  }

  dibujarLeyenda() {
    this.leyenda.selectAll('*').remove();
    this.llaves = [
      [this.indicador, 'rgba(255, 255, 255, 0.7)'],
      ['pronóstico promedio', 'red'],
      ['intervalo de confianza 95', 'indigo'],
      ['intervalo de confianza 80', 'purple'],
      ['intervalo de confianza 50', 'darkorchid'],
    ];

    if (this.indicador == 'casos') {
      this.llaves = [this.llaves[0]];
    }

    this.leyenda
      .selectAll('mydots')
      .data(this.llaves)
      .enter()
      .append('circle')
      .attr('cx', 20)
      .attr('cy', (d, i) => 20 + i * 25)
      .attr('r', 7)
      .style('fill', (d) => d[1]);

    this.leyenda
      .selectAll('mylabels')
      .data(this.llaves)
      .enter()
      .append('text')
      .attr('x', 40)
      .attr('y', (d, i) => 20 + i * 25) // 100 is where the first dot appears. 25 is the distance between dots
      .style('fill', (d) => d[1])
      .text((d) => d[0])
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle');
  }

  dibujar(duracion = 500) {
    const transicion = transition().duration(duracion);
    const datos = this.datos.casos[this.resolucion];
    const datos2 = this.datos.intervalos[this.resolucion];

    this.linea.datum(datos).transition(transicion);
    this.#attrLinea(this.linea);

    if (this.indicador === 'muertes') {
      // https://d3-graph-gallery.com/graph/line_confidence_interval.html
      if (this.pronostico === 'graficar') {
        this.intervaloDeConfianza50
          .datum(datos2.pronostico)
          .transition(transicion)
          .duration(duracion)
          .attr('id', 'forecast50')
          .attr('class', 'rango')
          .attr('fill', 'darkorchid')
          .attr('opacity', 0.5)
          .attr('stroke', 'none')
          .attr(
            'd',
            area()
              .x(this.#posX)
              .y0((d) => this.ejeY(d.alto50))
              .y1((d) => this.ejeY(d.bajo50))
          );

        this.intervaloDeConfianza80
          .datum(datos2.pronostico)
          .transition(transicion)
          .duration(duracion)
          .attr('id', 'forecast80')
          .attr('class', 'rango')
          .attr('fill', 'purple')
          .attr('opacity', 0.5)
          .attr('stroke', 'none')
          .attr(
            'd',
            area()
              .x(this.#posX)
              .y0((d) => this.ejeY(d.alto80))
              .y1((d) => this.ejeY(d.bajo80))
          );
        this.intervaloDeConfianza95
          .datum(datos2.pronostico)
          .transition(transicion)
          .duration(duracion)
          .attr('id', 'forecast95')
          .attr('class', 'rango')
          .attr('fill', 'indigo')
          .attr('opacity', 0.5)
          .attr('stroke', 'none')
          .attr(
            'd',
            area()
              .x(this.#posX)
              .y0((d) => this.ejeY(d.alto95))
              .y1((d) => this.ejeY(d.bajo95))
          );

        this.lineaPronostico
          .datum(datos2.pronostico)
          .transition(transicion)
          .duration(duracion)
          .attr('stroke-width', () => (this.resolucion === 'semanal' ? 1.5 : 0.5))
          .attr(
            'd',
            line()
              .x(this.#posX)
              .y((d) => this.ejeY(d.promedio))
          );
      } else {
        this.lineaPronostico.attr('d', '');
        this.intervaloDeConfianza95.attr('d', '');
        this.intervaloDeConfianza80.attr('d', '');
        this.intervaloDeConfianza50.attr('d', '');
      }
    } else {
      this.lineaPronostico.attr('d', '');
      this.intervaloDeConfianza95.attr('d', '');
      this.intervaloDeConfianza80.attr('d', '');
      this.intervaloDeConfianza50.attr('d', '');
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

  focus() {
    if (!select('#brush').node()) {
      select('#zoom').selectAll('*').remove();
      this.enfoque = select('#zoom')
        .append('svg')
        .attr('class', 'visualizacionEnfoque')
        .attr('viewBox', [0, 0, this.dims.ancho + this.dims.margenHorizontal, this.dims.alto / 2 + 50]) // + this.dims.derecha + this.dims.izquierda +
        .style('display', 'block');
      this.enfoque.attr('transform', `translate(${this.dims.izquierda},${-this.dims.superior})`);
      this.brush = brushX()
        .extent([
          [0, 0],
          [this.dims.ancho, this.dims.alto / 2],
        ])
        .on('brush', this.brushed)
        .on('end', this.brushEnded);

      const defaultSelection = [0, this.ejeX.range()[1]];

      this.enfoque
        .append('g')
        .attr('class', 'eje')
        .call(this.#posX, this.ejeX, this.dims.alto)
        .call(axisBottom(this.ejeX.copy()))
        .attr('transform', `translate(0,${this.dims.alto / 2})`);

      this.enfoque
        .append('path')
        .datum(this.datos.casos[this.resolucion])
        .attr('class', 'lineaPrincipal sinLinea')
        .attr('d', area(this.#posX, this.#posYFocus, this.dims.alto))
        .attr('transform', 'scale(1.0,0.5)');

      this.gb = this.enfoque.append('g').attr('id', 'brush').call(this.brush).call(this.brush.move, defaultSelection);

      return this.enfoque.node();
    } else {
      this.actualizarEjeX();
      this.ejeX.domain([this.fechaInicialFocus, this.fechaFinalFocus]).range([0, this.dims.ancho]);
      this.dibujar();
      this.ejeX.domain([this.datos.fechaInicial, this.datos.fechaFinal]).range([0, this.dims.ancho]);
    }
  }

  brushed = ({ selection }) => {
    if (selection) {
      this.enfoque.property('value', selection.map(this.ejeX.invert, this.ejeX).map(utcDay.round));
      this.enfoque.dispatch('input');
      const focusedArea = this.enfoque.property('value');
      this.update(focusedArea);
    }
  };

  brushEnded = ({ selection }) => {
    if (!selection) {
      gb.call(this.brush.move, defaultSelection);
    }
  };

  update(focusedArea) {
    const [minX, maxX] = focusedArea;
    const maxY = max(this.datos.casos[this.resolucion], (d) =>
      minX <= d.fecha && d.fecha <= maxX ? d[this.indicador] : NaN
    );

    this.ejeX2 = this.ejeX.copy().domain([minX, maxX]).range([0, this.dims.ancho]);
    const ejeY2 = this.ejeY.copy().domain([0, maxY]);
    this.fechaInicialFocus = minX;
    this.fechaFinalFocus = maxX;

    this.actualizarEjeX();
    this.ejeX.domain([this.fechaInicialFocus, this.fechaFinalFocus]).range([0, this.dims.ancho]);
    this.dibujar();
    this.ejeX.domain([this.datos.fechaInicial, this.datos.fechaFinal]).range([0, this.dims.ancho]);
    this.indicadorX
      .transition()
      .duration(this.duracion)
      .call(axisBottom(this.ejeX2.copy()).ticks(timeWeek.every(4)));

    this.ejeY.domain([0, maxY]).range([this.dims.alto, 0]);
    this.indicadorY.transition().duration(this.duracion).call(axisLeft(ejeY2.copy()));

    this.foco.call(axisBottom(this.ejeX).ticks(timeWeek.every(4)));

    return focusedArea;
  }

  conectarDatos(datos) {
    this.datos = datos;
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

  cambiarPronostico(pronostico) {
    this.pronostico = pronostico;
    return this;
  }
}
