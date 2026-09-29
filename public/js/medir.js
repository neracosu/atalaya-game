// La medición del embudo de la etapa 0 (GDD, partes 9 y 10) con la analítica propia de Atalaya (a.js).
// Solo se cuentan hechos con nombres fijos («empezó una partida», «compartió»): nada de puntos exactos, ni del
// dominio escrito, ni identificadores. Sin cookies. El único dato guardado en el teléfono es la fecha de la última
// visita y cuántos días distintos se jugó, y nunca sale del teléfono: solo se envía «volvió al día siguiente».
// Si el script no carga (bloqueador, sin red, una copia del juego en otro sitio), el juego funciona igual.

import { hoyEnVenezuela } from './reto.js';
import { tramoDeSalto } from './apertura.js';

const SCRIPT = 'https://atalaya.neracosu.com/a.js';
// el identificador público del sitio del juego en la analítica: va en la página de todos modos, no es un secreto
const SITIO = 'af8b4b1a6849';
// solo se mide en el sitio publicado: ni en localhost ni en las copias del juego (la licencia las permite)
const HOST = 'juego.atalaya.neracosu.com';
const CLAVE = 'guardia-visitas';
const DIA = 86400000;

// los únicos nombres que pueden salir; cualquier otro se descarta
export const EVENTOS = [
  'portada', 'nuevo', 'vuelve-dia-siguiente', 'vuelve-otro-dia', 'dias-3', 'dias-7',
  'empieza', 'reto', 'fin-primera-0', 'fin-primera-1', 'fin-primera-2', 'fin-primera-3',
  'fin-otra-0', 'fin-otra-1', 'fin-otra-2', 'fin-otra-3',
  'reintento-1', 'reintento-2', 'reintento-3', 'reintento-5', 'reintento-10',
  'comparte', 'comparte-puerta', 'dominio', 'vigilar', 'landing-atalaya', 'landing-empezar', 'toca-hora-2',
  // la apertura: si se vio entera o en qué tramo de tres segundos se saltó (0 el encendido, 3 el texto, 6 el
  // final del texto y el comienzo de la bajada, 9 la niebla, 12 el aterrizaje)
  'apertura-completa', 'apertura-saltada-0', 'apertura-saltada-3', 'apertura-saltada-6', 'apertura-saltada-9', 'apertura-saltada-12',
  // la primera partida: cuánto pasó desde el toque en «Tomar la guardia» hasta la primera jugada, en tramos
  'primera-jugada-0-2', 'primera-jugada-2-3', 'primera-jugada-3-5', 'primera-jugada-5-10', 'primera-jugada-mas-10',
];

// El tramo del tiempo hasta la primera jugada (en ms): nunca sale el número exacto
export function tramoDePrimeraJugada(ms) {
  const s = Math.max(0, Number(ms) || 0) / 1000;
  return s < 2 ? '0-2' : s < 3 ? '2-3' : s < 5 ? '3-5' : s < 10 ? '5-10' : 'mas-10';
}
const PERMITIDOS = new Set(EVENTOS);
const HITOS_REINTENTO = new Set([1, 2, 3, 5, 10]);
const UNA_VEZ = { compartir: 'comparte', 'compartir-puerta': 'comparte-puerta', dominio: 'dominio', 'ir-atalaya': 'vigilar', 'landing-atalaya': 'landing-atalaya', 'landing-empezar': 'landing-empezar', proxima: 'toca-hora-2' };

// La visita de hoy frente a la última que quedó guardada en el teléfono. Devuelve los eventos y lo nuevo a guardar.
export function visitaDelDia(guardado, hoy) {
  const g = guardado && typeof guardado.dia === 'string' ? guardado : null;
  if (!g) return { eventos: ['nuevo'], guardar: { dia: hoy, dias: 1 } };
  if (g.dia === hoy) return { eventos: [], guardar: g };
  const dias = Math.max(1, Math.min(9999, (g.dias | 0) || 1)) + 1;
  const salto = Math.round((Date.parse(hoy) - Date.parse(g.dia)) / DIA);
  const eventos = [salto === 1 ? 'vuelve-dia-siguiente' : 'vuelve-otro-dia'];
  if (dias === 3) eventos.push('dias-3');
  if (dias === 7) eventos.push('dias-7');
  return { eventos, guardar: { dia: hoy, dias } };
}

// Traduce lo que avisa app.js a los eventos del embudo, con el conteo de esta visita (en memoria, se pierde al
// cerrar la página). `enviar` recibe solo nombres de la lista EVENTOS.
export function crearMedidor(enviar) {
  let empezadas = 0, terminadas = 0;
  const hechos = new Set();
  const mandar = nombre => { if (PERMITIDOS.has(nombre)) enviar(nombre); };
  // el segundo argumento son las estrellas al terminar, el milisegundo en que se saltó la apertura o el que pasó
  // hasta la primera jugada (de los dos últimos solo sale el tramo)
  return function medir(evento, estrellas) {
    if (evento === 'partida' || evento === 'reto') {
      empezadas++;
      if (empezadas === 1) mandar('empieza');
      else if (HITOS_REINTENTO.has(empezadas - 1)) mandar('reintento-' + (empezadas - 1));
      if (evento === 'reto' && !hechos.has('reto')) { hechos.add('reto'); mandar('reto'); }
    } else if (evento === 'fin-peaje') {
      terminadas++;
      const e = Math.max(0, Math.min(3, estrellas | 0));
      mandar((terminadas === 1 ? 'fin-primera-' : 'fin-otra-') + e);
    } else if (evento === 'apertura-saltada' || evento === 'apertura-completa') {
      // una vez por visita, lo que haya pasado primero (se puede volver a ver desde los ajustes)
      if (hechos.has('apertura')) return;
      hechos.add('apertura');
      mandar(evento === 'apertura-completa' ? evento : 'apertura-saltada-' + tramoDeSalto(estrellas));
    } else if (evento === 'primera-jugada') {
      // una vez por visita: solo la partida que viene de la apertura corta la mide
      if (hechos.has(evento)) return;
      hechos.add(evento);
      mandar('primera-jugada-' + tramoDePrimeraJugada(estrellas));
    } else if (UNA_VEZ[evento] && !hechos.has(evento)) {
      hechos.add(evento);
      mandar(UNA_VEZ[evento]);
    }
  };
}

// ---------- en el navegador ----------
let cola = [], listo = false, apagado = true;
function enviar(nombre) {
  if (apagado) return;
  if (!listo) { if (cola.length < 40) cola.push(nombre); return; }
  try { window.atalaya('event', nombre); } catch { }
}

function arrancar() {
  if (typeof document === 'undefined' || location.hostname !== HOST) return;
  // quien pidió no ser seguido en su navegador no se cuenta
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1') return;
  apagado = false;
  const s = document.createElement('script');
  s.src = SCRIPT;
  s.async = true;
  s.setAttribute('data-site', SITIO);
  s.addEventListener('load', () => {
    if (typeof window.atalaya !== 'function') { apagado = true; cola = []; return; }
    listo = true;
    for (const n of cola) enviar(n);
    cola = [];
  });
  s.addEventListener('error', () => { apagado = true; cola = []; });
  document.head.append(s);

  enviar('portada');
  let guardado = null;
  try { guardado = JSON.parse(localStorage.getItem(CLAVE)); } catch { }
  const v = visitaDelDia(guardado, hoyEnVenezuela());
  try { localStorage.setItem(CLAVE, JSON.stringify(v.guardar)); } catch { return; } // sin almacenamiento no se sabe si volvió
  for (const n of v.eventos) enviar(n);
}

export const medir = crearMedidor(enviar);
try { arrancar(); } catch { }
