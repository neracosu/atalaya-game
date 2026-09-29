// Atalaya: la guardia. Etapa 0: El peaje, el reto del día sin tabla y «El peaje de su sitio».

import { nivelPeaje, crearPartida, jugar, avanzar, resumen, estrellasDe, ESTRELLAS, multiplicador, PASOS_POR_SEGUNDO } from './motor/peaje.js';
import { crearEscena } from './dibujo/escena.js';
import { imagenResultado, fuentesListas } from './dibujo/postal.js';
import { SPRITES, PALETAS, TORRE, PALETA_TORRE_ENCENDIDA, ESTRELLA, TORRECITA, LENTE_CASTILLO, PALETA_LENTE, ARANA, PALETA_ARANA, CALENDARIO, PALETA_CALENDARIO,
  CUADERNO, PALETA_CUADERNO, aSVG } from './dibujo/sprites.js';
import { retoDeHoy, leer, guardar, rachaActual, registrarReto, bloques, cargarAnoche, hoyEnVenezuela } from './reto.js';
import { conectarRevision } from './puerta.js';
import { compartir, aArchivo } from './compartir.js';
import { T } from './textos.js';
import * as S from './sonido.js';
import { medir } from './medir.js';
import { debeVerse, marcarVista, crearControl, GUION, GUION_QUIETO, GUION_CORTO, GUION_CORTO_QUIETO, lineasDeHistoria, crearHistoria,
  avanzarHistoria, verHistoria } from './apertura.js';
import { tocaGiro, marcarGiro, crearGiro } from './giro.js';
import { crearMusica, cargaDe } from './musica.js';
import { ajustesDe } from './ajustes.js';
import { crearDibujoApertura } from './dibujo/apertura.js'; // el embudo, sin cookies ni datos personales (ver medir.js)

const REPO = 'https://github.com/neracosu/atalaya-game';
const ATALAYA = 'https://neracosu.com/atalaya';

const $ = id => document.getElementById(id);
let datos = leer();
// los ajustes, con la música y los efectos por separado (el viejo «sonido» se migra: apagado sigue apagado)
datos.ajustes = ajustesDe(datos.ajustes);

// La música (musica.js) usa el contexto de sonido.js, que solo existe después del primer toque: antes, nada suena.
let mus = null;
function musica() {
  if (!mus && S.contexto() && S.salidaMusica()) try { mus = crearMusica(S.contexto(), S.salidaMusica()); mus.mudo(!datos.ajustes.musica); } catch { mus = null; }
  return mus;
}
function aplicarSonido() {
  S.activarEfectos(datos.ajustes.efectos);
  S.ajustarMusica(datos.ajustes.musica, datos.ajustes.volumenMusica);
  if (mus) mus.mudo(!datos.ajustes.musica);
}

const menosMovimiento = () => datos.ajustes.movimiento || matchMedia('(prefers-reduced-motion: reduce)').matches;
const escena = crearEscena($('mundo'), { menosMovimiento });

function vibrar(ms) { if (datos.ajustes.vibracion && navigator.vibrate) try { navigator.vibrate(ms); } catch { } }

function mostrar(id) {
  for (const p of document.querySelectorAll('.pantalla')) p.classList.toggle('activa', p.id === id);
  // solo la portada se desplaza (y en computadora se abre a dos columnas); la partida nunca
  $('app').classList.toggle('en-portada', id === 'portada');
  if (id === 'juego') escena.redimensionar();
}

// crea un elemento con su clase y su texto (siempre como texto, nunca como HTML)
function el(tag, clase, texto) {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

// ---------- portada ----------
function portada() {
  $('torre-portada').innerHTML = aSVG(TORRE, PALETA_TORRE_ENCENDIDA);
  $('ver-apertura').textContent = T.apertura.ver;
  pintarReto();
  for (const [id, k] of [['aj-asistido', 'asistido'], ['aj-musica', 'musica'], ['aj-efectos', 'efectos'], ['aj-vibracion', 'vibracion'], ['aj-movimiento', 'movimiento']]) {
    $(id).checked = !!datos.ajustes[k];
    $(id).onchange = () => { datos.ajustes[k] = $(id).checked; guardar(datos); aplicarSonido(); $('aj-volumen').disabled = !datos.ajustes.musica; };
  }
  $('aj-volumen').value = String(Math.round(datos.ajustes.volumenMusica * 100));
  $('aj-volumen').disabled = !datos.ajustes.musica;
  $('aj-volumen').oninput = () => { datos.ajustes.volumenMusica = Number($('aj-volumen').value) / 100; aplicarSonido(); };
  $('aj-volumen').onchange = () => guardar(datos);
  aplicarSonido();
  if (mus) mus.parar();
  mostrar('portada');
  $('portada').scrollTop = 0;
}

// ---------- el reto del día, con el tono de la noche real si llegó datos/anoche.json ----------
let anoche = null;
function pintarReto() {
  const r = retoDeHoy(Date.now(), anoche);
  const hecho = datos.retos && datos.retos[r.fecha];
  $('reto-titulo').textContent = hecho ? T.retoHecho : T.reto(r.numero);
  $('reto-detalle').textContent = hecho ? `${hecho.estrellas} de 3 estrellas · ${T.cambios[r.cambio]}` : T.cambios[r.cambio];
  $('reto-tono').hidden = !r.tono;
  $('reto-tono').textContent = r.tono ? T.tonos[r.tono.id](r.tono.cifra) : '';
  const racha = rachaActual(datos, r.fecha);
  $('racha').hidden = !racha;
  $('racha').textContent = T.racha(racha);
}
function leerAnoche() {
  return cargarAnoche(hoyEnVenezuela()).then(d => { anoche = d; return d; });
}
// el reto espera al archivo (casi siempre ya llegó): así nadie juega sin el tono por tocar muy rápido
function empezarReto() {
  S.despertar();
  leerAnoche().then(() => empezar('reto'));
}

// ---------- la sección de abajo de la portada ----------
function pintarLanding() {
  const L = T.landing;
  const caja = el('div', 'landing-caja');

  const que = el('section', 'bloque que');
  que.append(el('p', 'rotulo', L.rotulo), el('p', 'que-texto', L.que));

  const como = el('section', 'bloque como');
  const lista = el('ol', 'pasos');
  L.pasos.forEach((paso, i) => {
    const li = el('li', 'paso');
    const calle = el('div', `paso-calle paso-${i + 1}`);
    if (i === 0) calle.innerHTML = `${autoSVG('cliente')}<b class="marca si">${T.marcas.pasa}</b>`;
    else if (i === 1) calle.innerHTML = `${autoSVG('sospechoso')}<b class="marca no">${T.marcas.no}</b>`;
    else {
      calle.innerHTML = `<span class="con-placa"><span class="placa buscador"></span>${autoSVG('buscador')}</span>` +
        `<span class="con-placa"><span class="placa wp"></span>${autoSVG('wp')}</span>`;
      calle.querySelector('.placa.buscador').textContent = T.placas.buscador;
      calle.querySelector('.placa.wp').textContent = T.placas.wp;
    }
    const txt = el('div', 'paso-texto');
    const h = el('h3');
    h.append(el('span', 'num', String(i + 1)), paso.titulo);
    txt.append(h, el('p', '', paso.texto));
    li.append(calle, txt);
    lista.append(li);
  });
  como.append(el('p', 'rotulo', L.comoRotulo), lista, el('p', 'teclado', L.teclado));

  const verdad = el('section', 'bloque verdad');
  verdad.append(el('p', 'rotulo', L.verdadRotulo), el('h2', '', L.verdadTitulo), el('p', '', L.verdadTexto));

  const atalaya = el('section', 'bloque atalaya');
  const enlace = el('a', 'boton', L.atalayaEnlace);
  enlace.href = ATALAYA; enlace.rel = 'noopener';
  enlace.addEventListener('click', () => medir('landing-atalaya'));
  const revision = el('div', 'revision');
  const form = el('form', 'form-sitio');
  form.noValidate = true;
  const input = el('input', 'dominio');
  Object.assign(input, { name: 'dominio', type: 'text', inputMode: 'url', autocomplete: 'url', spellcheck: false, placeholder: T.suSitio.placeholder });
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('aria-label', T.suSitio.etiqueta);
  const boton = el('button', 'boton principal', T.suSitio.boton);
  boton.type = 'submit';
  form.append(input, boton);
  const informe = el('div', 'informe');
  informe.setAttribute('aria-live', 'polite');
  revision.append(el('h3', '', L.revisionTitulo), el('p', '', T.suSitio.texto), form, informe);
  atalaya.append(el('p', 'rotulo', L.atalayaRotulo), el('h2', 'marca-atalaya', L.atalayaTitulo), el('p', '', L.atalayaTexto), enlace, revision);

  const abierto = el('section', 'bloque abierto');
  const repo = el('a', '', L.abiertoEnlace);
  repo.href = REPO; repo.rel = 'noopener';
  const p = el('p', '', L.abiertoTexto + ' ');
  p.append(repo);
  abierto.append(el('p', 'rotulo', L.abiertoRotulo), p);

  const ia = el('section', 'bloque ia');
  ia.append(el('h3', '', L.iaTitulo), el('p', '', L.iaTexto));

  const cierre = el('button', 'boton principal cierre', L.cierre);
  cierre.type = 'button';
  cierre.addEventListener('click', () => { medir('landing-empezar'); tomarGuardia('partida'); });

  caja.append(que, como, verdad, atalaya, abierto, ia, cierre);
  $('landing').replaceChildren(caja);
}


// ---------- la apertura: «La torre vacía» ----------
// La primera vez que se toma la guardia, la corta: la cámara baja a la barrera en menos de dos segundos y la
// partida arranca con el primer auto llegando; la historia se escribe arriba, en las pausas (ver historia, abajo).
// Un toque durante la bajada la acorta y cuenta como jugada. La larga, de unos quince segundos, desde los ajustes:
// ahí el toque que la salta no cuenta. Empieza con el primer toque (así el sonido puede sonar) y termina dentro de
// la partida. Se salta con un toque, Espacio, Enter o Escape. Si algo falla o tarda, se juega igual.
const almacen = () => localStorage;
let apertura = null;

function tomarGuardia(tipo) {
  if (debeVerse(almacen)) verApertura(tipo, { corta: true });
  else if (tipo === 'reto') empezarReto();
  else empezar(tipo);
}

function verApertura(tipo = 'partida', { corta = false } = {}) {
  if (apertura) return;
  // el guion cuenta desde el toque, no desde que el dibujo quedó armado: así el primer auto no se atrasa
  const inicio = performance.now();
  S.despertar();
  marcarVista(almacen);
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  const guion = corta ? (menosMovimiento() ? GUION_CORTO_QUIETO : GUION_CORTO) : menosMovimiento() ? GUION_QUIETO : GUION;
  const lineas = corta ? [] : T.apertura.lineas;
  if (corta) { primeraJugadaDesde = inicio; empezarHistoria(inicio); }
  const capa = $('apertura'), aviso = $('apertura-saltar');
  const jugar = () => (tipo === 'reto' ? leerAnoche().then(() => empezar('reto', { torreEncendida: true })) : empezar(tipo, { torreEncendida: true }));
  let dibujo = null, apagarSonido = () => { }, vigia = 0, avisoT = 0, rafId = 0;
  aplicarSonido();

  const cerrar = () => {
    cancelAnimationFrame(rafId);
    clearTimeout(vigia); clearTimeout(avisoT);
    apagarSonido();
    capa.hidden = true;
    capa.classList.remove('sale');
    capa.style.opacity = '';
    aviso.classList.remove('visible');
    apertura = null;
  };
  const control = crearControl({
    guion, lineas,
    // vista entera: la partida arrancó por el guion, con la cámara ya en la barrera
    alEmpezarPartida: motivo => { if (motivo === 'guion') medir('apertura-completa'); capa.classList.add('sale'); try { jugar(); } catch { } },
    alTerminar: cerrar,
  });

  mostrar('juego');
  $('apertura-texto').textContent = lineas.join(' ');
  aviso.textContent = matchMedia('(hover: hover) and (pointer: fine)').matches ? T.apertura.saltarTeclado : T.apertura.saltar;
  capa.setAttribute('aria-label', T.apertura.etiqueta);
  capa.hidden = false;
  try {
    dibujo = crearDibujoApertura($('apertura-lienzo'), { lineas, nombre: T.chispa, hora: T.apertura.hora, guion });
    dibujo.dibujar(0, performance.now()); // el primer cuadro ya, en el mismo instante: nunca un hueco negro
  } catch {
    control.forzar();
    return;
  }
  // En la larga, el toque que la salta no cuenta como jugada: la capa se lo queda (ver abajo) y la partida empieza
  // después. En la corta sí cuenta: la partida arranca en el acto y el toque llega a ella.
  const aterriza = guion.corto ? guion.aterriza : guion.partida;
  apertura = { control, dibujo, corta, saltar: () => { const t = control.t; if (control.saltar() && t < aterriza) medir('apertura-saltada', t); capa.classList.add('sale'); apagarSonido(); } };
  // la música empieza grave con la larga; con la corta o con menos movimiento, directo el tema del peaje. Si la
  // música está apagada, queda el fondo grave de antes entre los efectos (solo en la larga).
  const m = datos.ajustes.musica ? musica() : null;
  if (m) { if (guion.quieto || corta) m.peaje(); else m.apertura(); }
  else if (!guion.quieto && !corta) apagarSonido = S.sonarAmbiente(guion.bajada / 1000 + 0.6) || (() => { });
  if (guion.quieto && !corta) S.sonarEncender();
  // en la corta no hace falta el aviso: dura menos de lo que tarda en leerse
  if (!corta) avisoT = setTimeout(() => aviso.classList.add('visible'), 700);
  // el reloj de seguridad: si los cuadros no llegan, se juega igual
  vigia = setTimeout(() => control.forzar(), guion.fin + 2500);

  const sonidos = { encender: S.sonarEncender, chispa: S.sonarChispa, letra: S.sonarLetra, niebla: S.sonarNiebla, aterriza: S.sonarAterriza };
  const cuadroApertura = ahora => {
    if (control.terminada) return;
    const golpes = control.avanzar(ahora - inicio);
    for (const gp of golpes) if (!guion.quieto || gp === 'encender') sonidos[gp] && sonidos[gp]();
    if (control.terminada) return;
    try { dibujo.dibujar(control.t, ahora); } catch (e) { console.error(e); control.forzar(); return; }
    capa.style.opacity = String(control.opacidad);
    rafId = requestAnimationFrame(cuadroApertura);
  };
  rafId = requestAnimationFrame(cuadroApertura);
}

// Un toque en cualquier lado la salta. En la larga, el toque no llega a la partida de abajo; en la corta, sí: es el
// mismo gesto de la partida (deslizar o tocar una mitad), y se decide al soltar.
for (const tipo of ['pointerdown', 'pointerup', 'click']) {
  $('apertura').addEventListener(tipo, e => {
    e.stopPropagation();
    if (tipo === 'pointerdown' && apertura) {
      if (apertura.corta) tocarAbajo(e);
      apertura.saltar();
    } else if (tipo === 'pointerup') soltarToque(e);
  });
}
addEventListener('keydown', e => {
  if (!apertura) return;
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || e.key === 'Spacebar') { e.preventDefault(); apertura.saltar(); }
  // en la corta, las flechas la saltan y juegan (las recibe la partida, más abajo)
  else if (apertura.corta && /^(ArrowRight|ArrowLeft|a|A|d|D)$/.test(e.key)) apertura.saltar();
}, true);
addEventListener('resize', () => { if (apertura) try { apertura.dibujo.redimensionar(); } catch { } });

// ---------- la historia en las pausas de la primera partida (la apertura corta) ----------
// Arriba, en el tercio superior, lejos del pulgar. Cada línea avanza solo si no hay un auto esperando decisión
// (apertura.js decide qué se ve; aquí solo se pinta). De paso, marca en el reloj del navegador cuándo asoma el
// primer auto y cuándo ya se puede decidir, para medir la apertura en las herramientas del navegador.
let historia = null;
const horaDelTelefono = () => { const d = new Date(); return { horas: d.getHours(), minutos: d.getMinutes() }; };

function empezarHistoria(inicio = performance.now()) {
  pararHistoria();
  try { performance.mark('guardia-toma', { startTime: inicio }); } catch { }
  historia = { inicio, estado: crearHistoria(lineasDeHistoria(T.apertura.historia, horaDelTelefono())), acierto: false, raf: 0,
    visto: '', lector: '', marcas: {} };
  $('historia-cuaderno').innerHTML = aSVG(CUADERNO, PALETA_CUADERNO);
  $('historia-cuaderno').setAttribute('aria-label', T.apertura.cuaderno);
  historia.raf = requestAnimationFrame(cuadroHistoria);
}

function pararHistoria() {
  if (!historia) return;
  cancelAnimationFrame(historia.raf);
  historia = null;
  $('historia').hidden = true;
}

function marcar(nombre) {
  if (historia.marcas[nombre]) return;
  historia.marcas[nombre] = true;
  try { performance.mark(nombre); } catch { }
}

function cuadroHistoria(ahora) {
  const h = historia;
  if (!h) return;
  // se termina la partida: la historia se va con ella
  if (partida && partida.terminada) { pararHistoria(); return; }
  const frente = partida && partida.fila[0];
  const esperando = !!partida && ((!!frente && partida.paso >= frente.listoEn) || partida.pausa > 0);
  if (frente) marcar('guardia-auto');
  if (esperando && frente) marcar('guardia-decidible');
  const antes = h.estado;
  h.estado = avanzarHistoria(antes, ahora - h.inicio, { esperando, acierto: h.acierto });
  const v = verHistoria(h.estado);
  // un golpecito de letra por cada dos nuevas, sin contar espacios
  if (v.escribiendo && v.letras > Math.floor(antes.letras) && v.letras % 2 === 0 && v.texto[v.letras - 1] !== ' ' && antes.i === h.estado.i) S.sonarLetra();
  const clave = `${v.id}|${v.letras}|${v.alfa.toFixed(2)}|${v.escribiendo}`;
  if (clave !== h.visto) {
    h.visto = clave;
    const caja = $('historia');
    caja.hidden = !v.id;
    if (v.id) {
      $('historia-texto').textContent = v.texto.slice(0, v.letras);
      caja.classList.toggle('escribiendo', v.escribiendo);
      caja.classList.toggle('con-cuaderno', v.cuaderno);
      caja.style.opacity = String(v.alfa);
      // para los lectores de pantalla, la línea entera una vez, no letra por letra
      if (h.lector !== v.id) { h.lector = v.id; $('historia-lector').textContent = v.texto; }
    }
  }
  if (h.estado.fin) { pararHistoria(); return; }
  h.raf = requestAnimationFrame(cuadroHistoria);
}

// ---------- partida ----------
let partida = null, modo = null, retoActual = null, bucle = 0, acumulado = 0, antes = 0, ayudaPaso = 0, finalizando = false;
// el reloj de la barrera: el auto que espera decisión (desde cuándo) y el instante de la última jugada
let espera = null, jugadaEn = 0;

function empezar(tipo, { torreEncendida = false } = {}) {
  S.despertar();
  modo = tipo;
  let nivel;
  if (tipo === 'reto') {
    retoActual = retoDeHoy(Date.now(), anoche);
    nivel = { ...retoActual.nivel, asistido: datos.ajustes.asistido };
  } else {
    retoActual = null;
    // cada partida suelta tiene su propia semilla; el tutorial solo la primera vez
    const semilla = (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0;
    nivel = nivelPeaje(semilla, { tutorial: !datos.jugo, asistido: datos.ajustes.asistido });
  }
  partida = crearPartida(nivel);
  finalizando = false;
  espera = null;
  // la historia es solo de la primera partida (la que viene de la apertura corta)
  if (historia && historia.partida) pararHistoria();
  if (historia) historia.partida = true;
  ayudaPaso = nivel.tutorial ? 1 : 0;
  escena.limpiar();
  mostrar('juego');
  pintarIntegridad();
  pintarReglas();
  $('puntos').textContent = '0';
  $('combo').textContent = 'x1';
  $('combo').classList.remove('alto');
  $('ayuda').hidden = true;
  $('tarjeta-regla').hidden = true;
  // si viene de la apertura, la torre ya está encendida: la luz sigue donde quedó
  if (torreEncendida) escena.encenderTorre(performance.now() - 1000);
  else setTimeout(() => escena.encenderTorre(performance.now()), 500);
  medir(tipo === 'reto' ? 'reto' : 'partida');
  // la música: si venía de la apertura, sigue sin corte; si no, el tema suave empieza en el próximo tiempo
  if (datos.ajustes.musica && musica()) mus.peaje();
  antes = performance.now();
  acumulado = 0;
  cancelAnimationFrame(bucle);
  bucle = requestAnimationFrame(cuadro);
  // el toque de la apertura corta que llegó antes de que hubiera partida (el reto espera su archivo)
  if (jugadaGuardada) { const a = jugadaGuardada; jugadaGuardada = null; decidir(a); }
}

const PASO_MS = 1000 / PASOS_POR_SEGUNDO;

function cuadro(ahora) {
  if (!partida) return;
  acumulado += Math.min(250, ahora - antes);
  antes = ahora;
  while (acumulado >= PASO_MS && !partida.terminada) {
    const evs = avanzar(partida);
    acumulado -= PASO_MS;
    if (evs.length) { escena.eventos(evs, partida); reaccionar(evs); }
  }
  // desde cuándo espera decisión el auto de adelante, para el reloj de la barrera
  const f = partida.fila[0];
  if (f && partida.paso >= f.listoEn && (!espera || espera.id !== f.id)) espera = { id: f.id, t: ahora };
  escena.dibujar(ahora);
  // cuánto aprieta la partida, para las capas de la música
  if (mus) mus.carga(cargaDe({ fila: partida.fila.length, filaMax: partida.nivel.fila, enRafaga: partida.enRafaga > 0, racha: partida.racha, paso: partida.paso, duracion: partida.nivel.duracion }));
  $('tiempo-barra').style.transform = `scaleX(${Math.max(0, 1 - partida.paso / partida.nivel.duracion)})`;
  if (partida.terminada) {
    if (!finalizando) { finalizando = true; setTimeout(terminar, 900); }
    // unos cuadros más para que los autos terminen de irse
  }
  bucle = requestAnimationFrame(cuadro);
}

let avisoT = 0;
function avisar(texto, clase = 'mal', ms = 1500) {
  const a = $('aviso');
  a.textContent = texto;
  a.className = `aviso visible ${clase}`;
  clearTimeout(avisoT);
  avisoT = setTimeout(() => { a.className = 'aviso'; }, ms);
}

// Lo que tardó la respuesta, en el reloj chico de la barrera: la siembra del giro (el Enjambre anota cuánto tarda
// la puerta). Si el toque llegó antes que el auto, la puerta contestó en el acto: 0 ms.
function relojDeRespuesta(id) {
  const ms = espera && espera.id === id ? Math.max(0, jugadaEn - espera.t) : 0;
  escena.mostrarReloj(T.reloj(ms));
}

function reaccionar(evs) {
  for (const ev of evs) {
    if (ev.e === 'bien' || ev.e === 'mal') relojDeRespuesta(ev.id);
    if (ev.e === 'bien') {
      const nivel = Math.min(((partida.racha / 5) | 0), 5);
      if (ev.accion === 'P') S.sonarPasa(nivel); else S.sonarSello(nivel);
      if (ev.subeCombo) {
        S.sonarCombo(nivel);
        const c = $('combo');
        c.classList.remove('sube'); void c.offsetWidth; c.classList.add('sube');
      }
      if (ayudaPaso) avanzarAyuda();
      if (historia) historia.acierto = true;
    } else if (ev.e === 'mal') {
      S.sonarError();
      vibrar(45);
      avisar(T.motivos[ev.motivo]);
      if (ev.integridad !== undefined) pintarIntegridad();
      if (ayudaPaso) avanzarAyuda();
    } else if (ev.e === 'cuela') {
      if (ev.malo) { S.sonarError(); vibrar(45); avisar(T.motivos.colado); pintarIntegridad(); }
    } else if (ev.e === 'regla') {
      S.sonarRegla();
      pintarReglas();
      tarjetaRegla(ev.id);
    } else if (ev.e === 'rafaga') {
      S.sonarRafaga();
      avisar(T.rafaga, 'rafaga', 1200);
    } else if (ev.e === 'frente' && ayudaPaso) {
      const auto = partida.fila[0];
      if (auto) ayuda(auto.tipo);
    }
  }
  $('puntos').textContent = partida.puntos.toLocaleString('es');
  const m = multiplicador(partida.racha);
  $('combo').textContent = `x${m}`;
  $('combo').classList.toggle('alto', m >= 3);
}

// el tutorial: los tres primeros autos de la primera partida, con Chispa explicando
const quien = () => el('span', 'quien', T.chispa);
function ayuda(tipo) {
  const el = $('ayuda');
  const texto = tipo === 'sospechoso' ? T.ayudaSospechoso : T.ayudaCliente;
  el.replaceChildren(quien(), texto);
  el.hidden = false;
  document.querySelector('.lado.izq').classList.toggle('pulso', tipo === 'sospechoso');
  document.querySelector('.lado.der').classList.toggle('pulso', tipo !== 'sospechoso');
}
function avanzarAyuda() {
  ayudaPaso++;
  if (ayudaPaso > 3) {
    ayudaPaso = 0;
    document.querySelectorAll('.lado').forEach(l => l.classList.remove('pulso'));
    const el = $('ayuda');
    el.replaceChildren(quien(), T.ayudaListo);
    setTimeout(() => { el.hidden = true; }, 1800);
  }
}

function autoSVG(tipo) { return aSVG(SPRITES[tipo][0], PALETAS[tipo][0]); }

function pintarReglas() {
  const r = $('reglas');
  r.innerHTML = '';
  const chip = (html) => { const c = document.createElement('span'); c.className = 'chip'; c.innerHTML = html; r.append(c); };
  const { pasa, no } = T.marcas;
  chip(`${autoSVG('cliente')}<b class="si">${pasa}</b>`);
  chip(`${autoSVG('sospechoso')}<b class="no">${no}</b>`);
  if (partida.reglas.includes('buscador')) chip(`${autoSVG('buscador')}<span>${T.placas.buscador}</span><b class="si">${pasa}</b>`);
  if (partida.reglas.includes('wp')) chip(`${autoSVG('wp')}<span>${T.placas.wp}</span><b class="no">${no}</b>`);
}

function tarjetaRegla(id) {
  const el = $('tarjeta-regla');
  const regla = T.reglas[id];
  el.innerHTML = '';
  const rot = document.createElement('p'); rot.className = 'rotulo'; rot.textContent = regla.titulo;
  const txt = document.createElement('p'); txt.textContent = regla.texto;
  const ej = document.createElement('div'); ej.className = 'ejemplos';
  if (id === 'buscador') {
    ej.innerHTML = `<div class="ejemplo">${autoSVG('buscador')}<span class="placa" data-c="bien">${T.placas.buscador}</span><b class="si">${T.marcas.pasa}</b></div>` +
      `<div class="ejemplo">${autoSVG('impostor')}<span class="placa" data-c="mal">185.22.9</span><b class="no">${T.marcas.impostor}</b></div>`;
  } else if (id === 'wp') {
    ej.innerHTML = `<div class="ejemplo">${autoSVG('wp')}<span class="placa" data-c="wp">${T.placas.wp}</span><b class="no">${T.marcas.no}</b></div>`;
  }
  for (const p of ej.querySelectorAll('.placa')) {
    const c = { bien: ['#0c4a6e', '#e0f2fe'], mal: ['#7f1d1d', '#fee2e2'], wp: ['#422006', '#fde68a'] }[p.dataset.c];
    p.style.background = c[0]; p.style.color = c[1];
  }
  el.append(rot, txt, ej);
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 1500);
}

function pintarIntegridad() {
  const el = $('integridad');
  el.innerHTML = '';
  for (let i = 0; i < partida.nivel.integridad; i++) {
    el.insertAdjacentHTML('beforeend', aSVG(TORRECITA, { k: '#0b1020', b: '#22d3ee', w: '#e2e8f0', g: '#475569' }, i < partida.integridad ? '' : 'caida'));
  }
}

// ---------- entrada: deslizar, tocar una mitad o las flechas del teclado ----------
let toque = null, jugadaGuardada = null, primeraJugadaDesde = 0;
function decidir(accion) {
  // en la apertura corta, el toque puede llegar antes que la partida del reto (que espera su archivo): se guarda
  if (!partida) { if (apertura && apertura.corta) jugadaGuardada = accion; return; }
  if (partida.terminada) return;
  S.despertar();
  const aceptada = jugar(partida, accion);
  if (aceptada) jugadaEn = performance.now();
  if (aceptada && primeraJugadaDesde) {
    // la primera jugada de la primera partida: cuánto pasó desde «Tomar la guardia» (solo sale el tramo)
    try { performance.mark('guardia-primera-jugada'); } catch { }
    medir('primera-jugada', performance.now() - primeraJugadaDesde);
    primeraJugadaDesde = 0;
  }
}
function tocarAbajo(e) { toque = { x: e.clientX, y: e.clientY }; }
function soltarToque(e) {
  if (!toque) return;
  const dx = e.clientX - toque.x;
  const ancho = $('juego').getBoundingClientRect();
  toque = null;
  if (Math.abs(dx) > 28) decidir(dx > 0 ? 'P' : 'B');
  else decidir(e.clientX - ancho.left > ancho.width / 2 ? 'P' : 'B');
}
$('juego').addEventListener('pointerdown', tocarAbajo);
$('juego').addEventListener('pointerup', soltarToque);
$('juego').addEventListener('pointercancel', () => { toque = null; });
addEventListener('keydown', e => {
  if (!$('juego').classList.contains('activa')) return;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); decidir('P'); }
  else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); decidir('B'); }
});

// ---------- fin ----------
let ultimo = null;
function terminar() {
  cancelAnimationFrame(bucle);
  primeraJugadaDesde = 0; // si la primera partida terminó sin jugadas, la siguiente ya no se mide
  const r = resumen(partida);
  const estrellas = estrellasDe(r.puntos);
  const asistido = partida.nivel.asistido;
  ultimo = { r, estrellas, modo, reto: retoActual, asistido };
  datos.jugo = true;
  datos.mejor = Math.max(datos.mejor || 0, r.puntos);
  datos.mejorEstrellas = Math.max(datos.mejorEstrellas || 0, estrellas);
  let contado = false;
  if (modo === 'reto' && retoActual && !(datos.retos && datos.retos[retoActual.fecha])) {
    datos = registrarReto(datos, retoActual.fecha, { puntos: r.puntos, estrellas, bloques: bloques(r.historial), asistido });
    contado = true;
  }
  guardar(datos);
  partida = null;
  medir('fin-peaje', estrellas);
  // la primera victoria: antes del resultado, el giro (el puntaje ya está cerrado: el giro no lo toca)
  if (tocaGiro(almacen, estrellas)) { marcarGiro(almacen); verGiro(() => pintarFin(r, estrellas, contado, asistido)); }
  else pintarFin(r, estrellas, contado, asistido);
}

function pintarFin(r, estrellas, contado, asistido) {
  S.sonarFin(estrellas > 0);
  if (mus) mus.cerrar(estrellas);

  $('fin-rotulo').textContent = modo === 'reto' ? `${T.reto(retoActual.numero)}${contado ? '' : ' · sin contar'}` : T.hora;
  $('fin-titulo').textContent = T.fin[r.motivoFin];
  $('fin-puntos').textContent = r.puntos.toLocaleString('es');
  const est = $('fin-estrellas');
  est.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    est.insertAdjacentHTML('beforeend', aSVG(ESTRELLA, { y: '#facc15' }, 'apagada'));
    if (i < estrellas) setTimeout(() => { const s = est.children[i]; s.classList.remove('apagada'); s.classList.add('nueva'); S.sonarEstrella(i); }, 350 + i * 320);
  }
  const siguiente = ESTRELLAS.find(u => r.puntos < u);
  $('fin-faltan').textContent = siguiente ? T.fin.faltan(siguiente - r.puntos, estrellas + 1) : T.fin.todas;
  const dl = $('fin-datos');
  dl.innerHTML = '';
  for (const [k, v] of [[T.fin.aciertos, r.aciertos], [T.fin.combo, `x${r.comboMax}`], [T.fin.falsos, r.falsosPositivos], [T.fin.pasaron, r.dejadosPasar + (r.colados ? 0 : 0)], [T.fin.colados, r.colados], [T.fin.mejor, datos.mejor.toLocaleString('es')]]) {
    const d = document.createElement('div');
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v;
    d.append(dt, dd); dl.append(d);
  }
  if (asistido) { const p = document.createElement('div'); p.textContent = T.fin.asistido; dl.append(p); }
  $('ficha-texto').textContent = T.deVerdad.texto;
  $('compartido').hidden = true;
  ultimo.imagen = prepararImagen(ultimo);
  pintarAnoche();
  pintarProxima();
  mostrar('fin');
  $('fin').scrollTop = 0;
}

// ---------- el giro de El peaje: la primera victoria ----------
// Tras el final, en la misma escena: un último auto sospechoso llega, frena ante la barrera, no intenta pasar
// mientras el reloj cuenta, y da la vuelta. Luego, arriba, las dos líneas letra por letra. Se salta con un toque
// (salvo el primer medio segundo, que el jugador venía tocando). giro.js lleva el tiempo; aquí solo se pinta.
let giro = null;
function verGiro(alTerminar) {
  const lineas = T.giro.peaje;
  const caja = $('giro'), texto = $('giro-texto');
  let raf = 0, inicio = 0, escritas = 0;
  const cerrar = () => {
    cancelAnimationFrame(raf);
    caja.hidden = true;
    $('juego').classList.remove('en-giro');
    giro = null;
    escena.moverGiro(null);
    try { alTerminar(); } catch { }
  };
  const control = crearGiro({ lineas, alTerminar: cerrar });
  giro = control;
  // la música se calla: el auto llega en silencio (la cadencia del final suena con el resultado)
  if (mus) mus.parar(0.6);
  escena.empezarGiro();
  texto.replaceChildren();
  $('giro-seguir').textContent = T.giro.seguir;
  caja.setAttribute('aria-label', T.giro.etiqueta);
  $('giro-lector').textContent = '';
  caja.hidden = false;
  $('juego').classList.add('en-giro');
  caja.classList.remove('escribiendo', 'con-texto');
  const cuadroGiro = ahora => {
    if (control.terminado) return;
    if (!inicio) inicio = ahora;
    const v = control.avanzar(ahora - inicio);
    if (control.terminado) return;
    escena.moverGiro(v.auto);
    // mientras el auto espera ante la barrera, el reloj cuenta lo que tarda la puerta
    if (v.auto && v.auto.espera > 0 && v.auto.mira > 0) escena.mostrarReloj(T.reloj(v.auto.espera), true);
    escena.dibujar(ahora);
    const n = v.letras[0] + v.letras[1];
    if (n !== escritas) {
      if (n > escritas && n % 2 === 0) S.sonarLetra();
      escritas = n;
      // el cursor va en la línea que se está escribiendo
      const va = v.letras[1] > 0 ? 1 : 0;
      texto.replaceChildren(el('span', `giro-linea${va === 0 ? ' escribe' : ''}`, lineas[0].slice(0, v.letras[0])),
        el('span', `giro-linea segunda${va === 1 ? ' escribe' : ''}`, lineas[1].slice(0, v.letras[1])));
      caja.classList.add('con-texto');
      if ($('giro-lector').textContent === '') $('giro-lector').textContent = lineas.join(' ');
    }
    caja.classList.toggle('escribiendo', v.escribiendo);
    raf = requestAnimationFrame(cuadroGiro);
  };
  raf = requestAnimationFrame(cuadroGiro);
}
for (const tipo of ['pointerdown', 'pointerup', 'click']) {
  $('giro').addEventListener(tipo, e => { e.stopPropagation(); if (tipo === 'pointerdown' && giro) giro.saltar(); });
}
addEventListener('keydown', e => {
  if (!giro) return;
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || e.key === 'Spacebar') { e.preventDefault(); giro.saltar(); }
}, true);

// La hora que sigue todavía no está: se dice claro, sin fecha, y se ofrece lo que sí se puede hacer ya:
// el reto (el de hoy si falta, o el de mañana con su racha) y mejorar las estrellas.
function pintarProxima() {
  const P = T.proxima;
  const caja = $('proxima');
  const cabeza = el('div', 'proxima-cabeza');
  const lente = el('div', 'proxima-lente');
  lente.innerHTML = aSVG(LENTE_CASTILLO, PALETA_LENTE) + aSVG(ARANA, PALETA_ARANA, 'arana');
  const titulos = el('div', 'proxima-titulos');
  const h = el('h3', '', P.titulo);
  h.id = 'proxima-titulo';
  const sub = el('p', 'proxima-sub');
  sub.append(el('span', '', P.lente), el('span', 'pronto', P.pronto));
  titulos.append(el('p', 'rotulo', P.rotulo), h, sub);
  cabeza.append(lente, titulos);

  const ya = el('div', 'proxima-ya');
  ya.append(el('p', 'rotulo', P.mientras));
  const fila = (etiqueta, icono, titulo, texto, accion, alTocar) => {
    const f = el(etiqueta, 'ya');
    if (etiqueta === 'button') { f.type = 'button'; f.addEventListener('click', alTocar); }
    const i = el('span', 'ya-icono');
    i.innerHTML = icono;
    const c = el('span', 'ya-cuerpo');
    c.append(el('b', '', titulo), el('span', '', texto));
    if (accion) c.append(el('span', 'accion', accion));
    f.append(i, c);
    return f;
  };
  const r = retoDeHoy(Date.now(), anoche);
  const racha = rachaActual(datos, r.fecha);
  const calendario = aSVG(CALENDARIO, PALETA_CALENDARIO);
  if (datos.retos && datos.retos[r.fecha]) {
    // a qué hora de su teléfono sale el reto de mañana (cambia a la medianoche de Venezuela)
    const sale = new Date(Date.parse(r.fecha + 'T04:00:00Z') + 86400000);
    let hora = '00:00';
    try { hora = sale.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false }); } catch { }
    ya.append(fila('div', calendario, P.retoManana(r.numero + 1), P.retoMananaTexto(hora, racha, sale.toDateString() === new Date().toDateString())));
  } else {
    ya.append(fila('button', calendario, P.retoHoy(r.numero), P.retoHoyTexto(T.cambios[r.cambio], racha), P.jugarReto, () => empezarReto()));
  }
  const e = Math.max(0, Math.min(3, datos.mejorEstrellas || 0));
  let mini = '<span class="mini">';
  for (let k = 0; k < 3; k++) mini += aSVG(ESTRELLA, { y: '#facc15' }, k < e ? '' : 'apagada');
  mini += '</span>';
  ya.append(fila('button', mini, P.estrellas(e), P.estrellasTexto(datos.mejor || 0, ESTRELLAS[e] || 0, e), P.mejorar,
    () => empezar('partida')));

  caja.replaceChildren(cabeza, el('p', 'proxima-texto', P.texto), ya);
}
// tocar la tarjeta cuenta una vez por visita: así se sabe si la hora que sigue despierta interés
$('proxima').addEventListener('click', () => medir('proxima'));

// Esto pasó anoche: un archivo que Atalaya escribe una vez al día con totales redondeados de un servidor real
async function pintarAnoche() {
  try {
    const d = await leerAnoche();
    if (!d || ![d.intentos, d.robots, d.visitas].every(Number.isFinite)) throw 0;
    $('anoche-texto').textContent = T.anoche.texto(d);
    $('anoche').hidden = false;
  } catch { $('anoche').hidden = true; }
}

// ---------- compartir ----------
// La imagen vertical del resultado se prepara al terminar, para que al tocar «Compartir» ya esté lista:
// algunos navegadores solo dejan compartir en el instante del toque.
async function prepararImagen(u) {
  try {
    await fuentesListas();
    const esReto = u.modo === 'reto' && u.reto;
    const c = imagenResultado({
      rotulo: T.imagen.rotulo,
      titulo: T.imagen.titulo,
      subtitulo: esReto ? T.imagen.reto(u.reto.numero) : T.imagen.partida,
      puntos: u.r.puntos.toLocaleString('es'),
      puntosEtiqueta: T.imagen.puntos,
      estrellas: u.estrellas,
      bloques: esReto ? bloques(u.r.historial) : '',
      sello: T.marcas.bloqueado,
      direccion: T.imagen.direccion,
    });
    return await aArchivo(c, T.imagen.archivo);
  } catch { return null; }
}

$('compartir').addEventListener('click', async () => {
  if (!ultimo) return;
  const texto = ultimo.modo === 'reto' && ultimo.reto
    ? T.tarjeta(ultimo.reto.numero, ultimo.estrellas, bloques(ultimo.r.historial))
    : T.tarjetaPartida(ultimo.r.puntos, ultimo.estrellas);
  medir('compartir');
  const archivo = ultimo.imagen ? await ultimo.imagen : null;
  await compartir({ texto, archivo, aviso: $('compartido'), nombre: T.imagen.archivo });
});

// ---------- botones ----------
$('empezar').addEventListener('click', () => tomarGuardia('partida'));
$('reto').addEventListener('click', () => tomarGuardia('reto'));
$('ver-apertura').addEventListener('click', () => verApertura('partida'));
$('otra-vez').addEventListener('click', () => { medir('otra-vez'); if (ultimo && ultimo.modo === 'reto') empezarReto(); else empezar('partida'); });
$('volver').addEventListener('click', portada);
// los dos botones grandes vienen apagados y con «Cargando…» en el HTML: en 4G lenta se ven antes de que llegue
// el código. Desde aquí ya responden (el detalle del reto lo escribe portada(), más abajo).
$('empezar-texto').textContent = T.empezar;
for (const id of ['empezar', 'reto']) $(id).disabled = false;
addEventListener('resize', () => { if ($('juego').classList.contains('activa')) escena.redimensionar(); });

pintarLanding();
// «El peaje de su sitio» (puerta.js), en el resultado y en la portada
for (const f of document.querySelectorAll('.form-sitio')) conectarRevision(f, { medir });
portada();
leerAnoche().then(() => { if ($('portada').classList.contains('activa')) pintarReto(); });
