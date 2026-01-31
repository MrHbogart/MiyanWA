export const navigationCopy = {
  miyan: [{ name: 'MiyanLanding', path: '', label: { fa: 'خانه', en: 'Home' } }],
  miyanBeresht: [
    { name: 'MiyanBereshtLanding', path: 'beresht', label: { fa: 'خانه برشت', en: 'Beresht Home' } },
    { name: 'MiyanBereshtBaseMenu', path: 'beresht/menu', label: { fa: 'منو', en: 'Menu' } },
    { name: 'MiyanBereshtDailyMenu', path: 'beresht/daily-menu', label: { fa: 'پخت روز', en: "Today's Bake" } },
  ],
  miyanMadi: [
    { name: 'MiyanMadiLanding', path: 'madi', label: { fa: 'خانه مادی', en: 'Madi Home' } },
    { name: 'MiyanMadiBaseMenu', path: 'madi/menu', label: { fa: 'منو', en: 'Menu' } },
    { name: 'MiyanMadiDailyMenu', path: 'madi/daily-menu', label: { fa: 'پخت روز', en: "Today's Bake" } },
  ],
}

export const miyanLandingCopy = {
  hero: {
    overline: { fa: 'گروه میان', en: 'Miyan Group' },
    title: { fa: 'میانِ کار و زندگی', en: 'Between Work and Life' },
    body: {
      fa: 'میان یک برنامه منسجم را در دو کافه پیش می‌برد\n قهوه تازه‌رُست، پخت روزانه و ارائه حرفه‌ای',
      en: 'At Miyan, a single, focused program runs across two cafés: freshly roasted coffee, daily bakes, and professional service',
    },
  },
  heroMeta: [
    {
      label: { fa: 'تخصص‌های ما', en: 'Our disciplines' },
      value: {
        fa: 'رُست قهوه · پخت کیک و نان · سرویس و پذیرایی',
        en: 'Coffee roasting · Baking · Service',
      },
    },
    { label: { fa: 'شروع داستان ما', en: 'Since' }, value: { fa: '۱۴۰۲', en: '2024' } },
  ],
  branches: {
    overline: { fa: 'کافه‌های میان', en: 'Miyan cafés' },
    title: { fa: 'دو فضا\n دو حال‌وهوا', en: 'Two spaces\n two moods' },
    body: {
      fa: 'هر شعبه هویت خودش را دارد، کیفیت یکسان است و تجربه متفاوت',
      en: 'Each location has its own identity; quality remains constant while the experience changes',
    },
    cards: [
      {
        name: { fa: 'میان برشت', en: 'Miyan Beresht' },
        area: { fa: 'اصفهان · شیخ صدوق جنوبی', en: 'Isfahan · South Sheikh Sadoogh' },
        copy: {
          fa: 'محیطی حرفه‌ای با تمرکز روی قهوه و سرویس',
          en: 'A professional space focused on coffee and service',
        },
        cta: { fa: 'خانه برشت', en: 'Visit Beresht' },
        path: 'beresht',
      },
      {
        name: { fa: 'میان مادی', en: 'Miyan Madi' },
        area: { fa: 'اصفهان · چهارباغ عباسی · مادی نیاصرم', en: 'Isfahan · Chahar Bagh Abbasi · Madi Niyasarm' },
        copy: {
          fa: 'کافه‌ای گرم و صمیمی برای لحظه‌های آرام',
          en: 'A small, warm café designed for calm, unhurried moments',
        },
        cta: { fa: 'خانه مادی', en: 'Visit Madi' },
        path: 'madi',
      },
    ],
  },
  modal: {
    overline: { fa: 'رستری میان', en: 'Miyan roastery' },
    title: { fa: 'مسیر تخصصی از دانه سبز تا فنجان', en: 'A specialist path from green bean to cup' },
    body: {
      fa: 'در رستری میان، تأمین دانه سبز، طراحی پروفایل رُست و نظارت بر کیفیت به‌صورت تخصصی انجام می‌شود',
      en: 'At Miyan roastery, green sourcing, roast profile design, and quality control are handled with precision',
    },
    accent: { fa: 'رُست روزانه · کنترل پروفایل', en: 'Daily roasting · Profile control' },
  },
  modalFocus: [
    {
      title: { fa: 'تأمین', en: 'Sourcing' },
      copy: {
        fa: 'انتخاب مستقیم دانه‌های قابل رهگیری برای تضمین کیفیت',
        en: 'Direct selection of traceable beans to guarantee quality',
      },
    },
    {
      title: { fa: 'سرویس', en: 'Service' },
      copy: {
        fa: 'تمام تیم میان با دقت و استاندارد مشترک کار می‌کنند',
        en: 'The entire Miyan team works with shared standards and care',
      },
    },
  ],
  photoStories: [
    {
      imageKey: 'miyanImg2',
      overline: { fa: 'صبح', en: 'Morning' },
      title: { fa: 'رُست تازه', en: 'Fresh roast' },
      copy: {
        fa: 'قهوه تازه‌رُست به‌طور مداوم برای عصاره‌گیری بهتر بررسی می‌شود',
        en: 'Freshly roasted coffee is constantly evaluated for better extraction',
      },
    },
    {
      imageKey: 'miyanImg1',
      overline: { fa: 'سرویس', en: 'Service' },
      title: { fa: 'کیفیت سرویس و آرامش فضا', en: 'Service quality and calm atmosphere' },
      copy: {
        fa: 'سرویس حرفه‌ای در فضایی متعادل و بدون شلوغی',
        en: 'Professional service in a balanced, uncluttered setting',
      },
    },
  ],
}

export const miyanBereshtLandingCopy = {
  hero: {
    overline: { fa: 'میان برشت', en: 'Miyan Beresht' },
    title: { fa: 'مجموعه‌ای منظم و هماهنگ', en: 'A composed and coordinated space' },
    body: {
      fa: 'میان برشت، قلب رستری میان\n تمرکز بر قهوه، سرویس و دقت در اجرا',
      en: 'Miyan Beresht is the heart of our roastery\n centered on coffee, service, and precision',
    },
  },
  experience: {
    title: { fa: 'سالن آرام و مدرن', en: 'A calm, modern room' },
    paragraphs: [
      {
        fa: 'فضا جمع‌وجور و منظم است و تمرکز روی قهوه و سرویس می‌ماند',
        en: 'The space stays compact and orderly, keeping the focus on coffee and service',
      },
      {
        fa: 'همه‌چیز ساده پیش می‌رود تا توجه روی خود تجربه قهوه باشد',
        en: 'Things stay simple so the focus remains on the coffee experience itself',
      },
    ],
  },
  photoStories: [
    {
      imageKey: 'bereshtImg1',
      overline: { fa: 'رُست', en: 'Roast' },
      title: { fa: 'فرآیند رُست', en: 'The roast process' },
      copy: {
        fa: 'رُست قهوه به‌صورت پیوسته انجام می‌شود تا کیفیت هر فنجان کنترل شود',
        en: 'Roasting is done continuously to keep the quality of each cup consistent',
      },
    },
    {
      imageKey: 'bereshtImg2',
      overline: { fa: 'سرویس', en: 'Service' },
      title: { fa: 'نقطه سرو', en: 'The service point' },
      copy: {
        fa: 'قهوه و شیرینی با دقت آماده و هم‌زمان سرو می‌شوند',
        en: 'Coffee and pastry are prepared carefully and served together',
      },
    },
    {
      imageKey: 'bereshtImg3',
      overline: { fa: 'عطر', en: 'Aroma' },
      title: { fa: 'عطر قهوه', en: 'Coffee aroma' },
      copy: {
        fa: 'بوی قهوه تازه بخشی از تجربه حضور در فضاست',
        en: 'The aroma of fresh coffee is part of being in the space',
      },
    },
    {
      imageKey: 'bereshtImg4',
      overline: { fa: 'جفت‌سازی', en: 'Pairing' },
      title: { fa: 'در کنار قهوه', en: 'Along with coffee' },
      copy: {
        fa: 'دسرها در کنار قهوه سرو می‌شوند، بدون پیچیدگی اضافی',
        en: 'Desserts are served alongside the coffee, without extra complexity',
      },
    },
  ],
  location: {
    overline: { fa: 'آدرس و مسیر', en: 'Address & route' },
    title: { fa: 'میان برشت · اصفهان', en: 'Miyan Beresht · Isfahan' },
    addressLines: {
      fa: ['اصفهان، خیابان شیخ صدوق جنوبی', 'کافه میان برشت'],
      en: ['Isfahan, South Sheikh Sadoogh Avenue', 'Miyan Beresht Café'],
    },
    hours: { fa: 'هر روز ۰۷:۳۰ تا ۲۲:۳۰', en: 'Daily 07:30 to 22:30' },
    phone: { fa: '۰۳۱ ۶۶۶ ۸۸ ۹۹', en: '+98 31 666 88 99' },
    coordinates: { fa: '۳۲٫۶۱۷۷۳۷ شمالی · ۵۱٫۶۷۰۳۳۲ شرقی', en: '32.617737 N · 51.670332 E' },
    mapCenter: { lat: 32.617737, lng: 51.670332 },
    mapZoom: 16,
    mapLabel: { fa: 'اصفهان', en: 'Isfahan' },
    cta: { fa: 'مشاهده مسیر', en: 'View route' },
  },
}

export const miyanMadiLandingCopy = {
  hero: {
    overline: { fa: 'میان مادی', en: 'Miyan Madi' },
    title: { fa: 'کافه‌ای دنج و آرام', en: 'A cozy café in Isfahan' },
    body: {
      fa: 'مادی، کافه کوچک و گرم میان\n قهوه روزانه و گفت‌وگوهای آرام',
      en: 'Madi is Miyan’s small, warm café\n with daily coffee and unhurried conversation',
    },
  },
  atmosphere: {
    title: { fa: 'حال‌وهوای چهارباغ', en: 'The feel of Chahar Bagh' },
    paragraphs: [
      {
        fa: 'فضا برای نشستن و وقت گذراندن، راحت و بی‌تکلف است',
        en: 'The space is easygoing and comfortable for sitting and spending time',
      },
      {
        fa: 'همه‌چیز ساده است و حس راحتی را حفظ می‌کند',
        en: 'Everything stays simple and comfortable',
      },
    ],
  },
  photoStories: [
    {
      imageKey: 'madiImg1',
      overline: { fa: 'صبح', en: 'Morning' },
      title: { fa: 'شروع زود', en: 'Early start' },
      copy: {
        fa: 'اول صبح، روز با اسپرسو و کوکی گرم شروع می‌شود',
        en: 'Early mornings begin with espresso and a warm cookie',
      },
    },
    {
      imageKey: 'madiImg2',
      overline: { fa: 'شب', en: 'Night' },
      title: { fa: 'شب دنج', en: 'Cozy night' },
      copy: {
        fa: 'بعد از غروب، فضا آرام‌تر می‌شود',
        en: 'After sunset, the space becomes calmer',
      },
    },
  ],
  location: {
    overline: { fa: 'آدرس و مسیر', en: 'Address & route' },
    title: { fa: 'مادی نیاصرم · اصفهان', en: 'Niyasarm Madi · Isfahan' },
    addressLines: {
      fa: ['اصفهان، چهارباغ عباسی، مادی نیاصرم', 'کافه میان مادی'],
      en: ['Isfahan, Chahar Bagh Abbasi, Niyasarm Madi', 'Miyan Madi Café'],
    },
    hours: { fa: 'هر روز ۰۷:۳۰ تا ۲۲:۳۰', en: 'Daily 07:30 to 22:30' },
    phone: { fa: '۰۳۱ ۶۶۶ ۷۷ ۸۸', en: '+98 31 666 77 88' },
    coordinates: { fa: '۳۲٫۶۴۷۶۲۴ شمالی · ۵۱٫۶۶۸۳۷۲ شرقی', en: '32.647624 N · 51.668372 E' },
    mapCenter: { lat: 32.64762442805897, lng: 51.668372361039545 },
    mapZoom: 16,
    mapLabel: { fa: 'اصفهان', en: 'Isfahan' },
    cta: { fa: 'نمایش روی نقشه', en: 'Show on map' },
  },
}

export const footerCopy = {
  about: {
    fa: 'مجموعه‌ای از کافه، رستری، بیکری و آشپزخانه جدا',
    en: 'A collection of café, roastery, bakery, and a separate kitchen',
  },
  sections: [
    {
      key: 'visit',
      title: { fa: 'بازدید', en: 'Visit' },
      links: [
        { label: { fa: 'میان برشت', en: 'Miyan Beresht' }, path: 'beresht' },
        { label: { fa: 'میان مادی', en: 'Miyan Madi' }, path: 'madi' },
      ],
    },
    {
      key: 'menus',
      title: { fa: 'منوها', en: 'Menus' },
      links: [
        { label: { fa: 'منوی برشت', en: 'Beresht Menu' }, path: 'beresht/menu' },
        { label: { fa: 'پخت روز برشت', en: "Beresht Today's Bake" }, path: 'beresht/daily-menu' },
        { label: { fa: 'منوی مادی', en: 'Madi Menu' }, path: 'madi/menu' },
        { label: { fa: 'پخت روز مادی', en: "Madi Today's Bake" }, path: 'madi/daily-menu' },
      ],
    },
    {
      key: 'contact',
      title: { fa: 'تماس', en: 'Contact' },
      links: [
        { label: { fa: 'info@miyangroup.com', en: 'info@miyangroup.com' }, href: 'mailto:info@miyangroup.com', dir: 'ltr' },
        { label: { fa: '+98 21 2244 7700', en: '+98 21 2244 7700' }, href: 'tel:+982122447700', dir: 'ltr' },
      ],
    },
  ],
}
