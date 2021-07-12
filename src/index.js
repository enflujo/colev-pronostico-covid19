import './scss/styles.scss';
import { msADias, calcularMeses, mesATexto, limpiarDatos } from './utilidades/ayudas';
import csv from './datos/deaths_df.csv';
import csv2 from './datos/cases.csv';

const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const tipLienzo = document.getElementById("tip");
const tipCtx = tipLienzo.getContext("2d");
const zoomLienzo = document.getElementById('zoom');
const zoomctx = zoomLienzo.getContext('2d');

const csvLimpio = limpiarDatos(csv);
const cvs2Limpio = limpiarDatos(csv2);
const estimado = csvLimpio.filter((caso) => caso.type === 'estimate');
const forecast = csvLimpio.filter((caso) => caso.type === 'forecast');
const data_fitted = cvs2Limpio.filter((caso) => caso.type === 'fitted');
const data_preliminary = cvs2Limpio.filter((caso) => caso.type === 'preliminary');
const fechaInicial = csvLimpio[0].date;
const fechaFinal = csvLimpio[csvLimpio.length - 1].date;
const duracion = msADias(fechaFinal - fechaInicial);
const duracionMeses = calcularMeses(fechaInicial, fechaFinal);
const grisClaro = '#80808066';
const grisOscuro = '#80808099';
const rojoClaro = '#d6a09f';
const rojoMenosClaro = '#cc8785';
const rojoOscuro = '#c57876';
const PiDos = 2 * Math.PI;
const proporcionBase = 4;
let base;
let pasoDia;
let pasoMes;
const pasoCasos = 50;
let espacioIzquierda = 100;


let hotspots = [];
let hotspotsFranjas = [];
let hotspotsFranjasRojas = [];
let offsetX = lienzo.offsetLeft;
let offsetY = lienzo.offsetTop;

let zoom = function (event) {
  //definir el tamaño del canvas
  zoomctx.clearRect(0, 0, zoomLienzo.width, zoomLienzo.height)
  let x = event.layerX * 2;
  let y = event.layerY * 2;
  zoomctx.imageSmoothingEnabled = true;
  zoomctx.webkitImageSmoothingEnabled = true;
  zoomctx.msImageSmoothingEnabled = true;
  zoomctx.drawImage(lienzo,
                    Math.abs(x - 400),
                    Math.abs(y - 400),
                    800, 800,
                    0, 0,
                    800, 800);
};


window.onresize = ajustar;

window.addEventListener('mousemove', (e) => {
  zoom(e);
  const x = e.x;
  const y = e.y;
  // Acá se puede comenzar a hacer algo interactivo...
  manejarMovimientoMousePuntos(e);
});



  
function manejarMovimientoMousePuntos(e){
  let mouseX = parseInt((e.clientX-offsetX) * 2);
  let mouseY = parseInt((e.clientY-offsetY) * 2);
  for (let i = 0; i < hotspots.length; i++) {
      let hotspot = hotspots[i];
      let dx = mouseX - hotspot.x;
      let dy = mouseY - hotspot.y;
      if (dx * dx + dy * dy < hotspot.rXr) {
        tipLienzo.style.left = (hotspot.x / 2) + "px";
        tipLienzo.style.top = ((hotspot.y - 40)/2) + "px";
        tipCtx.clearRect(0, 0, tipLienzo.width, tipLienzo.height);
        tipCtx.fillText("width:" + tipCtx.measureText(hotspot.tip).width, 15, 25);
        tipCtx.fillText(hotspot.tip, 5, 15);
        break;
      }
  }
}

function manejarMovimientoMouseFranjasEstimado(e){
  let mouseX = parseInt((e.clientX-offsetX) * 2);
  let mouseY = parseInt((e.clientY-offsetY) * 2);
  for (let i = 0; i < hotspotsFranjas.length; i++) {
      let hotspotF = hotspotsFranjas[i];
      let dx = mouseX - hotspotF.x;
      let dy = mouseY - hotspotF.y;
      let tipText = tipCtx.measureText(hotspotF.tip).width;
    if (dx * dx + dy * dy < hotspotF.rXr) {
        let tipLienzoWidth = tipText;
        tipLienzo.style.left = (hotspotF.x/2) + "px";
        tipLienzo.style.top = ((hotspotF.y - 40)/2) + "px";
        tipCtx.clearRect(0, 0, tipLienzoWidth, tipLienzo.height);
        tipCtx.fillText(tipCtx.measureText(hotspotF.tip).width, 5, 10);
      tipCtx.fillText(hotspotF.tip, 5, 20);
      break;
      }
  }
}




ajustar();

function ajustar() {
  lienzo.width = window.innerWidth * 2;
  lienzo.height = window.innerHeight * 2;
  zoomLienzo.width = 600;
  zoomLienzo.height = 600;
  pasoDia = (lienzo.width / duracion) | 0;
  pasoMes = (lienzo.width / duracionMeses) | 0;
  base = lienzo.height - lienzo.height / 5;
  pintar();
  obtenerDatosPuntos(data_fitted);
  obtenerDatosPuntos(data_preliminary);
  obtenerDatosFranjas(estimado);
}


function pintar() {
  crearSistemaCoordenadas();
  rellenar(estimado, 'high_95', 'low_95', grisClaro);
  rellenar(forecast, 'high_95', 'low_95', rojoClaro);
  rellenar(forecast, 'high_80', 'low_80', rojoMenosClaro);
  rellenar(forecast, 'high_50', 'low_50', rojoOscuro);
  dibujarLinea(estimado, 'high_95');
  dibujarLinea(estimado, 'low_95');
  dibujarLinea(estimado, 'median');
  dibujarLinea(forecast, 'median');
  circulos(data_fitted, 'rgba(0, 0, 0, 0.5)', 'black', 3);
  circulos(data_preliminary, 'rgba(255, 0, 0, 0.5)', 'red', 3);
  pintarPalabraDeaths();
  
}

function dibujarLinea(datos, llave) {
  ctx.beginPath();
  ctx.strokeStyle = grisOscuro;
  datos.forEach((fila, i) => {
    const x = pasoDia * msADias(fila.date - fechaInicial) + espacioIzquierda;
    const y = base - fila[llave] * proporcionBase;

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function circulos(datos, color, colorBorde, radio) {
  ctx.fillStyle = color;
  ctx.strokeStyle = colorBorde;

  datos.forEach((fila) => {
    const xC = pasoDia * msADias(fila.date - fechaInicial) + espacioIzquierda;
    const yC = base - fila.death * proporcionBase;
    ctx.beginPath();
    ctx.arc(xC, yC, radio, 0, PiDos);
    ctx.fill();
    ctx.stroke();
  });
}

function obtenerDatosPuntos(datos) {
  datos.forEach((fila) => {
    const xC = pasoDia * msADias(fila.date - fechaInicial) + espacioIzquierda;
    const yC = base - fila.death * proporcionBase;
    const death = fila.death
    hotspots.push({
      x: xC,
      y: yC,
      r: 4,
      rXr: 16,
      tip: death + '' + 'muertes', 
    });
  });
}

function obtenerDatosFranjas(datos) {
  datos.forEach((fila) => {
    let x1x2 = [];
    const x1x = pasoDia * msADias(fila.date - fechaInicial) + espacioIzquierda;
    const x1y = base - fila.low_95 * proporcionBase;
    const x2x = pasoDia * msADias(fila.date - fechaInicial) + espacioIzquierda;
    const x2y = base - fila.high_95 * proporcionBase;
    x1x2.push({
      //
    });



    // const xCF = pasoDia * msADias(fila.date - fechaInicial) + espacioIzquierda;
    // const yCF = base - fila.low_95 * proporcionBase;
    // const high_95 = fila.high_95;
    // const low_95 = fila.low_95;
    // hotspotsFranjas.push({
    //   x: xCF,
    //   y: yCF,
    //   r: 4,
    //   rXr: 16,
    //   tip: high_95 + '' + 'Máximo' +  low_95 + 'Mínimo', 
    // });
    console.log(x1y, x2y)
  });
  
}




function rellenar(datos, superior, inferior, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  datos.forEach((fila, i) => {
    const x = pasoDia * msADias(fila.date - fechaInicial) + espacioIzquierda;
    const y = base - fila[superior] * proporcionBase;

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
  });

  for (let i = datos.length - 1; i >= 0; i--) {
    const fila = datos[i];
    const x = pasoDia * msADias(fila.date - fechaInicial) + espacioIzquierda;
    const y = base - fila[inferior] * proporcionBase;
    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();
}

function pintarPalabraDeaths() {
  ctx.save();
  ctx.translate(25, base - 100);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '25px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText('Deaths', 0, 0);
  ctx.restore();
}

    function crearSistemaCoordenadas() {
      const baseTexto = base + 35;
      ctx.lineWidth = 1;
      ctx.font = '25px Arial';
      ctx.textAlign = 'start';
      ctx.strokeStyle = '#e9e9e9';
      ctx.fillStyle = 'black';
      // let text = ctx.measureText('Sept.');

      // X-Axis: Cambie esto para que sean los meses y no los días
      for (let i = 0; i <= duracionMeses; i++) {
        const x = pasoMes * i + espacioIzquierda;
        const mes = (fechaInicial.getMonth() + i) % 15;

        ctx.beginPath();
        ctx.moveTo(x, 0); // mover en x y comenzar arriba
        ctx.lineTo(x, base); // dibujar linea hasta abajo
        ctx.stroke();
        ctx.fillText(mesATexto(mes), x - 15, baseTexto);
      }

      // Y-Axis
      for (let i = 0; i <= pasoCasos * 4; i += pasoCasos) {
        const y = base - i * proporcionBase;
        ctx.beginPath();
        ctx.moveTo(espacioIzquierda, y);
        ctx.lineTo(lienzo.width, y);
        ctx.stroke();
        ctx.fillText(i, espacioIzquierda - 50, y + 8);
      }
    }
