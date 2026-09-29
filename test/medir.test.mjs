// La medición: solo salen nombres de una lista fija, una visita cuenta sus reintentos y sus hitos, y el contador
// de días del teléfono no guarda nada más que una fecha y un número.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearMedidor, visitaDelDia, EVENTOS, tramoDePrimeraJugada } from '../public/js/medir.js';
import { embudo, eventosPorDia } from '../scripts/embudo.mjs';

function grabar() {
  const salidos = [];
  return { salidos, medir: crearMedidor(n => salidos.push(n)) };
}

test('una visita: primera partida, reintentos por hitos, estrellas y lo que cuenta una sola vez', () => {
  const { salidos, medir } = grabar();
  medir('landing-empezar');
  medir('partida');
  medir('fin-peaje', 2);
  for (let i = 0; i < 5; i++) { medir('otra-vez'); medir('partida'); medir('fin-peaje', 9); }
  medir('reto');
  medir('compartir'); medir('compartir');
  medir('dominio'); medir('dominio'); medir('compartir-puerta'); medir('compartir-puerta');
  medir('ir-atalaya');
  assert.deepEqual(salidos, [
    'landing-empezar', 'empieza', 'fin-primera-2',
    'reintento-1', 'fin-otra-3', 'reintento-2', 'fin-otra-3', 'reintento-3', 'fin-otra-3', 'fin-otra-3', 'reintento-5', 'fin-otra-3',
    'reto', 'comparte', 'dominio', 'comparte-puerta', 'vigilar',
  ]);
  for (const n of salidos) assert.ok(EVENTOS.includes(n), n);
});

test('tocar la tarjeta de la hora 2 cuenta una sola vez', () => {
  const { salidos, medir } = grabar();
  medir('proxima'); medir('proxima'); medir('proxima');
  assert.deepEqual(salidos, ['toca-hora-2']);
  assert.ok(EVENTOS.includes('toca-hora-2'));
});

test('la primera jugada sale en tramos, una vez por visita, y el salto de la apertura se sigue contando', () => {
  const casos = [[0, '0-2'], [1999, '0-2'], [2000, '2-3'], [2999, '2-3'], [3000, '3-5'], [4999, '3-5'], [5000, '5-10'], [9999, '5-10'], [10000, 'mas-10'], [95000, 'mas-10']];
  for (const [ms, tramo] of casos) assert.equal(tramoDePrimeraJugada(ms), tramo, String(ms));
  assert.equal(tramoDePrimeraJugada(undefined), '0-2');
  const { salidos, medir } = grabar();
  medir('apertura-saltada', 400);
  medir('primera-jugada', 2210);
  medir('primera-jugada', 800);
  assert.deepEqual(salidos, ['apertura-saltada-0', 'primera-jugada-2-3']);
  for (const n of salidos) assert.ok(EVENTOS.includes(n), n);
  for (const [, tramo] of casos) assert.ok(EVENTOS.includes('primera-jugada-' + tramo), tramo);
});

test('nada que no esté en la lista sale, ni aunque se pase un dominio por error', () => {
  const { salidos, medir } = grabar();
  medir('ejemplo.com'); medir('fin-peaje-ejemplo.com'); medir('dominio:ejemplo.com'); medir(undefined); medir('fin-peaje', 'x');
  assert.deepEqual(salidos, ['fin-primera-0']);
});

test('el contador de días del teléfono', () => {
  assert.deepEqual(visitaDelDia(null, '2026-10-01'), { eventos: ['nuevo'], guardar: { dia: '2026-10-01', dias: 1 } });
  assert.deepEqual(visitaDelDia({ dia: '2026-10-01', dias: 1 }, '2026-10-01').eventos, []);
  assert.deepEqual(visitaDelDia({ dia: '2026-10-01', dias: 1 }, '2026-10-02'), { eventos: ['vuelve-dia-siguiente'], guardar: { dia: '2026-10-02', dias: 2 } });
  assert.deepEqual(visitaDelDia({ dia: '2026-10-02', dias: 2 }, '2026-10-05').eventos, ['vuelve-otro-dia', 'dias-3']);
  assert.deepEqual(visitaDelDia({ dia: '2026-10-10', dias: 6 }, '2026-10-11').eventos, ['vuelve-dia-siguiente', 'dias-7']);
  // lo guardado solo tiene la fecha y el número de días
  assert.deepEqual(Object.keys(visitaDelDia({ dia: '2026-10-01', dias: 1, otro: 'x' }, '2026-10-03').guardar).sort(), ['dia', 'dias']);
  assert.deepEqual(visitaDelDia({ dia: 5 }, '2026-10-03').eventos, ['nuevo']);
});

test('fuera del sitio publicado no se carga nada', () => {
  const codigo = readFileSync(new URL('../public/js/medir.js', import.meta.url), 'utf8');
  assert.match(codigo, /location\.hostname !== HOST/);
  assert.match(codigo, /globalPrivacyControl/);
});

test('el embudo se calcula de los archivos de la analítica', () => {
  const pag = o => ({ js: { convPages: Object.fromEntries(Object.entries(o).map(([k, n]) => ['propio · ' + k, n])) } });
  const dias = {
    '2026-10-01': pag({ portada: 100, nuevo: 90, empieza: 80, 'fin-primera-1': 40, 'fin-primera-2': 20, 'reintento-1': 50, 'reintento-3': 31, comparte: 4, dominio: 2, vigilar: 1 }),
    '2026-10-02': { js: { convPages: { 'propio · vuelve-dia-siguiente': 18, 'externo · ejemplo.org': 7 } } },
  };
  const e = embudo(eventosPorDia(dias));
  const valor = paso => e.pasos.find(p => p.paso.startsWith(paso)).valor;
  assert.equal(e.conteos.termina, 60);
  assert.equal(valor('Termina la primera'), 0.75);
  assert.equal(valor('Vuelve al día siguiente'), 0.2);
  assert.equal(e.mediano, 3);
  assert.equal(valor('Comparte'), 0.05);
});
