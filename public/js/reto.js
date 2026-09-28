// El reto del día: el mismo nivel y los mismos cambios para todos, que cambian a la medianoche de Venezuela.
// En esta etapa no hay tabla: el primer intento, la racha y la tarjeta se guardan en el teléfono.

import { semillaDe } from './motor/azar.js';
import { nivelPeaje, PASOS_POR_SEGUNDO } from './motor/peaje.js';

const INICIO = Date.UTC(2026, 9, 1, 4); // reto #1: 1 de octubre de 2026, medianoche de Venezuela (UTC-4)
const DIA = 86400000;

// La fecha de hoy en Venezuela, como «2026-10-01»
export function hoyEnVenezuela(ahora = Date.now()) {
  return new Date(ahora - 4 * 3600000).toISOString().slice(0, 10);
}

export function numeroDeReto(ahora = Date.now()) {
  return Math.max(1, Math.floor((ahora - INICIO) / DIA) + 1);
}

// Los cambios posibles. La semilla del día elige uno.
const CAMBIOS = [
  { id: 'impostores', nivel: { reglas: [{ id: 'buscador', paso: 0 }, { id: 'wp', paso: 40 * PASOS_POR_SEGUNDO }] } },
  { id: 'rafagas', nivel: { rafagas: 2 } },
  { id: 'prisa', nivel: { fila: 3 } },
  { id: 'wordpress', nivel: { reglas: [{ id: 'wp', paso: 0 }, { id: 'buscador', paso: 30 * PASOS_POR_SEGUNDO }] } },
];

export function retoDeHoy(ahora = Date.now()) {
  const fecha = hoyEnVenezuela(ahora);
  const semilla = semillaDe('reto-' + fecha);
  const cambio = CAMBIOS[semilla % CAMBIOS.length];
  return { fecha, numero: numeroDeReto(ahora), cambio: cambio.id, nivel: nivelPeaje(semilla, cambio.nivel) };
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
