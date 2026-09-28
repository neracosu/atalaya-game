// Pixel art del juego como datos. Los autos vienen del monitor Atalaya (web/js/pixeldata.js, mismo autor y licencia),
// con variantes para el peaje. Cada sprite es una matriz de caracteres y cada caracter es un color de la paleta.

// auto de perfil 20x10, mirando a la derecha. C = carrocería, S = franja, d = ventana, h = pasajero
const AUTO = (techo, ventanas = ['ddd', 'ddd']) => [
  techo,
  '......CCCCCCCC......',
  `.....C${ventanas[0]}CC${ventanas[1]}C.....`,
  `...CCC${ventanas[0]}CC${ventanas[1]}CCCC..`,
  '..kCCCCCCCCCCCCCCCk.',
  '.kCCSSSSSSSSSSSSCCCk',
  '.kCCCCCCCCCCCCCCCCyk',
  '..kkttkkkkkkkkttkk..',
  '...tsst......tsst...',
  '....tt........tt....',
];

const NADA = '....................';

export const SPRITES = {
  // cliente: con pasajeros en las ventanas
  cliente: [AUTO(NADA, ['dhd', 'hdd'])],
  dorado: [AUTO('.........*..........', ['dhd', 'hdd']), AUTO('....*.........*.....', ['dhd', 'hdd'])],
  // auto sospechoso: oscuro, con la sirena roja que parpadea, sin nadie a la vista
  sospechoso: [AUTO('.........R..........'), AUTO('.........r..........')],
  // robot del buscador: camioneta clara con la lupa en el techo
  buscador: [AUTO('........LLL.........'), AUTO('........LLL.........')],
  // quien busca wp-login: con una escalera en el techo para trepar
  wp: [AUTO('...eeeeeeeeeeeee....')],
};
SPRITES.impostor = SPRITES.buscador;

// colores por tipo de auto
const BASE = { k: '#0b1020', d: '#1e3a5f', t: '#020617', s: '#94a3b8', y: '#fef3c7', h: '#fbbf24' };
export const PALETAS = {
  cliente: [
    { ...BASE, C: '#3b82f6', S: '#1d4ed8' },
    { ...BASE, C: '#22c55e', S: '#15803d' },
    { ...BASE, C: '#f472b6', S: '#be185d' },
    { ...BASE, C: '#f59e0b', S: '#b45309' },
    { ...BASE, C: '#e2e8f0', S: '#64748b' },
  ],
  dorado: [{ ...BASE, C: '#facc15', S: '#fde68a', '*': '#fff7c2', h: '#b45309' }],
  sospechoso: [{ ...BASE, C: '#334155', S: '#1f2937', d: '#0f172a', R: '#ef4444', r: '#7f1d1d' }],
  buscador: [{ ...BASE, C: '#f8fafc', S: '#38bdf8', L: '#38bdf8' }],
  wp: [{ ...BASE, C: '#475569', S: '#94a3b8', d: '#0f172a', e: '#a16207' }],
};
PALETAS.impostor = PALETAS.buscador;

// barrera del peaje 6x14: poste y brazo (abajo = cerrada, arriba = abierta)
export const BARRERA_POSTE = ['.kkkk.', 'kyyyyk', 'kyyyyk', 'kkkkkk', '.kssk.', '.kssk.', '.kssk.', '.kssk.', '.kssk.', '.kssk.', '.kssk.', '.kssk.', 'kkkkkk', 'kkkkkk'];
export const PALETA_BARRERA = { k: '#0b1020', y: '#facc15', s: '#94a3b8', r: '#ef4444', w: '#f8fafc' };

// la torre de control al fondo, 16x40: base ancha, fuste, sala con ventanas y la baliza arriba
export const TORRE = [
  '.......bb.......',
  '.......bb.......',
  '......kkkk......',
  '.....kwwwwk.....',
  '....kkkkkkkk....',
  '...kvvvvvvvvk...',
  '...kvlvvlvvlk...',
  '...kvvvvvvvvk...',
  '..kkkkkkkkkkkk..',
  '....kggggggk....',
  '....kgGggGgk....',
  '....kggggggk....',
  '....kgGggGgk....',
  '....kggggggk....',
  '....kgGggGgk....',
  '....kggggggk....',
  '....kgGggGgk....',
  '....kggggggk....',
  '....kgGggGgk....',
  '....kggggggk....',
  '...kggggggggk...',
  '...kgGgggGggk...',
  '...kggggggggk...',
  '..kggggggggggk..',
  '..kgGggggggGgk..',
  '..kggggggggggk..',
  '.kggggggggggggk.',
  '.kgggggddggggGk.',
  '.kgggggddgggggk.',
  'kkkkkkkkkkkkkkkk',
];
export const PALETA_TORRE = { k: '#0b1020', b: '#22d3ee', w: '#64748b', v: '#1e293b', l: '#1e293b', g: '#334155', G: '#475569', d: '#0f172a' };
export const PALETA_TORRE_ENCENDIDA = { ...PALETA_TORRE, w: '#e2e8f0', v: '#0e7490', l: '#fde68a', G: '#fde68a' };

// estrella 9x9 y torrecita de integridad 7x9 para la interfaz
export const ESTRELLA = ['....y....', '....y....', '...yyy...', 'yyyyyyyyy', '.yyyyyyy.', '..yyyyy..', '..yy.yy..', '.yy...yy.', 'y.......y'];
export const TORRECITA = ['...b...', '..kkk..', '.kwwwk.', 'kkkkkkk', '.kgggk.', '.kgggk.', '.kgggk.', 'kgggggk', 'kkkkkkk'];

// Convierte un sprite en un canvas a escala entera (sin suavizado: cada pixel del dibujo es un cuadro exacto)
export function aCanvas(filas, paleta, escala) {
  const alto = filas.length, ancho = filas[0].length;
  const c = document.createElement('canvas');
  c.width = ancho * escala;
  c.height = alto * escala;
  const g = c.getContext('2d');
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const col = paleta[filas[y][x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x * escala, y * escala, escala, escala);
    }
  }
  return c;
}

// El mismo dibujo como SVG, para la interfaz en HTML (nítido a cualquier tamaño)
export function aSVG(filas, paleta, clase = '') {
  const alto = filas.length, ancho = filas[0].length;
  let r = '';
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const col = paleta[filas[y][x]];
      if (col) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${col}"/>`;
    }
  }
  return `<svg class="${clase}" viewBox="0 0 ${ancho} ${alto}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}
