// La apertura: «La torre vacía» en corto (GDD, parte 6). Unos ocho segundos que terminan dentro de la partida.
// Aquí vive solo la lógica, sin pantalla, para poder probarla en Node: el guion como datos, si toca verla y el
// control del tiempo (avanzar, saltar). El dibujo está en dibujo/apertura.js y el sonido en sonido.js.

export const CLAVE = 'guardia-apertura';

// El guion, en milisegundos desde que empieza. Cada escena es un guion en datos.
export const GUION = {
  encender: 700,      // se enciende la baliza de la torre
  barrido: 1100,      // la luz empieza a barrer la ciudad
  enjambre: 1600,     // aparecen los robots del Enjambre en los bordes
  chispa: 2200,       // Chispa despierta
  linea1: 2500,       // primera línea, letra por letra
  linea2: 4600,       // segunda línea
  letrasPorSegundo: 20, // el GDD pide de 5 a 20
  partida: 7000,      // arranca la partida debajo; la luz destella y se abre sobre ella
  destello: 7000,
  fin: 8100,
  saltoFundido: 260,  // al saltarla, un fundido corto y a jugar
};

// Con «menos movimiento» (del sistema o de los ajustes): un cuadro quieto con todo a la vista y un fundido suave
export const GUION_QUIETO = {
  quieto: true,
  encender: 0, barrido: 0, enjambre: 0, chispa: 0, linea1: 0, linea2: 0, letrasPorSegundo: Infinity,
  partida: 3000, destello: 3000, fin: 3450, saltoFundido: 200,
};

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
  const golpes = [['encender', guion.encender], ['chispa', guion.chispa], ['destello', guion.destello]];

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

  // un toque, Espacio, Enter o Escape: la partida arranca ya, y la apertura se va con un fundido corto
  function saltar() {
    if (terminada || saltada) return;
    saltada = true;
    empezarPartida('saltada');
    finEn = Math.min(finEn, t + guion.saltoFundido);
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
      if (guion.quieto) return t < guion.partida ? 1 : Math.max(0, 1 - (t - guion.partida) / (guion.fin - guion.partida));
      return 1;
    },
  };
}
