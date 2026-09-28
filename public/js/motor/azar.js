// Azar con semilla, igual en cualquier navegador y en Node. Nada de Math.random en la lógica del juego:
// con la misma semilla y las mismas jugadas, la partida da siempre lo mismo (así el servidor puede volver a jugarla).

// Mulberry32: 32 bits, solo enteros (Math.imul y >>> 0).
export function crearAzar(semilla) {
  let s = semilla >>> 0;
  const siguiente = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
  return {
    siguiente,
    // entero en [0, n)
    entero: n => siguiente() % n,
    // entero en [a, b]
    entre: (a, b) => a + (siguiente() % (b - a + 1)),
    // true con probabilidad p/1000
    milesimas: p => siguiente() % 1000 < p,
  };
}

// FNV-1a de 32 bits: convierte un texto (por ejemplo «reto-2026-09-28») en una semilla.
export function semillaDe(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
