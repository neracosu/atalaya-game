// «El peaje de su sitio»: el jugador escribe su dominio y la nube de Atalaya revisa lo que cualquiera puede ver
// (GET /api/revision?dominio=). El resultado es el informe «Su puerta: N fallas», que se puede compartir como
// imagen sin mostrar el dominio, y cierra con la invitación a que Atalaya lo vigile.
//
// La respuesta de la nube: 200 { dominio, fallas, puntos: [{ id, ok, titulo, detalle }] }, o un error
// (400, 403, 404, 429, 500, 503) con { error }. Si la nube no contesta, o contesta sin su JSON (todavía no está
// publicada), se dice con palabras propias.
//
// Las funciones de arriba no tocan la página (se prueban en Node); las de abajo arman el informe.

import { T } from './textos.js';
import { aSVG, PUERTA, PALETA_PUERTA, PALETA_PUERTA_FALLAS, BIEN, FALLA, PALETA_MARCAS } from './dibujo/sprites.js';
import { imagenPuerta, fuentesListas } from './dibujo/postal.js';
import { compartir, aArchivo } from './compartir.js';

export const NUBE = 'https://nube.neracosu.com';
const ESPERA_MS = 15000; // la revisión tiene un tope de 12 s en la nube
const MAX_PUNTOS = 12;

export const DOMINIO = /^(?=.{4,253}$)(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;
export function limpiarDominio(v) {
  return String(v || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[/?#].*$/, '').replace(/\.$/, '');
}

const texto = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n) : '');

// Lo que se muestra a partir del código HTTP y del cuerpo ya leído (null si no era JSON).
// Devuelve { ok: true, informe: { fallas, puntos } } o { ok: false, clase, mensaje }.
export function leerRespuesta(estado, cuerpo) {
  const E = T.suSitio.errores;
  if (estado === 200) {
    const lista = cuerpo && Array.isArray(cuerpo.puntos) ? cuerpo.puntos : null;
    if (!lista || !lista.length) return { ok: false, clase: 'incompleta', mensaje: E.incompleta };
    const puntos = lista.slice(0, MAX_PUNTOS).map(p => ({
      id: texto(p && p.id, 20),
      ok: !!(p && p.ok === true),
      titulo: texto(p && p.titulo, 40),
      detalle: texto(p && p.detalle, 140),
    })).filter(p => p.titulo);
    if (!puntos.length) return { ok: false, clase: 'incompleta', mensaje: E.incompleta };
    // las fallas se cuentan de los puntos que se muestran, para que el título y la lista digan lo mismo
    return { ok: true, informe: { fallas: puntos.filter(p => !p.ok).length, puntos } };
  }
  const clase = { 400: 'invalido', 403: 'origen', 404: 'noExiste', 429: 'espera', 503: 'pausa' }[estado] || 'caida';
  const propio = cuerpo && texto(cuerpo.error, 200);
  if (propio) return { ok: false, clase, mensaje: propio };
  // sin el JSON de la revisión: la ruta todavía no existe en la nube, o algo delante de ella respondió
  if (estado === 404) return { ok: false, clase: 'noAbierta', mensaje: E.noAbierta };
  if (estado === 400) return { ok: false, clase, mensaje: T.suSitio.invalido };
  return { ok: false, clase, mensaje: E[clase] || E.caida };
}

// Cuando fetch ni siquiera trajo una respuesta: sin conexión, tiempo agotado, o la nube no deja leerla (caída, o
// sin la ruta publicada: ahí el navegador ve un error de red porque la página de error no trae permiso de CORS)
export function errorDeRed(e, enLinea = true) {
  const E = T.suSitio.errores;
  if (e && e.name === 'AbortError') return { ok: false, clase: 'tiempo', mensaje: E.tiempo };
  if (!enLinea) return { ok: false, clase: 'sinConexion', mensaje: E.sinConexion };
  return { ok: false, clase: 'noDisponible', mensaje: E.noDisponible };
}

// Borra el dominio de un texto (por si algún detalle lo trajera)
function sinDominio(t, dominio) {
  if (!dominio) return t;
  const partes = t.split(new RegExp(dominio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
  return partes.join('...');
}

// Lo que va en la imagen para compartir. Nunca el dominio: ni el campo, ni los detalles (pueden traer nombres).
export function datosImagenPuerta(informe, dominio) {
  const total = informe.puntos.length;
  return {
    rotulo: T.imagen.rotulo,
    titulo: T.suSitio.imagenTitulo,
    resumen: T.suSitio.resumen(informe.fallas),
    fallas: informe.fallas,
    detalle: T.suSitio.detalle(total),
    puntos: informe.puntos.map(p => ({ titulo: sinDominio(p.titulo, dominio), ok: p.ok })),
    bien: T.suSitio.bien,
    falla: T.suSitio.falla,
    direccion: T.imagen.direccion,
  };
}

export function textoCompartir(informe) {
  return T.suSitio.tarjeta(informe.fallas, informe.puntos.length);
}

// ------------------------------------------------------------------ en la página

function el(tag, clase, contenido) {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  if (contenido !== undefined) e.textContent = contenido;
  return e;
}

// La revisión en sí: devuelve lo que leerRespuesta o errorDeRed dijeron
export async function revisar(dominio, { url = NUBE } = {}) {
  const ctl = new AbortController();
  const reloj = setTimeout(() => ctl.abort(), ESPERA_MS);
  try {
    const res = await fetch(`${url}/api/revision?dominio=${encodeURIComponent(dominio)}`, { signal: ctl.signal, credentials: 'omit' });
    let cuerpo = null;
    try { cuerpo = await res.json(); } catch { }
    return leerRespuesta(res.status, cuerpo);
  } catch (e) {
    return errorDeRed(e, navigator.onLine !== false);
  } finally {
    clearTimeout(reloj);
  }
}

async function prepararImagen(informe, dominio) {
  try {
    await fuentesListas();
    return await aArchivo(imagenPuerta(datosImagenPuerta(informe, dominio)), T.suSitio.archivo);
  } catch { return null; }
}

function pintarInforme(inf, informe, dominio, medir) {
  const caja = el('div', informe.fallas ? 'puerta con-fallas' : 'puerta');
  const cabeza = el('div', 'puerta-cabeza');
  const dibujo = el('div', 'puerta-dibujo');
  dibujo.innerHTML = aSVG(PUERTA, informe.fallas ? PALETA_PUERTA_FALLAS : PALETA_PUERTA);
  const titulos = el('div', 'puerta-titulos');
  titulos.append(el('p', 'puerta-titulo', T.suSitio.fallas(informe.fallas)), el('p', 'puerta-sub', T.suSitio.detalle(informe.puntos.length)));
  cabeza.append(dibujo, titulos);

  const lista = el('ul', 'puerta-puntos');
  for (const p of informe.puntos) {
    const li = el('li', p.ok ? 'punto' : 'punto falla');
    const marca = el('span', 'marca-punto');
    marca.innerHTML = aSVG(p.ok ? BIEN : FALLA, PALETA_MARCAS);
    const cuerpo = el('div', 'punto-cuerpo');
    const fila = el('p', 'punto-fila');
    fila.append(el('b', '', p.titulo), el('span', 'estado', p.ok ? T.suSitio.bien : T.suSitio.falla));
    cuerpo.append(fila);
    if (p.detalle) cuerpo.append(el('p', 'punto-detalle', p.detalle));
    li.append(marca, cuerpo);
    lista.append(li);
  }

  // compartir: la imagen se arma ya, para que esté lista al tocar
  const imagen = prepararImagen(informe, dominio);
  const botonCompartir = el('button', 'boton', T.suSitio.compartir);
  botonCompartir.type = 'button';
  const aviso = el('p', 'compartido');
  aviso.hidden = true;
  botonCompartir.addEventListener('click', async () => {
    medir('compartir-puerta');
    await compartir({ texto: textoCompartir(informe), archivo: await imagen, aviso, nombre: T.suSitio.archivo });
  });
  const acciones = el('div', 'puerta-compartir');
  acciones.append(botonCompartir, el('p', 'puerta-nota', T.suSitio.sinDominio), aviso);

  const vigilar = el('a', 'boton principal', T.suSitio.atalaya);
  vigilar.href = `${NUBE}/vigilar?dominio=${encodeURIComponent(dominio)}`;
  vigilar.rel = 'noopener';
  vigilar.addEventListener('click', () => medir('ir-atalaya'));

  caja.append(cabeza, lista, acciones);
  inf.replaceChildren(caja, el('p', 'cierre', T.suSitio.cierre), vigilar);
}

function pintarError(inf, r) {
  const caja = el('div', `puerta-error ${r.clase}`);
  const marca = el('span', 'marca-punto');
  marca.innerHTML = aSVG(FALLA, PALETA_MARCAS);
  const txt = el('div');
  // si el dominio está mal escrito no hubo revisión: basta con decir cómo escribirlo
  if (r.clase !== 'invalido') txt.append(el('p', 'puerta-error-titulo', T.suSitio.noSePudo));
  txt.append(el('p', '', r.mensaje));
  caja.append(marca, txt);
  inf.replaceChildren(caja);
}

// Conecta un formulario «¿Y su sitio?». medir(evento) es el contador de la analítica (puede no hacer nada).
export function conectarRevision(form, { medir = () => { } } = {}) {
  const boton = form.querySelector('button[type="submit"]');
  const inf = form.parentElement.querySelector('.informe');
  let ocupado = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (ocupado) return;
    const dominio = limpiarDominio(form.querySelector('.dominio').value);
    if (!DOMINIO.test(dominio)) { pintarError(inf, { clase: 'invalido', mensaje: T.suSitio.invalido }); return; }
    ocupado = true;
    boton.disabled = true;
    inf.replaceChildren(el('p', 'revisando', T.suSitio.revisando));
    medir('dominio');
    const r = await revisar(dominio);
    ocupado = false;
    boton.disabled = false;
    if (r.ok) pintarInforme(inf, r.informe, dominio, medir);
    else pintarError(inf, r);
  });
}
