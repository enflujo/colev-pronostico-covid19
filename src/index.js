import './scss/styles.scss';
import csv from './datos/deaths_df.csv';
import csv2 from './datos/cases.csv';

const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');

const estimado = csv.filter((caso) => caso.type === 'estimate');
const data_fitted = csv2.filter((caso) => caso.type === 'fitted');
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


console.log(data_fitted, estimado);

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
  return new Date(new Date().setMonth(mes))
    .toLocaleString('es', {
      month: 'short',
    })
    .toString();
}



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

function dibujarCirculos() {
  for (let i = 0; i <= data_fitted.length; i++) {
    const fila = data_fitted[i];
    const xC = pasoDia * deFechaADias(new Date(fila.date_time) - fechaInicial);
    const yC = base - fila.death;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.arc(xC, yC, 3, 0, PiDos);
    ctx.fill();
    ctx.stroke();
  }
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
  dibujarCirculos();
  
}

function crearSistemaCoordenadas() {
  const baseTexto = base + 15;
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
    ctx.lineTo(x, base); // dibujar linea hasta abajo
    ctx.stroke();
    ctx.fillText(mesTexto(mes), x, baseTexto);
  }

  // Y-Axis
  for (let i = 0; i <= pasoCasos * 4; i += pasoCasos) {
    const y = base - i;
    ctx.beginPath();

    ctx.moveTo(0, y);
    ctx.lineTo(window.innerWidth, y);
    ctx.stroke();
    ctx.fillText(i, 0, y);
  }
 
}

window.onresize = ajustar;
