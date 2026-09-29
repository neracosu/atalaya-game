// La apertura es una cinemática: sale solo la primera vez, lleva toda la historia (la línea de la hora solo de noche),
// se lee a un ritmo cómodo y al compás de la música, saltarla lleva a la partida sin que el toque cuente como jugada,
// y durante la partida no sale ningún texto de historia. Un almacenamiento que falla no rompe nada.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { debeVerse, marcarVista, crearControl, crearGuion, lineasDeApertura, letrasVisibles, alfaDe, esDeNoche, altura, niebla,
  inclinacion, tramoDeSalto, TRAMOS_SALTO, LECTURA, PULSO, CLAVE, _olvidar } from '../public/js/apertura.js';
import { notasApertura } from '../public/js/musica.js';
import { EVENTOS } from '../public/js/medir.js';
import { T } from '../public/js/textos.js';
import { numeroDeReto } from '../public/js/reto.js';

const leer = rel => readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
const H = T.apertura.historia;
const DE_DIA = { horas: 15, minutos: 20 }, DE_NOCHE = { horas: 23, minutos: 41 };
const lineas = (hora = DE_DIA) => lineasDeApertura(H, hora);
const guion = (hora = DE_DIA, quieto = false) => crearGuion(lineas(hora), { quieto });

function almacen() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
}
const roto = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('lleno'); } };

// un control con espías: cuántas veces arrancó la partida y cuántas terminó la apertura
function espiar(g = guion()) {
  const hechos = [];
  const c = crearControl({ guion: g, alEmpezarPartida: m => hechos.push(['partida', m]), alTerminar: m => hechos.push(['fin', m]) });
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

// ---- la historia, dentro de la cinemática ----
test('las líneas, en orden: la de la hora solo de noche, y cierra el cuaderno', () => {
  assert.equal(H.bajada, 'Medianoche. La vigía se fue sin avisar.');
  assert.equal(H.amenaza, 'El Enjambre ya está en la puerta.');
  assert.equal(H.objetivo, 'Cuídela hasta el amanecer.');
  assert.equal(H.pregunta, 'Ella sabía que venían. ¿Cómo?');
  const con = (horas, minutos = 0) => lineas({ horas, minutos }).map(l => l.id);
  for (const h of [22, 23, 0, 1, 3, 4]) assert.deepEqual(con(h, 41), ['bajada', 'amenaza', 'hora', 'objetivo', 'pregunta'], `${h}:41`);
  for (const h of [5, 6, 12, 18, 21]) assert.deepEqual(con(h, 59), ['bajada', 'amenaza', 'objetivo', 'pregunta'], `${h}:59`);
  assert.deepEqual(lineas(null).map(l => l.id), ['bajada', 'amenaza', 'objetivo', 'pregunta']);
  assert.equal(esDeNoche(21), false); assert.equal(esDeNoche(22), true); assert.equal(esDeNoche(4), true); assert.equal(esDeNoche(5), false);
  assert.equal(lineas({ horas: 0, minutos: 41 })[2].texto, 'Son las 00:41 donde está usted. Aquí también es de noche.');
  assert.equal(lineas({ horas: 1, minutos: 5 })[2].texto, 'Es la 01:05 donde está usted. Aquí también es de noche.');
  assert.equal(lineas({ horas: 4, minutos: 59 })[2].texto.slice(0, 13), 'Son las 04:59');
  // el cuaderno va solo con la última, y las dos últimas van arriba, en la bajada
  for (const L of [lineas(DE_DIA), lineas(DE_NOCHE)]) {
    assert.deepEqual(L.filter(l => l.cuaderno).map(l => l.id), ['pregunta']);
    assert.deepEqual(L.filter(l => l.arriba).map(l => l.id), ['objetivo', 'pregunta']);
  }
  // en el guion, en el mismo orden: cada línea empieza después de la anterior
  for (const g of [guion(DE_DIA), guion(DE_NOCHE)]) {
    for (let i = 1; i < g.lineas.length; i++) assert.ok(g.lineas[i].en > g.lineas[i - 1].en, g.lineas[i].id);
  }
});

test('se lee bien: de 5 a 20 letras por segundo y cada línea completa a la vista el tiempo de leerla', () => {
  assert.ok(LECTURA.letrasPorSegundo >= 5 && LECTURA.letrasPorSegundo <= 20);
  for (const hora of [DE_DIA, DE_NOCHE, { horas: 1, minutos: 5 }]) {
    const g = guion(hora);
    for (const l of g.lineas) {
      const completa = l.en + (l.texto.length * 1000) / g.letrasPorSegundo;
      assert.ok(completa <= l.completa + 1, l.id);
      assert.ok(l.sale - l.completa >= LECTURA.leer, `${l.id}: completa ${l.sale - l.completa} ms`);
      assert.ok(l.sale - l.en >= (l.texto.length * 1000) / LECTURA.ritmo, `${l.id}: a la vista ${l.sale - l.en} ms`);
      assert.ok(l.fuera > l.sale && alfaDe(l, l.completa) === 1 && alfaDe(l, l.fuera) === 0);
      // letra por letra: a mitad de camino, a medias
      const mitad = letrasVisibles((l.en + l.completa) / 2, g)[g.lineas.indexOf(l)];
      assert.ok(mitad > 0 && mitad < l.texto.length, l.id);
    }
    // desde el aire, todo se va con la bajada; arriba, una por vez y antes de aterrizar
    for (const l of g.lineas.filter(x => !x.arriba)) assert.ok(l.fuera <= g.bajada + LECTURA.salida, l.id);
    const arriba = g.lineas.filter(x => x.arriba);
    assert.ok(arriba[0].aparece >= g.bajada && arriba[1].aparece >= arriba[0].fuera && arriba[1].fuera <= g.aterriza);
    // las páginas del aire no se pisan: la de la hora entra cuando se fue la de las dos primeras
    const hLinea = g.lineas.find(l => l.id === 'hora');
    if (hLinea) assert.ok(hLinea.aparece >= g.lineas[1].fuera);
  }
});

test('al compás de la música: la bajada en un compás, tres compases hasta la barrera, y no pasa de 20 s', () => {
  const dia = guion(DE_DIA), noche = guion(DE_NOCHE);
  for (const g of [dia, noche]) {
    assert.equal((g.bajada - g.encender) % (4 * PULSO), 0, 'la bajada empieza con un compás');
    assert.equal(g.aterriza - g.bajada, 12 * PULSO);
    assert.equal(g.partida, g.aterriza);
    assert.ok(g.fin <= 20000, `${g.fin} ms`);
    // la música: el golpe de la bajada, el redoble y el aterrizaje, en los tiempos del guion
    const notas = notasApertura(g);
    const crash = notas.filter(n => n.voz === 'crash').map(n => n.t);
    assert.deepEqual(crash, [g.bajada / 1000, g.aterriza / 1000].map(x => Math.round(x * 10000) / 10000));
    assert.ok(notas.every(n => n.t <= g.aterriza / 1000));
  }
  // de día, tres compases desde el aire (como antes); con la línea de la hora, cinco
  assert.equal(dia.compasesLuz, 3);
  assert.equal(noche.compasesLuz, 5);
  assert.equal(dia.fin, 14740);
  assert.equal(noche.fin, 19060);
});

test('entera: la partida arranca una vez, al aterrizar, y la apertura termina una vez', () => {
  for (const g of [guion(DE_DIA), guion(DE_NOCHE)]) {
    const { c, hechos } = espiar(g);
    const golpes = [];
    for (let t = 0; t < g.partida; t += 16) golpes.push(...c.avanzar(t));
    assert.deepEqual(hechos, [], 'mientras baja, no hay partida');
    for (let t = g.partida; t <= g.fin + 500; t += 16) golpes.push(...c.avanzar(t));
    assert.deepEqual(hechos, [['partida', 'guion'], ['fin', 'guion']]);
    for (const x of ['encender', 'chispa', 'bajada', 'niebla', 'aterriza']) assert.equal(golpes.filter(y => y === x).length, 1, x);
    assert.ok(golpes.includes('letra'));
    assert.deepEqual(c.avanzar(g.fin + 1000), [], 'terminada no hace nada');
  }
});

test('saltarla lleva a la partida en el acto y se va con un fundido corto', () => {
  const g = guion(DE_NOCHE);
  const { c, hechos } = espiar(g);
  c.avanzar(0); c.avanzar(1200);
  assert.equal(c.saltar(), true);
  assert.deepEqual(hechos, [['partida', 'saltada']], 'la partida arranca al saltar');
  assert.equal(c.saltar(), false, 'se mide una sola vez');
  c.avanzar(1300);
  assert.ok(c.opacidad > 0 && c.opacidad < 1);
  c.avanzar(1200 + g.saltoFundido);
  assert.deepEqual(hechos, [['partida', 'saltada'], ['fin', 'saltada']]);
  assert.equal(c.terminada, true);
  assert.ok(g.saltoFundido <= 300);
  // después de saltar, no suena nada más de la apertura
  const { c: c2 } = espiar(g);
  c2.avanzar(0); c2.saltar();
  assert.deepEqual(c2.avanzar(g.aterriza + 10), []);
});

test('saltarla ya en la barrera no arranca otra partida', () => {
  const g = guion();
  const { c, hechos } = espiar(g);
  c.avanzar(0); c.avanzar(g.partida + 100);
  c.saltar();
  c.avanzar(g.fin);
  assert.deepEqual(hechos, [['partida', 'guion'], ['fin', 'saltada']]);
});

test('el reloj de seguridad juega igual aunque no lleguen cuadros', () => {
  const { c, hechos } = espiar();
  c.forzar(); c.forzar();
  assert.deepEqual(hechos, [['partida', 'forzada'], ['fin', 'forzada']]);
});

test('el salto se mide en tramos de tres segundos que están en la lista', () => {
  assert.equal(tramoDeSalto(0), 0);
  assert.equal(tramoDeSalto(2999), 0);
  assert.equal(tramoDeSalto(3000), 3);
  assert.equal(tramoDeSalto(17900), 15);
  assert.equal(tramoDeSalto(99999), 18);
  for (const n of TRAMOS_SALTO) assert.ok(EVENTOS.includes('apertura-saltada-' + n), n);
  // antes de que empiece la partida, cualquier salto cae en un tramo de la lista
  for (const g of [guion(DE_DIA), guion(DE_NOCHE)]) {
    for (let t = 0; t < g.partida; t += 250) assert.ok(TRAMOS_SALTO.includes(tramoDeSalto(t)));
  }
});

test('con menos movimiento: quieta, con todas las líneas a la vista el tiempo de leerlas y más corta', () => {
  for (const hora of [DE_DIA, DE_NOCHE]) {
    const q = guion(hora, true), g = guion(hora);
    assert.equal(q.quieto, true);
    assert.deepEqual(letrasVisibles(0, q), q.lineas.map(l => l.texto.length));
    assert.deepEqual(q.lineas.map(l => l.id), g.lineas.map(l => l.id), 'las mismas líneas nuevas');
    const letras = q.lineas.reduce((s, l) => s + l.texto.length, 0);
    assert.ok(q.frente >= (letras * 1000) / LECTURA.ritmo, 'el tiempo de leerlo todo');
    for (const t of [0, q.frente, q.fin]) { assert.equal(altura(t, q), 0); assert.equal(niebla(t, q), 0); }
    assert.equal(inclinacion(q.frente - 1, q), 0);
    const { c, hechos } = espiar(q);
    const golpes = [];
    for (let t = 0; t < q.fin; t += 50) golpes.push(...c.avanzar(t));
    golpes.push(...c.avanzar(q.fin));
    assert.ok(!golpes.includes('letra'));
    assert.deepEqual(hechos.map(h => h[0]), ['partida', 'fin']);
    assert.ok(q.fin < g.fin);
  }
});

// ---- en app.js: cuándo sale, el salto y la partida sin historia ----
test('app.js: la primera vez que se toma la guardia sale la cinemática entera, y desde los ajustes otra vez', () => {
  const app = leer('public/js/app.js');
  assert.match(app, /if \(debeVerse\(almacen\)\) verApertura\(tipo, \{ primera: true \}\);/);
  assert.match(app, /\$\('empezar'\)\.addEventListener\('click', \(\) => tomarGuardia\('partida'\)\)/);
  assert.match(app, /\$\('ver-apertura'\)\.addEventListener\('click', \(\) => verApertura\('partida'\)\)/);
  // se marca como vista al empezar, y la línea de la hora sale de la hora del teléfono
  assert.match(app, /marcarVista\(almacen\);/);
  assert.match(app, /lineasDeApertura\(T\.apertura\.historia, horaDelTelefono\(\)\)/);
  // la música va con el mismo guion
  assert.match(app, /m\.apertura\(guion\)/);
});

test('app.js: el toque que la salta no cuenta como jugada', () => {
  const app = leer('public/js/app.js'), css = leer('public/estilo.css'), html = leer('public/index.html');
  // la capa se queda el toque: no lo deja llegar a la partida ni lo convierte en jugada
  const capa = app.slice(app.indexOf("$('apertura').addEventListener"), app.indexOf("addEventListener('keydown'", app.indexOf("$('apertura').addEventListener")));
  assert.match(capa, /e\.stopPropagation\(\);/);
  assert.match(capa, /apertura\.saltar\(\)/);
  assert.doesNotMatch(capa, /tocarAbajo|soltarToque|decidir/);
  // ya saltada o yéndose, deja pasar los toques nuevos a la partida
  assert.match(css, /\.apertura\.sale \{ pointer-events: none; \}/);
  // Espacio, Enter y Escape la saltan, y ninguna tecla de jugar
  const teclas = app.slice(app.indexOf("addEventListener('keydown', e => {\n  if (!apertura) return;"));
  for (const k of ["' '", "'Enter'", "'Escape'"]) assert.ok(teclas.includes(`e.key === ${k}`), k);
  assert.doesNotMatch(teclas.slice(0, teclas.indexOf('}, true);')), /ArrowRight|ArrowLeft/);
  // el botón «Saltar»: un botón de verdad, dentro de la capa
  assert.match(html, /<div id="apertura"[^>]*>[\s\S]*<button id="apertura-saltar" class="saltar" type="button">Saltar<\/button>\s*<\/div>/);
  assert.match(css, /\.saltar \{[^}]*min-height: 44px;/);
  assert.equal(T.apertura.saltar, 'Saltar');
});

test('durante la partida no sale ningún texto de historia', () => {
  const app = leer('public/js/app.js'), html = leer('public/index.html'), css = leer('public/estilo.css');
  assert.doesNotMatch(html, /id="historia/);
  assert.doesNotMatch(css, /\.historia/);
  assert.doesNotMatch(app, /\$\('historia|crearHistoria|avanzarHistoria|verHistoria/);
  // la historia solo se lee para armar la apertura
  assert.deepEqual([...app.matchAll(/T\.apertura\.historia/g)].length, 1);
  // la ayuda de Chispa del tutorial sigue
  assert.match(app, /function ayuda\(tipo\)/);
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
