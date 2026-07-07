const locale = {
  nav: {
    home: "Home",
    booth: "Booth",
    live: "Live",
    profiles: "Profile",
    leaderboard: "Leaderboard",
    settings: "Settings",
  },
  hero: {
    worldCup: "World Cup 2026",
    tagline: "Talk your bet.",
    description:
      "Voice predictions, live goal moments, and verified settlement — built for fans who want the match to feel alive.",
  },
  home: {
    predictMatch: "Predict a match",
    loadingFixtures: "Loading World Cup fixtures and odds…",
    noMatchDataTitle: "No match data right now",
    noMatchDataDescription:
      "Live World Cup fixtures and odds aren't available from TxLINE at the moment. We won't show placeholder data — check back shortly.",
    txlineNotConnectedTitle: "TxLINE is not connected",
    txlineNotConnectedDescription:
      "Add your TxLINE credentials and run setup to load live fixtures and odds. Until then, nothing is shown here.",
  },
  actionCards: {
    enterBooth: {
      title: "Enter Booth",
      description: "Talk your prediction with the stadium announcer.",
      cta: "Start voice session",
    },
    thePitch: {
      title: "The Pitch",
      description: "Goal moments, clips, and live match pulse.",
      cta: "Open live feed",
    },
    walletRequired: "Connect your wallet to enter the voice booth.",
    settlement: "Settled on Solana with",
    settlementProvider: "TxLINE proof",
    needWallet: "Need a wallet?",
    setupProfile: "Set up in Profile",
  },
  match: {
    market: "Market",
    crowd: "Crowd",
    vs: "vs",
    isLiveNow: "is live now",
    openLive: "Open live",
    nextUp: "Next up",
    txlineMarket: "TxLINE market",
    marketHint: "What bookmakers think",
    crowdLabel: "Goalaxify crowd",
    crowdHint: "Where fans are putting money",
    boothOpen: "Voice booth open",
    boothClosed: "Betting closed — match in play",
    talkYourBet: "Talk your bet",
    manageYourBet: "Manage your bet",
    betPlacedInPlay: "Your bet is locked until full time",
    oddsHelp:
      "Pick who wins, if it's a draw, or who takes it away — shown as simple chances, not betting jargon.",
    oddsShifting: "Odds shifting",
    oddsShiftOn: "on",
  },
  booth: {
    eyebrow: "Prediction booth",
    title: "Talk your bet",
    description:
      "Pick any upcoming match, then speak your market, selection, and stake to the stadium announcer.",
    loading: "Loading matches for the booth…",
    voiceTitle: "Voice booth",
    manageHint:
      "Talk to the announcer to cancel for a full refund or replace your bet. Voice confirmation replaces the review step — Phantom opens only when a new stake needs signing.",
    stakeHint:
      "Talk your prediction to the stadium announcer. Confirm by voice — once you agree, the app stakes automatically (Phantom opens to sign).",
    lockedTitle: "Booth closed",
    lockedDescription:
      "This match has kicked off. Bets are locked until full time — no new stakes or changes.",
    status: {
      ready: "Ready",
      connecting: "Connecting…",
      live: "Live",
      ended: "Session ended",
      unavailable: "Unavailable",
      signing: "Signing…",
      refunding: "Refunding…",
      processing: "Processing…",
    },
    refundingMessage: "Refunding your previous stake from the pot…",
    signingMessage: "Approve in Phantom to sign your stake…",
    done: "Done",
    manageByVoice: "Manage bet by voice",
    startSession: "Start voice session",
    mute: "Mute",
    unmute: "Unmute",
    endSession: "End session",
    newSession: "New session",
    linkedWallet: "Linked wallet:",
    callId: "Call ID:",
    viewLiveMoments: "View live moments",
  },
  bets: {
    yourPick: "Your pick",
    stake: "Stake",
    potentialWin: "Potential win",
    resultPayout: "Result payout",
    refundedStake: "Refunded stake",
    claimWinnings: "Claim winnings",
    claiming: "Claiming…",
    manageByVoice: "Manage by voice",
    matchLocked: "Match started — changes locked",
    status: {
      open: { label: "Open", description: "Tap to manage by voice before kickoff" },
      locked: { label: "In play", description: "Match started — awaiting result" },
      won: { label: "Won", description: "Claim your winnings" },
      lost: { label: "Lost", description: "Better luck on the next one" },
      settled: { label: "Settled", description: "Winnings claimed on-chain" },
      cancelled: { label: "Cancelled", description: "Full stake refunded before kickoff" },
      replaced: { label: "Replaced", description: "Superseded by a newer bet on this match" },
    },
  },
  live: {
    eyebrow: "Live pulse",
    title: "The Pitch",
    description:
      "Goal moments, halftime checks, and match rhythm when a World Cup match is in play.",
    loading: "Checking for live matches…",
    unavailableTitle: "Live feed unavailable",
    unavailableDescription:
      "We need active TxLINE fixture data before the live pitch can open. Check back when matches are scheduled or in play.",
    noMatchTitle: "No match in play right now",
    noMatchDescription:
      "The live feed opens automatically when a World Cup fixture kicks off. You can still predict on upcoming matches from home.",
    browseMatches: "Browse upcoming matches",
  },
  profiles: {
    eyebrow: "Identity",
    title: "Profile",
    description: "Manage your identity, wallet, and on-chain bets in one place.",
    connectTitle: "Connect to view your profile",
    connectDescription:
      "Your wallet address, username, avatar, balance, and bet history live here once you connect.",
    disconnectedDescription:
      "Connect your wallet to manage your profile, wallet, and bets.",
    tabs: {
      details: "Details",
      wallet: "Wallet",
      bets: "Bets",
    },
  },
  leaderboard: {
    eyebrow: "Community",
    title: "Leaderboard",
    description:
      "Top predictors ranked by on-chain winnings. Set a username in Profile to appear by name.",
    topWinners: "Top winners",
    loading: "Loading leaderboard…",
    empty: "No winners yet. Be the first to stake and claim a winning prediction.",
    recentWins: "Recent wins",
    loadingRecent: "Loading recent wins…",
    emptyRecent: "Winning predictions will show up here after settlement.",
    totalWon: "Total won",
    wins: "{{count}} win",
    winsPlural: "{{count}} wins",
    rank1: "1st",
    rank2: "2nd",
    rank3: "3rd",
    rankNth: "{{rank}}th",
  },
  wallet: {
    connect: "Connect wallet",
    reconnecting: "Reconnecting…",
    restoring: "Restoring your wallet session…",
    gateTitle: "Connect your wallet",
    gateDescription:
      "Link your Phantom wallet to place predictions, enter the voice booth, and receive settlement proofs.",
  },
  common: {
    loading: "Loading…",
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your preferences and account",
    preferences: {
      title: "Preferences",
      language: "Language",
      change: "Change",
    },
    about: {
      title: "About",
      version: "Version 1.0.0",
      tagline: "Talk your bet. Voice predictions with verified settlement.",
    },
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    support: "Support",
  },
  language: {
    selectTitle: "Select language",
    selectDescription:
      "Choose your preferred language. Applies to the app UI and voice booth.",
  },
};

export default locale;
