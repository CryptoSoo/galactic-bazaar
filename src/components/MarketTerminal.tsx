/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ShoppingCart, Coins, TrendingUp, Info, AlertCircle, 
  Radio, RefreshCw, Sparkles, TrendingDown 
} from 'lucide-react';
import { Market, Ship } from '../types';
import { translateCargoName } from '../utils/api';
import { 
  getDynamicPrice, 
  recordPlayerTrade, 
  getActiveEvent, 
  triggerNewEvent,
  clearMarketImpacts
} from '../utils/marketEngine';

interface MarketTerminalProps {
  market: Market | null;
  selectedShip: Ship | null;
  loading: boolean;
  onBuy: (shipSymbol: string, tradeSymbol: string, units: number) => Promise<void>;
  onSell: (shipSymbol: string, tradeSymbol: string, units: number) => Promise<void>;
}

export default function MarketTerminal({
  market,
  selectedShip,
  loading,
  onBuy,
  onSell,
}: MarketTerminalProps) {
  const [tradeAmount, setTradeAmount] = useState<{ [key: string]: number }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Local state to force rerendering of prices when local storage changes (event triggers/trades)
  const [marketRefreshKey, setMarketRefreshKey] = useState(0);

  const activeEvent = getActiveEvent();

  const forceRefreshPrices = () => {
    setMarketRefreshKey((prev) => prev + 1);
  };

  const handleBuy = async (symbol: string) => {
    if (!selectedShip) return;
    const amount = tradeAmount[symbol] || 1;
    setActionLoading(symbol + '-buy');
    try {
      await onBuy(selectedShip.symbol, symbol, amount);
      // Record player trade to simulate supply and demand
      recordPlayerTrade(symbol, 'buy', amount);
      forceRefreshPrices();
    } catch (e) {}
    setActionLoading(null);
  };

  const handleSell = async (symbol: string) => {
    if (!selectedShip) return;
    const amount = tradeAmount[symbol] || 1;
    setActionLoading(symbol + '-sell');
    try {
      await onSell(selectedShip.symbol, symbol, amount);
      // Record player trade to simulate supply and demand
      recordPlayerTrade(symbol, 'sell', amount);
      forceRefreshPrices();
    } catch (e) {}
    setActionLoading(null);
  };

  const handleTriggerNewEvent = () => {
    triggerNewEvent();
    forceRefreshPrices();
  };

  const handleResetPlayerMarketImpact = () => {
    clearMarketImpacts();
    forceRefreshPrices();
  };

  const updateAmount = (symbol: string, val: number) => {
    setTradeAmount((prev) => ({ ...prev, [symbol]: val }));
  };

  if (!selectedShip) {
    return (
      <div className="pixel-box bg-slate-900 border-slate-700 p-6 text-center" dir="rtl">
        <AlertCircle size={32} className="mx-auto text-terminal-amber mb-2 animate-pulse" />
        <h3 className="font-bold text-slate-300 font-sans">هیچ سفینه‌ای به عنوان سفینه فرماندهی فعال انتخاب نشده است!</h3>
        <p className="text-xs text-slate-500 mt-1">جهت دسترسی به کاتالوگ و بازار تجارت ابتدا یک سفینه را در ناوگان فعال کنید.</p>
      </div>
    );
  }

  const isDocked = selectedShip.nav.status === 'DOCKED';

  if (!isDocked) {
    return (
      <div className="pixel-box bg-slate-900 border-slate-700 p-6 text-center" dir="rtl">
        <AlertCircle size={32} className="mx-auto text-terminal-amber mb-2" />
        <h3 className="font-bold text-slate-300 font-sans">سفینه فعال در مدار است و پهلو نگرفته است!</h3>
        <p className="text-xs text-slate-500 mt-1">
          برای برقراری اتصال با بازارگاه سیاره، ابتدا سفینه <span className="font-mono text-terminal-cyan font-bold">{selectedShip.symbol}</span> را در بخش کنترل عملیات ناوگان، در پایگاه <span className="font-mono text-slate-300 font-bold">{selectedShip.nav.waypointSymbol}</span> پهلو بدهید.
        </p>
      </div>
    );
  }

  if (!market || !market.tradeGoods || market.tradeGoods.length === 0) {
    return (
      <div className="pixel-box bg-slate-900 border-slate-700 p-6 text-center" dir="rtl">
        <Info size={32} className="mx-auto text-slate-500 mb-2" />
        <h3 className="font-bold text-slate-300 font-sans">خطای اتصال به کاتالوگ بازار محلی</h3>
        <p className="text-xs text-slate-500 mt-1">
          پایگاه فعلی شما فاقد بازار عمومی ثبت شده است یا کدهای تجاری آن در دسترس نیستند.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* 1. GALACTIC NEWS BROADCAST SYSTEM (Pixel-Art Radio Alert) */}
      <div className="pixel-box bg-slate-950 p-4 border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-start gap-3 text-right">
          <div className="p-2 bg-terminal-red/10 border border-terminal-red text-terminal-red flex items-center justify-center rounded-none shrink-0 relative">
            <Radio size={20} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-terminal-red"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] px-1 bg-terminal-red/20 text-terminal-red border border-terminal-red/30 font-bold font-sans">رادیو خبری کهکشان</span>
              <h4 className="text-xs font-bold text-slate-300 font-sans">رویداد فعال: <span className="text-terminal-amber font-bold">{activeEvent.title}</span></h4>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">
              {activeEvent.description}
            </p>
            <div className="text-[10px] text-terminal-green font-sans mt-1.5 flex items-center gap-1">
              <Sparkles size={10} />
              <span>{activeEvent.effectText}</span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={handleTriggerNewEvent}
            className="px-3 py-1.5 bg-slate-900 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-slate-950 text-xs font-sans font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="امواج رادیویی را برای یافتن گزارش‌های اقتصادی جدید تنظیم کنید"
          >
            <RefreshCw size={12} />
            <span>تنظیم سیگنال جدید</span>
          </button>

          <button
            onClick={handleResetPlayerMarketImpact}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 text-xs font-sans transition-all cursor-pointer flex items-center justify-center gap-1"
            title="برطرف کردن تاثیر معاملاتی انباشته شده بر بازار"
          >
            <span>پاکسازی اثر عرضه/تقاضا</span>
          </button>
        </div>
      </div>

      {/* 2. DOCKET SHIP INFO SUMMARY */}
      <div className="pixel-box bg-slate-950 p-3 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
        <div>
          <h4 className="text-xs font-bold text-slate-400 font-sans">پایگاه تجاری مستقر:</h4>
          <span className="font-mono text-sm font-bold text-terminal-cyan">{market.symbol}</span>
        </div>
        <div className="text-xs text-slate-300">
          سفینه متصل شده: <span className="font-mono text-terminal-cyan font-bold">{selectedShip.symbol}</span> (بار جاری: {selectedShip.cargo.units}/{selectedShip.cargo.capacity} واحد)
        </div>
      </div>

      {/* 3. DYNAMIC COMMODITY LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {market.tradeGoods.map((good) => {
          // Dynamic prices evaluation based on our dynamic engine
          const { price: buyPrice, explanation: buyExplanation, multiplier: buyMult } = 
            getDynamicPrice(good.symbol, good.purchasePrice, false);

          const { price: sellPrice, explanation: sellExplanation, multiplier: sellMult } = 
            getDynamicPrice(good.symbol, good.sellPrice, true);

          const amount = tradeAmount[good.symbol] || 1;

          // Check if ship is holding this item
          const shipCargoItem = selectedShip.cargo.inventory.find((i) => i.symbol === good.symbol);
          const shipHoldAmount = shipCargoItem ? shipCargoItem.units : 0;

          // Supply styling based on current calculated scarcity
          const supplyColor = 
            buyMult > 1.4 ? 'text-terminal-red border-terminal-red/30 bg-terminal-red/10' :
            buyMult < 0.85 ? 'text-terminal-green border-terminal-green/30 bg-terminal-green/10' :
            'text-terminal-cyan border-terminal-cyan/30 bg-terminal-cyan/10';

          const supplyTranslation = 
            buyMult > 1.4 ? 'تقاضای بسیار بالا (نایاب)' :
            buyMult < 0.85 ? 'عرضه فوق‌العاده بالا (فراوان)' :
            'تعادل نسبی عرضه و تقاضا';

          return (
            <div 
              key={good.symbol + '-' + marketRefreshKey} 
              className="pixel-box bg-slate-900 border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header item */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block">{good.symbol}</span>
                    <h5 className="text-sm font-bold text-slate-100 font-sans">
                      {translateCargoName(good.symbol, good.symbol)}
                    </h5>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 font-bold border font-sans rounded-none ${supplyColor}`}>
                    {supplyTranslation}
                  </span>
                </div>

                {/* Market Details (Explaining the Price Fluctuations) */}
                <div className="space-y-1 mb-2 text-[10px]">
                  {buyExplanation.map((expl, index) => (
                    <div key={index} className="text-slate-400 flex items-center gap-1 font-sans">
                      <span className="text-terminal-amber">⊙</span>
                      <span>{expl}</span>
                    </div>
                  ))}
                  {buyExplanation.length === 0 && (
                    <div className="text-slate-600 font-sans italic pr-1">
                      نوسان جزئی ناشی از چرخه ترانزیت روزانه پایگاه
                    </div>
                  )}
                </div>

                {/* Pricing / Holding */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-950/60 rounded border border-slate-850">
                  <div>
                    <span className="text-slate-500 text-[10px] block flex items-center justify-center gap-0.5">
                      <span>نرخ خرید</span>
                      {buyMult >= 1.05 ? (
                        <TrendingUp size={8} className="text-terminal-red" />
                      ) : buyMult <= 0.95 ? (
                        <TrendingDown size={8} className="text-terminal-green" />
                      ) : null}
                    </span>
                    <span className="font-mono text-terminal-amber font-bold">{buyPrice.toLocaleString()} ¤</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block flex items-center justify-center gap-0.5">
                      <span>نرخ فروش</span>
                      {sellMult >= 1.05 ? (
                        <TrendingUp size={8} className="text-terminal-green" />
                      ) : sellMult <= 0.95 ? (
                        <TrendingDown size={8} className="text-terminal-red" />
                      ) : null}
                    </span>
                    <span className="font-mono text-terminal-green font-bold">{sellPrice.toLocaleString()} ¤</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">در انبار شما</span>
                    <span className="font-mono text-slate-300 font-bold">{shipHoldAmount} واحد</span>
                  </div>
                </div>
              </div>

              {/* Trade Control Widget */}
              <div className="mt-4 pt-3 border-t border-slate-850">
                <div className="flex items-center justify-between gap-2">
                  {/* Selector count */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-slate-400">تعداد:</span>
                    <input
                      type="number"
                      min={1}
                      max={80}
                      value={amount}
                      onChange={(e) => updateAmount(good.symbol, Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 bg-slate-950 border border-slate-800 text-center text-xs p-1 text-slate-100 font-mono"
                    />
                  </div>

                  {/* Buy / Sell buttons */}
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={() => handleBuy(good.symbol)}
                      disabled={loading || actionLoading !== null}
                      className="flex-1 p-1.5 bg-terminal-amber/10 hover:bg-terminal-amber hover:text-slate-950 text-terminal-amber text-xs font-sans font-bold cursor-pointer border border-terminal-amber transition-all flex items-center justify-center gap-1"
                    >
                      {actionLoading === good.symbol + '-buy' ? 'خرید...' : 'خرید'}
                    </button>
                    <button
                      onClick={() => handleSell(good.symbol)}
                      disabled={loading || actionLoading !== null || shipHoldAmount < amount}
                      className={`flex-1 p-1.5 text-xs font-sans font-bold transition-all flex items-center justify-center gap-1 ${
                        shipHoldAmount >= amount
                          ? 'bg-terminal-green/10 hover:bg-terminal-green hover:text-slate-950 text-terminal-green cursor-pointer border border-terminal-green'
                          : 'bg-slate-950 text-slate-600 border border-slate-855 cursor-not-allowed'
                      }`}
                    >
                      {actionLoading === good.symbol + '-sell' ? 'فروش...' : 'فروش'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
