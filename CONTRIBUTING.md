# Cómo aportar

Gracias por querer mejorar «Atalaya: la guardia». Hay lugar para todos: quien juega y tiene una idea, quien
encuentra un error y quien quiere escribir código o niveles.

## Ideas y niveles

La forma más simple de aportar es contar una idea. En la pestaña **Issues** del repo hay tres formularios:

- **Idea de nivel**: una situación real de un servidor que daría un buen nivel. No hace falta saber programar;
  cuéntela como la viviría el guardia.
- **Error**: algo que no funciona o que se ve mal.
- **Propuesta**: un cambio en el juego, en el diseño o en el repo.

Antes de abrir uno, busque si ya existe. Si existe, sume lo suyo ahí.

## Errores

Un buen reporte dice qué esperaba, qué pasó y cómo repetirlo: el teléfono o la computadora, el navegador y, si
puede, una captura. Si es un error de seguridad (por ejemplo, una forma de sumar puntos sin jugar o de usar el
juego contra otros sitios), no lo publique en un issue: avísenos en privado desde la pestaña **Security** del
repo, con «Report a vulnerability».

## Pull requests

1. Haga un fork, cree una rama y trabaje ahí.
2. Corra el juego en su máquina (ver el `README.md`) y pruébelo en un teléfono o en el modo teléfono del
   navegador, con 390x844 de pantalla.
3. Corra `npm test`. Tiene que pasar entero.
4. Abra el pull request y complete la lista de revisión de la plantilla, incluida la casilla del CLA.

Un pull request chico y con un solo propósito se revisa rápido. Si el cambio es grande, abra antes una
**Propuesta** para conversarlo y no trabajar de más.

## Lo hecho con IA es bienvenido

Si construye con IA, aquí tiene su lugar. No hace falta confesar nada ni justificarse: a lo hecho con IA se le
pide lo mismo que a todo lo demás.

- **Que funcione**: usted lo probó en el juego, no solo lo leyó.
- **Que pase las pruebas**: `npm test` en verde.
- **Que una persona lo firme**: alguien de carne y hueso abre el pull request, responde por el aporte y acepta
  el CLA. Un agente no puede firmar por usted.

Su agente tiene sus instrucciones en [`AGENTS.md`](AGENTS.md). Si quiere contar que lo hizo con IA, cuéntelo con
orgullo en el pull request.

## Reglas de estilo

- **JavaScript sin librerías ni compilación.** Módulos del navegador, tal cual. Nada de `npm install`.
- **Todos los textos al jugador en `public/js/textos.js`.** En español, tratando de usted, cortos y claros.
- **Sin emojis**, en ningún lado: ni en el juego, ni en el código, ni en los documentos, ni en los commits.
  Lo que haga falta dibujar, se dibuja en pixel art.
- **Pixel art como acento, texto nítido.** Los dibujos a escala entera y sin suavizado; los textos siempre a
  resolución completa. Nunca se baja la resolución.
- **Nada en línea.** Ni `<script>` ni `<style>` ni atributos `style` ni `onclick` en el HTML: el sitio va con
  una política de seguridad de contenido estricta. Desde JavaScript, `elemento.style` sí se puede.
- **Nada de afuera.** Fuentes, imágenes y código se sirven desde el propio sitio.
- **El núcleo es determinista.** Lo que está en `public/js/motor/` no usa `Math.random`, `Date.now` ni
  trigonometría (ver `AGENTS.md`).
- **Nombres ficticios.** Nada de nombres reales de proyectos, clientes ni personas, ni en comentarios ni en
  pruebas.
- **Comentarios en español**, explicando el porqué más que el qué.

## El acuerdo de licencia de colaborador (CLA)

Todo aporte de código o de niveles necesita que su autor acepte, una sola vez, el acuerdo de
[`CLA.md`](CLA.md). En corto: usted sigue siendo el autor, su aporte se publica con la licencia del repo
(AGPL-3.0 el código, CC BY-SA 4.0 los niveles) y además le da permiso al proyecto para distribuirlo con otras
condiciones, por ejemplo en una tienda de apps, cuyas reglas chocan con la AGPL.

Se acepta en el pull request: marque la casilla del CLA en la plantilla y deje en la descripción la frase
indicada en `CLA.md`. Sin eso, el pull request no se puede unir.

## Licencias

Al aportar, su código queda bajo AGPL-3.0 y sus niveles bajo CC BY-SA 4.0, como el resto del repo.
