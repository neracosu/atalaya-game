// La apertura: «La torre vacía» en corto y «Bajar del cielo» (GDD, parte 6). Unos quince segundos que terminan
// dentro de la partida: la ciudad desde el aire, la luz, el texto, y la cámara que baja hasta la barrera.
// Aquí vive solo la lógica, sin pantalla, para poder probarla en Node: el guion como datos, si toca verla y el
// control del tiempo (avanzar, saltar). El dibujo está en dibujo/apertura.js, el sonido
// en sonido.js y la música en musica.js.

export const CLAVE = 'guardia-apertura';

// El guion, en milisegundos desde que empieza. Cada escena es un guion en datos.
// La música va al mismo compás: desde que se enciende la luz, cada tiempo dura PULSO ms (111 por minuto). La
// bajada empieza 12 tiempos después del encendido (tres compases) y aterriza 24 tiempos después (seis compases).
export const PULSO = 540;
const ENCENDER = 700;
export const GUION = {
  encender: ENCENDER,                  // se enciende la baliza de la torre
  barrido: 1100,                       // la luz empieza a barrer la ciudad
  enjambre: 1600,                      // aparecen los robots del Enjambre en los bordes
  chispa: 2200,                        // Chispa despierta
  linea1: 2500,                        // primera línea, letra por letra
  linea2: 4600,                        // segunda línea
  letrasPorSegundo: 20,                // el GDD pide de 5 a 20
  bajada: ENCENDER + 12 * PULSO,       // 7180: se va el texto y la cámara empieza a inclinarse
  inclinarFin: ENCENDER + 17 * PULSO,  // 9880: el plano de la ciudad ya se ve casi de costado
  niebla: ENCENDER + 16 * PULSO,       // 9340: entra la niebla, con la luz del haz
  frente: ENCENDER + 17 * PULSO + 270, // 10150: bajo la niebla, la vista de frente
  nieblaFin: ENCENDER + 19 * PULSO,    // 10960: se abre la niebla
  aterriza: ENCENDER + 24 * PULSO,     // 13660: la cámara llega a la barrera, el primer cuadro de la partida
  partida: ENCENDER + 24 * PULSO,      // arranca la partida debajo y la apertura se funde sobre ella
  fin: ENCENDER + 26 * PULSO,          // 14740
  saltoFundido: 260,                   // al saltarla, un fundido corto y a jugar
};

// Con «menos movimiento» (del sistema o de los ajustes): la ciudad desde el aire, quieta y con todo a la vista, se
// funde en la vista de frente, también quieta, y luego en la partida. Sin cámara que se mueva.
export const GUION_QUIETO = {
  quieto: true,
  encender: 0, barrido: 0, enjambre: 0, chispa: 0, linea1: 0, linea2: 0, letrasPorSegundo: Infinity,
  bajada: 2600, inclinarFin: 2600, niebla: 2600, frente: 2600, nieblaFin: 3400, aterriza: 3400,
  partida: 3800, fin: 4300, saltoFundido: 200,
};

// Las fases, en orden, para la medición y las pruebas
export const FASES = ['noche', 'luz', 'texto', 'bajada', 'niebla', 'frente', 'partida'];
export function faseDe(t, guion = GUION) {
  if (t >= guion.partida) return 'partida';
  if (t >= guion.nieblaFin) return 'frente';
  if (t >= guion.niebla) return 'niebla';
  if (t >= guion.bajada) return 'bajada';
  if (t >= guion.linea1) return 'texto';
  if (t >= guion.encender) return 'luz';
  return 'noche';
}

// La bajada, de 0 a 1: cuánto se inclinó el plano del aire (0 = desde arriba, 1 = casi de costado)
export function inclinacion(t, guion = GUION) {
  if (guion.quieto) return t >= guion.frente ? 1 : 0;
  return suave((t - guion.bajada) / (guion.inclinarFin - guion.bajada));
}
// Cuánto tapa la niebla (0 a 1). Llega a 1 justo cuando se cambia a la vista de frente.
export function niebla(t, guion = GUION) {
  if (guion.quieto || t < guion.niebla || t > guion.nieblaFin) return 0;
  // entra rápido (la cámara se mete en la nube), tapa del todo un instante en el cambio y se abre más despacio
  const lleno = guion.frente - 90;
  if (t < lleno) return suave((t - guion.niebla - 160) / (lleno - guion.niebla - 160));
  if (t < guion.frente + 60) return 1;
  return 1 - suave((t - guion.frente - 60) / (guion.nieblaFin - guion.frente - 60));
}
// Cuánto falta para aterrizar, de 1 (arriba, recién salida de la niebla) a 0 (en la barrera). Frena al llegar.
export function altura(t, guion = GUION) {
  if (guion.quieto) return 0;
  const p = Math.max(0, Math.min(1, (t - guion.frente) / (guion.aterriza - guion.frente)));
  return (1 - p) ** 3;
}
function suave(x) { return x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x); }

// El segundo en que se saltó, redondeado a tramos de tres segundos (el nombre del evento lo lleva).
// 0: el encendido; 3: el texto; 6: el final del texto y el comienzo de la bajada; 9: la niebla; 12: el aterrizaje.
export function tramoDeSalto(t) {
  const s = Math.max(0, Math.floor((t || 0) / 3000) * 3);
  return Math.min(12, s);
}

// ---- si toca verla: solo la primera vez ----
// El almacenamiento puede faltar o fallar (navegación privada, bloqueado, lleno): nunca rompe. Si no se puede
// guardar, se recuerda mientras la página esté abierta, para no repetirla en cada partida.
let vistaEnMemoria = false;

function almacenDe(obtener) {
  try { return typeof obtener === 'function' ? obtener() : obtener; } catch { return null; }
}

export function debeVerse(obtener) {
  if (vistaEnMemoria) return false;
  const a = almacenDe(obtener);
  try { return !(a && a.getItem(CLAVE)); } catch { return true; }
}

export function marcarVista(obtener) {
  vistaEnMemoria = true;
  const a = almacenDe(obtener);
  try { if (a) a.setItem(CLAVE, '1'); } catch { }
}

// solo para las pruebas: olvida lo recordado en memoria
export function _olvidar() { vistaEnMemoria = false; }

// ---- el texto letra por letra ----
// Cuántas letras de cada línea se ven en el instante t
export function letrasVisibles(t, lineas, guion = GUION) {
  const inicios = [guion.linea1, guion.linea2];
  return lineas.map((l, i) => {
    const desde = inicios[i] ?? inicios[inicios.length - 1];
    if (t < desde) return 0;
    if (!Number.isFinite(guion.letrasPorSegundo)) return l.length;
    return Math.min(l.length, Math.floor(((t - desde) * guion.letrasPorSegundo) / 1000));
  });
}

// ---- el control del tiempo ----
// avanzar(t) devuelve los golpes (para el sonido) que se cruzaron desde la última vez. La partida arranca una sola
// vez, sea por el guion, por un salto o por el reloj de seguridad; y termina una sola vez.
export function crearControl({ guion = GUION, lineas = [], alEmpezarPartida = () => { }, alTerminar = () => { } } = {}) {
  let t = 0, antes = -1, partida = false, terminada = false, finEn = guion.fin, saltada = false;
  const golpes = [['encender', guion.encender], ['chispa', guion.chispa], ['bajada', guion.bajada], ['niebla', guion.niebla], ['aterriza', guion.aterriza]];

  function empezarPartida(motivo) {
    if (partida) return;
    partida = true;
    alEmpezarPartida(motivo);
  }
  function terminar(motivo) {
    if (terminada) return;
    empezarPartida(motivo);
    terminada = true;
    alTerminar(motivo);
  }

  function avanzar(ahora) {
    if (terminada) return [];
    t = Math.max(t, ahora);
    const salen = [];
    if (!saltada) {
      for (const [nombre, en] of golpes) if (en > antes && en <= t) salen.push(nombre);
      // un golpecito por cada dos letras nuevas, sin contar espacios
      const ya = letrasVisibles(Math.max(0, antes), lineas, guion), ahoraL = letrasVisibles(t, lineas, guion);
      if (antes >= 0 && !guion.quieto) {
        lineas.forEach((l, i) => {
          for (let k = ya[i]; k < ahoraL[i]; k++) if (k % 2 === 0 && l[k] !== ' ') { salen.push('letra'); break; }
        });
      }
    }
    antes = t;
    if (t >= guion.partida) empezarPartida('guion');
    if (t >= finEn) terminar(saltada ? 'saltada' : 'guion');
    return salen;
  }

  // un toque, Espacio, Enter o Escape: la partida arranca ya, y la apertura se va con un fundido corto.
  // Devuelve true solo la primera vez (para medir el salto una sola vez).
  function saltar() {
    if (terminada || saltada) return false;
    saltada = true;
    empezarPartida('saltada');
    finEn = Math.min(finEn, t + guion.saltoFundido);
    return true;
  }

  // el reloj de seguridad: si los cuadros no llegan (pestaña en segundo plano, un teléfono lento), se juega igual
  function forzar() { terminar('forzada'); }

  return {
    avanzar, saltar, forzar,
    get t() { return t; },
    get saltada() { return saltada; },
    get partidaEmpezada() { return partida; },
    get terminada() { return terminada; },
    // cuánto se ve la apertura sobre la partida (1 = entera, 0 = ya no está)
    get opacidad() {
      if (saltada) return Math.max(0, Math.min(1, (finEn - t) / guion.saltoFundido));
      // ya en la barrera, la apertura se funde sobre la partida, que es el mismo cuadro
      return t < guion.partida ? 1 : 1 - suave((t - guion.partida) / (guion.fin - guion.partida));
    },
  };
}
