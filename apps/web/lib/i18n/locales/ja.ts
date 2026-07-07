const locale = {
  nav: {
    home: "ホーム",
    booth: "ブース",
    live: "ライブ",
    profiles: "プロフィール",
    leaderboard: "ランキング",
    settings: "設定",
  },
  hero: {
    worldCup: "ワールドカップ 2026",
    tagline: "声でベット。",
    description:
      "音声予想、ライブゴール、検証済み決済 — 試合をもっと生き生きと感じたいファンのために。",
  },
  home: {
    predictMatch: "試合を予想",
    loadingFixtures: "ワールドカップの試合とオッズを読み込み中…",
    noMatchDataTitle: "現在試合データがありません",
    noMatchDataDescription:
      "TxLINEからライブの試合・オッズを取得できません。プレースホルダーは表示しません — しばらくしてから再度お試しください。",
    txlineNotConnectedTitle: "TxLINEが接続されていません",
    txlineNotConnectedDescription:
      "TxLINE認証情報を追加しセットアップを実行して、ライブ試合とオッズを読み込んでください。",
  },
  actionCards: {
    enterBooth: {
      title: "ブースに入る",
      description: "スタジアムアナウンサーに予想を話してください。",
      cta: "音声セッションを開始",
    },
    thePitch: {
      title: "ピッチ",
      description: "ゴール、クリップ、ライブ試合の鼓動。",
      cta: "ライブフィードを開く",
    },
    walletRequired: "音声ブースに入るにはウォレットを接続してください。",
    settlement: "Solanaで決済",
    settlementProvider: "TxLINE証明",
    needWallet: "ウォレットが必要ですか？",
    setupProfile: "プロフィールで設定",
  },
  match: {
    market: "マーケット",
    crowd: "クラウド",
    vs: "vs",
    isLiveNow: "ライブ中",
    openLive: "ライブを見る",
    nextUp: "次の試合",
    txlineMarket: "TxLINEマーケット",
    marketHint: "ブックメーカーの見方",
    crowdLabel: "Goalaxifyクラウド",
    crowdHint: "ファンの資金の流れ",
    boothOpen: "音声ブース開放中",
    talkYourBet: "声でベット",
    oddsHelp:
      "勝ち・引き分け・敗北をシンプルな確率で表示 — ベット用語は使いません。",
    oddsShifting: "オッズ変動中",
    oddsShiftOn: "対",
  },
  booth: {
    eyebrow: "予想ブース",
    title: "声でベット",
    description:
      "次の試合を選び、マーケット・選択・ステークをアナウンサーに話してください。",
    loading: "ブース用の試合を読み込み中…",
    voiceTitle: "音声ブース",
    manageHint:
      "アナウンサーにキャンセル（全額返金）またはベット変更を話してください。新しいステークの署名時のみPhantomが開きます。",
    stakeHint:
      "スタジアムアナウンサーに予想を話してください。音声で確認すると自動的にステークされます（Phantomで署名）。",
    status: {
      ready: "準備完了",
      connecting: "接続中…",
      live: "ライブ",
      ended: "セッション終了",
      unavailable: "利用不可",
      signing: "署名中…",
      refunding: "返金中…",
      processing: "処理中…",
    },
    refundingMessage: "プールから前のステークを返金中…",
    signingMessage: "Phantomでステークに署名してください…",
    done: "完了",
    manageByVoice: "音声でベット管理",
    startSession: "音声セッション開始",
    mute: "ミュート",
    unmute: "ミュート解除",
    endSession: "セッション終了",
    newSession: "新しいセッション",
    linkedWallet: "接続ウォレット:",
    callId: "通話ID:",
    viewLiveMoments: "ライブモーメントを見る",
  },
  bets: {
    yourPick: "あなたの予想",
    stake: "ステーク",
    potentialWin: "予想払戻",
    resultPayout: "結果払戻",
    refundedStake: "返金ステーク",
    claimWinnings: "勝利金を請求",
    claiming: "請求中…",
    manageByVoice: "音声で管理",
    matchLocked: "試合開始 — 変更不可",
    status: {
      open: { label: "オープン", description: "キックオフ前に音声で管理" },
      locked: { label: "試合中", description: "試合開始 — 結果待ち" },
      won: { label: "勝利", description: "勝利金を請求" },
      lost: { label: "敗北", description: "次の試合に期待" },
      settled: { label: "決済済", description: "オンチェーンで請求済" },
      cancelled: { label: "キャンセル", description: "キックオフ前に全額返金" },
      replaced: { label: "変更済", description: "新しいベットに置き換え" },
    },
  },
  live: {
    eyebrow: "ライブパルス",
    title: "ピッチ",
    description:
      "ワールドカップ試合中のゴール、ハーフタイム、試合のリズム。",
    loading: "ライブ試合を確認中…",
    unavailableTitle: "ライブフィード利用不可",
    unavailableDescription:
      "ライブピッチを開くにはTxLINEの試合データが必要です。",
    noMatchTitle: "現在進行中の試合はありません",
    noMatchDescription:
      "ワールドカップ試合が始まるとライブフィードが自動で開きます。ホームから予想できます。",
    browseMatches: "今後の試合を見る",
  },
  profiles: {
    eyebrow: "アイデンティティ",
    title: "プロフィール",
    description: "アイデンティティ、ウォレット、オンチェーンのベットを一括管理。",
    connectTitle: "プロフィールを見るには接続",
    connectDescription:
      "接続後、ウォレット、ユーザー名、アバター、残高、ベット履歴がここに表示されます。",
    disconnectedDescription:
      "プロフィール、ウォレット、ベットを管理するにはウォレットを接続してください。",
    tabs: {
      details: "詳細",
      wallet: "ウォレット",
      bets: "ベット",
    },
  },
  leaderboard: {
    eyebrow: "コミュニティ",
    title: "ランキング",
    description:
      "オンチェーン勝利金でランク付け。プロフィールでユーザー名を設定すると表示名になります。",
    topWinners: "トップ勝者",
    loading: "ランキングを読み込み中…",
    empty: "まだ勝者はいません。最初にステークして勝利予想を請求しましょう。",
    recentWins: "最近の勝利",
    loadingRecent: "最近の勝利を読み込み中…",
    emptyRecent: "決済後、勝利予想がここに表示されます。",
    totalWon: "合計獲得",
    wins: "{{count}}勝",
    winsPlural: "{{count}}勝",
    rank1: "1位",
    rank2: "2位",
    rank3: "3位",
    rankNth: "{{rank}}位",
  },
  wallet: {
    connect: "ウォレット接続",
    reconnecting: "再接続中…",
    restoring: "ウォレットセッションを復元中…",
    gateTitle: "ウォレットを接続",
    gateDescription:
      "Phantomをリンクして予想、音声ブース、決済証明を利用してください。",
  },
  common: {
    loading: "読み込み中…",
  },
  settings: {
    title: "設定",
    subtitle: "設定とアカウントを管理",
    preferences: {
      title: "環境設定",
      language: "言語",
      change: "変更",
    },
    about: {
      title: "について",
      version: "バージョン 1.0.0",
      tagline: "声でベット。検証済み決済の音声予想。",
    },
    privacy: "プライバシーポリシー",
    terms: "利用規約",
    support: "サポート",
  },
  language: {
    selectTitle: "言語を選択",
    selectDescription:
      "希望の言語を選択してください。アプリのUIと音声ブースの両方に適用されます。",
  },
};

export default locale;
