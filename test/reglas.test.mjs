// Las reglas del repo que se pueden revisar solas: sin emojis, sin código ni estilos en línea, sin recursos
// externos y un núcleo determinista sin azar ni reloj.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = rel => readFileSync(path.join(RAIZ, rel), 'utf8');

function archivos(dir, filtro) {
  const fuera = new Set(['node_modules', '.git', 'dist']);
  return readdirSync(path.join(RAIZ, dir), { withFileTypes: true }).flatMap(e => {
    if (fuera.has(e.name)) return [];
    const rel = path.join(dir, e.name);
    return e.isDirectory() ? archivos(rel, filtro) : filtro.test(e.name) ? [rel] : [];
  });
}

const sinComentarios = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

test('sin emojis en el juego ni en los documentos', () => {
  for (const f of archivos('.', /\.(js|mjs|html|css|md|yml|yaml|json|webmanifest|svg)$/)) {
    const hallados = leer(f).match(/\p{Extended_Pictographic}/gu);
    assert.equal(hallados, null, `${f}: ${hallados && [...new Set(hallados)].join(' ')}`);
  }
});

test('index.html: sin scripts ni estilos en línea y sin recursos de afuera', () => {
  const html = leer('public/index.html');
  assert.doesNotMatch(html, /<style/i, 'nada de <style>');
  assert.doesNotMatch(html, /\sstyle\s*=/i, 'nada de atributos style');
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'nada de onclick y similares');
  for (const [, attrs] of html.matchAll(/<script\b([^>]*)>/gi)) assert.match(attrs, /\ssrc=/, 'todo script con src');
  for (const [, url] of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/gi)) assert.doesNotMatch(url, /^(https?:)?\/\//, url);
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    if (/rel="canonical"/.test(tag)) continue;
    const url = (tag.match(/href="([^"]+)"/) || [])[1] || '';
    assert.doesNotMatch(url, /^(https?:)?\/\//, `${tag} carga algo de afuera`);
  }
});

test('index.html: precarga todos los módulos que importa app.js, y ninguno de más', () => {
  const html = leer('public/index.html');
  const precargados = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map(m => path.posix.join('public', m[1]));
  // el árbol de imports, a partir de app.js
  const vistos = new Set();
  const recorrer = rel => {
    if (vistos.has(rel)) return;
    vistos.add(rel);
    for (const [, a, b] of leer(rel).matchAll(/(?:import|export)[^'";]*?from\s*['"]([^'"]+)['"]|import\s*\(?\s*['"]([^'"]+)['"]/g)) {
      recorrer(path.posix.join(path.posix.dirname(rel), a || b));
    }
  };
  recorrer('public/js/app.js');
  vistos.delete('public/js/app.js'); // app.js ya lo pide el <script>
  assert.deepEqual([...precargados].sort(), [...vistos].sort());
});

test('index.html: los botones grandes esperan al código con «Cargando…»', () => {
  const html = leer('public/index.html');
  for (const id of ['empezar', 'reto']) {
    const boton = html.match(new RegExp(`<button id="${id}"[^>]*>[\\s\\S]*?</button>`))[0];
    assert.match(boton, /\sdisabled[\s>]/, id);
    assert.match(boton, /Cargando…/, id);
  }
  assert.match(leer('public/js/app.js'), /for \(const id of \['empezar', 'reto'\]\) \$\(id\)\.disabled = false;/);
});

test('estilo.css: sin @import ni recursos de afuera', () => {
  const css = leer('public/estilo.css');
  assert.doesNotMatch(css, /@import/);
  for (const [, url] of css.matchAll(/url\(\s*['"]?([^'")]+)/g)) assert.doesNotMatch(url, /^(https?:)?\/\//, url);
});

test('el núcleo determinista no usa azar, reloj ni trigonometría', () => {
  for (const f of archivos('public/js/motor', /\.js$/)) {
    const codigo = sinComentarios(leer(f));
    for (const prohibido of [/Math\.random/, /Date\.now/, /new Date/, /performance\.now/, /Math\.(sin|cos|tan|atan2?|sqrt|pow|hypot|exp|log)\b/, /requestAnimationFrame/, /setTimeout/]) {
      assert.doesNotMatch(codigo, prohibido, `${f} usa ${prohibido}`);
    }
  }
});

test('el manifiesto se lee y sus íconos existen', () => {
  const m = JSON.parse(leer('public/manifest.webmanifest'));
  assert.equal(m.lang, 'es');
  for (const i of m.icons) assert.ok(readFileSync(path.join(RAIZ, 'public', i.src)).length > 0, i.src);
});
