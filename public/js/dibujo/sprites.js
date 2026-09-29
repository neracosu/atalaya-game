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

// el informe de «Su puerta»: la puerta 12x16 con su luz arriba (verde sin fallas, roja con fallas) y las marcas 7x7
export const PUERTA = [
  '.kkkLLLLkkk.',
  'kWWWWWWWWWWk',
  'kWwwwwwwwwWk',
  'kWwWWWWWWwWk',
  'kWwWwwwwWwWk',
  'kWwWwwwwWwWk',
  'kWwWWWWWWwWk',
  'kWwwwwwwwwWk',
  'kWwwwwwwyyWk',
  'kWwwwwwwyyWk',
  'kWwWWWWWWwWk',
  'kWwWwwwwWwWk',
  'kWwWwwwwWwWk',
  'kWwWWWWWWwWk',
  'kWwwwwwwwwWk',
  'kkkkkkkkkkkk',
];
export const PALETA_PUERTA = { k: '#0b1020', W: '#78350f', w: '#a16207', y: '#facc15', L: '#22c55e' };
export const PALETA_PUERTA_FALLAS = { ...PALETA_PUERTA, L: '#ef4444' };
export const BIEN = ['.......', '......g', '.....gg', 'g...gg.', 'gg.gg..', '.ggg...', '..g....'];
export const FALLA = ['r.....r', 'rr...rr', '.rr.rr.', '..rrr..', '.rr.rr.', 'rr...rr', 'r.....r'];
export const PALETA_MARCAS = { g: '#22c55e', r: '#ef4444' };

// ---- la apertura: la ciudad vista desde el aire ----
// Chispa, el robot compañero: el mismo robot 14x17 que en el monitor Atalaya representa a una sesión de Claude Code
// trabajando (web/js/pixeldata.js, mismo autor y licencia). e = ojos, a = luz de la antena.
const CHISPA_CABEZA = [
  '......a.......',
  '......g.......',
  '...oooooooo...',
  '..oBBBBBBBBo..',
  '..oBvvvvvvBo..',
  '..oBveevveBo..',
  '..oBvvvvvvBo..',
  '..obBBBBBBbo..',
  '...oooooooo...',
];
const CHISPA_PARPADEO = CHISPA_CABEZA.map((r, i) => i === 5 ? '..oBvvvvvvBo..' : r);
const CHISPA_CUERPO = ['..oBBhhhhBBo..', '.goBBhBBhBBog.', '.goBBBBBBBBog.', '..obbbbbbbbo..', '...oooooooo...'];
const CHISPA_SALUDO = ['..oBBhhhhBBo.g', '.goBBhBBhBBog.', '..oBBBBBBBBo..', '..obbbbbbbbo..', '...oooooooo...'];
const CHISPA_PIES = ['...og....go...', '...oo....oo...'];
export const CHISPA = {
  quieto: [...CHISPA_CABEZA, ...CHISPA_CUERPO, ...CHISPA_PIES],
  parpadeo: [...CHISPA_PARPADEO, ...CHISPA_CUERPO, ...CHISPA_PIES],
  saludo: [...CHISPA_CABEZA, ...CHISPA_SALUDO, ...CHISPA_PIES],
};
const CHISPA_BASE = { o: '#050814', B: '#d97757', b: '#8d4d38', h: '#efb9a3', v: '#0b1020', g: '#94a3b8' };
// dormido: ojos apagados (del color del visor) y la antena sin luz; despierto: ojos claros y antena ámbar
export const PALETA_CHISPA_DORMIDO = { ...CHISPA_BASE, e: '#0b1020', a: '#475569' };
export const PALETA_CHISPA = { ...CHISPA_BASE, e: '#e0f7ff', a: '#fbbf24' };

// la torre vista desde arriba y un poco de costado, 14x21: el techo con la baliza al centro y, debajo, la cara sur
// de la sala (con sus ventanas) y del fuste. Así se lee como una torre y no como un anillo.
export const TORRE_AIRE = [
  '....kkkkkk....',
  '..kkggggggkk..',
  '.kggGGGGGGggk.',
  '.kgGggggggGgk.',
  'kgGgvvvvvvgGgk',
  'kgGgvwwwwvgGgk',
  'kgGgvwbbwvgGgk',
  'kgGgvwbbwvgGgk',
  'kgGgvwwwwvgGgk',
  'kgGgvvvvvvgGgk',
  '.kgGggggggGgk.',
  '.kggGGGGGGggk.',
  '.kkkggggggkkk.',
  '.kssssssssssk.',
  '.kslsslsslslk.',
  '.kssssssssssk.',
  '..kkffffffkk..',
  '...kfLffLfk...',
  '...kffffffk...',
  '...kfLffLfk...',
  '...kkkkkkkk...',
];
export const PALETA_TORRE_AIRE = { k: '#050814', g: '#243049', G: '#2f3c58', v: '#141d30', w: '#1e293b', b: '#164e63',
  s: '#172238', l: '#1e293b', f: '#1c2740', L: '#27344f' };
export const PALETA_TORRE_AIRE_ENCENDIDA = { ...PALETA_TORRE_AIRE, g: '#3b4a66', G: '#64748b', v: '#0e7490', w: '#a5f3fc', b: '#f0fdff',
  s: '#0e5f75', l: '#fde68a', f: '#334155', L: '#fde68a' };

// ---- la tarjeta de la hora siguiente: la lente del Castillo (18x18) con su torre adentro, y la araña 11x9 ----
export const LENTE_CASTILLO = [
  '......mmmmmm......',
  '....mmMMMMMMmm....',
  '...mMMccccccMMm...',
  '..mMccccccccccMm..',
  '.mMcccck.kccccccm.',
  '.mMccckkkkkcccccm.',
  'mMcccckwwwkccccMMm',
  'mMcccckkkkkccccMMm',
  'mMcccckwkwkccccMMm',
  'mMcccckkkkkccccMMm',
  'mMcckkkkkkkkkccMMm',
  'mMcckwkkkkkwkccMMm',
  '.mMckkkkkkkkkccMm.',
  '.mMhhhhhhhhhhhhMm.',
  '..mMhhhhhhhhhhMm..',
  '...mMMhhhhhhMMm...',
  '....mmMMMMMMmm....',
  '......mmmmmm......',
];
export const PALETA_LENTE = { m: '#78350f', M: '#b45309', c: '#1e1b4b', k: '#312e81', w: '#fde68a', h: '#2e1065' };
export const ARANA = ['.k.......k.', '..k.....k..', 'k..kkkkk..k', '.k.kkkkk.k.', '..kkrkrkk..', '.k.kkkkk.k.', 'k..kkkkk..k', '..k.....k..', '.k.......k.'];
export const PALETA_ARANA = { k: '#e2e8f0', r: '#ef4444' };
// el calendario del reto, 11x11: la hoja con sus anillas y el día marcado
export const CALENDARIO = ['..k.....k..', 'rrkrrrrrkrr', 'rrrrrrrrrrr', 'wwwwwwwwwww', 'wdwdwdwdwdw', 'wwwwwwwwwww', 'wdwdwyyywdw', 'wwwwwyyywww', 'wdwdwyyywdw', 'wwwwwwwwwww', 'wwwwwwwwwww'];
export const PALETA_CALENDARIO = { k: '#94a3b8', r: '#ef4444', w: '#e2e8f0', y: '#f59e0b', d: '#94a3b8' };

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
