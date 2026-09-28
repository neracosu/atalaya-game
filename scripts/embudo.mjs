// El embudo de la etapa 0, leído de los archivos de la analítica de Atalaya (uno por sitio y mes, con los
// eventos propios que manda public/js/medir.js). Compara con la prueba «seguir, cambiar o parar» del GDD.
//
//   node scripts/embudo.mjs <archivo AAAA-MM.json>... [--desde AAAA-MM-DD] [--hasta AAAA-MM-DD]
//
// Los archivos viven en la carpeta del sitio del juego dentro de la analítica de Atalaya y solo los lee el
// administrador del servidor. Este script no escribe nada.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PREFIJO = 'propio · ';

// de los días de la analítica ({ fecha: { js: { convPages } } }) a los conteos de cada evento por día
export function eventosPorDia(dias) {
  const out = {};
  for (const [fecha, d] of Object.entries(dias || {})) {
    const c = {};
    for (const [k, n] of Object.entries((d && d.js && d.js.convPages) || {})) {
      if (k.startsWith(PREFIJO)) c[k.slice(PREFIJO.length)] = (c[k.slice(PREFIJO.length)] || 0) + n;
    }
    out[fecha] = c;
  }
  return out;
}

const suma = (porDia, nombres) => Object.values(porDia).reduce((t, c) => t + nombres.reduce((s, n) => s + (c[n] || 0), 0), 0);
const dia = (fecha, delta) => new Date(Date.parse(fecha + 'T12:00:00Z') + delta * 86400000).toISOString().slice(0, 10);
const razon = (a, b) => (b ? a / b : null);

// el embudo y la prueba de la parte 9 (y las metas de la parte 10)
export function embudo(porDia) {
  const n = nombres => suma(porDia, [].concat(nombres));
  const fines1 = ['fin-primera-0', 'fin-primera-1', 'fin-primera-2', 'fin-primera-3'];
  const portada = n('portada'), empieza = n('empieza'), termina = n(fines1);
  // vuelve al día siguiente: los que volvieron el día D sobre los nuevos del día D-1 (solo días con el anterior medido)
  let vuelven = 0, nuevosAyer = 0;
  for (const [fecha, c] of Object.entries(porDia)) {
    const ayer = porDia[dia(fecha, -1)];
    if (!ayer) continue;
    vuelven += c['vuelve-dia-siguiente'] || 0;
    nuevosAyer += ayer.nuevo || 0;
  }
  // reintento mediano: la mitad o más de quienes terminan la primera llega a ese número de reintentos
  const hitos = [1, 2, 3, 5, 10].map(h => ({ h, n: n('reintento-' + h) }));
  const mediano = termina ? hitos.filter(x => x.n >= termina / 2).reduce((m, x) => Math.max(m, x.h), 0) : null;
  const comparte = n('comparte'), dominio = n('dominio'), vigilar = n('vigilar');
  const pasos = [
    { paso: 'Empieza a jugar (de quienes ven la portada)', valor: razon(empieza, portada), meta: 0.8, revisar: 0.6 },
    { paso: 'Termina la primera partida', valor: razon(termina, empieza), meta: 0.7, revisar: 0.4, prueba: true },
    { paso: 'Reintenta al menos una vez', valor: razon(n('reintento-1'), termina), meta: 0.3, revisar: 0.1 },
    { paso: 'Llega a 3 reintentos (mediano de 3 o más si es 50 %)', valor: razon(n('reintento-3'), termina), meta: 0.5, prueba: true },
    { paso: 'Vuelve al día siguiente', valor: razon(vuelven, nuevosAyer), meta: 0.2, prueba: true },
    { paso: 'Comparte (de quienes juegan)', valor: razon(comparte, empieza), meta: 0.05, prueba: true },
    { paso: 'Comparte el informe de su puerta (de quienes escriben su dominio)', valor: razon(n('comparte-puerta'), dominio), meta: 0.05 },
    { paso: 'Escribe su dominio (de quienes juegan)', valor: razon(dominio, empieza), meta: 0.02, prueba: true },
    { paso: 'Escribe su dominio (de quienes terminan)', valor: razon(dominio, termina), meta: 0.12, revisar: 0.04 },
    { paso: 'Toca «vigilar» (de quienes escriben su dominio)', valor: razon(vigilar, dominio), meta: 0.35 },
  ];
  const estrellas = [0, 1, 2, 3].map(e => n(['fin-primera-' + e, 'fin-otra-' + e]));
  return { conteos: { portada, empieza, termina, nuevos: n('nuevo'), vuelven, nuevosAyer, comparte, compartePuerta: n('comparte-puerta'), dominio, vigilar, reto: n('reto') }, hitos, mediano, estrellas, pasos };
}

function leerDias(archivos, desde, hasta) {
  const dias = {};
  for (const f of archivos) Object.assign(dias, JSON.parse(readFileSync(f, 'utf8')).days || {});
  for (const fecha of Object.keys(dias)) if ((desde && fecha < desde) || (hasta && fecha > hasta)) delete dias[fecha];
  return dias;
}

function principal(args) {
  const opt = k => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
  const desde = opt('--desde'), hasta = opt('--hasta');
  if (!args.length) { console.error('Uso: node scripts/embudo.mjs <AAAA-MM.json>... [--desde AAAA-MM-DD] [--hasta AAAA-MM-DD]'); process.exit(2); }
  const dias = leerDias(args, desde, hasta);
  const e = embudo(eventosPorDia(dias));
  const pct = v => (v == null ? '  sin datos' : (v * 100).toFixed(1).padStart(6) + ' %');
  const fechas = Object.keys(dias).sort();
  console.log(`Embudo de la etapa 0, ${fechas[0] || '?'} a ${fechas[fechas.length - 1] || '?'}`);
  console.log('Conteos:', JSON.stringify(e.conteos));
  console.log('Estrellas (0 a 3):', e.estrellas.join(' / '), '· Reintentos:', e.hitos.map(x => `${x.h}: ${x.n}`).join(', '), '· Mediano aprox.:', e.mediano ?? 'sin datos');
  for (const p of e.pasos) {
    const estado = p.valor == null ? '' : p.valor >= p.meta ? 'cumple' : p.revisar != null && p.valor < p.revisar ? 'REVISAR' : 'por debajo';
    console.log(`${p.prueba ? '[prueba] ' : '         '}${p.paso.padEnd(56)} ${pct(p.valor)}  meta ${(p.meta * 100).toFixed(0)} %  ${estado}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) principal(process.argv.slice(2));
