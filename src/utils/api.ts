/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const BASE_URL = 'https://api.spacetraders.io/v2';

export function translateError(englishError: string): string {
  const err = englishError.toLowerCase();
  
  if (err.includes('bearer token') || err.includes('missing token') || err.includes('bearer {token}')) {
    return 'توکن امنیتی یافت نشد یا معتبر نیست. لطفاً مجدداً خلبان جدید بسازید یا وارد شوید.';
  }
  if (err.includes('already has been claimed') || err.includes('already claimed') || err.includes('symbol has already')) {
    return 'این شناسه خلبانی قبلاً توسط خلبان دیگری ثبت شده است! لطفاً شناسه دیگری با حروف انگلیسی وارد کنید.';
  }
  if (err.includes('faction does not accept')) {
    return 'این جناح در حال حاضر مأمور جدید نمی‌پذیرد. جناح دیگری انتخاب کنید.';
  }
  if (err.includes('cooldown')) {
    return 'راکتور سفینه در حال خنک‌سازی است! لطفاً چند ثانیه صبر کنید.';
  }
  if (err.includes('insufficient funds') || err.includes('not have enough credits') || err.includes('credits')) {
    return 'اعتبار کافی برای انجام این تراکنش یا خرید وجود ندارد!';
  }
  if (err.includes('cargo') && (err.includes('limit') || err.includes('exceeds') || err.includes('capacity') || err.includes('space'))) {
    return 'فضای کافی در مخزن بار سفینه وجود ندارد یا تراکنش بیش از حد مجاز انبار است!';
  }
  if (err.includes('cargo')) {
    return 'خطا در مدیریت مخزن بار سفینه!';
  }
  if (err.includes('fuel') && err.includes('navigate')) {
    return 'سوخت سفینه برای ناوبری به این مقصد کافی نیست! ابتدا سوخت‌گیری کنید.';
  }
  if (err.includes('transit') || err.includes('in transit')) {
    return 'سفینه در حال حرکت بین‌ستاره‌ای است و تا زمان رسیدن در دسترس نیست.';
  }
  if (err.includes('must be in orbit') || err.includes('in orbit')) {
    return 'برای این کار سفینه باید در مدار (Orbit) باشد!';
  }
  if (err.includes('must be docked') || err.includes('docked')) {
    return 'برای این کار سفینه باید در بندرگاه پهلو گرفته (Docked) باشد!';
  }
  if (err.includes('surveyor') || err.includes('survey')) {
    return 'تجهیزات نقشه‌برداری کافی در این سفینه نصب نشده است.';
  }
  if (err.includes('not found')) {
    return 'منبع یا نقطه مقصد فضایی یافت نشد!';
  }
  if (err.includes('contract') && err.includes('accepted')) {
    return 'این قرارداد قبلاً پذیرفته شده است!';
  }
  if (err.includes('already at')) {
    return 'سفینه در حال حاضر در مقصد مورد نظر قرار دارد!';
  }
  if (err.includes('content-type') || err.includes('body is an empty string')) {
    return 'خطای فرمت درخواست ارتباطی با مرکز فرماندهی!';
  }

  // General translated messages
  return englishError || 'خطای ناشناخته در ارتباط با شبکه کهکشان!';
}

export async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : (method === 'POST' ? '{}' : undefined),
  });

  const json = await response.json();

  if (!response.ok) {
    const errorMsg = json.error?.message || 'خطای شبکه کهکشان';
    throw new Error(translateError(errorMsg));
  }

  return json.data as T;
}

// Faction symbols
export const FACTIONS = ['COSMIC', 'VOID', 'GALACTIC', 'QUANTUM', 'DOMINION'];

// Translate types
export function translateWaypointType(type: string): string {
  switch (type) {
    case 'PLANET': return 'سیاره';
    case 'GAS_GIANT': return 'غول گازی';
    case 'MOON': return 'قمر';
    case 'ASTEROID_FIELD': return 'کمربند سیارکی';
    case 'ORBITAL_STATION': return 'ایستگاه مداری';
    case 'JUMP_GATE': return 'دروازه جهش';
    case 'NEBULA': return 'سحابی';
    case 'GRAVITY_WELL': return 'چاه جاذبه';
    default: return type;
  }
}

export function translateShipRole(role: string): string {
  switch (role) {
    case 'COMMAND': return 'سفینه فرماندهی';
    case 'EXCAVATOR': return 'معدن‌کاو';
    case 'HAULER': return 'باربری';
    case 'RECON': return 'سفینه شناسایی';
    default: return role;
  }
}

export function translateCargoName(symbol: string, name: string): string {
  const lower = symbol.toUpperCase();
  
  const CARGO_DICTIONARY: { [key: string]: string } = {
    // Ores, Minerals & Raw Materials
    'IRON_ORE': 'سنگ آهن خام',
    'IRON': 'شمش آهن تصفیه‌شده',
    'COPPER_ORE': 'سنگ مس خام',
    'COPPER': 'شمش مس خالص',
    'SILVER_ORE': 'سنگ نقره خام',
    'SILVER': 'شمش نقره درخشان',
    'GOLD_ORE': 'سنگ طلای خام',
    'GOLD': 'طلای گرانبهای کهکشانی',
    'PLATINUM_ORE': 'سنگ پلاتین خام',
    'PLATINUM': 'پلاتین ذوب‌شده مرغوب',
    'ALUMINUM_ORE': 'سنگ آلومینیوم خام',
    'ALUMINUM': 'ورق آلومینیوم سبک',
    'URANINITE_ORE': 'سنگ اورانیوم خام',
    'URANINITE': 'اورانیوم غنی‌شده فشرده',
    'MERGANS_ORE': 'کانی خام مرگانز',
    'MERGANS': 'بلور گرانبهای مرگانز',
    'SILICON_CRYSTALS': 'بلورهای سیلیسیم خام',
    'SILICON': 'صفحات سیلیسیم نیمه‌هادی',
    'QUARTZ': 'کریستال کوارتز معدنی',
    'QUARTZ_SAND': 'ماسه کوارتز خالص صنعتی',
    'ICE_WATER': 'آب یخ‌زده سیارکی',
    'AMMONIA': 'آمونیاک فشرده مایع',
    'TOXINS': 'سموم شیمیایی پایه',
    'HYDROGEN': 'هیدروژن خام فضایی',
    'BIOMASS': 'زیست‌توده ارگانیک',
    'SULFUR': 'بلورهای گوگرد معدنی',
    'PEARLS': 'مرواریدهای گرانبهای فضایی',
    'CHARCOAL': 'کربن زغال اکتیو',
    'AMMONIA_ICE': 'یخ آمونیاک غلیظ',
    
    // Core Fuel & Essentials
    'FUEL': 'سوخت فضایی فشرده',
    'ANTIMATTER': 'ضدماده پرانرژی کوانتومی',
    'LIQUID_OXYGEN': 'اکسیژن مایع حیاتی',
    'LIQUID_HYDROGEN': 'هیدروژن مایع رانشی',
    'FOOD': 'جیره غذایی ویژه خلبانان',
    'MEDICINE': 'دارو و کیت‌های فوریت پزشکی',
    'CLOTHING': 'پوشاک عایق و ملزومات بقا',
    'AMMUNITION': 'مهمات دفاعی جنگی ناوگان',
    'EXPLOSIVES': 'مواد منفجره هیدرولیکی معدن',
    'DRUGS': 'کیت‌های درمانی بیوشیمیایی و محرک خلبان',
    'ARTWORK': 'آثار هنری و میراث باستانی نایاب',
    'JEWELRY': 'جواهرات لوکس زینتی و قیمتی',
    'JEWELLERY': 'جواهرات لوکس زینتی و قیمتی',
    'FAB_MATS': 'ماتریس الیاف ساختمانی',
    
    // Industrial & Chemicals
    'MACHINERY': 'ماشین‌آلات و تجهیزات سنگین',
    'LAB_INSTRUMENTS': 'تجهیزات ظریف آزمایشگاهی',
    'PLASTICS': 'پلاستیک فشرده پلیمری',
    'CHEMICALS': 'ترکیبات شیمیایی صنعتی',
    'BIO_CHEMICALS': 'ترکیبات بیوشیمیایی حساس',
    'FERTILIZERS': 'کود پیشرفته کشت گلخانه‌ای',
    'FABRICS': 'الیاف ضدحرارت و پارچه عایق',
    'HYDROCARBON': 'سوخت کربنی هیدروکربنی',
    'EQUIPMENT': 'ابزارها و کیت‌های کارگاهی',
    'MERCHANDISE': 'کالاهای مصرفی عمومی کهکشان',
    'STEEL': 'آلیاژ فولاد سخت صنعتی',
    'STEEL_PLATE': 'صفحات بدنه فولادی سفینه',
    'IRON_PLATES': 'صفحات آهنی ریخته‌گری',
    'COPPER_PLATES': 'صفحات مسی رسانا',
    'SILICON_WATERS': 'ویفرهای سیلیسیمی پردازشگر',
    'SILICON_WAFERS': 'ویفرهای سیلیسیمی پردازشگر',
    'FAB_PLASTICS': 'پلاستیک‌های پیش‌ساخته عایق بدنه',
    
    // High-Tech, Electronics & Robotics
    'MICROPROCESSORS': 'ریزپردازنده‌های فوق‌سریع نسل جدید',
    'SUPERCONDUCTORS': 'ابررساناهای دمای اتاق',
    'CYBERNETICS': 'قطعات پروتز سایبرنتیک پیشرفته',
    'ROBOTICS': 'مکانیزم‌ها و اجزای رباتیک خودکار',
    'COMPUTERS': 'رایانه‌های ابرپردازنده کوانتومی',
    'AI_CORES': 'هسته‌های پردازش هوش مصنوعی',
    'SOFTWARE': 'نرم‌افزارهای یکپارچه ناوبری',
    'NEURAL_CHIPS': 'تراشه‌های بیوعصبی اتصال مستقیم',
    'NOOTROPICS': 'تقویت‌کننده‌های هوشیاری و ذهن خلبان',
    'ADVANCED_CIRCUITRY': 'مدارهای الکترونیکی پیشرفته فشرده',
    'NANOBOTS': 'نانوربات‌های هوشمند تعمیر خودکار',
    'PLASMA_CONDUITS': 'مجرای هدایت پلاسما مغناطیسی',
    'HYPERMATTER': 'هایپرماده غنی‌شده با انرژی تاریک',
    'ELECTRONICS': 'کیت‌های الکترونیکی و حسگرها',
    
    // Rare Components & Ship Parts
    'PRECIOUS_STONES': 'سنگ‌های قیمتی ملوکانی نایاب',
    'GRAVITON_EMITTERS': 'گسیل‌دهنده‌های گرانش کوانتومی',
    'SHIP_PARTS': 'قطعات یدکی فنی و مکانیکی سفینه',
    'SHIP_PLATING': 'صفحات زرهی آلیاژی بدنه ناو',
    'SHIP_SALVAGE': 'ضایعات بازیافتی بدنه سفینه‌ها',
    'REACTION_CHAMBERS': 'محفظه‌های فیوژن فوتونیکی موتور',
    'FLUID_REGULATORS': 'رگولاتورهای هیدرولیک جریان بار',
    'MICRO_FUSION_GENERATORS': 'ژنراتورهای گداخت مینیاتوری پرقدرت',
    'EXOTIC_MATTER': 'ماده غریب و چگال کوانتومی دوقطبی',
    'RELIC_TECHNOLOGY': 'فناوری باستانی کهن و عتیقه‌های عهد عتیق',
    'POLISHED_SHIELD_PLATES': 'صفحات سپر دفاعی صیقلی‌شده تیتانیومی',
    'REACTOR_CORES': 'هسته‌های راکتور گداخت گرانشی پلاسما',
    'WARP_DRIVES': 'موتورهای پیشرانش وارپ فوق‌نوری',
    'QUANTUM_DRIVES': 'پیشران‌های فضا-زمان کوانتومی لوپ',
    'LASER_RIFLES': 'تفنگ‌های لیزری فوتونی دفاعی تهاجمی',
    'MILITARY_EQUIPMENT': 'تسلیحات سنگین و تجهیزات نظامی ناوگان'
  };

  if (CARGO_DICTIONARY[lower]) {
    return CARGO_DICTIONARY[lower];
  }

  // Fallback pattern matching for dynamic or compound symbols
  if (lower.includes('ORE')) {
    if (lower.includes('IRON')) return 'سنگ آهن خام';
    if (lower.includes('COPPER')) return 'سنگ مس خام';
    if (lower.includes('ALUMINUM')) return 'سنگ آلومینیوم خام';
    if (lower.includes('SILICON')) return 'سیلیسیم خام';
    if (lower.includes('GOLD')) return 'سنگ طلا خام';
    if (lower.includes('PLATINUM')) return 'سنگ پلاتین خام';
    if (lower.includes('URANINITE')) return 'سنگ اورانیوم خام';
    if (lower.includes('MERGANS')) return 'کانی خام مرگانز';
    return 'کانی سنگ خام';
  }

  return name || symbol;
}

export function getWaypointPersianName(symbol: string, type: string): string {
  // Deterministic hash based on the unique symbol code
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const prefix = ['پایگاه تجاری', 'بندرگاه صنعتی', 'سایت مرزی', 'ایستگاه بازرگانی', 'سکوی فرماندهی', 'آشیانه سوخت‌رسانی'];
  const nameParts = ['آلفا', 'بتا', 'سایه', 'البرز', 'تفتان', 'دماوند', 'سهند', 'سبلان', 'کیهان', 'آریا', 'سروش', 'فردوسی', 'حافظ', 'خیام', 'سعدی', 'رستم', 'سیمرغ', 'خورشید', 'سیلو', 'میثاق'];
  const suffix = ['شمالی', 'جنوبی', 'مرکزی', 'شرقی', 'غربی', 'دور', 'کهکشانی', 'پیشرو', 'عملیاتی', 'هایپر'];

  const typePrefix = 
    type === 'ASTEROID' ? 'سیارک معدنی' :
    type === 'ASTEROID_FIELD' ? 'کمربند معدنی' :
    type === 'PLANET' ? 'سیاره مسکونی' :
    type === 'GAS_GIANT' ? 'منبع انرژی غول‌گازی' :
    type === 'MOON' ? 'پست دیده‌بانی قمر' :
    type === 'JUMP_GATE' ? 'دروازه جهش نوری' :
    type === 'ORBITAL_STATION' ? 'ایستگاه مداری' :
    type === 'FUEL_STATION' ? 'آشیانه سوخت‌رسانی' :
    prefix[hash % prefix.length];

  // Fix: JS bitwise operators like >> cast to 32-bit signed integers, which can overflow on large hashes and yield negative numbers.
  // We use direct division and absolute addition to guarantee safe positive indexes!
  const coreName = nameParts[(hash + 3) % nameParts.length];
  const suff = suffix[(hash + 7) % suffix.length];

  return `${typePrefix} ${coreName} ${suff}`;
}

// LOCAL TRANSPONDER SHIP NICKNAME SYSTEM
export function getShipNickname(shipSymbol: string): string {
  const nicknames = localStorage.getItem('spacetraders_ship_nicknames');
  if (nicknames) {
    try {
      const parsed = JSON.parse(nicknames);
      if (parsed[shipSymbol]) {
        return parsed[shipSymbol];
      }
    } catch (e) {}
  }
  return '';
}

export function saveShipNickname(shipSymbol: string, nickname: string) {
  const nicknames = localStorage.getItem('spacetraders_ship_nicknames') || '{}';
  try {
    const parsed = JSON.parse(nicknames);
    if (nickname.trim()) {
      parsed[shipSymbol] = nickname.trim();
    } else {
      delete parsed[shipSymbol];
    }
    localStorage.setItem('spacetraders_ship_nicknames', JSON.stringify(parsed));
  } catch (e) {}
}

export function translateTraitName(symbol: string, name: string): string {
  const upper = symbol.toUpperCase();
  const TRAITS_DICTIONARY: { [key: string]: string } = {
    'MARKETPLACE': 'بازارگاه محلی (محل خرید ملزومات، سوخت‌گیری و فروش اقلام معدنی)',
    'SHIPYARD': 'آشیانه کشتی‌سازی (محل سفارش، خرید و ارتقاء سفینه‌های ترابری و حفاری جدید)',
    'OUTPOST': 'پایگاه مرزی (قرارگاه اداری فدراسیون جهت نظارت کهکشانی و ارائه قراردادها)',
    'TRADING_POST': 'ایستگاه بازرگانی مستقل (هاب آزاد برای مبادلات آزادانه تجاری کالاها)',
    'RESEARCH_FACILITY': 'تأسیسات علمی-تحقیقاتی (مرکز توسعه فناوری و ثبت کدهای ناوبری)',
    'MILITARY_BASE': 'دژ و پایگاه نظامی (تأمین امنیت و گشت‌های زرهی در مدار سیارات اطراف)',
    'REFINERY': 'پالایشگاه سوخت فضایی (پالایش هیدروژن و تولید سوخت تصفیه‌شده کهکشانی)',
    'FACTION_HQ': 'ستاد فرماندهی فکشن (قرارگاه مرکزی رهبری و برنامه‌ریزی استراتژیک)',
    'BLACK_MARKET': 'بازار سیاه کهکشانی (محل مبادلات قاچاق، فروش کالاهای ممنوعه و خرید سلاح دزدان فضایی)',
    'EXPLORATION_SITE': 'محل اکتشاف باستانی (ویرانه‌های قدیمی مناسب برای جویندگان گنج و اسکن تمدن‌های کهن)',
    'COMMERCIAL_ZONE': 'منطقه آزاد تجاری (بخش بزرگ بازارهای تفریحی و تجاری برای عموم)',
    'MINE': 'معادن فعال دولتی (منطقه استخراج زغال‌سنگ، فلزات سنگین و گازهای زیرزمینی)',
    'UNCHARTED': 'نقشه‌برداری نشده (منطقه اکتشاف‌نشده و بدون نقشه ثبتی)',
    'UNDER_CONSTRUCTION': 'در حال ساخت (پایگاه جدید در حال احداث توسط فدراسیون)',
    'EXPLORED': 'اکتشاف‌یافته و ثبت‌شده (دارای نقشه دیجیتالی و مختصات کاملاً دقیق)',
    'UNEXPLORED': 'محدوده اسکن‌نشده و تاریک (ناشناخته، فاقد ترافیک تجاری امن)',
    'STRIPPED': 'کاملاً تخلیه‌شده (فاقد هرگونه ذخیره معدنی قابل‌توجه جهت حفاری)',
    'MINERAL_RICH': 'سرشار از کانی‌های معدنی (بستر غنی از سنگ‌های گرانبها و فلزات سنگین)',
    'PRECIOUS_METAL_DEPOSITS': 'دارای ذخایر فلزات گرانبها (رگه‌های طلا، نقره و پلاتین بسیار ارزشمند)',
    'COMMON_METAL_DEPOSITS': 'دارای ذخایر فلزات اساسی (حاوی کوه‌های آهن، مس و آلومینیوم برای صنایع ناوگان)',
    'DEEP_CRATERS': 'دهانه‌های عمیق برخورد سیارکی (گودال‌های عمیق، پناهگاهی مناسب برای فرار از رادارها)',
    'SHALLOW_CRATERS': 'دهانه‌های کم‌عمق (پوشیده از تپه‌های غبارآلود با گرانش یکنواخت)',
    'HIGH_GRAVITY': 'میدان گرانشی شدید (جاذبه زیاد، احتیاج به سوخت‌رسانی دوبل برای پرواز)',
    'LOW_GRAVITY': 'گرانش ضعیف (جاذبه بسیار ناچیز، شرایط ایده‌آل برای تخلیه و پرواز فوق‌سریع سفینه)',
    'EXTREME_TEMPERATURES': 'دمای فوق‌العاده شدید (حرارت سوزان یا انجماد مطلق، خطر آسیب بدنه سفینه)',
    'FROZEN': 'منجمد سیارکی (سطح کاملاً پوشیده از متان و آمونیاک منجمد، مخزن غنی آب یخ‌زده)',
    'VOLCANIC': 'فعال آتشفشانی (سطح مواج با جریان مواد مذاب داغ و سنگ‌های گوگرد مذاب)',
    'ROCKY': 'ناهموار و صخره‌ای سخت (بستر ناهموار سنگی، مناسب برای استخراج با مته‌های قوی)',
    'GAS_GIANT_ORBIT': 'مدار غول گازی (اتمسفر هیدروژنی با تداخلات شدید مغناطیسی)',
    'JUMP_GATE': 'دروازه پرش کرم‌چاله (پورتال هایپر‌فضا برای سفر فوری به سیستم‌های دوردست)',
    'FLEET_COMMUNICATION': 'دکل مخابراتی ناوگان (آنتن ارتباطات دوربرد برای همگام‌سازی موقعیت‌ها)',
    'ICE_VALLEYS': 'دره‌های یخی عمیق (شکاف‌های یخی پر از یخچال‌های طبیعی سیارکی جهت استخراج یخ)',
    'SCATTERED_DEBRIS': 'بقایای سرگردان فضایی (حاوی قطعات رها شده و اسقاطی بدنه سفینه‌های قدیمی)',
    'SURROUNDED_BY_HOT_GAS': 'محصور در گازهای داغ (حاوی جریان‌های غلیظ گاز فشرده و ذرات پلاسما)',
    'WEAK_ORGANIC_SIGNATURES': 'علائم زیستی ضعیف (شواهد اولیه از میکروارگانیسم‌ها یا جلبک‌های کهکشانی)'
  };

  return TRAITS_DICTIONARY[upper] || name || symbol;
}

export async function getServerResetTime(): Promise<string> {
  try {
    const res = await fetch('https://api.spacetraders.io/v2');
    const data = await res.json();
    return data?.serverResets?.next || data?.resetDate || '';
  } catch (e) {
    console.error('Failed to fetch server reset time:', e);
    return '';
  }
}

