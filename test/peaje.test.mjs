import test from 'node:test';
import assert from 'node:assert/strict';
import { nivelPeaje, crearPartida, avanzar, volverAJugar, estrellasDe, ESTRELLAS } from '../public/js/motor/peaje.js';
import { semillaDe } from '../public/js/motor/azar.js';
import { jugarCon, jugarSiempre, perfecto } from './bots.mjs';

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
  // este novato es más lento que el del informe (hasta 1,3 s y 15 % de errores): desde que bloquear a un cliente
  // cuesta 200, gana la primera en 8 de cada 10 partidas (antes, 9)
  assert.ok(prom(novato) >= 0.75, 'un novato casi siempre gana la primera');
  assert.ok(prom(experto) > prom(bueno) && prom(bueno) > prom(novato));
  assert.ok(prom(bueno) < 2.9, 'la tercera no es regalada');
});

test('tocar siempre «bloquear» sin mirar no da estrellas', () => {
  let conEstrella = 0;
  const N = 200;
  for (let s = 1; s <= N; s++) {
    const { resumen } = jugarSiempre(nivelPeaje(s * 7919 + 13), () => 'B');
    if (estrellasDe(resumen.puntos) > 0) conEstrella++;
  }
  // con el castigo viejo (50) eran casi nueve de cada diez; hoy, alrededor de una de cada veinte
  assert.ok(conEstrella / N <= 0.1, `${conEstrella} de ${N} partidas con estrella`);
});

test('el modo asistido dura lo necesario para que lleguen los mismos autos', () => {
  const autos = r => r.aciertos + r.falsosPositivos + r.dejadosPasar + r.colados;
  let normal = 0, asistido = 0;
  for (let s = 1; s <= 40; s++) {
    const nivel = nivelPeaje(s * 7919);
    const a = jugarSiempre(nivel, perfecto), b = jugarSiempre({ ...nivel, asistido: true }, perfecto);
    normal += autos(a.resumen); asistido += autos(b.resumen);
    // la noche y el boletín se estiran lo mismo que los intervalos
    assert.equal(b.nivel.duracion, nivel.duracion * 14 / 10);
    assert.deepEqual(b.nivel.reglas.map(r => r.paso), nivel.reglas.map(r => r.paso * 14 / 10));
    // las estrellas cuentan igual: jugando perfecto, las tres también en asistido
    assert.equal(estrellasDe(b.resumen.puntos), 3, `semilla ${s}: ${b.resumen.puntos}`);
  }
  assert.ok(Math.abs(asistido - normal) / normal < 0.03, `${asistido} autos en asistido contra ${normal}`);
});

test('el modo asistido también se vuelve a jugar igual desde sus jugadas', () => {
  for (const s of [3, 404, 2026]) {
    const nivel = nivelPeaje(s, { asistido: true });
    const { resumen, jugadas } = jugarCon(nivel, { reaccionMin: 10, reaccionMax: 30, error: 80, semillaBot: s });
    assert.deepEqual(volverAJugar(nivel, jugadas), resumen);
  }
});
