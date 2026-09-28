// «El peaje de su sitio»: cómo se lee cada respuesta de la revisión y qué va en la imagen para compartir.
// La respuesta imita la de la nube (GET /api/revision): { dominio, fallas, puntos: [{ id, ok, titulo, detalle }] }.
import test from 'node:test';
import assert from 'node:assert/strict';
import { leerRespuesta, errorDeRed, datosImagenPuerta, textoCompartir, limpiarDominio, DOMINIO } from '../public/js/puerta.js';
import { T } from '../public/js/textos.js';

const DOM = 'tienda-de-prueba.example';
const PUNTOS = [
  { id: 'spf', ok: true, titulo: 'SPF', detalle: 'Existe y termina en -all' },
  { id: 'dmarc', ok: false, titulo: 'DMARC', detalle: 'No tiene: nadie frena el correo falso con su nombre' },
  { id: 'certificado', ok: true, titulo: 'Certificado', detalle: 'Válido, de Una Autoridad, vence en 60 días' },
  { id: 'https', ok: true, titulo: 'Redirige a https', detalle: 'http:// lo lleva a https://' },
  { id: 'hsts', ok: false, titulo: 'HSTS', detalle: 'No lo envía: el navegador podría entrar sin cifrar' },
  { id: 'cabeceras', ok: false, titulo: 'Cabeceras de seguridad', detalle: `Tiene 1 de 4 en ${DOM}` },
  { id: 'responde', ok: true, titulo: 'El sitio responde', detalle: 'Respondió con código 200' },
];

test('una revisión buena se lee con sus siete puntos y sus fallas', () => {
  const r = leerRespuesta(200, { dominio: DOM, fallas: 3, puntos: PUNTOS });
  assert.equal(r.ok, true);
  assert.equal(r.informe.puntos.length, 7);
  assert.equal(r.informe.fallas, 3);
  assert.equal(T.suSitio.fallas(r.informe.fallas), 'Su puerta: 3 fallas');
  assert.equal(T.suSitio.fallas(0), 'Su puerta: sin fallas a la vista');
  assert.equal(T.suSitio.fallas(1), 'Su puerta: 1 falla');
});

test('las fallas se cuentan de los puntos, aunque la cifra venga mal', () => {
  const r = leerRespuesta(200, { dominio: DOM, fallas: 0, puntos: PUNTOS });
  assert.equal(r.informe.fallas, 3);
});

test('una respuesta 200 incompleta o rara no se muestra como informe', () => {
  for (const cuerpo of [null, {}, { puntos: [] }, { puntos: 'x' }, { puntos: [{ ok: true }] }]) {
    const r = leerRespuesta(200, cuerpo);
    assert.equal(r.ok, false, JSON.stringify(cuerpo));
    assert.equal(r.mensaje, T.suSitio.errores.incompleta);
  }
});

test('los textos de la revisión se limpian y se acortan', () => {
  const r = leerRespuesta(200, { puntos: [{ id: 'x', ok: 'true', titulo: 'A\u0000B', detalle: 'd'.repeat(500) }] });
  assert.equal(r.informe.puntos[0].ok, false, 'solo ok === true cuenta como bien');
  assert.equal(r.informe.puntos[0].titulo, 'A B');
  assert.ok(r.informe.puntos[0].detalle.length <= 140);
});

test('cada error de la nube se muestra con su propio mensaje', () => {
  const casos = [
    [400, 'Escriba solo el dominio de su sitio, por ejemplo susitio.com', 'invalido'],
    [403, 'Esta revisión solo se puede usar desde el juego de Atalaya.', 'origen'],
    [404, 'No encontramos ese dominio. Revise que esté bien escrito.', 'noExiste'],
    [429, 'Ya hizo muchas revisiones en esta hora. Intente de nuevo más tarde.', 'espera'],
    [429, 'Llegó al máximo de revisiones de hoy. Vuelva mañana.', 'espera'],
    [503, 'La revisión está en pausa. Intente más tarde.', 'pausa'],
    [500, 'No se pudo hacer la revisión. Intente de nuevo.', 'caida'],
  ];
  for (const [estado, error, clase] of casos) {
    const r = leerRespuesta(estado, { error });
    assert.deepEqual(r, { ok: false, clase, mensaje: error });
  }
});

test('sin el JSON de la revisión (nube caída o todavía sin publicar), un mensaje propio', () => {
  const E = T.suSitio.errores;
  assert.equal(leerRespuesta(404, null).mensaje, E.noAbierta);
  assert.equal(leerRespuesta(502, null).mensaje, E.caida);
  assert.equal(leerRespuesta(503, null).mensaje, E.pausa);
  assert.equal(leerRespuesta(429, null).mensaje, E.espera);
  assert.equal(leerRespuesta(403, {}).mensaje, E.origen);
  assert.equal(leerRespuesta(418, null).mensaje, E.caida);
  assert.equal(errorDeRed(new TypeError('Failed to fetch'), true).mensaje, E.noDisponible);
  assert.equal(errorDeRed(new TypeError('Failed to fetch'), false).mensaje, E.sinConexion);
  assert.equal(errorDeRed(Object.assign(new Error('x'), { name: 'AbortError' }), true).mensaje, E.tiempo);
});

test('la imagen para compartir y su texto nunca llevan el dominio', () => {
  const { informe } = leerRespuesta(200, { dominio: DOM, fallas: 3, puntos: PUNTOS.map(p => p.id === 'hsts' ? { ...p, titulo: `HSTS de ${DOM.toUpperCase()}` } : p) });
  const img = datosImagenPuerta(informe, DOM);
  const todo = JSON.stringify(img) + textoCompartir(informe);
  assert.ok(!todo.toLowerCase().includes(DOM), todo);
  assert.equal(img.puntos.length, 7);
  assert.deepEqual(img.puntos.map(p => p.ok), PUNTOS.map(p => p.ok));
  assert.equal(img.resumen, '3 fallas');
  assert.ok(!('detalle' in img.puntos[0]), 'los detalles no van en la imagen');
  assert.match(textoCompartir(informe), /3 de 7 puntos con fallas/);
});

test('el dominio se limpia como lo copia el navegador', () => {
  assert.equal(limpiarDominio(' https://www.Tienda-De-Prueba.example/ruta?x=1 '), DOM);
  assert.ok(DOMINIO.test(DOM));
  assert.ok(!DOMINIO.test(limpiarDominio('localhost')));
  assert.ok(!DOMINIO.test(limpiarDominio('10.0.0.1')));
});
