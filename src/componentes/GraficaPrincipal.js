import { select, pointer } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line } from 'd3-shape';
import { bisector } from 'd3-array';

export default class {
  constructor() {
    this.contenedor = document.getElementById('grafica');
    this.svg = select(this.contenedor).append('svg');
    this.vis = this.svg.append('g');
    this.indicadorX = this.vis.append('g');
    this.indicadorY = this.vis.append('g');
    this.linea = this.vis.append('path').attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 1.5);
    this.foco = this.vis
      .append('g')
      .append('circle')
      .style('fill', 'none')
      .attr('stroke', 'black')
      .attr('r', 8.5)
      .style('opacity', 0);
    this.interseccionX = bisector((d) => d.i).left;
    this.dims;
    this.datos;
    this.ejeX;
    this.ejeY;
    this.indicesX;

    this.contenedor.onmouseover = this._sobreGrafica;
    this.contenedor.onmouseout = this._salidaDeGrafica;
    this.contenedor.onmousemove = this._movSobreGrafica;
  }

  _sobreGrafica = () => {
    this.foco.style('opacity', 1);
  };

  _salidaDeGrafica = () => {
    this.foco.style('opacity', 0);
  };

  _movSobreGrafica = (e) => {
    if (!this.ejeX) return;
    const x0 = this.indicesX.invert(pointer(e)[0]);
    const i = this.interseccionX(this.datos, x0, 1);
    const selectedData = this.datos[i];
    console.log(x0, i);
    // this.foco.attr('cx', this.ejeX(selectedData.fecha)); // .attr('cy', y(selectedData.y))
    // focusText
    //   .html('x:' + selectedData.x + '  -  ' + 'y:' + selectedData.y)
    //   .attr('x', x(selectedData.x) + 15)
    //   .attr('y', y(selectedData.y));
  };

  escalar(dims) {
    this.dims = dims;
    this.svg.attr('width', dims.ancho + dims.margenHorizontal).attr('height', dims.alto + dims.margenVertical);
    this.vis.attr('transform', `translate(${dims.izquierda},${dims.superior})`);
    this.indicadorX.attr('transform', `translate(0, ${dims.alto})`);
    return this;
  }

  actualizarEjeX(duracion = 500) {
    this.ejeX = scaleTime().domain(this.dominioX).range([0, this.dims.ancho]);
    this.indicadorX.transition().duration(duracion).call(axisBottom(this.ejeX));

    return this;
  }

  actualizarEjeY(dominio, duracion = 500) {
    this.ejeY = scaleLinear().domain(dominio).range([this.dims.alto, 0]);
    this.indicadorY.transition().duration(duracion).call(axisLeft(this.ejeY));
    return this;
  }

  dibujar(indicador, duracion = 500) {
    this.linea
      .datum(this.datos)
      .transition()
      .duration(duracion)
      .attr(
        'd',
        line()
          .x((d) => this.ejeX(d.fechaInicial))
          .y((d) => this.ejeY(indicador === 'muertes' ? d.muertes : d.casos))
      );

    return this;
  }

  conectarDatos(datos) {
    this.datos = datos;
    this.indicesX = scaleLinear().domain(this.dominioX).range([0, this.datos.length]);
    console.log(this.indicesX);
  }
}
