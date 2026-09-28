# Comunidad y temporadas (investigación del 2026-09-28)

[V] fuente consultada · [E] estimación o inferencia.

## Geometry Dash
- [V] Una sola persona (RobTop), 13-08-2013; editor y subida de niveles desde el lanzamiento; más de 140 M de niveles subidos (ID 140000000 el 14-05-2026), la mayoría borrados; más de 100.000 simultáneos en Steam en ene 2026; Bloodbath más de 160 M descargas. https://en.wikipedia.org/wiki/Geometry_Dash · https://geometrydash.wiki.gg/wiki/User_Levels
- [V] Publicar: cuenta, al menos 10 s y 2000 objetos, y el creador debe «verificarlo» (superarlo). Mario Maker: Clear Check. https://supermariomaker2.fandom.com/wiki/Clear_Check
- [V] Califica RobTop en persona; moderadores le envían candidatos; él ordena Featured. https://www.robtopgames.com/faq/en/answers/level/
- [V] Rate, Featured, Epic, Legendary, Mythic (1 a 5 puntos de creador, cada una con su brillo/llama); dificultad 1-10 estrellas; Demon en 5 grados; diarios, semanales, Gauntlets y Map Packs dan diamantes.
- [V] Demonlist (Pointercrate): de la comunidad desde 2015; top 150 (principal 1-75, extendida 76-150) más histórica; récords solo con video crudo; puntos y tablas por país. https://geometrydash.wiki.gg/wiki/Demonlist_(Pointercrate)
- [E] Engancha crear porque el editor es el mismo motor, hay premio visible y escalonado, la verificación pone un mínimo de calidad y hay escalera social (crear → enviado → calificado → diario).

## Roblox (lo aplicable)
- [V] 151,5 M activos diarios en T3 2025; más de 1000 M USD a creadores (mar 2024-mar 2025). https://about.roblox.com/newsroom/2025/09/roblox-annual-economic-impact-report
- [V] «The Hunt» (15-30 mar 2024): 100 experiencias con misiones, premios por hitos (5, 20...). https://roblox.fandom.com/wiki/The_Hunt:_First_Edition
- [E] Aplicable: evento que junte niveles de la comunidad con premios por hitos, no por ranking.

## Otros
- [V] Trackmania: Track of the Day elegido a mano entre usuarios; cada domingo cinco Weekly Shorts con tiempos ocultos. https://en.wikipedia.org/wiki/Trackmania_(2020_video_game)
- [V] Mario Maker 2: código de 9 caracteres por nivel y creador; 2 M niveles en menos de dos semanas. https://supermariomaker2.fandom.com/wiki/Course_ID · https://www.techradar.com/news/super-mario-maker-2-on-switch-has-hit-2-million-player-made-courses
- [V] osu!: hype de 5 usuarios, 2 nominaciones de revisores, 7 días en Qualified, luego Ranked. https://osu.ppy.sh/wiki/en/Beatmap_ranking_procedure
- [V] Celeste Spring Collab 2020: más de 100 creadores en un mod, código en GitHub. https://github.com/EverestAPI/SpringCollab2020
- [V] SuperTux: add-on por pull request (archivo + entrada en el índice; id «autor-titulo»). https://github.com/SuperTux/addons/blob/master/README.md
- [V] Cataclysm DDA: contenido en JSON por pull request, linter obligatorio, guía de estilo; prohíbe contenido hecho con IA. https://github.com/CleverRaven/Cataclysm-DDA/blob/master/doc/CONTRIBUTING.md
- [V] Wesnoth: `_server.pbl` validado contra esquema. https://wiki.wesnoth.org/PblWML
- [V] Mindustry: lista de servidores en JSON por pull request. https://github.com/Anuken/MindustryServerList

## Temporadas
- [V] Trackmania: cada 3 meses 25 pistas en 5 dificultades; la tabla de temporada cierra con ganador, los récords por pista siguen abiertos. https://doc.trackmania.com/play/what-is-a-seasonal-campaign/
- [V] Path of Exile: ligas de unos 3 meses; los personajes pasan a Standard. https://pathofexile.fandom.com/wiki/League
- [V] Diablo IV: personajes al reino eterno; se conserva mapa y altares. https://clutchpoints.com/gaming/diablo-4-guide-what-carries-over-between-seasons-and-eternal-realms
- [V] Hearthstone: mensual, todos a Bronce 10, rangos piso, bono por la anterior. https://wecoach.gg/blog/article/the-hearthstone-ranked-system-explained
- [V] Clash Royale: mensual; la Trophy Road no se reinicia, solo el tramo de temporada. https://support.clashroyale.com/hc/en-us/articles/49484906823195-Seasonal-Trophy-Road
- [V] Fortnite: unos 83 días; desde C5T4 los objetos del pase pueden volver tras 18 meses. https://www.epicgames.com/help/en-US/c-Category_Fortnite/c-Fortnite_Gameplay/do-previous-fortnite-battle-passes-or-items-from-previous-battle-passes-ever-return-a000090450
- [E] Patrón ético: 1-3 meses; se reinicia solo la tabla competitiva; progreso y contenido se conservan; premios cosméticos; lo viejo sigue jugable.

## Propuesta para Atalaya [E]
- Nivel como datos: `niveles/comunidad/<autor>-<slug>.json` validado con JSON Schema en GitHub Actions. Campos: formato, id, titulo, autor {nombre, github}, duracion_s (60-90), semilla, ciudad, eventos (tiempo, tipo de fallo, edificio), estrellas (umbrales), nota_autor, licencia.
- Tres vías: (1) issue form «Idea de nivel» en texto libre; (2) editor en el juego que exporta JSON y código corto y abre un issue lleno (`issues/new?template=nivel.yml&body=...`, https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms), con verificación obligatoria; (3) pull request con plantilla y CONTRIBUTING en español.
- Revisión: CI valida esquema y simula sin pantalla que se puede superar; 2 revisores. Escalera: Aceptado (catálogo) → Destacado (reto diario) → De temporada (campaña oficial), con marcas pixel.
- Crédito: «Nivel de @usuario» al empezar; página Creadores generada de los JSON; puntos de creador 1/2/3 junto al nombre; el changelog lo nombra.
- Decidir: licencia del contenido de niveles (AGPL o CC BY-SA) y política sobre niveles hechos con IA.
- Temporada: 3 meses con fechas anunciadas; 7 niveles nuevos (4-5 oficiales, 2-3 de la comunidad), quizá una regla o tema nuevo; la tabla cierra y los primeros ganan placa «Guardia de la Temporada N»; se conservan estrellas, niveles, insignias y puntos de creador; tablas por nivel abiertas para siempre; temporadas viejas en un Archivo jugable. Nada se compra, sin pase, rachas sin castigo. Cada temporada abre con un llamado a enviar niveles.
