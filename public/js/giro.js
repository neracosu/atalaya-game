// El giro de cada hora (GDD, parte 2, «Un giro por hora»): pasa en el mundo, en el último evento del nivel, y luego
// se dice en una o dos líneas. Completo solo en la primera victoria; en los reintentos no aparece.
// Por ahora, el de El peaje: tras el final, un último auto sospechoso llega, frena ante la barrera, no intenta pasar
// y da la vuelta. Lo sembró el reloj chico sobre la barrera, que en la partida marcó lo que tardó cada respuesta.
// Aquí vive solo la lógica, sin pantalla, para poder probarla en Node: si toca verlo, el guion en datos y dónde va
// el auto y el texto en cada instante. El dibujo está en dibujo/escena.js y la puesta en escena en app.js.
// El giro no toca el motor: pasa después del final, cuando el puntaje ya está cerrado.

export const CLAVE_GIRO = 'guardia-giro-peaje';

// ---- si toca verlo: la primera vez que se termina El peaje con al menos una estrella ----
// Igual que la apertura: si el almacenamiento falla, no rompe y se recuerda mientras la página esté abierta.
let vistoEnMemoria = false;

function almacenDe(obtener) {
  try { return typeof obtener === 'function' ? obtener() : obtener; } catch { return null; }
}

export function tocaGiro(obtener, estrellas) {
  if (!(estrellas >= 1) || vistoEnMemoria) return false;
  const a = almacenDe(obtener);
  try { return !(a && a.getItem(CLAVE_GIRO)); } catch { return true; }
}

export function marcarGiro(obtener) {
  vistoEnMemoria = true;
  const a = almacenDe(obtener);
  try { if (a) a.setItem(CLAVE_GIRO, '1'); } catch { }
}

// solo para las pruebas: olvida lo recordado en memoria
export function _olvidarGiro() { vistoEnMemoria = false; }

// ---- el guion, en milisegundos desde que empieza ----
// El auto: de 0 a `frena` llega desde la izquierda y frena ante la barrera; al frenar, el mundo se congela `congela`
// ms (la pausa de impacto: la cámara corta al auto); espera sin intentar pasar mientras el reloj de la barrera
// cuenta; en `gira` da la vuelta y en `fuera` ya salió de la pantalla. Unos 3,4 s en el mundo.
// Luego las dos líneas, letra por letra, y un rato para leerlas.
export const GUION_GIRO = {
  frena: 1100,
  congela: 120,
  gira: 2100,
  fuera: 3400,
  linea1: 3300,
  respiro: 500,          // entre que se completa la primera y empieza la segunda
  letrasPorSegundo: 20,  // el GDD pide de 5 a 20
  queda: 2600,           // lo que la segunda queda a la vista antes del resultado
  guarda: 500,           // al empezar, los toques no lo saltan: el jugador venía tocando
};

// Dónde va el auto: `pos` de 0 (fuera, a la izquierda) a 1 (ante la barrera), `mira` hacia dónde apunta (1 a la
// barrera, -1 de vuelta) y `espera`, los milisegundos que lleva parado (para el reloj; la pausa no cuenta). Justo al
// frenar, `congelado`: el mundo queda quieto esos ms. En la vuelta, `giro` va de 0 a 1 (para los faros que barren).
// Null cuando ya no está.
export function autoDelGiro(t, G = GUION_GIRO) {
  if (t < 0 || t >= G.fuera) return null;
  if (t < G.frena) {
    // entra ligero y frena al final
    const f = t / G.frena;
    return { pos: 1 - (1 - f) * (1 - f), mira: 1, espera: 0 };
  }
  const congela = G.congela || 0;
  if (t < G.frena + congela) return { pos: 1, mira: 1, espera: 0, congelado: true };
  if (t < G.gira) return { pos: 1, mira: 1, espera: t - G.frena - congela };
  // da la vuelta: arranca despacio y se va
  const f = (t - G.gira) / (G.fuera - G.gira);
  return { pos: 1 - f * f, mira: -1, espera: G.gira - G.frena - congela, giro: f };
}

// Cuántas letras de cada línea se ven en el instante t, y cuándo termina
export function textoDelGiro(t, lineas, G = GUION_GIRO) {
  const ms = 1000 / G.letrasPorSegundo;
  const inicio2 = G.linea1 + lineas[0].length * ms + G.respiro;
  const letras = [
    Math.max(0, Math.min(lineas[0].length, Math.floor((t - G.linea1) / ms))),
    Math.max(0, Math.min(lineas[1].length, Math.floor((t - inicio2) / ms))),
  ];
  return { letras, escribiendo: t >= G.linea1 && t < finDelGiro(lineas, G) - G.queda };
}

export function finDelGiro(lineas, G = GUION_GIRO) {
  const ms = 1000 / G.letrasPorSegundo;
  return G.linea1 + (lineas[0].length + lineas[1].length) * ms + G.respiro + G.queda;
}

// El control: avanza con el tiempo y termina una sola vez, sea por el guion o por un toque (después de la guarda)
export function crearGiro({ lineas, alTerminar = () => { } }, G = GUION_GIRO) {
  let t = 0, terminado = false;
  const fin = finDelGiro(lineas, G);
  const terminar = motivo => { if (terminado) return false; terminado = true; alTerminar(motivo); return true; };
  return {
    avanzar(ahora) {
      t = Math.max(t, ahora);
      if (t >= fin) terminar('guion');
      return { auto: autoDelGiro(t, G), ...textoDelGiro(t, lineas, G) };
    },
    saltar() { return t >= G.guarda ? terminar('saltado') : false; },
    get t() { return t; },
    get terminado() { return terminado; },
    fin,
  };
}
