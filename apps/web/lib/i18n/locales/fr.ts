const locale = {
  nav: {
    home: "Accueil",
    booth: "Booth",
    live: "En direct",
    profiles: "Profil",
    leaderboard: "Classement",
    settings: "Paramètres",
  },
  hero: {
    worldCup: "Coupe du Monde 2026",
    tagline: "Dites votre pari.",
    description:
      "Prédictions vocales, buts en direct et règlement vérifié — pour les fans qui veulent vivre le match.",
  },
  home: {
    predictMatch: "Prédire un match",
    loadingFixtures: "Chargement des matchs et cotes de la Coupe du Monde…",
    noMatchDataTitle: "Aucune donnée de match pour le moment",
    noMatchDataDescription:
      "Les matchs et cotes en direct ne sont pas disponibles via TxLINE pour le moment. Nous n'affichons pas de données fictives — revenez bientôt.",
    txlineNotConnectedTitle: "TxLINE n'est pas connecté",
    txlineNotConnectedDescription:
      "Ajoutez vos identifiants TxLINE et lancez la configuration pour charger les matchs et cotes en direct.",
  },
  actionCards: {
    enterBooth: {
      title: "Entrer au booth",
      description: "Dites votre prédiction au speaker du stade.",
      cta: "Démarrer la session vocale",
    },
    thePitch: {
      title: "Le Terrain",
      description: "Buts, clips et rythme du match en direct.",
      cta: "Ouvrir le fil en direct",
    },
    walletRequired: "Connectez votre wallet pour entrer au booth vocal.",
    settlement: "Réglé sur Solana avec",
    settlementProvider: "preuve TxLINE",
    needWallet: "Besoin d'un wallet ?",
    setupProfile: "Configurer dans Profil",
  },
  match: {
    market: "Marché",
    crowd: "Foule",
    vs: "vs",
    isLiveNow: "est en direct",
    openLive: "Voir en direct",
    nextUp: "Prochain",
    txlineMarket: "Marché TxLINE",
    marketHint: "Ce que pensent les bookmakers",
    crowdLabel: "Foule Goalaxify",
    crowdHint: "Où les fans placent leur argent",
    boothOpen: "Booth vocal ouvert",
    talkYourBet: "Dites votre pari",
    oddsHelp:
      "Choisissez le vainqueur, le match nul ou l'équipe extérieure — en probabilités simples, sans jargon.",
    oddsShifting: "Cotes en mouvement",
    oddsShiftOn: "sur",
  },
  booth: {
    eyebrow: "Booth de prédiction",
    title: "Dites votre pari",
    description:
      "Choisissez un match à venir, puis indiquez au speaker votre marché, sélection et mise.",
    loading: "Chargement des matchs pour le booth…",
    voiceTitle: "Booth vocal",
    manageHint:
      "Parlez au speaker pour annuler avec remboursement intégral ou remplacer votre pari. Phantom ne s'ouvre que pour signer une nouvelle mise.",
    stakeHint:
      "Dites votre prédiction au speaker du stade. Confirmez par la voix — une fois d'accord, l'app mise automatiquement (Phantom s'ouvre pour signer).",
    status: {
      ready: "Prêt",
      connecting: "Connexion…",
      live: "En direct",
      ended: "Session terminée",
      unavailable: "Indisponible",
      signing: "Signature…",
      refunding: "Remboursement…",
      processing: "Traitement…",
    },
    refundingMessage: "Remboursement de votre mise précédente depuis le pot…",
    signingMessage: "Approuvez dans Phantom pour signer votre mise…",
    done: "Terminé",
    manageByVoice: "Gérer le pari par la voix",
    startSession: "Démarrer la session vocale",
    mute: "Couper le micro",
    unmute: "Activer le micro",
    endSession: "Terminer la session",
    newSession: "Nouvelle session",
    linkedWallet: "Wallet lié :",
    callId: "ID d'appel :",
    viewLiveMoments: "Voir les moments en direct",
  },
  bets: {
    yourPick: "Votre choix",
    stake: "Mise",
    potentialWin: "Gain potentiel",
    resultPayout: "Paiement du résultat",
    refundedStake: "Mise remboursée",
    claimWinnings: "Réclamer les gains",
    claiming: "Réclamation…",
    manageByVoice: "Gérer par la voix",
    matchLocked: "Match commencé — modifications verrouillées",
    status: {
      open: { label: "Ouvert", description: "Appuyez pour gérer par la voix avant le coup d'envoi" },
      locked: { label: "En cours", description: "Match commencé — en attente du résultat" },
      won: { label: "Gagné", description: "Réclamez vos gains" },
      lost: { label: "Perdu", description: "Bonne chance pour le prochain" },
      settled: { label: "Réglé", description: "Gains réclamés on-chain" },
      cancelled: { label: "Annulé", description: "Mise intégralement remboursée avant le coup d'envoi" },
      replaced: { label: "Remplacé", description: "Remplacé par un pari plus récent sur ce match" },
    },
  },
  live: {
    eyebrow: "Pouls en direct",
    title: "Le Terrain",
    description:
      "Buts, mi-temps et rythme du match quand une rencontre de Coupe du Monde est en cours.",
    loading: "Recherche de matchs en direct…",
    unavailableTitle: "Fil en direct indisponible",
    unavailableDescription:
      "Nous avons besoin de données TxLINE actives avant d'ouvrir le terrain en direct.",
    noMatchTitle: "Aucun match en cours pour le moment",
    noMatchDescription:
      "Le fil en direct s'ouvre automatiquement au coup d'envoi d'un match de Coupe du Monde. Vous pouvez toujours prédire depuis l'accueil.",
    browseMatches: "Voir les matchs à venir",
  },
  profiles: {
    eyebrow: "Identité",
    title: "Profil",
    description: "Gérez votre identité, wallet et paris on-chain en un seul endroit.",
    connectTitle: "Connectez-vous pour voir votre profil",
    connectDescription:
      "Votre adresse wallet, nom d'utilisateur, avatar, solde et historique de paris apparaissent ici une fois connecté.",
    disconnectedDescription:
      "Connectez votre wallet pour gérer votre profil, wallet et paris.",
    tabs: {
      details: "Détails",
      wallet: "Wallet",
      bets: "Paris",
    },
  },
  leaderboard: {
    eyebrow: "Communauté",
    title: "Classement",
    description:
      "Meilleurs pronostiqueurs classés par gains on-chain. Définissez un nom d'utilisateur dans Profil pour apparaître.",
    topWinners: "Meilleurs gagnants",
    loading: "Chargement du classement…",
    empty: "Pas encore de gagnants. Soyez le premier à miser et réclamer une prédiction gagnante.",
    recentWins: "Victoires récentes",
    loadingRecent: "Chargement des victoires récentes…",
    emptyRecent: "Les prédictions gagnantes apparaîtront ici après le règlement.",
    totalWon: "Total gagné",
    wins: "{{count}} victoire",
    winsPlural: "{{count}} victoires",
    rank1: "1er",
    rank2: "2e",
    rank3: "3e",
    rankNth: "{{rank}}e",
  },
  wallet: {
    connect: "Connecter le wallet",
    reconnecting: "Reconnexion…",
    restoring: "Restauration de votre session wallet…",
    gateTitle: "Connectez votre wallet",
    gateDescription:
      "Liez Phantom pour parier, entrer au booth vocal et recevoir les preuves de règlement.",
  },
  common: {
    loading: "Chargement…",
  },
  settings: {
    title: "Paramètres",
    subtitle: "Gérez vos préférences et votre compte",
    preferences: {
      title: "Préférences",
      language: "Langue",
      change: "Modifier",
    },
    about: {
      title: "À propos",
      version: "Version 1.0.0",
      tagline: "Dites votre pari. Prédictions vocales avec règlement vérifié.",
    },
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    support: "Assistance",
  },
  language: {
    selectTitle: "Choisir la langue",
    selectDescription:
      "Choisissez votre langue préférée. S'applique à l'interface de l'app et au booth vocal.",
  },
};

export default locale;
