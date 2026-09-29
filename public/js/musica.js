// La música: «el tema de la noche», compuesto en código (GDD, parte 7: «Música que sigue la carga»). Sin archivos.
// Empieza grave y misteriosa en la apertura, sube cuando se enciende la luz, se abre en la bajada del cielo y
// sigue suave durante El peaje, con capas que se suman cuando aprieta (la fila llena, una ráfaga, un combo alto) y
// se retiran en calma. Al terminar, una cadencia corta según las estrellas. La música acompaña, no manda: va por
// debajo de los efectos, que la hacen agacharse (sonido.js).
//
// Dos partes:
// - la partitura y las capas, como datos y funciones puras (se prueban en Node): qué nota, cuándo y con qué voz;
// - el que toca (crearMusica): programa las notas con el reloj de audio un poco antes de que suenen, cada nota
//   con su envolvente (sin clics), en el mismo contexto de sonido.js.

import { PULSO } from './apertura.js';

// ---- el compás: el mismo pulso que la apertura (111 por minuto), en semicorcheas ----
export const TIEMPO = PULSO / 1000;          // segundos por tiempo
export const PASO = TIEMPO / 4;              // una semicorchea
export const PASOS_COMPAS = 16;
export const COMPAS = PASO * PASOS_COMPAS;   // 2,16 s
export const COMPASES_BUCLE = 8;

// de nota MIDI a frecuencia (69 = La 440)
export const frecuencia = n => 440 * 2 ** ((n - 69) / 12);

// ---- las voces: una forma de onda chiptune y su envolvente (ataque, caída, nivel sostenido, soltar) ----
export const VOCES = {
  zumbido: { onda: 'triangle', ataque: 1.2, caida: 0.1, sostiene: 1, suelta: 0.8 },
  bajo: { onda: 'triangle', ataque: 0.006, caida: 0.12, sostiene: 0.75, suelta: 0.07 },
  arpa: { onda: 'pulso25', ataque: 0.004, caida: 0.09, sostiene: 0.35, suelta: 0.06, filtro: 2600 },
  canto: { onda: 'pulso12', ataque: 0.012, caida: 0.15, sostiene: 0.7, suelta: 0.12, vibrato: true, filtro: 3400 },
  coro: { onda: 'square', ataque: 0.35, caida: 0.3, sostiene: 0.8, suelta: 0.6, filtro: 900, doble: true },
  campana: { onda: 'triangle', ataque: 0.004, caida: 0.9, sostiene: 0, suelta: 0.4, eco: true },
  bombo: { onda: 'bombo' },
  platillo: { onda: 'ruido', filtro: 7000, alto: true, dura: 0.035 },
  caja: { onda: 'ruido', filtro: 1900, dura: 0.11 },
  crash: { onda: 'ruido', filtro: 5000, alto: true, dura: 1.1 },
};

// ---- los acordes (notas MIDI): La menor ----
export const ACORDES = {
  Am: { bajo: 45, notas: [57, 60, 64] },
  F: { bajo: 41, notas: [57, 60, 65] },
  G: { bajo: 43, notas: [55, 59, 62] },
  C: { bajo: 48, notas: [55, 60, 64] },
  Dm: { bajo: 38, notas: [57, 62, 65] },
  E: { bajo: 40, notas: [56, 59, 64] },
};

// ---- El peaje: ocho compases que vuelven a empezar sin costura ----
export const BUCLE = ['Am', 'Am', 'F', 'G', 'Am', 'C', 'Dm', 'E'];
// el tema, para cuando aprieta: [nota, paso, duración en pasos] por compás; una octava abajo de los efectos
export const TEMA = [
  [[64, 0, 4], [62, 4, 2], [60, 6, 2], [64, 8, 6]],
  [[69, 0, 4], [67, 4, 2], [64, 6, 2], [60, 8, 4], [62, 12, 4]],
  [[60, 0, 6], [57, 6, 2], [60, 8, 2], [65, 10, 6]],
  [[62, 0, 4], [67, 4, 4], [59, 8, 4], [62, 12, 4]],
  [[64, 0, 4], [69, 4, 4], [72, 8, 6], [71, 14, 2]],
  [[67, 0, 8], [64, 8, 4], [67, 12, 4]],
  [[65, 0, 4], [64, 4, 2], [62, 6, 2], [57, 8, 4], [62, 12, 4]],
  [[59, 0, 4], [56, 4, 4], [59, 8, 4], [64, 12, 4]],
];
// el arpegio sube y baja por el acorde
const FIGURA = [0, 1, 2, 3, 2, 1, 0, 1];
const tonoDe = (acorde, i) => { const n = ACORDES[acorde].notas; return n[i % 3] + 12 * Math.floor(i / 3); };

// Las capas del peaje. «base» siempre suena: el bajo y un arpegio de corcheas, suaves.
export const CAPAS = ['base', 'pulso', 'brillo', 'tema'];
// cuándo entra cada capa y cuándo se va (con margen, para que no entre y salga a cada rato)
export const UMBRALES = { pulso: [0.35, 0.25], brillo: [0.55, 0.43], tema: [0.72, 0.6] };

// Cuánto aprieta la partida, de 0 a 1: la fila, una ráfaga, el combo y lo que va de la noche.
export function cargaDe({ fila = 0, filaMax = 5, enRafaga = false, racha = 0, paso = 0, duracion = 1 } = {}) {
  const presion = Math.max(0, Math.min(1, fila / Math.max(1, filaMax)));
  const combo = racha >= 10 ? 0.25 : racha >= 5 ? 0.1 : 0;
  const c = 0.1 + 0.35 * presion + 0.3 * Math.max(0, Math.min(1, paso / Math.max(1, duracion))) + (enRafaga ? 0.45 : 0) + combo;
  return Math.round(Math.max(0, Math.min(1, c)) * 1000) / 1000;
}

// Qué capas suenan en el compás que empieza, según la carga y las que ya sonaban. Una capa entra al pasar su
// umbral y se va solo cuando la carga baja bastante. Cuando aprieta, entran todas las que hagan falta de una vez
// (una ráfaga no espera); en calma se retiran de a una por compás, para que la música baje despacio.
export function capasPara(carga, previas = ['base']) {
  const ya = new Set(previas);
  const quiere = ['base'];
  for (const c of CAPAS.slice(1)) {
    const [entra, sale] = UMBRALES[c];
    if (ya.has(c) ? carga >= sale : carga >= entra) quiere.push(c);
  }
  const orden = c => CAPAS.indexOf(c);
  const suma = quiere.filter(c => !ya.has(c));
  let resultado = [...new Set(['base', ...[...ya].filter(c => CAPAS.includes(c))])];
  if (suma.length) resultado = [...new Set([...resultado, ...suma])];
  else {
    // se va solo la de más arriba de las que sobran
    const quita = resultado.filter(c => c !== 'base' && !quiere.includes(c)).sort((a, b) => orden(b) - orden(a));
    if (quita.length) resultado = resultado.filter(c => c !== quita[0]);
  }
  return resultado.sort((a, b) => orden(a) - orden(b));
}

// Las notas de un compás del peaje: [{ t (segundos desde que empieza el compás), dur, voz, nota, vol }]
export function notasCompas(n, capas = ['base']) {
  const i = ((n % COMPASES_BUCLE) + COMPASES_BUCLE) % COMPASES_BUCLE;
  const acorde = BUCLE[i], A = ACORDES[acorde];
  const con = new Set(capas);
  const ev = [];
  const nota = (paso, dur, voz, n, vol) => ev.push({ t: paso * PASO, dur: dur * PASO, voz, nota: n, vol });
  // base: el bajo en blancas con su quinta, y el arpegio en corcheas
  nota(0, 6, 'bajo', A.bajo, 0.34);
  nota(8, 4, 'bajo', A.bajo, 0.28);
  nota(12, 3, 'bajo', A.bajo + 7, 0.24);
  for (let k = 0; k < 8; k++) nota(k * 2, 2, 'arpa', tonoDe(acorde, FIGURA[k]), k % 4 === 0 ? 0.13 : 0.1);
  if (con.has('pulso')) {
    nota(0, 1, 'bombo', 0, 0.5);
    nota(8, 1, 'bombo', 0, 0.42);
    if (i % 4 === 3) nota(14, 1, 'bombo', 0, 0.3);
    for (const p of [4, 12]) nota(p, 1, 'caja', 0, 0.16);
    for (const p of [2, 6, 10, 14]) nota(p, 1, 'platillo', 0, 0.12);
  }
  // brillo: el arpegio se duplica en semicorcheas, una octava arriba y más bajito
  if (con.has('brillo')) for (let k = 0; k < 8; k++) nota(k * 2 + 1, 1, 'arpa', tonoDe(acorde, FIGURA[(k + 3) % 8]) + 12, 0.06);
  if (con.has('tema')) for (const [m, p, d] of TEMA[i]) nota(p, d, 'canto', m, 0.16);
  return ev.sort((a, b) => a.t - b.t || a.voz.localeCompare(b.voz));
}

// ---- la apertura, con el mismo reloj del guion (segundos desde el primer toque) ----
// noche: un zumbido grave y una campana lejana. luz: el arpegio sube con el encendido y sigue mientras se lee, un
// compás por acorde (tres de día: La menor, Fa y Sol; con la línea de la hora, cinco). bajada: tres compases amplios
// (Fa, Sol, Mi) con el coro, el tema arriba y un redoble que aterriza en La, donde empieza el peaje.
export function notasApertura(guion) {
  const ev = [];
  const s = ms => ms / 1000;
  const t0 = s(guion.encender);
  const en = (tiempo, paso = 0) => t0 + tiempo * TIEMPO + paso * PASO; // tiempo contado desde el encendido
  const nota = (t, dur, voz, n, vol) => ev.push({ t: Math.round(t * 10000) / 10000, dur: Math.round(dur * 10000) / 10000, voz, nota: n, vol });
  const fin = s(guion.aterriza);
  const n = guion.compasesLuz, b = n * 4; // el tiempo en que empieza la bajada
  // la noche: el zumbido entra despacio y se queda debajo hasta la bajada
  nota(0, s(guion.bajada) + 0.3, 'zumbido', 33, 0.3);
  nota(0.3, s(guion.bajada), 'zumbido', 40, 0.12);
  nota(0.12, 0.8, 'campana', 76, 0.07);
  // la luz: un barrido de arpa hacia arriba justo al encender
  [57, 60, 64, 69, 72, 76].forEach((m, k) => nota(t0 + k * PASO * 0.5, PASO * 1.5, 'arpa', m, 0.07 + 0.012 * k));
  // un compás por acorde, con el bajo y el arpegio en corcheas; empieza en La menor y termina en Sol. Chispa
  // despierta con la campana
  const luz = ['Am', ...['F', 'C', 'Dm', 'Am', 'F', 'C'].slice(0, n - 2), 'G'];
  luz.forEach((a, c) => {
    const A = ACORDES[a];
    nota(en(c * 4), 2 * TIEMPO, 'bajo', A.bajo, 0.26);
    nota(en(c * 4 + 2), 2 * TIEMPO, 'bajo', A.bajo, 0.22);
    for (let k = c === 0 ? 2 : 0; k < 8; k++) nota(en(c * 4, k * 2), 2 * PASO, 'arpa', tonoDe(a, FIGURA[k]), 0.07 + (0.02 * c) / (n - 1));
    // en el último tiempo del último compás el arpegio se apura: anuncia la bajada
    if (c === n - 1) for (let k = 0; k < 4; k++) nota(en(b - 1, k), PASO, 'arpa', tonoDe(a, 3 + (k % 3)) + 12, 0.05 + 0.012 * k);
  });
  nota(s(guion.chispa), 0.6, 'campana', 81, 0.05);
  // la bajada: amplia, en tres compases, con el coro y el tema una octava arriba
  const bajada = ['F', 'G', 'E'];
  const canto = [
    [[69, 0, 6], [72, 6, 2], [76, 8, 8]],
    [[77, 0, 6], [76, 6, 2], [74, 8, 4], [71, 12, 4]],
    [[76, 0, 8], [74, 8, 2], [72, 10, 2], [71, 12, 2], [68, 14, 2]],
  ];
  nota(en(b), 1.2, 'crash', 0, 0.2);
  bajada.forEach((a, c) => {
    const A = ACORDES[a], comp = b + c * 4;
    nota(en(comp), 4 * TIEMPO, 'bajo', A.bajo - 12, 0.3);
    nota(en(comp + 2), 2 * TIEMPO, 'bajo', A.bajo, 0.22);
    for (const m of A.notas) nota(en(comp), 4 * TIEMPO - 0.05, 'coro', m, 0.05);
    for (let k = 0; k < 16; k++) nota(en(comp, k), PASO, 'arpa', tonoDe(a, FIGURA[k % 8]) + 12, k % 4 === 0 ? 0.075 : 0.05);
    for (const [m, p, d] of canto[c]) nota(en(comp, p), d * PASO, 'canto', m, 0.13);
    nota(en(comp), PASO, 'bombo', 0, 0.42);
    nota(en(comp + 2), PASO, 'bombo', 0, 0.34);
    if (c > 0) for (const p of [2, 6, 10, 14]) nota(en(comp, p), PASO, 'platillo', 0, 0.08);
  });
  // el redoble del último tiempo, que crece hasta la barrera
  for (let k = 0; k < 4; k++) nota(en(b + 11, k), PASO, 'caja', 0, 0.08 + 0.04 * k);
  // aterriza: La, el primer compás del peaje lo recibe
  nota(fin, 0.9, 'crash', 0, 0.12);
  return ev.sort((a, b) => a.t - b.t || a.voz.localeCompare(b.voz));
}

// ---- el cierre, según las estrellas ----
// 0: Re menor a La menor, grave. 1: Fa, Sol, La menor. 2: Fa, Sol, Do. 3: Fa, Sol, Do con el tema que sube y un
// platillo. Siempre en tonos que no chocan con los efectos del resultado (Do mayor y La menor).
export function cadencia(estrellas = 0) {
  const e = Math.max(0, Math.min(3, estrellas | 0));
  const ev = [];
  const nota = (tiempo, dur, voz, n, vol) => ev.push({ t: tiempo * TIEMPO, dur: dur * TIEMPO, voz, nota: n, vol });
  const acordes = e === 0 ? ['Dm', 'Am'] : e === 1 ? ['F', 'G', 'Am'] : ['F', 'G', 'C'];
  acordes.forEach((a, k) => {
    const ultimo = k === acordes.length - 1, dura = ultimo ? 3 : 1;
    nota(k, dura, 'bajo', ACORDES[a].bajo - (ultimo ? 12 : 0), 0.3);
    for (const m of ACORDES[a].notas) nota(k, dura, 'coro', m, e === 0 ? 0.04 : 0.05);
  });
  const arriba = { 0: [], 1: [[72, 0], [74, 1], [76, 2]], 2: [[69, 0], [71, 1], [72, 2]], 3: [[72, 0], [74, 1], [76, 2], [79, 2.5]] }[e];
  arriba.forEach(([m, tpo], k) => nota(tpo, k === arriba.length - 1 ? 2.5 : 1, 'canto', m, 0.12));
  if (e === 3) { nota(2, 1.5, 'crash', 0, 0.12); nota(3, 2, 'campana', 84, 0.06); }
  return ev.sort((a, b) => a.t - b.t || a.voz.localeCompare(b.voz));
}

// ---- el que toca ----
// Programa las notas con el reloj de audio: cada 25 ms mira qué cae en los próximos 150 ms y lo agenda. Así un
// cuadro lento no atrasa la música. `reloj: false` no arma el temporizador (para grabar fuera de línea: se llama
// a programar(hasta) a mano).
export function crearMusica(ctx, destino, { reloj = true } = {}) {
  const ADELANTO = 0.15;
  let cola = [];            // notas por sonar: { t (segundo del contexto), ... , seccion }
  let peaje = null;         // { origen, compas, capas, seccion }
  let carga = 0;
  let temporizador = 0;
  let mudo = false;        // con la música apagada, el compás sigue pero no se crea ninguna nota
  const ondas = {};
  let ruido = null, eco = null, vibrato = null;

  // las ondas de pulso (25 % y 12,5 %), el ruido y el eco se arman una vez
  function pulso(ancho) {
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * ancho);
    return ctx.createPeriodicWave(re, im);
  }
  function armar() {
    if (ondas.pulso25) return;
    ondas.pulso25 = pulso(0.25);
    ondas.pulso12 = pulso(0.125);
    const largo = Math.floor(ctx.sampleRate * 1.2);
    ruido = ctx.createBuffer(1, largo, ctx.sampleRate);
    const d = ruido.getChannelData(0);
    // ruido con semilla: la misma muestra siempre
    let s = 12345;
    for (let i = 0; i < largo; i++) { s = (Math.imul(s, 1103515245) + 12345) >>> 0; d[i] = (s / 2147483648) - 1; }
    eco = ctx.createDelay(1);
    eco.delayTime.value = TIEMPO * 0.75;
    const vuelve = ctx.createGain();
    vuelve.gain.value = 0.35;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass'; filtro.frequency.value = 2400;
    eco.connect(filtro); filtro.connect(vuelve); vuelve.connect(eco); filtro.connect(destino);
    vibrato = ctx.createOscillator();
    vibrato.frequency.value = 5.2;
    const cuanto = ctx.createGain();
    cuanto.gain.value = 9; // centésimas de semitono
    vibrato.connect(cuanto);
    vibrato.cuanto = cuanto;
    vibrato.start();
  }

  // una sección que ya no suena se desconecta (solo con reloj: fuera de línea todo se graba de una vez)
  function soltar(sec, cuando) {
    if (reloj) setTimeout(() => { try { sec.disconnect(); } catch { } }, Math.max(0, cuando - ctx.currentTime) * 1000);
  }
  function seccion() {
    const g = ctx.createGain();
    g.gain.value = 1;
    g.connect(destino);
    return g;
  }
  // una sección se va con una rampa: lo que ya sonaba se apaga sin clic
  function apagar(sec, t, dura = 0.35) {
    if (!sec) return;
    try {
      sec.gain.setValueAtTime(sec.gain.value, t);
      sec.gain.linearRampToValueAtTime(0, t + dura);
    } catch { }
    cola = cola.filter(n => n.seccion !== sec || n.t < t);
    soltar(sec, t + dura + 2);
  }

  // una nota: oscilador (o ruido) con su envolvente de rampas lineales, que siempre empieza y termina en cero
  function tocar(n) {
    const v = VOCES[n.voz];
    if (!v) return;
    const t = Math.max(n.t, ctx.currentTime);
    const salida = n.seccion;
    if (v.onda === 'ruido') {
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = ruido;
      f.type = v.alto ? 'highpass' : 'bandpass';
      f.frequency.value = v.filtro;
      const dura = v.dura;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(n.vol, t + 0.002);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0005, n.vol * 0.02), t + dura);
      g.gain.linearRampToValueAtTime(0, t + dura + 0.02);
      src.connect(f); f.connect(g); g.connect(salida);
      src.start(t, dura > 0.5 ? 0 : (n.t * 7.3) % 0.9);
      src.stop(t + dura + 0.05);
      return;
    }
    if (v.onda === 'bombo') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(n.vol, t + 0.004);
      g.gain.linearRampToValueAtTime(0, t + 0.2);
      o.connect(g); g.connect(salida);
      o.start(t); o.stop(t + 0.22);
      return;
    }
    const g = ctx.createGain();
    let fin = g;
    if (v.filtro) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = v.filtro;
      g.connect(f); fin = f;
    }
    fin.connect(salida);
    if (v.eco && eco) fin.connect(eco);
    const pico = v.doble ? n.vol * 0.6 : n.vol;
    const aTope = t + v.ataque, aSostener = aTope + v.caida;
    const sueltaEn = Math.max(aSostener, t + n.dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(pico, aTope);
    if (v.sostiene > 0) {
      g.gain.linearRampToValueAtTime(pico * v.sostiene, aSostener);
      g.gain.setValueAtTime(pico * v.sostiene, sueltaEn);
      g.gain.linearRampToValueAtTime(0, sueltaEn + v.suelta);
    } else {
      g.gain.linearRampToValueAtTime(0, aSostener + v.suelta);
    }
    const hasta = (v.sostiene > 0 ? sueltaEn : aSostener) + v.suelta + 0.02;
    const osciladores = v.doble ? [-7, 7] : [0];
    for (const cents of osciladores) {
      const o = ctx.createOscillator();
      if (ondas[v.onda]) o.setPeriodicWave(ondas[v.onda]); else o.type = v.onda;
      o.frequency.value = frecuencia(n.nota);
      o.detune.value = cents;
      if (v.vibrato && vibrato) vibrato.cuanto.connect(o.detune);
      o.connect(g);
      o.start(t); o.stop(hasta);
    }
  }

  function agendar(lista, desde, sec) {
    for (const n of lista) cola.push({ ...n, t: desde + n.t, seccion: sec });
    cola.sort((a, b) => a.t - b.t);
  }

  // mira qué cae antes de `hasta` y lo agenda; los compases del peaje se arman justo antes de empezar
  function programar(hasta = ctx.currentTime + ADELANTO) {
    // la apertura entera desemboca en el peaje justo al aterrizar, sin esperar a nadie
    if (apertura && !peaje && hasta + 0.05 >= apertura.aterriza) {
      peaje = { origen: apertura.aterriza, compas: 0, capas: ['base'], seccion: seccion() };
      apertura = null;
    }
    if (peaje) {
      while (peaje.origen + peaje.compas * COMPAS < hasta + 0.05) {
        peaje.capas = capasPara(carga, peaje.capas);
        agendar(notasCompas(peaje.compas, peaje.capas), peaje.origen + peaje.compas * COMPAS, peaje.seccion);
        peaje.compas++;
      }
    }
    while (cola.length && cola[0].t < hasta) {
      const n = cola.shift();
      if (mudo || n.t < ctx.currentTime - 0.05) continue; // en silencio, o ya pasó (una pestaña que volvió)
      try { tocar(n); } catch { }
    }
    // nada más que tocar: el reloj descansa hasta la próxima
    if (!apertura && !peaje && !cola.length && temporizador) { clearInterval(temporizador); temporizador = 0; }
  }

  function arrancarReloj() {
    if (!reloj || temporizador) return;
    temporizador = setInterval(() => programar(), 25);
  }

  let apertura = null;
  return {
    mudo(si) { mudo = !!si; },
    // la apertura empieza ahora (en el segundo `t` del contexto)
    apertura(guion, t = ctx.currentTime + 0.02) {
      armar();
      this.parar(0.05);
      apertura = seccion();
      agendar(notasApertura(guion), t, apertura);
      apertura.inicio = t;
      apertura.encender = t + guion.encender / 1000;
      apertura.aterriza = guion.quieto ? Infinity : t + guion.aterriza / 1000;
      arrancarReloj();
      programar();
    },
    // la partida: si viene de la apertura entera, el peaje empieza justo al aterrizar; si se saltó o no hubo
    // apertura, en el próximo tiempo, y lo que quedaba de la apertura se apaga con una rampa
    peaje(t = ctx.currentTime) {
      armar();
      if (peaje) return;
      let origen = t + 0.06;
      if (apertura) {
        // al saltarla: en el próximo tiempo de la apertura, para que no se tropiece
        const base = apertura.encender;
        origen = t + 0.08 <= base ? t + 0.08 : base + Math.ceil((t + 0.08 - base) / TIEMPO) * TIEMPO;
        apagar(apertura, t, 0.3);
      }
      apertura = null;
      peaje = { origen, compas: 0, capas: ['base'], seccion: seccion() };
      arrancarReloj();
      programar();
    },
    carga(c) { carga = Math.max(0, Math.min(1, Number(c) || 0)); },
    // al terminar: el peaje se va en el próximo tiempo y suena la cadencia
    cerrar(estrellas = 0, t = ctx.currentTime) {
      armar();
      let desde = t + 0.25;
      if (peaje) {
        desde = peaje.origen + Math.ceil((t + 0.2 - peaje.origen) / TIEMPO) * TIEMPO;
        apagar(peaje.seccion, desde, 0.4);
        peaje = null;
      }
      if (apertura) { apagar(apertura, t, 0.3); apertura = null; }
      const sec = seccion();
      agendar(cadencia(estrellas), desde, sec);
      soltar(sec, desde + 8);
      arrancarReloj();
      programar();
    },
    // silencio, con una rampa corta
    parar(dura = 0.3) {
      const t = ctx.currentTime;
      if (apertura) apagar(apertura, t, dura);
      if (peaje) apagar(peaje.seccion, t, dura);
      apertura = null; peaje = null;
      cola = [];
    },
    programar,
    get capas() { return peaje ? peaje.capas.slice() : []; },
    get sonando() { return !!(apertura || peaje || cola.length); },
  };
}
