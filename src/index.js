import './scss/styles.scss';
import { limpiarDatos } from './utilidades/ayudas';
import { csv as fetchCSV } from 'd3-fetch';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { area, line } from 'd3-shape';
import { brushX } from 'd3-brush';
import './_canvas';

// set the dimensions and margins of the graph
const margin = { top: 100, right: 30, bottom: 150, left: 60 },
  width = window.innerWidth - margin.left - margin.right,
  height = window.innerHeight - margin.top - margin.bottom;
const rojoClaro = '#d6a09f';
const rojoMenosClaro = '#cc8785';
const rojoOscuro = '#c57876';

// append the svg object to the body of the page
const grafica = select('#grafica')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

async function inicio() {
  const datosMuertes = await fetchCSV('/datos/deaths_df.csv');
  const datosCasos = await fetchCSV('/datos/cases.csv');
  const muertes = limpiarDatos(datosMuertes);
  const casos = limpiarDatos(datosCasos);
  const muertesEstimado = muertes.filter((caso) => caso.type === 'estimate');
  const muertesPrediccion = muertes.filter((caso) => caso.type === 'forecast');
  const casosComprobados = casos.filter((caso) => caso.type === 'fitted');
  const casosPreliminares = casos.filter((caso) => caso.type === 'preliminary');
  const fechaInicial = muertes[0].date;
  const fechaFinal = muertes[muertes.length - 1].date;

  const x = scaleTime().domain([fechaInicial, fechaFinal]).range([0, width]);
  const y = scaleLinear().domain([0, 200]).range([height, 0]);

  const clip = svg
    .append('defs')
    .append('svg:clipPath')
    .attr('id', 'clip')
    .append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('x', 0)
    .attr('y', 0);

  const brush = brushX // Add the brush feature using the d3.brush function
    .extent([
      [0, 0],
      [width, height],
    ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on('end', updateChart);

  grafica.append('g').attr('transform', `translate(0, ${height})`).call(axisBottom(x));
  grafica.append('g').call(axisLeft(y));
  console.log(casosComprobados, casosPreliminares);
  grafica
    .append('path')
    .datum(muertesEstimado)
    .attr('fill', '#cce5df')
    .attr('stroke', 'none')
    .attr(
      'd',
      area()
        .x((d) => x(d.date))
        .y0((d) => y(d.low_95))
        .y1((d) => y(d.high_95))
    );

  grafica
    .append('path')
    .datum(muertesEstimado)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr(
      'd',
      line()
        .x((d) => x(d.date))
        .y((d) => y(d.median))
    );

  grafica
    .selectAll('casos')
    .data(casosComprobados)
    .enter()
    .append('circle')
    .attr('class', 'puntoCasoComprobado')
    .attr('r', 2)
    .attr('cx', (d) => x(d.date))
    .attr('cy', (d) => y(d.num_diseased));

  grafica
    .append('path')
    .datum(muertesPrediccion)
    .attr('fill', rojoClaro)
    .attr('stroke', 'none')
    .attr(
      'd',
      area()
        .x((d) => x(d.date))
        .y0((d) => y(d.low_95))
        .y1((d) => y(d.high_95))
    );

  grafica
    .append('path')
    .datum(muertesPrediccion)
    .attr('fill', rojoMenosClaro)
    .attr('stroke', 'none')
    .attr(
      'd',
      area()
        .x((d) => x(d.date))
        .y0((d) => y(d.low_80))
        .y1((d) => y(d.high_80))
    );

  grafica
    .append('path')
    .datum(muertesPrediccion)
    .attr('fill', rojoOscuro)
    .attr('stroke', 'none')
    .attr(
      'd',
      area()
        .x((d) => x(d.date))
        .y0((d) => y(d.low_50))
        .y1((d) => y(d.high_50))
    );

  grafica
    .selectAll('prediccion')
    .data(casosPreliminares)
    .enter()
    .append('circle')
    .attr('fill', 'red')
    .attr('r', 2)
    .attr('cx', (d) => x(d.date))
    .attr('cy', (d) => y(d.num_diseased));
}
inicio();
