// Dibujo de «El peaje». Dos capas, como dice el GDD: la pixel (autos, barrera, torre, edificios), en una cuadrícula a
// escala entera y siempre en píxeles enteros, y la de código (cielo, estrellas, luz de la baliza, sellos, textos).
// Van en dos lienzos: el mundo a la cuadrícula y el texto nítido encima (ver crearEscena).
// El motor no sabe nada de esto: la escena solo escucha los eventos que el motor devuelve.

import { SPRITES, PALETAS, BARRERA_POSTE, PALETA_BARRERA, TORRE, PALETA_TORRE, PALETA_TORRE_ENCENDIDA, RELOJ, PALETA_RELOJ, aCanvas } from './sprites.js';
import { T } from '../textos.js';

const ANCHO_AUTO = 20;
const HUECO = 3;

// ---- la vista de frente, compartida con la apertura ----
// La apertura baja del cielo hasta este mismo cuadro: por eso la disposición, el decorado y cada capa se pintan
// con estas funciones, que aceptan un corrimiento (dx, dy) en píxeles del dibujo. Con (0, 0) es la partida.

// unos 110 píxeles del dibujo a lo ancho: un auto mide la quinta parte de la pantalla
export function disposicion(ancho, alto) {
  const u = Math.max(2, Math.floor(ancho / 110));
  const W = Math.floor(ancho / u), H = Math.floor(alto / u);
  const calle = Math.floor(H * 0.64);
  return { u, W, H, calle, barrera: Math.floor(W * 0.62), torre: { x: W - 16 * 2 - 2, y: calle - 3 - TORRE.length * 2 } };
}

// azar solo para el decorado (estrellas, ventanas), con su propia semilla: no toca la partida
export function decoradoCiudad(W, calle) {
  let s = 20260928;
  const r = () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296);
  const estrellas = Array.from({ length: 50 }, () => ({ x: (r() * W) | 0, y: (r() * calle * 0.55) | 0, f: r() * 6.28 }));
  const edificios = [];
  let x = -2;
  while (x < W) {
    const ancho = 8 + ((r() * 10) | 0), alto = 14 + ((r() * 36) | 0);
    const ventanas = [];
    for (let vy = 3; vy < alto - 3; vy += 4) for (let vx = 2; vx < ancho - 2; vx += 3) if (r() < 0.45) ventanas.push([vx, vy, r() * 20]);
    edificios.push({ x, ancho, alto, ventanas, tono: r() });
    x += ancho + 1 + ((r() * 3) | 0);
  }
  return { estrellas, edificios };
}

// ---- los degradés, pintados una vez ----
// Rellenar un degradé cuesta por cada píxel en cada cuadro: a densidad completa (1024x2216 en un Android de 2,625) un
// degradé lineal a pantalla completa es la mitad del cuadro en un teléfono modesto. Por eso cada degradé vertical se
// pinta una sola vez en una columna de un píxel de ancho y se estira a lo ancho con drawImage. A lo alto se copia a
// escala 1:1, así que cada fila tiene el mismo color que daría el degradé: no se pierde resolución.
const columnas = new Map();
export function columna(alto, paradas) {
  alto = Math.max(1, Math.round(alto));
  const k = alto + '|' + paradas.join('|');
  let c = columnas.get(k);
  if (!c) {
    c = document.createElement('canvas');
    c.width = 1;
    c.height = alto;
    const cg = c.getContext('2d'), grad = cg.createLinearGradient(0, 0, 0, alto);
    for (const [pos, color] of paradas) grad.addColorStop(pos, color);
    cg.fillStyle = grad;
    cg.fillRect(0, 0, 1, alto);
    // la apertura pide otra altura del cielo en cada paso de la bajada: se guardan solo las últimas
    if (columnas.size > 48) columnas.delete(columnas.keys().next().value);
    columnas.set(k, c);
  }
  return c;
}
// la columna con su borde de arriba en y0, a todo lo ancho, solo entre las filas desde y hasta del canvas. Con
// suavizado: estirar una sola columna no mezcla nada, y a escala 1:1 en vertical cada fila queda con su color.
// el tamaño de un lienzo en píxeles de la pantalla. La apertura pinta el mundo en un lienzo chico, a un píxel por
// píxel del dibujo, y lo declara en `pantalla` (ver dibujo/apertura.js); los demás miden lo que miden
export const medida = c => c.pantalla || [c.width, c.height];
export function pintarColumna(g, col, y0, desde = 0, hasta = medida(g.canvas)[1]) {
  y0 = Math.round(y0);
  const [ancho, alto] = medida(g.canvas);
  const a = Math.max(desde, y0, 0), b = Math.min(hasta, y0 + col.height, alto);
  if (b <= a) return;
  const suave = g.imageSmoothingEnabled;
  g.imageSmoothingEnabled = true;
  g.drawImage(col, 0, a - y0, 1, b - a, 0, a, ancho, b - a);
  g.imageSmoothingEnabled = suave;
}
export const CIELO = [[0, '#050914'], [1, '#0c1a33']];

// el cielo: el degradé llega hasta la calle, que con la cámara más alta queda más abajo (dy > 0)
export function pintarCielo(g, L, estrellas, ahora, quieto, dx = 0, dy = 0) {
  const u = L.u, hasta = Math.max(1, (L.calle + dy) * u);
  pintarColumna(g, columna(hasta, CIELO), 0);
  for (const e of estrellas) {
    const b = quieto ? 0.7 : 0.45 + 0.4 * Math.sin(ahora / 900 + e.f);
    g.fillStyle = `rgba(226,232,240,${b.toFixed(2)})`;
    g.fillRect(Math.round(e.x + dx) * u, Math.round(e.y + dy) * u, u, u);
  }
}

export function pintarCiudad(g, L, edificios, ahora, quieto, dx = 0, dy = 0) {
  const u = L.u, base = L.calle - 3 + dy;
  for (const ed of edificios) {
    const x = ed.x + dx;
    if ((x + ed.ancho) * u < 0 || x * u > medida(g.canvas)[0]) continue;
    g.fillStyle = ed.tono > 0.5 ? '#111a2e' : '#0e1627';
    g.fillRect(x * u, (base - ed.alto) * u, ed.ancho * u, ed.alto * u);
    g.fillStyle = '#fde68a';
    g.globalAlpha = 0.55;
    for (const [vx, vy, fase] of ed.ventanas) {
      if (!(quieto || ((ahora / 1000 + fase) % 20) > 2)) continue;
      g.fillRect((x + vx) * u, (base - ed.alto + vy) * u, u, u);
    }
    g.globalAlpha = 1;
  }
}

// el degradé de la luz de la baliza: se crea una vez por lugar (en la partida, uno solo; en la apertura, uno por paso de
// la cámara) y se reusa
let baliza = { k: '', grad: null };
function luzBaliza(g, bx, by, largo) {
  const k = `${bx},${by},${largo}`;
  if (baliza.k !== k) {
    const grad = g.createRadialGradient(bx, by, 0, bx, by, largo);
    grad.addColorStop(0, 'rgba(34,211,238,0.22)');
    grad.addColorStop(1, 'rgba(34,211,238,0)');
    baliza = { k, grad };
  }
  return baliza.grad;
}

// la torre de frente y la luz de su baliza, que barre la ciudad (capa de código)
export function pintarTorre(g, L, img, encendida, ahora, quieto, dx = 0, dy = 0) {
  const u = L.u, esc = 2, tx = L.torre.x + dx, ty = L.torre.y + dy;
  if (encendida) {
    const bx = (tx + 8 * esc) * u, by = (ty + 1 * esc) * u;
    const ang = quieto ? Math.PI * 1.1 : Math.PI + Math.sin(ahora / 2400) * 0.55;
    const largo = L.W * u * 0.9, abre = 0.13;
    g.fillStyle = luzBaliza(g, bx, by, largo);
    g.beginPath();
    g.moveTo(bx, by);
    g.lineTo(bx + Math.cos(ang - abre) * largo, by + Math.sin(ang - abre) * largo);
    g.lineTo(bx + Math.cos(ang + abre) * largo, by + Math.sin(ang + abre) * largo);
    g.closePath();
    g.fill();
  }
  g.drawImage(img, tx * u, ty * u);
}

export function pintarCalzada(g, L, dx = 0, dy = 0) {
  const u = L.u, c = L.calle + dy, [ancho, alto] = medida(g.canvas);
  g.fillStyle = '#1e293b';
  g.fillRect(0, (c - 3) * u, ancho, 3 * u);
  g.fillStyle = '#111827';
  g.fillRect(0, c * u, ancho, 16 * u);
  g.fillStyle = '#1e293b';
  g.fillRect(0, (c + 16) * u, ancho, 3 * u);
  g.fillStyle = '#475569';
  const x0 = ((dx % 8) + 8) % 8;
  for (let x = 2 + x0 - 8; x < L.W + 8; x += 8) g.fillRect(x * u, (c + 12) * u, 4 * u, u);
  // abajo de la calle: el suelo de la ciudad hasta el borde
  g.fillStyle = '#0a1120';
  const y0 = (c + 19) * u;
  g.fillRect(0, y0, ancho, Math.max(0, alto - y0));
}

// la barrera: rayado rojo y blanco. Cerrada cruza la calle a la altura de los autos, delante del que espera;
// abierta, apunta hacia arriba. Dos dibujos fijos: nunca se rota un sprite en ángulos raros.
export function pintarBarrera(g, L, poste, abierta, dx = 0, dy = 0) {
  const u = L.u, x = L.barrera + 1 + dx, y = L.calle - 12 + dy, c = L.calle + dy;
  g.drawImage(poste, x * u, y * u);
  for (let i = 0; i < 16; i++) {
    g.fillStyle = (i >> 1) % 2 ? '#f8fafc' : '#ef4444';
    if (abierta) g.fillRect((x + 2) * u, (y - 1 - i) * u, 2 * u, u);
    else g.fillRect((x + 5 + i) * u, (c + 4) * u, u, 2 * u);
  }
}

// La partida en dos lienzos, como la apertura:
// - `canvas`, el mundo: cielo, ciudad, torre y su luz, calle, autos, barrera, chatarra, anillos y chispas, a un píxel
//   por píxel del dibujo; el navegador lo agranda a un múltiplo entero sin suavizar (image-rendering: pixelated) y
//   el pixel art se ve igual que a la densidad de la pantalla. Se dibuja en píxeles de la pantalla, con una escala
//   de 1/u: cada cuadro de u píxeles cae en un píxel del lienzo.
// - `texto`, encima y a la densidad de la pantalla (hasta 3): placas, puntos que suben, sellos y el reloj de la
//   barrera, nítidos. En cada cuadro se borra solo la franja donde hubo texto.
// El peso de los golpes (GDD, «juice»), sin tocar el motor: solo escucha sus eventos. La sacudida sale de un
// «trauma» que sube con cada error y baja solo; se mueve trauma² en píxeles del dibujo enteros, nunca rota. Cada
// jugada empuja la cámara un píxel hacia donde se deslizó. Al subir el combo, un anillo de pixel y chispas en la
// barrera; cada robot bloqueado deja su chatarra bajo la acera hasta que termina la partida. Con menos movimiento
// no hay sacudida, empujón ni chispas, el anillo no crece y el sello no salta. Nada destella.
const SACUDIDA = 3; // lo más que se corre la cámara con el trauma al máximo, en píxeles del dibujo
const COLOR_COMBO = ['#67e8f9', '#a7f3d0', '#fde68a', '#facc15', '#f0abfc'];
const CHATARRA = ['#475569', '#334155', '#94a3b8', '#7f1d1d'];
const TOPE_CHATARRA = 72;
// un ruido suave entre -1 y 1 (dos senos), para que la sacudida no salte al azar de un cuadro a otro
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const ruido = (t, s) => 0.6 * Math.sin(t * 0.061 + s * 2.3) + 0.4 * Math.sin(t * 0.113 + s * 5.1);

export function crearEscena(canvas, { texto, menosMovimiento = () => false } = {}) {
  const g = canvas.getContext('2d'), gt = texto.getContext('2d');
  let u = 3, dpr = 1;   // píxeles de la pantalla por cada píxel del dibujo, y píxeles de la pantalla por píxel CSS
  let W = 100, H = 200; // tamaño del mundo en píxeles del dibujo
  let calle = 120, barrera = 60;
  let cache = new Map();
  const autos = new Map();
  const flotantes = [];
  const sellos = [];
  // los golpes: el trauma de la sacudida, el empujón de la jugada, los anillos y chispas del combo y la chatarra
  let trauma = 0, patadaDir = 0, patadaT = 0;
  const anillos = [], chispas = [], chatarra = [];
  const pila = new Map(); // cuántas piezas hay apiladas en cada columna
  let abierta = 0;
  let torreEncendida = false, encendidaEn = 0;
  let estrellas = [], edificios = [], L = disposicion(300, 600);
  // el reloj chico sobre la barrera (lo que tardó la última respuesta) y el auto del giro, que no es del motor
  let reloj = null, autoGiro = null;

  // la franja del lienzo del texto que hay que borrar en el próximo cuadro
  let sucio = null;
  const marcar = (y0, y1) => { sucio = sucio ? [Math.min(sucio[0], y0), Math.max(sucio[1], y1)] : [y0, y1]; };
  function limpiarTexto() {
    if (!sucio) return;
    const m = (SACUDIDA + 2) * u; // lo que puede haberse corrido con la cámara
    const y0 = Math.max(0, Math.floor(sucio[0]) - m);
    gt.clearRect(0, y0, texto.width, Math.ceil(sucio[1]) + m - y0);
    sucio = null;
  }

  function sprite(tipo, paleta, cuadro) {
    const k = `${tipo}:${paleta}:${cuadro}:${u}`;
    if (!cache.has(k)) {
      const cuadros = SPRITES[tipo];
      cache.set(k, aCanvas(cuadros[cuadro % cuadros.length], PALETAS[tipo][paleta], u));
    }
    return cache.get(k);
  }
  // el mismo sprite mirando al otro lado: un espejo exacto, píxel por píxel (nunca una rotación)
  function espejo(tipo, paleta) {
    const k = `espejo:${tipo}:${paleta}:${u}`;
    if (!cache.has(k)) {
      const img = sprite(tipo, paleta, 0), c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const cg = c.getContext('2d');
      cg.imageSmoothingEnabled = false;
      cg.translate(img.width, 0); cg.scale(-1, 1); cg.drawImage(img, 0, 0);
      cache.set(k, c);
    }
    return cache.get(k);
  }
  function fijo(nombre, filas, paleta, esc = 1) {
    const k = `${nombre}:${u}`;
    if (!cache.has(k)) cache.set(k, aCanvas(filas, paleta, u * esc));
    return cache.get(k);
  }

  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = texto.getBoundingClientRect();
    texto.width = Math.round(rect.width * dpr);
    texto.height = Math.round(rect.height * dpr);
    L = disposicion(texto.width, texto.height);
    ({ u, W, H, calle, barrera } = L);
    // el mundo cubre la pantalla con cuadros enteros (sobra menos de un cuadro abajo y a la derecha, que se recorta)
    const MW = Math.max(1, Math.ceil(texto.width / u)), MH = Math.max(1, Math.ceil(texto.height / u));
    canvas.width = MW;
    canvas.height = MH;
    canvas.pantalla = [MW * u, MH * u];
    canvas.style.width = `${(MW * u) / dpr}px`;
    canvas.style.height = `${(MH * u) / dpr}px`;
    canvas.style.transform = '';
    g.setTransform(1 / u, 0, 0, 1 / u, 0, 0);
    g.imageSmoothingEnabled = false;
    cache = new Map();
    sucio = null;
    ({ estrellas, edificios } = decoradoCiudad(W, calle));
  }

  const lugar = i => barrera - ANCHO_AUTO - 2 - i * (ANCHO_AUTO + HUECO);

  // un golpe: sube el trauma (la sacudida baja sola, ver dibujar)
  function golpe(fuerza) { if (fuerza > 0 && !menosMovimiento()) trauma = Math.min(1, trauma + fuerza); }

  // el combo sube: un anillo de pixel y chispas en la barrera, del color del nivel del combo
  function combo(nivel) {
    const color = COLOR_COMBO[Math.max(0, Math.min(COLOR_COMBO.length - 1, nivel - 1))];
    const cx = barrera + 3, cy = calle + 6;
    anillos.push({ x: cx, y: cy, t: 0, color });
    if (menosMovimiento()) return;
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2 + (nivel * 0.7), vel = 0.03 + ((i * 7) % 5) * 0.008;
      chispas.push({ x: cx, y: cy, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - 0.02, t: 0, vida: 420 + ((i * 53) % 180), color: i % 3 ? color : '#f0fdff' });
    }
  }

  // un robot bloqueado deja tres piezas de chatarra (de uno o dos píxeles) bajo la acera, junto a la barrera,
  // apiladas contra ella hasta tres de alto. Dónde cae cada pieza sale del número del auto: siempre igual.
  function dejarChatarra(id) {
    const base = calle + 21, desde = lugar(0) - 4, ancho = ANCHO_AUTO + 8;
    const altoEn = (x, w) => Math.max(pila.get(x) || 0, w > 1 ? pila.get(x + 1) || 0 : 0);
    for (let k = 0; k < 3 && chatarra.length < TOPE_CHATARRA; k++) {
      const h = Math.imul(id * 3 + k + 1, 2654435761) >>> 0, w = 1 + ((h >>> 13) & 1);
      let x = desde + (h % (ancho - 1));
      for (let n = 0; n < ancho && altoEn(x, w) >= 3; n++) x = desde + ((x - desde + 1) % (ancho - 1));
      const alto = altoEn(x, w);
      if (alto >= 3) return;
      for (let i = 0; i < w; i++) pila.set(x + i, alto + 1);
      chatarra.push({ x, y: base - alto, w, color: CHATARRA[(h >>> 9) % CHATARRA.length] });
    }
  }

  function eventos(lista, partida) {
    for (const ev of lista) {
      if (ev.e === 'llega') {
        autos.set(ev.id, { id: ev.id, tipo: ev.tipo, paleta: ev.id % PALETAS[ev.tipo].length, x: -ANCHO_AUTO - 6, y: 0, estado: 'fila', alfa: 1, vel: 0 });
      } else if (ev.e === 'bien' || ev.e === 'mal' || ev.e === 'cuela') {
        const a = autos.get(ev.id);
        if (!a) continue;
        const pasa = ev.e === 'cuela' || ev.accion === 'P';
        a.estado = pasa ? 'pasa' : 'bloqueado';
        if (pasa) abierta = 14;
        const cx = (a.x + ANCHO_AUTO / 2) | 0, cy = calle - 16;
        if (ev.e === 'bien') {
          flotantes.push({ x: cx, y: cy, texto: `+${ev.puntos}`, color: ev.tipo === 'dorado' ? '#facc15' : '#a7f3d0', t: 0 });
          if (!pasa) { sellos.push({ x: cx, y: calle - 5, texto: T.marcas.bloqueado, color: '#ef4444', t: 0 }); dejarChatarra(ev.id); }
          if (ev.subeCombo) combo(partida ? (partida.racha / 5) | 0 : 1); // un nivel cada cinco aciertos seguidos
        } else {
          // dejar pasar un robot pesa más que bloquear a un cliente; un cliente que se cuela, poco
          golpe(ev.e === 'cuela' ? (ev.malo ? 0.6 : 0.25) : ev.integridad !== undefined ? 0.65 : 0.4);
          if (!pasa) sellos.push({ x: cx, y: calle - 5, texto: T.marcas.bloqueado, color: '#ef4444', t: 0 });
          if (ev.puntos) flotantes.push({ x: cx, y: cy, texto: `${ev.puntos}`, color: '#fca5a5', t: 0 });
        }
      }
    }
    // lugar de cada auto en la fila
    if (partida) partida.fila.forEach((f, i) => { const a = autos.get(f.id); if (a) a.meta = lugar(i); });
  }

  // la jugada empuja la cámara un píxel hacia donde se deslizó: 1 pasar (derecha), -1 bloquear (izquierda)
  function patada(dir) { patadaDir = dir; patadaT = 90; }

  function encenderTorre(ahora) { if (!torreEncendida) { torreEncendida = true; encendidaEn = ahora; } }

  function px(v) { return Math.round(v) * u; }

  const torreImg = ahora => {
    const key = torreEncendida && ahora - encendidaEn > 400 ? 'torreOn' : 'torreOff';
    return [fijo(key, TORRE, key === 'torreOn' ? PALETA_TORRE_ENCENDIDA : PALETA_TORRE, 2), key === 'torreOn'];
  };

  function etiqueta(texto, x, y, fondo, tinta) {
    const tam = Math.max(10, Math.round(3.4 * u));
    gt.font = `600 ${tam}px ui-monospace, Menlo, Consolas, monospace`;
    const ancho = gt.measureText(texto).width + tam * 0.8;
    const ax = Math.round(x * u - ancho / 2), ay = Math.round(y * u - tam * 1.5);
    gt.fillStyle = fondo;
    gt.fillRect(ax, ay, Math.round(ancho), Math.round(tam * 1.4));
    gt.fillStyle = tinta;
    gt.textAlign = 'center';
    gt.textBaseline = 'middle';
    gt.fillText(texto, ax + ancho / 2, ay + tam * 0.72);
    marcar(ay, ay + tam * 1.4);
  }

  function placaDe(a) {
    if (a.tipo === 'buscador') return [T.placas.buscador, '#0c4a6e', '#e0f2fe'];
    if (a.tipo === 'impostor') {
      const n = (a.id * 2654435761) >>> 0;
      return [`${45 + (n % 150)}.${(n >>> 8) % 255}.${(n >>> 16) % 99}`, '#7f1d1d', '#fee2e2'];
    }
    if (a.tipo === 'wp') return [T.placas.wp, '#422006', '#fde68a'];
    return null;
  }

  function autosDibujo(ahora, dt, quieto) {
    for (const a of autos.values()) {
      if (a.estado === 'fila') {
        const meta = a.meta ?? lugar(4);
        // entra rápido y frena al llegar: el auto se ve en la barrera cuando el motor ya deja decidir sobre él
        const falta = Math.abs(meta - a.x);
        a.x += Math.sign(meta - a.x) * Math.min(falta, dt * Math.max(0.09, falta * 0.008));
      } else if (a.estado === 'pasa') {
        a.vel = Math.min(a.vel + dt * 0.0009, 0.25);
        a.x += a.vel * dt;
      } else if (a.estado === 'bloqueado') {
        a.y += dt * 0.03;
        a.alfa = Math.max(0, a.alfa - dt * 0.0016);
      } else if (a.estado === 'sale') {
        a.alfa = Math.max(0, a.alfa - dt * 0.004);
      }
      if (a.x > W + 30 || a.alfa <= 0) { autos.delete(a.id); continue; }
      const cuadro = quieto ? 0 : ((ahora / 350) | 0);
      const img = sprite(a.tipo, a.paleta, cuadro);
      const y = calle + 1 + (a.y | 0);
      g.globalAlpha = a.alfa;
      g.drawImage(img, px(a.x), px(y));
      // el brillo del auto dorado es código, no dibujo
      if (a.tipo === 'dorado' && !quieto) {
        g.fillStyle = `rgba(254,240,138,${(0.25 + 0.2 * Math.sin(ahora / 180)).toFixed(2)})`;
        g.fillRect(px(a.x - 1), px(y - 1), (ANCHO_AUTO + 2) * u, u);
      }
      g.globalAlpha = 1;
      const placa = placaDe(a);
      if (placa && a.estado !== 'bloqueado') {
        gt.globalAlpha = a.alfa;
        etiqueta(placa[0], a.x + ANCHO_AUTO / 2, y - 1, placa[1], placa[2]);
        gt.globalAlpha = 1;
      }
    }
    // el auto del giro: llega, frena, espera y da la vuelta (giro.js dice dónde va; aquí solo se pinta)
    if (autoGiro) {
      const desde = -ANCHO_AUTO - 6, x = desde + (lugar(0) - desde) * autoGiro.pos, y = calle + 1;
      const img = autoGiro.mira > 0 ? sprite('sospechoso', 0, quieto || autoGiro.espera ? 0 : ((ahora / 350) | 0)) : espejo('sospechoso', 0);
      g.drawImage(img, px(x), px(y));
      if (autoGiro.giro !== undefined) faros(Math.round(x) + ANCHO_AUTO / 2, y + 4, autoGiro.giro);
    }
  }

  // los faros del auto del giro barren la barrera mientras da la vuelta: un cono de luz tramada que va de apuntar a
  // la barrera (derecha) a apuntar a la salida (izquierda) en la primera mitad de la vuelta, y se apaga al irse
  function faros(cx, cy, f) {
    const ang = Math.PI * Math.min(1, f / 0.45), ca = Math.cos(ang), sa = Math.sin(ang) * 0.35; // casi horizontal
    const largo = 34, abre = 0.2, alfa = f < 0.45 ? 1 : Math.max(0, 1 - (f - 0.45) / 0.4);
    if (alfa <= 0) return;
    g.globalAlpha = alfa * 0.8;
    for (let y = Math.max(0, cy - 12); y < Math.min(H, cy + 12); y++) for (let x = Math.max(0, cx - largo); x < Math.min(W, cx + largo); x++) {
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
      if (d < 3 || d > largo) continue;
      const punto = (dx * ca + dy * sa) / d, cruz = (dx * sa - dy * ca) / d;
      if (punto <= 0) continue;
      const k = 1 - Math.abs(cruz) / abre;
      if (k <= 0) continue;
      const fuerza = k * (1 - d / largo) * 18;
      if (fuerza > BAYER4[((y & 3) << 2) | (x & 3)] + 1) { g.fillStyle = fuerza > 12 ? '#fef3c7' : '#fde68a'; g.fillRect(x * u, y * u, u, u); }
    }
    g.globalAlpha = 1;
  }

  // el zoom de golpe del giro: la cámara corta a la barrera a escala entera (de u a u + 1 píxeles por píxel del
  // dibujo), moviendo solo el lienzo del mundo desde el compositor; el texto de encima no se escala (queda nítido).
  // Con menos movimiento no hay corte.
  function zoomGiro(activo) {
    if (activo && !menosMovimiento()) {
      canvas.style.transformOrigin = `${((barrera + 3) * u) / dpr}px ${((calle + 6) * u) / dpr}px`;
      canvas.style.transform = `scale(${(u + 1) / u})`;
    } else canvas.style.transform = '';
  }

  function pintarChatarra() {
    for (const c of chatarra) {
      g.fillStyle = c.color;
      g.fillRect(c.x * u, c.y * u, c.w * u, u);
    }
  }

  // un círculo de pixel en la cuadrícula (punto medio): cada punto es un píxel del dibujo entero, sin suavizado
  function anilloPixel(cx, cy, r) {
    let x = r, y = 0, e = 1 - r;
    while (x >= y) {
      for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) g.fillRect((cx + a) * u, (cy + b) * u, u, u);
      y++;
      if (e < 0) e += 2 * y + 1;
      else { x--; e += 2 * (y - x) + 1; }
    }
  }

  function pintarAnillos(dt, quieto) {
    for (let i = anillos.length - 1; i >= 0; i--) {
      const a = anillos[i];
      a.t += dt;
      if (a.t > 420) { anillos.splice(i, 1); continue; }
      const p = a.t / 420;
      g.globalAlpha = 1 - p;
      g.fillStyle = a.color;
      anilloPixel(a.x, a.y, quieto ? 9 : Math.round(3 + 15 * (1 - (1 - p) * (1 - p))));
    }
    for (let i = chispas.length - 1; i >= 0; i--) {
      const c = chispas[i];
      c.t += dt;
      if (c.t > c.vida) { chispas.splice(i, 1); continue; }
      c.vy += dt * 0.00006;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      g.globalAlpha = 1 - c.t / c.vida;
      g.fillStyle = c.color;
      g.fillRect(Math.round(c.x) * u, Math.round(c.y) * u, u, u);
    }
    g.globalAlpha = 1;
  }

  // el reloj de la barrera: un relojito pixel y los milisegundos, chico y encima del poste
  function pintarReloj(dt) {
    if (!reloj) return;
    reloj.t += dt;
    if (!reloj.fijo && reloj.t > 1000) { reloj = null; return; }
    const tam = Math.max(10, Math.round(3 * u));
    gt.font = `600 ${tam}px ui-monospace, Menlo, Consolas, monospace`;
    const icono = fijo('reloj', RELOJ, PALETA_RELOJ);
    const ancho = icono.width + tam * 0.35 + gt.measureText(reloj.texto).width;
    const cx = (barrera + 4) * u, cy = (calle - 17) * u;
    const x0 = Math.round(cx - ancho / 2), alto = Math.round(tam * 1.5);
    gt.globalAlpha = reloj.fijo ? 1 : Math.min(1, (1000 - reloj.t) / 300);
    gt.fillStyle = 'rgba(8, 13, 26, .78)';
    gt.fillRect(x0 - Math.round(tam * 0.35), Math.round(cy - alto / 2), Math.round(ancho + tam * 0.7), alto);
    gt.drawImage(icono, x0, Math.round(cy - icono.height / 2));
    gt.fillStyle = '#a5f3fc';
    gt.textAlign = 'left';
    gt.textBaseline = 'middle';
    gt.fillText(reloj.texto, x0 + icono.width + Math.round(tam * 0.35), cy);
    gt.globalAlpha = 1;
    marcar(cy - alto / 2, cy + alto / 2);
  }

  function efectos(dt, quieto) {
    for (let i = flotantes.length - 1; i >= 0; i--) {
      const f = flotantes[i];
      f.t += dt;
      if (f.t > 900) { flotantes.splice(i, 1); continue; }
      const tam = Math.max(12, Math.round(4.2 * u));
      gt.font = `700 ${tam}px 'Silkscreen', ui-monospace, monospace`;
      gt.textAlign = 'center';
      gt.textBaseline = 'middle';
      gt.globalAlpha = 1 - f.t / 900;
      gt.fillStyle = f.color;
      const y = (f.y - f.t / 90) * u;
      gt.fillText(f.texto, f.x * u, y);
      gt.globalAlpha = 1;
      marcar(y - tam, y + tam);
    }
    // el sello salta al estamparse: de 1,6 a su tamaño en 140 ms
    for (let i = sellos.length - 1; i >= 0; i--) {
      const s = sellos[i];
      s.t += dt;
      if (s.t > 650) { sellos.splice(i, 1); continue; }
      const pop = !quieto && s.t < 140 ? 1.6 - 0.6 * (s.t / 140) : 1;
      const tam = Math.round(4.6 * u * pop);
      gt.font = `700 ${tam}px 'Silkscreen', ui-monospace, monospace`;
      const ancho = gt.measureText(s.texto).width + tam;
      gt.globalAlpha = s.t > 450 ? 1 - (s.t - 450) / 200 : 1;
      gt.strokeStyle = s.color;
      gt.lineWidth = Math.max(2, u);
      gt.strokeRect(Math.round(s.x * u - ancho / 2), Math.round(s.y * u - tam * 0.8), Math.round(ancho), Math.round(tam * 1.6));
      gt.fillStyle = s.color;
      gt.textAlign = 'center';
      gt.textBaseline = 'middle';
      gt.fillText(s.texto, s.x * u, s.y * u);
      gt.globalAlpha = 1;
      marcar(s.y * u - tam * 0.8 - u, s.y * u + tam * 0.8 + u);
    }
  }

  let antes = 0;
  function dibujar(ahora) {
    const dt = antes ? Math.min(50, ahora - antes) : 16;
    antes = ahora;
    if (abierta > 0) abierta -= dt / 16;
    const quieto = menosMovimiento();
    // la cámara: la sacudida (trauma², en píxeles del dibujo enteros) y el empujón de la jugada
    let sx = 0, sy = 0;
    if (!quieto && trauma > 0) {
      const k = trauma * trauma;
      sx = Math.round(SACUDIDA * k * ruido(ahora, 1));
      sy = Math.round(SACUDIDA * k * ruido(ahora, 2));
    }
    trauma = Math.max(0, trauma - dt / 650);
    if (patadaT > 0) { if (!quieto) sx += patadaDir; patadaT -= dt; }
    limpiarTexto();
    g.save();
    gt.save();
    g.translate(sx * u, sy * u);
    gt.translate(sx * u, sy * u);
    pintarCielo(g, L, estrellas, ahora, quieto);
    pintarCiudad(g, L, edificios, ahora, quieto);
    const [img, encendida] = torreImg(ahora);
    pintarTorre(g, L, img, encendida, ahora, quieto);
    pintarCalzada(g, L);
    pintarChatarra();
    autosDibujo(ahora, dt, quieto);
    pintarBarrera(g, L, fijo('poste', BARRERA_POSTE, PALETA_BARRERA), abierta > 0);
    pintarAnillos(dt, quieto);
    efectos(dt, quieto);
    pintarReloj(dt);
    g.restore();
    gt.restore();
  }

  function limpiar() {
    autos.clear(); flotantes.length = 0; sellos.length = 0; abierta = 0; reloj = null; autoGiro = null; zoomGiro(false);
    trauma = 0; patadaT = 0; anillos.length = 0; chispas.length = 0; chatarra.length = 0; pila.clear();
  }

  // lo que tardó la última respuesta; `fijo` lo deja a la vista (en el giro, mientras el auto espera)
  function mostrarReloj(texto, fijo = false) {
    if (fijo && reloj && reloj.fijo) reloj.texto = texto;
    else reloj = { texto, t: 0, fijo };
  }
  // el giro: los autos que quedaban en la fila se van y entra el último; `estado` es el de giro.js (o null)
  function empezarGiro() {
    for (const a of autos.values()) if (a.estado === 'fila') a.estado = 'sale';
    reloj = null;
  }
  function moverGiro(estado) {
    autoGiro = estado;
    if (!estado || estado.mira < 0) { if (reloj && reloj.fijo) reloj = { ...reloj, fijo: false, t: 700 }; }
  }

  redimensionar();
  return { redimensionar, eventos, dibujar, encenderTorre, limpiar, mostrarReloj, empezarGiro, moverGiro, zoomGiro, patada, zonaCalle: () => (calle + 8) / H };
}
