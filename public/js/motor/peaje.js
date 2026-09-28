// Motor de «El peaje». Solo lógica: nada de dibujo, de tiempo real ni de Math.random.
// Paso fijo de 30 por segundo y enteros en todo, para que la misma semilla y las mismas jugadas den siempre
// el mismo resultado en el navegador y en el servidor.
//
// Los autos llegan de a uno a la barrera. El jugador decide con el que está adelante: P (pasa) o B (bloquea).
// Si la fila se llena, el de adelante se cuela sin que nadie decida.

import { crearAzar } from './azar.js';

export const VERSION = 1;
export const PASOS_POR_SEGUNDO = 30;

// Qué es cada visita y qué hay que hacer con ella
export const TIPOS = {
  cliente: { bueno: true },
  dorado: { bueno: true },
  buscador: { bueno: true },
  sospechoso: { bueno: false },
  impostor: { bueno: false },
  wp: { bueno: false },
};

// Por qué estuvo mal cada error (el texto vive en textos.js)
const MOTIVO_BLOQUEO = { cliente: 'bloqueo-cliente', dorado: 'bloqueo-dorado', buscador: 'bloqueo-buscador' };
const MOTIVO_PASO = { sospechoso: 'paso-sospechoso', impostor: 'paso-impostor', wp: 'paso-wp' };

const MULTIPLICADOR = [1, 2, 3, 4, 6, 8];
const PUNTOS = 100;
const PUNTOS_DORADO = 200;
const PUNTOS_RAFAGA = 50;
const CASTIGO_BLOQUEO = 50;

// Cuánto tarda el auto en llegar a la barrera: el primero viene desde lejos, los demás solo avanzan un lugar
const LLEGADA_PRIMERO = 10;
const LLEGADA_AVANCE = 6;
const PAUSA_REGLA = 45; // un segundo y medio

// El nivel oficial de la noche. El reto del día parte de aquí y le cambia cosas.
export function nivelPeaje(semilla, cambios = {}) {
  return {
    motor: 'peaje',
    version: VERSION,
    semilla: semilla >>> 0,
    duracion: 60 * PASOS_POR_SEGUNDO,
    integridad: 5,
    fila: 5,
    // intervalo entre autos, en pasos: empieza tranquilo y termina lleno
    intervaloInicio: 48,
    intervaloFin: 20,
    // las reglas del boletín: cuándo llegan (en pasos) y qué autos traen consigo
    reglas: [
      { id: 'buscador', paso: 20 * PASOS_POR_SEGUNDO },
      { id: 'wp', paso: 40 * PASOS_POR_SEGUNDO },
    ],
    rafagas: 1,
    doradoMilesimas: 40,
    tutorial: false,
    asistido: false,
    ...cambios,
  };
}

export function crearPartida(nivel) {
  const azar = crearAzar(nivel.semilla);
  const lento = nivel.asistido ? 14 : 10; // el modo asistido estira los intervalos un 40 %
  // las ráfagas caen en momentos elegidos por la semilla, en la segunda mitad
  const rafagas = [];
  for (let i = 0; i < nivel.rafagas; i++) {
    const desde = (nivel.duracion * (45 + i * 20)) / 100 | 0;
    rafagas.push(desde + azar.entero(nivel.duracion / 8 | 0));
  }
  rafagas.sort((a, b) => a - b);
  return {
    nivel, azar, lento,
    paso: 0,
    siguienteId: 1,
    proximoAuto: 12,
    fila: [],          // { id, tipo, listoEn, rafaga }
    pendiente: null,   // una jugada hecha antes de que el auto llegue: se aplica al llegar
    reglas: nivel.reglas.filter(r => r.paso <= 0).map(r => r.id),
    rafagas,
    enRafaga: 0,       // autos de ráfaga que faltan por salir
    tutorial: nivel.tutorial ? ['cliente', 'sospechoso', 'cliente'] : [],
    pausa: 0,          // al llegar una regla nueva, el juego se detiene un momento para mostrarla
    puntos: 0,
    racha: 0,
    comboMax: 1,
    integridad: nivel.integridad,
    terminada: false,
    motivoFin: null,
    // para el resumen y la tarjeta
    aciertos: 0, falsosPositivos: 0, dejadosPasar: 0, colados: 0, decididos: 0,
    historial: [],     // 1 = bien, 0 = error, por cada auto resuelto
    jugadas: [],       // [paso, 'P' | 'B']: lo que se envía para volver a jugar la partida
  };
}

export function multiplicador(racha) {
  return MULTIPLICADOR[Math.min((racha / 5) | 0, MULTIPLICADOR.length - 1)];
}

function intervalo(p) {
  const n = p.nivel;
  const avance = Math.min(p.paso, n.duracion);
  const base = n.intervaloInicio - (((n.intervaloInicio - n.intervaloFin) * avance) / n.duracion | 0);
  const jitter = p.azar.entre(-(base / 4 | 0), base / 4 | 0);
  return ((base + jitter) * p.lento / 10) | 0;
}

function elegirTipo(p) {
  if (p.tutorial.length) return p.tutorial.shift();
  if (p.enRafaga > 0) return 'sospechoso';
  const bolsa = ['cliente', 'cliente', 'cliente', 'sospechoso', 'sospechoso'];
  if (p.reglas.includes('buscador')) bolsa.push('buscador', 'impostor');
  if (p.reglas.includes('wp')) bolsa.push('wp', 'wp');
  if (p.nivel.soloTipos) return p.nivel.soloTipos[p.azar.entero(p.nivel.soloTipos.length)];
  const tipo = bolsa[p.azar.entero(bolsa.length)];
  if (tipo === 'cliente' && p.azar.milesimas(p.nivel.doradoMilesimas)) return 'dorado';
  return tipo;
}

function alFrente(p, eventos, primero) {
  const auto = p.fila[0];
  if (!auto) return;
  auto.listoEn = p.paso + (primero ? LLEGADA_PRIMERO : LLEGADA_AVANCE);
  eventos.push({ e: 'frente', id: auto.id });
}

function resolver(p, auto, accion, eventos) {
  const bueno = TIPOS[auto.tipo].bueno;
  const pasa = accion === 'P';
  p.decididos++;
  if (bueno === pasa) {
    p.racha++;
    const mult = multiplicador(p.racha);
    if (mult > p.comboMax) p.comboMax = mult;
    let gana = (auto.tipo === 'dorado' ? PUNTOS_DORADO : PUNTOS) * mult;
    if (auto.rafaga) gana += PUNTOS_RAFAGA;
    p.puntos += gana;
    p.aciertos++;
    p.historial.push(1);
    eventos.push({ e: 'bien', id: auto.id, tipo: auto.tipo, accion, puntos: gana, mult, subeCombo: p.racha % 5 === 0 && p.racha <= 25 });
  } else if (bueno) {
    // bloqueó a alguien bueno: pierde puntos y combo, la torre no sufre
    p.racha = 0;
    p.puntos = Math.max(0, p.puntos - CASTIGO_BLOQUEO);
    p.falsosPositivos++;
    p.historial.push(0);
    eventos.push({ e: 'mal', id: auto.id, tipo: auto.tipo, accion, motivo: MOTIVO_BLOQUEO[auto.tipo], puntos: -CASTIGO_BLOQUEO });
  } else {
    // dejó pasar algo malo: la torre pierde integridad
    p.racha = 0;
    p.integridad--;
    p.dejadosPasar++;
    p.historial.push(0);
    eventos.push({ e: 'mal', id: auto.id, tipo: auto.tipo, accion, motivo: MOTIVO_PASO[auto.tipo], integridad: p.integridad });
  }
}

function salirDelFrente(p, eventos) {
  p.fila.shift();
  p.pendiente = null;
  alFrente(p, eventos, false);
}

// Una jugada del jugador en el paso actual. Devuelve true si se aceptó.
export function jugar(p, accion) {
  if (p.terminada || p.pausa > 0 || (accion !== 'P' && accion !== 'B')) return false;
  const ultimo = p.jugadas[p.jugadas.length - 1];
  if (ultimo && ultimo[0] === p.paso) return false; // una jugada por paso
  p.jugadas.push([p.paso, accion]);
  const auto = p.fila[0];
  if (auto && p.paso >= auto.listoEn) {
    p._jugadaAhora = accion;
  } else {
    p.pendiente = accion;
  }
  return true;
}

// Avanza un paso. Devuelve lo que pasó, para el dibujo y el sonido.
export function avanzar(p) {
  const eventos = [];
  if (p.terminada) return eventos;
  const n = p.nivel;
  if (p.pausa > 0) { p.pausa--; return eventos; }

  // las reglas del boletín que llegan en este paso
  for (const r of n.reglas) {
    if (r.paso === p.paso && !p.reglas.includes(r.id)) {
      p.reglas.push(r.id);
      p.pausa = PAUSA_REGLA;
      eventos.push({ e: 'regla', id: r.id });
    }
  }
  // empieza una ráfaga
  if (p.rafagas.length && p.paso >= p.rafagas[0] && !p.enRafaga) {
    p.rafagas.shift();
    p.enRafaga = 6;
    eventos.push({ e: 'rafaga' });
  }

  // la decisión sobre el auto de adelante
  const frente = p.fila[0];
  if (frente && p.paso >= frente.listoEn) {
    const accion = p._jugadaAhora || p.pendiente;
    p._jugadaAhora = null;
    if (accion) {
      resolver(p, frente, accion, eventos);
      salirDelFrente(p, eventos);
    }
  } else {
    p._jugadaAhora = null;
  }

  // llega un auto nuevo
  if (p.paso >= p.proximoAuto && p.paso < n.duracion - 20) {
    if (p.fila.length >= n.fila) {
      // la fila está llena: el de adelante se cuela
      const colado = p.fila[0];
      p.colados++;
      p.racha = 0;
      p.historial.push(TIPOS[colado.tipo].bueno ? 1 : 0);
      if (!TIPOS[colado.tipo].bueno) p.integridad--;
      eventos.push({ e: 'cuela', id: colado.id, tipo: colado.tipo, malo: !TIPOS[colado.tipo].bueno, integridad: p.integridad });
      salirDelFrente(p, eventos);
    }
    const auto = { id: p.siguienteId++, tipo: elegirTipo(p), listoEn: Infinity, rafaga: p.enRafaga > 0 };
    if (p.enRafaga > 0) p.enRafaga--;
    p.fila.push(auto);
    eventos.push({ e: 'llega', id: auto.id, tipo: auto.tipo, rafaga: auto.rafaga });
    if (p.fila.length === 1) alFrente(p, eventos, true);
    p.proximoAuto = p.paso + (auto.rafaga ? 8 : intervalo(p));
  }

  p.paso++;
  if (p.integridad <= 0) {
    p.terminada = true;
    p.motivoFin = 'integridad';
  } else if (p.paso >= n.duracion) {
    p.terminada = true;
    p.motivoFin = 'tiempo';
  }
  if (p.terminada) eventos.push({ e: 'fin', motivo: p.motivoFin });
  return eventos;
}

// Resumen de una partida terminada
export function resumen(p) {
  return {
    puntos: p.puntos,
    aciertos: p.aciertos,
    falsosPositivos: p.falsosPositivos,
    dejadosPasar: p.dejadosPasar,
    colados: p.colados,
    comboMax: p.comboMax,
    integridad: p.integridad,
    motivoFin: p.motivoFin,
    pasos: p.paso,
    historial: p.historial.slice(),
  };
}

// Vuelve a jugar una partida a partir del nivel y las jugadas. Es lo que haría el servidor.
export function volverAJugar(nivel, jugadas) {
  const p = crearPartida(nivel);
  let i = 0;
  while (!p.terminada) {
    // durante la pausa de una regla el paso no avanza y no se aceptan jugadas, igual que en vivo
    if (p.pausa === 0) {
      while (i < jugadas.length && jugadas[i][0] === p.paso) {
        if (!jugar(p, jugadas[i][1])) return null;
        i++;
      }
      if (i < jugadas.length && jugadas[i][0] < p.paso) return null; // jugadas fuera de orden: no es válida
    }
    avanzar(p);
  }
  return resumen(p);
}

// Umbrales de las estrellas del nivel oficial (se afinan jugando)
export const ESTRELLAS = [2000, 12000, 26000];

export function estrellasDe(puntos, umbrales = ESTRELLAS) {
  let n = 0;
  for (const u of umbrales) if (puntos >= u) n++;
  return n;
}
