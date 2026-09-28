// Jugadores simulados para las pruebas y para afinar las estrellas. Usan su propio azar, aparte del de la partida.
import { crearPartida, jugar, avanzar, resumen, TIPOS } from '../public/js/motor/peaje.js';
import { crearAzar } from '../public/js/motor/azar.js';

// reaccion: pasos que tarda en decidir desde que el auto llega; error: milésimas de equivocarse
export function jugarCon(nivel, { reaccionMin = 0, reaccionMax = 0, error = 0, semillaBot = 7 } = {}) {
  const p = crearPartida(nivel);
  const azar = crearAzar(semillaBot);
  let objetivo = null, cuando = 0;
  while (!p.terminada) {
    const frente = p.fila[0];
    if (frente && p.paso >= frente.listoEn) {
      if (objetivo !== frente.id) { objetivo = frente.id; cuando = p.paso + azar.entre(reaccionMin, reaccionMax); }
      if (p.paso >= cuando) {
        let bien = TIPOS[frente.tipo].bueno ? 'P' : 'B';
        if (azar.milesimas(error)) bien = bien === 'P' ? 'B' : 'P';
        if (jugar(p, bien)) objetivo = -1;
      }
    }
    avanzar(p);
  }
  return { resumen: resumen(p), jugadas: p.jugadas };
}
