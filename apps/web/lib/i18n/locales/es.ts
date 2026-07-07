const locale = {
  nav: {
    home: "Inicio",
    booth: "Booth",
    live: "En vivo",
    profiles: "Perfil",
    leaderboard: "Ranking",
    settings: "Ajustes",
  },
  hero: {
    worldCup: "Copa del Mundo 2026",
    tagline: "Di tu apuesta.",
    description:
      "Predicciones por voz, goles en vivo y liquidación verificada — para fans que quieren sentir el partido.",
  },
  home: {
    predictMatch: "Predice un partido",
    loadingFixtures: "Cargando partidos y cuotas del Mundial…",
    noMatchDataTitle: "Sin datos de partidos ahora",
    noMatchDataDescription:
      "Los partidos y cuotas en vivo no están disponibles en TxLINE por el momento. No mostramos datos falsos — vuelve pronto.",
    txlineNotConnectedTitle: "TxLINE no está conectado",
    txlineNotConnectedDescription:
      "Añade tus credenciales TxLINE y ejecuta la configuración para cargar partidos y cuotas en vivo.",
  },
  actionCards: {
    enterBooth: {
      title: "Entrar al booth",
      description: "Di tu predicción con el locutor del estadio.",
      cta: "Iniciar sesión de voz",
    },
    thePitch: {
      title: "La Cancha",
      description: "Goles, clips y pulso del partido en vivo.",
      cta: "Abrir feed en vivo",
    },
    walletRequired: "Conecta tu wallet para entrar al booth de voz.",
    settlement: "Liquidado en Solana con",
    settlementProvider: "prueba TxLINE",
    needWallet: "¿Necesitas una wallet?",
    setupProfile: "Configúrala en Perfil",
  },
  match: {
    market: "Mercado",
    crowd: "Público",
    vs: "vs",
    isLiveNow: "está en vivo",
    openLive: "Ver en vivo",
    nextUp: "Próximo",
    txlineMarket: "Mercado TxLINE",
    marketHint: "Lo que piensan las casas",
    crowdLabel: "Público Goalaxify",
    crowdHint: "Dónde va el dinero de los fans",
    boothOpen: "Booth de voz abierto",
    talkYourBet: "Di tu apuesta",
    oddsHelp:
      "Elige quién gana, empate o visitante — en probabilidades simples, sin jerga.",
    oddsShifting: "Cuotas moviéndose",
    oddsShiftOn: "en",
  },
  booth: {
    eyebrow: "Booth de predicción",
    title: "Di tu apuesta",
    description:
      "Elige un partido próximo y dile al locutor tu mercado, selección y stake.",
    loading: "Cargando partidos para el booth…",
    voiceTitle: "Booth de voz",
    manageHint:
      "Habla con el locutor para cancelar con reembolso total o reemplazar tu apuesta. Phantom solo se abre si hay un nuevo stake que firmar.",
    stakeHint:
      "Di tu predicción al locutor. Confirma por voz — al aceptar, la app apuesta automáticamente (Phantom abre para firmar).",
    status: {
      ready: "Listo",
      connecting: "Conectando…",
      live: "En vivo",
      ended: "Sesión terminada",
      unavailable: "No disponible",
      signing: "Firmando…",
      refunding: "Reembolsando…",
      processing: "Procesando…",
    },
    refundingMessage: "Reembolsando tu stake anterior del pozo…",
    signingMessage: "Aprueba en Phantom para firmar tu stake…",
    done: "Hecho",
    manageByVoice: "Gestionar apuesta por voz",
    startSession: "Iniciar sesión de voz",
    mute: "Activar mic",
    unmute: "Silenciar",
    endSession: "Terminar sesión",
    newSession: "Nueva sesión",
    linkedWallet: "Wallet vinculada:",
    callId: "ID de llamada:",
    viewLiveMoments: "Ver momentos en vivo",
  },
  bets: {
    yourPick: "Tu elección",
    stake: "Stake",
    potentialWin: "Ganancia potencial",
    resultPayout: "Pago del resultado",
    refundedStake: "Stake reembolsado",
    claimWinnings: "Cobrar ganancias",
    claiming: "Cobrando…",
    manageByVoice: "Gestionar por voz",
    matchLocked: "Partido iniciado — cambios bloqueados",
    status: {
      open: { label: "Abierta", description: "Toca para gestionar por voz antes del pitido" },
      locked: { label: "En juego", description: "Partido iniciado — esperando resultado" },
      won: { label: "Ganada", description: "Cobra tus ganancias" },
      lost: { label: "Perdida", description: "Mejor suerte en la próxima" },
      settled: { label: "Liquidada", description: "Ganancias cobradas on-chain" },
      cancelled: { label: "Cancelada", description: "Stake reembolsado antes del pitido" },
      replaced: { label: "Reemplazada", description: "Sustituida por una apuesta más nueva" },
    },
  },
  live: {
    eyebrow: "Pulso en vivo",
    title: "La Cancha",
    description:
      "Goles, descansos y ritmo del partido cuando hay un encuentro del Mundial en juego.",
    loading: "Buscando partidos en vivo…",
    unavailableTitle: "Feed en vivo no disponible",
    unavailableDescription:
      "Necesitamos datos activos de TxLINE antes de abrir la cancha en vivo.",
    noMatchTitle: "No hay partido en juego ahora",
    noMatchDescription:
      "El feed en vivo se abre cuando arranca un partido del Mundial. Aún puedes predecir desde inicio.",
    browseMatches: "Ver partidos próximos",
  },
  profiles: {
    eyebrow: "Identidad",
    title: "Perfil",
    description: "Gestiona tu identidad, wallet y apuestas on-chain en un solo lugar.",
    connectTitle: "Conecta para ver tu perfil",
    connectDescription:
      "Tu wallet, nombre de usuario, avatar, saldo e historial de apuestas aparecen aquí al conectar.",
    disconnectedDescription:
      "Conecta tu wallet para gestionar tu perfil, wallet y apuestas.",
    tabs: {
      details: "Detalles",
      wallet: "Wallet",
      bets: "Apuestas",
    },
  },
  leaderboard: {
    eyebrow: "Comunidad",
    title: "Ranking",
    description:
      "Mejores predictores por ganancias on-chain. Pon un nombre de usuario en Perfil para aparecer.",
    topWinners: "Top ganadores",
    loading: "Cargando ranking…",
    empty: "Aún no hay ganadores. Sé el primero en apostar y cobrar una predicción ganadora.",
    recentWins: "Victorias recientes",
    loadingRecent: "Cargando victorias recientes…",
    emptyRecent: "Las predicciones ganadoras aparecerán aquí tras la liquidación.",
    totalWon: "Total ganado",
    wins: "{{count}} victoria",
    winsPlural: "{{count}} victorias",
    rank1: "1.º",
    rank2: "2.º",
    rank3: "3.º",
    rankNth: "{{rank}}.º",
  },
  wallet: {
    connect: "Conectar wallet",
    reconnecting: "Reconectando…",
    restoring: "Restaurando tu sesión de wallet…",
    gateTitle: "Conecta tu wallet",
    gateDescription:
      "Vincula Phantom para apostar, entrar al booth de voz y recibir pruebas de liquidación.",
  },
  common: {
    loading: "Cargando…",
  },
  settings: {
    title: "Configuración",
    subtitle: "Administra tus preferencias y cuenta",
    preferences: {
      title: "Preferencias",
      language: "Idioma",
      change: "Cambiar",
    },
    about: {
      title: "Acerca de",
      version: "Versión 1.0.0",
      tagline: "Di tu apuesta. Predicciones por voz con liquidación verificada.",
    },
    privacy: "Política de Privacidad",
    terms: "Términos de Servicio",
    support: "Soporte",
  },
  language: {
    selectTitle: "Seleccionar idioma",
    selectDescription:
      "Elige tu idioma preferido. Se aplica a la interfaz de la app y al booth de voz.",
  },
};

export default locale;
