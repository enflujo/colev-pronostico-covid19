import './scss/styles.scss';
import csv from './datos/deaths_df.csv';
import csv2 from './datos/cases_df.csv'

const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');

const estimado = csv.filter((caso) => caso.type === 'estimate');
const forecast = csv.filter((caso) => caso.type === 'forecast');
const fechaInicial = new Date(csv[0].date);
const duracion = deFechaADias(new Date(csv[csv.length - 1].date) - fechaInicial);
const grisClaro = '#80808066';
const grisOscuro = '#80808099';
const PiDos = 2 * Math.PI;
let base;
let pasoDia;


ajustar();

crearSistemaCoordenadas();


function deFechaADias(fecha) {
  return fecha / (1000 * 60 * 60 * 24);
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
let x_axis_distance_grid_lines = 50;
let y_axis_distance_grid_lines = pasoDia;
let x_axis_starting_point = { number: 1, suffix: '\u03a0' };
let y_axis_starting_point = { number: 1, suffix: '' };
let num_lines_x = (window.innerHeight/x_axis_distance_grid_lines) | 0;
let num_lines_y = (window.innerWidth / pasoDia) | 0;
  // X-Axis
  for (let i = 0; i <= num_lines_x; i++) {
    ctx.beginPath();
    ctx.lineWidth = 1;
  
    if (i === x_axis_distance_grid_lines * i)
      ctx.strokeStyle = "#FF5733";
    else
      ctx.strokeStyle = "#e9e9e9";
    
    if (i == num_lines_x) {
      ctx.moveTo(0, x_axis_distance_grid_lines * i);
      ctx.lineTo(lienzo.width, x_axis_distance_grid_lines * i);
    }
    else {
      ctx.moveTo(0, x_axis_distance_grid_lines * i + 0.5);
      ctx.lineTo(lienzo.width, x_axis_distance_grid_lines * i + 0.5);
    }
    ctx.stroke();
  }
  // Y-Axis
  for(let i=0; i<=num_lines_y; i++) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    
    if (i == y_axis_distance_grid_lines) {
      ctx.strokeStyle = "#FF5733";
    }
    else {
      ctx.strokeStyle = "#e9e9e9";
    }
    if(i == num_lines_y) {
        ctx.moveTo(pasoDia*i, 0);
        ctx.lineTo(pasoDia*i, lienzo.height);
    }
    else {
        ctx.moveTo(pasoDia*i+0.5, 0);
        ctx.lineTo(pasoDia*i+0.5, lienzo.height);
    }
    ctx.stroke();
  }
  //TickLines X-Axis
  for(let i=y_axis_distance_grid_lines; i<(num_lines_y - y_axis_distance_grid_lines); i++) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#FF5733";

    ctx.moveTo(pasoDia*i+0.5, -30);
    ctx.lineTo(pasoDia*i+0.5, 30);
    ctx.stroke();

    ctx.font = '9px Arial';
    ctx.textAlign = 'start';
    ctx.fillText(x_axis_starting_point.number*i + x_axis_starting_point.suffix, pasoDia*i-2, 15);
  }
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

