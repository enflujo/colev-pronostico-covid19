import { pointer, axisBottom, axisLeft, line, bisector, max, timeWeek, transition } from 'd3';
import Grafica from './Grafica';

export default class GraficaPrincipal extends Grafica {
  constructor(contenedor) {
    super(contenedor);

    this.indicadorX = this.vis.append('g').attr('class', 'eje');
    this.indicadorY = this.vis.append('g').attr('class', 'eje');
    this.puntosCasos = this.vis.append('g').attr('class', 'puntos');
    this.lineaPronostico = this.vis.append('path').attr('class', 'lineaPronostico sinFondo');
    this.foco = this.vis.append('circle').attr('class', 'foco sinFondo').attr('r', 8.5);

    this.areaInteraccion = this.vis
      .append('rect')
      .attr('class', 'areaInteraccion sinFondo')
      .on('mouseover', this.#sobreGrafica)
      .on('mouseout', this.#salidaDeGrafica)
      .on('mousemove', this.#movSobreGrafica);
  }

  #interseccionX = bisector((d) => d.fecha).left;

  #radioPuntos = () => (this.resolucion === 'semanal' ? 3.5 : 1.5);

  #sobreGrafica = (e) => {
    e.stopPropagation();
    this.foco.style('opacity', 1);
  };

  #salidaDeGrafica = (e) => {
    e.stopPropagation();
    this.foco.style('opacity', 0);
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
    }
  };

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
    this._attrLinea(this.linea);

    if (this.indicador === 'muertes') {
      this.lineaPronostico
        .datum(datos2.pronostico)
        .transition(transicion)
        .attr('stroke-width', () => (this.resolucion === 'semanal' ? 1.5 : 0.5))
        .attr(
          'd',
          line()
            .x(this._posX)
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
            .attr('cx', this._posX)
            .attr('cy', this._posY)
            .call((enter) => enter.transition(transicion).attr('r', this.#radioPuntos)),
        (update) =>
          update.call((update) =>
            update.transition(transicion).attr('cx', this._posX).attr('cy', this._posY).attr('r', this.#radioPuntos)
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
}
