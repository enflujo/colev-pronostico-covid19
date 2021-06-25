import './scss/styles.scss';
import csv from './datos/deaths_df.csv';
import csv2 from './datos/cases_df.csv';

const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');

const estimado = csv.filter((caso) => caso.type === 'estimate');
const forecast = csv.filter((caso) => caso.type === 'forecast');
const fechaInicial = new Date(csv[0].date);
const fechaFinal = new Date(csv[csv.length - 1].date);
const duracion = deFechaADias(fechaFinal - fechaInicial);
const duracionMeses = calcularMeses(fechaInicial, fechaFinal);
const grisClaro = '#80808066';
const grisOscuro = '#80808099';
const PiDos = 2 * Math.PI;
let base;
let pasoDia;
let pasoMes;
const pasoCasos = 50;

ajustar();

crearSistemaCoordenadas();

function deFechaADias(fecha) {
  return fecha / (1000 * 60 * 60 * 24);
}

function calcularMeses(inicio, final) {
  let meses = (final.getFullYear() - inicio.getFullYear()) * 12;
  meses -= inicio.getMonth();
  meses += final.getMonth();
  return meses <= 0 ? 0 : meses;
}

function mesTexto(mes) {
  return new Date(new Date('1970-01-01').setMonth(mes))
    .toLocaleString('es', {
      month: 'short',
    })
    .toString();
}

console.log(csv, duracion, pasoDia);

function dibujarLinea(llave) {
  ctx.beginPath();
  ctx.strokeStyle = grisOscuro;
  estimado.forEach((fila, i) => {
    const x = pasoDia * deFechaADias(new Date(fila.date) - fechaInicial);
    const y = base - fila[llave];

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function ajustar() {
  lienzo.width = window.innerWidth;
  lienzo.height = window.innerHeight;
  pasoDia = (window.innerWidth / duracion) | 0;
  pasoMes = (window.innerWidth / duracionMeses) | 0;
  base = window.innerHeight - window.innerHeight / 2;

  ctx.beginPath();
  ctx.fillStyle = grisClaro;
  estimado.forEach((fila, i) => {
    const x = pasoDia * deFechaADias(new Date(fila.date) - fechaInicial);
    const y = base - fila.high_95;

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
  });

  for (let i = estimado.length - 1; i >= 0; i--) {
    const fila = estimado[i];
    const x = pasoDia * deFechaADias(new Date(fila.date) - fechaInicial);
    const y = base - fila.low_95;
    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();

  dibujarLinea('high_95');
  dibujarLinea('low_95');
  dibujarLinea('median');
}

function crearSistemaCoordenadas() {
  // let x_axis_distance_grid_lines = 50;
  // let y_axis_distance_grid_lines = pasoDia;
  // let x_axis_starting_point = { number: 1, suffix: '\u03a0' }; // este suffix imprime el icono de pi?
  // let y_axis_starting_point = { number: 1, suffix: '' };
  // let num_lines_y = (window.innerHeight / pasoDia) | 0;
  const baseTexto = window.innerHeight - 15;
  ctx.lineWidth = 1;
  ctx.font = '9px Arial';
  ctx.textAlign = 'start';
  ctx.strokeStyle = '#e9e9e9';
  ctx.fillStyle = 'black';

  // X-Axis: Cambie esto para que sean los meses y no los días
  for (let i = 0; i <= duracionMeses; i++) {
    const x = pasoMes * i;
    const mes = (fechaInicial.getMonth() + i) % 12;
    ctx.beginPath();
    ctx.moveTo(x, 0); // mover en x y comenzar arriba
    ctx.lineTo(x, lienzo.height); // dibujar linea hasta abajo
    ctx.stroke();
    ctx.fillText(mesTexto(mes), x, baseTexto);
  }

  // Y-Axis
  for (let i = 0; i <= pasoCasos * 4; i += pasoCasos) {
    const y = base - i;
    ctx.beginPath();

    // No entendí esta comparación para cambiar el color: si i es igual a y_axis_distance_grid_lines que es igual pasoDia?
    // if (i == y_axis_distance_grid_lines) {
    //   ctx.strokeStyle = '#FF5733';
    // } else {
    //   ctx.strokeStyle = '#e9e9e9';
    // }

    // Tampoco entendí esta parte
    // if (i == num_lines_y) {
    //   ctx.moveTo(pasoDia * i, 0);
    //   ctx.lineTo(pasoDia * i, lienzo.height);
    // } else {
    //   ctx.moveTo(pasoDia * i + 0.5, 0);
    //   ctx.lineTo(pasoDia * i + 0.5, lienzo.height);
    // }
    ctx.moveTo(0, y);
    ctx.lineTo(window.innerWidth, y);
    ctx.stroke();
    ctx.fillText(i, 0, y);
  }
  // //TickLines X-Axis
  // for (let i = y_axis_distance_grid_lines; i < num_lines_y - y_axis_distance_grid_lines; i++) {
  //   ctx.beginPath();
  //   ctx.lineWidth = 1;
  //   ctx.strokeStyle = '#FF5733';

  //   ctx.moveTo(pasoDia * i + 0.5, -30);
  //   ctx.lineTo(pasoDia * i + 0.5, 30);
  //   ctx.stroke();
  // }
  //TickLines Y-Axis
  // for(let i=1; i<(num_lines_x - x_axis_distance_grid_lines); i++) {
  //   ctx.beginPath();
  //   ctx.lineWidth = 1;
  //   ctx.strokeStyle = "#000";

  //   ctx.moveTo(-3, y_axis_distance_grid_lines*i+0.5);
  //   ctx.lineTo(3, y_axis_distance_grid_lines*i+0.5);
  //   ctx.stroke();

  //   // Text value at that point
  //   ctx.font = '9px Arial';
  //   ctx.textAlign = 'start';
  //   ctx.fillText(-y_axis_starting_point.number*i + y_axis_starting_point.suffix, 8, pasoDia*i+3);
  // }
}

window.onresize = ajustar;
