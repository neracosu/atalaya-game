// Dibujo de «El peaje» en un canvas. Dos capas, como dice el GDD:
// - la capa pixel (autos, barrera, torre, edificios), en una cuadrícula a escala entera y siempre en píxeles enteros;
// - la capa de código (cielo, estrellas, luz de la baliza, sellos, textos), generada en el momento.
// El motor no sabe nada de esto: la escena solo escucha los eventos que el motor devuelve.

import { SPRITES, PALETAS, BARRERA_POSTE, PALETA_BARRERA, TORRE, PALETA_TORRE, PALETA_TORRE_ENCENDIDA, aCanvas } from './sprites.js';
import { T } from '../textos.js';

const ANCHO_AUTO = 20;
const HUECO = 3;

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
  let abierta = 0;
  let torreEncendida = false, encendidaEn = 0;
  let estrellas = [], edificios = [];

  function sprite(tipo, paleta, cuadro) {
    const k = `${tipo}:${paleta}:${cuadro}:${u}`;
    if (!cache.has(k)) {
      const cuadros = SPRITES[tipo];
      cache.set(k, aCanvas(cuadros[cuadro % cuadros.length], PALETAS[tipo][paleta], u));
    }
    return cache.get(k);
  }
  function fijo(nombre, filas, paleta) {
    const k = `${nombre}:${u}`;
    if (!cache.has(k)) cache.set(k, aCanvas(filas, paleta, u));
    return cache.get(k);
  }

  // azar solo para el decorado (estrellas, ventanas), con su propia semilla: no toca la partida
  function decorado() {
    let s = 20260928;
    const r = () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296);
    estrellas = Array.from({ length: 50 }, () => ({ x: (r() * W) | 0, y: (r() * calle * 0.55) | 0, f: r() * 6.28 }));
    edificios = [];
    let x = -2;
    while (x < W) {
      const ancho = 8 + ((r() * 10) | 0), alto = 14 + ((r() * 36) | 0);
      const ventanas = [];
      for (let vy = 3; vy < alto - 3; vy += 4) for (let vx = 2; vx < ancho - 2; vx += 3) if (r() < 0.45) ventanas.push([vx, vy, r() * 20]);
      edificios.push({ x, ancho, alto, ventanas, tono: r() });
      x += ancho + 1 + ((r() * 3) | 0);
    }
  }

  function redimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    // unos 110 píxeles del dibujo a lo ancho: un auto mide la quinta parte de la pantalla
    u = Math.max(2, Math.floor(canvas.width / 110));
    W = Math.floor(canvas.width / u);
    H = Math.floor(canvas.height / u);
    calle = Math.floor(H * 0.64);
    barrera = Math.floor(W * 0.62);
    cache = new Map();
    g.imageSmoothingEnabled = false;
    decorado();
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

  function cielo(ahora) {
    const grad = g.createLinearGradient(0, 0, 0, calle * u);
    grad.addColorStop(0, '#050914');
    grad.addColorStop(1, '#0c1a33');
    g.fillStyle = grad;
    g.fillRect(0, 0, canvas.width, calle * u);
    const quieto = menosMovimiento();
    for (const e of estrellas) {
      const b = quieto ? 0.7 : 0.45 + 0.4 * Math.sin(ahora / 900 + e.f);
      g.fillStyle = `rgba(226,232,240,${b.toFixed(2)})`;
      g.fillRect(px(e.x), px(e.y), u, u);
    }
  }

  function ciudad(ahora) {
    const base = calle - 3;
    for (const ed of edificios) {
      g.fillStyle = ed.tono > 0.5 ? '#111a2e' : '#0e1627';
      g.fillRect(px(ed.x), px(base - ed.alto), ed.ancho * u, ed.alto * u);
      for (const [vx, vy, fase] of ed.ventanas) {
        const encendida = menosMovimiento() || ((ahora / 1000 + fase) % 20) > 2;
        if (!encendida) continue;
        g.fillStyle = '#fde68a';
        g.globalAlpha = 0.55;
        g.fillRect(px(ed.x + vx), px(base - ed.alto + vy), u, u);
        g.globalAlpha = 1;
      }
    }
  }

  function torre(ahora) {
    const esc = 2; // la torre se dibuja al doble, para que se lea al fondo
    const key = torreEncendida && ahora - encendidaEn > 400 ? 'torreOn' : 'torreOff';
    if (!cache.has(`${key}:${u}`)) cache.set(`${key}:${u}`, aCanvas(TORRE, key === 'torreOn' ? PALETA_TORRE_ENCENDIDA : PALETA_TORRE, u * esc));
    const img = cache.get(`${key}:${u}`);
    const tx = W - 16 * esc - 2, ty = calle - 3 - TORRE.length * esc;
    // la luz de la baliza barre la ciudad (capa de código)
    if (key === 'torreOn') {
      const bx = (tx + 8 * esc) * u, by = (ty + 1 * esc) * u;
      const ang = menosMovimiento() ? Math.PI * 1.1 : Math.PI + Math.sin(ahora / 2400) * 0.55;
      const largo = W * u * 0.9, abre = 0.13;
      const grad = g.createRadialGradient(bx, by, 0, bx, by, largo);
      grad.addColorStop(0, 'rgba(34,211,238,0.22)');
      grad.addColorStop(1, 'rgba(34,211,238,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(bx + Math.cos(ang - abre) * largo, by + Math.sin(ang - abre) * largo);
      g.lineTo(bx + Math.cos(ang + abre) * largo, by + Math.sin(ang + abre) * largo);
      g.closePath();
      g.fill();
    }
    g.drawImage(img, px(tx), px(ty));
  }

  function calzada(ahora) {
    // vereda, calle y líneas
    g.fillStyle = '#1e293b';
    g.fillRect(0, px(calle - 3), canvas.width, 3 * u);
    g.fillStyle = '#111827';
    g.fillRect(0, px(calle), canvas.width, 16 * u);
    g.fillStyle = '#1e293b';
    g.fillRect(0, px(calle + 16), canvas.width, 3 * u);
    g.fillStyle = '#475569';
    for (let x = 2; x < W; x += 8) g.fillRect(px(x), px(calle + 12), 4 * u, u);
    // abajo de la calle: el suelo de la ciudad hasta el borde
    g.fillStyle = '#0a1120';
    g.fillRect(0, px(calle + 19), canvas.width, canvas.height - px(calle + 19));
  }

  function barreraDibujo() {
    const poste = fijo('poste', BARRERA_POSTE, PALETA_BARRERA);
    const x = barrera + 1, y = calle - 12;
    g.drawImage(poste, px(x), px(y));
    // el brazo: rayado rojo y blanco. Cerrado cruza la calle a la altura de los autos, delante del que espera;
    // abierto, apunta hacia arriba. Dos dibujos fijos: nunca se rota un sprite en ángulos raros.
    const largo = 16;
    for (let i = 0; i < largo; i++) {
      g.fillStyle = (i >> 1) % 2 ? '#f8fafc' : '#ef4444';
      if (abierta > 0) g.fillRect(px(x + 2), px(y - 1 - i), 2 * u, u);
      else g.fillRect(px(x + 5 + i), px(calle + 4), u, 2 * u);
    }
  }

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

  function autosDibujo(ahora, dt) {
    const quieto = menosMovimiento();
    for (const a of autos.values()) {
      if (a.estado === 'fila') {
        const meta = a.meta ?? lugar(4);
        a.x += Math.sign(meta - a.x) * Math.min(Math.abs(meta - a.x), dt * 0.09);
      } else if (a.estado === 'pasa') {
        a.vel = Math.min(a.vel + dt * 0.0009, 0.25);
        a.x += a.vel * dt;
      } else if (a.estado === 'bloqueado') {
        a.y += dt * 0.03;
        a.alfa = Math.max(0, a.alfa - dt * 0.0016);
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
      const placa = placaDe(a);
      if (placa && a.estado !== 'bloqueado') etiqueta(placa[0], a.x + ANCHO_AUTO / 2, y - 1, placa[1], placa[2]);
      g.globalAlpha = 1;
    }
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
    if (temblor > 0) {
      g.translate(((temblor % 2) ? 1 : -1) * u, 0);
      temblor--;
    }
    cielo(ahora);
    ciudad(ahora);
    torre(ahora);
    calzada(ahora);
    autosDibujo(ahora, dt);
    barreraDibujo();
    efectos(dt);
    g.restore();
  }

  function limpiar() { autos.clear(); flotantes.length = 0; sellos.length = 0; abierta = 0; }

  redimensionar();
  return { redimensionar, eventos, dibujar, encenderTorre, limpiar, zonaCalle: () => (calle + 8) / H };
}
