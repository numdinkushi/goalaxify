const locale = {
  nav: {
    home: "الرئيسية",
    booth: "Booth",
    live: "مباشر",
    profiles: "الملف الشخصي",
    leaderboard: "لوحة المتصدرين",
    settings: "الإعدادات",
  },
  hero: {
    worldCup: "كأس العالم 2026",
    tagline: "قل رهانك.",
    description:
      "توقعات صوتية، لحظات أهداف مباشرة، وتسوية موثّقة — لعشاق يريدون أن يشعروا بالمباراة.",
  },
  home: {
    predictMatch: "توقع مباراة",
    loadingFixtures: "جارٍ تحميل مباريات ونسب كأس العالم…",
    noMatchDataTitle: "لا توجد بيانات مباريات حالياً",
    noMatchDataDescription:
      "مباريات ونسب كأس العالم المباشرة غير متاحة من TxLINE حالياً. لن نعرض بيانات وهمية — عد قريباً.",
    txlineNotConnectedTitle: "TxLINE غير متصل",
    txlineNotConnectedDescription:
      "أضف بيانات اعتماد TxLINE وشغّل الإعداد لتحميل المباريات والنسب المباشرة.",
  },
  actionCards: {
    enterBooth: {
      title: "ادخل الـ Booth",
      description: "قل توقعك لمذيع الملعب.",
      cta: "بدء جلسة صوتية",
    },
    thePitch: {
      title: "الملعب",
      description: "لحظات الأهداف، المقاطع، ونبض المباراة المباشر.",
      cta: "فتح البث المباشر",
    },
    walletRequired: "اربط محفظتك للدخول إلى الـ Booth الصوتي.",
    settlement: "تسوية على Solana مع",
    settlementProvider: "إثبات TxLINE",
    needWallet: "تحتاج محفظة؟",
    setupProfile: "أعدّها في الملف الشخصي",
  },
  match: {
    market: "السوق",
    crowd: "الجمهور",
    vs: "vs",
    isLiveNow: "مباشر الآن",
    openLive: "فتح البث المباشر",
    nextUp: "التالي",
    txlineMarket: "سوق TxLINE",
    marketHint: "ما يعتقده وكلاء المراهنات",
    crowdLabel: "جمهور Goalaxify",
    crowdHint: "أين يضع المعجبون أموالهم",
    boothOpen: "الـ Booth الصوتي مفتوح",
    boothClosed: "الرهان مغلق — المباراة جارية",
    manageYourBet: "إدارة رهانك",
    betPlacedInPlay: "رهانك مقفل حتى نهاية المباراة",
    talkYourBet: "قل رهانك",
    oddsHelp:
      "اختر الفائز، التعادل، أو الضيف — باحتمالات بسيطة، دون مصطلحات مراهنة.",
    oddsShifting: "النسب تتغير",
    oddsShiftOn: "على",
  },
  booth: {
    eyebrow: "Booth التوقعات",
    title: "قل رهانك",
    description:
      "اختر أي مباراة قادمة، ثم أخبر المذيع بالسوق والاختيار والرهان.",
    loading: "جارٍ تحميل المباريات للـ Booth…",
    voiceTitle: "Booth صوتي",
    manageHint:
      "تحدث مع المذيع للإلغاء مع استرداد كامل أو استبدال رهانك. يفتح Phantom فقط عند الحاجة لتوقيع رهان جديد.",
    stakeHint:
      "قل توقعك لمذيع الملعب. أكّد بالصوت — بمجرد الموافقة، يراهن التطبيق تلقائياً (يفتح Phantom للتوقيع).",
    lockedTitle: "Booth مغلق",
    lockedDescription:
      "بدأت المباراة. الرهانات مقفلة حتى النهاية — لا رهانات جديدة ولا تغييرات.",
    status: {
      ready: "جاهز",
      connecting: "جارٍ الاتصال…",
      live: "مباشر",
      ended: "انتهت الجلسة",
      unavailable: "غير متاح",
      signing: "جارٍ التوقيع…",
      refunding: "جارٍ الاسترداد…",
      processing: "جارٍ المعالجة…",
    },
    refundingMessage: "جارٍ استرداد رهانك السابق من الصندوق…",
    signingMessage: "وافق في Phantom لتوقيع رهانك…",
    done: "تم",
    manageByVoice: "إدارة الرهان بالصوت",
    startSession: "بدء جلسة صوتية",
    mute: "كتم",
    unmute: "إلغاء الكتم",
    endSession: "إنهاء الجلسة",
    newSession: "جلسة جديدة",
    linkedWallet: "المحفظة المرتبطة:",
    callId: "معرّف المكالمة:",
    viewLiveMoments: "عرض اللحظات المباشرة",
  },
  bets: {
    yourPick: "اختيارك",
    stake: "الرهان",
    potentialWin: "الربح المحتمل",
    resultPayout: "دفع النتيجة",
    refundedStake: "الرهان المسترد",
    claimWinnings: "المطالبة بالأرباح",
    claiming: "جارٍ المطالبة…",
    manageByVoice: "إدارة بالصوت",
    matchLocked: "بدأت المباراة — التغييرات مقفلة",
    status: {
      open: { label: "مفتوح", description: "اضغط للإدارة بالصوت قبل البداية" },
      locked: { label: "جارية", description: "بدأت المباراة — في انتظار النتيجة" },
      won: { label: "فوز", description: "اطلب أرباحك" },
      lost: { label: "خسارة", description: "حظاً أوفر في المرة القادمة" },
      settled: { label: "مسوّى", description: "تمت المطالبة بالأرباح على السلسلة" },
      cancelled: { label: "ملغى", description: "استرداد كامل قبل البداية" },
      replaced: { label: "مستبدل", description: "استُبدل برهان أحدث على هذه المباراة" },
    },
  },
  live: {
    eyebrow: "نبض مباشر",
    title: "الملعب",
    description:
      "لحظات الأهداف، الاستراحة، وإيقاع المباراة عندما تكون مباراة كأس العالم جارية.",
    loading: "جارٍ البحث عن مباريات مباشرة…",
    unavailableTitle: "البث المباشر غير متاح",
    unavailableDescription:
      "نحتاج بيانات TxLINE نشطة قبل فتح الملعب المباشر.",
    noMatchTitle: "لا توجد مباراة جارية الآن",
    noMatchDescription:
      "يفتح البث المباشر تلقائياً عند انطلاق مباراة كأس العالم. يمكنك التوقع من الصفحة الرئيسية.",
    browseMatches: "تصفح المباريات القادمة",
  },
  profiles: {
    eyebrow: "الهوية",
    title: "الملف الشخصي",
    description: "أدر هويتك ومحفظتك ورهاناتك على السلسلة في مكان واحد.",
    connectTitle: "اتصل لعرض ملفك الشخصي",
    connectDescription:
      "عنوان محفظتك واسم المستخدم والصورة الرمزية والرصيد وسجل الرهانات يظهر هنا بعد الاتصال.",
    disconnectedDescription:
      "اربط محفظتك لإدارة ملفك الشخصي ومحفظتك ورهاناتك.",
    tabs: {
      details: "التفاصيل",
      wallet: "المحفظة",
      bets: "الرهانات",
    },
  },
  leaderboard: {
    eyebrow: "المجتمع",
    title: "لوحة المتصدرين",
    description:
      "أفضل المتوقعين حسب الأرباح على السلسلة. عيّن اسم مستخدم في الملف الشخصي للظهور بالاسم.",
    topWinners: "أفضل الفائزين",
    loading: "جارٍ تحميل لوحة المتصدرين…",
    empty: "لا فائزين بعد. كن الأول الذي يراهن ويطالب بتوقع فائز.",
    recentWins: "انتصارات حديثة",
    loadingRecent: "جارٍ تحميل الانتصارات الحديثة…",
    emptyRecent: "ستظهر التوقعات الفائزة هنا بعد التسوية.",
    totalWon: "إجمالي الفوز",
    wins: "{{count}} فوز",
    winsPlural: "{{count}} انتصارات",
    rank1: "الأول",
    rank2: "الثاني",
    rank3: "الثالث",
    rankNth: "المركز {{rank}}",
  },
  wallet: {
    connect: "ربط المحفظة",
    reconnecting: "جارٍ إعادة الاتصال…",
    restoring: "جارٍ استعادة جلسة المحفظة…",
    gateTitle: "اربط محفظتك",
    gateDescription:
      "اربط Phantom للتوقع والدخول إلى الـ Booth الصوتي واستلام إثباتات التسوية.",
  },
  common: {
    loading: "جارٍ التحميل…",
  },
  settings: {
    title: "الإعدادات",
    subtitle: "إدارة تفضيلاتك وحسابك",
    preferences: {
      title: "التفضيلات",
      language: "اللغة",
      change: "تغيير",
    },
    about: {
      title: "حول",
      version: "الإصدار 1.0.0",
      tagline: "قل رهانك. توقعات صوتية مع تسوية موثّقة.",
    },
    privacy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
    support: "الدعم",
  },
  language: {
    selectTitle: "اختر اللغة",
    selectDescription:
      "اختر لغتك المفضلة. تنطبق على واجهة التطبيق والـ Booth الصوتي.",
  },
};

export default locale;
