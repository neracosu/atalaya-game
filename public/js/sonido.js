// Sonido generado por código, sin archivos. El contexto de audio solo se crea después del primer toque,
// como piden los navegadores. Todo el juego se entiende sin sonido.

let ctx = null, maestro = null, activo = true;

export function activarSonido(si) { activo = si; }

export function despertar() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    maestro = ctx.createGain();
    maestro.gain.value = 0.22;
    maestro.connect(ctx.destination);
  } catch { ctx = null; }
}

function tono(frec, dur, { tipo = 'square', desde = 0, hasta = null, vol = 1 } = {}) {
  if (!ctx || !activo) return;
  const t = ctx.currentTime + desde;
  const o = ctx.createOscillator(), v = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(frec, t);
  if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + dur);
  v.gain.setValueAtTime(0.0001, t);
  v.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(v); v.connect(maestro);
  o.start(t); o.stop(t + dur + 0.02);
}

function ruido(dur, vol = 0.6) {
  if (!ctx || !activo) return;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), v = ctx.createGain(), f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = 900;
  v.gain.value = vol;
  s.buffer = buf; s.connect(f); f.connect(v); v.connect(maestro);
  s.start();
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
