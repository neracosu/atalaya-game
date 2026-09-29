// La apertura: «La torre vacía» y «Bajar del cielo» (GDD, parte 6). Dos versiones:
// - la corta, que se juega: la primera vez que se toma la guardia, la cámara baja del cielo en menos de dos segundos
//   hasta la barrera, con el primer auto llegando, y la historia se cuenta en las pausas de la primera partida;
// - la larga, de unos quince segundos (la ciudad desde el aire, la luz, el texto y la bajada), desde los ajustes.
// Aquí vive solo la lógica, sin pantalla, para poder probarla en Node: los guiones como datos, si toca verla, el
// control del tiempo (avanzar, saltar) y qué línea de la historia se ve. El dibujo está en dibujo/apertura.js, el
// sonido en sonido.js y la música en musica.js.

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

// La corta: empieza de frente, arriba, saliendo de la niebla, y baja hasta la barrera. La partida arranca debajo
// antes de aterrizar, para que el primer auto asome justo cuando la cámara llega: está listo para decidir unos
// 730 ms después de que arranca (12 pasos hasta que llega y 10 hasta la barrera, ver motor/peaje.js), o sea hacia
// los 2,2 s del toque. Un toque la salta y la partida arranca en el acto.
export const GUION_CORTO = {
  corto: true,
  encender: 0,          // la torre ya está encendida: suena el encendido con el toque
  frente: 0,            // desde el primer cuadro, la vista de frente
  nieblaFin: 520,       // la niebla se abre mientras la cámara empieza a bajar
  partida: 1450,        // la partida arranca debajo
  aterriza: 1800,       // la cámara llega a la barrera y la apertura empieza a irse
  fin: 2100,
  saltoFundido: 180,
};
// con menos movimiento: la cámara ya está en la barrera, sin niebla; solo se funde. Los mismos tiempos.
export const GUION_CORTO_QUIETO = { ...GUION_CORTO, quieto: true };

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
  if (guion.corto) return guion.quieto ? 0 : 0.9 * (1 - suave(t / guion.nieblaFin));
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
  // (la corta no tiene todos: solo suenan los que el guion trae)
  const golpes = [['encender', guion.encender], ['chispa', guion.chispa], ['bajada', guion.bajada], ['niebla', guion.niebla], ['aterriza', guion.aterriza]]
    .filter(([, en]) => Number.isFinite(en));

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
      // ya en la barrera, la apertura se funde sobre la partida, que es el mismo cuadro. En la corta, la partida
      // arranca antes de aterrizar y el fundido espera a la cámara
      const desde = guion.corto ? guion.aterriza : guion.partida;
      return t < desde ? 1 : 1 - suave((t - desde) / (guion.fin - desde));
    },
  };
}

// ---- la historia en las pausas de la primera partida (la corta) ----
// Mientras el jugador aprende a jugar, no se le cuenta el mundo (la regla de DATA WING, GDD parte 6). Las líneas se
// escriben arriba, letra por letra, y solo avanzan cuando no hay un auto esperando decisión: si el jugador está
// ocupado, la línea espera donde iba. Todo es una función del tiempo y de lo que pasó, sin pantalla ni reloj propio:
// app.js le pasa cada cuadro si hay un auto esperando y si ya hubo un acierto.
export const HISTORIA = {
  letrasPorSegundo: 20,  // el GDD pide de 5 a 20
  primera: 150,          // la primera línea empieza con la bajada, desde el toque
  respiro: 1200,         // entre que una línea se completa y empieza la siguiente, como mínimo
  ultimaDesde: 12000,    // la pregunta del cuaderno, hacia los 12 a 15 s
  queda: 3500,           // lo que una línea completa queda a la vista si la siguiente no llega antes
  sale: 400,             // lo que tarda en irse
  tope: 40000,           // si la partida no dio pausas, después de esto ya no empieza ninguna línea
};

// Si la hora del teléfono es de noche (de las 22:00 a las 04:59). Se calcula en el teléfono y no se envía.
export function esDeNoche(horas) { return horas >= 22 || horas < 5; }

// Las líneas de esta noche, en orden. La de la hora solo si es de noche donde está el jugador, antes de la última.
// `textos` es T.apertura.historia; `hora`, { horas, minutos } del teléfono (o null).
export function lineasDeHistoria(textos, hora = null) {
  const L = [
    { id: 'bajada', texto: textos.bajada },
    { id: 'amenaza', texto: textos.amenaza, trasAcierto: true },
    { id: 'objetivo', texto: textos.objetivo },
  ];
  if (hora && esDeNoche(hora.horas)) {
    const dos = n => String(n).padStart(2, '0');
    L.push({ id: 'hora', texto: textos.hora(dos(hora.horas), dos(hora.minutos)) });
  }
  L.push({ id: 'pregunta', texto: textos.pregunta, desde: HISTORIA.ultimaDesde, cuaderno: true });
  return L;
}

// El estado: qué línea va (i), cuántas letras lleva, cuándo empezó y cuándo se completó.
export function crearHistoria(lineas) {
  return { lineas, i: 0, letras: 0, empezo: null, completa: null, t: 0, acierto: false, fin: lineas.length === 0 };
}

// Avanza hasta el instante t (ms desde el toque en «Tomar la guardia»). `esperando`: si ahora hay un auto
// esperando decisión; `acierto`: si ya hubo al menos uno. Devuelve un estado nuevo, no toca el de antes.
export function avanzarHistoria(estado, t, { esperando = false, acierto = false } = {}, H = HISTORIA) {
  const e = { ...estado, acierto: estado.acierto || acierto };
  const dt = Math.max(0, t - e.t);
  e.t = Math.max(e.t, t);
  if (e.fin) return e;
  const linea = e.lineas[e.i];
  if (e.empezo === null) {
    // ¿puede empezar esta línea?
    const antes = e.i === 0 ? H.primera : e.completaAntes + H.respiro;
    const listo = e.t >= antes && e.t >= (linea.desde || 0) && (!linea.trasAcierto || e.acierto) && !esperando;
    if (e.t >= H.tope) { e.fin = true; return e; }
    if (listo) { e.empezo = e.t; e.letras = 0; }
    return e;
  }
  if (e.completa === null) {
    // solo se escribe cuando no hay un auto esperando: si lo hay, la línea espera donde iba
    if (!esperando) e.letras = Math.min(linea.texto.length, e.letras + (dt * H.letrasPorSegundo) / 1000);
    if (e.letras >= linea.texto.length) e.completa = e.t;
    return e;
  }
  // completa: la siguiente se prepara (empieza cuando se pueda); esta sigue a la vista hasta que la otra empiece
  // o se le acabe el tiempo
  if (e.i === e.lineas.length - 1) {
    if (e.t >= e.completa + H.queda + H.sale) e.fin = true;
    return e;
  }
  const siguiente = { ...e, i: e.i + 1, empezo: null, completa: null, letras: 0, completaAntes: e.completa, anterior: e.i, anteriorCompleta: e.completa };
  return avanzarHistoria(siguiente, t, { esperando, acierto: e.acierto }, H);
}

// Lo que se ve en el instante del estado: la línea (o la anterior, mientras la nueva no empezó), cuántas letras,
// cuánto se ve (1 a 0, al irse) y si va el cuaderno.
export function verHistoria(e, H = HISTORIA) {
  const nada = { id: null, texto: '', letras: 0, alfa: 0, cuaderno: false, escribiendo: false };
  if (e.fin) return nada;
  let i = e.i, completa = e.completa, letras = Math.floor(e.letras);
  if (e.empezo === null) {
    // la nueva todavía no empieza: queda la anterior hasta que se le acabe el tiempo
    if (e.anterior === undefined) return nada;
    i = e.anterior; completa = e.anteriorCompleta; letras = e.lineas[i].texto.length;
  }
  const L = e.lineas[i];
  const alfa = completa === null ? 1 : Math.max(0, Math.min(1, 1 - (e.t - completa - H.queda) / H.sale));
  if (alfa <= 0) return nada;
  return { id: L.id, texto: L.texto, letras, alfa, cuaderno: !!L.cuaderno, escribiendo: completa === null };
}

// Para las pruebas y para razonar: la historia entera, de 0 a t, con los hechos en orden. `hechos` es una lista de
// [ms, 'acierto' | 'espera' | 'libre'] (un auto empieza a esperar decisión, o ya no hay ninguno esperando).
export function historiaEn(t, lineas, hechos = [], paso = 10, H = HISTORIA) {
  let e = crearHistoria(lineas), esperando = false, acierto = false, k = 0;
  const orden = hechos.slice().sort((a, b) => a[0] - b[0]);
  const instantes = [];
  for (let a = 0; a < t; a += paso) instantes.push(a);
  instantes.push(t);
  for (const ahora of instantes) {
    while (k < orden.length && orden[k][0] <= ahora) {
      const h = orden[k++][1];
      if (h === 'acierto') acierto = true; else if (h === 'espera') esperando = true; else if (h === 'libre') esperando = false;
    }
    e = avanzarHistoria(e, ahora, { esperando, acierto }, H);
  }
  return e;
}
