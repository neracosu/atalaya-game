# Atalaya: la guardia

Un juego web gratis en el universo de [Atalaya](https://neracosu.com/atalaya), el monitor que muestra un
servidor como una ciudad pixel art. Usted cuida la puerta de esa ciudad durante una noche en la que todo sale
mal. Cada problema del juego es uno que pasa de verdad en un servidor.

Se juega en el navegador, primero en el teléfono, sin descargar nada: <https://atalaya.neracosu.com/juego>

Solo en español.

## Cómo se juega

El primer nivel es **El peaje**: 60 segundos en la barrera de la ciudad, un auto a la vez.

1. **El cliente pasa.** Trae gente en las ventanas: deslice a la derecha o toque la mitad derecha.
2. **El sospechoso se bloquea.** Oscuro, con la sirena roja y nadie adentro: deslice a la izquierda o toque la
   mitad izquierda.
3. **Llegan reglas nuevas.** El robot del buscador pasa solo si viene del buscador; quien busca `wp-login`, no.
   Si la fila se llena, los autos se cuelan y la puerta pierde integridad.

En la computadora se juega con las flechas (o con A y D). Cada acierto seguido sube el combo y los puntos dan
hasta tres estrellas. El **reto del día** es el mismo nivel para todos, cambia a la medianoche de Venezuela y
solo cuenta el primer intento. El resultado se comparte como texto o como imagen, sin revelar la partida.

## Estado

Etapa 0: El peaje jugable, con sonido, estrellas, reto del día sin tabla, la portada con su sección informativa
y el resultado con «Esto pasa de verdad» y «¿Y su sitio?». El plan completo está en `docs/GDD.md`.

## Qué se mide y qué no

Para saber si el juego engancha (la prueba «seguir, cambiar o parar» de `docs/GDD.md`, partes 9 y 10), el sitio
publicado cuenta algunos hechos con la analítica propia de Atalaya. Todo está en `public/js/medir.js`.

- **Qué se cuenta**, siempre como un nombre fijo y sumado por día: que se vio la portada, que empezó la primera
  partida, que la terminó y con cuántas estrellas (0 a 3), que llegó a 1, 2, 3, 5 o 10 reintentos, que empezó el
  reto del día, que compartió su resultado o el informe de su puerta, que revisó un dominio (solo el hecho), que
  tocó «vigilar», que tocó la tarjeta de la hora que sigue («Llega pronto»), si vio la apertura entera o en qué
  tramo la saltó, cuánto tardó en su primera jugada (solo el tramo: menos de 2 s, de 2 a 3, de 3 a 5, de 5 a 10 o
  más) y si es la primera visita, vuelve
  al día siguiente o vuelve otro día, y cuando llega a 3 y a 7 días distintos. El script de Atalaya suma además el tiempo con la página a la vista, cuánto bajó en la portada,
  la página de donde llegó (sin lo que va después del `?`), que envió un formulario y los clics a otros sitios
  (solo el nombre del sitio).
- **Qué no**: ni el dominio que escribe, ni los puntos exactos, ni la partida, ni un identificador suyo. Sin
  cookies y sin nada que lo siga de un sitio a otro. Estos conteos no guardan su dirección de conexión: el script
  la usa solo como tope contra abusos. Aparte, como todo sitio web, el servidor lleva sus registros de acceso.
- **Qué queda en su teléfono**: la fecha de su última visita y cuántos días distintos jugó (la clave
  `guardia-visitas`), para saber si volvió. Eso no se envía: solo sale «volvió al día siguiente» u «otro día».
  Puede borrarla con los datos del sitio. Aparte, el juego guarda sus ajustes, su mejor marca y sus retos
  (`guardia-v1`) y si ya vio la apertura (`guardia-apertura`); nada de eso sale del teléfono.
- **Cuándo no se mide nada**: si su navegador pide no ser seguido (Global Privacy Control o Do Not Track), si
  bloquea el script o si el juego corre en otro sitio (su máquina, una copia). El juego funciona igual.

`scripts/embudo.mjs` lee los archivos de esa analítica y compara el embudo con las metas del GDD.

## Correrlo en su máquina

No hay nada que instalar ni que compilar: es HTML, CSS y JavaScript servidos tal cual. Hace falta un servidor
local porque el juego usa módulos de JavaScript, que el navegador no carga desde `file://`.

```sh
cd public
python3 -m http.server 8000
```

Luego abra <http://localhost:8000>. Cualquier servidor estático sirve igual.

## Pruebas

Hace falta Node 20 o más nuevo, sin dependencias:

```sh
npm test
```

Las pruebas juegan partidas completas sin pantalla con bots, comprueban que volver a jugar una partida desde sus
jugadas dé exactamente el mismo resultado y revisan las reglas del repo: sin emojis, sin código ni estilos en
línea, sin recursos de afuera y un núcleo sin azar ni reloj.

## La tarjeta y los íconos

La imagen que se ve al compartir el enlace (`public/tarjeta.png`) y los íconos se dibujan con el mismo arte del
juego. Para regenerarlos hace falta Playwright y un Chromium que ya tenga en su máquina (el repo no los trae):

```sh
PLAYWRIGHT_CORE=/ruta/a/node_modules/playwright-core CHROMIUM=/ruta/a/chrome node scripts/tarjeta.mjs
```

## Dónde está cada cosa

```
public/                 lo que se publica, tal cual
  index.html            la única página: portada, partida y resultado
  estilo.css            todos los estilos
  manifest.webmanifest  para instalar el juego en el teléfono
  tarjeta.png           la tarjeta al compartir el enlace (1200x630)
  js/app.js             la interfaz: pantallas, entrada, resultado, compartir
  js/textos.js          todos los textos que ve el jugador
  js/reto.js            el reto del día (con el tono de la noche real), la racha y lo que se guarda en el teléfono
  js/puerta.js          «El peaje de su sitio»: la revisión del dominio y el informe «Su puerta»
  js/compartir.js       compartir una imagen con su texto (hoja del teléfono, o copiar y descargar)
  js/sonido.js          efectos generados por código, sin archivos
  js/medir.js           qué se mide del embudo y cómo (ver «Qué se mide y qué no»)
  js/motor/             el núcleo determinista: la lógica de cada nivel, sin dibujo
  js/apertura.js        la apertura: el guion en datos, si toca verla y el control del tiempo (sin pantalla)
  js/dibujo/            sprites, la escena de la partida, la apertura y las postales (imagen del resultado y de «Su puerta»)
  fuentes/              Silkscreen y Space Grotesk, servidas desde el propio sitio
scripts/                herramientas que no se publican (la tarjeta, los íconos y el embudo)
test/                   pruebas con node --test
docs/GDD.md             el documento de diseño del juego
docs/investigacion/     lo que se investigó de otros juegos para decidir, con fuentes
licencias/              las licencias de las fuentes
```

## Reglas del repo

- JavaScript sin librerías ni compilación.
- Todos los textos al jugador en `public/js/textos.js`, en español y tratando de usted.
- Sin emojis, en ningún lado: solo pixel art.
- Pixel art como acento, texto nítido. Nunca se baja la resolución.
- Nada de código ni estilos en línea en el HTML y nada cargado de otros sitios (la única excepción es el
  script de medición de Atalaya, ver arriba).
- Nada de nombres reales de proyectos, clientes ni personas, ni siquiera en comentarios o pruebas.
- Los secretos (por ejemplo, la clave que firma los puntajes) nunca van al repo.

Cómo aportar está en [`CONTRIBUTING.md`](CONTRIBUTING.md). Si trabaja con un agente de IA, sus instrucciones
están en [`AGENTS.md`](AGENTS.md).

## Licencias

- **El código** es AGPL-3.0, la misma de Atalaya (ver [`LICENSE`](LICENSE)). Si publica una versión modificada
  del juego en un servidor, tiene que ofrecer su código a quienes la usen.
- **Los niveles de la comunidad** van bajo CC BY-SA 4.0.
- **Las fuentes** Silkscreen y Space Grotesk van bajo la SIL Open Font License (ver `licencias/`).
- **Quien aporte código o niveles** acepta una vez el acuerdo de licencia de colaborador
  ([`CLA.md`](CLA.md)): sigue siendo el autor y permite que el juego se distribuya también en tiendas de apps.
