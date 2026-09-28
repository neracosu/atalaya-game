// Compartir una imagen con su texto: la hoja de compartir del teléfono si deja mandar archivos; si no, solo el
// texto; y si tampoco hay hoja, se copia el texto y la imagen queda para descargar en el aviso.
// Lo usan el resultado de la partida y el informe de «Su puerta».

import { T } from './textos.js';

const enlaces = new WeakMap(); // aviso -> URL de la imagen que ofrece, para soltarla al reemplazarla

// archivo: un File (o null). La imagen se prepara antes del toque: algunos navegadores solo dejan compartir en el
// instante del toque, y armarla ahí lo haría tarde.
export async function compartir({ texto, archivo, aviso, nombre }) {
  if (archivo && navigator.canShare) {
    try {
      if (navigator.canShare({ files: [archivo] })) { await navigator.share({ files: [archivo], text: texto }); return 'hoja'; }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancelado'; }
  }
  try {
    if (navigator.share) { await navigator.share({ text: texto }); return 'hoja'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelado'; }
  aviso.replaceChildren();
  try { await navigator.clipboard.writeText(texto); aviso.append(T.fin.copiado); } catch { }
  if (archivo) {
    if (enlaces.has(aviso)) URL.revokeObjectURL(enlaces.get(aviso));
    const url = URL.createObjectURL(archivo);
    enlaces.set(aviso, url);
    const a = document.createElement('a');
    a.textContent = T.imagen.descargar;
    a.href = url;
    a.download = nombre || archivo.name;
    aviso.append(aviso.childNodes.length ? ' ' : '', a);
  }
  aviso.hidden = !aviso.childNodes.length;
  return 'aviso';
}

// Un canvas como archivo PNG, o null si el navegador no pudo
export async function aArchivo(canvas, nombre) {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  return blob ? new File([blob], nombre, { type: 'image/png' }) : null;
}
