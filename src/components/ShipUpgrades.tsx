/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Zap, Shield, Database, ChevronRight, Play, Info, 
  Settings2, Activity, Lock, RefreshCw, Layers 
} from 'lucide-react';
import { Ship } from '../types';
import { 
  getShipUpgrades, 
  upgradeShipStat, 
  MAX_UPGRADE_LEVEL, 
  UPGRADE_COSTS, 
  getSupabaseSyncStatus,
  ShipUpgrades as ShipUpgradesType
} from '../utils/upgradeEngine';
import { translateCargoName, getShipNickname } from '../utils/api';

interface ShipUpgradesProps {
  ship: Ship | null;
  agentCredits: number;
  onUpgradeComplete: (costCredits: number) => void;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function ShipUpgrades({
  ship,
  agentCredits,
  onUpgradeComplete,
  addLog,
}: ShipUpgradesProps) {
  const [upgrades, setUpgrades] = useState<ShipUpgradesType | null>(null);
  const [syncStatus, setSyncStatus] = useState(getSupabaseSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeStatTab, setActiveStatTab] = useState<'speed' | 'cargo' | 'shield' | 'drill'>('speed');

  const [showHelp, setShowHelp] = useState(false);

  // Load upgrades when ship is selected or changed
  useEffect(() => {
    if (ship) {
      setUpgrades(getShipUpgrades(ship.symbol));
    } else {
      setUpgrades(null);
    }
  }, [ship]);

  const handleSyncDatabase = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus(getSupabaseSyncStatus());
      addLog('💾 پایگاه داده کهکشانی: تمام رکوردهای سفارشی‌سازی ناوگان فضایی همگام‌سازی و پایدار شدند.', 'success');
    }, 1200);
  };

  if (!ship) {
    return (
      <div className="pixel-box bg-slate-900 border-slate-700 p-8 text-center" dir="rtl">
        <Settings2 size={36} className="mx-auto text-terminal-cyan mb-2 animate-spin" />
        <h3 className="font-bold text-slate-300 font-sans">مرکز کالیبراسیون و ارتقای سفینه‌ها</h3>
        <p className="text-xs text-slate-500 mt-1">جهت ارتقاء موتور، محافظ پلاسما و مته کوانتومی ابتدا یک سفینه را فعال نمایید.</p>
      </div>
    );
  }

  const handleUpgrade = (stat: 'speed' | 'cargo' | 'shield' | 'drill') => {
    if (!upgrades) return;

    // Convert cargo to simple array for upgrade engine
    const formattedCargo = ship.cargo.inventory.map((item) => ({
      symbol: item.symbol,
      units: item.units,
    }));

    const result = upgradeShipStat(ship.symbol, stat, agentCredits, formattedCargo);

    if (result.success && result.newUpgrades) {
      setUpgrades(result.newUpgrades);
      setSyncStatus(getSupabaseSyncStatus());
      
      // Notify parent to subtract credits
      onUpgradeComplete(result.costCredits);

      const statPersianName = 
        stat === 'speed' ? 'پیشرانه هسته‌ای (سرعت)' :
        stat === 'cargo' ? 'محفظه کانتینری (گنجایش)' :
        stat === 'shield' ? 'سپر پلاسما (کاهش سوخت)' :
        'مته مغناطیسی (استخراج)';

      addLog(
        `🛠️ ارتقاء موفقیت‌آمیز: بخش ${statPersianName} سفینه ${ship.symbol} به سطح جدید ارتقا یافت!`, 
        'success'
      );
    } else {
      addLog(`⚠️ خطای کالیبراسیون ارتقا: ${result.error}`, 'error');
    }
  };

  const getLevelBlocks = (level: number) => {
    const blocks = [];
    for (let i = 1; i <= MAX_UPGRADE_LEVEL; i++) {
      if (i <= level) {
        blocks.push(<span key={i} className="w-4 h-4 bg-terminal-cyan border border-slate-950 inline-block"></span>);
      } else {
        blocks.push(<span key={i} className="w-4 h-4 bg-slate-950 border border-slate-800 inline-block"></span>);
      }
    }
    return <div className="flex gap-1">{blocks}</div>;
  };

  const currentLevel = upgrades ? (
    activeStatTab === 'speed' ? upgrades.speedLevel :
    activeStatTab === 'cargo' ? upgrades.cargoLevel :
    activeStatTab === 'shield' ? upgrades.shieldLevel :
    upgrades.drillLevel
  ) : 0;

  const cost = currentLevel < MAX_UPGRADE_LEVEL ? UPGRADE_COSTS[activeStatTab][currentLevel] : null;

  return (
    <div className="space-y-4" dir="rtl">
      {/* PERSISTENT DATABASE STATUS */}
      <div className="pixel-box bg-slate-950 p-4 border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Database size={24} className="text-terminal-green animate-pulse" />
          <div className="text-right">
            <h4 className="text-xs font-bold text-slate-400 font-sans flex items-center gap-1.5">
              <span>سامانه ذخیره‌سازی پایگاه‌داده کهکشانی</span>
              <span className="inline-flex h-2 w-2 rounded-full bg-terminal-green animate-ping"></span>
              <span className="text-[10px] text-terminal-green font-sans font-bold">برخط</span>
            </h4>
            <p className="text-[10px] text-slate-500 font-sans">
              هسته اطلاعاتی: <span className="font-mono text-slate-400">{syncStatus.table}</span> | همگام‌سازی: {syncStatus.lastSync}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          {/* INTERACTIVE HINT BUTTON "?" */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="h-8 w-8 bg-slate-900 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-slate-950 font-bold font-mono text-sm cursor-pointer transition-all flex items-center justify-center"
            title="راهنمای کالیبراسیون و ارتقا"
          >
            ؟
          </button>

          <button
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-slate-900 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-slate-950 text-xs font-sans font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'در حال ارسال کوئری...' : 'همگام‌سازی اطلاعات'}</span>
          </button>
        </div>
      </div>

      {/* TUTORIAL BOX */}
      {showHelp && (
        <div className="pixel-box bg-slate-950 border-terminal-amber p-4 text-right space-y-2 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-terminal-amber font-sans">دفترچه راهنمای کالیبره و شخصی‌سازی (تکنیسین فدراسیون)</span>
            <button 
              onClick={() => setShowHelp(false)}
              className="text-slate-500 hover:text-slate-300 text-xs font-bold"
            >
              [بستن ✕]
            </button>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-sans">
            <p>
              به بخش <span className="text-terminal-cyan font-bold">مهندسی و کالیبراسیون ناوگان</span> خوش آمدید! در این بخش می‌توانید مشخصات عملیاتی هر یک از سفینه‌های خود را ارتقا دهید:
            </p>
            <ul className="list-disc pr-4 space-y-1 text-slate-400">
              <li>
                <span className="text-terminal-cyan font-bold">پیشرانه سرعت:</span> کاهش زمان سفر بین ایستگاه‌ها (هر سطح ارتقاء ۱۰٪ زمان سفر کل را کاهش می‌دهد).
              </li>
              <li>
                <span className="text-terminal-amber font-bold">کانتینر باربری:</span> گنجایش اضافی برای انبار کردن کالاها (هر سطح ارتقاء ۵ واحد کانتینر اضافه می‌کند).
              </li>
              <li>
                <span className="text-terminal-green font-bold">سپر و مهار سوخت:</span> صرفه‌جویی در جیره سوخت مصرفی سفینه (هر سطح ارتقاء ۱۰٪ راندمان را افزایش می‌دهد).
              </li>
              <li>
                <span className="text-terminal-cyan font-bold">مته مغناطیسی:</span> استخراج سریع‌تر سیارک‌ها و دریافت پاداش اعتباری (Credits) اضافی به ازای استخراج.
              </li>
            </ul>
            <p className="text-[11px] text-terminal-amber/90">
              💡 <span className="font-bold">نکته حیاتی:</span> سطوح بالاتر کالیبراسیون علاوه بر کوین‌های اعتباری، به <span className="text-slate-200 underline">کانی‌های استخراج شده یا کالاهای تهیه شده از بازار</span> (مانند سنگ‌آهن، سنگ‌مس، پلاتین، کوارتز، قطعات الکترونیکی و...) که داخل کانتینر همان سفینه بارگیری شده باشند، نیاز دارند!
            </p>
          </div>
        </div>
      )}

      {/* COMPONENT TITLE & RETRO SPACESHIP DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Schematic Layout (Visual ASCII Pixel-art) */}
        <div className="pixel-box bg-slate-900/90 border-slate-800 p-4 flex flex-col justify-between items-center text-center lg:col-span-1">
          <div>
            <span className="text-[10px] text-slate-500 font-mono block">شناسه نقشه فنی: ST-{ship.symbol.slice(-4)}</span>
            <h4 className="text-xs font-bold text-slate-300 font-sans mt-0.5">نقشه سخت‌افزاری کالیبره</h4>
          </div>
          
          {/* Spaceship ASCII Art */}
          <pre className="font-mono text-[9px] text-terminal-cyan leading-none my-4 tracking-tighter">
{`      /\\
     /  \\
    |    |
   /|    |\\
  / |====| \\
 |  |    |  |
 |  |    |  |
/   | || |   \\
|  /  ||  \\  |
| /   ||   \\ |
|/ ___||___ \\|
   [WWWWWW]
  / / || \\ \\
 /_/  ||  \\_\\`}
          </pre>

          <div className="w-full space-y-1">
            <div className="text-[10px] text-slate-400 font-sans">مشخصات سفینه:</div>
            <div className="bg-slate-950 py-1.5 px-2 border border-slate-850 rounded text-xs flex justify-between font-mono">
              <span className="text-slate-500">کد ثبتی</span>
              <span className="text-terminal-cyan font-bold">{ship.symbol}</span>
            </div>
            {getShipNickname(ship.symbol) && (
              <div className="bg-slate-950 py-1.5 px-2 border border-slate-850 rounded text-xs flex justify-between font-sans">
                <span className="text-slate-500">لقب ترانسپوندر</span>
                <span className="text-terminal-amber font-bold">{getShipNickname(ship.symbol)}</span>
              </div>
            )}
            <div className="bg-slate-950 py-1.5 px-2 border border-slate-850 rounded text-xs flex justify-between font-mono">
              <span className="text-slate-500">ظرفیت بارگیری</span>
              <span className="text-terminal-amber font-bold">{ship.cargo.capacity} (+{(upgrades?.cargoLevel || 0) * 5}) واحد</span>
            </div>
          </div>
        </div>

        {/* UPGRADES PANEL */}
        <div className="pixel-box bg-slate-900 border-slate-800 p-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            {/* Stat selector tabs */}
            <div className="flex border-b border-slate-800 pb-2 mb-4 gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveStatTab('speed')}
                className={`py-1.5 px-2.5 text-xs font-bold font-sans transition-all cursor-pointer ${
                  activeStatTab === 'speed' ? 'bg-terminal-cyan text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                پیشرانه سرعت
              </button>
              <button
                onClick={() => setActiveStatTab('cargo')}
                className={`py-1.5 px-2.5 text-xs font-bold font-sans transition-all cursor-pointer ${
                  activeStatTab === 'cargo' ? 'bg-terminal-cyan text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                کانتینر باربری
              </button>
              <button
                onClick={() => setActiveStatTab('shield')}
                className={`py-1.5 px-2.5 text-xs font-bold font-sans transition-all cursor-pointer ${
                  activeStatTab === 'shield' ? 'bg-terminal-cyan text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                سپر و مهار سوخت
              </button>
              <button
                onClick={() => setActiveStatTab('drill')}
                className={`py-1.5 px-2.5 text-xs font-bold font-sans transition-all cursor-pointer ${
                  activeStatTab === 'drill' ? 'bg-terminal-cyan text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                مته مغناطیسی
              </button>
            </div>

            {/* Selected Upgrade details */}
            {activeStatTab === 'speed' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Zap className="text-terminal-cyan" size={16} />
                    <span>موتور پیشرانه کلاس هسته‌ای یونی</span>
                  </h4>
                  {upgrades && getLevelBlocks(upgrades.speedLevel)}
                </div>
                <p className="text-xs text-slate-400">
                  فرکانس امواج یونی را تقویت می‌کند تا رانش فوق‌سنگین ایجاد کند. هر ارتقای موتور با کوتاه کردن خنک‌سازی و کاهش ۱۰ درصدی زمان ترانزیت، مدت پروازهای شما در خلاء کهکشانی را کاهش می‌دهد.
                </p>
                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-850 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">سطح موتور پیشرانه:</span>
                    <span className="font-mono text-slate-300">سطح {upgrades?.speedLevel || 0} / {MAX_UPGRADE_LEVEL}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">کاهش زمان مسافرت فضایی:</span>
                    <span className="font-mono text-terminal-green font-bold">-{(upgrades?.speedLevel || 0) * 10}٪ زمان کل سفر</span>
                  </div>
                </div>
              </div>
            )}

            {activeStatTab === 'cargo' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Layers className="text-terminal-amber" size={16} />
                    <span>محفظه باربری انبساط فضا-زمان هایپر</span>
                  </h4>
                  {upgrades && getLevelBlocks(upgrades.cargoLevel)}
                </div>
                <p className="text-xs text-slate-400">
                  دیواره‌های مخازن را با تکنولوژی عایق مگنتی فشرده می‌کند تا ابعاد داخلی بزرگتر شود. هر ارتقای مخزن به میزان ۵ واحد بر حجم بارگذاری کانتینری سفینه می‌افزاید.
                </p>
                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-850 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">سطح عایق کانتینر:</span>
                    <span className="font-mono text-slate-300">سطح {upgrades?.cargoLevel || 0} / {MAX_UPGRADE_LEVEL}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">گنجایش اضافی فعال:</span>
                    <span className="font-mono text-terminal-amber font-bold">+{(upgrades?.cargoLevel || 0) * 5} واحد کالا</span>
                  </div>
                </div>
              </div>
            )}

            {activeStatTab === 'shield' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Shield className="text-terminal-green" size={16} />
                    <span>هسته سپر مدولاتور پلاسما و مهار سوخت</span>
                  </h4>
                  {upgrades && getLevelBlocks(upgrades.shieldLevel)}
                </div>
                <p className="text-xs text-slate-400">
                  یک هاله مغناطیسی پایدار اطراف محفظه احتراق و لوله‌های پیشران ایجاد می‌کند که مقاومت حرارتی را تا بی‌نهایت بالا می‌برد. هر سطح ارتقاء باعث صرفه‌جویی ۱۰ درصدی در مصرف سوخت سفینه هنگام پرواز می‌شود.
                </p>
                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-850 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">سطح راکتور محافظ:</span>
                    <span className="font-mono text-slate-300">سطح {upgrades?.shieldLevel || 0} / {MAX_UPGRADE_LEVEL}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">بهره‌وری مهار سوخت:</span>
                    <span className="font-mono text-terminal-green font-bold">+{(upgrades?.shieldLevel || 0) * 10}٪ صرفه‌جویی سوخت</span>
                  </div>
                </div>
              </div>
            )}

            {activeStatTab === 'drill' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Activity className="text-terminal-cyan" size={16} />
                    <span>مته مغناطیسی کوانتومی ضربه‌زن لرزشی</span>
                  </h4>
                  {upgrades && getLevelBlocks(upgrades.drillLevel)}
                </div>
                <p className="text-xs text-slate-400">
                  مته‌های استخراج کلوخه‌ای معمولی را با پرتو لرزشی فوتونی تعویض می‌کند تا به سرعت سخت‌ترین کانی‌ها را به ذرات بارگیری تبدیل کند. هر سطح باعث برداشت اضافی سنگ‌آهن و پلاتین (+۲ واحد در هر استخراج) می‌شود.
                </p>
                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-850 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">سطح فرستنده مته فوتونی:</span>
                    <span className="font-mono text-slate-300">سطح {upgrades?.drillLevel || 0} / {MAX_UPGRADE_LEVEL}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">بهره‌وری استخراج سیارک:</span>
                    <span className="font-mono text-terminal-cyan font-bold">+{(upgrades?.drillLevel || 0) * 2} واحد کالا در هر حفاری</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COST & PURCHASE ACTIONS */}
          <div className="mt-6 pt-4 border-t border-slate-850">
            {currentLevel >= MAX_UPGRADE_LEVEL ? (
              <div className="bg-terminal-green/5 border border-terminal-green/30 p-3 text-center text-xs text-terminal-green flex items-center justify-center gap-1.5">
                <Lock size={14} />
                <span>تبریک خلبان! این ماژول به بالاترین سطح فناوری ارتقاء (سطح ۵) رسیده است.</span>
              </div>
            ) : cost ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">مواد و اعتبارات مورد نیاز برای کالیبره به سطح {currentLevel + 1}:</div>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Costs */}
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-slate-950 px-3 py-1.5 border border-slate-800 flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500">کوین اعتباری:</span>
                      <span className={`font-mono text-xs font-bold ${agentCredits >= cost.credits ? 'text-terminal-green' : 'text-terminal-red'}`}>
                        {cost.credits.toLocaleString()} / {agentCredits.toLocaleString()} ¤
                      </span>
                    </div>

                    {cost.resources.map((res) => {
                      const inventoryCount = ship.cargo.inventory.find((i) => i.symbol === res.symbol)?.units || 0;
                      const hasEnough = inventoryCount >= res.quantity;

                      return (
                        <div key={res.symbol} className="bg-slate-950 px-3 py-1.5 border border-slate-800 flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">{translateCargoName(res.symbol, res.symbol)}:</span>
                          <span className={`font-mono text-xs font-bold ${hasEnough ? 'text-terminal-cyan' : 'text-terminal-red'}`}>
                            {inventoryCount} / {res.quantity} واحد
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handleUpgrade(activeStatTab)}
                    className="py-2 px-5 bg-terminal-cyan hover:bg-terminal-cyan/95 text-slate-950 font-bold font-sans text-xs cursor-pointer border-2 border-slate-950 shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all shrink-0"
                  >
                    شروع ارتقای سخت‌افزاری ⚙️
                  </button>
                </div>
              </div>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
}
