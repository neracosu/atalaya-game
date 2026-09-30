# Instrucciones para agentes de IA

Este archivo es para el agente de IA que trabaje en este repo (y para la persona que lo guía). Lo hecho con IA es
bienvenido; se le pide lo mismo que a todo aporte: que funcione, que pase las pruebas y que una persona lo firme.
Lea también `README.md`, `CONTRIBUTING.md` y, si toca el diseño del juego, `docs/GDD.md`.

## Qué es

«Atalaya: la guardia», un juego web en español. Una sola página estática en `public/`, sin servidor propio por
ahora. El primer nivel es «El peaje»: autos que llegan a una barrera y el jugador decide pasar o bloquear.

## Estructura

- `public/index.html`: la única página, con tres pantallas (`#portada`, `#juego`, `#fin`). Solo la portada se
  desplaza; la partida nunca.
- `public/js/app.js`: la interfaz. Pantallas, entrada (deslizar, tocar, flechas), resultado y compartir.
- `public/js/textos.js`: **todos** los textos que ve el jugador.
- `public/js/motor/`: el núcleo determinista. `peaje.js` es la lógica del nivel; `azar.js`, el azar con semilla.
- `public/js/apertura.js`: la apertura («La torre vacía»), una cinemática que sale solo la primera vez (clave
  `guardia-apertura`) y vuelve a verse desde los ajustes. Lleva toda la historia: las líneas, el guion armado con lo
  que tarda leer cada una (al compás de la música), si toca verla y el control del tiempo, sin pantalla para poder
  probarlo en Node. Se salta con un toque que no cuenta como jugada, y termina fundida en la partida. Durante la
  partida no sale texto de historia (solo la ayuda de Chispa del tutorial).
- `public/js/giro.js`: el giro de El peaje, solo en la primera victoria (clave `guardia-giro-peaje`): si toca verlo,
  el guion como datos y dónde va el auto en cada instante. Pasa después del final y no toca el motor.
- `public/js/dibujo/`: `sprites.js` (el pixel art como datos), `escena.js` (la partida en canvas), `apertura.js`
  (el dibujo de la cinemática en dos lienzos: el mundo a la cuadrícula del dibujo y el texto nítido; ver la regla
  de pixel art más abajo) y `postal.js` (dibujos quietos: la imagen del resultado, la de «Su puerta» y la tarjeta).
- `public/js/reto.js`: el reto del día, la racha y lo que se guarda en el teléfono. Si existe
  `datos/anoche.json` de la noche de ayer, el reto toma su tono (`tonoDeAnoche`): la misma semilla con más
  ráfagas, un final más apretado o más clientes, según las cifras. Es determinista: igual para todos ese día.
- `public/js/puerta.js`: «El peaje de su sitio». Llama a la revisión de la nube, arma el informe «Su puerta:
  N fallas» y la imagen para compartir, que nunca lleva el dominio.
- `public/js/compartir.js`: compartir una imagen con su texto, o copiarlo y ofrecer la imagen para descargar.
- `public/js/sonido.js`: efectos generados con WebAudio, sin archivos.
- `public/js/medir.js`: la medición del embudo. `app.js` solo llama a `medir('nombre')`; la lista de lo que
  puede salir está ahí y en el `README.md` («Qué se mide y qué no»). Nada de datos del jugador en un evento.
- `scripts/`: herramientas que no se publican (`tarjeta.mjs` regenera la tarjeta y los íconos; `embudo.mjs`
  lee el embudo de la analítica).
- `test/`: pruebas con `node --test`. `bots.mjs` juega partidas sin pantalla.

## Cómo correr y probar

```sh
npm test                               # todas las pruebas, sin dependencias (Node 20 o más nuevo)
cd public && python3 -m http.server 8000   # el juego en http://localhost:8000
```

Antes de dar un cambio por terminado:

1. `npm test` en verde.
2. Mire el juego de verdad en 390x844 (teléfono) y en una pantalla de computadora: la portada, una partida
   completa y el resultado. Revise que la consola no muestre errores.
3. Si cambió algo visible, adjunte capturas al pull request.

Si usa un servidor local para probar, ciérrelo al terminar.

## El núcleo determinista

La lógica de cada nivel (`public/js/motor/`) tiene que dar **exactamente el mismo resultado** con la misma
semilla y las mismas jugadas, en cualquier navegador y en Node. De eso dependen el reto del día, las tablas que
vienen y la revisión de partidas. Reglas:

- **Paso fijo de 30 por segundo** (`PASOS_POR_SEGUNDO`). La lógica avanza de a un paso con `avanzar()`; nunca
  mira el reloj ni el tiempo entre cuadros.
- **Enteros siempre.** `Math.imul`, `>>> 0`, `| 0` y divisiones enteras. Nada de números con coma en el estado.
- **Nada de `Math.random`, `Date.now`, `new Date`, `performance.now`**, ni temporizadores, ni trigonometría
  (`Math.sin`, `Math.cos`, `Math.sqrt` y similares). El azar sale de `crearAzar(semilla)` en `azar.js`.
- **Nada que dependa del orden de un `sort` sin comparador** ni del orden de las claves de objetos armados al
  azar.
- **Las jugadas se graban** como `[paso, acción]`. `volverAJugar(nivel, jugadas)` tiene que dar el mismo resumen
  que la partida original; hay una prueba que lo exige.
- **El motor no dibuja ni suena.** Devuelve eventos; `escena.js` y `app.js` los escuchan.
- Si cambia cómo se juega un nivel, suba su `VERSION`: los récords son por nivel y versión.

`test/reglas.test.mjs` revisa parte de esto solo, pero la prueba no reemplaza el cuidado.

## Reglas de estilo

- **JavaScript sin librerías ni compilación.** Nada de `npm install`, bundlers ni TypeScript. Módulos del
  navegador servidos tal cual. No agregue dependencias a `package.json`.
- **Todos los textos al jugador en `public/js/textos.js`**, en español y **tratando de usted** («Deslice»,
  «Escriba su dominio»). Frases cortas. Nada de texto al jugador escrito directo en `app.js` o en `escena.js`.
- **Sin emojis**, en ningún lado: ni en la interfaz, ni en el código, ni en los comentarios, ni en los
  documentos, ni en los mensajes de commit. Si hace falta un ícono, se dibuja en pixel art en `sprites.js`.
- **Pixel art como acento, texto nítido.** Los sprites a escala entera, sin suavizado (`imageSmoothingEnabled
  = false`) y en píxeles enteros; nunca se rotan en ángulos raros. Los textos siempre a resolución completa y
  en una fuente legible; la letra pixel (Silkscreen) solo en títulos y números grandes. **Nunca se baja la
  resolución** del canvas para que se vea «más pixel». Lo que sí se hace, por velocidad, es lo de la apertura:
  el mundo en un lienzo de un píxel por píxel del dibujo, agrandado a un múltiplo entero con
  `image-rendering: pixelated` (el pixel art queda idéntico porque ya estaba en esa cuadrícula), y el texto en
  otro lienzo encima, a la densidad de la pantalla. El texto nunca va en el lienzo del mundo.
- **Política de seguridad de contenido estricta.** En el HTML no hay `<script>` sin `src`, ni `<style>`, ni
  atributos `style`, ni `onclick` y similares. En JavaScript, `elemento.style` sí se puede.
- **Nada de afuera.** Ni fuentes, ni imágenes, ni scripts de otros sitios: todo se sirve desde `public/`. La única
  excepción es el script de medición de Atalaya, que carga `medir.js` solo en el sitio publicado; el juego
  tiene que funcionar igual sin él.
- **Nombres ficticios.** Nada de nombres reales de proyectos, clientes ni personas, ni en comentarios, ni en
  pruebas, ni en datos de ejemplo. Tampoco metas de negocio ni datos privados de ningún servidor.
- **Comentarios en español**, cortos, sobre el porqué.

## Lo que no se hace

- No toque la licencia ni el `CLA.md` sin que lo pida una persona del proyecto.
- No suba secretos, claves ni archivos `.env`.
- No acepte el CLA en nombre de nadie: lo acepta la persona que abre el pull request.
- No cambie el diseño del juego (`docs/GDD.md`) por su cuenta; propóngalo.
