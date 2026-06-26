/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GalacticEvent {
  id: string;
  title: string;
  description: string;
  effectText: string;
  affectedCommodities: { [commoditySymbol: string]: number }; // Multiplier for prices
  type: 'mining_boom' | 'pirate_blockade' | 'tech_crisis' | 'solar_flare' | 'military' | 'peace';
  icon: string;
}

export interface PlayerTradeImpact {
  [commoditySymbol: string]: {
    boughtUnits: number;
    soldUnits: number;
  };
}

const GALACTIC_EVENTS: GalacticEvent[] = [
  {
    id: 'mining_boom',
    title: 'کشف بزرگ رگه فلزات سنگین در سیارک‌ها',
    description: 'معدن‌کاوان جناح COSMIC موفق به مکان‌یابی رگه‌های فوق‌العاده متراکم پلاتین و مس شده‌اند. هجوم سنگین معدن‌کاوان بازار را از سنگ آهن و پلاتین انباشته کرده است.',
    effectText: 'کاهش شدید نرخ خرید سنگ‌آهن و پلاتین (-۵۰٪) و دو برابر شدن بازده استخراج مته خلبانان!',
    affectedCommodities: {
      'IRON_ORE': 0.5,
      'COPPER_ORE': 0.6,
      'GOLD_ORE': 0.7,
      'PLATINUM_ORE': 0.4,
    },
    type: 'mining_boom',
    icon: '☄️'
  },
  {
    id: 'pirate_blockade',
    title: 'محاصره بندرگاه توسط راهزنان فضایی سرخ',
    description: 'ناوگان فرعی راهزنان «خلأ خونین» بخش بزرگی از کریدور اصلی ترانزیت ترابری را محاصره کرده است. انتقال سوخت فضایی و تدارکات غذایی حیاتی با تهدید مواجه است.',
    effectText: 'افزایش چشمگیر قیمت سوخت فضایی (+۱۲۰٪) و جیره غذایی خلبانان (+۸۰٪)! کاهش بازدهی تجاری.',
    affectedCommodities: {
      'FUEL': 2.2,
      'FOOD': 1.8,
      'EXPLOSIVES': 1.5,
    },
    type: 'pirate_blockade',
    icon: '🏴‍☠️'
  },
  {
    id: 'tech_crisis',
    title: 'بحران کمبود میکروچیپ در پایگاه‌های کوانتوم',
    description: 'وقوع یک طوفان مغناطیسی غول‌آسا در سیاره مرجع، تمام انبارهای تولید نیمه‌هادی را ذوب کرده است. تقاضا برای قطعات الکترونیکی و تجهیزات پیشرفته به سقف چسبیده است.',
    effectText: 'قیمت قطعات الکترونیکی (+۱۵۰٪) و ماشین‌آلات تجاری (+۹۰٪) سرسام‌آور بالا رفته است.',
    affectedCommodities: {
      'ELECTRONICS': 2.5,
      'MACHINERY': 1.9,
      'LAB_INSTRUMENTS': 1.6,
    },
    type: 'tech_crisis',
    icon: '⚡'
  },
  {
    id: 'military',
    title: 'آماده‌باش رزمی و تحرکات نظامی فدراسیون',
    description: 'پس از تجاوز جنگنده‌های ناشناس به مرزهای کوانتوم، فدراسیون گالاکتیک اعلام آماده‌باش کامل کرده است. خرید تمام منابع دفاعی و مواد منفجره در اولویت امنیتی قرار گرفته است.',
    effectText: 'مواد منفجره (+۱۰۰٪)، سوخت فضایی (+۶۰٪) و سنگ مس و آهن (+۴۰٪) بسیار گران‌تر خریداری می‌شوند.',
    affectedCommodities: {
      'EXPLOSIVES': 2.0,
      'FUEL': 1.6,
      'COPPER_ORE': 1.4,
      'IRON_ORE': 1.3,
    },
    type: 'military',
    icon: '🛡️'
  },
  {
    id: 'solar_flare',
    title: 'طوفان پروتونی و تخلیه بارهای الکترومغناطیسی خورشید',
    description: 'شعله‌ور شدن ناگهانی ستاره سرخ منظومه سبب ایجاد امواج رادیواکتیو و تداخل شدید در ارتباطات بانکی و بازارهای مالی شده است. نوسان غیرقابل پیش‌بینی در سراسر گالاکسی جریان دارد.',
    effectText: 'نوسان قیمت‌ها به صورت متغیر و کاملا ناپایدار؛ خرید و فروش در این دوره ریسک بالایی دارد.',
    affectedCommodities: {
      'FUEL': 0.7,
      'FOOD': 1.4,
      'ICE_WATER': 1.5,
      'QUARTZ': 0.8,
    },
    type: 'solar_flare',
    icon: '☀️'
  },
  {
    id: 'peace',
    title: 'پیمان صلح کثرت‌گرا و ثبات اقتصادی ایستگاه‌ها',
    description: 'امضای معاهده صلح بین اتحادهای VOID و COSMIC آرامش را به خطوط معاملاتی بازگردانده است. تجارت امن برقرار بوده و بازارها در متعادل‌ترین حالت تاریخی خود هستند.',
    effectText: 'افزایش جزئی سود فروش تمام کالاها (+۱۵٪) به عنوان مشوق بازرگانی فدراسیون.',
    affectedCommodities: {
      'FUEL': 1.0,
      'FOOD': 1.0,
      'ELECTRONICS': 1.1,
      'MACHINERY': 1.1,
    },
    type: 'peace',
    icon: '🕊️'
  }
];

// Helper to load or initialize player trade impact
export function getPlayerTradeImpact(): PlayerTradeImpact {
  const data = localStorage.getItem('spacetraders_market_impact');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // Clear corrupt state
    }
  }
  return {};
}

// Helper to save player trade impact
export function savePlayerTradeImpact(impact: PlayerTradeImpact) {
  localStorage.setItem('spacetraders_market_impact', JSON.stringify(impact));
}

// Record player buying or selling of commodities
export function recordPlayerTrade(commoditySymbol: string, type: 'buy' | 'sell', units: number) {
  const impact = getPlayerTradeImpact();
  if (!impact[commoditySymbol]) {
    impact[commoditySymbol] = { boughtUnits: 0, soldUnits: 0 };
  }

  if (type === 'buy') {
    // Buying reduces supply -> increases scarcity and drives PRICE UP
    impact[commoditySymbol].boughtUnits += units;
    // Decelerate opposing impact to let prices recover over time
    impact[commoditySymbol].soldUnits = Math.max(0, impact[commoditySymbol].soldUnits - units * 0.5);
  } else {
    // Selling increases supply -> floods market and drives PRICE DOWN
    impact[commoditySymbol].soldUnits += units;
    impact[commoditySymbol].boughtUnits = Math.max(0, impact[commoditySymbol].boughtUnits - units * 0.5);
  }

  savePlayerTradeImpact(impact);
}

// Get active galactic event
export function getActiveEvent(): GalacticEvent {
  const saved = localStorage.getItem('spacetraders_active_event');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Validate that it exists in our core static array
      const found = GALACTIC_EVENTS.find((e) => e.id === parsed.id);
      if (found) return found;
    } catch (e) {}
  }
  
  // Default to peace
  const peaceEvent = GALACTIC_EVENTS.find((e) => e.id === 'peace') || GALACTIC_EVENTS[0];
  localStorage.setItem('spacetraders_active_event', JSON.stringify(peaceEvent));
  return peaceEvent;
}

// Trigger a brand new galactic event (can be random or specific)
export function triggerNewEvent(specificId?: string): GalacticEvent {
  let selected: GalacticEvent;
  if (specificId) {
    selected = GALACTIC_EVENTS.find((e) => e.id === specificId) || GALACTIC_EVENTS[5];
  } else {
    // Pick random (prevent getting same as current if possible)
    const current = getActiveEvent();
    const available = GALACTIC_EVENTS.filter((e) => e.id !== current.id);
    selected = available[Math.floor(Math.random() * available.length)];
  }

  localStorage.setItem('spacetraders_active_event', JSON.stringify(selected));
  return selected;
}

// Dynamic Price Modifiers Engine
export function getDynamicPrice(
  commoditySymbol: string,
  basePrice: number,
  isSell: boolean
): { price: number; multiplier: number; explanation: string[] } {
  const explanation: string[] = [];
  let multiplier = 1.0;

  // 1. Apply Galactic Event Multiplier
  const activeEvent = getActiveEvent();
  const eventModifier = activeEvent.affectedCommodities[commoditySymbol];
  if (eventModifier !== undefined && eventModifier !== 1.0) {
    multiplier *= eventModifier;
    const pct = Math.round((eventModifier - 1) * 100);
    explanation.push(
      `${activeEvent.icon} ${activeEvent.title} (${pct >= 0 ? '+' : ''}${pct}٪)`
    );
  }

  // 2. Apply Player Activity (Supply & Demand simulation)
  const impact = getPlayerTradeImpact();
  const comImpact = impact[commoditySymbol];
  if (comImpact) {
    // If player has bought many items, scarcity increases price
    if (comImpact.boughtUnits > 0) {
      const inflation = Math.min(1.5, comImpact.boughtUnits * 0.02); // Max +150% price
      if (inflation > 0) {
        multiplier *= (1 + inflation);
        explanation.push(
          `📈 افزایش تقاضا به علت خریدهای سنگین شما (+${Math.round(inflation * 100)}٪)`
        );
      }
    }
    // If player has sold many items, supply flooding drops price
    if (comImpact.soldUnits > 0) {
      const deflation = Math.min(0.6, comImpact.soldUnits * 0.015); // Max -60% price
      if (deflation > 0) {
        multiplier *= (1 - deflation);
        explanation.push(
          `📉 افت عرضه به علت اشباع بازار توسط شما (-${Math.round(deflation * 100)}٪)`
        );
      }
    }
  }

  // 3. Minor hourly/minute fluctuation (adds subtle organic heartbeat to prices)
  const date = new Date();
  const noiseSeed = (date.getHours() * 60 + date.getMinutes() + commoditySymbol.charCodeAt(0)) % 100;
  // Fluctuation of -8% to +8%
  const noise = (noiseSeed - 50) / 625; // range: [-0.08, +0.08]
  multiplier *= (1 + noise);

  // If peace event, add a general minor buff to player sells
  if (activeEvent.id === 'peace' && isSell) {
    multiplier *= 1.15;
    explanation.push(`🕊️ مشوق صلح و ثبات ترانزیت (+۱۵٪)`);
  }

  // Keep limits realistic (prices can't drop below 20% or exceed 500%)
  multiplier = Math.min(5.0, Math.max(0.2, multiplier));

  let finalPrice = Math.round(basePrice * multiplier);
  
  // Enforce bid-ask spread rules (sell price should generally not exceed purchase price unless extreme event)
  if (isSell) {
    finalPrice = Math.max(1, Math.round(finalPrice * 0.9)); // Sells are slightly lower than face dynamic
  } else {
    finalPrice = Math.max(2, finalPrice);
  }

  return {
    price: finalPrice,
    multiplier,
    explanation
  };
}

// Reset market impacts (market recovery)
export function clearMarketImpacts() {
  localStorage.removeItem('spacetraders_market_impact');
}

export function getAllEventsList(): GalacticEvent[] {
  return GALACTIC_EVENTS;
}
