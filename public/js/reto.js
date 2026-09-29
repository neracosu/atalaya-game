// El reto del día: el mismo nivel y los mismos cambios para todos, que cambian a la medianoche de Venezuela.
// En esta etapa no hay tabla: el primer intento, la racha y la tarjeta se guardan en el teléfono.

import { semillaDe } from './motor/azar.js';
import { nivelPeaje, PASOS_POR_SEGUNDO } from './motor/peaje.js';

const INICIO = '2026-09-28'; // reto #1: el día en que se publicó el juego, en Venezuela
const DIA = 86400000;

// La fecha de hoy en Venezuela, como «2026-10-01»
export function hoyEnVenezuela(ahora = Date.now()) {
  return new Date(ahora - 4 * 3600000).toISOString().slice(0, 10);
}

// El número sale de la fecha de Venezuela, igual que la semilla: cambia a la misma medianoche que el reto
export function numeroDeReto(ahora = Date.now()) {
  return Math.max(1, Math.round((Date.parse(hoyEnVenezuela(ahora)) - Date.parse(INICIO)) / DIA) + 1);
}

// Los cambios posibles. La semilla del día elige uno.
const CAMBIOS = [
  { id: 'impostores', nivel: { reglas: [{ id: 'buscador', paso: 0 }, { id: 'wp', paso: 40 * PASOS_POR_SEGUNDO }] } },
  { id: 'rafagas', nivel: { rafagas: 2 } },
  { id: 'prisa', nivel: { fila: 3 } },
  { id: 'wordpress', nivel: { reglas: [{ id: 'wp', paso: 0 }, { id: 'buscador', paso: 30 * PASOS_POR_SEGUNDO }] } },
];

// El reto de hoy. Si llega la noche real de ayer (datos/anoche.json), el reto toma su tono: la misma semilla y el
// mismo cambio, con la mezcla o la intensidad que marcan esas cifras. Sin archivo, o con uno viejo, el reto normal.
export function retoDeHoy(ahora = Date.now(), anoche = null) {
  const fecha = hoyEnVenezuela(ahora);
  const semilla = semillaDe('reto-' + fecha);
  const cambio = CAMBIOS[semilla % CAMBIOS.length];
  const tono = tonoDeAnoche(fecha, anoche);
  const nivel = nivelPeaje(semilla, cambio.nivel);
  return { fecha, numero: numeroDeReto(ahora), cambio: cambio.id, tono, nivel: tono ? conTono(nivel, tono) : nivel };
}

// ---- el tono de la noche real ----
// Cada cifra de anoche se compara con una noche de referencia (en centésimas, solo enteros). Manda la que más se
// pasó de la suya; si ninguna llega a la mitad de su referencia, fue una noche tranquila y el reto queda normal.
//   robots frenados -> «la ráfaga»: más ráfagas de autos sospechosos
//   intentos de entrar -> «el asedio»: el final llega más apretado
//   visitas que pasaron -> «la clientela»: más clientes que vienen a comprar, y más seguido
const REFERENCIA = { robots: 400, intentos: 2000, visitas: 10000 };
const TONOS = [['rafaga', 'robots'], ['asedio', 'intentos'], ['clientela', 'visitas']];
const TOPE = 1e9;

export function diaAnterior(fecha) {
  return new Date(Date.parse(fecha + 'T00:00:00Z') - DIA).toISOString().slice(0, 10);
}

// El archivo sirve solo si es de la noche de ayer y trae las tres cifras como enteros razonables
export function anocheDe(fecha, d) {
  if (!d || typeof d !== 'object' || typeof d.fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) return null;
  if (d.fecha !== diaAnterior(fecha)) return null;
  for (const k of ['intentos', 'robots', 'visitas']) if (!Number.isInteger(d[k]) || d[k] < 0 || d[k] >= TOPE) return null;
  return d;
}

// null, o { id, cifra, intensidad (1 a 3) }. Lo decide solo la fecha y las cifras: es el mismo para todos ese día.
export function tonoDeAnoche(fecha, anoche) {
  const d = anocheDe(fecha, anoche);
  if (!d) return null;
  // el empate lo desempata la fecha, no el orden de las claves
  const inicio = semillaDe('tono-' + fecha) % TONOS.length;
  let mejor = null;
  for (let i = 0; i < TONOS.length; i++) {
    const [id, clave] = TONOS[(inicio + i) % TONOS.length];
    const centesimas = Math.floor((d[clave] * 100) / REFERENCIA[clave]);
    if (!mejor || centesimas > mejor.centesimas) mejor = { id, clave, centesimas };
  }
  if (mejor.centesimas < 50) return null;
  const intensidad = mejor.centesimas >= 300 ? 3 : mejor.centesimas >= 150 ? 2 : 1;
  return { id: mejor.id, cifra: d[mejor.clave], intensidad };
}

// El nivel del reto con el tono aplicado. Solo toca números que el motor ya conoce, con topes.
export function conTono(nivel, tono) {
  const n = { ...nivel };
  const k = tono.intensidad;
  if (tono.id === 'rafaga') {
    n.rafagas = Math.min(3, n.rafagas + (k >= 2 ? 2 : 1));
    if (k === 3) n.intervaloFin = Math.max(16, n.intervaloFin - 2);
  } else if (tono.id === 'asedio') {
    n.intervaloFin = Math.max(14, n.intervaloFin - 2 * k);
    if (k === 3) n.fila = Math.max(3, n.fila - 1);
  } else if (tono.id === 'clientela') {
    n.doradoMilesimas = n.doradoMilesimas + 40 * k;
    n.intervaloInicio = Math.max(n.intervaloFin + 12, n.intervaloInicio - 4 * k);
  }
  return n;
}

// Lee datos/anoche.json una vez. Si el que tiene no es de la noche de ayer (pasó la medianoche con la página
// abierta), lo vuelve a pedir, como mucho una vez por minuto. Nunca falla: sin archivo devuelve null.
let anocheLeida = null, anocheAl = 0;
export async function cargarAnoche(fecha = hoyEnVenezuela()) {
  if (anocheLeida) {
    const d = await anocheLeida;
    if (anocheDe(fecha, d) || Date.now() - anocheAl < 60000) return d;
  }
  anocheAl = Date.now();
  anocheLeida = fetch('datos/anoche.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null);
  return anocheLeida;
}

// ---- lo que se guarda en el teléfono (puede fallar: navegación privada, almacenamiento bloqueado) ----
const CLAVE = 'guardia-v1';

export function leer() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch { return {}; }
}
export function guardar(datos) {
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch { }
}

// La racha perdona un día sin jugar: se corta solo si pasan dos días seguidos sin el reto.
export function rachaActual(datos, fecha) {
  if (!datos.ultimoReto || !datos.racha) return 0;
  const dias = Math.round((Date.parse(fecha) - Date.parse(datos.ultimoReto)) / DIA);
  return dias <= 2 ? datos.racha : 0;
}

export function registrarReto(datos, fecha, resultado) {
  if (datos.retos && datos.retos[fecha]) return datos; // solo cuenta el primer intento
  const antes = rachaActual(datos, fecha);
  const nuevo = { ...datos, retos: { ...(datos.retos || {}) } };
  nuevo.retos[fecha] = resultado;
  nuevo.racha = datos.ultimoReto === fecha ? antes : antes + 1;
  nuevo.ultimoReto = fecha;
  return nuevo;
}

// Los bloques de la tarjeta: uno por cada cinco autos. Lleno si los cinco salieron bien, vacío si hubo un error.
export function bloques(historial) {
  let s = '';
  for (let i = 0; i < historial.length; i += 5) {
    const tramo = historial.slice(i, i + 5);
    s += tramo.every(x => x === 1) ? '■' : '□';
  }
  return s;
}
