// Dibujo de «El peaje» en un canvas. Dos capas, como dice el GDD:
// - la capa pixel (autos, barrera, torre, edificios), en una cuadrícula a escala entera y siempre en píxeles enteros;
// - la capa de código (cielo, estrellas, luz de la baliza, sellos, textos), generada en el momento.
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
export function pintarColumna(g, col, y0, desde = 0, hasta = g.canvas.height) {
  y0 = Math.round(y0);
  const a = Math.max(desde, y0, 0), b = Math.min(hasta, y0 + col.height, g.canvas.height);
  if (b <= a) return;
  const suave = g.imageSmoothingEnabled;
  g.imageSmoothingEnabled = true;
  g.drawImage(col, 0, a - y0, 1, b - a, 0, a, g.canvas.width, b - a);
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
    if ((x + ed.ancho) * u < 0 || x * u > g.canvas.width) continue;
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

export function pintarCalzada(g, L, dx = 0, dy = 0, suelo = null) {
  const u = L.u, c = L.calle + dy, ancho = g.canvas.width;
  g.fillStyle = '#1e293b';
  g.fillRect(0, (c - 3) * u, ancho, 3 * u);
  g.fillStyle = '#111827';
  g.fillRect(0, c * u, ancho, 16 * u);
  g.fillStyle = '#1e293b';
  g.fillRect(0, (c + 16) * u, ancho, 3 * u);
  g.fillStyle = '#475569';
  const x0 = ((dx % 8) + 8) % 8;
  for (let x = 2 + x0 - 8; x < L.W + 8; x += 8) g.fillRect(x * u, (c + 12) * u, 4 * u, u);
  // abajo de la calle: el suelo de la ciudad hasta el borde. Con `suelo`, solo esos rectángulos: la partida no lo
  // repinta entero en cada cuadro (es un tercio de la pantalla y no cambia), solo donde cayó un auto bloqueado
  g.fillStyle = '#0a1120';
  const y0 = (c + 19) * u, y1 = g.canvas.height;
  if (!suelo) g.fillRect(0, y0, ancho, Math.max(0, y1 - y0));
  else for (const [x, y, w, h] of suelo) if (Math.min(y + h, y1) > Math.max(y, y0)) g.fillRect(x, Math.max(y, y0), w, Math.min(y + h, y1) - Math.max(y, y0));
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

export function crearEscena(canvas, { menosMovimiento = () => false } = {}) {
  const g = canvas.getContext('2d');
  let u = 3;            // píxeles del canvas por cada píxel del dibujo
  let W = 100, H = 200; // tamaño del mundo en píxeles del dibujo
  let calle = 120, barrera = 60;
  let cache = new Map();
  const autos = new Map();
  const flotantes = [];
  const sellos = [];
  let temblor = 0;
  // el suelo se pinta entero solo al empezar, al cambiar de tamaño y con el temblor; si no, solo donde hubo autos
  let sueloEntero = true, tembloAntes = false, pisados = [];
  let abierta = 0;
  let torreEncendida = false, encendidaEn = 0;
  let estrellas = [], edificios = [], L = disposicion(300, 600);
  // el reloj chico sobre la barrera (lo que tardó la última respuesta) y el auto del giro, que no es del motor
  let reloj = null, autoGiro = null;

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
    // a la densidad de la pantalla (hasta 3): el texto de las placas, los puntos y los sellos, siempre nítido. La
    // velocidad sale de no repintar degradés en cada cuadro (ver columna), no de bajar la resolución.
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    L = disposicion(canvas.width, canvas.height);
    ({ u, W, H, calle, barrera } = L);
    cache = new Map();
    g.imageSmoothingEnabled = false;
    ({ estrellas, edificios } = decoradoCiudad(W, calle));
    sueloEntero = true;
  }

  const lugar = i => barrera - ANCHO_AUTO - 2 - i * (ANCHO_AUTO + HUECO);

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
          if (!pasa) sellos.push({ x: cx, y: calle - 5, texto: T.marcas.bloqueado, color: '#ef4444', t: 0 });
        } else {
          temblor = menosMovimiento() ? 0 : 8;
          if (!pasa) sellos.push({ x: cx, y: calle - 5, texto: T.marcas.bloqueado, color: '#ef4444', t: 0 });
          if (ev.puntos) flotantes.push({ x: cx, y: cy, texto: `${ev.puntos}`, color: '#fca5a5', t: 0 });
        }
      }
    }
    // lugar de cada auto en la fila
    if (partida) partida.fila.forEach((f, i) => { const a = autos.get(f.id); if (a) a.meta = lugar(i); });
  }

  function encenderTorre(ahora) { if (!torreEncendida) { torreEncendida = true; encendidaEn = ahora; } }

  function px(v) { return Math.round(v) * u; }

  const torreImg = ahora => {
    const key = torreEncendida && ahora - encendidaEn > 400 ? 'torreOn' : 'torreOff';
    return [fijo(key, TORRE, key === 'torreOn' ? PALETA_TORRE_ENCENDIDA : PALETA_TORRE, 2), key === 'torreOn'];
  };

  function etiqueta(texto, x, y, fondo, tinta) {
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
    const pisa = [];
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
      pisa.push([px(a.x - 1), px(y - 1), img.width + 2 * u, img.height + 2 * u]);
      // el brillo del auto dorado es código, no dibujo
      if (a.tipo === 'dorado' && !quieto) {
        g.fillStyle = `rgba(254,240,138,${(0.25 + 0.2 * Math.sin(ahora / 180)).toFixed(2)})`;
        g.fillRect(px(a.x - 1), px(y - 1), (ANCHO_AUTO + 2) * u, u);
      }
      const placa = placaDe(a);
      if (placa && a.estado !== 'bloqueado') etiqueta(placa[0], a.x + ANCHO_AUTO / 2, y - 1, placa[1], placa[2]);
      g.globalAlpha = 1;
    }
    // el auto del giro: llega, frena, espera y da la vuelta (giro.js dice dónde va; aquí solo se pinta)
    if (autoGiro) {
      const desde = -ANCHO_AUTO - 6, x = desde + (lugar(0) - desde) * autoGiro.pos, y = calle + 1;
      const img = autoGiro.mira > 0 ? sprite('sospechoso', 0, quieto || autoGiro.espera ? 0 : ((ahora / 350) | 0)) : espejo('sospechoso', 0);
      g.drawImage(img, px(x), px(y));
      pisa.push([px(x - 1), px(y - 1), img.width + 2 * u, img.height + 2 * u]);
    }
    pisados = pisa;
  }

  // el reloj de la barrera: un relojito pixel y los milisegundos, chico y encima del poste
  function pintarReloj(dt) {
    if (!reloj) return;
    reloj.t += dt;
    if (!reloj.fijo && reloj.t > 1000) { reloj = null; return; }
    const tam = Math.max(10, Math.round(3 * u));
    g.font = `600 ${tam}px ui-monospace, Menlo, Consolas, monospace`;
    const icono = fijo('reloj', RELOJ, PALETA_RELOJ);
    const ancho = icono.width + tam * 0.35 + g.measureText(reloj.texto).width;
    const cx = (barrera + 4) * u, cy = (calle - 17) * u;
    const x0 = Math.round(cx - ancho / 2), alto = Math.round(tam * 1.5);
    g.globalAlpha = reloj.fijo ? 1 : Math.min(1, (1000 - reloj.t) / 300);
    g.fillStyle = 'rgba(8, 13, 26, .78)';
    g.fillRect(x0 - Math.round(tam * 0.35), Math.round(cy - alto / 2), Math.round(ancho + tam * 0.7), alto);
    g.drawImage(icono, x0, Math.round(cy - icono.height / 2));
    g.fillStyle = '#a5f3fc';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText(reloj.texto, x0 + icono.width + Math.round(tam * 0.35), cy);
    g.globalAlpha = 1;
  }

  function efectos(dt) {
    for (let i = flotantes.length - 1; i >= 0; i--) {
      const f = flotantes[i];
      f.t += dt;
      if (f.t > 900) { flotantes.splice(i, 1); continue; }
      const tam = Math.max(12, Math.round(4.2 * u));
      g.font = `700 ${tam}px 'Silkscreen', ui-monospace, monospace`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.globalAlpha = 1 - f.t / 900;
      g.fillStyle = f.color;
      g.fillText(f.texto, f.x * u, (f.y - f.t / 90) * u);
      g.globalAlpha = 1;
    }
    for (let i = sellos.length - 1; i >= 0; i--) {
      const s = sellos[i];
      s.t += dt;
      if (s.t > 650) { sellos.splice(i, 1); continue; }
      const pop = s.t < 90 ? 1.35 - s.t / 300 : 1;
      const tam = Math.round(4.6 * u * pop);
      g.font = `700 ${tam}px 'Silkscreen', ui-monospace, monospace`;
      const ancho = g.measureText(s.texto).width + tam;
      g.globalAlpha = s.t > 450 ? 1 - (s.t - 450) / 200 : 1;
      g.strokeStyle = s.color;
      g.lineWidth = Math.max(2, u);
      g.strokeRect(Math.round(s.x * u - ancho / 2), Math.round(s.y * u - tam * 0.8), Math.round(ancho), Math.round(tam * 1.6));
      g.fillStyle = s.color;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(s.texto, s.x * u, s.y * u);
      g.globalAlpha = 1;
    }
  }

  let antes = 0;
  function dibujar(ahora) {
    const dt = antes ? Math.min(50, ahora - antes) : 16;
    antes = ahora;
    if (abierta > 0) abierta -= dt / 16;
    g.save();
    const tiembla = temblor > 0;
    if (tiembla) {
      g.translate(((temblor % 2) ? 1 : -1) * u, 0);
      temblor--;
    }
    const suelo = sueloEntero || tiembla || tembloAntes ? null : pisados;
    sueloEntero = false;
    tembloAntes = tiembla;
    const quieto = menosMovimiento();
    pintarCielo(g, L, estrellas, ahora, quieto);
    pintarCiudad(g, L, edificios, ahora, quieto);
    const [img, encendida] = torreImg(ahora);
    pintarTorre(g, L, img, encendida, ahora, quieto);
    pintarCalzada(g, L, 0, 0, suelo);
    autosDibujo(ahora, dt, quieto);
    pintarBarrera(g, L, fijo('poste', BARRERA_POSTE, PALETA_BARRERA), abierta > 0);
    efectos(dt);
    pintarReloj(dt);
    g.restore();
  }

  function limpiar() { autos.clear(); flotantes.length = 0; sellos.length = 0; abierta = 0; sueloEntero = true; reloj = null; autoGiro = null; }

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
  return { redimensionar, eventos, dibujar, encenderTorre, limpiar, mostrarReloj, empezarGiro, moverGiro, zonaCalle: () => (calle + 8) / H };
}
