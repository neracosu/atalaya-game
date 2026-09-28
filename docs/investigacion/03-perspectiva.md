# Cambiar de perspectiva (investigación del 2026-09-28)

## Juegos que cambian de vista y por qué funcionan
- **Fez**: parece 2D hasta que se gira 90 grados; cuatro vistas ortográficas; el wow es descubrirlo. https://en.wikipedia.org/wiki/Fez_(video_game) · https://www.gamedeveloper.com/design/polytron-s-phil-fish-on-i-fez-i-design-and-how-most-3d-games-could-be-downgraded-to-2d-
- **Super Paper Mario**: el Flip a 3D para acertijos gustó mucho; la historia, menos del 1 % en la encuesta de Club Nintendo. Recuerdan la mecánica de la vista más que el guion. https://en.wikipedia.org/wiki/Super_Paper_Mario · https://iwataasks.nintendo.com/interviews/3ds/papermario/0/2/
- **Super Mario Odyssey**: tuberías 8-bit, 2D sobre los muros con chiptune; el truco crece (cilindros, cubos). https://www.mariowiki.com/8-Bit_Pipe
- **Zelda: A Link Between Worlds**: Link pintura en la pared; «solo quedar plano» sería un scroll lateral más, por eso dobla esquinas; barra de energía lo limita. https://www.zeldadungeon.net/a-link-between-worlds-developers-discuss-wall-merging-ability/
- **Link's Awakening / Deltarune**: pasadizos laterales cortos dentro de un juego cenital. https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Link's_Awakening · https://deltarune.wiki/w/Platforming
- **Undertale, Deltarune, Pokémon**: combate en otra vista; transición «fight woosh» (flash, barrido, música). https://www.gamespot.com/articles/deltarune-is-a-beautiful-extension-of-a-deeper-und/1100-6463044/ · https://tvtropes.org/pmwiki/pmwiki.php/Main/FightWoosh
- **Inscryption**: primera persona claustrofóbica; la cámara cambia según quién controla. https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Inscryption
- **Cuphead**: mapa cenital y niveles laterales dan ritmo. https://en.wikipedia.org/wiki/Cuphead
- **Octopath (HD-2D)**: sprites en mundo 3D con tilt-shift, «mirar un diorama». https://en.wikipedia.org/wiki/HD-2D
- **Monument Valley / Superliminal**: ilusión óptica; «corto pero sublime». https://gdcvault.com/play/1020878/Designing-Monument-Valley-Less-Game · https://www.gamedeveloper.com/design/designing-the-mind-bending-perspective-puzzles-of-i-superliminal-i-
- Cámaras en general (GDC, Simon Unger): https://www.gamedeveloper.com/art/video-a-primer-on-designing-better-cameras-for-games
- No encontrado: charla GDC dedicada solo a la sorpresa de perspectiva; fuentes de Pikuniku o Metal Slug sobre cámara.

**Patrón**: el cambio es corto, llega de sorpresa, cambia la regla (no solo el dibujo) y es el mismo mundo reconocible.

## Mismo lugar en varias vistas (pixel art)
- Isométrica 2:1 (techo y dos paredes); Tibia oblicua (suelo desde arriba, alturas inclinadas); lateral (una fachada). Fijar desde el principio paleta, luz, escala y proporciones. https://www.slynyrd.com/blog/2018/4/12/pixelblog-4-graphical-projection-part-2 · https://en.wikipedia.org/wiki/Tibia_(video_game)
- Reconocer: cada lugar conserva sus hitos (torre: antena, baliza, color; distrito: color firma y edificio emblema); misma rampa de paleta.
- Parallax: 3-5 capas simples; velocidades enteras en píxeles. https://www.slynyrd.com/blog/2019/11/12/pixelblog-23-parallax-scrolling
- Profundidad barata: fondos desvaídos al color del cielo, primer plano contrastado (Metal Slug). https://linclogames.com/metal-slug-is-pixel-art-perfection/
- Retrato/selfie: un cuadro a escala mayor con 2-3 fotogramas.

## Transiciones baratas en canvas 2D
- Zoom entero + iris o flash y cambio de vista (`imageSmoothingEnabled=false`).
- Giro de tarjeta: `scaleX = cos(t)`, cambiar la imagen en ancho 0 (como el Flip). https://www.mariowiki.com/Flip
- Mode 7 por franjas con `drawImage`: vuelo rasante. https://github.com/HugoSmits86/js-mode7 · https://ada-lovecraft.github.io/post/mode-seven/
- Dolly zoom falso; ondulación por líneas; persiana; bajar del cielo.

## Cinemáticas con poco arte
- Solo imágenes (Hyper Light Drifter). https://www.gamedeveloper.com/business/the-ultra-modern-stylings-of-hyper-light-drifter
- 3-6 cuadros de 2-4 s, 15-40 s en total (Halo: escenas a mitad de misión bajo unos 45 s). https://honeysanime.com/what-is-the-ideal-length-for-cutscenes-in-games/
- Texto letra por letra a 5-20 caracteres/s; un toque completa, otro avanza. https://wiki.gdevelop.io/gdevelop5/extensions/auto-typing/
- Saltar siempre y poder volver a verla. https://gameaccessibilityguidelines.com/full-list/

## Propuestas
1. **Frente a la torre**: nivel lateral, el guardián defiende la puerta de lo que llega por la calle; parallax de 4 capas; 2-3 botones táctiles.
2. **La selfie del distrito**: cuadro frontal con flash y marco al completar un distrito; habitantes posan; se guarda como imagen.
3. **Panorámica del amanecer**: apertura lateral de unos 25 s, reutiliza las capas de la 1.
4. **Bajar del cielo**: transición zoom + iris (o giro de tarjeta).
5. **Vuelo rasante**: Mode 7 cuando llega una amenaza.
6. **Desde la ventana**: primera persona dentro de la torre, consola al frente, distritos por la ventana; pausa o jefe final.
7. **Rotar la ciudad (Fez)**: la más cara; solo para un rompecabezas o descartar.
Recomendado: 1 + 4, y 3 como apertura con las mismas capas; 2 después como recompensa compartible.
