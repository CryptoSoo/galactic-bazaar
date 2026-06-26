/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const BASE_URL = 'https://api.spacetraders.io/v2';

export function translateError(englishError: string): string {
  const err = englishError.toLowerCase();
  
  if (err.includes('cooldown')) {
    return 'راکتور سفینه در حال خنک‌سازی است! لطفاً چند ثانیه صبر کنید.';
  }
  if (err.includes('insufficient funds') || err.includes('not have enough credits') || err.includes('credits')) {
    return 'اعتبار کافی برای انجام این تراکنش یا خرید وجود ندارد!';
  }
  if (err.includes('cargo') && err.includes('capacity')) {
    return 'ظرفیت مخزن بار سفینه پر شده است!';
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
    body: body ? JSON.stringify(body) : undefined,
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
  if (lower.includes('ORE')) {
    if (lower.includes('IRON')) return 'سنگ آهن';
    if (lower.includes('COPPER')) return 'سنگ مس';
    if (lower.includes('ALUMINUM')) return 'سنگ آلومینیوم';
    if (lower.includes('SILICON')) return 'سیلیسیم خام';
    if (lower.includes('GOLD')) return 'سنگ طلا';
    if (lower.includes('PLATINUM')) return 'سنگ پلاتین';
  }
  if (lower === 'FUEL') return 'سوخت فضایی';
  if (lower === 'ANTIMATTER') return 'ضدماده';
  if (lower === 'ICE_WATER') return 'آب یخ‌زده';
  if (lower === 'QUARTZ') return 'کوارتز';
  if (lower === 'HYDROGEN') return 'هیدروژن';
  if (lower === 'EXPLOSIVES') return 'مواد منفجره';
  if (lower === 'ELECTRONICS') return 'قطعات الکترونیکی';
  if (lower === 'MACHINERY') return 'ماشین‌آلات بالاآب';
  if (lower === 'LAB_INSTRUMENTS') return 'تجهیزات آزمایشگاهی';
  if (lower === 'PLASTICS') return 'پلاستیک فشرده';
  if (lower === 'FOOD') return 'جیره غذایی خلبانان';
  
  return name || symbol;
}
