# Atalaya: la guardia — documento de diseño

Documento vivo. Se escribe parte por parte y cada parte queda cerrada cuando se acuerda.

| Parte | Estado |
|---|---|
| 1. Visión | Cerrada (2026-09-28) |
| 2. Historia y mundo | En discusión |
| 3. Niveles y mecánicas | Pendiente |
| 4. Lo que hace volver | Pendiente |
| 5. Tablas, reto del día y temporadas | Pendiente |
| 6. Cinemáticas y perspectiva | Pendiente |
| 7. Arte y sonido | Pendiente |
| 8. Técnica | Pendiente |
| 9. Etapas | Pendiente |

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

En discusión.

## 3. a 9.

Pendientes.
