import { transition, line } from 'd3';
import Grafica from './Grafica';

export default class Zoom extends Grafica {
  constructor(contenedor) {
    super(contenedor);
  }

  escalar(dims) {
    const { ancho, alto } = dims;
    this.svg.attr('width', ancho).attr('height', alto);
    this.vis.attr('transform', `translate(${dims.izquierda},0)`);

    if (this.datos) {
      this.dibujar();
    }

    this.dims = dims;

    return this;
  }

  dibujar(duracion = 200) {
    const transicion = transition().duration(duracion);
    const datos = this.datos.casos[this.resolucion];
    console.log(datos);
    this.linea
      .datum(datos)
      .transition(transicion)
      .attr('stroke-width', () => (this.resolucion === 'semanal' ? 1.5 : 0.5))
      .attr('d', line().x(this._posX).y(this._posY));

    return this;
  }
}
