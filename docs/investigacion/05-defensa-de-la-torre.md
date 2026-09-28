# Defensa de la torre: tower defense y MOBA (investigación del 2026-09-28)

[V] verificado (empresa o fuente primaria) · [I] estimación de la industria (Sensor Tower, SteamSpy, AppMagic).

## Éxitos y por qué funcionan
- Origen: mapas de StarCraft (Turret Defense, 2000) y Warcraft III (Element TD, Gem TD, 2006); Flash lo llevó a la web en 2007. https://en.wikipedia.org/wiki/Tower_defense
- Desktop Tower Defense (mar 2007): 15,7 M partidas en jul 2007 [V]; inventó el «mazing». https://en.wikipedia.org/wiki/Desktop_Tower_Defense
- Kingdom Rush (2011, nació gratis en el navegador): más de 63 M descargas y 30 M copias [V]; cuatro torres claras, mejoras con dos ramas, un héroe, dos poderes con recarga. https://en.wikipedia.org/wiki/Kingdom_Rush · https://www.pocketgamer.biz/ironhide-co-founder-pablo-realini-talks-kingdom-rush-5-and-premiums-place-in-2024/ · https://finance.yahoo.com/news/exclusive-ironhide-video-game-studio-151915869.html
- Bloons TD 6: app de pago más comprada del mundo en 2018; Ninja Kiwi 89,5 M USD en 2023 [V]. https://en.wikipedia.org/wiki/Bloons_TD_6 · https://businessdesk.co.nz/article/technology/ninja-kiwis-margins-in-good-shape-post-takeover
- Plants vs. Zombies: 300.000 copias en 9 días en App Store [V]; carriles horizontales, cada planta un papel legible. https://www.pcworld.com/article/511049/plants_vs_zombies_iphone_record.html
- Defense Grid (2008): más de 500.000 [V]; los enemigos roban núcleos y los cargan; si uno muere, el núcleo vuelve flotando y otro puede recogerlo. https://en.wikipedia.org/wiki/Defense_Grid:_The_Awakening · https://smashpad.com/a-decade-of-defense-grid/
- Arknights: más de 1.100 M USD [I]. https://www.superpixel.com/article/717634/arknights-surpasses-1-billion-global-revenue
- Rogue Tower: una torre, el camino crece y el jugador elige hacia dónde. https://store.steampowered.com/app/1843760/Rogue_Tower/
- Mindustry: TD + fábrica, GPLv3. https://github.com/Anuken/Mindustry

## Qué hace bueno a un TD
Piedra-papel-tijera; oleadas anunciadas (qué y por qué calle); llamar la oleada antes (oro extra, adelanta recargas); economía entre oleadas; mejoras de 3 niveles + rama; botón de pánico con recarga (lo que evita solo mirar); estrellas por vidas (Kingdom Rush: 18-20 = 3, 6-17 = 2, 1-5 = 1, https://kingdomrushtd.fandom.com/wiki/Lives); desafíos con restricciones (CHIMPS), sin fin, diario. Nivel de Kingdom Rush 5-15 min [estimación]; Clash Royale 3 min [V]; 60-90 s posible con 5-6 oleadas cortas, pocos huecos y sin fase de construcción aparte.
Vertical con una mano: The Tower – Idle Tower Defense (torre al centro, enemigos por todos lados, torneos por ligas; unos 7,1 M descargas y cerca de 1 M USD/mes [I]) es el antecedente más cercano. https://the-tower-idle-tower-defense.fandom.com/wiki/Tournaments · https://app.sensortower.com/overview/com.TechTreeGames.TheTower?country=US · Rush Royale más de 280 M USD y 73 M instalaciones [V, My.Games] https://gamedevreports.substack.com/p/rush-royale-has-surpassed-the-280m · Random Dice.

## MOBA e híbridos
- LoL: súbditos cada 30 s (20 desde el min 30); 3 cuerpo a cuerpo + 3 a distancia, cada tercera oleada un cañón; inhibidor caído → supersúbditos. https://wiki.leagueoflegends.com/en-us/Minion · https://wiki.leagueoflegends.com/en-us/Super_minion Tomar: 3 carriles al núcleo, ritmo fijo, carril «caído» que manda más fuertes.
- Clash Royale, «TD en duelo», más de 3.000 M USD [I] https://sensortower.com/blog/clash-royale-revenue-three-billion · Dungeon Defenders 1 M en feb 2012 [V] https://www.gamedeveloper.com/business/-em-dungeon-defenders-em-sells-1m-downloads · Orcs Must Die 1-2 M dueños [I] https://steamspy.com/app/102600 · Legion TD 2 competitivo con temporadas, unas 309.000 [I] https://steamspy.com/app/469600 · Sanctum TD + primera persona.

## Competitivo y validable
- Mismas reglas para todos; cuentas marcadas fuera de las tablas (Bloons). https://support.ninjakiwi.com/hc/en-us/articles/8174850681745-Account-Flagged-for-Hacking
- El servidor re-simula la repetición (Open Hexagon): azar propio (PCG), paso fijo, comparar tiempo real contra duración de la repetición (ralentizar es la trampa típica). https://vittorioromeo.com/index/blog/oh_secure_leaderboards.html
- Récord de rondas sin fin (Bloons CHIMPS: ronda 562 [V, wiki]). https://bloons.fandom.com/wiki/Late_Game_and_Freeplay_(BTD6)
- Técnica propuesta: semilla de la fecha, simulación entera a 30 ticks/s, registro (tick, hueco, acción), re-simulación en Node con el mismo módulo, sin Math.random ni trigonometría en la lógica.

## Propuesta
- Mapa vertical, torre en el tercio de abajo (zona del pulgar); tres calles como carriles: SSH, web (80/443), correo o base. 2-3 huecos fijos por calle; sin laberinto libre.
- Invasores reales con ficha «esto pasa de verdad»: fuerza bruta SSH (fila lenta; bloqueo de IP tipo fail2ban), escáner de puertos (rápido, todas las calles; cortafuegos cierra la calle), robots a /wp-admin y .env (captcha y límite de peticiones), inyección SQL (disfrazada de visita por 443; solo el WAF), DDoS en ráfaga (límite de peticiones + pánico), archivo malicioso (tanque que infecta un distrito; cuarentena), jefe ransomware (cifra un distrito; la copia de seguridad lo revive).
- Visitas legítimas por las mismas calles: dan recursos al llegar; bloquear una (falso positivo) rompe combo. Se filtra, no se mata todo; el captcha también frena humanos.
- Mejoras de 3 niveles + rama (fail2ban → ban permanente o por subred).
- Pánico: «modo bajo ataque» (existe en Cloudflare), frena todo 5 s; se carga llamando oleadas antes y con combo.
- 90 s, 6 oleadas de unos 12 s, aviso al borde de cada calle; integridad de la torre 20; estrellas como Kingdom Rush.
- Un dedo: tocar hueco → arco de 3 opciones; tocar defensa → mejora o ramas; pánico y llamar oleada abajo; sin arrastrar.
- Dónde: jefe final de cada distrito o temporada y modo sin fin «Guardia sin fin» con semilla diaria y récord de oleadas. No como un nivel más del montón.
