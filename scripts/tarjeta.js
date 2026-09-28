// Dibuja las postales fijas del juego con su propio arte: la tarjeta que se ve al compartir el enlace (1200x630)
// y los íconos (180, 192 y 512). La abre scripts/tarjeta.mjs; también se puede mirar en un navegador.

import { TORRE, PALETA_TORRE_ENCENDIDA, aCanvas } from '../public/js/dibujo/sprites.js';
import { pintarCalle, fuentesListas, escribir, cajaDeTexto, FUENTE_PIXEL, FUENTE_TEXTO } from '../public/js/dibujo/postal.js';
import { T } from '../public/js/textos.js';

function lienzo(ancho, alto) {
  const c = document.createElement('canvas');
  c.width = ancho; c.height = alto;
  return [c, c.getContext('2d')];
}

function tarjeta() {
  const ancho = 1200, alto = 630, u = 6;
  const [c, g] = lienzo(ancho, alto);
  const H = Math.floor(alto / u);
  const calle = H - 25;
  // lo que se escribe: [color, fuente, texto, x, línea de base, espacio entre letras]
  const lineas = [
    ['#22d3ee', `400 46px ${FUENTE_PIXEL}`, T.postal.rotulo.toUpperCase(), 64, 104, 8],
    ['#e6edf7', `400 96px ${FUENTE_PIXEL}`, T.postal.titulo.toUpperCase(), 58, 200, 6],
    ['#e6edf7', `500 40px ${FUENTE_TEXTO}`, T.postal.lema, 64, 268, 0],
    ['#a9b6ca', `400 28px ${FUENTE_TEXTO}`, T.postal.pie, 64, 318, 0],
  ];
  // detrás del texto, el cielo queda sin estrellas para que se lea limpio
  const libres = lineas.map(([, fuente, texto, x, base, espacio]) => cajaDeTexto(g, fuente, texto, x, base, { espacio }));
  g.fillStyle = '#050914';
  g.fillRect(0, 0, ancho, alto);
  pintarCalle(g, {
    ancho, alto, u, calle, torreX: Math.floor(ancho / u) - 38, barreraX: 120, edificios: [8, 22], estrellas: 90, haz: Math.PI * 1.1, libres,
    autos: [
      { tipo: 'cliente', paleta: 3, x: 5 },
      { tipo: 'buscador', x: 28, placa: [T.placas.buscador, 'buscador'] },
      { tipo: 'wp', x: 51, placa: [T.placas.wp, 'wp'] },
      { tipo: 'cliente', paleta: 1, x: 74 },
      { tipo: 'sospechoso', x: 98, bajo: 2, alfa: 0.85, sello: T.marcas.bloqueado, selloDx: -3 },
      { tipo: 'cliente', paleta: 0, x: 150 },
    ],
  });
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  for (const [color, fuente, texto, x, base, espacio] of lineas) {
    g.fillStyle = color;
    g.font = fuente;
    escribir(g, texto, x, base, espacio);
  }
  g.fillStyle = '#22d3ee';
  g.font = `400 24px ${FUENTE_PIXEL}`;
  escribir(g, T.postal.direccion, 64, alto - 18, 2);
  return c;
}

// El ícono: la parte alta de la torre encendida (como el favicon) sobre la noche, centrada y a escala entera
function icono(lado, escala) {
  const [c, g] = lienzo(lado, lado);
  // el resplandor detrás de la torre, en cuadros del tamaño del pixel y con pocos tonos (pesa poco)
  const tonos = ['#12305c', '#0f2850', '#0d2143', '#0b1a36', '#09142a', '#070f1f', '#060a14'];
  const ox = ((lado % escala) / 2) | 0;
  for (let y = -escala; y < lado; y += escala) {
    for (let x = -escala; x < lado; x += escala) {
      const d = Math.hypot(x + ox + escala / 2 - lado / 2, y + ox + escala / 2 - lado * 0.42) / (lado * 0.62);
      g.fillStyle = tonos[Math.min(tonos.length - 1, Math.floor(d * tonos.length))];
      g.fillRect(x + ox, y + ox, escala, escala);
    }
  }
  const filas = TORRE.slice(0, 20);
  const img = aCanvas(filas, PALETA_TORRE_ENCENDIDA, escala);
  g.imageSmoothingEnabled = false;
  // alineada a la misma cuadrícula que el resplandor
  const celda = v => ox + escala * Math.round((lado - v) / 2 / escala);
  g.drawImage(img, celda(img.width), celda(img.height));
  return c;
}

async function dibujar() {
  await fuentesListas();
  const postales = {
    'tarjeta.png': tarjeta(),
    'apple-touch-icon.png': icono(180, 7),
    'icono-192.png': icono(192, 6),
    'icono-512.png': icono(512, 15),
  };
  const caja = document.getElementById('postales');
  const datos = {};
  for (const [nombre, c] of Object.entries(postales)) {
    c.title = nombre;
    caja.append(c);
    datos[nombre] = c.toDataURL('image/png');
  }
  return datos;
}

window.postales = dibujar();
