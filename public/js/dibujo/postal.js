// Postales del juego: dibujos quietos para la imagen del resultado, la tarjeta al compartir el enlace y los íconos.
// Usan el mismo arte que la partida (sprites.js) y las mismas reglas: la capa pixel a escala entera y en píxeles
// enteros; la capa de código (cielo, luz de la baliza, textos) generada aparte y siempre nítida.
// No es parte del motor: aquí el azar del decorado tiene su propia semilla fija, para que cada postal salga igual.

import { SPRITES, PALETAS, TORRE, PALETA_TORRE_ENCENDIDA, BARRERA_POSTE, PALETA_BARRERA, ESTRELLA, aCanvas } from './sprites.js';

export const FUENTE_PIXEL = "'Silkscreen', ui-monospace, Menlo, monospace";
export const FUENTE_TEXTO = "'Space Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif";

const ANCHO_AUTO = 20;

function azar(semilla) {
  let s = semilla >>> 0;
  return () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296);
}

// Espera a que las dos fuentes del juego estén listas antes de escribir en un canvas
export async function fuentesListas() {
  try {
    await Promise.all([document.fonts.load(`400 40px ${FUENTE_PIXEL}`), document.fonts.load(`600 40px ${FUENTE_TEXTO}`)]);
  } catch { }
}

// Escribe con espacio entre letras, también en navegadores sin ctx.letterSpacing
export function escribir(g, texto, x, y, espacio = 0) {
  if (!espacio) { g.fillText(texto, x, y); return; }
  const ancho = g.measureText(texto).width + espacio * (texto.length - 1);
  const alineado = g.textAlign;
  let cx = alineado === 'center' ? x - ancho / 2 : alineado === 'right' ? x - ancho : x;
  g.textAlign = 'left';
  for (const letra of texto) { g.fillText(letra, Math.round(cx), y); cx += g.measureText(letra).width + espacio; }
  g.textAlign = alineado;
}

// La calle del peaje de noche, vista de frente: cielo, ciudad, torre encendida, calzada, autos y barrera.
// Todo se mide en píxeles del dibujo; u es cuántos píxeles de la imagen mide cada uno.
// libres: rectángulos [x0, y0, x1, y1] en píxeles de la imagen donde irá texto; ahí no se pintan estrellas,
// para que la letra se lea limpia. El azar se consume igual, así el resto de la postal no cambia.
export function pintarCalle(g, {
  ancho, alto, u, calle, torreX, torreEscala = 2, barreraX = null,
  autos = [], semilla = 20260928, edificios = [14, 36], estrellas = 60, cielo = 0, haz = Math.PI * 1.08, libres = [],
}) {
  const W = Math.ceil(ancho / u);
  const r = azar(semilla);
  const px = v => Math.round(v) * u;
  g.imageSmoothingEnabled = false;

  // cielo (código)
  const grad = g.createLinearGradient(0, cielo, 0, calle * u);
  grad.addColorStop(0, '#050914');
  grad.addColorStop(1, '#0c1a33');
  g.fillStyle = grad;
  g.fillRect(0, cielo, ancho, calle * u - cielo);
  const desde = Math.ceil(cielo / u);
  for (let i = 0; i < estrellas; i++) {
    const x = (r() * W) | 0, y = desde + ((r() * (calle - desde) * 0.62) | 0);
    const alfa = (0.3 + r() * 0.55).toFixed(2);
    const sx = px(x), sy = px(y);
    if (libres.some(([x0, y0, x1, y1]) => sx + u > x0 && sx < x1 && sy + u > y0 && sy < y1)) continue;
    g.fillStyle = `rgba(226,232,240,${alfa})`;
    g.fillRect(sx, sy, u, u);
  }

  // la ciudad (pixel): edificios con ventanas encendidas
  const base = calle - 3;
  let x = -2;
  while (x < W) {
    const an = 8 + ((r() * 10) | 0), al = edificios[0] + ((r() * (edificios[1] - edificios[0])) | 0);
    g.fillStyle = r() > 0.5 ? '#111a2e' : '#0e1627';
    g.fillRect(px(x), px(base - al), an * u, al * u);
    g.fillStyle = 'rgba(253,230,138,.55)';
    for (let vy = 3; vy < al - 3; vy += 4) for (let vx = 2; vx < an - 2; vx += 3) if (r() < 0.45) g.fillRect(px(x + vx), px(base - al + vy), u, u);
    x += an + 1 + ((r() * 3) | 0);
  }

  // la torre encendida y el haz de la baliza
  const tx = torreX, ty = base - TORRE.length * torreEscala;
  const bx = (tx + 8 * torreEscala) * u, by = (ty + torreEscala) * u;
  const largo = ancho * 0.95, abre = 0.13;
  const luz = g.createRadialGradient(bx, by, 0, bx, by, largo);
  luz.addColorStop(0, 'rgba(34,211,238,0.26)');
  luz.addColorStop(1, 'rgba(34,211,238,0)');
  g.fillStyle = luz;
  g.beginPath();
  g.moveTo(bx, by);
  g.lineTo(bx + Math.cos(haz - abre) * largo, by + Math.sin(haz - abre) * largo);
  g.lineTo(bx + Math.cos(haz + abre) * largo, by + Math.sin(haz + abre) * largo);
  g.closePath();
  g.fill();
  g.drawImage(aCanvas(TORRE, PALETA_TORRE_ENCENDIDA, u * torreEscala), px(tx), px(ty));

  // la calzada
  g.fillStyle = '#1e293b';
  g.fillRect(0, px(calle - 3), ancho, 3 * u);
  g.fillStyle = '#111827';
  g.fillRect(0, px(calle), ancho, 16 * u);
  g.fillStyle = '#1e293b';
  g.fillRect(0, px(calle + 16), ancho, 3 * u);
  g.fillStyle = '#475569';
  for (let lx = 2; lx < W; lx += 8) g.fillRect(px(lx), px(calle + 12), 4 * u, u);
  g.fillStyle = '#0a1120';
  g.fillRect(0, px(calle + 19), ancho, alto - px(calle + 19));

  // los autos
  for (const a of autos) {
    const paleta = PALETAS[a.tipo][a.paleta || 0];
    const img = aCanvas(SPRITES[a.tipo][0], paleta, u);
    const y = calle + 1 + (a.bajo || 0);
    g.globalAlpha = a.alfa ?? 1;
    g.drawImage(img, px(a.x), px(y));
    g.globalAlpha = 1;
    if (a.placa) etiqueta(g, u, a.placa, a.x + ANCHO_AUTO / 2, y - 1);
    if (a.sello) sello(g, u, a.sello, a.x + ANCHO_AUTO / 2 + (a.selloDx || 0), calle - 5);
  }

  // la barrera, cerrada, delante del que espera
  if (barreraX !== null) {
    const py = calle - 12;
    g.drawImage(aCanvas(BARRERA_POSTE, PALETA_BARRERA, u), px(barreraX + 1), px(py));
    for (let i = 0; i < 16; i++) {
      g.fillStyle = (i >> 1) % 2 ? '#f8fafc' : '#ef4444';
      g.fillRect(px(barreraX + 6 + i), px(calle + 4), u, 2 * u);
    }
  }
}

const PLACAS = { buscador: ['#0c4a6e', '#e0f2fe'], impostor: ['#7f1d1d', '#fee2e2'], wp: ['#422006', '#fde68a'] };

function etiqueta(g, u, [texto, tipo], x, y) {
  const [fondo, tinta] = PLACAS[tipo];
  const tam = Math.max(10, Math.round(3.4 * u));
  g.font = `600 ${tam}px ui-monospace, Menlo, Consolas, monospace`;
  const ancho = g.measureText(texto).width + tam * 0.8;
  const ax = Math.round(x * u - ancho / 2), ay = Math.round(y * u - tam * 1.5);
  g.fillStyle = fondo;
  g.fillRect(ax, ay, Math.round(ancho), Math.round(tam * 1.4));
  g.fillStyle = tinta;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(texto, ax + ancho / 2, ay + tam * 0.72);
}

function sello(g, u, texto, x, y) {
  const tam = Math.round(3.6 * u);
  g.font = `700 ${tam}px ${FUENTE_PIXEL}`;
  const ancho = g.measureText(texto).width + tam;
  g.strokeStyle = '#ef4444';
  g.lineWidth = Math.max(2, u);
  g.strokeRect(Math.round(x * u - ancho / 2), Math.round(y * u - tam * 0.8), Math.round(ancho), Math.round(tam * 1.6));
  g.fillStyle = '#ef4444';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(texto, x * u, y * u);
}

// Tres estrellas pixel, encendidas las ganadas
export function pintarEstrellas(g, cx, y, ganadas, escala, hueco) {
  const lado = ESTRELLA[0].length * escala;
  const total = 3 * lado + 2 * hueco;
  for (let i = 0; i < 3; i++) {
    const img = aCanvas(ESTRELLA, { y: i < ganadas ? '#facc15' : '#1f2a44' }, escala);
    g.drawImage(img, Math.round(cx - total / 2 + i * (lado + hueco)), y);
  }
  return lado;
}

// Los bloques del reto como cuadros pixel: lleno si el tramo salió bien, solo el borde si hubo un error
export function pintarBloques(g, cx, y, bloques, lado, hueco, porFila = 12) {
  const lista = [...bloques];
  const filas = Math.ceil(lista.length / porFila);
  const borde = Math.max(3, Math.round(lado / 7));
  for (let f = 0; f < filas; f++) {
    const tramo = lista.slice(f * porFila, (f + 1) * porFila);
    const total = tramo.length * lado + (tramo.length - 1) * hueco;
    tramo.forEach((b, i) => {
      const x = Math.round(cx - total / 2 + i * (lado + hueco)), yy = y + f * (lado + hueco);
      if (b === '■') { g.fillStyle = '#22d3ee'; g.fillRect(x, yy, lado, lado); }
      else { g.fillStyle = '#334155'; g.fillRect(x, yy, lado, lado); g.fillStyle = '#0b1328'; g.fillRect(x + borde, yy + borde, lado - 2 * borde, lado - 2 * borde); }
    });
  }
  return filas * lado + (filas - 1) * hueco;
}

// El rectángulo que ocupa una línea de texto, con margen, para dejar el cielo limpio detrás (ver pintarCalle).
// El alto sale del tamaño de la fuente: basta con que cubra letras, acentos y la parte que baja.
export function cajaDeTexto(g, fuente, texto, x, base, { alinear = 'left', espacio = 0, margen = 16 } = {}) {
  g.font = fuente;
  const ancho = g.measureText(texto).width + espacio * Math.max(0, texto.length - 1);
  const tam = parseInt(fuente.split(' ')[1], 10);
  const x0 = alinear === 'center' ? x - ancho / 2 : alinear === 'right' ? x - ancho : x;
  return [x0 - margen, base - tam - margen, x0 + ancho + margen, base + tam * 0.3 + margen];
}

// La imagen vertical del resultado, 1080x1350, para compartir. Los textos llegan hechos desde textos.js.
// d = { rotulo, titulo, subtitulo, puntos, puntosEtiqueta, estrellas, bloques, sello, direccion }
export function imagenResultado(d) {
  const ancho = 1080, alto = 1350, u = 6;
  const c = document.createElement('canvas');
  c.width = ancho; c.height = alto;
  const g = c.getContext('2d');
  const H = Math.floor(alto / u);
  const calle = H - 30;
  const cx = ancho / 2;

  // lo que se escribe, de arriba abajo: [color, fuente, texto, línea de base, espacio entre letras]
  const ESTRELLAS_Y = 400, LADO_ESTRELLA = 20, HUECO_ESTRELLA = 40;
  const altoEstrellas = ESTRELLA[0].length * LADO_ESTRELLA;
  const puntosY = ESTRELLAS_Y + altoEstrellas + 150;
  const lineas = [
    ['#22d3ee', `400 34px ${FUENTE_PIXEL}`, d.rotulo.toUpperCase(), 128, 8],
    ['#e6edf7', `400 104px ${FUENTE_PIXEL}`, d.titulo.toUpperCase(), 250, 6],
    ['#a9b6ca', `500 42px ${FUENTE_TEXTO}`, d.subtitulo, 330, 0],
    ['#e6edf7', `400 132px ${FUENTE_PIXEL}`, d.puntos, puntosY, 0],
    ['#a9b6ca', `500 40px ${FUENTE_TEXTO}`, d.puntosEtiqueta, puntosY + 58, 0],
  ];
  const libres = lineas.map(([, fuente, texto, base, espacio]) => cajaDeTexto(g, fuente, texto, cx, base, { alinear: 'center', espacio }));
  const anchoEstrellas = 3 * altoEstrellas + 2 * HUECO_ESTRELLA;
  libres.push([cx - anchoEstrellas / 2 - 16, ESTRELLAS_Y - 16, cx + anchoEstrellas / 2 + 16, ESTRELLAS_Y + altoEstrellas + 16]);
  const BLOQUE = 40, HUECO_BLOQUE = 12, POR_FILA = 12, bloquesY = puntosY + 100;
  const nBloques = [...(d.bloques || '')].length;
  if (nBloques) {
    const an = Math.min(nBloques, POR_FILA) * (BLOQUE + HUECO_BLOQUE) - HUECO_BLOQUE;
    const filas = Math.ceil(nBloques / POR_FILA);
    libres.push([cx - an / 2 - 16, bloquesY - 16, cx + an / 2 + 16, bloquesY + filas * (BLOQUE + HUECO_BLOQUE) + 4]);
  }

  g.fillStyle = '#050914';
  g.fillRect(0, 0, ancho, alto);
  pintarCalle(g, {
    ancho, alto, u, calle, torreX: Math.floor(ancho / u) - 36, barreraX: 104, edificios: [10, 30], estrellas: 110, haz: Math.PI * 1.45, libres,
    autos: [
      { tipo: 'cliente', paleta: 1, x: 13 },
      { tipo: 'cliente', paleta: 4, x: 36 },
      { tipo: 'cliente', paleta: 2, x: 59 },
      { tipo: 'sospechoso', x: 82, bajo: 2, alfa: 0.8, sello: d.sello, selloDx: -3 },
      { tipo: 'cliente', paleta: 0, x: 136 },
    ],
  });

  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  for (const [color, fuente, texto, base, espacio] of lineas) {
    g.fillStyle = color;
    g.font = fuente;
    escribir(g, texto, cx, base, espacio);
  }
  pintarEstrellas(g, cx, ESTRELLAS_Y, d.estrellas, LADO_ESTRELLA, HUECO_ESTRELLA);
  if (nBloques) pintarBloques(g, cx, bloquesY, d.bloques, BLOQUE, HUECO_BLOQUE, POR_FILA);

  g.fillStyle = '#22d3ee';
  g.font = `400 36px ${FUENTE_PIXEL}`;
  escribir(g, d.direccion, cx, alto - 52, 2);
  return c;
}
