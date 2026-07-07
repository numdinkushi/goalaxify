const locale = {
  nav: {
    home: "Início",
    booth: "Booth",
    live: "Ao vivo",
    profiles: "Perfil",
    leaderboard: "Ranking",
    settings: "Definições",
  },
  hero: {
    worldCup: "Copa do Mundo 2026",
    tagline: "Diga sua aposta.",
    description:
      "Previsões por voz, gols ao vivo e liquidação verificada — para fãs que querem sentir o jogo.",
  },
  home: {
    predictMatch: "Prever um jogo",
    loadingFixtures: "Carregando jogos e odds da Copa do Mundo…",
    noMatchDataTitle: "Sem dados de jogos no momento",
    noMatchDataDescription:
      "Jogos e odds ao vivo não estão disponíveis no TxLINE no momento. Não exibimos dados fictícios — volte em breve.",
    txlineNotConnectedTitle: "TxLINE não está conectado",
    txlineNotConnectedDescription:
      "Adicione suas credenciais TxLINE e execute a configuração para carregar jogos e odds ao vivo.",
  },
  actionCards: {
    enterBooth: {
      title: "Entrar no booth",
      description: "Diga sua previsão ao locutor do estádio.",
      cta: "Iniciar sessão de voz",
    },
    thePitch: {
      title: "O Campo",
      description: "Gols, clipes e pulso do jogo ao vivo.",
      cta: "Abrir feed ao vivo",
    },
    walletRequired: "Conecte sua wallet para entrar no booth de voz.",
    settlement: "Liquidado na Solana com",
    settlementProvider: "prova TxLINE",
    needWallet: "Precisa de uma wallet?",
    setupProfile: "Configure no Perfil",
  },
  match: {
    market: "Mercado",
    crowd: "Torcida",
    vs: "vs",
    isLiveNow: "está ao vivo",
    openLive: "Ver ao vivo",
    nextUp: "Próximo",
    txlineMarket: "Mercado TxLINE",
    marketHint: "O que as casas de apostas pensam",
    crowdLabel: "Torcida Goalaxify",
    crowdHint: "Onde os fãs estão colocando dinheiro",
    boothOpen: "Booth de voz aberto",
    talkYourBet: "Diga sua aposta",
    oddsHelp:
      "Escolha quem vence, empate ou visitante — em probabilidades simples, sem jargão.",
    oddsShifting: "Odds em movimento",
    oddsShiftOn: "em",
  },
  booth: {
    eyebrow: "Booth de previsão",
    title: "Diga sua aposta",
    description:
      "Escolha um jogo próximo e diga ao locutor seu mercado, seleção e stake.",
    loading: "Carregando jogos para o booth…",
    voiceTitle: "Booth de voz",
    manageHint:
      "Fale com o locutor para cancelar com reembolso total ou substituir sua aposta. Phantom só abre se houver um novo stake para assinar.",
    stakeHint:
      "Diga sua previsão ao locutor do estádio. Confirme por voz — ao concordar, o app aposta automaticamente (Phantom abre para assinar).",
    status: {
      ready: "Pronto",
      connecting: "Conectando…",
      live: "Ao vivo",
      ended: "Sessão encerrada",
      unavailable: "Indisponível",
      signing: "Assinando…",
      refunding: "Reembolsando…",
      processing: "Processando…",
    },
    refundingMessage: "Reembolsando seu stake anterior do pote…",
    signingMessage: "Aprove no Phantom para assinar seu stake…",
    done: "Concluído",
    manageByVoice: "Gerenciar aposta por voz",
    startSession: "Iniciar sessão de voz",
    mute: "Ativar microfone",
    unmute: "Silenciar",
    endSession: "Encerrar sessão",
    newSession: "Nova sessão",
    linkedWallet: "Wallet vinculada:",
    callId: "ID da chamada:",
    viewLiveMoments: "Ver momentos ao vivo",
  },
  bets: {
    yourPick: "Sua escolha",
    stake: "Stake",
    potentialWin: "Ganho potencial",
    resultPayout: "Pagamento do resultado",
    refundedStake: "Stake reembolsado",
    claimWinnings: "Resgatar ganhos",
    claiming: "Resgatando…",
    manageByVoice: "Gerenciar por voz",
    matchLocked: "Jogo iniciado — alterações bloqueadas",
    status: {
      open: { label: "Aberta", description: "Toque para gerenciar por voz antes do apito" },
      locked: { label: "Em jogo", description: "Jogo iniciado — aguardando resultado" },
      won: { label: "Ganhou", description: "Resgate seus ganhos" },
      lost: { label: "Perdeu", description: "Mais sorte na próxima" },
      settled: { label: "Liquidada", description: "Ganhos resgatados on-chain" },
      cancelled: { label: "Cancelada", description: "Stake reembolsado antes do apito" },
      replaced: { label: "Substituída", description: "Substituída por uma aposta mais recente" },
    },
  },
  live: {
    eyebrow: "Pulso ao vivo",
    title: "O Campo",
    description:
      "Gols, intervalos e ritmo do jogo quando há uma partida da Copa do Mundo em andamento.",
    loading: "Verificando jogos ao vivo…",
    unavailableTitle: "Feed ao vivo indisponível",
    unavailableDescription:
      "Precisamos de dados ativos do TxLINE antes de abrir o campo ao vivo.",
    noMatchTitle: "Nenhum jogo em andamento agora",
    noMatchDescription:
      "O feed ao vivo abre automaticamente quando uma partida da Copa do Mundo começa. Você ainda pode prever na página inicial.",
    browseMatches: "Ver jogos próximos",
  },
  profiles: {
    eyebrow: "Identidade",
    title: "Perfil",
    description: "Gerencie sua identidade, wallet e apostas on-chain em um só lugar.",
    connectTitle: "Conecte para ver seu perfil",
    connectDescription:
      "Seu endereço de wallet, nome de usuário, avatar, saldo e histórico de apostas aparecem aqui ao conectar.",
    disconnectedDescription:
      "Conecte sua wallet para gerenciar seu perfil, wallet e apostas.",
    tabs: {
      details: "Detalhes",
      wallet: "Wallet",
      bets: "Apostas",
    },
  },
  leaderboard: {
    eyebrow: "Comunidade",
    title: "Ranking",
    description:
      "Melhores palpiteiros classificados por ganhos on-chain. Defina um nome de usuário no Perfil para aparecer.",
    topWinners: "Top vencedores",
    loading: "Carregando ranking…",
    empty: "Ainda não há vencedores. Seja o primeiro a apostar e resgatar uma previsão vencedora.",
    recentWins: "Vitórias recentes",
    loadingRecent: "Carregando vitórias recentes…",
    emptyRecent: "Previsões vencedoras aparecerão aqui após a liquidação.",
    totalWon: "Total ganho",
    wins: "{{count}} vitória",
    winsPlural: "{{count}} vitórias",
    rank1: "1.º",
    rank2: "2.º",
    rank3: "3.º",
    rankNth: "{{rank}}.º",
  },
  wallet: {
    connect: "Conectar wallet",
    reconnecting: "Reconectando…",
    restoring: "Restaurando sua sessão de wallet…",
    gateTitle: "Conecte sua wallet",
    gateDescription:
      "Vincule o Phantom para apostar, entrar no booth de voz e receber provas de liquidação.",
  },
  common: {
    loading: "Carregando…",
  },
  settings: {
    title: "Definições",
    subtitle: "Gerencie suas preferências e conta",
    preferences: {
      title: "Preferências",
      language: "Idioma",
      change: "Alterar",
    },
    about: {
      title: "Sobre",
      version: "Versão 1.0.0",
      tagline: "Diga sua aposta. Previsões por voz com liquidação verificada.",
    },
    privacy: "Política de Privacidade",
    terms: "Termos de Serviço",
    support: "Suporte",
  },
  language: {
    selectTitle: "Selecionar idioma",
    selectDescription:
      "Escolha seu idioma preferido. Aplica-se à interface do app e ao booth de voz.",
  },
};

export default locale;
