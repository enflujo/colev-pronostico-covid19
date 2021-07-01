import './scss/styles.scss';
import csv from './datos/deaths_df.csv';
import csv2 from './datos/cases.csv';

const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');

const estimado = csv.filter((caso) => caso.type === 'estimate');
const forecast = csv.filter((caso) => caso.type === 'forecast');
const data_fitted = csv2.filter((caso) => caso.type === 'fitted');
const data_preliminary = csv2.filter((caso) => caso.type === 'preliminary');
const fechaInicial = new Date(csv[0].date);
const fechaFinal = new Date(csv[csv.length - 1].date);
const duracion = deFechaADias(fechaFinal - fechaInicial);
const duracionMeses = calcularMeses(fechaInicial, fechaFinal);
const grisClaro = '#80808066';
const grisOscuro = '#80808099';
const rojoClaro = '#d6a09f';
const rojoMenosClaro = '#cc8785'
const rojoOscuro = '#c57876'
const PiDos = 2 * Math.PI;
let base;
let pasoDia;
let pasoMes;
const pasoCasos = 50;
let espacioIzquierda = 100;

ajustar();



console.log(data_fitted, estimado, data_preliminary);

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
    const x = (pasoDia * deFechaADias(new Date(fila.date) - fechaInicial) + espacioIzquierda);
    const y = base - fila[llave];

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function dibujarCirculos() {
  for (let i = 0; i < data_fitted.length; i++) {
    const fila = data_fitted[i];
    const xC = (pasoDia * deFechaADias(new Date(fila.date_time) - fechaInicial) + espacioIzquierda);
    const yC = base - fila.death;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.arc(xC, yC, 3, 0, PiDos);
    ctx.fill();
    ctx.stroke();
  }
}
function dibujarCirculosRojos() {
  for (let i = 0; i < data_preliminary.length; i++) {
    const fila = data_preliminary[i];
    const xCR = (pasoDia * deFechaADias(new Date(fila.date_time) - fechaInicial) + espacioIzquierda);
    const yCR = base - fila.death;
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.arc(xCR, yCR, 3, 0, PiDos);
    ctx.fill();
    ctx.stroke();
  }
}

function pintarPalabraDeaths() {
  ctx.save();
  ctx.translate(25, base - 100);
  ctx.rotate(-Math.PI/2);
  ctx.font = '25px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText("Deaths", 0, 0);
  ctx.restore();
}

function pintarLeyenda() {
  ctx.strokeStyle = '#d3d3d3'
  ctx.strokeRect(espacioIzquierda, base - 300, 190, 130);
  ctx.font = '15px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText("Median - Nowcast", espacioIzquierda + 60, base - 280);
  ctx.font = '15px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText("Forecast - Median", espacioIzquierda + 60, base - 260);
  ctx.font = '15px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText("95 CI - Nowcast", espacioIzquierda + 60, base - 240);
  ctx.font = '15px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText("95% CI", espacioIzquierda + 60, base - 220);
  ctx.font = '15px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText("80% CI", espacioIzquierda + 60, base - 200);
  ctx.font = '15px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText("50% CI", espacioIzquierda + 60, base - 180);

  ctx.beginPath();
  ctx.moveTo(espacioIzquierda + 5, base - 285);
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 2;
  ctx.lineTo(espacioIzquierda + 45, base - 285);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(espacioIzquierda + 5, base - 265);
  ctx.strokeStyle = '#e3bfbe';
  ctx.lineTo(espacioIzquierda + 45, base - 265);
  ctx.stroke();

  ctx.fillStyle = '#cbcbcb';
  ctx.fillRect(espacioIzquierda + 5, base - 250, 40, 12);

  ctx.fillStyle = '#d6a09f';
  ctx.fillRect(espacioIzquierda + 5, base - 230, 40, 12);

  ctx.fillStyle = '#e3bfbe';
  ctx.fillRect(espacioIzquierda + 5, base - 210, 40, 12);

  ctx.fillStyle = '#dfbcbb';
  ctx.fillRect(espacioIzquierda + 5, base - 190, 40, 12);
}

function ajustar() {
  lienzo.width = window.innerWidth;
  lienzo.height = window.innerHeight;
  pasoDia = (window.innerWidth / duracion) | 0;
  pasoMes = (window.innerWidth / duracionMeses) | 0;
  base = window.innerHeight - window.innerHeight / 2;
  crearSistemaCoordenadas();
  ctx.beginPath();
  ctx.fillStyle = grisClaro;
  estimado.forEach((fila, i) => {
    const x = (pasoDia * deFechaADias(new Date(fila.date) - fechaInicial) + espacioIzquierda);
    const y = base - fila.high_95;

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
  });

  for (let i = estimado.length - 1; i >= 0; i--) {
    const fila = estimado[i];
    const x = (pasoDia * deFechaADias(new Date(fila.date) - fechaInicial) + espacioIzquierda);
    const y = base - fila.low_95;
    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();

  //Forecast rojoClaro

  ctx.beginPath();
  ctx.fillStyle = rojoClaro;
  forecast.forEach((fila, i) => {
    const x = (pasoDia * deFechaADias(new Date(fila.date) - fechaInicial) + espacioIzquierda);
    const y = base - fila.high_95;

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
  });

  for (let i = forecast.length - 1; i >= 0; i--) {
    const fila = forecast[i];
    const x = (pasoDia * deFechaADias(new Date(fila.date) - fechaInicial) + espacioIzquierda);
    const y = base - fila.low_95;
    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();

    //Forecast rojoMenosClaro

    ctx.beginPath();
    ctx.fillStyle = rojoMenosClaro;
    forecast.forEach((fila, i) => {
      const x = (pasoDia * deFechaADias(new Date(fila.date) - fechaInicial) + espacioIzquierda);
      const y = base - fila.high_80;
  
      if (i === 0) {
        ctx.moveTo(x, y);
      }
      ctx.lineTo(x, y);
    });
  
    for (let i = forecast.length - 1; i >= 0; i--) {
      const fila = forecast[i];
      const x = (pasoDia * deFechaADias(new Date(fila.date) - fechaInicial) + espacioIzquierda);
      const y = base - fila.low_80;
      ctx.lineTo(x, y);
    }
  
    ctx.closePath();
  ctx.fill();
  
    //Forecast rojoOscuro

    ctx.beginPath();
    ctx.fillStyle = rojoOscuro;
    forecast.forEach((fila, i) => {
      const x = (pasoDia * deFechaADias(new Date(fila.date) - fechaInicial) + espacioIzquierda);
      const y = base - fila.high_50;
  
      if (i === 0) {
        ctx.moveTo(x, y);
      }
      ctx.lineTo(x, y);
    });
  
    for (let i = forecast.length - 1; i >= 0; i--) {
      const fila = forecast[i];
      const x = (pasoDia * deFechaADias(new Date(fila.date) - fechaInicial) + espacioIzquierda);
      const y = base - fila.low_50;
      ctx.lineTo(x, y);
    }
  
    ctx.closePath();
    ctx.fill();

  dibujarLinea('high_95');
  dibujarLinea('low_95');
  dibujarLinea('median');
  dibujarCirculos();
  dibujarCirculosRojos();
  pintarPalabraDeaths();
  pintarLeyenda();
}

function crearSistemaCoordenadas() {
  const baseTexto = base + 35;
  ctx.lineWidth = 1;
  ctx.font = '25px Arial';
  ctx.textAlign = 'start';
  ctx.strokeStyle = '#e9e9e9';
  ctx.fillStyle = 'black';

  // X-Axis: Cambie esto para que sean los meses y no los días
  for (let i = 0; i <= duracionMeses; i++) {
    const x = pasoMes * i + espacioIzquierda;
    const mes = (fechaInicial.getMonth() + i) % 15;
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
    ctx.moveTo(espacioIzquierda, y);
    ctx.lineTo(window.innerWidth, y);
    ctx.stroke();
    ctx.fillText(i, (espacioIzquierda - 50), y);
  }
}

window.onresize = ajustar;


//let text = ctx.measureText('Hello world');