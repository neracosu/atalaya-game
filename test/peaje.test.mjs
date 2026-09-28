import test from 'node:test';
import assert from 'node:assert/strict';
import { nivelPeaje, crearPartida, avanzar, volverAJugar, estrellasDe, ESTRELLAS } from '../public/js/motor/peaje.js';
import { semillaDe } from '../public/js/motor/azar.js';
import { jugarCon } from './bots.mjs';

test('la misma semilla y las mismas jugadas dan siempre lo mismo', () => {
  const nivel = nivelPeaje(12345);
  const a = jugarCon(nivel, { reaccionMin: 8, reaccionMax: 20, error: 60 });
  const b = jugarCon(nivel, { reaccionMin: 8, reaccionMax: 20, error: 60 });
  assert.deepEqual(a, b);
});

test('volver a jugar la partida desde sus jugadas da el mismo resultado', () => {
  for (const s of [1, 99, 2026, semillaDe('reto-2026-09-28')]) {
    const nivel = nivelPeaje(s);
    const { resumen, jugadas } = jugarCon(nivel, { reaccionMin: 5, reaccionMax: 25, error: 80, semillaBot: s });
    assert.deepEqual(volverAJugar(nivel, jugadas), resumen);
  }
});

test('jugadas fuera de orden no son válidas', () => {
  assert.equal(volverAJugar(nivelPeaje(5), [[100, 'P'], [50, 'B']]), null);
});

test('sin jugar, los autos se cuelan y la torre cae', () => {
  const p = crearPartida(nivelPeaje(3));
  while (!p.terminada) avanzar(p);
  assert.equal(p.motivoFin, 'integridad');
  assert.ok(p.colados > 0);
});

test('la lógica usa solo enteros', () => {
  const p = crearPartida(nivelPeaje(77));
  while (!p.terminada) {
    avanzar(p);
    for (const k of ['puntos', 'racha', 'integridad', 'paso', 'proximoAuto']) assert.ok(Number.isInteger(p[k]), k);
  }
});

test('las estrellas: la primera es fácil, la tercera pide dominar el nivel', () => {
  const novato = [], bueno = [], experto = [];
  for (let s = 1; s <= 30; s++) {
    const nivel = nivelPeaje(s * 7919);
    novato.push(estrellasDe(jugarCon(nivel, { reaccionMin: 18, reaccionMax: 40, error: 150, semillaBot: s }).resumen.puntos));
    bueno.push(estrellasDe(jugarCon(nivel, { reaccionMin: 10, reaccionMax: 22, error: 40, semillaBot: s }).resumen.puntos));
    experto.push(estrellasDe(jugarCon(nivel, { reaccionMin: 5, reaccionMax: 12, error: 10, semillaBot: s }).resumen.puntos));
  }
  const prom = a => a.reduce((x, y) => x + y, 0) / a.length;
  console.log('estrellas promedio', { novato: prom(novato), bueno: prom(bueno), experto: prom(experto), umbrales: ESTRELLAS });
  assert.ok(prom(novato) >= 0.8, 'un novato casi siempre gana la primera');
  assert.ok(prom(experto) > prom(bueno) && prom(bueno) > prom(novato));
  assert.ok(prom(bueno) < 2.9, 'la tercera no es regalada');
});
