// Genera la tarjeta al compartir el enlace (public/tarjeta.png, 1200x630) y los íconos
// (public/apple-touch-icon.png, public/icono-192.png y public/icono-512.png) con el arte del juego.
//
// Usa Playwright y Chromium ya instalados en la máquina; el repo no agrega dependencias. Por ejemplo:
//   PLAYWRIGHT_CORE=/ruta/a/node_modules/playwright-core CHROMIUM=/ruta/a/chrome node scripts/tarjeta.mjs
// Sin PLAYWRIGHT_CORE busca «playwright-core» o «playwright» como paquete; sin CHROMIUM usa el navegador de Playwright.
//
// La página scripts/tarjeta.html dibuja todo en canvas; aquí solo se sirve el repo a esa página sin abrir ningún
// puerto (las peticiones se atienden dentro de Playwright) y se guardan los PNG que devuelve.

import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEN = 'https://postales.local';
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };

function cargarPlaywright() {
  const candidatos = [process.env.PLAYWRIGHT_CORE, 'playwright-core', 'playwright'].filter(Boolean);
  for (const c of candidatos) {
    try { return require(c); } catch { }
  }
  console.error('No encontré Playwright. Indique la ruta con PLAYWRIGHT_CORE=/ruta/a/node_modules/playwright-core');
  process.exit(1);
}

const { chromium } = cargarPlaywright();
const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
try {
  const pagina = await navegador.newPage({ viewport: { width: 1300, height: 900 } });
  const errores = [];
  pagina.on('pageerror', e => errores.push(String(e)));
  await pagina.route(`${ORIGEN}/**`, async ruta => {
    const rel = decodeURIComponent(new URL(ruta.request().url()).pathname).replace(/^\/+/, '');
    const archivo = path.resolve(RAIZ, rel);
    if (!archivo.startsWith(RAIZ + path.sep)) return ruta.fulfill({ status: 403, body: '' });
    try {
      const cuerpo = await readFile(archivo);
      await ruta.fulfill({ status: 200, body: cuerpo, contentType: TIPOS[path.extname(archivo)] || 'application/octet-stream' });
    } catch { await ruta.fulfill({ status: 404, body: '' }); }
  });
  await pagina.goto(`${ORIGEN}/scripts/tarjeta.html`);
  const postales = await pagina.evaluate(() => window.postales);
  if (errores.length) throw new Error(errores.join('\n'));
  for (const [nombre, url] of Object.entries(postales)) {
    const destino = path.join(RAIZ, 'public', nombre);
    await writeFile(destino, Buffer.from(url.split(',')[1], 'base64'));
    console.log('escrito', path.relative(RAIZ, destino));
  }
} finally {
  await navegador.close();
}
