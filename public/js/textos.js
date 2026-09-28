// Todos los textos del juego en un solo lugar. Tratan al jugador de usted.
// \u2060 es la unión de palabras: pegado al guion, evita que «/wp-login.php» se corte en dos líneas.

export const T = {
  titulo: 'Atalaya: la guardia',
  hora: '00:00 · El peaje',
  empezar: 'Tomar la guardia',
  reto: n => `Reto del día #${n}`,
  retoHecho: 'Reto de hoy jugado',
  racha: n => n === 1 ? '1 día de racha' : `${n} días de racha`,
  asistido: 'Modo asistido',
  asistidoAyuda: 'El juego va más lento. Las estrellas cuentan igual.',
  sonido: 'Sonido',
  vibracion: 'Vibración',
  menosMovimiento: 'Menos movimiento',
  codigo: 'Código fuente',

  pasar: 'Pasar',
  bloquear: 'Bloquear',
  chispa: 'Chispa',
  // lo que se lee sobre los autos y en los chips de las reglas
  marcas: { pasa: 'pasa', no: 'no', impostor: 'impostor', bloqueado: 'BLOQUEADO' },
  placas: { buscador: 'buscador', wp: 'wp-login' },
  ayudaCliente: 'Un cliente. Deslice a la derecha: que pase.',
  ayudaSospechoso: 'Auto sospechoso. Deslice a la izquierda: bloquéelo.',
  ayudaListo: 'Así se cuida la puerta. Que no se llene la fila.',

  reglas: {
    base: { titulo: 'La puerta', texto: 'Los clientes pasan. Los sospechosos, no.' },
    buscador: { titulo: 'Regla nueva', texto: 'Los robots del buscador pasan si vienen del buscador. Si la placa trae otro origen, es un impostor.' },
    wp: { titulo: 'Regla nueva', texto: 'Este sitio no es WordPress: quien busca wp-login, se bloquea.' },
  },
  rafaga: 'Ráfaga',

  motivos: {
    'bloqueo-cliente': 'Ese no era un robot. Era su cliente.',
    'bloqueo-dorado': 'Bloqueó a un cliente que venía a comprar.',
    'bloqueo-buscador': 'Venía del buscador de verdad. Regla del buscador.',
    'paso-sospechoso': 'Pasó un auto sospechoso. Iba a probar puertas.',
    'paso-impostor': 'Decía ser del buscador y no venía de ahí. Regla del buscador.',
    'paso-wp': 'Este sitio no es WordPress. Regla de wp-login.',
    colado: 'Se coló mientras la fila esperaba.',
  },

  fin: {
    tiempo: 'Amaneció en el peaje',
    integridad: 'La puerta cayó',
    puntos: 'Puntos',
    aciertos: 'Aciertos',
    falsos: 'Clientes bloqueados',
    pasaron: 'Malos que pasaron',
    colados: 'Colados',
    combo: 'Combo máximo',
    faltan: (n, e) => `Le faltaron ${n.toLocaleString('es')} puntos para ${e === 1 ? 'la primera estrella' : e === 2 ? 'la segunda estrella' : 'la tercera estrella'}.`,
    todas: 'Las tres estrellas. La puerta es suya.',
    otraVez: 'Otra vez',
    compartir: 'Compartir',
    copiado: 'Copiado. Péguelo donde quiera.',
    volver: 'Volver a la torre',
    asistido: 'Jugado en modo asistido',
    mejor: 'Su mejor marca',
  },

  deVerdad: {
    titulo: 'Esto pasa de verdad',
    texto: 'Un servidor recién encendido recibe robots buscando /.env y /wp-\u2060login.php en cuestión de minutos. Se frenan con reglas como las de este peaje y con un límite de peticiones.',
  },
  anoche: {
    titulo: 'Esto pasó anoche',
    texto: d => `En un servidor real: ${d.intentos.toLocaleString('es')} intentos de entrar, ${d.robots.toLocaleString('es')} robots frenados y ${d.visitas.toLocaleString('es')} visitas que pasaron.`,
  },
  suSitio: {
    titulo: '¿Y su sitio?',
    texto: 'Escriba su dominio y le decimos cómo está su puerta. Solo miramos lo que cualquiera puede ver.',
    placeholder: 'susitio.com',
    boton: 'Revisar mi puerta',
    revisando: 'Revisando…',
    invalido: 'Escriba solo el dominio, por ejemplo susitio.com',
    fallas: n => n === 0 ? 'Su puerta: sin fallas a la vista' : n === 1 ? 'Su puerta: 1 falla' : `Su puerta: ${n} fallas`,
    cierre: 'Esto lo revisamos una vez. Atalaya lo mira cada cinco minutos.',
    atalaya: 'Vigilar mi sitio con Atalaya, gratis',
    etiqueta: 'Su dominio',
    detalle: n => `${n} puntos que cualquiera puede ver`,
    // la imagen para compartir
    imagenTitulo: 'Su puerta',
    resumen: n => n === 0 ? 'Sin fallas' : n === 1 ? '1 falla' : `${n} fallas`,
    bien: 'bien',
    falla: 'falla',
    compartir: 'Compartir mi puerta',
    sinDominio: 'La imagen no muestra su dominio.',
    // al compartir: sin el dominio, nunca
    tarjeta: (fallas, total) => `Atalaya: la guardia · Su puerta\n${fallas === 0 ? `Sin fallas a la vista en ${total} puntos` : `${fallas} de ${total} puntos con fallas`}. ¿Y la suya?\natalaya.neracosu.com/juego`,
    archivo: 'atalaya-su-puerta.png',
    noSePudo: 'No se pudo revisar',
    // cuando la revisión no contesta con su propio mensaje
    errores: {
      sinConexion: 'Parece que no tiene conexión. Revise su internet e intente de nuevo.',
      tiempo: 'La revisión tardó demasiado. Intente de nuevo en un rato.',
      noDisponible: 'La revisión no está disponible en este momento. Intente de nuevo en un rato.',
      noAbierta: 'La revisión de sitios todavía no está abierta. Vuelva pronto.',
      caida: 'La revisión no responde ahora. Intente de nuevo en un rato.',
      espera: 'Hizo muchas revisiones seguidas. Espere un rato e intente de nuevo.',
      pausa: 'La revisión está en pausa. Intente más tarde.',
      origen: 'Esta revisión solo funciona desde el juego.',
      noExiste: 'No encontramos ese dominio. Revise que esté bien escrito.',
      incompleta: 'La respuesta de la revisión llegó incompleta. Intente de nuevo.',
    },
  },

  // el reto del día con el tono de la noche real (datos/anoche.json)
  tonos: {
    rafaga: n => `Hoy el reto trae la ráfaga de anoche: ${n.toLocaleString('es')} robots frenados en un servidor real.`,
    asedio: n => `Hoy el reto trae el asedio de anoche: ${n.toLocaleString('es')} intentos de entrar a un servidor real.`,
    clientela: n => `Hoy el reto trae la clientela de anoche: ${n.toLocaleString('es')} visitas en un servidor real.`,
  },

  // la sección de abajo de la portada: qué es, cómo se juega y de dónde sale
  landing: {
    rotulo: 'Qué es',
    que: 'Un juego de un minuto: usted cuida la puerta de un servidor, auto por auto, antes de que amanezca.',
    comoRotulo: 'Cómo se juega',
    pasos: [
      { titulo: 'El cliente pasa', texto: 'Trae gente en las ventanas. Deslice a la derecha o toque la mitad derecha.' },
      { titulo: 'El sospechoso se bloquea', texto: 'Oscuro, con la sirena roja y nadie adentro. Deslice a la izquierda o toque la mitad izquierda.' },
      { titulo: 'Llegan reglas nuevas', texto: 'El robot del buscador pasa solo si viene del buscador. Quien busca wp-login, no. Y si la fila se llena, se cuelan.' },
    ],
    teclado: 'En la computadora, con las flechas: derecha pasa, izquierda bloquea.',
    verdadRotulo: 'Esto no es inventado',
    verdadTitulo: 'Todo lo que pasa aquí pasa de verdad en un servidor.',
    verdadTexto: 'Un servidor recién publicado recibe robots que prueban /.env y /wp-\u2060login.php en cuestión de minutos. Las reglas del peaje son las mismas que los frenan en la vida real.',
    atalayaRotulo: 'De dónde sale',
    atalayaTitulo: 'Atalaya',
    atalayaTexto: 'El monitor que muestra un servidor como una ciudad pixel art: quién entra, quién toca la puerta y qué se frenó. Este juego vive en su universo.',
    atalayaEnlace: 'Conocer Atalaya',
    revisionTitulo: 'Revise su sitio gratis',
    abiertoRotulo: 'Código abierto',
    abiertoTexto: 'El juego es software libre bajo AGPL-3.0 y los niveles de la comunidad van bajo CC BY-SA 4.0. Puede leerlo, estudiarlo y mejorarlo.',
    abiertoEnlace: 'Ver el código',
    iaTitulo: '¿Construye con IA?',
    iaTexto: 'Aquí tiene su lugar. A lo hecho con IA se le pide lo mismo que a todo: que funcione, que pase las pruebas y que una persona lo firme.',
    cierre: 'Tomar la guardia',
  },

  // la imagen vertical del resultado y la tarjeta que se ve al compartir el enlace
  imagen: {
    rotulo: 'Atalaya',
    titulo: 'La guardia',
    partida: '00:00 · El peaje',
    reto: n => `Reto del día #${n}`,
    puntos: 'puntos',
    direccion: 'atalaya.neracosu.com/juego',
    archivo: 'atalaya-la-guardia.png',
    descargar: 'Descargar la imagen',
  },
  postal: {
    rotulo: 'Atalaya:',
    titulo: 'La guardia',
    lema: 'Cuide la puerta de un servidor en 60 segundos.',
    pie: 'Gratis, en el navegador',
    direccion: 'atalaya.neracosu.com/juego',
  },

  tarjeta: (n, estrellas, bloques) => `Atalaya: la guardia · Reto #${n}\n${estrellas} de 3 estrellas\n${bloques}\natalaya.neracosu.com/juego`,
  tarjetaPartida: (puntos, estrellas) => `Atalaya: la guardia · El peaje\n${puntos.toLocaleString('es')} puntos, ${estrellas} de 3 estrellas\natalaya.neracosu.com/juego`,

  cambios: {
    impostores: 'Hoy abundan los impostores',
    rafagas: 'Noche de ráfagas',
    prisa: 'La fila es corta: no se duerma',
    wordpress: 'Todos buscan wp-login',
  },
};
