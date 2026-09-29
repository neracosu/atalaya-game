# Atalaya: la guardia — documento de diseño

Documento vivo. Se escribió parte por parte el 2026-09-28 y ese mismo día pasó por una revisión crítica desde cinco ángulos: diversión, alcance, crecimiento, seguridad y precisión técnica. Lo que cambió con esa revisión está al final, en «Cambios de la revisión crítica».

| Parte | Estado |
|---|---|
| 1. Visión | Cerrada, revisada |
| 2. Historia y mundo | Cerrada, revisada |
| 3. Niveles y mecánicas | Cerrada, revisada |
| 4. Lo que hace volver | Cerrada, revisada |
| 5. Tablas, perfiles, reto del día y temporadas | Cerrada, revisada |
| 6. Cinemáticas y perspectiva | Cerrada, revisada |
| 7. Arte y sonido | Borrador revisado |
| 8. Técnica y seguridad | Borrador revisado |
| 9. Etapas | Borrador revisado |
| 10. Lanzamiento | Borrador |

Una regla vale para todo el documento: **nada se da por bueno hasta que se juega.** Los números son el punto de partida y cada etapa tiene su prueba de «seguir, cambiar o parar».

La investigación que respalda cada decisión, con sus fuentes, está en [`investigacion/`](investigacion/).

---

## 1. Visión

### Qué es

Un juego web gratis en el universo de [Atalaya](https://neracosu.com/atalaya), el monitor que muestra un servidor como una ciudad pixel art. El jugador cuida esa ciudad durante una noche en la que todo sale mal. Cada problema del juego es uno que pasa de verdad en un servidor.

Solo en español.

### Para qué existe

Es la puerta de entrada a Atalaya. Tiene que ser un buen juego por sí mismo, porque nadie comparte publicidad, pero su medida de éxito es una: **cuántos jugadores terminan mirando su propio sitio con Atalaya.** Por eso el puente hacia el producto está desde el primer nivel y no al final de la noche.

### Para quién

- **Quien juega:** desarrolladores y programadores, con o sin experiencia, y en especial la nueva generación que programa con IA. Se entiende sin saber de servidores; quien sabe reconoce cada situación.
- **Quien da el salto a Atalaya:** alguien que ya tiene algo publicado. Por ejemplo, Ana, freelancer de WordPress con ocho sitios de clientes, o Luis, que acaba de publicar su primer proyecto hecho con IA. Los niveles hablan de lo que ellos viven: `/wp-login.php`, `xmlrpc.php`, el `.env`, el certificado que vence.

### Dónde se juega

**Teléfono primero**: una mano, pantalla vertical, partidas cortas. En la computadora se juega igual, con teclado y ratón. Se entra desde un enlace, sin descargar nada.

### Pilares

1. **Se entiende en cinco segundos.** Si hay que explicarlo, se rediseña. Lo importante se lee por la forma, no por el texto.
2. **Cada acierto se siente.** Sonido, número y efecto al instante, en proporción a lo que se logró.
3. **Todo lo que pasa en el juego pasa de verdad en un servidor.** Si un sysadmin se ríe de un error técnico, se corrige.
4. **Perder cuesta poco.** El reintento tarda menos de un segundo y nunca se pierde lo ganado.

### Lo que se toma de cada éxito

| De | Qué se toma |
|---|---|
| Juegos .io | Entrar en un segundo, sin registro. |
| Celeste | Reintento instantáneo y un modo asistido digno. |
| Balatro | El efecto en proporción al acierto. |
| Candy Crush | Decir cuándo se perdió por poco. |
| Papers, Please | Reglas que llegan en un boletín, rapidez contra exactitud, un sello que se siente. |
| Reigns | Decidir con un gesto: deslizar a un lado o al otro. |
| Mini Metro | Perder por desborde gradual; elegir una mejora entre dos. |
| Zachtronics | Compararse con todos en varias medidas, no solo un puntaje. |
| Wordle | Un reto diario igual para todos y un resultado para compartir que no revela nada. Sin tabla. |
| Duolingo | Racha que perdona un día. |
| Tibia | Tablas por categoría; API pública de datos. |
| Kingdom Rush, Plants vs. Zombies | Cada nivel da una defensa nueva que luego se usa en el jefe final. |
| Vampire Survivors | Una partida larga hecha de elecciones que se acumulan. |
| Geometry Dash | Niveles de la comunidad, con escalera de reconocimiento. |
| Screeps, Zachtronics | Programar un bot también es jugar. |
| Link's Awakening, Paper Mario | Cambiar de perspectiva por sorpresa, en el mismo mundo. |

### Lo que no se usa

- Nada se compra. Ni pases, ni cajas de premio, ni atajos.
- Nada de pagar para ganar ni de castas entre jugadores.
- Nada de perder lo ganado al fallar.
- Nada de progreso que tarde años ni de juego pesado a propósito.
- Nada de escasez falsa ni de rachas que castigan.

### Decisiones tomadas en esta parte

- **La defensa de la torre existe**, como jefe final de la noche y como modo sin fin, «Guardia sin fin». Partes 3 y 6.
- **Temporadas**, cuando haya comunidad que las sostenga. Parte 5.
- **Los niveles de la comunidad son parte del juego**, como en Geometry Dash:
  - Cada nivel es un archivo de datos, sin código, bajo licencia **CC BY-SA 4.0**. El código del juego es **AGPL-3.0**.
  - Para enviarlo hay que superarlo uno mismo, y lo firma una persona.
  - Escalera de reconocimiento: Aceptado, Destacado (entra al reto del día) y De temporada (entra a la campaña oficial).
- **Lo hecho con IA es bienvenido.** El repo trae instrucciones para el agente de cada quien, un esquema que se valida solo y una prueba que juega el nivel sin pantalla. A nadie se le pide confesar nada: se pide lo mismo que a todos. Quien quiera decir que lo hizo con IA lo muestra con orgullo, junto al robot de Atalaya.
- **Los bots también juegan, a la vista.** El público programa y el código es abierto: habrá bots. En lugar de fingir que no, hay una **Liga de bots** oficial con su propia tabla. El bot que se declara no se castiga; el que se hace pasar por persona, sí.
- **Cuenta sin registro.** Se juega con un apodo. El correo, opcional, llega más adelante (parte 8).
- **Dónde vive.** En un lugar propio, aparte del sitio y del monitor (parte 8).

---

## 2. Historia y mundo

### La premisa

Una noche, la torre de la ciudad amanece vacía. Quien la cuidaba, la vigía, se fue sin avisar, y la ciudad se queda sin nadie que la mire justo cuando llega el Enjambre. El jugador sube, enciende la luz y toma la guardia.

Desde la torre se ve la ciudad a través de un catalejo con varias lentes. Cada lente muestra un barrio de la ciudad a su manera: el castillo, la villa, la oficina. Cambiar de nivel es cambiar de lente.

### Las lentes se agrietan

A medianoche, las lentes muestran un mundo de fantasía y los peligros se ven por su forma: el ladrón encapuchado, la araña, el auto sospechoso. Con cada hora las lentes se agrietan y por las grietas se asoma lo que hay detrás: primero algún rótulo, luego placas con direcciones, al final registros y códigos. A las 05:00 ya casi todo es texto técnico.

Chispa, el robot, es el único que ve a través de las lentes desde el principio. Por eso es él quien lee en voz alta lo que dicen los rótulos y explica qué significa.

Así el juego se entiende sin saber de servidores al empezar, y enseña de a poco a leer lo técnico.

### Las lentes y su elenco

Son los temas que ya existen en Atalaya, con el mismo elenco que usa el monitor:

| Lente | Quien vigila | Quien sondea | El archivo malicioso | La fila de espera |
|---|---|---|---|---|
| Ciudad | Patrulla y patrulla voladora | Auto sospechoso | Escarabajo | Autos en fila |
| Villa | Guardia y búho guardián | Ladrón encapuchado | Rata | Aldeanos en fila |
| Castillo | Centinela y gárgola | Espectro | Araña | Murciélagos |
| Oficina | Guardia de seguridad y dron de seguridad | Intruso de capucha | Cucaracha | Aviones de papel |
| Planta | Montacargas y dron de la planta | Dron hostil | Bicho oxidado | Cajas en fila |
| Ops | Blindado y dron | Marcador hostil | Virus | Contactos en espera |
| Raid | Paladín y dragoncito | Esbirro | Slime | Héroes en fila |
| Acuario | Caballito de mar y tortuga | Tiburón | Erizo | Peces en espera |
| **Terminal** | — | — | — | — |

La **Terminal** es la última lente y no es un disfraz: es lo que hay detrás de todas. Solo texto, como en el monitor.

### La noche

Cada nivel es una hora de la noche, de medianoche al amanecer. La forma de la noche es esta:

1. **Medianoche.** Todo tranquilo. Chispa enseña lo básico con el primer problema, el más simple.
2. **La madrugada.** Los problemas se suman, y el Enjambre prueba cada puerta. Cada hora que se supera deja una defensa nueva en la torre.
3. **La caída.** Antes del amanecer, algo falla y arrastra a todo lo demás.
4. **El amanecer.** La defensa de la torre: el Enjambre ataca por todas las calles y el jugador la defiende con las defensas que ganó en la noche, con la ciudad vista desde la torre.
5. **La verdad.** Si la torre resiste, las lentes se caen una a una. Cada una deja ver su equivalente real, igual que en el monitor: la cárcel se vuelve `iptables -L ATALAYA`, el palomar se vuelve `mailq`, el tanque de datos se vuelve `mysqladmin processlist`. Queda la Terminal, en la máquina `alba@atalaya`. Chispa escribe `last`, y aparece la última vez que entró la vigía: la primera pista.
6. **Esto pasó anoche.** Las cifras de la noche anterior en un servidor real: cuántos intentos de entrar hubo, cuántos robots se frenaron, cuántas visitas pasaron. Redondeadas y sin nombrar el servidor (parte 8).

El remate no es descubrir que la ciudad es un servidor, porque quien llega desde Atalaya ya lo sabe. El remate es **que todo lo que acaba de jugar pasó de verdad anoche.**

### El plan del Enjambre

Los niveles no son problemas sueltos: son **los pasos de un solo ataque**, en el orden en que llegan los ataques de verdad. El Enjambre tiene un plan y lo sigue toda la noche. Cada hora que el guardia gana le cierra un camino, y por eso el Enjambre cambia de táctica: **la victoria de una hora es la causa del problema de la siguiente.**

| Hora | Nivel | El paso del Enjambre | Por qué llega ahora | Lo que gana el guardia |
|---|---|---|---|---|
| 00:00 | El peaje | **Tocar.** Manda robots a la puerta para ver quién abre y qué hay adentro: `/wp-login.php`, `/.env`. | Es el primer paso de todo ataque. | Límite de peticiones |
| 01:00 | La patrulla | **Buscar otra puerta.** Un escáner recorre la muralla buscando la que quedó abierta: el 3306, el 3000. | La puerta principal ya no le abre. | Cortafuegos |
| 02:00 | La cuarentena | **Entrar escondido.** Si no puede forzar una puerta, entra dentro de algo que la ciudad sí deja pasar: un archivo subido por el formulario. | Las puertas que sobraban ya están cerradas. | Cuarentena |
| 03:00 | Las agujas | **Distraer.** Ahoga la base con consultas para tener al guardia ocupado. | Lo que metió quedó encerrado y no puede correr. | Caché |
| 04:00 | El correo | **Hablar en nombre de la ciudad.** Mientras el guardia salvaba la base, usó el formulario para mandar cartas firmadas por la villa. | La distracción era para esto. | Tope de envíos |
| 05:00 | La caída | **Esperar.** No empuja: toda la noche de golpes llenó los registros, y la ciudad se cae sola, en cascada. | Ya no le quedan caminos, pero la ciudad está cansada. | Alarmas |
| 06:00 | El amanecer | **Todo a la vez.** Ataca por todas las calles con todo lo que probó en la noche. | Es su última oportunidad antes de que salga el sol. | Se usan todas |

Así se cuenta en cada hora:

- **Antes** de jugar, Chispa lee una página del **cuaderno de Alba**. La vigía había anotado el paso que viene, antes de que pasara: «Primero tocan. Anotan quién abre.» Esa página dice qué hacer en la hora y por qué importa.
- **Durante** la partida, la historia no interrumpe. Solo la sostienen los mensajes de Chispa y las fallas con humor.
- **Al terminar**, la victoria muestra cómo el Enjambre cambia de plan («La puerta principal no le abre. Ahora busca otra.») y deja la pregunta que lleva a la hora siguiente.
- **El hilo de fondo** es el cuaderno: cada página acertó lo que vino después. La pregunta de toda la temporada es cómo sabía Alba lo que iba a pasar, y por qué se fue justo esta noche. En la verdad, `last` muestra su última entrada, y la última página del cuaderno está en blanco.

Además, el orden enseña algo real: así avanza un ataque contra un servidor, y cada defensa existe porque cierra uno de esos pasos.

### Los personajes

- **El guardia** es el jugador, con su apodo.
- **Chispa** es el robot compañero: el mismo robot pixel que en el monitor representa a una sesión de Claude Code trabajando. Enseña, lee los rótulos, avisa lo que viene. Nunca juega por el jugador. Para quien programa con IA es un guiño directo: su herramienta está ahí, ayudando a cuidar la ciudad.
- **Alba** es la vigía. Nunca aparece; solo quedan rastros: su cuaderno, su taza, su abrigo en el perchero, su usuario en la Terminal. Por qué se fue es el hilo de las temporadas.
- **El Enjambre** es el atacante: miles de robots sin cara que prueban todas las puertas, como una red de bots real. No ataca al azar: sigue un plan que se revela hora a hora (ver «El plan del Enjambre»). Si alguien lo dirige es una pregunta abierta.

Los nombres de Chispa y Alba son de trabajo hasta que se vean dibujados.

### El tono

Ambiente serio y humor en los mensajes. La noche y el Enjambre se toman en serio; los textos de lo que falla tienen el humor de quien ya lo vivió.

- «Ese no era un robot. Era su cliente.»
- «Acaba de poner en cuarentena la portada del sitio.»
- «Alguien dejó un servidor de pruebas abierto en el 3000.»
- «429: demasiadas peticiones. Retry-After: 60. El robot no leyó el encabezado.»
- «ERROR 1040: Too many connections. La base no atiende sin cita.»
- «Hay copia de seguridad. ¿La probó alguna vez?»
- «No era el servidor. Era el DNS. Siempre es el DNS.»
- «Viernes, 18:00. Alguien desplegó.»
- «El disco está lleno: el registro de errores se llenó de errores sobre el registro de errores.»

Reglas del humor:

- Se ríe de fallas que un programador vive de verdad, nunca del jugador.
- Cada chiste técnico tiene que ser correcto. Si un experto lo corrige, no sirve.
- Nada de nombres reales de empresas, proyectos ni personas.
- Los textos del juego tratan al jugador de usted.

### Las temporadas en la historia

Cada temporada es una noche nueva: una amenaza nueva, al menos una lente nueva y una pista más sobre Alba. La temporada 1 se llama **«La primera guardia»**.

---

## 3. Niveles y mecánicas

Los números de esta parte son el punto de partida. Se afinan jugando, y cada nivel se prueba con gente que llega de un video antes de construir el siguiente.

### La columna de la noche

Cada hora que se supera le da a la torre **una defensa nueva**, que después se usa en el amanecer. Así la noche no es una lista de minijuegos: es el camino que arma la defensa final.

| Hora | Nivel | Lente | Defensa que gana |
|---|---|---|---|
| 00:00 | El peaje | Ciudad | Límite de peticiones |
| 01:00 | La patrulla | Ops | Cortafuegos |
| 02:00 | La cuarentena | Castillo | Cuarentena |
| 03:00 | Las agujas | Planta | Caché |
| 04:00 | El correo | Villa | Tope de envíos |
| 05:00 | La caída | Oficina | Alarmas |
| 06:00 | El amanecer | Vista desde la torre | Se usan todas |

### Reglas para todos los niveles

- **Una acción nueva por nivel**, que se entiende en cinco segundos. El primer toque llega antes del segundo 3.
- **Un dedo.** Tocar o deslizar. Lo que se toca mide al menos 48 puntos de pantalla y está en los dos tercios de abajo, donde llega el pulgar.
- **Lo malo se ve por la forma.** El ladrón lleva capucha y palanca; el robot, antena; la araña, patas. El rótulo técnico solo confirma, con un máximo de ocho caracteres, y crece a medida que las lentes se agrietan.
- **Las reglas nuevas se muestran como un ícono fijo arriba**, con un segundo de pausa al llegar. Nunca como texto en medio de la acción.
- **De la calma al caos.** Cada nivel empieza lento y termina lleno.
- **Los errores cuestan distinto, y el juego lo dice:** dejar pasar algo malo quita integridad a la torre; bloquear algo bueno quita puntos y rompe el combo. Cada error se explica al instante con la regla que rompió: «Llevaba placa del buscador: regla 1».
- **Nada de trampas visuales.** Lo que cambia, cambia a la vista y con aviso.
- **Eventos sorpresa buenos**: una ráfaga que multiplica, una visita dorada que vale el doble.
- **Integridad de la torre.** En los niveles cortos, tres fallas graves terminan la partida. Lo ganado hasta ahí se cuenta.
- **Al terminar**: estrellas, cuánto faltó para la siguiente, la comparación con todos en tres medidas, la ficha «Esto pasa de verdad» y el botón de reintentar.

### Puntaje y estrellas

- Cada acierto suma puntos base, multiplicados por el **combo**: x1, x2, x3, x4, x6 y x8. Sube un escalón cada 5 aciertos seguidos y cualquier error lo devuelve a x1.
- Tres estrellas por nivel. La primera se gana en el primer intento de casi cualquiera; la tercera pide dominar el nivel.
- **Modo asistido**: el juego va más lento. Se ganan las estrellas igual, pero no se entra a las tablas. El texto lo ofrece con respeto.

### Los siete niveles de «La primera guardia»

#### 00:00 · El peaje · lente Ciudad · 60 s

- **Qué hace el jugador.** Los autos llegan de a uno a la barrera, bajando hacia el pulgar. Se desliza a la derecha para dejar pasar y a la izquierda para bloquear. Si tarda, la fila crece detrás. En el primer prototipo se prueba también la variante de tocar solo para bloquear, y se queda la que enganche más.
- **Cómo se reconoce.** A medianoche, por la forma: el auto sospechoso es oscuro y lleva sirena apagada; el cliente, colores y pasajeros. Con las horas, la placa muestra lo que pide y de dónde viene.
- **El boletín.** Llegan dos reglas en la partida, de una lista cerrada. Por ejemplo:
  - «Este sitio no es WordPress: quien pide `/wp-login.php` o `/wp-admin`, se bloquea.»
  - «Los robots de buscadores pasan, si su placa dice de dónde vienen. Un robot del buscador que no viene del buscador es un impostor.» (La placa muestra de dónde viene de verdad, como el DNS inverso.)
  - «Más de diez autos por segundo con la misma placa: límite de peticiones.»
- **Sorpresa.** El auto dorado es un cliente que compra y vale el doble.
- **Esto pasa de verdad.** «Un servidor recién encendido recibe robots buscando `/.env` y `/wp-login.php` en cuestión de minutos.»
- **Gana:** el límite de peticiones.

#### 01:00 · La patrulla · lente Ops · 75 s

- **Qué hace el jugador.** Maneja el dron con toques: tocar a la izquierda de la pantalla gira a un lado, a la derecha gira al otro, y el dron avanza solo con inercia, derrapando. Es el control real de DATA WING, y el dedo nunca tapa el dron.
- **El objetivo.** En el borde del radar están las puertas: 22, 80 y 443 abiertas a propósito, porque se usan; 3306 y 3000, que no deberían estarlo. El marcador hostil las recorre. Hay que alcanzarlo antes de que encuentre una puerta que no debía estar abierta; al tocarlo, el blindado se lo lleva.
- **Falla.** «El escáner encontró el 3306 expuesto. Lo anotó, y detrás viene el ataque.»
- **Sorpresa.** «Alguien dejó un servidor de pruebas abierto en el 3000.»
- **Esto pasa de verdad.** «Solo quedan abiertas las puertas que se usan. La base de datos escucha en 127.0.0.1, y el cortafuegos bloquea a quien barre muchos puertos en segundos.»
- **Gana:** el cortafuegos.
- **Riesgo conocido.** Es el control más difícil de afinar. Tiene una semana de prototipo en gris; si no divierte, se reemplaza.

#### 02:00 · La cuarentena · lente Castillo · 60 s

- **Qué hace el jugador.** Por la estantería pasan pergaminos, los archivos del sitio. Entre ellos se esconden arañas. Tocar una araña la encierra en un ataúd. Encerrar un pergamino bueno cuesta.
- **Escalada.** Al principio la araña se ve entera. Después se esconde en un pergamino y la delata la etiqueta: un nombre al azar como `x7Qk2.php`, una doble extensión como `foto.jpg.php`, o un `.php` en la carpeta de fotos subidas.
- **Falla.** Una araña que se escapa infecta un estante. Encerrar uno bueno: «Acaba de poner en cuarentena la portada del sitio.»
- **Esto pasa de verdad.** Así se esconde el código malicioso en un sitio. La cuarentena es mejor que borrar: si hubo un error, se devuelve.
- **Gana:** la cuarentena.
- **Nota de construcción.** Comparte motor con El peaje: tocar lo malo dentro de un flujo.

#### 03:00 · Las agujas · lente Planta · 90 s

- **Qué hace el jugador.** Las consultas llegan como cajas por un riel hacia el tanque de datos. Hay tres o cuatro agujas grandes; tocarlas cambia el camino. Las cajas de lectura pueden ir a la réplica; las de escritura, solo al tanque principal. Es Train Conductor, no un rompecabezas de tubos chicos.
- **La saturación.** Las consultas lentas atascan su riel y el medidor del tanque sube poco a poco, como en Mini Metro.
- **Entre oleadas**, cada 30 segundos, se elige una mejora entre dos:
  - **Índice:** las consultas lentas se aceleran.
  - **Caché:** las repetidas ya no llegan al tanque.
  - **Réplica:** un segundo tanque para las lecturas.
  - **Pool de conexiones:** entran más cajas a la vez sin ahogar al tanque. Subir las conexiones sin pool, en cambio, llena el tanque más rápido.
- **Sorpresa.** «La réplica va atrasada»: las lecturas que van a ella llegan viejas.
- **Esto pasa de verdad.** Así se satura una base de datos, y estas son las mejoras que se usan en la vida real.
- **Gana:** la caché.

#### 04:00 · El correo · lente Villa · 60 s

- **Qué hace el jugador.** Las palomas salen del palomar al ritmo de la música. Tres carriles, uno por cada cosa que un correo necesita para llegar:
  - **SPF:** la paloma sale por la ventana autorizada.
  - **DKIM:** se le pone el lacre del palomar, al pasar.
  - **DMARC:** el nombre del sobre coincide con el de la carta.
- **El ritmo se juega con la vista**, con márgenes generosos, porque el sonido en el navegador del teléfono llega con retraso. La música acompaña; no manda.
- **Falla.** Una paloma que no pasa rebota con su motivo: «550 5.7.23: no pasó SPF.»
- **El spam.** Entre las cartas buenas vienen las de un formulario abusado. Esas salen firmadas igual, porque son del propio palomar: no se sellan, se retienen en la cola. Si una sale, baja la reputación de la villa.
- **Esto pasa de verdad.** Sin SPF, DKIM y DMARC, los correos de un sitio terminan en spam o rebotan. Y el spam que sale del propio servidor pasa todas las firmas: hay que frenarlo antes.
- **Gana:** el tope de envíos.
- **Riesgo conocido.** Si el ritmo no funciona en teléfonos baratos, el nivel se rehace sin ritmo.

#### 05:00 · La caída · lente Oficina · 90 s

- **Antes del nivel.** La escena «La caída»: se apagan tres salas a la vez.
- **Qué hace el jugador.** Recepción, seguridad y mensajería fallan al mismo tiempo, pero la causa es una sola y está escondida. Cada sala muestra un síntoma; el jugador toca las pistas hasta dar con la raíz, y al resolverla se apagan las tres alarmas. Las causas posibles, una por partida:
  - el disco lleno de registros, que tumba la base, que atasca el correo;
  - el certificado vencido, que espanta a las visitas;
  - un cron que se encima con el anterior;
  - la memoria que se acaba y el sistema que mata procesos;
  - el despliegue del viernes a las 18:00.
- **La decisión.** Apagar síntomas da tiempo; encontrar la raíz gana el nivel. El histograma del final muestra cuánto tardó cada jugador en dar con ella.
- **Esto pasa de verdad.** Las peores noches de un servidor casi nunca las causa un ataque: las causa algo propio, en cascada.
- **Gana:** las alarmas, que en el amanecer avisan antes de cada oleada.

#### 06:00 · El amanecer · vista desde la torre · 150 a 180 s

La defensa de la torre, el jefe final. La transición «bajar del cielo» lleva la cámara hasta la torre.

- **El mapa.** Vertical, con la torre abajo. Cuatro calles bajan hacia ella: la puerta SSH, la puerta web, el correo y la puerta de la base de datos, el 3306, que debe quedar cerrada. Los huecos para construir están solo en los dos tercios de abajo.
- **Qué hace el jugador.** Toca un hueco y elige entre las defensas que ganó en la noche. Toca una defensa para mejorarla; la tercera mejora se elige entre dos ramas.
- **Botones.** **Modo bajo ataque**, que frena la ráfaga 5 segundos pero hace esperar también a las visitas, y **llamar oleada**, que adelanta la siguiente a cambio de un premio.
- **Seis oleadas.** Las alarmas avisan qué viene y por qué calle.
- **En la temporada 1, cuatro invasores.** Cada uno tiene una defensa que lo frena mejor, pero ninguno obliga a acertar una sola respuesta: las contras exactas dan bonificación, no la vida.

| Invasor | Cómo se mueve | Qué lo frena mejor |
|---|---|---|
| Fuerza bruta | En fila, lento e insistente, por SSH | Bloqueo de IP: tras 5 intentos en 10 minutos, fuera por 10 minutos, como fail2ban por defecto |
| Robots de `/wp-login.php` | En grupo, por la puerta web | Límite de peticiones |
| Escáner | Rápido, barre todas las calles | Cortafuegos: cierra las calles que no se usan y bloquea a quien las barre |
| Buzón robado | Por el correo, miles de cartas de golpe | Tope de envíos por hora |

- **Las visitas.** Por las mismas calles pasan visitas de verdad, y cada una que llega a la torre da recursos. Las defensas mal puestas también las frenan, y eso cuesta.
- **Estrellas.** Según la integridad de la torre al final, sobre 20.
- **Para temporadas siguientes**, invasores que ya se tienen pensados:
  - la inyección SQL, que el WAF frena y solo el código cura, con consultas preparadas;
  - el ransomware, que solo se revierte con una copia fuera de la ciudad, porque una copia dentro de un distrito infectado se cifra con él;
  - la fuerza bruta distribuida, mil placas con dos intentos cada una, que el bloqueo de IP no ve y solo frenan las llaves en vez de contraseñas;
  - el plugin viejo;
  - el que conoce la dirección de origen y se salta el proxy;
  - el `.git` expuesto.

### La noche como partida

Además de jugar cada nivel suelto, la noche entera se puede jugar de corrido. Entre hora y hora se elige una mejora entre dos, y las mejoras se acumulan hasta el amanecer, como en Vampire Survivors. Cada noche corrida es distinta por las mejoras que se eligieron.

### Fuera de la noche

- **Guardia sin fin.** La defensa de la torre sin final, con récord de oleadas. Es lo que da profundidad cuando la noche ya se terminó.
- **Reto del día.** Un nivel con los mismos cambios para todos: «solo cortafuegos», «el doble de ráfagas», «hoy todos son impostores». Se juega una vez para contar.

### Cómo se hace un nivel nuevo

Cada nivel es un **motor** (la mecánica, en código) y un **archivo de datos** que elige el motor y le pone parámetros: la lente, la duración, las oleadas, las reglas del boletín (de una lista cerrada), las sorpresas y los umbrales de las estrellas. La comunidad crea niveles nuevos sin escribir código. Un motor nuevo sí es código, y entra por pull request con más revisión.

---

## 4. Lo que hace volver

Un juego con un solo ciclo se agota. Este tiene tres, uno dentro de otro.

### Cada segundo: la partida

- Sonido, número y efecto en cada acierto; el combo que estalla al subir.
- Reintento en menos de un segundo.
- Al perder, cuánto faltó: «Le faltaron 40 puntos para la tercera estrella.»

### Cada día: el progreso

- **Estrellas.** Tres por nivel. El siguiente nivel se abre con una; el amanecer se abre con 8.
- **Reto del día**, igual para todos, con racha que perdona un día. El perdón se gana con estrellas, nunca se compra.
- **Tarjeta para compartir** el resultado: bloques pixel, el número del día, las estrellas y el enlace. Sin emojis y sin revelar nada.
- **Retar a un amigo** con un enlace a la misma partida.

### Cada semana: la competencia

- Tablas y récords (parte 5), cuando haya jugadores para llenarlas.

### El cuaderno de Alba

Es la colección del juego. Cada ficha de «Esto pasa de verdad» se vuelve una página del cuaderno que la vigía dejó en la torre.

- Las páginas técnicas explican, con la voz de alguien que cuidó la torre muchos años, lo real detrás de cada nivel, con los valores de verdad: «fail2ban: 5 intentos en 10 minutos, y fuera por 10.»
- Entre ellas hay notas personales de Alba, que se ganan con hitos y cuentan de a poco por qué se fue.
- Completar el cuaderno es, de verdad, aprender cómo se cuida un servidor.

### Las mejoras de la torre

**En la campaña ayudan; en la competencia, todos juegan igual.**

- **En la campaña** se abren con hitos de estrellas, sin moneda ni tienda: integridad extra, el sello de guardia (el primer error no rompe el combo), el boletín anticipado.
- **En la competencia** (reto del día, tablas, Guardia sin fin) todos juegan con la misma torre.
- **Lo que se luce es cosmético** y se gana jugando: colores de la torre, la placa del guardia, los accesorios de Chispa, las insignias.

### Insignias

Premian estilos distintos, en tres grados: bronce, plata y oro. Por ejemplo: noche sin fallas, cien arañas en cuarentena, una noche entera sin bloquear a nadie bueno, encontrar la raíz de La caída en menos de 20 segundos.

---

## 5. Tablas, perfiles, reto del día y temporadas

Todo esto se construye por partes y solo cuando hace falta. Una tabla vacía desanima más que no tener tabla: el reto del día sale primero sin tabla, como Wordle.

### El día del juego

El día cambia a la **medianoche de Venezuela** (UTC-4). A esa hora sale el reto nuevo y se cuentan las rachas.

### Las tablas, en el orden en que llegan

1. **Reto del día e histórica de cada nivel**, con el top 10 y, además, los cinco que el jugador tiene arriba y los cinco de abajo.
2. **Guardia sin fin**, récord de oleadas.
3. **Por categoría:** combo máximo, noches sin fallas, cero falsos positivos.
4. **Por país**, cuando haya jugadores de varios. Cada jugador elige su bandera en pixel, sin ubicarlo por su conexión. Los países se comparan por el promedio de sus diez mejores de la semana, y solo cuentan cuentas con historial.
5. **Liga de bots**: la tabla de los bots declarados, con su autor.

Retar a un amigo nunca da puntos ni entra a las tablas generales.

### Los perfiles públicos

Cada guardia tiene su página en `/guardia/<apodo>`: el apodo, la bandera, el rango, su torre, una vitrina de tres insignias elegidas, sus mejores puntajes, sus temporadas y los niveles que creó. Sin texto libre y nunca el correo. Se entra tocando un apodo en cualquier tabla.

### Los rangos

Como en los foros de antes: se ganan con el tiempo y el esfuerzo, y nunca se pierden. Salen de los puntos de guardia (estrellas, insignias, retos, noches completas, niveles creados).

| Rango | Qué pide (a afinar) |
|---|---|
| Aprendiz | Empezar |
| Sereno | Terminar el primer nivel con una estrella |
| Centinela | Terminar la noche |
| Guardián | Buena parte de las estrellas y los retos |
| Guardián mayor | Casi todo, durante más de una temporada |
| Atalaya | El más alto. Muy pocos |

El sereno era el vigilante nocturno de las ciudades de habla hispana. Los creadores de niveles tienen su propio rango, aparte.

### El reto del día

- El mismo nivel y los mismos cambios para todos, elegidos por el servidor. El reto de cada día no se conoce hasta que empieza.
- Cuenta solo el primer intento, y solo con conexión. Después se juega sin puntuar.
- Al cerrar el día se publican las mejores partidas, para que la comunidad las vea y detecte trampas.

### Las temporadas

Llegan cuando la comunidad las pueda sostener, no antes. Mientras tanto, lo vivo es el reto del día.

- **Tres meses**, con fecha de cierre anunciada.
- **Cada una trae** una noche nueva, una amenaza nueva, al menos una lente nueva, una pista sobre Alba y niveles oficiales y de la comunidad.
- **Al cerrar:** placa para los primeros; se conservan estrellas, insignias, rango, cuaderno y récords; las temporadas pasadas quedan jugables.
- **Cada una abre con un llamado a enviar niveles.**

### Pendiente

- Premios reales para los ganadores: por decidir más adelante.
- Votaciones de la comunidad y eventos del mes: cuando haya comunidad.

---

## 6. Cinemáticas y perspectiva

### Cinco vistas del mismo mundo

Cada lugar conserva sus señas en todas las vistas: la antena y la baliza de la torre, el color de cada distrito, su edificio más reconocible.

| Vista | Dónde aparece | Qué tiene de nuevo |
|---|---|---|
| **Desde el aire** | Los niveles | La que ya conocen del monitor. |
| **Desde la torre** | El amanecer | Las calles bajando hacia uno. |
| **De frente, en panorámica** | Al terminar el primer nivel y en el amanecer | La ciudad de costado, con capas que se mueven a distinta velocidad. |
| **Desde adentro** | El menú | La ciudad por la ventana de la torre. |
| **En retrato** | La selfie del distrito | Los habitantes de la lente posando de frente. |

### El menú: el interior de la torre

La sala de la torre vista desde adentro. Por la ventana, la ciudad con la luz de la hora real. Sobre el escritorio, el catalejo (elegir nivel), el cuaderno de Alba y la tabla. En la pared, la placa y las insignias. Chispa anda por la sala. Mientras no esté dibujado, el menú es una pantalla simple.

### Las escenas

**Una sola escena antes de jugar, corta y que termina dentro de la partida.** La primera vez que se toca «Tomar la guardia» se ve la apertura; su último cuadro ya es la barrera con el primer auto llegando, así que no hay pantalla de por medio. Se salta con un toque y no se vuelve a mostrar (se puede ver de nuevo desde Ajustes). El resto de la historia llega después de jugar.

| Escena | Cuándo | Duración | Qué cuenta |
|---|---|---|---|
| **La torre vacía** (apertura) | La primera vez que se toma la guardia, antes de la primera partida | unos 15 s | La ciudad de noche desde el aire, la torre apagada. Se enciende la luz y barre la ciudad, el Enjambre llega por los bordes, Chispa despierta: «Esta noche, la ciudad está bajo ataque. Alguien tiene que tomar la guardia.» La cámara baja del cielo hasta quedar de frente a la torre y aterriza en la barrera. |
| **Entre horas** | Tras cada nivel | 8 s | El catalejo gira, la lente se agrieta un poco más y cambia. Chispa comenta según las estrellas. |
| **La caída** | Antes de las 05:00 | 12 s | Se apagan tres salas a la vez. |
| **Bajar del cielo** | Dentro de la apertura, y de nuevo en la entrada al amanecer | 5 s | La cámara baja hacia la torre y se abre la vista desde ella. |
| **La verdad** | Tras el amanecer | 20 s | Las lentes caen, cada una deja ver su comando real, y queda `alba@atalaya`. |

### La selfie del distrito

Al sacar tres estrellas, los habitantes de la lente posan de frente, con flash, con el apodo, el rango y la fecha del guardia. Se guarda como imagen vertical.

### Reglas de las escenas

- Siempre se pueden saltar y no se repiten; se vuelven a ver desde el cuaderno.
- Texto letra por letra, de 5 a 20 caracteres por segundo. Un toque completa, otro avanza.
- Verticales, para servir también como video. Sin voces.

---

## 7. Arte y sonido

### La mezcla

La regla de los temas de Atalaya: **pixel art como acento, texto y formas nítidos.** Personajes, íconos, carteles y efectos en pixel; los textos siempre a resolución completa y en una fuente legible. La letra pixel solo en títulos y números grandes. Nunca se baja la resolución. Nunca emojis.

### Pixel y código juntos

- **La capa pixel**: personajes, edificios, fondos. En la cuadrícula, a escala entera, con paleta limitada. Los personajes se animan a 8 o 12 cuadros por segundo.
- **La capa de código**: luz, niebla, lluvia, estrellas, reflejos, partículas, bandadas, cámara, temblores, texto letra por letra, el brillo de la Terminal. Se genera en el momento.

Así lo hacen Celeste, Hyper Light Drifter y los juegos HD-2D. Para no perder la esencia:

- lo que es pixel se mueve de píxel en píxel;
- los sprites no se rotan en ángulos raros ni se suavizan;
- nada de desenfoques que emborronen el pixel;
- los efectos usan la paleta de la lente.

Pesa poco, cada escena es un guion en datos y puede usar datos del jugador: su apodo en la placa, la hora real en la ventana. Se prueba en un Android barato y se limitan las partículas.

### Qué se reutiliza y qué es nuevo

- **Se reutiliza de Atalaya** (misma licencia): el elenco de cada lente, los sprites, las paletas y los dibujos de los temas. Antes de reutilizar, se revisa el origen de cada pieza.
- **Es nuevo, y es lo que más cuesta:** la vista desde la torre, la panorámica, el interior, los retratos, Chispa en grande, la interfaz. Por eso llega por etapas: la primera usa solo la vista desde el aire y el elenco que ya existe.

### Legibilidad

- Lo bueno y lo malo nunca se distinguen solo por el color: también por la forma y el movimiento.
- Rótulos de ocho caracteres como máximo en lo que se mueve.
- Opción de reducir movimiento y destellos.

### Sonido

- **Efectos generados por código**, sin archivos. El combo sube de tono.
- **Música que sigue la carga**, compuesta en código (WebAudio, sin archivos: no pesa y no tiene licencias ajenas): un tema de la noche que empieza grave en la apertura, se abre en la bajada del cielo y sigue suave en la partida, con pocos instrumentos en calma y más capas cuando aprieta. Nunca tapa los efectos. Música y efectos se apagan por separado.
- Vibración corta en aciertos grandes y fallas, que se puede apagar.
- Todo el juego se entiende sin sonido.

---

## 8. Técnica y seguridad

### Dónde vive

- **La dirección que se comparte es `atalaya.neracosu.com/juego`**, y lleva al instante a **`juego.atalaya.neracosu.com`**, donde corre el juego. Es un sitio aparte para el navegador: `atalaya.neracosu.com` es un monitor con sesión de dueño, y el juego nunca debe compartir origen con él.
- **Los archivos del juego viven fuera de cualquier carpeta pública de una cuenta de sitios**, son del usuario del juego y el servidor web solo los lee. El sitio de Atalaya lo publica un exportador que reemplaza su carpeta entera, y nada de eso toca al juego.
- Política de seguridad de contenido estricta, sin código en línea.
- Nunca se clona el repositorio en una carpeta pública: se publica solo lo construido. Los secretos viven fuera, en la configuración del sistema.
- Enlace «Código fuente» en el juego, al commit que corre (AGPL).

### En el navegador

- **JavaScript sin librerías ni compilación.** Canvas 2D.
- **Carga inicial de menos de 300 KB.** Cada lente se carga al entrar a su nivel.
- Se puede jugar sin conexión, pero **sin conexión no se compite**: solo estrellas y progreso propio.
- Todos los textos del juego en un solo archivo, por si un día llega otro idioma.

### El núcleo que se puede verificar

La lógica de cada motor está separada del dibujo y es **determinista**: con la misma semilla y las mismas jugadas, da siempre el mismo resultado en cualquier navegador y en el servidor.

- Paso de tiempo fijo, 30 veces por segundo. Nada de `Date.now` ni del tiempo entre cuadros dentro de la lógica.
- Enteros explícitos: `Math.imul`, `>>> 0` y divisiones enteras. Nada de trigonometría ni de `Math.random`, vigilado por el linter.
- Generador de azar propio de 32 bits (PCG32 o Mulberry32).
- Nada que dependa del orden de un `sort` inestable.
- Cada partida guarda sus jugadas y la huella del motor y del nivel. Los motores tienen versión; los viejos se congelan y los récords son por nivel y versión.
- Pruebas de repetición en cada cambio: el mismo lote de partidas en Chrome, Firefox, Safari y Node tiene que dar lo mismo.

### Lo que el servidor sí y no puede probar

Volver a jugar la partida prueba que las jugadas son legales, no que las hizo una persona. Con el código abierto, un bot puede calcular la partida perfecta. Por eso:

- **Lo que compite usa semillas del servidor**, entregadas al empezar y registradas. La semilla fija queda solo para las estrellas.
- **Las mejores partidas se publican**, para que la comunidad las revise.
- **Los primeros de cada tabla se revisan a mano.**
- **Heurísticas** de tiempo de reacción y variación, sabiendo que serán públicas.
- **La Liga de bots**: una puerta oficial, con su API de jugadas, para quien prefiera programar su guardia. El bot declarado tiene su tabla; el que se hace pasar por persona pierde la cuenta.

### El servidor

- Un **servicio pequeño en Node**, con su propio usuario del sistema, escuchando solo en el servidor, detrás del proxy.
- **Base MariaDB** propia, con un usuario que solo entra a esa base. Consultas siempre parametrizadas.
- **Límites:** cada partida pesa como máximo unos 64 KB; tope de pasos por motor y de jugadas por paso; la validación corre aparte, en una cola, y el puntaje queda «pendiente» hasta validarse; tope de CPU y memoria del servicio para que nunca le quite recursos a los sitios del servidor.
- **La dirección de quien juega** se toma del proxy de confianza, nunca de un encabezado cualquiera.
- **Cuentas:** una llave al azar que queda en el teléfono; en la base solo su huella. Tope de cuentas nuevas por conexión y una pequeña prueba de trabajo al crearlas.
- **Apodos:** letras minúsculas, números, guion y guion bajo, de 3 a 12; únicos sin importar mayúsculas; nombres reservados. Siempre se muestran como texto, nunca como HTML.
- **Borrar mi guardia:** borra el perfil, las partidas, el correo y su rastro en las tablas.

### El correo, más adelante

La primera tabla sale sin correo. Cuando llegue:

- con un proveedor de envío externo, en un subdominio propio, para no arriesgar la reputación de los sitios del servidor;
- códigos de 8 dígitos que vencen a los 10 minutos y se anulan tras 5 intentos; máximo 3 por correo al día;
- la misma respuesta exista o no el correo;
- las noticias, con doble confirmación y baja en un clic;
- solo para mayores de 14 años.

### Esto pasó anoche

- Atalaya escribe una vez al día un archivo con los totales de la noche anterior. El juego lee ese archivo; nunca consulta al monitor.
- Totales redondeados, sin desglose por servicio y sin nombrar el servidor: «un servidor real». El nombre de la máquina en la Terminal es ficticio.

### Los niveles de terceros

- Esquema estricto: ninguna propiedad fuera de las conocidas, límites en cada número y en la profundidad.
- Nunca se ejecuta nada del archivo: el boletín se arma con reglas de una lista cerrada.
- Moderación antes de publicar cualquier nivel.
- Campo `basado_en` para los niveles que remezclan otros, porque CC BY-SA pide conservar la cadena de autores.
- El autor figura con su apodo o su usuario de GitHub, no con su nombre real. Se le avisa que la licencia no se puede retirar.

### Moderación

Hace falta alguien que modere y un panel mínimo: renombrar un apodo a «Guardia-1234», ocultar un perfil o un puntaje, vetar una llave, con registro de cada acción. Reportes con tope por cuenta.

### Privacidad

- Política de privacidad en español: quién responde, para qué se usa cada dato, cuánto se guarda (la dirección de conexión, 30 días) y cómo se borra.
- Edad mínima de 14 años para dar correo o recibir noticias.
- Sin texto libre en los perfiles y sin mensajes entre jugadores.
- La API pública no muestra horas exactas de juego.
- Se diseña con el estándar europeo, que cubre también las leyes de Brasil, Colombia, México y Chile.

### El formato de un nivel

Un archivo JSON por nivel, validado contra el esquema: `formato`, `id`, `titulo`, `autor`, `hecho_con` (opcional), `basado_en` (opcional), `motor`, `lente`, `duracion_s`, `oleadas`, `boletin`, `sorpresas`, `estrellas`, `verificacion` (la partida con que el autor lo superó) y `licencia`.

### En el repositorio

- Pruebas en cada cambio: el esquema, cada motor, la repetición en varios navegadores y una partida sin pantalla de cada nivel.
- `AGENTS.md`, `CONTRIBUTING.md` en español y formularios de GitHub.
- **Toda contribución, de código o de niveles, se hace con un acuerdo de licencia de colaborador (CLA).** Quien aporta sigue siendo el autor y su aporte se publica con la licencia del repositorio, pero da permiso para distribuirlo también con otras condiciones, por ejemplo en una tienda de apps, cuyas reglas chocan con la AGPL. El acuerdo se firma una vez, antes del primer aporte.

### Medición

Con el mismo contador de Atalaya, sin cookies, y calculado en el servidor: cuántos terminan el primer nivel, cuántos reintentan, cuántos vuelven al día siguiente, cuántos comparten, cuántos escriben su dominio y cuántos llegan a Atalaya.

---

## 9. Etapas

Cada etapa termina con algo que se puede jugar y publicar, y con una prueba: **seguir, cambiar o parar.** La siguiente etapa solo empieza si la anterior la pasó.

| Etapa | Qué trae | Seguir si |
|---|---|---|
| **0. El peaje** | El núcleo determinista, El peaje completo con la lente Ciudad y el elenco que ya existe, efectos de sonido, estrellas, reintento, «le faltaron». Al terminar: la ficha, «Esto pasó anoche» corto y **«El peaje de su sitio»** (parte 10). El reto del día sin tabla, con su tarjeta para compartir y la racha en el teléfono. | Más del 70 % termina la primera partida, el reintento mediano es de 3 o más, el 20 % vuelve al día siguiente, el 5 % comparte y el 2 % escribe su dominio. |
| **1. La noche corta** | La cuarentena (mismo motor) y Las agujas. Una noche de tres horas que cierra con «La verdad» en texto. Progreso en el teléfono. El reto del día rota entre los tres. | El 30 % completa la noche y la llegada a Atalaya no baja. |
| **2. La torre, en gris** | Un prototipo de una semana de la defensa de la torre: tres invasores, tres defensas, sin arte nuevo. | Divierte. Si no, el jefe final pasa a ser La caída. |
| **3. La competencia** | El servidor con todo lo de la parte 8, el apodo, la tabla del reto y la histórica, Guardia sin fin, la noche como partida. | Hay al menos 100 jugadores por semana, sostenidos. |
| **4. La noche completa** | La patrulla, El correo y La caída, el amanecer con arte, las escenas, el interior de la torre, la selfie, el cuaderno, las insignias, los rangos, los perfiles, la música. El correo opcional. | Hay al menos 300 jugadores por semana durante cuatro semanas. |
| **5. La comunidad y las temporadas** | El formato de niveles con sus pruebas, `AGENTS.md`, los formularios, la Liga de bots, la tabla por país, la API pública y la temporada 1 oficial. | La comunidad envía niveles. |

**Parar** no es fracasar: si la etapa 0 no engancha, El peaje queda publicado como la puerta de entrada a Atalaya y el esfuerzo vuelve al producto.

---

## 10. Lanzamiento

### El puente hacia Atalaya: «El peaje de su sitio»

Al terminar el primer nivel, el juego pregunta: «¿Y su sitio? Escriba su dominio.»

- **Sin verificar que el sitio es suyo**, solo se revisa lo que es público para cualquiera: si tiene SPF y DMARC, si el certificado está vigente y cuándo vence, si manda los encabezados de seguridad, si responde. Nunca se prueban rutas como `/.env` en un sitio ajeno, para que el juego no sirva de escáner contra terceros.
- El resultado es un informe en pixel: «Su puerta: 2 fallas», que se puede compartir sin mostrar el dominio.
- **Para ver más** (qué robots tocaron su puerta anoche, si su `.env` está expuesto), hay que probar que el sitio es suyo, y ese paso es entrar a Atalaya.
- El cierre: «Esto lo revisamos una vez. Atalaya lo mira cada cinco minutos.»

Y el círculo al revés: quien ya usa Atalaya, cuando su monitor frena un ataque, puede jugar esa oleada.

### El embudo y sus metas

| Paso | Meta | Revisar si |
|---|---|---|
| Ve un video | — | — |
| Toca el enlace | 1,5 % de las vistas | menos de 0,5 % |
| Empieza a jugar | 80 % | menos de 60 %: falla la carga o el gancho |
| Termina El peaje | 65 % | menos de 40 % |
| Reintenta | 30 % | menos de 10 % |
| Comparte | 5 % | — |
| Escribe su dominio | 12 % de quienes terminan | menos de 4 % |
| Entra a Atalaya | 35 % de quienes escriben su dominio | casi nadie |

Las metas son estimaciones y se corrigen con los primeros datos.

### Dónde se publica

- **Videos verticales** en TikTok e Instagram, con el juego como gancho: «Anoche un servidor recibió miles de ataques. ¿Puede frenarlos en 60 segundos?». Los mejores son las derrotas graciosas: «Ese no era un robot. Era su cliente.»
- **itch.io**, con un diario de desarrollo en español.
- **Comunidades de programadores en español**, siempre con el juego y no con el producto como gancho, respetando las reglas de cada una.
- **Creadores de contenido de programación en español**, con un reto que lleve su nombre.
- **No** en portales de juegos casuales (su público no tiene sitios y algunos no permiten enlaces externos), ni en Product Hunt (en inglés, y el juego no es el producto).

### El reto del día como contenido

El reto de cada día toma el tono de la noche real anterior: si anoche hubo una ráfaga fuerte, hoy el reto la tiene. Cada día hay un video posible: «Hoy fueron 1.800 robots. ¿Cuántos frena usted?».

---

## Cambios de la revisión crítica

El 2026-09-28 el documento pasó por cinco revisiones, cada una con un ángulo. Lo que cambió:

**Diversión**
- El peaje se lee por la forma, no por el texto; una visita a la vez; deslizar para decidir; reglas como íconos; el primer toque antes del segundo 3.
- Los errores cuestan distinto y se explican al instante; fuera las trampas visuales.
- La noche tiene columna: cada nivel da una defensa para el amanecer.
- La patrulla usa el control real de DATA WING, con toques; las tuberías pasan a ser agujas grandes; La caída es una cascada con una sola causa.
- El amanecer dura de 150 a 180 s, con cuatro invasores y contras que dan bonificación, no la vida.
- El amanecer se abre con 8 estrellas; nadie espera una escena antes de jugar.
- La noche como partida con mejoras que se acumulan, para la segunda semana.

**Alcance**
- Las etapas se reordenaron: la etapa 0 es El peaje con el reto del día y el puente a Atalaya; cada etapa tiene su prueba de seguir, cambiar o parar.
- El arte nuevo, las escenas, la música y la comunidad llegan cuando hay jugadores que los justifiquen.
- Tablas, correo, países, perfiles, votaciones y temporadas llegan por partes, cuando hace falta.

**Crecimiento**
- El juego existe para llevar a Atalaya, y el puente está en el primer nivel: «El peaje de su sitio».
- Se definió quién da el salto a Atalaya y se agregó la parte 10, con el embudo y sus metas.

**Seguridad**
- El juego vive fuera de la carpeta del sitio de neracosu.com.
- La tabla no promete lo imposible: semillas del servidor, partidas públicas, revisión del top y la Liga de bots.
- Límites contra abuso, determinismo con reglas exactas, correo por un proveedor externo, privacidad, edad mínima y moderación.
- «Esto pasó anoche» no nombra el servidor ni da detalles que sirvan a un atacante.

**Precisión técnica**
- Corregidos: los robots de buscadores (se verifica de dónde vienen), `/wp-login.php`, el límite de peticiones, las puertas que se usan, el cortafuegos, el modo bajo ataque, la inyección SQL, el ransomware, SPF, DKIM y DMARC, el pool de conexiones y los valores de fail2ban.
- El elenco coincide con el del monitor; la base de la Planta es el tanque de datos y los archivos del Castillo son pergaminos.
- El rango «Vigía» pasó a ser «Sereno», para no confundirlo con Alba.
- El final ya no es un giro: es «esto pasó anoche», con las lentes que se agrietan a lo largo de la noche y `alba@atalaya` como primera pista.
- Los textos de humor se corrigieron para que un experto no los corrija.
