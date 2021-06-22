import './scss/styles.scss';
import csv from './datos/deaths_df.csv';

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

window.onresize = ajustar;
