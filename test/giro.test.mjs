// El giro de El peaje: solo en la primera victoria, un almacenamiento que falla no lo repite, el auto frena y da la
// vuelta en 2 a 4 s, un toque lo salta, y el puntaje es el mismo con y sin el giro (no toca el motor).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tocaGiro, marcarGiro, _olvidarGiro, crearGiro, autoDelGiro, textoDelGiro, finDelGiro, GUION_GIRO, CLAVE_GIRO } from '../public/js/giro.js';
import { nivelPeaje, volverAJugar, crearPartida, jugar, avanzar, resumen, estrellasDe } from '../public/js/motor/peaje.js';
import { jugarCon, perfecto, jugarSiempre } from './bots.mjs';
import { T } from '../public/js/textos.js';

function almacen() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
}
const roto = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('lleno'); } };

test('el giro: solo la primera vez que se gana (al menos una estrella), nunca en los reintentos', () => {
  _olvidarGiro();
  const a = almacen();
  assert.equal(tocaGiro(a, 0), false, 'sin estrellas no hay victoria');
  assert.equal(tocaGiro(a, 0), false);
  assert.equal(tocaGiro(a, 1), true, 'la primera victoria');
  marcarGiro(a);
  assert.equal(a.m.get(CLAVE_GIRO), '1');
  for (const e of [1, 2, 3]) assert.equal(tocaGiro(a, e), false, 'en los reintentos no aparece');
  // en otra visita, con lo guardado, tampoco
  _olvidarGiro();
  assert.equal(tocaGiro(a, 3), false);
  // y el de otro teléfono sí
  assert.equal(tocaGiro(almacen(), 2), true);
  _olvidarGiro();
});

test('el giro: si el almacenamiento falla, no rompe y no se repite en la misma visita', () => {
  _olvidarGiro();
  assert.equal(tocaGiro(roto, 1), true);
  assert.doesNotThrow(() => marcarGiro(roto));
  assert.equal(tocaGiro(roto, 1), false, 'la segunda victoria de la visita no lo repite');
  assert.equal(tocaGiro(roto, 3), false);
  // tampoco si ni siquiera hay almacenamiento
  _olvidarGiro();
  const sinAlmacen = () => { throw new Error('sin localStorage'); };
  assert.equal(tocaGiro(sinAlmacen, 1), true);
  marcarGiro(sinAlmacen);
  assert.equal(tocaGiro(sinAlmacen, 1), false);
  _olvidarGiro();
});

test('el giro: el auto llega, frena ante la barrera sin pasar y da la vuelta, en 2 a 4 s', () => {
  const G = GUION_GIRO;
  assert.ok(G.fuera >= 2000 && G.fuera <= 4000, `${G.fuera} ms`);
  assert.equal(autoDelGiro(0).pos, 0, 'entra desde fuera');
  let antes = -1;
  for (let t = 0; t < G.frena; t += 50) {
    const a = autoDelGiro(t);
    assert.ok(a.pos >= antes && a.pos <= 1 && a.mira === 1, 'avanza hacia la barrera');
    antes = a.pos;
  }
  // frena: los últimos pasos son más cortos que los primeros
  assert.ok(autoDelGiro(100).pos - autoDelGiro(0).pos > autoDelGiro(G.frena).pos - autoDelGiro(G.frena - 100).pos);
  // nunca pasa la barrera: pos 1 es el lugar del primero de la fila, delante de la barrera
  for (let t = 0; t < G.fuera; t += 25) { const a = autoDelGiro(t); if (a) assert.ok(a.pos <= 1); }
  // espera parado mientras el reloj cuenta
  assert.deepEqual(autoDelGiro(G.frena + 500), { pos: 1, mira: 1, espera: 500 - G.congela });
  // al frenar, la pausa de impacto: el mundo quieto y el reloj todavía en cero
  assert.ok(autoDelGiro(G.frena + 10).congelado && autoDelGiro(G.frena + 10).espera === 0);
  assert.ok(!autoDelGiro(G.frena + G.congela).congelado);
  assert.ok(G.congela <= 200, 'la pausa es corta');
  // da la vuelta y se va
  const vuelta = autoDelGiro(G.gira + 300);
  assert.equal(vuelta.mira, -1);
  assert.ok(autoDelGiro(G.fuera - 50).pos < vuelta.pos);
  assert.equal(autoDelGiro(G.fuera), null);
});

test('el giro: las dos líneas, letra por letra a no más de 20 por segundo, después del auto', () => {
  const L = T.giro.peaje;
  assert.deepEqual(L, ['No querían entrar. Querían saber qué contesta la puerta, y cuánto tarda.', 'Ya saben que aquí hay alguien despierto.']);
  const G = GUION_GIRO;
  assert.ok(G.letrasPorSegundo >= 5 && G.letrasPorSegundo <= 20);
  assert.deepEqual(textoDelGiro(G.linea1 - 1, L).letras, [0, 0], 'no antes de que el auto se vaya');
  assert.ok(G.linea1 >= G.gira, 'el texto llega cuando el auto ya dio la vuelta');
  const medio = textoDelGiro(G.linea1 + 1000, L);
  assert.ok(medio.letras[0] > 0 && medio.letras[0] <= 20 && medio.letras[1] === 0 && medio.escribiendo);
  const fin = finDelGiro(L);
  assert.deepEqual(textoDelGiro(fin - G.queda, L).letras, [L[0].length, L[1].length]);
  assert.equal(textoDelGiro(fin - G.queda, L).escribiendo, false);
});

test('el giro: termina una vez, por el guion o por un toque (no en el primer medio segundo)', () => {
  const L = T.giro.peaje;
  const fines = [];
  const g = crearGiro({ lineas: L, alTerminar: m => fines.push(m) });
  g.avanzar(100);
  assert.equal(g.saltar(), false, 'el jugador venía tocando: la guarda lo protege');
  g.avanzar(900);
  assert.equal(g.saltar(), true);
  assert.equal(g.saltar(), false);
  g.avanzar(g.fin + 1000);
  assert.deepEqual(fines, ['saltado']);
  const fines2 = [];
  const g2 = crearGiro({ lineas: L, alTerminar: m => fines2.push(m) });
  for (let t = 0; t <= g2.fin + 100; t += 16) g2.avanzar(t);
  assert.deepEqual(fines2, ['guion']);
});

test('el motor da el mismo puntaje con y sin el giro', () => {
  _olvidarGiro();
  for (const semilla of [1, 7, 20260929]) {
    const nivel = nivelPeaje(semilla);
    const { resumen: r, jugadas } = jugarCon(nivel, { reaccionMin: 6, reaccionMax: 14, error: 30, semillaBot: semilla });
    assert.ok(estrellasDe(r.puntos) >= 1, 'una victoria, para que toque el giro');
    // la misma partida, y al terminar corre el giro entero (como en app.js)
    const p = crearPartida(nivel);
    let i = 0;
    while (!p.terminada) {
      while (i < jugadas.length && jugadas[i][0] === p.paso && p.pausa === 0) jugar(p, jugadas[i++][1]);
      avanzar(p);
    }
    const antes = JSON.stringify(p);
    const a = almacen();
    assert.equal(tocaGiro(a, estrellasDe(resumen(p).puntos)), true);
    marcarGiro(a);
    const g = crearGiro({ lineas: T.giro.peaje });
    for (let t = 0; t <= g.fin; t += 16) g.avanzar(t);
    assert.equal(JSON.stringify(p), antes, 'el giro no toca la partida');
    assert.deepEqual(resumen(p), r);
    assert.deepEqual(volverAJugar(nivel, jugadas), r, 'y volver a jugarla da lo mismo');
    _olvidarGiro();
  }
  // el giro vive fuera del motor: ni el motor lo nombra ni el giro importa el motor
  const motor = readFileSync(new URL('../public/js/motor/peaje.js', import.meta.url), 'utf8');
  const giro = readFileSync(new URL('../public/js/giro.js', import.meta.url), 'utf8');
  assert.doesNotMatch(motor, /giro/i);
  assert.doesNotMatch(giro, /^import /m);
  // en app.js, el giro se decide después de cerrar el resumen y guardar
  const app = readFileSync(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const fin = app.slice(app.indexOf('function terminar()'));
  assert.ok(fin.indexOf('resumen(partida)') < fin.indexOf('tocaGiro(') && fin.indexOf('guardar(datos)') < fin.indexOf('tocaGiro('));
  // lo perfecto también gana, y una partida perdida no tiene giro
  assert.ok(estrellasDe(jugarSiempre(nivelPeaje(3), perfecto).resumen.puntos) >= 1);
  assert.equal(tocaGiro(almacen(), estrellasDe(jugarSiempre(nivelPeaje(3), () => 'P').resumen.puntos)), false);
});

test('el reloj de la barrera: lo que tardó la respuesta, en milisegundos enteros', () => {
  assert.equal(T.reloj(431.6), '432 ms');
  assert.equal(T.reloj(-5), '0 ms');
});
