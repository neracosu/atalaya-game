// El dibujo de la apertura: «La torre vacía» y «Bajar del cielo» (GDD, parte 6).
// 1. La ciudad de noche vista desde el aire, como en el monitor: la baliza se enciende, la luz barre, el Enjambre
//    asoma en rojo por los bordes, Chispa despierta y el texto entra letra por letra.
// 2. La cámara baja del cielo: el plano de la ciudad se inclina (una tira por cada fila de píxeles, como los juegos
//    de 16 bits), la torre se levanta y el horizonte entra desde arriba. Una niebla con la luz del haz cruza la cámara.
// 3. De frente: la ciudad de costado en capas que se mueven a distinta velocidad, la torre de la partida con su haz,
//    y la cámara que baja hasta la barrera. El último cuadro es el primero de la partida: se pinta con las mismas
//    funciones de escena.js.
// Capa pixel: manzanas, techos, farolas, la torre, Chispa y los edificios, a escala entera y en píxeles enteros.
// Capa de código: la oscuridad, la luz, la niebla, el texto. Solo dibuja: el tiempo lo lleva apertura.js.
// Todo a la densidad de la pantalla (hasta 3), con el texto nítido. Para que un teléfono modesto llegue, lo que no
// cambia en cada cuadro se pinta una vez en un lienzo aparte y se copia: la ciudad de noche, la luz bajo el haz, el
// rojo del Enjambre, el velo del texto, los halos, la luz de la niebla y cada degradé vertical (una columna de un
// píxel que se estira). Rellenar un degradé a pantalla completa cuesta cinco veces lo que copiar un lienzo.

import { CHISPA, PALETA_CHISPA, PALETA_CHISPA_DORMIDO, TORRE_AIRE, PALETA_TORRE_AIRE, PALETA_TORRE_AIRE_ENCENDIDA,
  TORRE, PALETA_TORRE_ENCENDIDA, BARRERA_POSTE, PALETA_BARRERA, aCanvas } from './sprites.js';
import { disposicion, decoradoCiudad, pintarCielo, pintarCiudad, pintarTorre, pintarCalzada, pintarBarrera, columna,
  pintarColumna, CIELO } from './escena.js';
import { GUION, letrasVisibles, inclinacion, niebla, altura } from '../apertura.js';

const PAN = 8;            // lo que avanza la cámara desde el aire, en píxeles del dibujo, de a uno por vez
const PLAZA = 10;         // media plaza de la torre
const VUELTA = 3600;      // ms por vuelta de la luz
const ABRE = 0.2;         // media apertura del haz, en radianes
const INCLINA_FIN = 0.52; // la inclinación final del plano (unos 30 grados sobre el horizonte)
const NOCHE = 0.55, NOCHE_FIN = 0.14; // el velo de la noche, antes y después de encenderse la torre
// los degradés verticales de la bajada, relativos a su propio alto (ver columna en escena.js)
const BRUMA = [[0, 'rgba(26,42,72,0)'], [0.3, 'rgba(38,58,96,0.85)'], [0.55, 'rgba(24,38,66,0.6)'], [1, 'rgba(12,20,38,0)']];
const ROJO_HORIZONTE = [[0, 'rgba(220,38,38,0)'], [0.6, 'rgba(220,38,38,0.22)'], [1, 'rgba(220,38,38,0)']];
const HONDURA = [[0, 'rgba(3,6,14,0)'], [1, 'rgba(3,6,14,0.55)']];
const BRUMA_LEJOS = [[0, 'rgba(12,26,51,0)'], [1, 'rgba(12,26,51,0.55)']];

const suave = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const entre = (t, a, b) => suave((t - a) / (b - a));
const mezcla = (a, b, k) => a + (b - a) * k;
function azarDe(semilla) {
  let s = semilla >>> 0;
  return () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296);
}

// los techos y las calles, de noche y bajo la luz de la torre. De noche ya se leen las calles: las farolas dejan
// charcos de luz cálida y las ventanas se prenden por manzana.
const OSCURO = { calle: '#0a1222', raya: '#1c2740', farola: '#e0a84a', charco: '#1d1c1f', borde: '#1f2c47', sombra: '#060a14',
  luz: '#b98f3c', aire: '#223049', techos: ['#111a2d', '#131e34', '#16223b', '#0f1729'], plaza: '#162037', parque: '#0b1a16',
  arbol: '#12301f', vereda: '#121b2e' };
const CLARO = { calle: '#15243f', raya: '#4b5f7d', farola: '#fff3c4', charco: '#3d3a2a', borde: '#4a6c99', sombra: '#0c1629',
  luz: '#fde68a', aire: '#7188a8', techos: ['#1d3150', '#223a5c', '#1a2c49', '#27446b'], plaza: '#2a3d5e', parque: '#173d33',
  arbol: '#2f6b4f', vereda: '#2a3c5c' };

// Un lienzo que se pinta de a píxel en memoria. El mapa de la ciudad y las nubes son decenas de miles de rectángulos
// de un píxel y se arman al tocar «Empezar»: con fillRect, en un teléfono modesto, era casi medio segundo de pantalla
// congelada. Escritos directo en un ImageData, el resultado es el mismo y tarda una fracción.
function pixeles(w, h) {
  const img = new ImageData(w, h), p = new Uint32Array(img.data.buffer);
  const colores = new Map();
  const color = hex => {
    let c = colores.get(hex);
    if (c === undefined) {
      const n = parseInt(hex.slice(1), 16);
      // los bytes en el orden de ImageData (rojo, verde, azul, alfa), leídos como un número del mismo orden de memoria
      c = new Uint32Array(new Uint8Array([n >> 16, (n >> 8) & 255, n & 255, 255]).buffer)[0];
      colores.set(hex, c);
    }
    return c;
  };
  return {
    rect(x, y, rw, rh, hex) {
      const x0 = Math.max(0, x), x1 = Math.min(w, x + rw), c = color(hex);
      if (x1 <= x0) return;
      for (let f = Math.max(0, y), f1 = Math.min(h, y + rh); f < f1; f++) p.fill(c, f * w + x0, f * w + x1);
    },
    lienzo() {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').putImageData(img, 0, 0);
      return c;
    },
  };
}

export function crearDibujoApertura(canvas, { lineas = [], nombre = '', hora = '', guion = GUION } = {}) {
  let g = canvas.getContext('2d'); // let: con menos movimiento, la vista quieta se pinta una vez en otro lienzo
  if (!g) throw new Error('sin lienzo');
  const Q = !!guion.quieto;
  let dpr = 1, u = 3, W = 100, H = 200, cw = 390, ch = 844;
  // el mapa de la ciudad a un píxel por píxel del dibujo (se agranda al pintar, sin suavizar); más grande que la
  // pantalla para que, al inclinarse, la ciudad llegue hasta el horizonte
  let mapa = { oscura: null, clara: null, base: null, MW: 0, MH: 0, x0: 0, y0: 0 };
  let torre = { x: 50, y: 60 };
  let autos = [], enjambre = [], balizas = [], chispas = [], estrellasAire = [];
  let texto = { fs: 20, alto: 26, filas: [] };
  // la vista de frente
  let L = null, deco = null, lejanos = [], extras = [], nubes = [];
  let capa = null; // para el fundido de menos movimiento
  // las capas pintadas una vez (ver capaDe); se sueltan al pasar de fase, para no guardar la memoria de todas juntas
  let capas = {};
  const cache = new Map();
  const sprite = (k, filas, paleta, esc) => {
    const c = `${k}:${esc}`;
    if (!cache.has(c)) cache.set(c, aCanvas(filas, paleta, esc));
    return cache.get(c);
  };

  function lienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // ---- las capas que no cambian en cada cuadro: se pintan la primera vez que hacen falta y después se copian ----
  function capaDe(clave, w, h, pintar) {
    if (!capas[clave]) {
      const c = lienzo(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h))), cg = c.getContext('2d');
      cg.imageSmoothingEnabled = false;
      pintar(cg, c);
      capas[clave] = c;
    }
    return capas[clave];
  }
  // (por prefijo: 'juntos' suelta todas las capas juntos1, juntos2...)
  const soltar = (...claves) => { for (const k of Object.keys(capas)) if (claves.some(c => k.startsWith(c))) capas[k] = null; };
  // Con el rojo ya a toda fuerza, el rojo y el velo del texto van juntos en una sola capa: una copia a pantalla
  // completa menos en cada cuadro. El rojo va pegado al mapa, así que se rehace en cada paso de la cámara (cinco
  // veces). La torre queda debajo de las dos, como antes: ninguna la toca (el rojo empieza lejos de ella y el velo
  // deja limpio el centro).
  function capaJuntos(cam) {
    const k = 'juntos' + cam;
    if (!capas[k]) soltar('juntos');
    return capaDe(k, canvas.width, canvas.height, c => {
      c.drawImage(capaAsedio(), 0, -cam * u);
      c.drawImage(capaVelo(), 0, 0);
    });
  }
  let veloPintado = false; // si en este cuadro el velo ya fue con el rojo

  // un halo redondo (un degradé radial que se apaga en el borde) en su propio lienzo, del tamaño del rectángulo que se
  // pintaba; (cx, cy) es el centro del degradé dentro del rectángulo
  function haloDe(clave, w, h, cx, cy, radio, paradas) {
    return capaDe(clave, w, h, c => {
      const grad = c.createRadialGradient(cx, cy, 0, cx, cy, radio);
      for (const [pos, color] of paradas) grad.addColorStop(pos, color);
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);
    });
  }
  // un halo en un lugar que no cae en un píxel entero: se copia en el píxel más cercano (medio píxel corrido, en un
  // degradé que se apaga, no se ve; copiar con suavizado costaba el doble)
  function pintarHalo(img, x, y) { g.drawImage(img, Math.round(x), Math.round(y)); }

  // Desde el aire, la cámara solo avanza de a un píxel del dibujo (PAN pasos): lo que está pegado al mapa se pinta una
  // vez con todas las filas que puede llegar a mostrar y se copia corrido. Coordenadas de esas capas: la fila 0 es la
  // fila y0 del mapa, a escala u.
  const altoAire = () => (H + PAN) * u;
  const torreEnCapa = () => [(torre.x - mapa.x0 + 0.5) * u, (torre.y - mapa.y0 + 0.5) * u];
  // la ciudad de noche, agrandada, con la noche ya aclarada (la torre encendida)
  const capaNoche = () => capaDe('noche', W * u, altoAire(), c => {
    c.drawImage(mapa.oscura, mapa.x0, mapa.y0, W, H + PAN, 0, 0, W * u, altoAire());
    c.fillStyle = `rgba(2,4,10,${NOCHE_FIN})`;
    c.fillRect(0, 0, W * u, altoAire());
  });
  // lo que se ve dentro del haz: la ciudad bajo la luz y la luz misma, sumada
  const capaLuzAire = () => capaDe('luzAire', W * u, altoAire(), c => {
    c.drawImage(mapa.clara, mapa.x0, mapa.y0, W, H + PAN, 0, 0, W * u, altoAire());
    const [x, y] = torreEnCapa();
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = gradHaz(c, x, y, largoLuz(), 1);
    c.fillRect(0, 0, W * u, altoAire());
  });
  // el rojo del Enjambre en los bordes, a toda fuerza (se copia con globalAlpha mientras llega)
  const capaAsedio = () => capaDe('asedio', W * u, altoAire(), c => {
    const [x, y] = torreEnCapa();
    const rojo = c.createRadialGradient(x, y, canvas.width * 0.45, x, y, Math.hypot(canvas.width, canvas.height) * 0.62);
    rojo.addColorStop(0, 'rgba(220,38,38,0)');
    rojo.addColorStop(1, 'rgba(220,38,38,0.26)');
    c.fillStyle = rojo;
    c.fillRect(0, 0, W * u, altoAire());
  });
  // el velo que deja leer el texto: la viñeta y la sombra de abajo
  const capaVelo = () => capaDe('velo', canvas.width, canvas.height, c => {
    const cwp = canvas.width, chp = canvas.height;
    const vi = c.createRadialGradient(cwp / 2, chp * 0.3, cwp * 0.35, cwp / 2, chp * 0.3, Math.hypot(cwp, chp) * 0.75);
    vi.addColorStop(0, 'rgba(3,6,14,0)');
    vi.addColorStop(1, 'rgba(3,6,14,0.6)');
    c.fillStyle = vi;
    c.fillRect(0, 0, cwp, chp);
    const abajo = c.createLinearGradient(0, chp * 0.48, 0, chp);
    abajo.addColorStop(0, 'rgba(3,6,14,0)');
    abajo.addColorStop(0.3, 'rgba(3,6,14,0.72)');
    abajo.addColorStop(1, 'rgba(3,6,14,0.92)');
    c.fillStyle = abajo;
    c.fillRect(0, chp * 0.48, cwp, chp * 0.52);
  });

  // ---- la ciudad desde el aire: un mapa pintado una vez en dos versiones, de noche y bajo la luz ----
  function armarCiudad() {
    const r = azarDe(20261001);
    const MX = Math.max(70, W), MN = H * 2, MS = 40;
    const MW = W + 2 * MX, MH = H + PAN + MN + MS;
    const x0 = MX, y0 = MN;
    torre = { x: x0 + (W >> 1), y: y0 + Math.round(H * 0.3) + PAN };
    const px = [[pixeles(MW, MH), OSCURO], [pixeles(MW, MH), CLARO]];
    const rect = (x, y, w, h, clave, idx) => {
      for (const [c, p] of px) c.rect(x, y, w, h, idx === undefined ? p[clave] : p[clave][idx]);
    };
    rect(0, 0, MW, MH, 'calle');

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
    const cx = cortes(torre.x, MW), cy = cortes(torre.y, MH);
    const callesV = cx.map(([x, a]) => ({ x: x + (a >> 1), a })), callesH = cy.map(([y, a]) => ({ y: y + (a >> 1), a }));
    const cercaDeLaTorre = (x, y) => Math.abs(x - torre.x) <= PLAZA + 1 && Math.abs(y - torre.y) <= PLAZA + 1;

    // las manzanas: veredas, edificios y, de vez en cuando, un parque
    for (let i = 0; i < cx.length - 1; i++) for (let j = 0; j < cy.length - 1; j++) {
      const x0m = cx[i][0] + cx[i][1], x1 = cx[i + 1][0], y0m = cy[j][0] + cy[j][1], y1 = cy[j + 1][0];
      if (x1 - x0m < 3 || y1 - y0m < 3) continue;
      rect(x0m, y0m, x1 - x0m, y1 - y0m, 'vereda');
      const bx0 = x0m + 1, by0 = y0m + 1, bx1 = x1 - 1, by1 = y1 - 1;
      if (r() < 0.1 && bx1 - bx0 >= 6 && by1 - by0 >= 6) { parque(bx0, by0, bx1 - bx0, by1 - by0, r, rect); continue; }
      const partes = [];
      const horiz = bx1 - bx0 >= by1 - by0;
      const n = 1 + ((r() * 3) | 0);
      let desde = horiz ? bx0 : by0;
      const hasta = horiz ? bx1 : by1;
      for (let k = 0; k < n; k++) {
        const fin = k === n - 1 ? hasta : Math.min(hasta, desde + Math.max(4, Math.round(((hasta - desde) / (n - k)) * (0.7 + r() * 0.6))));
        if (fin - desde >= 3) partes.push(horiz ? [desde, by0, fin - desde, by1 - by0] : [bx0, desde, bx1 - bx0, fin - desde]);
        desde = fin + 1;
        if (desde >= hasta - 2) break;
      }
      for (const [bx, by, bw, bh] of partes) edificio(bx, by, bw, bh, r, rect);
    }

    // farolas al borde de cada calle, con su charco de luz, y rayas en las avenidas
    const farola = (x, y) => {
      if (cercaDeLaTorre(x, y)) return;
      rect(x - 1, y, 3, 1, 'charco'); rect(x, y - 1, 1, 3, 'charco');
      rect(x, y, 1, 1, 'farola');
    };
    for (const { x, a } of callesV) for (let y = 2; y < MH; y += 6) farola(x - (a >> 1) + (((y / 6) | 0) % 2 ? a - 1 : 0), y);
    for (const { y, a } of callesH) for (let x = 4; x < MW; x += 6) farola(x, y - (a >> 1) + (((x / 6) | 0) % 2 ? a - 1 : 0));
    for (let y = 0; y < MH; y += 4) rect(torre.x, y, 1, 2, 'raya');
    for (let x = 0; x < MW; x += 4) rect(x, torre.y, 2, 1, 'raya');

    // la plaza de la torre: cuadrada, con sus caminos y una farola en cada esquina (antes era un anillo)
    rect(torre.x - PLAZA, torre.y - PLAZA, PLAZA * 2 + 1, PLAZA * 2 + 1, 'borde');
    rect(torre.x - PLAZA + 1, torre.y - PLAZA + 1, PLAZA * 2 - 1, PLAZA * 2 - 1, 'plaza');
    rect(torre.x, torre.y - PLAZA, 1, PLAZA * 2 + 1, 'raya');
    rect(torre.x - PLAZA, torre.y, PLAZA * 2 + 1, 1, 'raya');
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const fx = torre.x + dx * (PLAZA - 2), fy = torre.y + dy * (PLAZA - 2);
      rect(fx - 1, fy, 3, 1, 'charco'); rect(fx, fy - 1, 1, 3, 'charco'); rect(fx, fy, 1, 1, 'farola');
    }
    const oscura = px[0][0].lienzo(), clara = px[1][0].lienzo();
    // la base para inclinar: la ciudad de noche con la luz de la torre ya prendida
    const base = lienzo(MW, MH), gb = base.getContext('2d');
    gb.drawImage(oscura, 0, 0);
    gb.globalAlpha = 0.18;
    gb.drawImage(clara, 0, 0);
    gb.globalAlpha = 1;
    mapa = { oscura, clara, base, MW, MH, x0, y0 };

    // los autos de la noche: dos puntos de luz, blanco adelante y rojo atrás
    autos = Array.from({ length: 40 }, () => {
      const v = r() < 0.5, calle = v ? callesV[(r() * callesV.length) | 0] : callesH[(r() * callesH.length) | 0];
      const dir = r() < 0.5 ? 1 : -1;
      return { v, fijo: (v ? calle.x : calle.y) + (dir > 0 ? 1 : -1) * (calle.a > 3 ? 1 : 0), dir, p: r() * (v ? MH : MW), vel: 0.004 + r() * 0.006, largo: v ? MH : MW };
    });

    // el Enjambre: llega desde afuera y se queda rondando los bordes de la ciudad
    enjambre = Array.from({ length: 96 }, (_, i) => ({ ang: r() * Math.PI * 2, d0: 1.15 + r() * 0.3, dq: 0.82 + r() * 0.2, sale: guion.enjambre + i * 24, gira: (r() - 0.5) * 0.00012 }));
    chispas = Array.from({ length: 28 }, () => ({ ang: r() * Math.PI * 2, vel: 0.02 + r() * 0.035, vida: 500 + r() * 450, c: r() < 0.5 ? '#f0fdff' : '#67e8f9' }));
    estrellasAire = Array.from({ length: 70 }, () => ({ x: r(), y: r(), f: r() * 6.28, b: 0.35 + r() * 0.5 }));
  }

  function edificio(bx, by, bw, bh, r, rect) {
    const tono = (r() * 4) | 0;
    rect(bx, by, bw, bh, 'techos', tono);
    rect(bx, by, bw, 1, 'borde');
    rect(bx, by, 1, bh, 'borde');
    rect(bx, by + bh - 1, bw, 1, 'sombra');
    rect(bx + bw - 1, by, 1, bh, 'sombra');
    if (bw >= 5 && bh >= 5) {
      // ventanas y claraboyas encendidas: unas manzanas más despiertas que otras
      const vivas = r() < 0.35 ? 12 : 20;
      for (let k = Math.floor((bw * bh) / vivas); k > 0; k--) rect(bx + 1 + ((r() * (bw - 2)) | 0), by + 1 + ((r() * (bh - 2)) | 0), 1, 1, 'luz');
      if (r() < 0.6) rect(bx + 1 + ((r() * (bw - 3)) | 0), by + 1 + ((r() * (bh - 2)) | 0), 2, 1, 'aire');
    }
    if (bw * bh > 110 && r() < 0.5) balizas.push({ x: bx + 1 + ((r() * (bw - 2)) | 0), y: by + 1 + ((r() * (bh - 2)) | 0), fase: r() * 1400 });
  }

  function parque(x, y, w, h, r, rect) {
    rect(x, y, w, h, 'parque');
    rect(x + (w >> 1), y, 1, h, 'raya');
    for (let k = Math.floor((w * h) / 7); k > 0; k--) rect(x + ((r() * w) | 0), y + ((r() * h) | 0), 1, 1, 'arbol');
  }

  // ---- la vista de frente: la misma disposición de la partida, con más ciudad a los lados y capas lejanas ----
  function armarFrente() {
    L = disposicion(canvas.width, canvas.height);
    deco = decoradoCiudad(L.W, L.calle);
    const r = azarDe(20261002);
    const edificioFrente = x => {
      const ancho = 8 + ((r() * 10) | 0), alto = 14 + ((r() * 36) | 0);
      const ventanas = [];
      for (let vy = 3; vy < alto - 3; vy += 4) for (let vx = 2; vx < ancho - 2; vx += 3) if (r() < 0.45) ventanas.push([vx, vy, r() * 20]);
      return { x, ancho, alto, ventanas, tono: r() };
    };
    // más ciudad a los lados de la de la partida, para cuando la cámara llega corrida
    extras = [];
    for (let x = -3; x > -160;) { const e = edificioFrente(0); x -= e.ancho + 1 + ((r() * 3) | 0); e.x = x; extras.push(e); }
    const ultimo = deco.edificios[deco.edificios.length - 1];
    for (let x = ultimo.x + ultimo.ancho + 2; x < L.W + 160;) { const e = edificioFrente(x); extras.push(e); x += e.ancho + 1 + ((r() * 3) | 0); }
    // la ciudad lejana: más alta, más azul y con pocas luces
    lejanos = [];
    for (let x = -140; x < L.W + 140;) {
      const ancho = 10 + ((r() * 14) | 0), alto = 26 + ((r() * 48) | 0);
      const luces = [];
      for (let vy = 4; vy < alto - 2; vy += 5) for (let vx = 2; vx < ancho - 2; vx += 4) if (r() < 0.3) luces.push([vx, vy]);
      lejanos.push({ x, ancho, alto, luces, antena: r() < 0.3, fase: r() * 1400 });
      x += ancho + ((r() * 4) | 0) - 1;
    }
    // la niebla: bancos de nube en pixel, dos tonos
    nubes = Array.from({ length: 7 }, (_, i) => {
      const img = nubeDe(r, L.W + 60, 26 + ((r() * 16) | 0));
      return { img, alto: img.height * u, x: -40 + ((r() * 20) | 0), orden: i, vel: 0.8 + r() * 0.7 };
    });
  }

  // una nube en pixel: bultos redondos rasterizados en la cuadrícula, con el borde de arriba más claro. Se guarda a un
  // píxel por píxel del dibujo y se agranda al copiarla (sin suavizar): los mismos píxeles, con mucha menos memoria
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function nubeDe(r, ancho, alto) {
    const n = pixeles(ancho, alto);
    // abajo se deshace en una trama de pixel, sin borde recto
    const bultos = Array.from({ length: Math.ceil(ancho / 9) }, (_, i) => ({ x: i * 9 + r() * 6, y: alto * (0.45 + r() * 0.25), rad: alto * (0.28 + r() * 0.22) }));
    const dentro = (x, y) => y > alto * 0.6 || bultos.some(b => (x - b.x) ** 2 + (y - b.y) ** 2 <= b.rad * b.rad);
    for (let y = 0; y < alto; y++) for (let x = 0; x < ancho; x++) {
      if (!dentro(x, y)) continue;
      const deshace = (y - alto * 0.55) / (alto * 0.45);
      if (deshace > 0 && BAYER[(y & 3) * 4 + (x & 3)] / 16 < deshace) continue;
      // el borde de arriba, solo donde termina la nube (no entre un bulto y otro)
      const borde = !dentro(x, y - 1) || !dentro(x, y - 2);
      n.rect(x, y, 1, 1, borde ? '#3a5277' : ((x * 3 + y * 5) % 11 === 0 ? '#22375a' : '#1c2e4d'));
    }
    return n.lienzo();
  }
  function pintarNube(n, x, y) { g.drawImage(n.img, 0, 0, n.img.width, n.img.height, x, y, n.img.width * u, n.alto); }

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
    capa = null;
    capas = {};
    armarCiudad();
    armarFrente();
    armarTexto();
  }

  // ---- la luz de la torre: da vueltas parejas; al empezar la bajada apunta hacia la cámara ----
  function anguloLuz(t) {
    return Q ? -Math.PI * 0.28 : Math.PI / 2 + ((t - guion.bajada) / VUELTA) * Math.PI * 2;
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
  const largoLuz = () => Math.hypot(canvas.width, canvas.height) * 1.2;
  function gradHaz(c, x, y, largo, bi) {
    const grad = c.createRadialGradient(x, y, 0, x, y, largo * 0.75);
    grad.addColorStop(0, `rgba(103,232,249,${(0.34 * bi).toFixed(3)})`);
    grad.addColorStop(0.35, `rgba(34,211,238,${(0.14 * bi).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(34,211,238,0)');
    return grad;
  }
  const dentroDeLuz = (ax, ay, ang, abre) => {
    let d = Math.atan2(ay, ax) - ang;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    return Math.abs(d) < abre;
  };

  // ---- la cámara que se inclina ----
  // Mira siempre a la torre desde la misma distancia (así la torre no cambia de escala y sigue en píxeles enteros)
  // y baja mientras se inclina. Devuelve con qué ángulo mira y dónde queda la torre en la pantalla.
  const focal = () => canvas.height * 0.95;
  function camara(inc) {
    const px0a = (torre.x - mapa.x0 + 0.5) * u, py0a = (torre.y - mapa.y0 - PAN + 0.5) * u;
    const k = suave(inc);
    return {
      th: mezcla(Math.PI / 2, INCLINA_FIN, k),
      px0: mezcla(px0a, canvas.width / 2, k),
      py0: mezcla(py0a, canvas.height, k ** 1.4),
      D: focal() / u,
    };
  }
  // de un punto del mapa (en píxeles del dibujo) a la pantalla; null si queda detrás de la cámara
  function proyectar(c, X, Y) {
    const s = Math.sin(c.th), co = Math.cos(c.th);
    const prof = c.D + co * (torre.y + 0.5 - Y);
    if (prof <= 1) return null;
    const f = focal();
    return [c.px0 + (f * (X - torre.x - 0.5)) / prof, c.py0 + (f * s * (Y - torre.y - 0.5)) / prof];
  }
  // el plano de la ciudad inclinado: una tira por cada fila de píxeles del dibujo, cada una a su escala. Devuelve el
  // horizonte y las filas que quedaron sin pintar (cerca del horizonte o más allá del mapa). `rango(y)`, si está,
  // limita cada tira a lo ancho: [desde, hasta) en la pantalla, o null para saltarla. Cada trozo se copia con la
  // misma correspondencia de píxeles que la tira entera, así que lo que se pinta coincide píxel a píxel.
  function plano(c, tex, rango = null) {
    const s = Math.sin(c.th), co = Math.cos(c.th), f = focal(), h = c.D * s;
    const LX = torre.x + 0.5, LY = torre.y + 0.5;
    const yH = co > 1e-4 ? c.py0 - (f * s) / co : -Infinity;
    const filaDe = v => LY + c.D * co - (f * co - v * s) * (h / (f * s + v * co));
    const huecos = [];
    for (let y = Math.max(0, Math.floor((yH + 1) / u) * u); y < canvas.height; y += u) {
      const vA = y - c.py0, vB = y + u - c.py0;
      if (f * s + vA * co <= 0) { huecos.push(y); continue; }
      const escala = h / (f * s + (vA + u / 2) * co);
      if (escala > 6) { huecos.push(y); continue; } // muy cerca del horizonte: lo tapa la bruma
      let sy = filaDe(vA);
      const sh = Math.max(0.02, filaDe(vB) - sy);
      if (sy + sh < 0) sy = ((sy % mapa.MH) + mapa.MH) % mapa.MH; // más allá del mapa, la ciudad sigue
      if (sy > mapa.MH) { huecos.push(y); continue; }
      const r = rango && rango(y);
      if (rango && !r) continue;
      // a lo ancho, el mapa se repite: la ciudad no se corta a los lados
      const sx0 = LX - c.px0 * escala, sw = canvas.width * escala;
      for (let k = Math.floor(sx0 / mapa.MW); k * mapa.MW < sx0 + sw; k++) {
        const a = Math.max(sx0, k * mapa.MW), b = Math.min(sx0 + sw, (k + 1) * mapa.MW);
        if (b - a <= 0) continue;
        const dx = (a - sx0) / escala, dw = (b - a) / escala;
        const D0 = Math.floor(dx), DW = Math.ceil(dw + (dx - D0));
        if (!r) { g.drawImage(tex, a - k * mapa.MW, sy, b - a, sh, D0, y, DW, u); continue; }
        const X0 = Math.max(D0, r[0]), X1 = Math.min(D0 + DW, r[1]);
        if (X1 <= X0) continue;
        const paso = (b - a) / DW;
        g.drawImage(tex, a - k * mapa.MW + (X0 - D0) * paso, sy, (X1 - X0) * paso, sh, X0, y, X1 - X0, u);
      }
    }
    return { yH, huecos };
  }
  // lo que el cono de luz ocupa de cada tira de la pantalla, [desde, hasta) con un píxel de sobra a cada lado: el
  // polígono de conoLuz recortado a las filas de la tira
  function rangoCono(bx, by, ang, abre, largo) {
    const pts = [[bx, by]];
    for (let i = 0; i <= 10; i++) {
      const a = ang - abre + (2 * abre * i) / 10;
      pts.push([bx + Math.cos(a) * largo, by + Math.sin(a) * largo]);
    }
    return y => {
      const y1 = y + u;
      let x0 = Infinity, x1 = -Infinity;
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx2, by2] = pts[(i + 1) % pts.length];
        const lo = Math.max(y, Math.min(ay, by2)), hi = Math.min(y1, Math.max(ay, by2));
        if (lo > hi) continue;
        for (const yy of [lo, hi]) {
          const x = ay === by2 ? ax : ax + ((bx2 - ax) * (yy - ay)) / (by2 - ay);
          const xs = ay === by2 ? [ax, bx2] : [x];
          for (const v of xs) { if (v < x0) x0 = v; if (v > x1) x1 = v; }
        }
      }
      if (x0 > x1) return null;
      const a = Math.max(0, Math.floor(x0) - 1), b = Math.min(canvas.width, Math.ceil(x1) + 1);
      return b > a ? [a, b] : null;
    };
  }

  // ---- un cuadro. `ahora` es el reloj de la página: de frente, el haz y las ventanas van al mismo compás que en
  // la partida, para que el último cuadro sea idéntico al primero de ella ----
  function dibujar(t, ahora = t) {
    g.imageSmoothingEnabled = false;
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    if (Q) { quieto(t, ahora); return; }
    veloPintado = false;
    const inc = inclinacion(t, guion);
    if (t < guion.frente) {
      if (inc <= 0) aire(t, false); else inclinado(t, inc);
      const A = 1 - entre(t, guion.bajada, guion.bajada + 450);
      if (A > 0) interfaz(t, A);
      else soltar('noche', 'luzAire', 'asedio', 'velo', 'juntos');
    } else pintarFrente(g, ahora, altura(t, guion), false);
    if (t > guion.niebla - 400 && t < guion.nieblaFin + 700) pintarNiebla(t, niebla(t, guion));
    else if (t >= guion.nieblaFin + 700) soltar('luzNiebla');
  }

  // menos movimiento: la ciudad desde el aire quieta con todo a la vista, y un fundido a la vista de frente
  // (todo quieto: cada vista se pinta una sola vez y después se copia)
  function quieto(t, ahora) {
    g.drawImage(capaDe('quietoAire', canvas.width, canvas.height, c => {
      const antes = g;
      g = c;
      try { aire(99999, true); interfaz(99999, 1); } finally { g = antes; }
      soltar('noche', 'luzAire', 'asedio', 'velo');
    }), 0, 0);
    if (t < guion.frente) return;
    if (!capa) {
      capa = lienzo(canvas.width, canvas.height);
      pintarFrente(capa.getContext('2d'), ahora, 0, true);
    }
    g.globalAlpha = entre(t, guion.frente, guion.nieblaFin);
    g.drawImage(capa, 0, 0);
    g.globalAlpha = 1;
  }

  // ---- 1. desde el aire ----
  function aire(t, Qd) {
    const cam = Qd ? PAN : Math.min(PAN, Math.floor((t / guion.bajada) * (PAN + 1)));
    const ox = mapa.x0, oy = mapa.y0 + cam, dy = -cam * u;
    const tx = (torre.x - ox + 0.5) * u, ty = (torre.y - oy + 0.5) * u;
    g.drawImage(capaNoche(), 0, dy);

    // la noche se aclara cuando la torre se enciende; la ciudad se lee sin perder la noche. La capa ya trae el velo
    // de la torre encendida: antes, otro velo encima, que sumado a ese da el de ahora (NOCHE - (NOCHE - NOCHE_FIN)·enc)
    const enc = Qd ? 1 : entre(t, guion.encender, guion.encender + 700);
    const extra = 1 - (1 - (NOCHE - (NOCHE - NOCHE_FIN) * enc)) / (1 - NOCHE_FIN);
    if (extra > 0.0005) {
      g.fillStyle = `rgba(2,4,10,${extra.toFixed(3)})`;
      g.fillRect(0, 0, canvas.width, canvas.height);
    }

    // los autos
    for (const a of autos) {
      const p = Math.round(((a.p + a.dir * a.vel * (Qd ? 0 : t)) % a.largo + a.largo) % a.largo);
      const x = (a.v ? a.fijo : p) - ox, y = (a.v ? p : a.fijo) - oy;
      if (x < -1 || y < -1 || x > W || y > H) continue;
      const fx = a.v ? 0 : a.dir, fy = a.v ? a.dir : 0;
      g.fillStyle = '#f8fafc'; g.fillRect((x + fx) * u, (y + fy) * u, u, u);
      g.fillStyle = '#ef4444'; g.fillRect(x * u, y * u, u, u);
    }
    // luces rojas en los techos altos
    g.fillStyle = '#f87171';
    for (const b of balizas) if (Qd || (t + b.fase) % 1400 < 700) g.fillRect((b.x - ox) * u, (b.y - oy) * u, u, u);

    // la luz que barre: revela la ciudad de verdad debajo del haz. La ciudad clara y la luz ya vienen sumadas en una
    // capa; el centro del haz, más angosto, recibe otra pasada de la misma luz
    const bi = Qd ? 1 : entre(t, guion.barrido, guion.barrido + 450);
    const ang = anguloLuz(t);
    const largo = largoLuz();
    if (bi > 0) {
      g.save();
      conoLuz(tx, ty, ang, ABRE, largo);
      g.clip();
      g.globalAlpha = bi;
      g.drawImage(capaLuzAire(), 0, dy);
      g.restore();
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = gradHaz(g, tx, ty, largo, bi);
      conoLuz(tx, ty, ang, ABRE * 0.28, largo);
      g.fill();
      g.restore();
    }

    enjambreAire(t, Qd, ox, oy, bi, ang);
    // el Enjambre tiñe de rojo los bordes de la ciudad mientras se acerca
    const asedio = Qd ? 1 : entre(t, guion.enjambre, guion.enjambre + 2200);
    if (asedio >= 1 && !Qd) {
      g.drawImage(capaJuntos(cam), 0, 0);
      veloPintado = true;
    } else if (asedio > 0) {
      g.globalAlpha = asedio;
      g.drawImage(capaAsedio(), 0, dy);
      g.globalAlpha = 1;
    }

    const prendida = Qd || (t >= guion.encender && (t < guion.encender + 70 || t >= guion.encender + 150));
    torreAire(t, tx, ty, prendida, 1, Qd);
    if (!Qd) encendido(t, tx, ty);
  }

  function haz(tx, ty, ang, abre, largo, bi) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = gradHaz(g, tx, ty, largo, bi);
    conoLuz(tx, ty, ang, abre, largo);
    g.fill();
    conoLuz(tx, ty, ang, abre * 0.28, largo);
    g.fill();
    g.restore();
  }

  // el Enjambre, en los bordes: puntos rojos que se acercan; bajo la luz se ven claros
  function enjambreAire(t, Qd, ox, oy, bi, ang) {
    const rx = W * 0.56, ry = H * 0.5;
    for (let i = 0; i < enjambre.length; i++) {
      const e = enjambre[i];
      if (t < e.sale) continue;
      const d = Math.max(e.dq, e.d0 - (t - e.sale) * 0.0005);
      const an = e.ang + e.gira * (Qd ? 0 : t);
      const salto = Qd ? 0 : ((Math.imul(i + 1, 2654435761) ^ Math.floor(t / 220)) >>> 0) % 3 - 1;
      const x = Math.round(torre.x + Math.cos(an) * d * rx) + salto - ox;
      const y = Math.round(torre.y + Math.sin(an) * d * ry) - oy;
      const cola = [Math.round(Math.cos(an)), Math.round(Math.sin(an))];
      const lit = bi > 0 && dentroDeLuz((x - torre.x + ox) * u, (y - torre.y + oy) * u, ang, ABRE);
      const late = Qd || ((t + i * 97) % 600) < 360;
      // cada robot es una cruz de pixel: el centro encendido y los brazos oscuros, con su estela hacia afuera
      g.fillStyle = '#7f1d1d';
      g.fillRect((x + cola[0]) * u, (y + cola[1]) * u, u, u);
      g.fillRect((x - 1) * u, y * u, u, u); g.fillRect((x + 1) * u, y * u, u, u);
      g.fillRect(x * u, (y - 1) * u, u, u); g.fillRect(x * u, (y + 1) * u, u, u);
      g.fillStyle = lit ? '#fee2e2' : late ? '#f87171' : '#dc2626';
      g.fillRect(x * u, y * u, u, u);
    }
  }

  // la torre desde el aire: el halo de la baliza (código) y el techo con su cara sur en pixel, que parpadea al
  // encenderse como un tubo. (tx, ty) es la baliza.
  function torreAire(t, tx, ty, prendida, alfa, Qd) {
    if (alfa <= 0) return;
    g.globalAlpha = alfa;
    if (prendida) {
      // el halo, pintado una vez a toda fuerza: el pulso va en globalAlpha
      const pulso = Qd ? 1 : 0.9 + 0.1 * Math.sin(t / 260);
      g.globalAlpha = alfa * pulso;
      pintarHalo(haloDe('haloAire', 44 * u, 44 * u, 22 * u, 22 * u, 22 * u, [[0, 'rgba(165,243,252,0.42)'], [1, 'rgba(34,211,238,0)']]),
        tx - 22 * u, ty - 22 * u);
      g.globalAlpha = alfa;
    }
    const esc = 2 * u;
    const img = sprite(prendida ? 'torreOn' : 'torreOff', TORRE_AIRE, prendida ? PALETA_TORRE_AIRE_ENCENDIDA : PALETA_TORRE_AIRE, esc);
    g.drawImage(img, Math.round(tx - 7 * esc), Math.round(ty - 7 * esc));
    g.globalAlpha = 1;
  }

  // el encendido: un anillo que se abre y chispas de pixel que salen volando
  function encendido(t, tx, ty) {
    if (t < guion.encender || t >= guion.encender + 1000) return;
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
      g.fillRect(Math.round(tx / u + Math.cos(c.ang) * d - 0.5) * u, Math.round(ty / u + Math.sin(c.ang) * d - 0.5) * u, u, u);
    }
    g.globalAlpha = 1;
  }

  // ---- 2. la bajada: el plano se inclina ----
  function inclinado(t, inc) {
    const c = camara(inc);
    const cwp = canvas.width, chp = canvas.height;
    const { yH, huecos } = plano(c, mapa.base);
    // el suelo lejano, donde el mapa no llega
    g.fillStyle = OSCURO.calle;
    for (const y of huecos) g.fillRect(0, y, cwp, u);
    // al empezar, la luz del haz sigue barriendo el suelo y se apaga mientras la torre se levanta
    const ang = anguloLuz(t);
    const suelo = 1 - entre(inc, 0.1, 0.6);
    if (suelo > 0) {
      const largo = Math.hypot(cwp, chp) * 1.2;
      g.save();
      conoLuz(c.px0, c.py0, ang, ABRE, largo);
      g.clip();
      g.globalAlpha = suelo;
      plano(c, mapa.clara, rangoCono(c.px0, c.py0, ang, ABRE, largo));
      g.restore();
      haz(c.px0, c.py0, ang, ABRE, largo, suelo);
    }
    // lo que se mueve sobre el mapa, proyectado: autos, luces de los techos y el Enjambre
    const punto = (X, Y, color) => {
      const p = proyectar(c, X, Y);
      if (!p || p[1] < yH + u || p[0] < -u || p[0] > cwp || p[1] > chp) return;
      g.fillStyle = color;
      g.fillRect(Math.round(p[0] / u) * u, Math.round(p[1] / u) * u, u, u);
    };
    for (const a of autos) {
      const p = Math.round(((a.p + a.dir * a.vel * t) % a.largo + a.largo) % a.largo);
      punto(a.v ? a.fijo : p, a.v ? p : a.fijo, '#fde68a');
    }
    for (const b of balizas) if ((t + b.fase) % 1400 < 700) punto(b.x, b.y, '#f87171');
    const rx = W * 0.56, ry = H * 0.5;
    for (let i = 0; i < enjambre.length; i++) {
      const e = enjambre[i];
      const d = Math.max(e.dq, e.d0 - (t - e.sale) * 0.0005);
      const an = e.ang + e.gira * t;
      punto(torre.x + Math.cos(an) * d * rx, torre.y + Math.sin(an) * d * ry, ((t + i * 97) % 600) < 360 ? '#f87171' : '#dc2626');
    }

    // el cielo entra desde arriba, con la bruma de la ciudad y el rojo del Enjambre en el horizonte
    if (yH > -chp * 0.3) {
      const tope = Math.max(0, yH);
      if (tope > 0) {
        // el degradé va de yH - 0,7·alto hasta yH; más arriba, el color de arriba
        const y0 = Math.round(yH - chp * 0.7);
        if (y0 > 0) { g.fillStyle = CIELO[0][1]; g.fillRect(0, 0, cwp, y0); }
        pintarColumna(g, columna(chp * 0.7, CIELO), y0, 0, Math.round(yH));
        g.fillStyle = CIELO[1][1];
        g.fillRect(0, Math.round(yH), cwp, Math.round(tope + 1) - Math.round(yH));
        for (const e of estrellasAire) {
          const y = yH - e.y * chp * 0.75;
          if (y < 0 || y > yH - 2 * u) continue;
          g.fillStyle = `rgba(226,232,240,${(e.b * (0.7 + 0.3 * Math.sin(t / 900 + e.f))).toFixed(2)})`;
          g.fillRect(Math.round((e.x * cwp) / u) * u, Math.round(y / u) * u, u, u);
        }
      }
      pintarColumna(g, columna(chp * 0.26, BRUMA), yH - chp * 0.06);
      pintarColumna(g, columna(chp * 0.08, ROJO_HORIZONTE), yH - chp * 0.05);
    }
    // más cerca, el borde de abajo se oscurece: da hondura
    g.globalAlpha = inc;
    pintarColumna(g, columna(chp * 0.4, HONDURA), chp * 0.6);
    g.globalAlpha = 1;

    // la torre se levanta: el techo visto desde arriba se va y sube la torre de la partida, con su baliza
    const sube = entre(inc, 0.22, 0.9);
    torreAire(t, c.px0, c.py0, true, 1 - entre(inc, 0.25, 0.55), false);
    if (sube > 0) torreQueSube(t, c.px0, c.py0, sube);
  }

  // la torre de la partida, que sale del suelo fila por fila (se recorta, nunca se estira)
  function torreQueSube(t, bx, by, sube) {
    const esc = 2 * u, filas = Math.max(1, Math.round(TORRE.length * sube));
    const img = sprite('torreFrente', TORRE, PALETA_TORRE_ENCENDIDA, esc);
    const x = Math.round(bx / u - 16) * u, alto = filas * esc;
    const y = Math.round((by - alto) / u) * u;
    // su haz: ahora barre de costado, como en la partida
    const hx = x + 8 * esc, hy = y + esc;
    const ang = Math.PI + Math.sin(t / 700) * 0.7;
    const largo = canvas.width * 1.1;
    g.save();
    g.globalCompositeOperation = 'lighter';
    const grad = g.createRadialGradient(hx, hy, 0, hx, hy, largo);
    grad.addColorStop(0, `rgba(103,232,249,${(0.3 * sube).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(34,211,238,0)');
    g.fillStyle = grad;
    conoLuz(hx, hy, ang, 0.14, largo);
    g.fill();
    g.globalAlpha = sube;
    pintarHalo(haloDe('haloSube', 28 * u, 28 * u, 14 * u, 14 * u, 14 * u, [[0, 'rgba(165,243,252,0.5)'], [1, 'rgba(34,211,238,0)']]),
      hx - 14 * u, hy - 14 * u);
    g.restore();
    g.drawImage(img, 0, 0, img.width, alto, x, y, img.width, alto);
  }

  // ---- la niebla: la cámara baja a través de una nube, iluminada por el haz ----
  function pintarNiebla(t, nb) {
    const cwp = canvas.width, chp = canvas.height;
    // bancos de nube que suben rápido (la cámara baja), antes, durante y después del velo
    const desde = guion.niebla - 400;
    g.globalAlpha = 0.92 * (t < guion.frente ? 1 : Math.max(0, 1 - (t - guion.frente) / (guion.nieblaFin + 700 - guion.frente)));
    for (const n of nubes) {
      const y = chp * (1.1 + n.orden * 0.28) - (t - desde) * (chp / 1100) * n.vel;
      if (y > chp || y + n.alto < 0) continue;
      pintarNube(n, n.x * u, Math.round(y / u) * u);
    }
    g.globalAlpha = 1;
    if (nb > 0) {
      g.fillStyle = `rgba(22,36,62,${nb.toFixed(3)})`;
      g.fillRect(0, 0, cwp, chp);
      // y más nube por delante del velo, que pasa rápido: dentro de la niebla también se nota que se baja
      g.globalAlpha = 0.55 * nb;
      for (let i = 0; i < 3; i++) {
        const n = nubes[(i * 2 + 1) % nubes.length];
        const y = chp * (1.0 + i * 0.45) - (t - guion.niebla) * (chp / 520);
        const vuelta = chp * 1.35 + n.alto;
        const yy = ((y % vuelta) + vuelta) % vuelta - n.alto;
        pintarNube(n, (n.x - 10 * i) * u, Math.round(yy / u) * u);
      }
      g.globalAlpha = 1;
    }
    // la luz del haz cruza la niebla de un lado al otro
    const p = (t - guion.niebla) / (guion.nieblaFin - guion.niebla);
    const fuerza = Math.max(0, Math.min(1, nb * 1.3 + 0.15)) * (p < 0 ? Math.max(0, 1 + p * 5) : p > 1 ? Math.max(0, 1 - (p - 1) * 3.3) : 1);
    if (fuerza > 0) {
      // la luz, pintada una vez a toda fuerza en un disco del alto de la pantalla; se corre de lado a lado
      const lx = cwp * (1.25 - 1.5 * p), ly = chp * 0.42, R = Math.ceil(chp * 0.55);
      const arriba = Math.max(0, Math.ceil(ly) - R);
      const disco = haloDe('luzNiebla', 2 * R, Math.min(chp, Math.ceil(ly) + R) - arriba, R, ly - arriba, chp * 0.55,
        [[0, 'rgba(165,243,252,0.42)'], [0.4, 'rgba(34,211,238,0.16)'], [1, 'rgba(34,211,238,0)']]);
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = fuerza;
      g.drawImage(disco, Math.round(lx) - R, arriba);
      g.restore();
    }
  }

  // ---- 3. de frente: la ciudad de costado, en capas, y la cámara que baja hasta la barrera ----
  // Al salir de la niebla, la torre está donde la dejó la bajada (al centro, abajo); al aterrizar, donde la pone
  // la partida. Cada capa se corre según su distancia: la lejana poco, la de la calle entera, la nube más.
  function corrimiento(a) {
    const inicioX = Math.round(canvas.width / 2 / L.u - 16) - L.torre.x;
    const inicioY = Math.round(canvas.height / L.u) - (L.calle - 3);
    return [Math.round(inicioX * a), Math.round(inicioY * a)];
  }

  function pintarFrente(gc, ahora, a, Qd) {
    const [dx, dy] = corrimiento(a);
    const U = L.u, ancho = gc.canvas.width;
    gc.imageSmoothingEnabled = false;
    pintarCielo(gc, L, deco.estrellas, ahora, Qd, Math.round(dx * 0.1), Math.round(dy * 0.12));
    // la ciudad lejana se hunde detrás de la cercana al bajar, y se pierde en la bruma antes de llegar
    const k = Math.min(1, a * 4);
    if (k > 0) {
      const lx = Math.round(dx * 0.45), base = L.calle - 3 + Math.round(dy * 0.45);
      gc.globalAlpha = k;
      for (const e of lejanos) {
        const x = e.x + lx;
        if ((x + e.ancho) * U < 0 || x * U > ancho) continue;
        gc.fillStyle = '#0d1830';
        gc.fillRect(x * U, (base - e.alto) * U, e.ancho * U, e.alto * U);
        gc.fillStyle = '#16264a';
        gc.fillRect(x * U, (base - e.alto) * U, e.ancho * U, U);
        gc.fillStyle = '#7dd3fc';
        for (const [vx, vy] of e.luces) gc.fillRect((x + vx) * U, (base - e.alto + vy) * U, U, U);
        if (e.antena) {
          const ax = x + (e.ancho >> 1);
          gc.fillStyle = '#16264a';
          gc.fillRect(ax * U, (base - e.alto - 5) * U, U, 5 * U);
          if (Qd || (ahora + e.fase) % 1400 < 700) { gc.fillStyle = '#f87171'; gc.fillRect(ax * U, (base - e.alto - 6) * U, U, U); }
        }
      }
      // la bruma entre la ciudad lejana y la cercana
      pintarColumna(gc, columna(80 * U, BRUMA_LEJOS), (base - 80) * U);
      gc.globalAlpha = 1;
    }
    pintarCiudad(gc, L, extras, ahora, Qd, dx, dy);
    pintarCiudad(gc, L, deco.edificios, ahora, Qd, dx, dy);
    pintarTorre(gc, L, sprite('torreFrente', TORRE, PALETA_TORRE_ENCENDIDA, 2 * U), true, ahora, Qd, dx, dy);
    pintarCalzada(gc, L, dx, dy);
    pintarBarrera(gc, L, sprite('poste', BARRERA_POSTE, PALETA_BARRERA, U), false, dx, dy);
  }

  // ---- lo que se lee: la hora, Chispa y el texto, con la viñeta de abajo. A: cuánto se ve (se va en la bajada) ----
  function interfaz(t, A) {
    const cwp = canvas.width;
    g.globalAlpha = A;
    if (!veloPintado) g.drawImage(capaVelo(), 0, 0);

    // la hora, arriba, en letra pixel
    if (hora) {
      g.globalAlpha = A * (Q ? 1 : entre(t, guion.encender + 150, guion.encender + 650));
      g.font = `400 ${Math.round(15 * dpr)}px 'Silkscreen', ui-monospace, monospace`;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillStyle = '#67e8f9';
      g.fillText(hora, cwp / 2, Math.round(26 * dpr));
    }
    g.globalAlpha = A;
    escribir(t, chispa(t, A), A);
    g.globalAlpha = 1;
  }

  // Chispa: dormido y a media luz; al despertar le parpadean los ojos, se prende la antena, da un saltito y saluda
  function chispa(t, A) {
    const sc = Math.max(3, Math.round(4.2 * dpr));
    const x = Math.round(canvas.width / 2 - 7 * sc);
    let y = Math.round(canvas.height * 0.58);
    const dt = t - guion.chispa;
    const despierto = Q || (dt >= 0 && !(dt > 110 && dt < 220));
    let cuadro = CHISPA.quieto;
    if (!Q && dt > 520 && dt < 980) cuadro = CHISPA.saludo;
    else if (despierto && !Q && dt > 1200 && (dt % 2600) < 140) cuadro = CHISPA.parpadeo;
    if (!Q && dt > 260 && dt < 460) y -= sc;
    if (despierto) {
      const brillo = Q ? 1 : entre(dt, 0, 400);
      g.globalAlpha = A * brillo;
      g.drawImage(haloDe('haloChispa', 34 * sc, 34 * sc, 17 * sc, 15 * sc, 16 * sc, [[0, 'rgba(224,247,255,0.2)'], [1, 'rgba(224,247,255,0)']]),
        x - 10 * sc, y - 10 * sc);
    }
    g.globalAlpha = A * (despierto ? 1 : 0.6);
    const k = `chispa-${cuadro === CHISPA.saludo ? 's' : cuadro === CHISPA.parpadeo ? 'p' : 'q'}-${despierto ? 1 : 0}`;
    g.drawImage(sprite(k, cuadro, despierto ? PALETA_CHISPA : PALETA_CHISPA_DORMIDO, sc), x, y);
    g.globalAlpha = A;
    const yNombre = y + 16 * sc + Math.round(12 * dpr) + (!Q && dt > 260 && dt < 460 ? sc : 0);
    if (nombre && despierto) {
      g.globalAlpha = A * (Q ? 1 : entre(dt, 150, 500));
      g.font = `400 ${Math.round(11 * dpr)}px 'Silkscreen', ui-monospace, monospace`;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillStyle = '#22d3ee';
      g.fillText(nombre.toUpperCase(), canvas.width / 2, yNombre);
      g.globalAlpha = A;
    }
    return yNombre + Math.round(28 * dpr);
  }

  // el texto letra por letra, nítido y a resolución completa; un cursor de pixel marca por dónde va
  function escribir(t, y0, A) {
    const vis = letrasVisibles(Q ? 99999 : t, lineas, guion);
    g.font = `600 ${texto.fs}px 'Space Grotesk', system-ui, sans-serif`;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.globalAlpha = A;
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
    if (cursor && !Q && Math.floor(t / 260) % 2 === 0) {
      g.fillStyle = '#67e8f9';
      g.fillRect(Math.round(cursor[0]), Math.round(cursor[1] + texto.fs * 0.12), Math.max(2, Math.round(texto.fs * 0.42)), Math.round(texto.fs * 0.95));
    }
  }

  redimensionar();
  // si la letra llega después, se vuelve a medir el texto
  try { document.fonts && document.fonts.ready.then(() => armarTexto()); } catch { }
  return { dibujar, redimensionar };
}
