// La apertura: sale solo la primera vez, saltarla lleva a la partida y un almacenamiento que falla no rompe nada.
// La corta se juega: el primer auto se puede decidir antes del segundo 3, y la historia se escribe solo en las pausas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { debeVerse, marcarVista, crearControl, letrasVisibles, altura, niebla, GUION, GUION_QUIETO, GUION_CORTO, GUION_CORTO_QUIETO,
  CLAVE, _olvidar, HISTORIA, esDeNoche, lineasDeHistoria, crearHistoria, avanzarHistoria, verHistoria, historiaEn } from '../public/js/apertura.js';
import { nivelPeaje, crearPartida, avanzar, PASOS_POR_SEGUNDO } from '../public/js/motor/peaje.js';
import { T } from '../public/js/textos.js';
import { numeroDeReto } from '../public/js/reto.js';

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
  assert.ok(GUION.partida < GUION.fin, 'la partida corre debajo antes de que la apertura se vaya');
  assert.ok(GUION.fin <= 16000, 'la larga dura unos quince segundos');
  for (const g of ['encender', 'chispa', 'bajada', 'niebla', 'aterriza']) assert.equal(golpes.filter(x => x === g).length, 1, g);
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
  assert.deepEqual(c2.avanzar(GUION.aterriza + 10), []);
});

test('saltarla ya en la barrera no arranca otra partida', () => {
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

test('la larga: el texto entra letra por letra, a no más de 20 por segundo, y termina antes de la bajada', () => {
  const [a, b] = T.apertura.lineas;
  assert.ok(GUION.letrasPorSegundo >= 5 && GUION.letrasPorSegundo <= 20);
  assert.deepEqual(letrasVisibles(GUION.linea1 - 1, [a, b]), [0, 0]);
  assert.deepEqual(letrasVisibles(GUION.linea1 + 500, [a, b]), [10, 0]);
  assert.ok(GUION.linea1 + (a.length * 1000) / GUION.letrasPorSegundo <= GUION.linea2, 'la primera termina antes de la segunda');
  assert.ok(GUION.linea2 + (b.length * 1000) / GUION.letrasPorSegundo <= GUION.bajada - 300, 'queda un respiro para leer');
  assert.deepEqual(letrasVisibles(GUION.bajada, [a, b]), [a.length, b.length]);
  // las dos primeras líneas de la historia nueva, no las viejas
  assert.deepEqual(T.apertura.lineas, [T.apertura.historia.bajada, T.apertura.historia.amenaza]);
  assert.doesNotMatch(T.apertura.lineas.join(' '), /bajo ataque/);
});

// ---- la corta ----
// cuántos milisegundos tarda el primer auto de la primera partida en quedar listo para decidir, según el motor
function msHastaElPrimerAuto() {
  const p = crearPartida(nivelPeaje(1, { tutorial: true }));
  while (!(p.fila[0] && p.paso >= p.fila[0].listoEn)) avanzar(p);
  return (p.paso * 1000) / PASOS_POR_SEGUNDO;
}

test('la corta: el primer toque posible cae hacia los 2,2 s y nunca después del segundo 3', () => {
  for (const guion of [GUION_CORTO, GUION_CORTO_QUIETO]) {
    const primer = guion.partida + msHastaElPrimerAuto();
    assert.ok(primer <= 3000, `${primer} ms`);
    assert.ok(primer >= 1900 && primer <= 2500, `hacia los 2,2 s: ${primer} ms`);
    // el auto asoma cuando la cámara ya llegó (o casi) y la apertura se va enseguida
    assert.ok(guion.partida < guion.aterriza && guion.aterriza <= 2000 && guion.fin <= primer);
  }
  // la bajada, en unos dos segundos: desde arriba hasta la barrera
  assert.equal(altura(0, GUION_CORTO), 1);
  assert.equal(altura(GUION_CORTO.aterriza, GUION_CORTO), 0);
  assert.ok(niebla(0, GUION_CORTO) > 0.5 && niebla(GUION_CORTO.nieblaFin, GUION_CORTO) === 0, 'sale de la niebla');
});

test('la corta: la partida arranca debajo antes de aterrizar y la apertura se funde al llegar', () => {
  const { c, hechos } = espiar(GUION_CORTO);
  const golpes = [];
  for (let t = 0; t < GUION_CORTO.partida; t += 16) golpes.push(...c.avanzar(t));
  assert.deepEqual(hechos, []);
  golpes.push(...c.avanzar(GUION_CORTO.partida));
  assert.deepEqual(hechos, [['partida', 'guion']]);
  assert.equal(c.opacidad, 1, 'hasta aterrizar tapa la partida');
  golpes.push(...c.avanzar((GUION_CORTO.aterriza + GUION_CORTO.fin) / 2));
  assert.ok(c.opacidad > 0 && c.opacidad < 1);
  golpes.push(...c.avanzar(GUION_CORTO.fin));
  assert.deepEqual(hechos, [['partida', 'guion'], ['fin', 'guion']]);
  assert.deepEqual(golpes.sort(), ['aterriza', 'encender'], 'sin golpes de la larga');
});

test('la corta: un toque en la bajada la acorta y la partida empieza en el acto', () => {
  const { c, hechos } = espiar(GUION_CORTO);
  c.avanzar(0); c.avanzar(300);
  assert.equal(c.saltar(), true);
  assert.deepEqual(hechos, [['partida', 'saltada']], 'la partida arranca con el toque');
  c.avanzar(300 + GUION_CORTO.saltoFundido);
  assert.equal(c.terminada, true, 'un fundido corto');
  assert.ok(GUION_CORTO.saltoFundido <= 250);
});

test('la corta con menos movimiento: sin cámara que se mueva ni niebla, y los mismos tiempos', () => {
  for (const t of [0, 500, 1000, 1800]) {
    assert.equal(altura(t, GUION_CORTO_QUIETO), 0);
    assert.equal(niebla(t, GUION_CORTO_QUIETO), 0);
  }
  assert.equal(GUION_CORTO_QUIETO.partida, GUION_CORTO.partida);
});

// ---- la historia en las pausas ----
const H = T.apertura.historia;
const lineas = (hora = null) => lineasDeHistoria(H, hora);
const texto = e => { const v = verHistoria(e); return v.texto.slice(0, v.letras); };

test('la historia: cuatro líneas en orden, la del cuaderno al final', () => {
  const L = lineas();
  assert.deepEqual(L.map(l => l.texto), [H.bajada, H.amenaza, H.objetivo, H.pregunta]);
  assert.equal(H.bajada, 'Medianoche. La vigía se fue sin avisar.');
  assert.equal(H.amenaza, 'El Enjambre ya está en la puerta.');
  assert.equal(H.objetivo, 'Cuídela hasta el amanecer.');
  assert.equal(H.pregunta, 'Ella sabía que venían. ¿Cómo?');
  assert.ok(L[3].cuaderno && !L[0].cuaderno);
});

test('la historia: la primera línea se escribe mientras baja la cámara, a no más de 20 letras por segundo', () => {
  assert.ok(HISTORIA.letrasPorSegundo >= 5 && HISTORIA.letrasPorSegundo <= 20);
  const e = historiaEn(1000, lineas());
  const v = verHistoria(e);
  assert.equal(v.id, 'bajada');
  assert.ok(v.letras > 0 && v.letras <= Math.floor(((1000 - HISTORIA.primera) * 20) / 1000));
  assert.equal(texto(e), H.bajada.slice(0, v.letras));
});

test('la historia: no se escribe mientras hay un auto esperando decisión; la línea espera donde iba', () => {
  // un acierto a los 2,5 s; desde los 4 s un auto espera y no se decide
  const hechos = [[2500, 'acierto'], [4000, 'espera']];
  const a = verHistoria(historiaEn(4000, lineas(), hechos));
  assert.equal(a.id, 'amenaza');
  assert.ok(a.letras > 0 && a.letras < H.amenaza.length, 'iba a medias');
  const b = verHistoria(historiaEn(9000, lineas(), hechos));
  assert.equal(b.id, 'amenaza');
  assert.equal(b.letras, a.letras, 'cinco segundos después, igual');
  // cuando el auto se decide, sigue desde ahí
  const c = verHistoria(historiaEn(9300, lineas(), [...hechos, [9000, 'libre']]));
  assert.ok(c.letras > a.letras);
  // y una línea no empieza mientras hay un auto esperando
  const d = verHistoria(historiaEn(6000, lineas(), [[2500, 'acierto'], [3000, 'espera']]));
  assert.notEqual(d.id, 'amenaza');
});

test('la historia: la amenaza espera el primer acierto y la pregunta no sale antes de los 12 s', () => {
  const sinAcierto = historiaEn(9000, lineas());
  assert.equal(sinAcierto.i, 1, 'sigue esperando el acierto');
  assert.equal(verHistoria(sinAcierto).id, null, 'la primera ya se fue');
  // un jugador sin pausas perdidas: acierto a los 2,3 s y siempre libre
  const hechos = [[2300, 'acierto']];
  let vioLaPregunta = null;
  for (let t = 0; t <= 20000; t += 50) {
    const v = verHistoria(historiaEn(t, lineas(), hechos, 50));
    if (v.id === 'pregunta' && vioLaPregunta === null) vioLaPregunta = t;
    if (v.id === 'pregunta') assert.equal(v.cuaderno, true);
  }
  assert.ok(vioLaPregunta >= 12000 && vioLaPregunta <= 15000, `${vioLaPregunta} ms`);
  // y al final se va
  assert.equal(historiaEn(30000, lineas(), hechos, 50).fin, true);
});

test('la historia: la línea de la hora solo entre las 22:00 y las 05:00, antes de la última', () => {
  const con = (horas, minutos = 0) => lineas({ horas, minutos }).map(l => l.id);
  for (const h of [22, 23, 0, 1, 3, 4]) assert.deepEqual(con(h, 41), ['bajada', 'amenaza', 'objetivo', 'hora', 'pregunta'], `${h}:41`);
  for (const h of [5, 6, 12, 18, 21]) assert.deepEqual(con(h, 59), ['bajada', 'amenaza', 'objetivo', 'pregunta'], `${h}:59`);
  assert.equal(esDeNoche(21), false); assert.equal(esDeNoche(22), true); assert.equal(esDeNoche(4), true); assert.equal(esDeNoche(5), false);
  assert.deepEqual(lineas(null).map(l => l.id), ['bajada', 'amenaza', 'objetivo', 'pregunta']);
  const hora = lineas({ horas: 0, minutos: 41 }).find(l => l.id === 'hora');
  assert.equal(hora.texto, 'Son las 00:41 donde está usted. Aquí también es de noche.');
  assert.equal(lineas({ horas: 1, minutos: 5 }).find(l => l.id === 'hora').texto, 'Es la 01:05 donde está usted. Aquí también es de noche.');
  assert.equal(lineas({ horas: 23, minutos: 7 }).find(l => l.id === 'hora').texto.slice(0, 13), 'Son las 23:07');
});

test('la historia: avanzar no toca el estado anterior (es una función pura)', () => {
  const e0 = crearHistoria(lineas());
  const copia = JSON.stringify(e0);
  const e1 = avanzarHistoria(e0, 2000, { esperando: false, acierto: true });
  assert.equal(JSON.stringify(e0), copia);
  assert.notEqual(e1, e0);
  assert.deepEqual(historiaEn(5000, lineas(), [[2500, 'acierto']]), historiaEn(5000, lineas(), [[2500, 'acierto']]));
});

test('app.js: la primera partida pasa por la apertura corta, y su toque llega a la partida', () => {
  const app = readFileSync(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.match(app, /debeVerse\(almacen\)\) verApertura\(tipo, \{ corta: true \}\)/);
  assert.match(app, /alEmpezarPartida: motivo => \{[^}]*try \{ jugar\(\); \}/);
  assert.match(app, /\$\('empezar'\)\.addEventListener\('click', \(\) => tomarGuardia\('partida'\)\)/);
  // «Ver la apertura» es la larga
  assert.match(app, /\$\('ver-apertura'\)\.addEventListener\('click', \(\) => verApertura\('partida'\)\)/);
  // en la corta, el toque que la salta es el mismo gesto de la partida
  assert.match(app, /if \(apertura\.corta\) tocarAbajo\(e\);\s*apertura\.saltar\(\);/);
  // Espacio, Enter y Escape la saltan
  for (const k of ["' '", "'Enter'", "'Escape'"]) assert.ok(app.includes(`e.key === ${k}`), k);
});

test('la tarjeta de la hora 3: dice que llega pronto, sin fecha, y ofrece el reto y las estrellas', () => {
  const P = T.proxima;
  assert.match(P.rotulo, /02:00 · Hora 3/);
  assert.match(P.titulo, /La cuarentena/);
  assert.equal(P.pronto, 'Llega pronto');
  // la pregunta que deja el giro del peaje, y el orden: la de las 02:00 llega antes que La patrulla (01:00)
  assert.equal(P.pregunta, 'Si la puerta principal no les abre, ¿por dónde van a probar?');
  assert.match(P.orden, /primera/);
  assert.match(P.orden, /01:00.*La patrulla.*después/);
  // sin jerga de lentes que un jugador nuevo no entiende
  assert.doesNotMatch(Object.values(P).filter(v => typeof v === 'string').join(' '), /Lente|Castillo/);
  // la numeración del reto de mañana: el de hoy más uno, igual que lo que dirá el reto al día siguiente
  const hoy = Date.UTC(2026, 8, 29, 19), manana = hoy + 86400000;
  assert.equal(P.retoManana(numeroDeReto(hoy) + 1), `Reto de mañana #${numeroDeReto(manana)}`);
  assert.equal(P.retoManana(numeroDeReto(hoy) + 1), 'Reto de mañana #3');
  assert.doesNotMatch(Object.values(P).filter(v => typeof v === 'string').join(' '), /\d{1,2} de [a-z]+|octubre|noviembre|semana/i, 'sin prometer fecha');
  assert.equal(P.retoMananaTexto('00:00', 3, false), 'Sale a medianoche. Lleva 3 días de racha: vuelva y súmele uno.');
  assert.equal(P.retoMananaTexto('21:00', 1, true), 'Sale hoy a las 21:00. Vuelva y su racha llega a 2 días.');
  assert.match(P.retoHoyTexto('Noche de ráfagas', 0), /empiece su racha/);
  assert.match(P.estrellasTexto(18450, 26000, 2), /tercera estrella pide 26/);
});
