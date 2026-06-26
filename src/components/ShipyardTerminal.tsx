/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Landmark, Compass, Shield, HelpCircle, ArrowUpRight } from 'lucide-react';
import { Shipyard, Ship } from '../types';

interface ShipyardTerminalProps {
  shipyard: Shipyard | null;
  selectedShip: Ship | null;
  loading: boolean;
  onBuyShip: (shipType: string, waypointSymbol: string) => Promise<void>;
}

export default function ShipyardTerminal({
  shipyard,
  selectedShip,
  loading,
  onBuyShip,
}: ShipyardTerminalProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleBuyShip = async (shipType: string) => {
    if (!selectedShip) return;
    setActionLoading(shipType);
    try {
      await onBuyShip(shipType, selectedShip.nav.waypointSymbol);
    } catch (e) {}
    setActionLoading(null);
  };

  if (!selectedShip) {
    return (
      <div className="pixel-box bg-slate-900 border-slate-700 p-6 text-center" dir="rtl">
        <Landmark size={32} className="mx-auto text-slate-500 mb-2" />
        <h3 className="font-bold text-slate-300 font-sans">هیچ سفینه‌ای به عنوان فرمانده ناوگان فعال نیست</h3>
        <p className="text-xs text-slate-500 mt-1">جهت ارتباط با مهندسین کارگاه کشتی‌سازی، ابتدا یک سفینه را فعال کنید.</p>
      </div>
    );
  }

  const isDocked = selectedShip.nav.status === 'DOCKED';

  if (!isDocked) {
    return (
      <div className="pixel-box bg-slate-900 border-slate-700 p-6 text-center" dir="rtl">
        <Compass size={32} className="mx-auto text-terminal-amber mb-2" />
        <h3 className="font-bold text-slate-300 font-sans">سفینه فعال شما در مدار است و پهلو نگرفته است</h3>
        <p className="text-xs text-slate-500 mt-1">
          مهندسین مگا-استراکچر کارگاه سفینه‌سازی تنها در حالت پهلوگیری کامل با شما مذاکره می‌کنند. ابتدا سفینه <span className="font-mono text-terminal-cyan font-bold">{selectedShip.symbol}</span> را در پایگاه <span className="font-mono text-slate-200 font-bold">{selectedShip.nav.waypointSymbol}</span> پهلو دهید.
        </p>
      </div>
    );
  }

  if (!shipyard || !shipyard.ships || shipyard.ships.length === 0) {
    return (
      <div className="pixel-box bg-slate-900 border-slate-700 p-6 text-center" dir="rtl">
        <HelpCircle size={32} className="mx-auto text-slate-500 mb-2" />
        <h3 className="font-bold text-slate-300 font-sans">عدم شناسایی تسهیلات کشتی‌سازی</h3>
        <p className="text-xs text-slate-500 mt-1">
          این پایگاه فضایی دارای کارگاه ساخت یا فروش ناوگان فضایی نیست. به دنبال پایگاهی با ویژگی <span className="text-terminal-cyan font-bold font-sans">SHIPYARD</span> بر روی نقشه بگردید.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Shipyard header */}
      <div className="pixel-box bg-slate-950 p-3 border-slate-800 flex items-center justify-between text-right">
        <div>
          <span className="text-[10px] text-slate-500 block">مرکز ساخت و مهندسی کشتی‌سازی:</span>
          <span className="font-mono text-sm font-bold text-terminal-cyan">{shipyard.symbol}</span>
        </div>
        <span className="text-xs text-slate-400 font-sans">
          تعداد مدل‌های موجود جهت مونتاژ: <span className="text-terminal-cyan font-mono font-bold">{shipyard.ships.length}</span>
        </span>
      </div>

      {/* Ships catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shipyard.ships.map((ship) => {
          const isBuying = actionLoading === ship.type;
          
          // Custom description and translated stats for common ships
          const speedText = ship.type.includes('PROBE') ? 'فوق سریع' : ship.type.includes('MINING') ? 'کلاس سنگین' : 'کلاس متوسط';
          const roleText = ship.type.includes('PROBE') ? 'پیمایش اکتشافی' : ship.type.includes('MINING') ? 'استخراج سنگ معدن' : 'تجارت عمومی';

          return (
            <div key={ship.type} className="pixel-box bg-slate-900 border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block">{ship.type}</span>
                    <h4 className="text-sm font-bold text-slate-100 font-sans">{ship.name}</h4>
                  </div>
                  <span className="text-[11px] bg-terminal-cyan/10 text-terminal-cyan border border-terminal-cyan/20 px-2 py-0.5 rounded font-sans">
                    {roleText}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {ship.description || 'این سفینه فضایی مجهز به پیشران‌های هیدروژنی نسل جدید و سیستم‌های ترانسپوندر مدرن جهت ماموریت‌های فدراسیون تجارت کهکشان می‌باشد.'}
                </p>

                {/* Specs specs */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 border border-slate-850 rounded text-xs mb-4 font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-sans">سرعت موتور</span>
                    <span className="text-slate-200 font-sans">{speedText}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-sans">کارایی ساختار</span>
                    <span className="text-slate-200 font-sans">۱۰۰٪ پایدار</span>
                  </div>
                </div>
              </div>

              {/* Pricing & buy action */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-850 pt-3 mt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">بهای نهایی مونتاژ:</span>
                  <span className="text-sm font-bold text-terminal-amber font-mono tracking-wide">
                    {ship.purchasePrice.toLocaleString()} ¤
                  </span>
                </div>

                <button
                  onClick={() => handleBuyShip(ship.type)}
                  disabled={loading || isBuying}
                  className="px-4 py-2 bg-terminal-cyan hover:bg-terminal-cyan/90 text-slate-950 text-xs font-bold font-sans cursor-pointer transition-colors flex items-center gap-1"
                >
                  <ArrowUpRight size={14} />
                  <span>{isBuying ? 'در حال ثبت ناوگان...' : 'سفارش ساخت'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
