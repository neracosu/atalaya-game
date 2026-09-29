// La apertura: «La torre vacía» y «Bajar del cielo» (GDD, parte 6), como una cinemática. Sale la primera vez que se
// toma la guardia: la ciudad desde el aire, la baliza que se enciende y barre, la historia letra por letra y la
// cámara que baja del cielo hasta la barrera, donde se funde en la partida. Toda la historia va aquí, antes de jugar:
// durante la partida no sale ningún texto de historia (solo la ayuda de Chispa del tutorial). Se salta con un toque,
// Espacio, Enter, Escape o el botón «Saltar», y el toque que la salta no cuenta como jugada. Desde los ajustes se
// vuelve a ver.
// Aquí vive solo la lógica, sin pantalla, para poder probarla en Node: las líneas, el guion como datos (armado con lo
// que tarda leer cada línea), si toca verla y el control del tiempo (avanzar, saltar). El dibujo está en
// dibujo/apertura.js, el sonido en sonido.js y la música en musica.js.

export const CLAVE = 'guardia-apertura';

// La música va al mismo compás: desde que se enciende la luz, cada tiempo dura PULSO ms (111 por minuto). La bajada
// empieza al comienzo de un compás, el primero en que ya se leyó lo de arriba (el tercero de día; con la línea de la
// hora, el quinto), y aterriza tres compases después.
export const PULSO = 540;
const COMPAS = 4 * PULSO;
const ENCENDER = 700;

// Cómo se lee. Las letras entran de a `letrasPorSegundo` (el GDD pide de 5 a 20). Cada línea completa queda a la
// vista al menos `leer` ms y, desde que empieza hasta que se va, al menos lo que tarda leerla a `ritmo` letras por
// segundo (la de la hora es larga: ahí manda el ritmo).
export const LECTURA = {
  letrasPorSegundo: 20,
  ritmo: 15,
  leer: 1000,
  desde: 2200,    // la primera línea, cuando Chispa ya despertó
  entre: 200,     // entre una línea y la siguiente de la misma página
  sale: 250,      // lo que tarda en irse una página
  salida: 450,    // lo que tarda en irse el texto del aire cuando empieza la bajada
  cuaderno: 250,  // el cuaderno asoma un poco antes de su línea
};

// Si la hora del teléfono es de noche (de las 22:00 a las 04:59). Se calcula en el teléfono y no se envía.
export function esDeNoche(horas) { return horas >= 22 || horas < 5; }

// Las líneas de esta noche, en orden. Desde el aire, debajo de Chispa: las dos primeras juntas (`junto`) y la de la
// hora sola, solo si es de noche donde está el jugador. En la bajada, arriba (`arriba`), una por vez: el objetivo y
// la pregunta con el cuaderno de la vigía. `textos` es T.apertura.historia; `hora`, { horas, minutos } (o null).
export function lineasDeApertura(textos, hora = null) {
  const L = [
    { id: 'bajada', texto: textos.bajada },
    { id: 'amenaza', texto: textos.amenaza, junto: true },
  ];
  if (hora && esDeNoche(hora.horas)) {
    const dos = n => String(n).padStart(2, '0');
    L.push({ id: 'hora', texto: textos.hora(dos(hora.horas), dos(hora.minutos)) });
  }
  L.push({ id: 'objetivo', texto: textos.objetivo, arriba: true });
  L.push({ id: 'pregunta', texto: textos.pregunta, arriba: true, cuaderno: true });
  return L;
}

// ---- el guion, en milisegundos desde el toque ----
// Cada línea lleva cuándo aparece, cuándo empieza a escribirse (`en`), cuándo se completa, cuándo empieza a irse
// (`sale`) y cuándo ya no está (`fuera`). Lo demás es la cámara:
// - encender: se enciende la baliza; barrido: la luz empieza a barrer; enjambre: asoman los robots; chispa: despierta;
// - bajada: se va el texto del aire y la cámara empieza a inclinarse; inclinarFin: el plano ya se ve casi de costado;
// - niebla: entra la niebla con la luz del haz; frente: bajo la niebla, la vista de frente; nieblaFin: se abre;
// - aterriza: la cámara llega a la barrera, el primer cuadro de la partida, que arranca debajo (partida) mientras la
//   apertura se funde sobre ella hasta `fin`. Al saltarla, un fundido de `saltoFundido` y a jugar.
const durar = l => Math.ceil((l.texto.length * 1000) / LECTURA.letrasPorSegundo);
const leerla = l => Math.ceil((l.texto.length * 1000) / LECTURA.ritmo);
// lo más temprano que una página puede empezar a irse
const leida = pagina => Math.max(...pagina.map(l => Math.max(l.completa + LECTURA.leer, l.en + leerla(l))));

export function crearGuion(lineas, { quieto = false } = {}) {
  if (quieto) return guionQuieto(lineas);
  const A = LECTURA, out = [];
  const cerrar = (pagina, sale, fuera) => { for (const l of pagina) { l.sale = sale; l.fuera = fuera; } };
  // desde el aire, página por página
  let t = A.desde, pagina = [];
  for (const l of lineas.filter(x => !x.arriba)) {
    if (pagina.length && !l.junto) {
      const sale = leida(pagina);
      cerrar(pagina, sale, sale + A.sale);
      t = sale + A.sale;
      pagina = [];
    }
    const x = { ...l, aparece: t, en: t, completa: t + durar(l) };
    pagina.push(x);
    out.push(x);
    t = x.completa + A.entre;
  }
  let compases = 3;
  while (ENCENDER + compases * COMPAS < leida(pagina)) compases++;
  const bajada = ENCENDER + compases * COMPAS;
  cerrar(pagina, bajada, bajada + A.salida);
  const aterriza = bajada + 12 * PULSO;
  // en la bajada, una línea por vez; la última se queda hasta que la cámara llega
  t = bajada + A.salida;
  const abajo = lineas.filter(x => x.arriba);
  abajo.forEach((l, i) => {
    const en = t + (l.cuaderno ? A.cuaderno : 0);
    const x = { ...l, aparece: t, en, completa: en + durar(l) };
    out.push(x);
    const sale = i === abajo.length - 1 ? aterriza - A.sale : leida([x]);
    cerrar([x], sale, sale + A.sale);
    t = sale + A.sale;
  });
  return {
    compasesLuz: compases,
    letrasPorSegundo: A.letrasPorSegundo,
    encender: ENCENDER,
    barrido: 1100,
    enjambre: 1600,
    chispa: 1900,
    bajada,                                // de día, 7180; con la línea de la hora, 11500
    inclinarFin: bajada + 5 * PULSO,
    niebla: bajada + 4 * PULSO,
    frente: bajada + 5 * PULSO + 270,
    nieblaFin: bajada + 7 * PULSO,
    aterriza,
    partida: aterriza,
    fin: aterriza + 2 * PULSO,             // de día, 14740; con la línea de la hora, 19060
    saltoFundido: 260,
    lineas: out,
  };
}

// Con «menos movimiento» (del sistema o de los ajustes): la ciudad desde el aire, quieta y con todo el texto a la vista
// el tiempo de leerlo, se funde en la vista de frente, también quieta, y luego en la partida. Sin cámara que se mueva.
function guionQuieto(lineas) {
  const frente = Math.ceil((lineas.reduce((s, l) => s + l.texto.length, 0) * 1000) / LECTURA.ritmo);
  return {
    quieto: true,
    letrasPorSegundo: Infinity,
    encender: 0, barrido: 0, enjambre: 0, chispa: 0,
    bajada: frente, inclinarFin: frente, niebla: frente, frente, nieblaFin: frente + 800, aterriza: frente + 800,
    partida: frente + 1200, fin: frente + 1700, saltoFundido: 200,
    lineas: lineas.map(l => ({ ...l, aparece: 0, en: 0, completa: 0, sale: frente, fuera: frente + 800 })),
  };
}

// La bajada, de 0 a 1: cuánto se inclinó el plano del aire (0 = desde arriba, 1 = casi de costado)
export function inclinacion(t, guion) {
  if (guion.quieto) return t >= guion.frente ? 1 : 0;
  return suave((t - guion.bajada) / (guion.inclinarFin - guion.bajada));
}
// Cuánto tapa la niebla (0 a 1). Llega a 1 justo cuando se cambia a la vista de frente.
export function niebla(t, guion) {
  if (guion.quieto || t < guion.niebla || t > guion.nieblaFin) return 0;
  // entra rápido (la cámara se mete en la nube), tapa del todo un instante en el cambio y se abre más despacio
  const lleno = guion.frente - 90;
  if (t < lleno) return suave((t - guion.niebla - 160) / (lleno - guion.niebla - 160));
  if (t < guion.frente + 60) return 1;
  return 1 - suave((t - guion.frente - 60) / (guion.nieblaFin - guion.frente - 60));
}
// Cuánto falta para aterrizar, de 1 (arriba, recién salida de la niebla) a 0 (en la barrera). Frena al llegar.
export function altura(t, guion) {
  if (guion.quieto) return 0;
  const p = Math.max(0, Math.min(1, (t - guion.frente) / (guion.aterriza - guion.frente)));
  return (1 - p) ** 3;
}
function suave(x) { return x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x); }

// El segundo en que se saltó, redondeado a tramos de tres segundos (el nombre del evento lo lleva). De día, la bajada
// empieza hacia el 7 y la cámara aterriza hacia el 13,7; con la línea de la hora, hacia el 11,5 y el 18. Hasta 18.
export const TRAMOS_SALTO = [0, 3, 6, 9, 12, 15, 18];
export function tramoDeSalto(t) {
  const s = Math.max(0, Math.floor((t || 0) / 3000) * 3);
  return Math.min(TRAMOS_SALTO[TRAMOS_SALTO.length - 1], s);
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
// Cuántas letras de cada línea del guion se ven en el instante t
export function letrasVisibles(t, guion) {
  return guion.lineas.map(l => {
    if (t < l.en) return 0;
    if (!Number.isFinite(guion.letrasPorSegundo)) return l.texto.length;
    return Math.min(l.texto.length, Math.floor(((t - l.en) * guion.letrasPorSegundo) / 1000));
  });
}
// Cuánto se ve una línea en el instante t, de 0 a 1: entra de golpe (y se escribe) y se va con un fundido
export function alfaDe(l, t) {
  if (t < l.aparece || t >= l.fuera) return 0;
  return t < l.sale ? 1 : 1 - suave((t - l.sale) / (l.fuera - l.sale));
}

// ---- el control del tiempo ----
// avanzar(t) devuelve los golpes (para el sonido) que se cruzaron desde la última vez. La partida arranca una sola
// vez, sea por el guion, por un salto o por el reloj de seguridad; y termina una sola vez.
export function crearControl({ guion, alEmpezarPartida = () => { }, alTerminar = () => { } }) {
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
      if (antes >= 0 && !guion.quieto) {
        const ya = letrasVisibles(antes, guion), ahoraL = letrasVisibles(t, guion);
        guion.lineas.forEach((l, i) => {
          for (let k = ya[i]; k < ahoraL[i]; k++) if (k % 2 === 0 && l.texto[k] !== ' ') { salen.push('letra'); break; }
        });
      }
    }
    antes = t;
    if (t >= guion.partida) empezarPartida('guion');
    if (t >= finEn) terminar(saltada ? 'saltada' : 'guion');
    return salen;
  }

  // un toque, Espacio, Enter, Escape o «Saltar»: la partida arranca ya, y la apertura se va con un fundido corto.
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
    // cuánto se ve la apertura sobre la partida (1 = entera, 0 = ya no está). Ya en la barrera, la apertura se
    // funde sobre la partida, que es el mismo cuadro.
    get opacidad() {
      if (saltada) return Math.max(0, Math.min(1, (finEn - t) / guion.saltoFundido));
      return t < guion.partida ? 1 : 1 - suave((t - guion.partida) / (guion.fin - guion.partida));
    },
  };
}
