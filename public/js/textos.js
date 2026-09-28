// Todos los textos del juego en un solo lugar. Tratan al jugador de usted.

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
    texto: 'Un servidor recién encendido recibe robots buscando /.env y /wp-login.php en cuestión de minutos. Se frenan con reglas como las de este peaje y con un límite de peticiones.',
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
    error: 'No pudimos revisarlo ahora. Intente de nuevo en un rato.',
    invalido: 'Escriba solo el dominio, por ejemplo susitio.com',
    fallas: n => n === 0 ? 'Su puerta: sin fallas a la vista' : n === 1 ? 'Su puerta: 1 falla' : `Su puerta: ${n} fallas`,
    cierre: 'Esto lo revisamos una vez. Atalaya lo mira cada cinco minutos.',
    atalaya: 'Vigilar mi sitio con Atalaya, gratis',
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
