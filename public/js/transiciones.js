// Las transiciones entre pantallas, cada una del mundo del juego (GDD, parte 6). Van sobre una capa pixel que cubre
// la pantalla solo mientras dura la transición: un lienzo a un píxel por píxel del dibujo, agrandado sin suavizar,
// que se escribe de a píxel en memoria (un Uint32Array sobre ImageData y un putImageData por cuadro). Lo que se
// mueve de las pantallas mismas va con transform y clip-path, que los mueve el compositor.
// - La barrera baja (partida ganada -> resultado): la cinta amarilla y negra cruza en diagonal, tapa y destapa.
// - El Enjambre se come la pantalla (partida perdida -> resultado): celdas rojas entran por los bordes en orden de
//   tramado; la luz cian las empuja hacia afuera y deja ver lo nuevo.
// - Latigazo (Otra vez): la pantalla sale disparada y la nueva entra con un rebote, con líneas de velocidad hechas
//   de las luces de la ciudad. Dura 520 ms: volver a jugar en menos de un segundo, como pide el GDD.
// - El haz de la baliza (la tarjeta de la hora siguiente, al llegar a la vista): la luz gira desde abajo y deja la
//   tarjeta donde ya pasó.
// Con menos movimiento, todas son un fundido de 300 ms (cambiar de opacidad no es movimiento). Nada destella: el
// rojo del Enjambre nunca parpadea, solo avanza y se retira.

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const C = (r, g, b, a = 255) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
const ROJO = C(239, 68, 68), ROJO_OSC = C(69, 10, 10), ROJO_CLARO = C(254, 202, 202), CIAN = C(103, 232, 249), CIAN_CLARO = C(240, 253, 255);
const AMARILLO = C(250, 204, 21), NEGRO = C(11, 16, 32), CIAN_HAZ = C(34, 211, 238, 150);
const easeIn = x => x * x * x, easeOut = x => 1 - (1 - x) ** 3;
const suave = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
function azarDe(semilla) {
  let s = semilla >>> 0;
  return () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296);
}

export const DURA = { barrera: 1000, enjambre: 1100, latigazo: 520, haz: 1300, fundido: 300 };
// en qué punto de cada transición se cambia de pantalla (para demorar lo que la pantalla nueva anima al entrar)
export const CAMBIO = { barrera: 0.5, enjambre: 0.5, latigazo: 0, haz: 0, fundido: 0 };

// `capa`: el lienzo pixel que cubre la pantalla (dentro de #app). `cambiar(id)` muestra la pantalla nueva como lo
// hace app.js (mostrar). Devuelve `pasar(nombre, de, a)` y `revelar(nombre, elemento)`; las dos devuelven cuándo
// cambia la pantalla, en ms desde ahora, y no esperan a nada.
export function crearTransiciones(capa, { cambiar, menosMovimiento = () => false }) {
  const g = capa.getContext('2d');
  let W = 0, H = 0, u = 3, dpr = 1, img = null, px = null;
  let actual = null; // la transición en curso: { fin() }

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rc = capa.parentElement.getBoundingClientRect();
    const dw = Math.max(1, Math.round(rc.width * dpr)), dh = Math.max(1, Math.round(rc.height * dpr));
    u = Math.max(2, Math.floor(dw / 110));
    W = Math.ceil(dw / u);
    H = Math.ceil(dh / u);
    capa.width = W;
    capa.height = H;
    capa.style.width = `${(W * u) / dpr}px`;
    capa.style.height = `${(H * u) / dpr}px`;
    img = g.createImageData(W, H);
    px = new Uint32Array(img.data.buffer);
  }
  const limpiar = () => px.fill(0);
  const subir = () => g.putImageData(img, 0, 0);
  const aCss = v => (v * u) / dpr; // de píxel del dibujo a píxel CSS

  // la pantalla que se va queda a la vista junto a la que llega (las dos con `activa`) hasta que termina
  function limpiarEstilo(el) { if (!el) return; el.style.transform = ''; el.style.clipPath = ''; el.style.opacity = ''; el.style.zIndex = ''; el.classList.remove('en-transicion'); }

  // el orden en que el Enjambre cubre cada celda de 4x4: los bordes primero, con tramado y un poco de azar
  let orden = null, ordenDe = '';
  function ordenEnjambre() {
    const cw = Math.ceil(W / 4), ch = Math.ceil(H / 4), k = `${cw}x${ch}`;
    if (ordenDe === k) return orden;
    orden = new Float32Array(cw * ch);
    const r = azarDe(99);
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const borde = Math.min(x, cw - 1 - x, y, ch - 1 - y) / (Math.min(cw, ch) / 2);
      orden[y * cw + x] = Math.min(1, borde * 0.62 + (BAYER4[((y & 3) << 2) | (x & 3)] / 16) * 0.28 + r() * 0.1);
    }
    ordenDe = k;
    return orden;
  }

  const efectos = {
    barrera(p, t) {
      if (p >= CAMBIO.barrera && !t.cambiado) { t.cambiado = true; cambiar(t.a.id); }
      const total = W + H * 0.6;
      const frente = easeIn(Math.min(1, p / 0.5)) * total * 1.05;
      const cola = p < 0.5 ? -1 : easeOut((p - 0.5) / 0.5) * total * 1.05;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const d = x + y * 0.6;
        if (d > frente || d < cola) continue;
        const franja = ((x - y + 4096) >> 3) & 1;
        const borde = frente - d < 2 || (cola >= 0 && d - cola < 2);
        px[y * W + x] = borde || !franja ? NEGRO : AMARILLO;
      }
    },
    enjambre(p, t) {
      const cw = Math.ceil(W / 4), ch = Math.ceil(H / 4), ord = ordenEnjambre();
      const cubre = p < 0.5 ? p / 0.5 : 1, aclara = p < 0.5 ? 0 : (p - 0.5) / 0.5;
      if (p >= CAMBIO.enjambre && !t.cambiado) { t.cambiado = true; cambiar(t.a.id); }
      const celda = (cx, cy, col, cruz) => {
        for (let y = cy * 4; y < Math.min(H, cy * 4 + 4); y++) for (let x = cx * 4; x < Math.min(W, cx * 4 + 4); x++) {
          const lx = x & 3, ly = y & 3;
          px[y * W + x] = cruz && (lx === 1 || ly === 1) && !(lx === 3 || ly === 3) ? (col === CIAN ? CIAN_CLARO : ROJO_CLARO) : col;
        }
      };
      for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
        const v = 1 - ord[cy * cw + cx]; // los bordes primero
        if (v >= cubre * 1.02) continue;
        const frente = cubre < 1 && v > cubre - 0.08;
        if (aclara > 0 && 1 - v < aclara * 1.05) { // se va desde el centro hacia los bordes
          if (1 - v > aclara - 0.07) celda(cx, cy, CIAN, true);
          continue;
        }
        celda(cx, cy, frente ? ROJO : ROJO_OSC, frente);
      }
    },
    latigazo(p, t) {
      if (p < 0.5) {
        t.de.style.transform = `translateX(${-easeIn(p / 0.5) * 110}%)`;
        t.a.style.transform = 'translateX(110%)';
      } else {
        if (!t.cambiado) { t.cambiado = true; t.de.classList.remove('activa'); limpiarEstilo(t.de); }
        const q = (p - 0.5) / 0.5, o = 1 - easeOut(q);
        t.a.style.transform = `translateX(${o * 110 - Math.sin(q * Math.PI) * 3}%)`;
      }
      // las líneas de velocidad: las luces de la ciudad estiradas
      const vel = Math.sin(p * Math.PI);
      const r = azarDe(7 + ((p * 12) | 0));
      for (let k = 0; k < 40; k++) {
        const y = (r() * H) | 0, x0 = (r() * W) | 0, largo = (6 + r() * 40 * vel) | 0;
        const col = r() < 0.5 ? C(200, 154, 58, 200) : r() < 0.5 ? C(103, 232, 249, 170) : C(148, 163, 184, 120);
        for (let x = x0; x < Math.min(W, x0 + largo); x++) px[y * W + x] = col;
      }
    },
    // el haz barre un elemento (la tarjeta): el recorte va en sus propios píxeles CSS y la luz en la capa, solo
    // dentro de su rectángulo (que se vuelve a medir en cada cuadro, por si la página se desplaza)
    haz(p, t) {
      const el = t.a, rc = el.getBoundingClientRect(), ra = capa.parentElement.getBoundingClientRect();
      // la baliza, bajo el centro de lo que se ve de la tarjeta (si es más alta que la pantalla, lo de abajo se
      // revela después, al desplazarse; el barrido tiene que pasar por lo que está a la vista)
      const alto = Math.max(40, Math.min(rc.height, ra.bottom - rc.top));
      const bxc = rc.width / 2, byc = alto + 6;
      const a0 = Math.PI * 1.02, a1 = Math.PI * 1.98, ang = a0 + (a1 - a0) * suave(p);
      const largo = Math.hypot(rc.width, alto) * 1.3;
      const pts = [`${bxc}px ${byc}px`];
      for (let k = 0; k <= 16; k++) {
        const th = a0 - 0.2 + (ang - a0 + 0.2) * (k / 16);
        pts.push(`${bxc + Math.cos(th) * largo}px ${byc + Math.sin(th) * largo}px`);
      }
      el.style.clipPath = p >= 1 ? '' : `polygon(${pts.join(',')})`;
      // la luz, tramada, más fuerte cerca del eje
      const gx0 = ((rc.left - ra.left) * dpr) / u, gy0 = ((rc.top - ra.top) * dpr) / u;
      const bx = gx0 + (bxc * dpr) / u, by = gy0 + (byc * dpr) / u;
      const x0 = Math.max(0, gx0 | 0), x1 = Math.min(W, Math.ceil(gx0 + (rc.width * dpr) / u));
      const y0 = Math.max(0, gy0 | 0), y1 = Math.min(H, Math.ceil(gy0 + (rc.height * dpr) / u));
      const abre = 0.16, ca = Math.cos(ang), sa = Math.sin(ang);
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const dx = x - bx, dy = y - by;
        // el ángulo contra el eje del haz, sin atan2: el seno del ángulo entre los dos vectores
        const d = Math.hypot(dx, dy) || 1;
        const cruz = (dx * sa - dy * ca) / d, punto = (dx * ca + dy * sa) / d;
        if (punto <= 0) continue;
        const k = 1 - Math.abs(Math.asin(Math.max(-1, Math.min(1, cruz)))) / abre;
        if (k <= 0) continue;
        if (k * 20 * (1 - p * 0.3) > BAYER4[((y & 3) << 2) | (x & 3)] + 2) px[y * W + x] = k > 0.75 ? CIAN_CLARO : CIAN_HAZ;
      }
    },
  };

  // el fundido de menos movimiento: la pantalla nueva aparece; la vieja, si la hay, se va
  function fundido(p, t) {
    if (!t.cambiado) { t.cambiado = true; if (t.de) { t.de.style.zIndex = '2'; } if (t.cambia) cambiar(t.a.id); if (t.de) t.de.classList.add('activa'); }
    t.a.style.opacity = String(p);
    if (t.de) t.de.style.opacity = String(1 - p);
  }

  function correr(nombre, t, alFinal) {
    if (actual) actual.fin();
    const dura = DURA[nombre];
    let raf = 0;
    const capaVisible = nombre !== 'fundido';
    const fin = () => {
      cancelAnimationFrame(raf);
      if (!t.cambiado) { t.cambiado = true; if (t.cambia) cambiar(t.a.id); }
      if (t.de) { t.de.classList.remove('activa'); limpiarEstilo(t.de); }
      limpiarEstilo(t.a);
      if (t.cambia) t.a.classList.add('activa');
      capa.hidden = true;
      actual = null;
      if (alFinal) alFinal();
    };
    actual = { fin };
    if (capaVisible) { medir(); capa.hidden = false; }
    const t0 = performance.now();
    const cuadro = ahora => {
      const p = Math.min(1, (ahora - t0) / dura);
      try {
        if (capaVisible) limpiar();
        (nombre === 'fundido' ? fundido : efectos[nombre])(p, t);
        if (capaVisible) subir();
      } catch (e) { console.error(e); fin(); return; }
      if (p >= 1) fin(); else raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    return CAMBIO[nombre] * dura;
  }

  // de una pantalla a otra (elementos .pantalla). Devuelve en cuántos ms cambia la pantalla.
  function pasar(nombre, de, a) {
    if (menosMovimiento() || !efectos[nombre]) {
      a.style.opacity = '0';
      return correr('fundido', { de, a, cambia: true, cambiado: false });
    }
    const t = { de, a, cambia: true, cambiado: false };
    de.classList.add('en-transicion');
    a.classList.add('en-transicion');
    if (nombre === 'latigazo') {
      // las dos a la vista desde el principio: la nueva espera a la derecha
      a.style.transform = 'translateX(110%)';
      cambiar(a.id);
      t.cambiado = true;
      de.classList.add('activa');
      de.style.zIndex = '2';
    }
    return correr(nombre, t);
  }

  // un elemento que ya está en la pantalla aparece con su transición (la tarjeta con el haz)
  function revelar(nombre, el) {
    if (menosMovimiento() || !efectos[nombre]) {
      el.style.opacity = '0';
      return correr('fundido', { de: null, a: el, cambia: false, cambiado: true });
    }
    el.classList.add('en-transicion');
    return correr(nombre, { de: null, a: el, cambia: false, cambiado: true });
  }

  return { pasar, revelar, enCurso: () => !!actual };
}
