import { select } from 'd3-selection';
import { scaleTime, scaleLinear, line } from 'd3';

export default class Grafica {
  datos;
  dims;
  indicador = 'muertes';
  resolucion = 'semanal';

  constructor(contenedor) {
    this.svg = select(contenedor).append('svg');
    this.vis = this.svg.append('g').attr('class', 'visualizacionPrincipal');
    this.linea = this.vis.append('path').attr('class', 'lineaPrincipal sinFondo');
    this.ejeX = scaleTime();
    this.ejeY = scaleLinear();
  }

  _posX = (d) => this.ejeX(d.fecha);
  _posY = (d) => this.ejeY(d[this.indicador]);
  _attrLinea = (grupo) => {
    grupo
      .attr('stroke-width', () => (this.resolucion === 'semanal' ? 1.5 : 0.5))
      .attr('d', line().x(this._posX).y(this._posY));
  };

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
}
