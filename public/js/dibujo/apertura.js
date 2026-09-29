// El dibujo de la apertura: la ciudad de noche vista desde el aire, como en el monitor.
// Capa pixel: manzanas, techos, farolas, la torre desde arriba y Chispa, a escala entera y en píxeles enteros.
// Capa de código: la oscuridad, la luz de la baliza que barre y revela la ciudad, las chispas del encendido, el
// Enjambre que se acerca por los bordes, el texto letra por letra y el destello final que se abre sobre la partida.
// Solo dibuja: el tiempo lo lleva el control de apertura.js.

import { CHISPA, PALETA_CHISPA, PALETA_CHISPA_DORMIDO, TORRE_AIRE, PALETA_TORRE_AIRE, PALETA_TORRE_AIRE_ENCENDIDA, aCanvas } from './sprites.js';
import { GUION, letrasVisibles } from '../apertura.js';

const PAN = 8;            // lo que avanza la cámara, en píxeles del dibujo, de a uno por vez
const PLAZA = 11;         // radio de la plaza de la torre
const VUELTA = 3600;      // ms por vuelta de la luz
const ABRE = 0.2;         // media apertura del haz, en radianes

const suave = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const entre = (t, a, b) => suave((t - a) / (b - a));
function azarDe(semilla) {
  let s = semilla >>> 0;
  return () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296);
}

// los techos, de noche y bajo la luz de la torre
const OSCURO = { calle: '#050912', raya: '#141c2c', farola: '#9a7330', borde: '#18233b', sombra: '#04070e', luz: '#8a6a2a', aire: '#1a2233',
  techos: ['#0c1322', '#0e1628', '#101a2f', '#0b1120'], plaza: '#0a1020', anillo: '#131c30' };
const CLARO = { calle: '#13213a', raya: '#4b5f7d', farola: '#fff3c4', borde: '#4a6c99', sombra: '#0c1629', luz: '#fde68a', aire: '#7188a8',
  techos: ['#1d3150', '#223a5c', '#1a2c49', '#27446b'], plaza: '#1c2c48', anillo: '#34507a' };

export function crearDibujoApertura(canvas, { lineas = [], nombre = '', hora = '', guion = GUION } = {}) {
  const g = canvas.getContext('2d');
  if (!g) throw new Error('sin lienzo');
  let dpr = 1, u = 3, W = 100, H = 200, cw = 390, ch = 844;
  let oscura = null, clara = null;
  let torre = { x: 50, y: 60 };
  let autos = [], enjambre = [], balizas = [], chispas = [];
  let texto = { fs: 20, alto: 26, filas: [] };
  const cache = new Map();
  const sprite = (k, filas, paleta, esc) => {
    const c = `${k}:${esc}`;
    if (!cache.has(c)) cache.set(c, aCanvas(filas, paleta, esc));
    return cache.get(c);
  };

  function lienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // ---- la ciudad, pintada una vez en dos versiones: de noche y bajo la luz ----
  function armarCiudad() {
    const r = azarDe(20261001);
    const alto = H + PAN;
    torre = { x: W >> 1, y: Math.round(H * 0.3) + PAN };
    oscura = lienzo(W * u, alto * u);
    clara = lienzo(W * u, alto * u);
    const capas = [[oscura.getContext('2d'), OSCURO], [clara.getContext('2d'), CLARO]];
    const rect = (x, y, w, h, clave, idx) => {
      for (const [c, p] of capas) { c.fillStyle = idx === undefined ? p[clave] : p[clave][idx]; c.fillRect(x * u, y * u, w * u, h * u); }
    };
    rect(0, 0, W, alto, 'calle');

    // las calles: una avenida que cruza por la torre en cada sentido y manzanas al azar hacia los lados
    const cortes = (centro, largo) => {
      const lista = [[centro - 2, 4]];
      for (const lado of [1, -1]) {
        let x = lado > 0 ? centro + 2 : centro - 2;
        while (lado > 0 ? x < largo : x > 0) {
          const manzana = 12 + ((r() * 8) | 0), ancho = r() < 0.25 ? 4 : 3;
          x += lado * manzana;
          lista.push(lado > 0 ? [x, ancho] : [x - ancho, ancho]);
          x += lado * ancho;
        }
      }
      return lista.sort((a, b) => a[0] - b[0]);
    };
    const cx = cortes(torre.x, W), cy = cortes(torre.y, alto);
    const callesV = cx.map(([x, a]) => ({ x: x + (a >> 1), a })), callesH = cy.map(([y, a]) => ({ y: y + (a >> 1), a }));

    // las manzanas y sus edificios
    for (let i = 0; i < cx.length - 1; i++) for (let j = 0; j < cy.length - 1; j++) {
      const x0 = cx[i][0] + cx[i][1], x1 = cx[i + 1][0], y0 = cy[j][0] + cy[j][1], y1 = cy[j + 1][0];
      if (x1 - x0 < 3 || y1 - y0 < 3) continue;
      const partes = [];
      const horiz = x1 - x0 >= y1 - y0;
      const n = 1 + ((r() * 3) | 0);
      let desde = horiz ? x0 : y0;
      const hasta = horiz ? x1 : y1;
      for (let k = 0; k < n; k++) {
        const fin = k === n - 1 ? hasta : Math.min(hasta, desde + Math.max(4, Math.round(((hasta - desde) / (n - k)) * (0.7 + r() * 0.6))));
        if (fin - desde >= 3) partes.push(horiz ? [desde, y0, fin - desde, y1 - y0] : [x0, desde, x1 - x0, fin - desde]);
        desde = fin + 1;
        if (desde >= hasta - 2) break;
      }
      for (const [bx, by, bw, bh] of partes) edificio(bx, by, bw, bh, r, rect);
    }

    // farolas al borde de cada calle y rayas en las avenidas
    for (const { x, a } of callesV) for (let y = 2; y < alto; y += 6) rect(x - (a >> 1) + (((y / 6) | 0) % 2 ? a - 1 : 0), y, 1, 1, 'farola');
    for (const { y, a } of callesH) for (let x = 4; x < W; x += 6) rect(x, y - (a >> 1) + (((x / 6) | 0) % 2 ? a - 1 : 0), 1, 1, 'farola');
    for (let y = 0; y < alto; y += 4) rect(torre.x, y, 1, 2, 'raya');
    for (let x = 0; x < W; x += 4) rect(x, torre.y, 2, 1, 'raya');

    // la plaza de la torre: un círculo de pixel, con su anillo
    for (let dy = -PLAZA - 1; dy <= PLAZA + 1; dy++) for (let dx = -PLAZA - 1; dx <= PLAZA + 1; dx++) {
      const d2 = dx * dx + dy * dy;
      if (d2 <= PLAZA * PLAZA) rect(torre.x + dx, torre.y + dy, 1, 1, d2 >= (PLAZA - 1) * (PLAZA - 1) ? 'anillo' : 'plaza');
    }

    // los autos de la noche: dos puntos de luz, blanco adelante y rojo atrás
    autos = Array.from({ length: 18 }, () => {
      const v = r() < 0.5, calle = v ? callesV[(r() * callesV.length) | 0] : callesH[(r() * callesH.length) | 0];
      const dir = r() < 0.5 ? 1 : -1;
      return { v, fijo: (v ? calle.x : calle.y) + (dir > 0 ? 1 : -1) * (calle.a > 3 ? 1 : 0), dir, p: r() * (v ? alto : W), vel: 0.004 + r() * 0.006, largo: v ? alto : W };
    });

    // el Enjambre: llega desde afuera y se queda rondando los bordes de la ciudad
    enjambre = Array.from({ length: 96 }, (_, i) => ({ ang: r() * Math.PI * 2, d0: 1.15 + r() * 0.3, dq: 0.82 + r() * 0.2, sale: guion.enjambre + i * 24, gira: (r() - 0.5) * 0.00012 }));
    chispas = Array.from({ length: 28 }, () => ({ ang: r() * Math.PI * 2, vel: 0.02 + r() * 0.035, vida: 500 + r() * 450, c: r() < 0.5 ? '#f0fdff' : '#67e8f9' }));
  }

  function edificio(bx, by, bw, bh, r, rect) {
    const tono = (r() * 4) | 0;
    rect(bx, by, bw, bh, 'techos', tono);
    rect(bx, by, bw, 1, 'borde');
    rect(bx, by, 1, bh, 'borde');
    rect(bx, by + bh - 1, bw, 1, 'sombra');
    rect(bx + bw - 1, by, 1, bh, 'sombra');
    if (bw >= 5 && bh >= 5) {
      for (let k = Math.floor((bw * bh) / 26); k > 0; k--) rect(bx + 1 + ((r() * (bw - 2)) | 0), by + 1 + ((r() * (bh - 2)) | 0), 1, 1, 'luz');
      if (r() < 0.6) rect(bx + 1 + ((r() * (bw - 3)) | 0), by + 1 + ((r() * (bh - 2)) | 0), 2, 1, 'aire');
    }
    if (bw * bh > 110 && r() < 0.5) balizas.push({ x: bx + 1 + ((r() * (bw - 2)) | 0), y: by + 1 + ((r() * (bh - 2)) | 0), fase: r() * 1400 });
  }

  // ---- el texto: se arma entero antes de escribirse, para que las líneas no salten mientras aparece ----
  function armarTexto() {
    const fs = Math.round(Math.max(18, Math.min(25, cw * 0.056)) * dpr);
    g.font = `600 ${fs}px 'Space Grotesk', system-ui, sans-serif`;
    const maximo = (cw - 48) * dpr;
    // corta por palabras; luego achica el ancho mientras no sume filas, para que no quede una palabra sola abajo
    const cortar = (linea, ancho) => {
      const filas = [];
      let fila = '';
      for (const palabra of linea.split(' ')) {
        const prueba = fila ? fila + ' ' + palabra : palabra;
        if (fila && g.measureText(prueba).width > ancho) { filas.push(fila); fila = palabra; } else fila = prueba;
      }
      filas.push(fila);
      return filas;
    };
    const filas = [];
    lineas.forEach((linea, i) => {
      let partes = cortar(linea, maximo);
      if (partes.length > 1) {
        let ancho = maximo;
        while (ancho > maximo * 0.4) {
          const otra = cortar(linea, ancho - 4 * dpr);
          if (otra.length > partes.length) break;
          partes = otra;
          ancho -= 4 * dpr;
        }
      }
      let desde = 0;
      for (const p of partes) { filas.push({ linea: i, desde, texto: p }); desde += p.length + 1; }
    });
    texto = { fs, alto: Math.round(fs * 1.32), filas };
  }

  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rc = canvas.getBoundingClientRect();
    cw = Math.max(1, rc.width || 390);
    ch = Math.max(1, rc.height || 844);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    u = Math.max(2, Math.floor(canvas.width / 110));
    W = Math.ceil(canvas.width / u);
    H = Math.ceil(canvas.height / u);
    cache.clear();
    balizas = [];
    armarCiudad();
    armarTexto();
  }

  // ---- la luz de la torre ----
  // Da vueltas parejas y en el último tramo acelera una vuelta más, para llegar apuntando a la cámara en el destello
  function anguloLuz(t) {
    const base = Math.PI / 2 + ((t - guion.destello) / VUELTA) * Math.PI * 2;
    const extra = t > guion.destello - 800 ? Math.PI * 2 * ((t - (guion.destello - 800)) / 800) ** 2 : 0;
    return guion.quieto ? -Math.PI * 0.28 : base + extra;
  }
  function conoLuz(bx, by, ang, abre, largo) {
    g.beginPath();
    g.moveTo(bx, by);
    const pasos = 10;
    for (let i = 0; i <= pasos; i++) {
      const a = ang - abre + (2 * abre * i) / pasos;
      g.lineTo(bx + Math.cos(a) * largo, by + Math.sin(a) * largo);
    }
    g.closePath();
  }
  const dentroDeLuz = (ax, ay, ang, abre) => {
    let d = Math.atan2(ay, ax) - ang;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    return Math.abs(d) < abre;
  };

  // ---- un cuadro ----
  function dibujar(t) {
    const Q = !!guion.quieto;
    const tt = Q ? 99999 : t; // quieto: todo a la vista
    g.clearRect(0, 0, canvas.width, canvas.height);
    const duraDestello = guion.fin - guion.destello;
    const pd = Q ? -1 : (t - guion.destello) / duraDestello;
    if (pd >= 0.3) { destello(pd); return; }

    const cam = Q ? PAN : Math.min(PAN, Math.floor((t / guion.destello) * (PAN + 1)));
    const oy = -cam * u;
    const tx = (torre.x + 0.5) * u, ty = (torre.y - cam + 0.5) * u;
    g.imageSmoothingEnabled = false;
    g.drawImage(oscura, 0, oy);

    // la noche se aclara un poco cuando la torre se enciende
    const enc = entre(tt, guion.encender, guion.encender + 700);
    g.fillStyle = `rgba(2,4,10,${(0.62 - 0.38 * enc).toFixed(3)})`;
    g.fillRect(0, 0, canvas.width, canvas.height);

    // los autos
    for (const a of autos) {
      const p = Math.round(((a.p + a.dir * a.vel * (Q ? 0 : t)) % a.largo + a.largo) % a.largo);
      const x = a.v ? a.fijo : p, y = (a.v ? p : a.fijo) - cam;
      const fx = a.v ? 0 : a.dir, fy = a.v ? a.dir : 0;
      g.fillStyle = '#f8fafc'; g.fillRect((x + fx) * u, (y + fy) * u, u, u);
      g.fillStyle = '#ef4444'; g.fillRect(x * u, y * u, u, u);
    }
    // luces rojas en los techos altos
    for (const b of balizas) if (Q || (t + b.fase) % 1400 < 700) { g.fillStyle = '#f87171'; g.fillRect(b.x * u, (b.y - cam) * u, u, u); }

    // la luz que barre: revela la ciudad de verdad debajo del haz
    const bi = Q ? 1 : entre(t, guion.barrido, guion.barrido + 450);
    const ang = anguloLuz(t);
    const abre = Q ? ABRE : ABRE + 0.9 * entre(t, guion.destello - 320, guion.destello);
    const largo = Math.hypot(canvas.width, canvas.height) * 1.2;
    if (bi > 0) {
      g.save();
      conoLuz(tx, ty, ang, abre, largo);
      g.clip();
      g.globalAlpha = bi;
      g.drawImage(clara, 0, oy);
      g.restore();
      g.save();
      g.globalCompositeOperation = 'lighter';
      const grad = g.createRadialGradient(tx, ty, 0, tx, ty, largo * 0.75);
      grad.addColorStop(0, `rgba(103,232,249,${(0.34 * bi).toFixed(3)})`);
      grad.addColorStop(0.35, `rgba(34,211,238,${(0.14 * bi).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(34,211,238,0)');
      g.fillStyle = grad;
      conoLuz(tx, ty, ang, abre, largo);
      g.fill();
      conoLuz(tx, ty, ang, abre * 0.28, largo);
      g.fill();
      g.restore();
    }

    // el Enjambre, en los bordes: puntos rojos que se acercan; bajo la luz se ven claros
    const rx = W * 0.56, ry = H * 0.5;
    for (let i = 0; i < enjambre.length; i++) {
      const e = enjambre[i];
      if (tt < e.sale) continue;
      const d = Math.max(e.dq, e.d0 - (tt - e.sale) * 0.0005);
      const an = e.ang + e.gira * (Q ? 0 : t);
      const salto = Q ? 0 : ((Math.imul(i + 1, 2654435761) ^ Math.floor(t / 220)) >>> 0) % 3 - 1;
      const x = Math.round(torre.x + Math.cos(an) * d * rx) + salto;
      const y = Math.round(torre.y + Math.sin(an) * d * ry) - cam;
      const cola = [Math.round(Math.cos(an)), Math.round(Math.sin(an))];
      const lit = bi > 0 && dentroDeLuz((x - torre.x) * u, (y + cam - torre.y) * u, ang, abre);
      const late = Q || ((t + i * 97) % 600) < 360;
      // cada robot es una cruz de pixel: el centro encendido y los brazos oscuros, con su estela hacia afuera
      g.fillStyle = '#7f1d1d';
      g.fillRect((x + cola[0]) * u, (y + cola[1]) * u, u, u);
      g.fillRect((x - 1) * u, y * u, u, u); g.fillRect((x + 1) * u, y * u, u, u);
      g.fillRect(x * u, (y - 1) * u, u, u); g.fillRect(x * u, (y + 1) * u, u, u);
      g.fillStyle = lit ? '#fee2e2' : late ? '#f87171' : '#dc2626';
      g.fillRect(x * u, y * u, u, u);
    }
    // el Enjambre tiñe de rojo los bordes de la ciudad mientras se acerca
    const asedio = Q ? 1 : entre(t, guion.enjambre, guion.enjambre + 2200);
    if (asedio > 0) {
      const rojo = g.createRadialGradient(tx, ty, canvas.width * 0.45, tx, ty, Math.hypot(canvas.width, canvas.height) * 0.62);
      rojo.addColorStop(0, 'rgba(220,38,38,0)');
      rojo.addColorStop(1, `rgba(220,38,38,${(0.26 * asedio).toFixed(3)})`);
      g.fillStyle = rojo;
      g.fillRect(0, 0, canvas.width, canvas.height);
    }

    // la torre: el halo de la baliza (código) y el techo en pixel, que parpadea al encenderse como un tubo
    const prendida = Q || (t >= guion.encender && (t < guion.encender + 70 || t >= guion.encender + 150));
    if (prendida) {
      const halo = g.createRadialGradient(tx, ty, 0, tx, ty, 26 * u);
      const pulso = Q ? 1 : 0.9 + 0.1 * Math.sin(t / 260);
      halo.addColorStop(0, `rgba(165,243,252,${(0.42 * pulso).toFixed(3)})`);
      halo.addColorStop(1, 'rgba(34,211,238,0)');
      g.fillStyle = halo;
      g.fillRect(tx - 26 * u, ty - 26 * u, 52 * u, 52 * u);
    }
    const esc = 2 * u;
    const img = sprite(prendida ? 'torreOn' : 'torreOff', TORRE_AIRE, prendida ? PALETA_TORRE_AIRE_ENCENDIDA : PALETA_TORRE_AIRE, esc);
    g.drawImage(img, Math.round(tx - 7 * esc), Math.round(ty - 7 * esc));

    // el encendido: un anillo que se abre y chispas de pixel que salen volando
    if (!Q && t >= guion.encender && t < guion.encender + 1000) {
      const p = (t - guion.encender) / 700;
      if (p < 1) {
        g.strokeStyle = `rgba(165,243,252,${(1 - p).toFixed(3)})`;
        g.lineWidth = Math.max(2, u);
        g.beginPath();
        g.arc(tx, ty, (6 + p * 46) * u, 0, Math.PI * 2);
        g.stroke();
      }
      for (const c of chispas) {
        const vive = t - guion.encender;
        if (vive > c.vida) continue;
        const d = 7 + c.vel * vive;
        g.globalAlpha = 1 - vive / c.vida;
        g.fillStyle = c.c;
        g.fillRect(Math.round(torre.x + Math.cos(c.ang) * d) * u, Math.round(torre.y - cam + Math.sin(c.ang) * d) * u, u, u);
      }
      g.globalAlpha = 1;
    }

    // viñeta y la franja oscura de abajo, donde va el texto
    const vi = g.createRadialGradient(canvas.width / 2, ty, canvas.width * 0.35, canvas.width / 2, ty, Math.hypot(canvas.width, canvas.height) * 0.75);
    vi.addColorStop(0, 'rgba(3,6,14,0)');
    vi.addColorStop(1, 'rgba(3,6,14,0.7)');
    g.fillStyle = vi;
    g.fillRect(0, 0, canvas.width, canvas.height);
    const abajo = g.createLinearGradient(0, canvas.height * 0.48, 0, canvas.height);
    abajo.addColorStop(0, 'rgba(3,6,14,0)');
    abajo.addColorStop(0.3, 'rgba(3,6,14,0.78)');
    abajo.addColorStop(1, 'rgba(3,6,14,0.94)');
    g.fillStyle = abajo;
    g.fillRect(0, canvas.height * 0.48, canvas.width, canvas.height * 0.52);

    // la hora, arriba, en letra pixel
    if (hora) {
      g.globalAlpha = Q ? 1 : entre(t, guion.encender + 150, guion.encender + 650);
      g.font = `400 ${Math.round(15 * dpr)}px 'Silkscreen', ui-monospace, monospace`;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillStyle = '#67e8f9';
      g.fillText(hora, canvas.width / 2, Math.round(26 * dpr));
      g.globalAlpha = 1;
    }

    const yTexto = chispa(tt, t, Q);
    escribir(tt, yTexto);
    if (!Q && pd >= 0) destello(pd);
  }

  // Chispa: dormido y a media luz; al despertar le parpadean los ojos, se prende la antena, da un saltito y saluda
  function chispa(tt, t, Q) {
    const sc = Math.max(3, Math.round(4.2 * dpr));
    const x = Math.round(canvas.width / 2 - 7 * sc);
    let y = Math.round(canvas.height * 0.58);
    const dt = tt - guion.chispa;
    const despierto = Q || (dt >= 0 && !(dt > 110 && dt < 220));
    let cuadro = CHISPA.quieto;
    if (!Q && dt > 520 && dt < 980) cuadro = CHISPA.saludo;
    else if (despierto && !Q && dt > 1200 && (dt % 2600) < 140) cuadro = CHISPA.parpadeo;
    if (!Q && dt > 260 && dt < 460) y -= sc;
    if (despierto) {
      const brillo = Q ? 1 : entre(dt, 0, 400);
      const halo = g.createRadialGradient(x + 7 * sc, y + 5 * sc, 0, x + 7 * sc, y + 5 * sc, 16 * sc);
      halo.addColorStop(0, `rgba(224,247,255,${(0.2 * brillo).toFixed(3)})`);
      halo.addColorStop(1, 'rgba(224,247,255,0)');
      g.fillStyle = halo;
      g.fillRect(x - 10 * sc, y - 10 * sc, 34 * sc, 34 * sc);
    }
    g.globalAlpha = despierto ? 1 : 0.6;
    const k = `chispa-${cuadro === CHISPA.saludo ? 's' : cuadro === CHISPA.parpadeo ? 'p' : 'q'}-${despierto ? 1 : 0}`;
    g.drawImage(sprite(k, cuadro, despierto ? PALETA_CHISPA : PALETA_CHISPA_DORMIDO, sc), x, y);
    g.globalAlpha = 1;
    const yNombre = y + 16 * sc + Math.round(12 * dpr) + (!Q && dt > 260 && dt < 460 ? sc : 0);
    if (nombre && despierto) {
      g.globalAlpha = Q ? 1 : entre(dt, 150, 500);
      g.font = `400 ${Math.round(11 * dpr)}px 'Silkscreen', ui-monospace, monospace`;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillStyle = '#22d3ee';
      g.fillText(nombre.toUpperCase(), canvas.width / 2, yNombre);
      g.globalAlpha = 1;
    }
    return yNombre + Math.round(28 * dpr);
  }

  // el texto letra por letra, nítido y a resolución completa; un cursor de pixel marca por dónde va
  function escribir(tt, y0) {
    const vis = letrasVisibles(tt, lineas, guion);
    g.font = `600 ${texto.fs}px 'Space Grotesk', system-ui, sans-serif`;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    let cursor = null;
    texto.filas.forEach((f, i) => {
      const n = Math.max(0, Math.min(f.texto.length, vis[f.linea] - f.desde));
      const completa = g.measureText(f.texto).width;
      const x = Math.round((canvas.width - completa) / 2);
      const y = y0 + i * texto.alto;
      if (n > 0) {
        const parte = f.texto.slice(0, n);
        g.fillStyle = f.linea === 0 ? '#f1f5f9' : '#67e8f9';
        g.fillText(parte, x, y);
        if (vis[f.linea] < lineas[f.linea].length && n < f.texto.length + 1) cursor = [x + g.measureText(parte).width + 3 * dpr, y];
      }
    });
    if (cursor && !guion.quieto && Math.floor(tt / 260) % 2 === 0) {
      g.fillStyle = '#67e8f9';
      g.fillRect(Math.round(cursor[0]), Math.round(cursor[1] + texto.fs * 0.12), Math.max(2, Math.round(texto.fs * 0.42)), Math.round(texto.fs * 0.95));
    }
  }

  // el destello: la luz llega a la cámara, llena la pantalla y se abre sobre la partida, que ya corre debajo
  function destello(p) {
    if (p < 0.3) {
      // primero la luz suma (brilla, no empaña) y crece desde la torre; al final cubre todo
      const q = suave(p / 0.3);
      const tx = (torre.x + 0.5) * u, ty = (torre.y - PAN + 0.5) * u;
      const radio = Math.hypot(canvas.width, canvas.height) * (0.25 + 1.1 * q);
      g.save();
      g.globalCompositeOperation = 'lighter';
      const luz = g.createRadialGradient(tx, ty, 0, tx, ty, radio);
      luz.addColorStop(0, `rgba(240,253,255,${Math.min(1, 0.4 + q).toFixed(3)})`);
      luz.addColorStop(0.5, `rgba(103,232,249,${(0.8 * q).toFixed(3)})`);
      luz.addColorStop(1, 'rgba(34,211,238,0)');
      g.fillStyle = luz;
      g.fillRect(0, 0, canvas.width, canvas.height);
      g.restore();
      g.fillStyle = `rgba(224,251,255,${(q * q * q).toFixed(3)})`;
      g.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const a = 1 - suave((p - 0.3) / 0.7);
    g.fillStyle = `rgba(165,243,252,${(a * a).toFixed(3)})`;
    g.fillRect(0, 0, canvas.width, canvas.height);
  }

  redimensionar();
  // si la letra llega después, se vuelve a medir el texto
  try { document.fonts && document.fonts.ready.then(() => armarTexto()); } catch { }
  return { dibujar, redimensionar };
}
