// Sonido generado por código, sin archivos. El contexto de audio solo se crea después del primer toque,
// como piden los navegadores. Todo el juego se entiende sin sonido.
// Dos salidas: los efectos y la música (musica.js), cada una con su ajuste. La música usa este mismo contexto y se
// agacha un poco cada vez que suena un efecto, para no taparlo nunca.

let ctx = null, maestro = null, musicaBus = null, agache = null, activo = true;
let musica = { si: true, volumen: 0.4 };
let desfase = 0; // para programar efectos en otro momento (solo al grabar la muestra, fuera de línea)
const NIVEL_EFECTOS = 0.22, NIVEL_MUSICA = 0.6;

export function activarSonido(si) { activo = si; }
export const activarEfectos = activarSonido;

// la música: encendida o no y su volumen (0 a 1); el cambio es una rampa corta, sin clic
export function ajustarMusica(si, volumen = musica.volumen) {
  musica = { si: !!si, volumen: Math.max(0, Math.min(1, Number(volumen) || 0)) };
  if (musicaBus) musicaBus.gain.setTargetAtTime(musica.si ? musica.volumen * NIVEL_MUSICA : 0, ctx.currentTime, 0.08);
}
export const musicaActiva = () => musica.si && musica.volumen > 0;

function armar(c) {
  ctx = c;
  maestro = ctx.createGain();
  maestro.gain.value = NIVEL_EFECTOS;
  maestro.connect(ctx.destination);
  agache = ctx.createGain();
  agache.connect(ctx.destination);
  musicaBus = ctx.createGain();
  musicaBus.gain.value = musica.si ? musica.volumen * NIVEL_MUSICA : 0;
  musicaBus.connect(agache);
}

export function despertar() {
  if (ctx) { if (ctx.state === 'suspended' && !oculta()) ctx.resume(); return; }
  try {
    armar(new (window.AudioContext || window.webkitAudioContext)());
    // con la pestaña oculta, todo se pausa (el reloj de audio se detiene y la música sigue donde quedó)
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      try { if (oculta()) ctx.suspend(); else ctx.resume(); } catch { }
    });
  } catch { ctx = null; }
}
const oculta = () => typeof document !== 'undefined' && document.visibilityState === 'hidden';

// para musica.js: el contexto y la entrada de la música (null antes del primer toque)
export const contexto = () => ctx;
export const salidaMusica = () => musicaBus;

// Para grabar la muestra fuera de línea: usar otro contexto (OfflineAudioContext) y tocar un efecto en el
// segundo `t` de ese contexto. No se usa en el juego.
export function _usarContexto(c) { armar(c); }
export function _enElSegundo(t, tocar) { desfase = t - ctx.currentTime; try { tocar(); } finally { desfase = 0; } }

// la música se agacha un momento con cada efecto y vuelve sola (sin cortar lo programado: solo se suman rampas)
function agachar(t) {
  if (!agache || !musica.si) return;
  agache.gain.setTargetAtTime(0.62, t, 0.012);
  agache.gain.setTargetAtTime(1, t + 0.09, 0.16);
}

function tono(frec, dur, { tipo = 'square', desde = 0, hasta = null, vol = 1, ataque = 0.008 } = {}) {
  if (!ctx || !activo) return null;
  const t = ctx.currentTime + desfase + desde;
  agachar(t);
  const o = ctx.createOscillator(), v = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(frec, t);
  if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + dur);
  v.gain.setValueAtTime(0.0001, t);
  v.gain.exponentialRampToValueAtTime(vol, t + ataque);
  v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(v); v.connect(maestro);
  o.start(t); o.stop(t + dur + 0.02);
  return { o, v };
}

function ruido(dur, vol = 0.6) {
  if (!ctx || !activo) return;
  const t = ctx.currentTime + desfase;
  agachar(t);
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), v = ctx.createGain(), f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = 900;
  v.gain.value = vol;
  s.buffer = buf; s.connect(f); f.connect(v); v.connect(maestro);
  s.start(t);
}

// el acierto sube de tono con el combo: cada escalón suena más alto
const ESCALA = [523, 587, 659, 784, 880, 1047];
export function sonarPasa(nivel) { tono(ESCALA[Math.min(nivel, 5)], 0.09, { tipo: 'triangle', hasta: ESCALA[Math.min(nivel, 5)] * 1.5 }); }
export function sonarSello(nivel) { ruido(0.07, 0.8); tono(140, 0.12, { tipo: 'square', vol: 0.5 }); tono(ESCALA[Math.min(nivel, 5)], 0.06, { tipo: 'triangle', desde: 0.04, vol: 0.5 }); }
export function sonarError() { tono(220, 0.25, { tipo: 'sawtooth', hasta: 90, vol: 0.6 }); }
export function sonarCombo(nivel) { for (let i = 0; i < 3; i++) tono(ESCALA[Math.min(nivel, 5)] * [1, 1.25, 1.5][i], 0.08, { tipo: 'square', desde: i * 0.06, vol: 0.45 }); }
export function sonarRegla() { tono(392, 0.12, { tipo: 'triangle' }); tono(523, 0.18, { tipo: 'triangle', desde: 0.12 }); }
export function sonarRafaga() { for (let i = 0; i < 4; i++) tono(880, 0.07, { tipo: 'square', desde: i * 0.12, vol: 0.4 }); }
export function sonarFin(bien) {
  const notas = bien ? [523, 659, 784, 1047] : [392, 330, 262];
  notas.forEach((f, i) => tono(f, 0.16, { tipo: 'triangle', desde: i * 0.13 }));
}
export function sonarEstrella(i) { tono(ESCALA[2 + i], 0.14, { tipo: 'square', vol: 0.5 }); }

// ---- la apertura: sutil, por debajo de todo ----
// un fondo grave que entra despacio (solo si la música está apagada: con música, el tema empieza igual de grave);
// devuelve cómo apagarlo si la apertura se salta
export function sonarAmbiente(dura = 7.8) {
  const notas = [tono(55, dura, { tipo: 'sine', vol: 0.55, ataque: 1.4 }), tono(82.5, dura - 1.2, { tipo: 'sine', vol: 0.2, ataque: 2, desde: 0.9 })];
  return () => {
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const n of notas) {
      if (!n) continue;
      try {
        if (n.v.gain.cancelAndHoldAtTime) n.v.gain.cancelAndHoldAtTime(t); else n.v.gain.cancelScheduledValues(t);
        n.v.gain.setTargetAtTime(0.0001, t, 0.08);
        n.o.stop(t + 0.5);
      } catch { }
    }
  };
}
// la baliza se enciende: un chasquido y un zumbido que sube
export function sonarEncender() {
  ruido(0.05, 0.45);
  tono(110, 0.9, { tipo: 'triangle', hasta: 220, vol: 0.32, ataque: 0.04 });
  tono(660, 0.55, { tipo: 'sine', desde: 0.1, vol: 0.14, ataque: 0.03 });
}
// Chispa despierta: dos pitidos cortos
export function sonarChispa() {
  tono(1320, 0.05, { tipo: 'square', vol: 0.1 });
  tono(1760, 0.07, { tipo: 'square', desde: 0.08, vol: 0.1 });
}
// cada letra, apenas un golpecito
export function sonarLetra() { tono(1900, 0.018, { tipo: 'triangle', vol: 0.05 }); }
// la cámara cruza la niebla y la luz del haz pasa por delante
export function sonarNiebla() {
  tono(220, 0.9, { tipo: 'sine', hasta: 660, vol: 0.2, ataque: 0.35 });
  ruido(0.8, 0.16);
}
// la cámara llega a la barrera: un golpe grave y corto
export function sonarAterriza() {
  tono(98, 0.3, { tipo: 'triangle', hasta: 55, vol: 0.4, ataque: 0.01 });
}
