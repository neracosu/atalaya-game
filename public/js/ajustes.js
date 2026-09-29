// Los ajustes del jugador, con sus valores de siempre. Antes había un solo ajuste de «sonido»; ahora la música y
// los efectos van por separado. Quien tenía el sonido apagado sigue en silencio: los dos quedan apagados.

export const VOLUMEN_MUSICA = 0.4; // bajo: la música acompaña, no manda

export const POR_DEFECTO = { musica: true, efectos: true, volumenMusica: VOLUMEN_MUSICA, vibracion: true, asistido: false, movimiento: false };

export function ajustesDe(guardados) {
  const a = guardados && typeof guardados === 'object' && !Array.isArray(guardados) ? { ...guardados } : {};
  if ('sonido' in a) {
    const si = a.sonido !== false;
    if (!('musica' in a)) a.musica = si;
    if (!('efectos' in a)) a.efectos = si;
    delete a.sonido;
  }
  const r = { ...POR_DEFECTO, ...a };
  for (const k of ['musica', 'efectos', 'vibracion', 'asistido', 'movimiento']) r[k] = !!r[k];
  const v = Number(r.volumenMusica);
  r.volumenMusica = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : VOLUMEN_MUSICA;
  return r;
}
