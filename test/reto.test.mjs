// El reto del día y el tono de la noche real (datos/anoche.json). Todo debe salir igual para todos ese día.
import test from 'node:test';
import assert from 'node:assert/strict';
import { retoDeHoy, tonoDeAnoche, anocheDe, diaAnterior, conTono, hoyEnVenezuela } from '../public/js/reto.js';
import { nivelPeaje, volverAJugar, estrellasDe } from '../public/js/motor/peaje.js';
import { semillaDe } from '../public/js/motor/azar.js';
import { jugarCon } from './bots.mjs';

// 28 de septiembre de 2026 a las 15:00 de Venezuela
const HOY = Date.UTC(2026, 8, 28, 19);
const FECHA = '2026-09-28';
const ANOCHE = '2026-09-27';
const noche = (robots, intentos, visitas, fecha = ANOCHE) => ({ fecha, robots, intentos, visitas });

test('la fecha del reto y la noche de ayer', () => {
  assert.equal(hoyEnVenezuela(HOY), FECHA);
  assert.equal(diaAnterior(FECHA), ANOCHE);
  assert.equal(diaAnterior('2026-10-01'), '2026-09-30');
  assert.equal(diaAnterior('2027-01-01'), '2026-12-31');
});

test('sin archivo, el reto es el de siempre', () => {
  const a = retoDeHoy(HOY), b = retoDeHoy(HOY, null);
  assert.equal(a.tono, null);
  assert.deepEqual(a, b);
  // el mismo nivel que se armaba antes de que existiera el tono
  const semilla = semillaDe('reto-' + FECHA);
  assert.equal(a.nivel.semilla, semilla);
  assert.deepEqual(Object.keys(a.nivel).sort(), Object.keys(nivelPeaje(semilla)).sort());
});

test('un archivo viejo, del futuro o mal hecho no cambia el reto', () => {
  const normal = retoDeHoy(HOY);
  for (const d of [
    noche(5000, 9000, 90000, '2026-09-26'),
    noche(5000, 9000, 90000, FECHA),
    { fecha: ANOCHE, robots: '5000', intentos: 9000, visitas: 90000 },
    { fecha: ANOCHE, robots: 5000.5, intentos: 9000, visitas: 90000 },
    { fecha: ANOCHE, robots: -1, intentos: 9000, visitas: 90000 },
    { fecha: ANOCHE, robots: 5000, intentos: 9000 },
    { fecha: 'ayer', robots: 5000, intentos: 9000, visitas: 90000 },
    [], 'texto', 42,
  ]) {
    assert.equal(anocheDe(FECHA, d), null, JSON.stringify(d));
    assert.deepEqual(retoDeHoy(HOY, d), normal, JSON.stringify(d));
  }
});

test('una noche tranquila deja el reto normal', () => {
  assert.equal(tonoDeAnoche(FECHA, noche(150, 900, 4000)), null);
  assert.deepEqual(retoDeHoy(HOY, noche(150, 900, 4000)), retoDeHoy(HOY));
});

test('manda la cifra que más se pasó de su noche de referencia', () => {
  assert.equal(tonoDeAnoche(FECHA, noche(1800, 1500, 9000)).id, 'rafaga');
  assert.equal(tonoDeAnoche(FECHA, noche(300, 7000, 9000)).id, 'asedio');
  assert.equal(tonoDeAnoche(FECHA, noche(300, 1500, 40000)).id, 'clientela');
});

test('la intensidad crece con la cifra y tiene tope', () => {
  const k = r => tonoDeAnoche(FECHA, noche(r, 0, 0)).intensidad;
  assert.equal(k(250), 1);
  assert.equal(k(600), 2);
  assert.equal(k(1200), 3);
  assert.equal(k(900000000), 3);
  const t = tonoDeAnoche(FECHA, noche(1800, 0, 0));
  assert.deepEqual(t, { id: 'rafaga', cifra: 1800, intensidad: 3 });
});

test('el tono ajusta la mezcla sin salirse de lo que el motor conoce', () => {
  const base = nivelPeaje(123);
  const rafaga = conTono(base, { id: 'rafaga', intensidad: 2 });
  assert.equal(rafaga.rafagas, base.rafagas + 2);
  assert.equal(conTono({ ...base, rafagas: 2 }, { id: 'rafaga', intensidad: 3 }).rafagas, 3, 'tope de tres ráfagas');
  const asedio = conTono(base, { id: 'asedio', intensidad: 3 });
  assert.ok(asedio.intervaloFin < base.intervaloFin && asedio.intervaloFin >= 14);
  assert.ok(asedio.fila >= 3);
  const clientela = conTono(base, { id: 'clientela', intensidad: 1 });
  assert.ok(clientela.doradoMilesimas > base.doradoMilesimas);
  assert.ok(clientela.intervaloInicio > clientela.intervaloFin);
  // no cambia la semilla, la versión ni las reglas, y no toca el original
  for (const n of [rafaga, asedio, clientela]) {
    assert.equal(n.semilla, base.semilla);
    assert.equal(n.version, base.version);
    assert.deepEqual(n.reglas, base.reglas);
  }
  assert.deepEqual(base, nivelPeaje(123));
});

test('el mismo día y las mismas cifras dan el mismo reto, en cualquier momento del día', () => {
  const d = noche(1800, 2600, 12000);
  const temprano = retoDeHoy(Date.UTC(2026, 8, 28, 4, 1), d);   // 00:01 de Venezuela
  const tarde = retoDeHoy(Date.UTC(2026, 8, 29, 3, 59), d);  // 23:59 de Venezuela
  assert.equal(temprano.fecha, FECHA);
  assert.equal(tarde.fecha, FECHA);
  assert.deepEqual(temprano, tarde);
  assert.deepEqual(retoDeHoy(HOY, { ...d }), retoDeHoy(HOY, d));
  assert.notDeepEqual(retoDeHoy(HOY, d).nivel, retoDeHoy(HOY).nivel);
});

test('el reto con tono se vuelve a jugar igual desde sus jugadas', () => {
  const noches = [noche(1800, 900, 5000), noche(200, 9000, 5000), noche(200, 900, 60000), noche(700, 3000, 11000)];
  for (let i = 0; i < 8; i++) {
    const ahora = HOY + i * 86400000;
    const fecha = hoyEnVenezuela(ahora);
    for (const n of noches) {
      const reto = retoDeHoy(ahora, { ...n, fecha: diaAnterior(fecha) });
      assert.ok(reto.tono, `${fecha} tiene tono`);
      const a = jugarCon(reto.nivel, { reaccionMin: 6, reaccionMax: 22, error: 60, semillaBot: i + 1 });
      const b = jugarCon(reto.nivel, { reaccionMin: 6, reaccionMax: 22, error: 60, semillaBot: i + 1 });
      assert.deepEqual(a, b);
      assert.deepEqual(volverAJugar(reto.nivel, a.jugadas), a.resumen);
    }
  }
});

test('con el tono más fuerte, un buen jugador todavía gana estrellas', () => {
  for (const id of ['rafaga', 'asedio', 'clientela']) {
    const suma = [];
    for (let s = 1; s <= 12; s++) {
      const nivel = conTono(nivelPeaje(s * 7919, { fila: 3 }), { id, intensidad: 3 });
      suma.push(estrellasDe(jugarCon(nivel, { reaccionMin: 10, reaccionMax: 22, error: 40, semillaBot: s }).resumen.puntos));
    }
    const prom = suma.reduce((x, y) => x + y, 0) / suma.length;
    assert.ok(prom >= 1, `${id}: ${prom}`);
  }
});
