// La apertura: sale solo la primera vez, saltarla lleva a la partida y un almacenamiento que falla no rompe nada.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { debeVerse, marcarVista, crearControl, letrasVisibles, GUION, GUION_QUIETO, CLAVE, _olvidar } from '../public/js/apertura.js';
import { T } from '../public/js/textos.js';

function almacen() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
}
const roto = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('lleno'); } };

// un control con espías: cuántas veces arrancó la partida y cuántas terminó la apertura
function espiar(guion = GUION) {
  const hechos = [];
  const c = crearControl({ guion, lineas: T.apertura.lineas, alEmpezarPartida: m => hechos.push(['partida', m]), alTerminar: m => hechos.push(['fin', m]) });
  return { c, hechos };
}

test('la apertura sale solo la primera vez', () => {
  _olvidar();
  const a = almacen();
  assert.equal(debeVerse(() => a), true);
  marcarVista(() => a);
  assert.equal(a.m.get(CLAVE), '1');
  assert.equal(debeVerse(() => a), false);
  // otra visita (la memoria de la página se pierde, el teléfono la recuerda)
  _olvidar();
  assert.equal(debeVerse(() => a), false);
});

test('si el almacenamiento falla, no rompe y no se repite en la misma visita', () => {
  _olvidar();
  for (const obtener of [() => roto, () => { throw new Error('SecurityError'); }, () => null, null, undefined]) {
    _olvidar();
    assert.doesNotThrow(() => debeVerse(obtener));
    assert.equal(debeVerse(obtener), true);
    assert.doesNotThrow(() => marcarVista(obtener));
    assert.equal(debeVerse(obtener), false, 'se recuerda en memoria');
  }
  _olvidar();
});

test('entera: la partida arranca una vez, antes del final, y la apertura termina una vez', () => {
  const { c, hechos } = espiar();
  const golpes = [];
  for (let t = 0; t <= GUION.fin + 500; t += 16) golpes.push(...c.avanzar(t));
  assert.deepEqual(hechos, [['partida', 'guion'], ['fin', 'guion']]);
  assert.ok(GUION.partida < GUION.fin, 'la partida corre debajo antes de que la luz se abra');
  assert.ok(GUION.fin <= 9000, 'es corta');
  for (const g of ['encender', 'chispa', 'destello']) assert.equal(golpes.filter(x => x === g).length, 1, g);
  assert.ok(golpes.includes('letra'));
  assert.deepEqual(c.avanzar(GUION.fin + 1000), [], 'terminada no hace nada');
});

test('saltarla lleva a la partida en el acto y se va con un fundido corto', () => {
  const { c, hechos } = espiar();
  c.avanzar(0); c.avanzar(1200);
  c.saltar();
  assert.deepEqual(hechos, [['partida', 'saltada']], 'la partida arranca al saltar');
  c.saltar(); c.saltar();
  c.avanzar(1300);
  assert.ok(c.opacidad > 0 && c.opacidad < 1);
  c.avanzar(1200 + GUION.saltoFundido);
  assert.deepEqual(hechos, [['partida', 'saltada'], ['fin', 'saltada']]);
  assert.equal(c.terminada, true);
  // después de saltar, no suena nada más de la apertura
  const { c: c2 } = espiar();
  c2.avanzar(0); c2.saltar();
  assert.deepEqual(c2.avanzar(GUION.destello + 10), []);
});

test('saltarla durante el destello no arranca otra partida', () => {
  const { c, hechos } = espiar();
  c.avanzar(0); c.avanzar(GUION.partida + 100);
  c.saltar();
  c.avanzar(GUION.fin);
  assert.deepEqual(hechos, [['partida', 'guion'], ['fin', 'saltada']]);
});

test('el reloj de seguridad juega igual aunque no lleguen cuadros', () => {
  const { c, hechos } = espiar();
  c.forzar(); c.forzar();
  assert.deepEqual(hechos, [['partida', 'forzada'], ['fin', 'forzada']]);
});

test('con menos movimiento: un cuadro quieto, todo el texto a la vista y más corta', () => {
  assert.deepEqual(letrasVisibles(0, T.apertura.lineas, GUION_QUIETO), T.apertura.lineas.map(l => l.length));
  const { c, hechos } = espiar(GUION_QUIETO);
  const golpes = [];
  for (let t = 0; t <= GUION_QUIETO.fin; t += 50) golpes.push(...c.avanzar(t));
  assert.ok(!golpes.includes('letra'));
  assert.deepEqual(hechos.map(h => h[0]), ['partida', 'fin']);
  assert.ok(GUION_QUIETO.fin < GUION.fin);
});

test('el texto entra letra por letra, a no más de 20 por segundo, y termina antes del destello', () => {
  const [a, b] = T.apertura.lineas;
  assert.ok(GUION.letrasPorSegundo >= 5 && GUION.letrasPorSegundo <= 20);
  assert.deepEqual(letrasVisibles(GUION.linea1 - 1, [a, b]), [0, 0]);
  assert.deepEqual(letrasVisibles(GUION.linea1 + 500, [a, b]), [10, 0]);
  assert.ok(GUION.linea1 + (a.length * 1000) / GUION.letrasPorSegundo <= GUION.linea2, 'la primera termina antes de la segunda');
  assert.ok(GUION.linea2 + (b.length * 1000) / GUION.letrasPorSegundo <= GUION.destello - 300, 'queda un respiro para leer');
  assert.deepEqual(letrasVisibles(GUION.destello, [a, b]), [a.length, b.length]);
});

test('app.js: la primera partida pasa por la apertura y saltarla empieza la partida', () => {
  const app = readFileSync(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.match(app, /debeVerse\(almacen\)\) verApertura/);
  assert.match(app, /alEmpezarPartida: \(\) => \{[^}]*try \{ jugar\(\); \}/);
  assert.match(app, /\$\('empezar'\)\.addEventListener\('click', \(\) => tomarGuardia\('partida'\)\)/);
  assert.match(app, /\$\('ver-apertura'\)/);
  // Espacio, Enter y Escape la saltan
  for (const k of ["' '", "'Enter'", "'Escape'"]) assert.ok(app.includes(`e.key === ${k}`), k);
});

test('la tarjeta de la hora 2: dice que llega pronto, sin fecha, y ofrece el reto y las estrellas', () => {
  const P = T.proxima;
  assert.match(`${P.rotulo} ${P.titulo}`, /Hora 2/);
  assert.match(P.titulo, /La cuarentena/);
  assert.equal(P.pronto, 'Llega pronto');
  assert.doesNotMatch(Object.values(P).filter(v => typeof v === 'string').join(' '), /\d{1,2} de [a-z]+|octubre|noviembre|semana/i, 'sin prometer fecha');
  assert.equal(P.retoMananaTexto('00:00', 3, false), 'Sale a medianoche. Lleva 3 días de racha: vuelva y súmele uno.');
  assert.equal(P.retoMananaTexto('21:00', 1, true), 'Sale hoy a las 21:00. Vuelva y su racha llega a 2 días.');
  assert.match(P.retoHoyTexto('Noche de ráfagas', 0), /empiece su racha/);
  assert.match(P.estrellasTexto(18450, 26000, 2), /tercera estrella pide 26/);
});
