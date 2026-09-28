# Atalaya: la guardia — documento de diseño

Documento vivo. Se escribe parte por parte y cada parte queda cerrada cuando se acuerda.

| Parte | Estado |
|---|---|
| 1. Visión | Cerrada (2026-09-28) |
| 2. Historia y mundo | Cerrada (2026-09-28) |
| 3. Niveles y mecánicas | Cerrada (2026-09-28) |
| 4. Lo que hace volver | Cerrada (2026-09-28) |
| 5. Tablas, perfiles, reto del día y temporadas | Cerrada (2026-09-28) |
| 6. Cinemáticas y perspectiva | Cerrada (2026-09-28) |
| 7. Arte y sonido | Borrador (2026-09-28) |
| 8. Técnica | Borrador (2026-09-28) |
| 9. Etapas | Borrador (2026-09-28) |

La investigación que respalda cada decisión, con sus fuentes, está en [`investigacion/`](investigacion/).

---

## 1. Visión

### Qué es

Un juego web gratis en el universo de [Atalaya](https://neracosu.com/atalaya), el monitor que muestra un servidor como una ciudad pixel art. El jugador cuida esa ciudad durante una noche en la que todo sale mal. Cada problema del juego es uno que pasa de verdad en un servidor, y al final se revela que la ciudad siempre fue uno.

Solo en español.

### Para quién

Desarrolladores y programadores, con o sin experiencia, y en especial la nueva generación que programa con ayuda de la IA. Se entiende sin saber de servidores; quien sabe reconoce cada situación.

### Dónde se juega

**Teléfono primero**: una mano, pantalla vertical, partidas cortas. En la computadora se juega igual, con teclado y ratón. Se entra desde un enlace, sin descargar nada.

### Pilares

Cuando haya una duda de diseño, se decide con estos cuatro:

1. **Se entiende en cinco segundos.** Si hay que explicarlo, se rediseña.
2. **Cada acierto se siente.** Sonido, número y efecto al instante, en proporción a lo que se logró.
3. **Todo lo que pasa en el juego pasa de verdad en un servidor.** Nada de metáforas ajenas; los ataques, las defensas y los códigos son reales.
4. **Perder cuesta poco.** El reintento tarda menos de un segundo y nunca se pierde lo ganado.

### Lo que se toma de cada éxito

| De | Qué se toma |
|---|---|
| Juegos .io (Agar.io, Slither.io) | Entrar en un segundo, sin registro, y la tabla en vivo en una esquina. |
| Celeste | Reintento instantáneo y un modo asistido digno, sin burlas. |
| Balatro | El efecto en proporción al acierto: un combo grande se ve y se oye grande. |
| Candy Crush | Decir cuándo se perdió por poco: «le faltaron 3 para la tercera estrella». |
| Papers, Please | Reglas nuevas que llegan en un boletín, rapidez contra exactitud y un sello que se siente. |
| Mini Metro | Perder por desborde gradual, elegir una mejora entre dos, de la calma al caos. |
| Zachtronics | Al terminar, comparar el resultado con el de todos en varias medidas, no solo un puntaje. |
| Wordle | Un reto diario igual para todos y un resultado para compartir que no revela nada. |
| Duolingo | Racha que perdona un día. |
| Tibia | Tablas por categoría, para que cada tipo de jugador tenga su podio; API pública de datos. |
| Old School RuneScape | Modo de una sola vida; la comunidad vota el contenido nuevo. |
| Geometry Dash | Niveles hechos por la comunidad, con escalera de reconocimiento. |
| Trackmania, Path of Exile | Temporadas de tres meses donde solo se reinicia la tabla. |
| Club Penguin | Eventos de fecha: la ciudad se redecora. |
| Kingdom Rush, League of Legends | La defensa de la torre: carriles, oleadas, mejoras con ramas y botón de pánico. |
| Link's Awakening, Paper Mario | Cambiar de perspectiva por sorpresa, en el mismo mundo reconocible. |

### Lo que no se usa

- Nada se compra. Ni pases, ni cajas de premio, ni atajos.
- Nada de pagar para ganar ni de castas entre jugadores.
- Nada de perder lo ganado al fallar.
- Nada de progreso que tarde años ni de juego pesado a propósito.
- Nada de escasez falsa ni de rachas que castigan.
- Nada de bots tolerados: la tabla se valida en el servidor desde el primer día.

### Decisiones tomadas en esta parte

- **La defensa de la torre existe**, como jefe final de cada temporada y como modo sin fin, «Guardia sin fin». Se juega con la ciudad vista desde la torre, no desde el aire. Se detalla en las partes 3 y 6.
- **Temporadas de tres meses.** Se reinicia solo la tabla de la temporada; estrellas, insignias y récords por nivel se conservan, y las temporadas pasadas quedan jugables en un archivo. Se detalla en la parte 5.
- **Los niveles de la comunidad son parte del juego**, como en Geometry Dash:
  - Cada nivel es un archivo de datos, sin código, bajo licencia **CC BY-SA 4.0**. El código del juego es **AGPL-3.0**.
  - Tres vías para enviar uno: una idea escrita en un formulario, el editor dentro del juego o un pull request.
  - Para enviarlo hay que superarlo uno mismo. Lo firma una persona.
  - Escalera de reconocimiento: Aceptado, Destacado (entra al reto del día) y De temporada (entra a la campaña oficial). El crédito se ve dentro del juego.
  - La comunidad vota el próximo contenido. Se aprueba con 70 % y votan solo quienes han jugado.
- **Lo hecho con IA es bienvenido.** El repo trae instrucciones para el agente de cada quien, un esquema que se valida solo y una prueba que juega el nivel sin pantalla. A nadie se le pide confesar nada: se pide lo mismo que a todos, que funcione, que se haya superado y que una persona lo firme. Quien quiera decir que lo hizo con IA lo muestra con orgullo, junto al robot de Atalaya.
- **Cuenta sin registro.** Se juega con un apodo. El correo es opcional y aparece cuando ya hay algo que conservar: sirve para guardar el avance y entrar desde otro teléfono con un código, sin contraseña. Las noticias son un permiso aparte, sin marcar, con baja en un clic.
- **Dónde vive.** En `neracosu.com/atalaya/juego`. Los avances y las tablas se guardan en una base de datos propia en el mismo servidor, detrás de un servicio pequeño en `neracosu.com/atalaya/juego/api`, aparte del monitor.

---

## 2. Historia y mundo

### La premisa

Una noche, la torre de la ciudad amanece vacía. Quien la cuidaba, la vigía, se fue sin avisar, y la ciudad se queda sin nadie que la mire justo cuando empieza a llegar el Enjambre. El jugador sube, enciende la luz y toma la guardia.

Desde la torre se ve la ciudad a través de un catalejo con varias lentes. Cada lente muestra la misma ciudad con otro disfraz: como castillo, como villa, como oficina. Cambiar de nivel es cambiar de lente. Al amanecer las lentes se caen y queda la verdad.

### Las lentes

Son los temas que ya existen en Atalaya, ahora con una razón dentro de la historia. El problema de fondo es siempre el mismo (una visita, un intruso, un archivo malicioso, una cola que se desborda); lo que cambia es el disfraz. Cada lente trae su propio elenco, el mismo que usa el monitor:

| Lente | Quien vigila | Quien sondea | El archivo malicioso | La fila de espera |
|---|---|---|---|---|
| Ciudad | Patrulla y patrulla voladora | Auto que sondea | Bicho | Autos en fila |
| Villa | Guardia y búho guardián | Ladrón encapuchado | Rata | Aldeanos en fila |
| Castillo | Centinela y gárgola | Espectro | Araña | Murciélagos |
| Oficina | Guardia de seguridad y dron | Intruso de capucha | Cucaracha | Aviones de papel |
| Planta | Montacargas y dron de la planta | Dron hostil | Bicho oxidado | Cajas en fila |
| Ops | Blindado y dron | Marcador hostil | Virus | Contactos en espera |
| Raid | Paladín y dragoncito | Esbirro | Slime | Héroes en fila |
| Acuario | Caballito de mar y tortuga | Tiburón | Erizo | Peces en espera |
| **Terminal** | — | — | — | — |

La **Terminal** es la última lente, y no es un disfraz: es la verdad. Solo texto, como en el monitor.

La temporada 1 usa seis lentes más la Terminal. Las demás quedan para temporadas siguientes y para lentes que haga la comunidad, igual que los temas de Atalaya.

### La noche

Cada nivel es una hora de la noche, de medianoche al amanecer, y en cada hora cambia la lente. Qué nivel va en qué hora y con qué lente se cierra en la parte 3. La forma de la noche es esta:

1. **Medianoche.** Todo tranquilo. El robot compañero enseña lo básico con el primer problema, el más simple.
2. **La madrugada.** Los problemas se suman y se cruzan, y el Enjambre prueba cada puerta de la ciudad.
3. **La caída.** Antes del amanecer, varias cosas fallan a la vez. Es el momento más tenso.
4. **El amanecer.** La defensa de la torre: el Enjambre ataca la torre por todas las calles y el jugador la defiende, con la ciudad vista desde la torre y no desde el aire. Es el jefe final.
5. **La verdad.** Si la torre resiste, las lentes se caen una por una y queda la Terminal: `root@atalaya`. La ciudad nunca fue una ciudad.
6. **Esto pasó anoche.** Justo después, las cifras de la noche anterior en un servidor real: cuántos intentos de entrar hubo, cuántos robots se frenaron, cuántas visitas pasaron. Salen del modo público de Atalaya, solo como totales, sin ningún dato privado. El jugador descubre que lo que acaba de jugar ocurre cada noche, y ahí llega la invitación a probar Atalaya.

### Los personajes

- **El guardia** es el jugador, con su apodo. No hay que elegir personaje ni leer una presentación para empezar.
- **El robot** es el compañero de la torre: el mismo robot pixel que en el monitor representa a una sesión de Claude Code trabajando. Enseña, avisa lo que viene y comenta entre niveles. Para quien programa con IA es un guiño directo: su herramienta está ahí, ayudando a cuidar la ciudad. Nunca juega por el jugador.
- **La vigía** cuidaba la torre antes. Nunca aparece; solo quedan rastros: notas en la torre, ajustes que dejó hechos, una lente que nadie sabe para qué sirve. Por qué se fue es el hilo que atraviesa las temporadas: cada una deja una pista más.
- **El Enjambre** es el atacante: miles de robots sin cara que prueban todas las puertas, como una red de bots real. En la temporada 1 no tiene rostro. Si alguien lo dirige es una pregunta que queda abierta.

Los nombres del robot y de la vigía se deciden en la parte 7, con su diseño.

### El tono

Ambiente serio y humor en los mensajes. La noche, la torre y el Enjambre se toman en serio; los textos de lo que falla tienen el humor de quien ya lo vivió.

- «Su base de datos pidió vacaciones.»
- «429: demasiadas peticiones. El robot también se cansa.»
- «Ese no era un robot. Era su cliente.»

Reglas del humor:

- Se ríe de las fallas que un programador vive de verdad, nunca del jugador.
- Nada de nombres reales de empresas, proyectos ni personas.
- Los textos del juego tratan al jugador de usted.

### Las temporadas en la historia

Cada temporada es una noche nueva: una amenaza nueva, al menos una lente nueva y una pista más sobre la vigía. Todas terminan igual, con la verdad y con lo que pasó anoche de verdad, porque eso no cambia: cada noche es real.

La temporada 1 se llama **«La primera guardia»**.

---

## 3. Niveles y mecánicas

Los números de esta parte (duraciones, velocidades, umbrales) son el punto de partida. Se afinan jugando.

### Reglas para todos los niveles

- **Una acción nueva por nivel**, que se entiende en cinco segundos. El robot la muestra una vez, sin texto largo.
- **Un dedo.** Tocar es la acción principal en seis de los siete niveles; solo La patrulla pide arrastrar. En la computadora: ratón o teclado.
- **De la calma al caos.** Cada nivel empieza lento y termina lleno. La música y los efectos suben con la carga.
- **Siempre se filtra, no se destruye.** Lo bueno y lo malo pasan por el mismo lugar. Bloquear algo bueno (un falso positivo) cuesta tanto como dejar pasar algo malo.
- **Eventos sorpresa** que no se anuncian: una ráfaga, una visita dorada que vale el doble, un combo que se duplica.
- **Integridad de la torre.** En los niveles cortos, tres fallas graves terminan la partida antes de tiempo. Lo ganado hasta ahí se cuenta.
- **Al terminar**: estrellas, cuánto faltó para la siguiente, la comparación con todos los jugadores en tres medidas y el botón de reintentar, que tarda menos de un segundo.
- **«Esto pasa de verdad»**: una ficha opcional de dos líneas con lo real detrás del nivel.

### Puntaje y estrellas

- Cada acierto suma puntos base, multiplicados por el **combo**.
- El combo sube un escalón cada 5 aciertos seguidos: x1, x2, x3, x4, x6 y x8. Cualquier error lo devuelve a x1.
- Tres estrellas por nivel, por umbral de puntaje. La primera se gana en el primer intento de casi cualquiera; la tercera pide dominar el nivel.
- **Modo asistido**: el juego va más lento. Se ganan las estrellas igual, pero ese puntaje no entra a la tabla competitiva. El texto lo ofrece con respeto, nunca como burla.

### Los siete niveles de «La primera guardia»

#### 00:00 · El peaje · lente Ciudad · 60 s

- **Qué hace el jugador.** Por la calle llegan autos hacia la puerta de la ciudad. Cada auto lleva su rótulo: `Mozilla`, `Googlebot`, `curl`, `sqlmap`, o lo que pide, como `/wp-admin` o `/.env`. Si no se toca, pasa. Tocarlo lo sella con BLOQUEAR.
- **El boletín.** A los 20 y a los 40 segundos el robot trae una regla nueva, como en Papers, Please:
  - «Los robots de buscadores pasan.»
  - «Nadie pide `/wp-admin`: quien lo pide, se bloquea.»
  - «Más de tres autos seguidos con la misma placa son un robot.»
- **Falla.** Si un robot pasa, la torre pierde integridad. Si se bloquea a una visita, se rompe el combo y sale el texto «Ese no era un robot. Era su cliente.»
- **Sorpresa.** Un auto dorado es un cliente que compra y vale el doble. Una ráfaga trae diez robots seguidos.
- **Esto pasa de verdad.** Cada minuto llegan robots buscando `/wp-admin` y `.env` a cualquier servidor. Así se frenan con reglas y con límite de peticiones.

#### 01:00 · La patrulla · lente Ops · 75 s

- **Qué hace el jugador.** Maneja un dron de seguridad arrastrando el dedo. El dron sigue el dedo con inercia: acelera, derrapa y deja estela. El control se inspira en DATA WING.
- **El objetivo.** En el borde del radar están las puertas de la ciudad, con su número: 22, 80, 443, 3306. Un marcador hostil recorre las puertas buscando una abierta. El jugador tiene que alcanzarlo antes; al tocarlo, el blindado se lo lleva a la zona de detención.
- **Combo.** Se encadenan capturas sin chocar con los bordes. Derrapar cerca de un obstáculo da puntos extra.
- **Falla.** Si el escáner encuentra una puerta abierta, entra.
- **Sorpresa.** Se abre sola una puerta que no estaba: «Alguien dejó un servidor de pruebas abierto en el 3000.»
- **Esto pasa de verdad.** Los escáneres de puertos recorren internet sin parar. Lo que no se usa se cierra con el cortafuegos.
- **Riesgo conocido.** Es el control más difícil de afinar. Tiene su propia etapa de pruebas antes de darlo por bueno.

#### 02:00 · La cuarentena · lente Castillo · 60 s

- **Qué hace el jugador.** Por la estantería pasan grimorios, que son los archivos del sitio. Entre ellos se esconden arañas. Tocar una araña la encierra en un ataúd: la cuarentena. Tocar un grimorio bueno lo encierra también, y eso cuesta.
- **Escalada.** Al principio las arañas se ven a simple vista. Después se disfrazan de grimorio, y solo las delata la etiqueta:
  - un nombre al azar, como `x7Qk2.php`;
  - una doble extensión, como `foto.jpg.php`;
  - un `.php` dentro de la carpeta de fotos subidas.
- **Falla.** Si una araña se escapa, infecta un estante. Encerrar un archivo bueno saca el texto «Acaba de poner en cuarentena la portada del sitio.»
- **Sorpresa.** Un grimorio bueno que cambia de etiqueta a la vista del jugador.
- **Esto pasa de verdad.** Así se esconde el código malicioso en un sitio. La cuarentena es mejor que borrar: si hubo un error, se devuelve.

#### 03:00 · Las tuberías · lente Planta · 90 s

- **Qué hace el jugador.** Las consultas llegan como cajas por tuberías hacia el silo, que es la base de datos. Tocar un tramo lo gira y cambia el camino, como en Pipe Mania.
- **La saturación.** Las consultas lentas atascan su tubo. El medidor del silo sube poco a poco, como las estaciones de Mini Metro.
- **Entre oleadas.** Cada 30 segundos se elige una mejora entre dos:
  - **Índice:** las consultas lentas se aceleran.
  - **Caché:** las consultas repetidas ya no llegan al silo.
  - **Réplica:** un segundo silo para las lecturas.
  - **Más conexiones:** entran más cajas a la vez.
- **Falla.** El silo se desborda.
- **Sorpresa.** Una consulta gigante («`SELECT *` sin `WHERE`») que tapa todo si no se desvía a tiempo.
- **Esto pasa de verdad.** Así se satura una base de datos. Estas cuatro mejoras son las que se usan en la vida real.

#### 04:00 · El correo · lente Villa · 60 s

- **Qué hace el jugador.** Las palomas salen del palomar con cartas, al ritmo de la música. Cada carta necesita sus sellos, y hay tres carriles, uno por sello: **SPF**, **DKIM** y **DMARC**. Se toca el carril justo cuando la paloma pasa, como en un juego de ritmo.
- **Falla.** Un sello a destiempo hace rebotar la carta, y se ve el motivo: «550: no pasó SPF.»
- **El spam.** Entre las cartas buenas vienen cartas de spam, de un formulario que alguien abusó. Esas no se sellan: si una sale, baja la reputación de la villa.
- **Sorpresa.** Un envío masivo, el boletín de noticias de la ciudad, con el doble de palomas y el doble de puntos.
- **Esto pasa de verdad.** Sin SPF, DKIM y DMARC, los correos de un sitio terminan en spam o rebotan.

#### 05:00 · La caída · lente Oficina · 90 s

- **Antes del nivel.** La cinemática «La caída»: se apagan tres salas a la vez.
- **Qué hace el jugador.** Tres salas fallan al mismo tiempo: recepción (visitas y robots), seguridad (intrusos) y mensajería (cartas). Tocar una sala la agranda y ahí se resuelve una versión corta de su problema. Mientras tanto, el medidor de las otras dos sube.
- **La decisión.** No hay un orden correcto único. El histograma del final muestra qué atendió primero cada jugador y cómo le fue.
- **Falla.** Una sala que llega al tope se cae, y las otras se aceleran.
- **Sorpresa.** Una cuarta alarma falsa que no hace falta atender, y que distrae.
- **Esto pasa de verdad.** Así son las malas noches en un servidor: todo a la vez, y hay que decidir qué va primero.

#### 06:00 · El amanecer · vista desde la torre · 90 s

La defensa de la torre, el jefe final. La ciudad se ve desde la torre y no desde el aire: la transición «bajar del cielo» lleva la cámara hasta ella.

- **El mapa.** Vertical, con la torre abajo, a la altura del pulgar. Tres calles bajan hacia ella: la puerta SSH, la puerta web y el correo. Junto a cada calle hay dos o tres huecos fijos donde construir.
- **Qué hace el jugador.** Toca un hueco y elige entre tres defensas. Toca una defensa para mejorarla; la tercera mejora se elige entre dos ramas.
- **Botones.** Abajo hay dos: **modo bajo ataque**, el botón de pánico que frena todo por 5 segundos y se carga con el combo, y **llamar oleada**, que adelanta la siguiente a cambio de un premio.
- **Seis oleadas de unos 12 segundos.** Un aviso al borde de cada calle anuncia lo que viene.
- **Los invasores y lo que los frena:**

| Invasor | Cómo se mueve | Qué lo frena |
|---|---|---|
| Fuerza bruta | En fila, lento e insistente, por la puerta SSH | Bloqueo de IP: tras varios intentos, lo saca |
| Escáner | Rápido, prueba todas las calles | Cortafuegos: cierra una calle entera |
| Robots de `/wp-admin` | En grupo, por la puerta web | Captcha y límite de peticiones |
| Inyección SQL | Disfrazada de visita por la puerta web; el cortafuegos no la ve | Solo el filtro de aplicaciones (WAF) |
| Ráfaga | Un enjambre de muchos pequeños | Límite de peticiones y el modo bajo ataque |
| Archivo malicioso | Lento y resistente; si llega, infecta un distrito | Cuarentena |
| **Jefe: ransomware** | Cifra un distrito tras otro | Solo la copia de seguridad devuelve lo cifrado |

- **Las visitas.** Por las mismas calles pasan visitas de verdad, y cada una que llega a la torre da recursos. Las defensas que frenan a una visita (el captcha, un bloqueo mal puesto) cuestan combo.
- **Estrellas.** Según la integridad de la torre al final: 20 puntos de vida, como las vidas de Kingdom Rush.
- **Después.** Si la torre resiste, caen las lentes, queda la Terminal y llega «Esto pasó anoche» (parte 2).

### Fuera de la noche

- **Guardia sin fin.** La defensa de la torre sin final, con una semilla distinta cada día, récord de oleadas y su propia tabla. Es el modo que sostiene las temporadas.
- **Reto del día.** Uno de los siete tipos de nivel, con la misma semilla y los mismos cambios para todos. Se juega una vez para la tabla del día; después, las veces que se quiera sin puntuar.

### Cómo se hace un nivel nuevo

Cada uno de los siete niveles es un **motor**: la mecánica, escrita en código. Un nivel es un archivo de datos que elige un motor y le pone parámetros:

- la lente;
- la duración y la semilla;
- las oleadas;
- las reglas del boletín;
- los eventos sorpresa;
- los umbrales de las estrellas.

Así la comunidad crea niveles nuevos sin escribir código, con los siete motores que ya existen. Un motor nuevo, es decir una mecánica nueva, sí es código, y entra por pull request con más revisión. El formato exacto del archivo se define en la parte 8.

---

## 4. Lo que hace volver

Un juego con un solo ciclo se agota. Este tiene tres, uno dentro de otro.

### Cada segundo: la partida

- Sonido, número y efecto en cada acierto; el combo que estalla al subir de escalón.
- Eventos sorpresa: la visita dorada, la ráfaga, el combo que se duplica.
- Reintento en menos de un segundo.
- Al perder, cuánto faltó: «Le faltaron 40 puntos para la tercera estrella.»

### Cada día: el progreso

- **Estrellas.** Tres por nivel, 21 en la noche. El siguiente nivel se abre con una estrella; el amanecer pide 15.
- **Reto del día**, igual para todos (parte 5).
- **Racha del reto del día**, visible. Perdona un día sin jugar, y ese perdón se gana con estrellas. Nunca se compra ni castiga.
- **Tarjeta para compartir** el resultado del reto: bloques pixel con las oleadas contenidas y las que se escaparon, el número del día, las estrellas y el enlace. Sin emojis y sin revelar nada del reto.
- **Retar a un amigo** con un enlace a la misma partida, con la misma semilla.

### Cada semana y cada temporada: la competencia

- Tablas semanales que se reinician, históricas y por categoría (parte 5).
- Eventos del mes: la ciudad se redecora.
- Temporadas de tres meses (parte 5).

### El cuaderno de la vigía

Es la colección del juego. Cada ficha de «Esto pasa de verdad» que el jugador descubre se vuelve una página del cuaderno que la vigía dejó en la torre, y queda para siempre.

- Las páginas técnicas explican, en el tono de alguien que cuidó la torre muchos años, lo real detrás de cada nivel: fail2ban, un WAF, SPF, una réplica.
- Entre ellas hay notas personales de la vigía, que se ganan con hitos (estrellas, noches completas, insignias) y cuentan de a poco por qué se fue. Es el hilo de las temporadas.
- Completar el cuaderno de una temporada es, de verdad, aprender cómo se cuida un servidor.

Es el recurso del manual «de época» de TIS-100.

### Las mejoras de la torre

La regla es simple: **en la campaña ayudan; en la competencia, todos juegan igual.**

- **En la campaña**, las mejoras dan progreso que se siente. Se abren con hitos de estrellas totales, sin moneda ni tienda. Ejemplos:
  - **Integridad extra:** la torre aguanta una falla más.
  - **Sello de guardia:** el primer error de cada partida no rompe el combo.
  - **Boletín anticipado:** la regla nueva llega con unos segundos de aviso.
  - **Dron más ágil:** en La patrulla, menos inercia.
- **En la competencia** (el reto del día, las tablas y Guardia sin fin) todos juegan con la misma torre. Ahí gana la habilidad, no las horas jugadas.
- **Lo que se luce es cosmético:** colores de la torre, la placa del guardia, los accesorios del robot y las insignias. Todo se gana jugando.

### Insignias

Premian estilos distintos de jugar, para que no todo sea el puntaje. Por ejemplo:

- **Noche sin fallas:** los siete niveles sin perder integridad.
- **Cazador de arañas:** cien arañas en cuarentena.
- **Cero falsos positivos:** una noche entera sin bloquear a nadie bueno.
- **Guardia de la Temporada 1:** los primeros de la tabla de la temporada.

---

## 5. Tablas, perfiles, reto del día y temporadas

### El día del juego

El día cambia a la **medianoche de Venezuela** (UTC-4, sin horario de verano). A esa hora sale el reto nuevo, se cuentan las rachas y cierran las tablas del día.

### Las tablas

- **Por nivel**, semanal e histórica.
- **General:** la suma del mejor puntaje de cada nivel.
- **Del reto del día.**
- **Guardia sin fin:** récord de oleadas.
- **Por categoría:** combo máximo, noches sin fallas, cero falsos positivos.
- **De amigos:** quienes jugaron el mismo enlace de reto.
- **Por país** (abajo).

Además del top 10, cada jugador ve a los cinco que tiene arriba y a los cinco que tiene abajo. Ver que falta poco para pasar al de arriba motiva más que un primer lugar imposible.

### Los países

- Cada jugador elige su bandera, en pixel. No se le ubica por la conexión y puede no elegir ninguna.
- En cada tabla se puede filtrar por país: «los mejores de Venezuela».
- **La tabla de países** compara a los países entre sí con el promedio de sus diez mejores jugadores de la semana, para que no gane siempre el país con más gente sino el que juega mejor. Un país necesita al menos diez jugadores esa semana para entrar.

### Los perfiles públicos

Cada guardia tiene su página: `neracosu.com/atalaya/juego/guardia/<apodo>`. Muestra:

- el apodo, la bandera, el rango y la placa;
- la torre con sus colores;
- la vitrina: tres insignias que el propio jugador elige destacar, y debajo todas las demás;
- los mejores puntajes por nivel y su posición;
- el récord de Guardia sin fin y la racha del reto;
- las temporadas jugadas, con sus placas;
- los niveles que creó, con su escalón (Aceptado, Destacado, De temporada);
- las páginas del cuaderno que lleva.

Nunca muestra el correo ni ningún otro dato de la persona. Se entra desde cualquier tabla tocando un apodo.

### Los rangos

Como en los foros de antes: un rango que se gana con el tiempo y el esfuerzo, y que **nunca se pierde**. Sale de los **puntos de guardia**, que se ganan con:

- estrellas;
- insignias;
- retos del día jugados;
- noches completas;
- niveles creados que entran al juego.

| Rango | Qué pide (a afinar) |
|---|---|
| Aprendiz | Empezar |
| Vigía | Terminar el primer nivel con una estrella |
| Centinela | Terminar la noche |
| Guardián | Buena parte de las estrellas y de los retos |
| Guardián mayor | Casi todo, durante más de una temporada |
| Atalaya | El más alto. Muy pocos |

El rango se ve junto al apodo en todas las tablas y en el perfil.

**Los creadores tienen su propio rango**, aparte, que sale de sus niveles: cuántos entraron al juego y a qué escalón llegaron. Como los puntos de creador de Geometry Dash.

### Las insignias

- Tres grados, **bronce, plata y oro**, como en Stack Overflow. Las de bronce se ganan jugando; las de oro son raras y se notan.
- Premian estilos distintos: puntaje, precisión, constancia, creación.
- Algunas son de temporada o de evento, y quedan en el perfil para siempre como recuerdo.

### El reto del día

- El mismo nivel, la misma semilla y los mismos cambios para todos.
- Solo el primer intento cuenta para la tabla del día. Después se juega las veces que se quiera, sin puntuar.
- Racha que perdona un día, y tarjeta para compartir (parte 4).

### Cómo se cuida la tabla

- El servidor vuelve a jugar cada partida con su semilla y sus jugadas, y calcula el puntaje él mismo.
- Compara el tiempo real con la duración de la partida, porque ralentizar el juego es la trampa típica.
- Tope de envíos por conexión.
- Un puntaje sospechoso se oculta de la tabla en lugar de convivir con los demás.
- **Apodos:** de 3 a 12 caracteres, con una lista de palabras vetadas y un botón para reportar un apodo o un perfil.

### API pública

Las tablas, los perfiles públicos y el reto del día se publican también en JSON, para que la comunidad arme bots, sitios y estadísticas, como TibiaData con Tibia.

### Las temporadas

- **Tres meses**, con la fecha de cierre anunciada desde el primer día.
- **Cada una trae** una noche nueva, una amenaza nueva, al menos una lente nueva, una pista más sobre la vigía, y niveles oficiales y de la comunidad.
- **Al cerrar:**
  - se corona a los primeros y reciben la placa de la temporada;
  - se conservan las estrellas, las insignias, el rango, el cuaderno y los récords por nivel;
  - las temporadas pasadas quedan jugables en el archivo.
- **Cada temporada abre con un llamado a enviar niveles**, y la comunidad vota en qué se enfoca la siguiente: un nivel, un invasor o una lente. Se aprueba con 70 % y votan quienes han jugado.
- **Eventos del mes:** la ciudad se redecora (Navidad, Carnaval) con un invasor especial y una insignia de la fecha.

### Pendiente

- Premios reales para los ganadores de temporada: por decidir más adelante.

---

## 6. Cinemáticas y perspectiva

### Cinco vistas del mismo mundo

El monitor siempre muestra la ciudad desde el aire. El juego la muestra desde cinco lados, para que el jugador piense «así se ve desde aquí». Cada lugar conserva sus señas en todas las vistas: la antena y la baliza de la torre, el color de cada distrito, su edificio más reconocible.

| Vista | Dónde aparece | Qué tiene de nuevo |
|---|---|---|
| **Desde el aire** | Los niveles | La que ya conocen del monitor. |
| **De frente, en panorámica** | La apertura y el amanecer | La ciudad de costado, con capas que se mueven a distinta velocidad. |
| **Desde la torre** | El amanecer | Las calles bajando hacia uno. |
| **Desde adentro** | El menú | La ciudad por la ventana de la torre. |
| **En retrato** | La selfie del distrito | Los habitantes de la lente posando de frente. |

El patrón que se toma de Link's Awakening, Mario Odyssey y Paper Mario: el cambio de vista es corto, llega por sorpresa, cambia la regla del juego y no solo el dibujo, y pasa en el mismo mundo reconocible.

### El menú: el interior de la torre

El menú no es una lista: es la sala de la torre vista desde adentro.

- Por la ventana se ve la ciudad, con la luz de la hora real del jugador.
- Sobre el escritorio están el **catalejo** (tocarlo es elegir nivel y lente), el **cuaderno de la vigía** y la **tabla**.
- En la pared, la placa y las insignias del guardia.
- El robot anda por la sala y comenta.

### Las escenas

| Escena | Cuándo | Duración | Qué cuenta |
|---|---|---|---|
| **La torre vacía** | Al empezar | 25 s | Panorámica de frente de la ciudad de noche, la torre apagada. El guardia sube, enciende la luz y el robot despierta. |
| **Entre horas** | Tras cada nivel | 10 s | El catalejo gira y la ciudad cambia de lente ante los ojos del jugador, con un volteo de tarjeta. El robot comenta; lo que dice cambia según las estrellas. |
| **La caída** | Antes de las 05:00 | 15 s | Se apagan tres salas a la vez. |
| **Bajar del cielo** | Entrada al amanecer | 5 s | La cámara baja hacia la torre, la imagen se cierra en un círculo y se abre la vista desde la torre. |
| **La verdad** | Tras el amanecer | 20 s | Las lentes caen una a una hasta dejar la Terminal. Luego, «Esto pasó anoche». |

### La selfie del distrito

Al sacar tres estrellas en un nivel, los habitantes de esa lente posan de frente, con un flash, en una foto con el apodo, el rango y la fecha del guardia. Se guarda como imagen vertical, lista para TikTok o Instagram.

### Reglas de las escenas

- Siempre se pueden saltar, y no se repiten si ya se vieron. Se pueden volver a ver desde el cuaderno.
- Texto letra por letra, entre 5 y 20 caracteres por segundo. Un toque completa la línea y otro avanza.
- Entre 10 y 40 segundos.
- Verticales, así que sirven también como video para redes.
- Sin voces: imagen, texto y sonido.

---

## 7. Arte y sonido

### La mezcla

La misma regla de los temas de Atalaya: **pixel art como acento, texto y formas nítidos.** Personajes, íconos, carteles y efectos en pixel; los textos siempre a resolución completa y en una fuente legible. La letra pixel solo en títulos y números grandes. Nunca se baja la resolución de la pantalla para que «se vea pixel». Nunca emojis.

### Qué se reutiliza y qué es nuevo

- **Se reutiliza de Atalaya** (misma licencia AGPL): el elenco de cada lente, los sprites, las paletas y los dibujos de la ciudad, la villa, el castillo, la oficina, la planta y Ops.
- **Es nuevo:**
  - las capas de la panorámica de frente (cielo, distritos lejanos, calle, primer plano);
  - la vista desde la torre;
  - el interior de la torre;
  - los retratos de la selfie;
  - el robot en tamaño grande, con sus gestos;
  - la interfaz del juego.

Lo nuevo es lo que más cuesta. Por eso las vistas nuevas se diseñan para reutilizarse: las capas de la apertura son las mismas del amanecer.

### Pixel y código juntos

Las escenas y los efectos combinan dos capas:

- **La capa pixel**: personajes, edificios, fondos. Dibujada en la cuadrícula, a escala entera, con paleta limitada. Los personajes se animan a pocos cuadros por segundo (8 a 12), como en los juegos de antes.
- **La capa de código**: luz, niebla, lluvia, estrellas, reflejos, partículas, bandadas, la cámara, los temblores, el texto letra por letra, el brillo de la Terminal. Se genera en el momento, sin dibujar cuadro por cuadro.

Así lo hacen Celeste, Hyper Light Drifter y los juegos HD-2D: el pixel pone la nostalgia y el código pone la vida.

Reglas para no perder la esencia:

- Todo lo que es pixel se mueve de píxel en píxel, nunca a medio píxel.
- Los sprites no se rotan en ángulos raros ni se suavizan al escalar.
- Nada de desenfoques que emborronen el pixel. La luz ilumina, no borra.
- Los efectos de código usan la misma paleta de la lente.

Ventajas de hacerlo en código:

- Pesa muy poco.
- Cada escena es un guion en datos que se reescribe sin tocar el motor.
- Puede usar datos del jugador: su apodo en la placa de la torre, la hora real en la ventana, las cifras reales de «Esto pasó anoche». Un video no puede.

Cuidado con el rendimiento: se prueba en un teléfono Android barato y se limita la cantidad de partículas.

### Los personajes

- **El robot** se llama **Chispa**. Es el robot de Atalaya, más grande y con gestos: sorpresa, alegría, preocupación, cansancio.
- **La vigía** se llama **Alba**, como el amanecer. Nunca se ve su cara: su letra en el cuaderno, su silla, su taza, su abrigo en el perchero.

Los dos nombres son de trabajo hasta que se vean dibujados.

### Legibilidad

- Lo bueno y lo malo nunca se distinguen solo por el color: también por la forma, el rótulo o el movimiento, para quien no distingue colores.
- Rótulos cortos y grandes; en el teléfono se leen sin acercarse.
- Opción de reducir el movimiento y los destellos.

### Sonido

- **Efectos generados por código**, sin archivos: cada acierto, cada escalón del combo, cada sello tiene su sonido, y el combo sube de tono.
- **Música que sigue la carga**: pocos instrumentos en calma y más capas a medida que la noche aprieta, como en Mini Metro. En El correo, la música es el ritmo del nivel.
- Vibración corta en el teléfono en los aciertos grandes y en las fallas, que se puede apagar.
- Todo el juego se entiende sin sonido.

---

## 8. Técnica

Borrador. Se cierra cuando empiece la construcción.

### En el navegador

- **JavaScript sin librerías ni compilación**, como el resto de Atalaya. Canvas 2D.
- **Carga inicial de menos de 300 KB.** Cada lente se carga al entrar a su nivel.
- Funciona sin conexión una vez cargado. Los puntajes se guardan y se envían al volver la conexión.

### El núcleo que se puede verificar

La lógica de cada motor está separada del dibujo y es **determinista**: con la misma semilla y las mismas jugadas, da siempre el mismo resultado, en el navegador y en el servidor.

- Paso de tiempo fijo, 30 veces por segundo.
- Números enteros en la lógica, sin trigonometría ni `Math.random`.
- Generador de azar propio con semilla (PCG).
- Cada partida registra sus jugadas: en qué paso, dónde y qué.

El servidor vuelve a jugar la partida con el mismo código y calcula el puntaje él mismo. Es lo que hace confiable la tabla.

### El servidor

- Un **servicio pequeño en Node**, con su propio usuario del sistema, escuchando solo en el servidor. Se llega a él por `neracosu.com/atalaya/juego/api`, igual que el monitor se sirve por neracosu.com.
- **Base de datos MariaDB** propia del juego, con un usuario que solo entra a esa base.
- Guarda: guardias (apodo, bandera, rango, correo opcional), partidas con sus jugadas, tablas, retos del día, insignias, temporadas y niveles de la comunidad.
- **Cuenta:** al entrar se crea una llave al azar que queda en el teléfono; en la base solo se guarda su huella. Con el correo opcional se entra desde otro teléfono con un código de un solo uso.
- **Topes:** envíos por conexión, códigos de correo por hora, tamaño de cada partida.
- **Borrar mi guardia:** un botón que borra el perfil, las partidas y el correo.
- **Esto pasó anoche** lee una vez al día los totales públicos de un Atalaya real (intentos de entrar, robots frenados, visitas). Solo totales, nunca direcciones ni nombres.

### El formato de un nivel

Un archivo JSON por nivel, validado contra un esquema:

- `formato`: la versión del esquema;
- `id`, `titulo`, `autor` (nombre y usuario de GitHub), `hecho_con` (opcional);
- `motor`: cuál de los siete;
- `lente`, `duracion_s`, `semilla`;
- `oleadas`, `boletin`, `sorpresas`: lo que el motor necesita;
- `estrellas`: los tres umbrales;
- `verificacion`: la partida con que el autor lo superó;
- `licencia`: CC BY-SA 4.0.

### En el repositorio

- Pruebas automáticas en cada cambio: el esquema, cada motor y una partida sin pantalla de cada nivel para comprobar que se puede superar.
- `AGENTS.md`: las instrucciones para el agente de IA de quien quiera aportar.
- Formularios de GitHub en español: «Idea de nivel», «Error», «Propuesta».
- `CONTRIBUTING.md` en español, que da la bienvenida a lo hecho con IA.

### Medición

Con el mismo contador de Atalaya, sin cookies:

- cuántos terminan el nivel 1;
- cuántos vuelven al día siguiente;
- cuántos llegan al amanecer;
- cuántos tocan «probar Atalaya».

### A resolver antes de publicar

El sitio de Atalaya en `neracosu.com/atalaya` lo genera un exportador que reemplaza la carpeta entera. Hay que decidir cómo convive el juego con él antes de la primera publicación.

---

## 9. Etapas

Borrador.

Cada etapa termina con algo que se puede jugar y publicar. La primera decide todo: si el nivel 1 no engancha, el resto no importa.

| Etapa | Qué trae | Qué se mide |
|---|---|---|
| **1. El núcleo** | Núcleo determinista, dibujo, sonido, El peaje completo con estrellas, el interior de la torre como menú y la escena «La torre vacía». | Si engancha en el primer minuto. |
| **2. El recorrido** | La patrulla y La cuarentena, «Entre horas», el cuaderno y el progreso guardado en el teléfono. | Si vuelven a jugar. |
| **3. La competencia** | El servidor y la base, el apodo, la tabla validada, el reto del día, los países y la tarjeta para compartir. | Si vuelven al día siguiente. |
| **4. La noche completa** | Las tuberías, El correo y La caída, las mejoras de la torre, las insignias y la selfie. | Cuántos llegan lejos. |
| **5. El amanecer** | La defensa de la torre, «Bajar del cielo», «La verdad», «Esto pasó anoche» y la invitación. Estreno de la temporada 1. | Cuántos tocan «probar Atalaya». |
| **6. La comunidad** | Perfiles, rangos, formato de niveles, pruebas, `AGENTS.md`, formularios, editor de niveles y Guardia sin fin. | Cuántos niveles llegan. |
