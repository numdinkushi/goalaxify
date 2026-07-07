const locale = {
  nav: {
    home: "Home",
    booth: "Booth",
    live: "Live",
    profiles: "Profilo",
    leaderboard: "Classifica",
    settings: "Impostazioni",
  },
  hero: {
    worldCup: "Mondiale 2026",
    tagline: "Dì la tua scommessa.",
    description:
      "Previsioni vocali, gol in diretta e regolamento verificato — per i fan che vogliono sentire la partita.",
  },
  home: {
    predictMatch: "Prevedi una partita",
    loadingFixtures: "Caricamento partite e quote del Mondiale…",
    noMatchDataTitle: "Nessun dato sulle partite al momento",
    noMatchDataDescription:
      "Partite e quote live non sono disponibili da TxLINE al momento. Non mostriamo dati fittizi — riprova a breve.",
    txlineNotConnectedTitle: "TxLINE non è connesso",
    txlineNotConnectedDescription:
      "Aggiungi le credenziali TxLINE ed esegui la configurazione per caricare partite e quote live.",
  },
  actionCards: {
    enterBooth: {
      title: "Entra nel booth",
      description: "Dì la tua previsione al speaker dello stadio.",
      cta: "Avvia sessione vocale",
    },
    thePitch: {
      title: "Il Campo",
      description: "Gol, clip e ritmo della partita in diretta.",
      cta: "Apri feed live",
    },
    walletRequired: "Connetti il wallet per entrare nel booth vocale.",
    settlement: "Regolato su Solana con",
    settlementProvider: "prova TxLINE",
    needWallet: "Serve un wallet?",
    setupProfile: "Configura nel Profilo",
  },
  match: {
    market: "Mercato",
    crowd: "Folla",
    vs: "vs",
    isLiveNow: "è in diretta",
    openLive: "Apri live",
    nextUp: "Prossima",
    txlineMarket: "Mercato TxLINE",
    marketHint: "Cosa pensano i bookmaker",
    crowdLabel: "Folla Goalaxify",
    crowdHint: "Dove i fan stanno mettendo i soldi",
    boothOpen: "Booth vocale aperto",
    boothClosed: "Scommesse chiuse — partita in corso",
    manageYourBet: "Gestisci la tua scommessa",
    betPlacedInPlay: "La tua scommessa è bloccata fino al fischio finale",
    talkYourBet: "Dì la tua scommessa",
    oddsHelp:
      "Scegli chi vince, pareggio o trasferta — in probabilità semplici, senza gergo.",
    oddsShifting: "Quote in movimento",
    oddsShiftOn: "su",
  },
  booth: {
    eyebrow: "Booth previsioni",
    title: "Dì la tua scommessa",
    description:
      "Scegli una partita imminente e comunica al speaker mercato, selezione e stake.",
    loading: "Caricamento partite per il booth…",
    voiceTitle: "Booth vocale",
    manageHint:
      "Parla con lo speaker per annullare con rimborso completo o sostituire la scommessa. Phantom si apre solo per firmare un nuovo stake.",
    stakeHint:
      "Dì la tua previsione allo speaker dello stadio. Conferma a voce — una volta d'accordo, l'app punta automaticamente (Phantom si apre per firmare).",
    lockedTitle: "Booth chiuso",
    lockedDescription:
      "La partita è iniziata. Le scommesse sono bloccate fino al fischio finale — niente nuove puntate o modifiche.",
    status: {
      ready: "Pronto",
      connecting: "Connessione…",
      live: "Live",
      ended: "Sessione terminata",
      unavailable: "Non disponibile",
      signing: "Firma…",
      refunding: "Rimborso…",
      processing: "Elaborazione…",
    },
    refundingMessage: "Rimborso del tuo stake precedente dal piatto…",
    signingMessage: "Approva in Phantom per firmare il tuo stake…",
    done: "Fatto",
    manageByVoice: "Gestisci scommessa a voce",
    startSession: "Avvia sessione vocale",
    mute: "Disattiva microfono",
    unmute: "Attiva microfono",
    endSession: "Termina sessione",
    newSession: "Nuova sessione",
    linkedWallet: "Wallet collegato:",
    callId: "ID chiamata:",
    viewLiveMoments: "Vedi momenti live",
  },
  bets: {
    yourPick: "La tua scelta",
    stake: "Stake",
    potentialWin: "Vincita potenziale",
    resultPayout: "Pagamento risultato",
    refundedStake: "Stake rimborsato",
    claimWinnings: "Riscuoti vincite",
    claiming: "Riscossione…",
    manageByVoice: "Gestisci a voce",
    matchLocked: "Partita iniziata — modifiche bloccate",
    status: {
      open: { label: "Aperta", description: "Tocca per gestire a voce prima del fischio" },
      locked: { label: "In corso", description: "Partita iniziata — in attesa del risultato" },
      won: { label: "Vinta", description: "Riscuoti le tue vincite" },
      lost: { label: "Persa", description: "Meglio fortuna la prossima volta" },
      settled: { label: "Regolata", description: "Vincite riscosse on-chain" },
      cancelled: { label: "Annullata", description: "Stake rimborsato prima del fischio" },
      replaced: { label: "Sostituita", description: "Sostituita da una scommessa più recente" },
    },
  },
  live: {
    eyebrow: "Pulsazione live",
    title: "Il Campo",
    description:
      "Gol, intervalli e ritmo della partita quando c'è una partita del Mondiale in corso.",
    loading: "Ricerca partite live…",
    unavailableTitle: "Feed live non disponibile",
    unavailableDescription:
      "Servono dati TxLINE attivi prima di aprire il campo live.",
    noMatchTitle: "Nessuna partita in corso al momento",
    noMatchDescription:
      "Il feed live si apre automaticamente all'inizio di una partita del Mondiale. Puoi ancora prevedere dalla home.",
    browseMatches: "Sfoglia partite imminenti",
  },
  profiles: {
    eyebrow: "Identità",
    title: "Profilo",
    description: "Gestisci identità, wallet e scommesse on-chain in un unico posto.",
    connectTitle: "Connetti per vedere il tuo profilo",
    connectDescription:
      "Indirizzo wallet, nome utente, avatar, saldo e cronologia scommesse compaiono qui dopo la connessione.",
    disconnectedDescription:
      "Connetti il wallet per gestire profilo, wallet e scommesse.",
    tabs: {
      details: "Dettagli",
      wallet: "Wallet",
      bets: "Scommesse",
    },
  },
  leaderboard: {
    eyebrow: "Community",
    title: "Classifica",
    description:
      "Migliori pronosticatori per vincite on-chain. Imposta un nome utente nel Profilo per comparire.",
    topWinners: "Top vincitori",
    loading: "Caricamento classifica…",
    empty: "Ancora nessun vincitore. Sii il primo a puntare e riscuotere una previsione vincente.",
    recentWins: "Vittorie recenti",
    loadingRecent: "Caricamento vittorie recenti…",
    emptyRecent: "Le previsioni vincenti appariranno qui dopo il regolamento.",
    totalWon: "Totale vinto",
    wins: "{{count}} vittoria",
    winsPlural: "{{count}} vittorie",
    rank1: "1º",
    rank2: "2º",
    rank3: "3º",
    rankNth: "{{rank}}º",
  },
  wallet: {
    connect: "Connetti wallet",
    reconnecting: "Riconnessione…",
    restoring: "Ripristino sessione wallet…",
    gateTitle: "Connetti il wallet",
    gateDescription:
      "Collega Phantom per scommettere, entrare nel booth vocale e ricevere prove di regolamento.",
  },
  common: {
    loading: "Caricamento…",
  },
  settings: {
    title: "Impostazioni",
    subtitle: "Gestisci preferenze e account",
    preferences: {
      title: "Preferenze",
      language: "Lingua",
      change: "Modifica",
    },
    about: {
      title: "Informazioni",
      version: "Versione 1.0.0",
      tagline: "Dì la tua scommessa. Previsioni vocali con regolamento verificato.",
    },
    privacy: "Informativa sulla privacy",
    terms: "Termini di servizio",
    support: "Supporto",
  },
  language: {
    selectTitle: "Seleziona lingua",
    selectDescription:
      "Scegli la lingua preferita. Si applica all'interfaccia dell'app e al booth vocale.",
  },
};

export default locale;
