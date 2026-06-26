/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Navigation, Anchor, BatteryCharging, Zap, Shield, 
  ChevronDown, ChevronUp, Hammer, Database, Layers, Radio
} from 'lucide-react';
import { Ship } from '../types';
import { translateShipRole, translateCargoName } from '../utils/api';

interface FleetCommandProps {
  ships: Ship[];
  loading: boolean;
  onDock: (shipSymbol: string) => Promise<void>;
  onOrbit: (shipSymbol: string) => Promise<void>;
  onRefuel: (shipSymbol: string) => Promise<void>;
  onExtract: (shipSymbol: string) => Promise<void>;
  onSelectShip: (shipSymbol: string) => void;
  selectedShipSymbol: string;
}

export default function FleetCommand({
  ships,
  loading,
  onDock,
  onOrbit,
  onRefuel,
  onExtract,
  onSelectShip,
  selectedShipSymbol,
}: FleetCommandProps) {
  const [expandedShip, setExpandedShip] = useState<string | null>(null);
  const [timers, setTimers] = useState<{ [key: string]: number }>({});
  const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Initialize and run countdown timers for ships in transit and on cooldown
  useEffect(() => {
    const initialTimers: { [key: string]: number } = {};
    const initialCooldowns: { [key: string]: number } = {};

    ships.forEach((ship) => {
      // Transit Countdown
      if (ship.nav.status === 'IN_TRANSIT') {
        const arrival = new Date(ship.nav.route.arrivalTime).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((arrival - now) / 1000));
        if (diff > 0) {
          initialTimers[ship.symbol] = diff;
        }
      }

      // Cooldown Countdown
      if (ship.cooldown && ship.cooldown.remainingSeconds > 0) {
        initialCooldowns[ship.symbol] = ship.cooldown.remainingSeconds;
      }
    });

    setTimers(initialTimers);
    setCooldowns(initialCooldowns);

    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach((key) => {
          if (next[key] > 0) {
            next[key] -= 1;
            updated = true;
          } else {
            delete next[key];
          }
        });
        return updated ? next : prev;
      });

      setCooldowns((prev) => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach((key) => {
          if (next[key] > 0) {
            next[key] -= 1;
            updated = true;
          } else {
            delete next[key];
          }
        });
        return updated ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ships]);

  const handleDock = async (symbol: string) => {
    setActionLoading(symbol + '-dock');
    try {
      await onDock(symbol);
    } catch (e) {}
    setActionLoading(null);
  };

  const handleOrbit = async (symbol: string) => {
    setActionLoading(symbol + '-orbit');
    try {
      await onOrbit(symbol);
    } catch (e) {}
    setActionLoading(null);
  };

  const handleRefuel = async (symbol: string) => {
    setActionLoading(symbol + '-refuel');
    try {
      await onRefuel(symbol);
    } catch (e) {}
    setActionLoading(null);
  };

  const handleExtract = async (symbol: string) => {
    setActionLoading(symbol + '-extract');
    try {
      await onExtract(symbol);
    } catch (e) {}
    setActionLoading(null);
  };

  if (ships.length === 0) {
    return (
      <div className="pixel-box bg-slate-900 border-slate-700 p-6 text-center" dir="rtl">
        <Database size={32} className="mx-auto text-slate-500 mb-2" />
        <h3 className="font-bold text-slate-300 font-sans">هیچ سفینه‌ای در ناوگان یافت نشد</h3>
        <p className="text-xs text-slate-500 mt-1">منتظر راه‌اندازی فرستنده‌های مأموریت اولیه فدراسیون تجارت آزاد...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      {ships.map((ship) => {
        const isSelected = selectedShipSymbol === ship.symbol;
        const isExpanded = expandedShip === ship.symbol;
        const transitSeconds = timers[ship.symbol] || 0;
        const cooldownSeconds = cooldowns[ship.symbol] || 0;

        // Progress bar percentage calculations
        const fuelPercent = Math.min(100, Math.max(0, (ship.fuel.current / (ship.fuel.capacity || 1)) * 100));
        const cargoPercent = Math.min(100, Math.max(0, (ship.cargo.units / (ship.cargo.capacity || 1)) * 100));

        return (
          <div
            key={ship.symbol}
            className={`pixel-box bg-slate-900 border-slate-700 p-4 transition-all duration-200 ${
              isSelected ? 'border-terminal-cyan ring-1 ring-terminal-cyan/20' : 'hover:border-slate-500'
            }`}
          >
            {/* Header / Summary row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Click target to select ship */}
              <div 
                onClick={() => onSelectShip(ship.symbol)}
                className="flex items-center gap-3 cursor-pointer flex-1 text-right"
              >
                <div className="w-10 h-10 rounded-none bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shrink-0">
                  {ship.registration.role === 'COMMAND' ? '🛸' : '🚜'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-100">{ship.symbol}</span>
                    <span className="text-[9px] px-1 bg-slate-800 text-slate-400 font-sans">
                      {translateShipRole(ship.registration.role)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>موقعیت فعلی:</span>
                    <span className="font-mono text-terminal-cyan text-[11px]">{ship.nav.waypointSymbol}</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator & Quick Badges */}
              <div className="flex items-center gap-2 flex-wrap md:flex-nowrap justify-end">
                {transitSeconds > 0 ? (
                  <span className="text-xs bg-terminal-amber/10 text-terminal-amber border border-terminal-amber/20 px-2.5 py-1 flex items-center gap-1 font-mono rounded">
                    <Navigation size={12} className="animate-spin" />
                    <span>در حرکت ({transitSeconds}s)</span>
                  </span>
                ) : ship.nav.status === 'DOCKED' ? (
                  <span className="text-xs bg-terminal-green/10 text-terminal-green border border-terminal-green/20 px-2.5 py-1 flex items-center gap-1 font-sans rounded">
                    <Anchor size={12} />
                    <span>پهلو گرفته در بندر</span>
                  </span>
                ) : (
                  <span className="text-xs bg-terminal-cyan/10 text-terminal-cyan border border-terminal-cyan/20 px-2.5 py-1 flex items-center gap-1 font-sans rounded">
                    <Radio size={12} className="animate-pulse" />
                    <span>در حال مدارگردی</span>
                  </span>
                )}

                {cooldownSeconds > 0 && (
                  <span className="text-xs bg-terminal-red/10 text-terminal-red border border-terminal-red/20 px-2 py-1 flex items-center gap-1 font-mono rounded">
                    <Zap size={11} className="text-terminal-red animate-pulse" />
                    <span>سرمایش ({cooldownSeconds}s)</span>
                  </span>
                )}

                {/* Selection indicator */}
                <button
                  onClick={() => onSelectShip(ship.symbol)}
                  className={`px-3 py-1 text-xs font-bold font-sans rounded cursor-pointer transition-colors ${
                    isSelected ? 'bg-terminal-cyan text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {isSelected ? 'سفینه فعال' : 'انتخاب'}
                </button>

                {/* Expand toggler */}
                <button
                  onClick={() => setExpandedShip(isExpanded ? null : ship.symbol)}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Quick status progress bars */}
            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-850">
              {/* Fuel Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>سوخت فضایی</span>
                  <span className="font-mono text-slate-300">{ship.fuel.current} / {ship.fuel.capacity}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 border border-slate-800 rounded-none overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${fuelPercent < 25 ? 'bg-terminal-red' : 'bg-terminal-cyan'}`}
                    style={{ width: `${fuelPercent}%` }}
                  />
                </div>
              </div>

              {/* Cargo Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>مخزن بارگیری کالا</span>
                  <span className="font-mono text-slate-300">{ship.cargo.units} / {ship.cargo.capacity}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 border border-slate-800 rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-terminal-amber transition-all duration-300"
                    style={{ width: `${cargoPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Expanded Detailed Panel */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
                {/* Inventory List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
                    <Layers size={12} className="text-terminal-amber" />
                    <span>محتویات انبار کانتینرها</span>
                  </h4>
                  {ship.cargo.inventory.length === 0 ? (
                    <p className="text-xs text-slate-500 italic pr-2">هیچ کالایی در مخزن بارگیری موجود نیست.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ship.cargo.inventory.map((item) => (
                        <div key={item.symbol} className="bg-slate-950/80 p-2 border border-slate-850 flex items-center justify-between rounded font-mono text-xs">
                          <div className="text-right">
                            <span className="text-slate-200 font-sans block">{translateCargoName(item.symbol, item.name)}</span>
                            <span className="text-[10px] text-slate-500">{item.symbol}</span>
                          </div>
                          <span className="text-terminal-amber font-bold text-sm">{item.units} واحد</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operations Commands */}
                <div className="bg-slate-950 p-3 border border-slate-850 rounded">
                  <h4 className="text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-1 font-sans">
                    <Shield size={12} className="text-terminal-cyan" />
                    <span>مرکز فرماندهی مانور و کنترل عملیاتی</span>
                  </h4>

                  {transitSeconds > 0 ? (
                    <p className="text-xs text-terminal-amber animate-pulse">
                      ⚠️ سفینه در حال ناوبری است. پس از اتمام مسافرت فضایی، منوی فرامین پهلوگیری و استخراج باز می‌شود.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Dock / Orbit toggle */}
                      {ship.nav.status === 'DOCKED' ? (
                        <button
                          onClick={() => handleOrbit(ship.symbol)}
                          disabled={loading || actionLoading !== null}
                          className="p-2 bg-slate-900 border border-terminal-cyan/50 hover:bg-terminal-cyan/10 text-terminal-cyan text-xs font-sans font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                        >
                          <Navigation size={12} />
                          <span>ورود به مدار (Orbit)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDock(ship.symbol)}
                          disabled={loading || actionLoading !== null}
                          className="p-2 bg-slate-900 border border-terminal-green/50 hover:bg-terminal-green/10 text-terminal-green text-xs font-sans font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                        >
                          <Anchor size={12} />
                          <span>پهلوگیری در بندرگاه</span>
                        </button>
                      )}

                      {/* Refuel Button */}
                      <button
                        onClick={() => handleRefuel(ship.symbol)}
                        disabled={loading || actionLoading !== null || ship.nav.status !== 'DOCKED'}
                        className={`p-2 border text-xs font-sans font-bold transition-all flex items-center justify-center gap-1 ${
                          ship.nav.status === 'DOCKED'
                            ? 'bg-slate-900 border-terminal-amber/60 hover:bg-terminal-amber/10 text-terminal-amber cursor-pointer'
                            : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                        title="تنها در بندرگاه کالاها امکان سوخت‌گیری وجود دارد"
                      >
                        <BatteryCharging size={12} />
                        <span>سوخت‌گیری مجدد</span>
                      </button>

                      {/* Mine/Extract (Asteroid exclusive) */}
                      <button
                        onClick={() => handleExtract(ship.symbol)}
                        disabled={loading || actionLoading !== null || ship.nav.status !== 'IN_ORBIT' || cooldownSeconds > 0}
                        className={`p-2 border text-xs font-sans font-bold transition-all flex items-center justify-center gap-1 ${
                          ship.nav.status === 'IN_ORBIT' && cooldownSeconds === 0
                            ? 'bg-slate-900 border-terminal-green hover:bg-terminal-green/10 text-terminal-green cursor-pointer'
                            : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                        title="تنها در مدار کمربند‌های سیارکی استخراج فعال می‌شود"
                      >
                        <Hammer size={12} />
                        <span>استخراج سیارک ☄️</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
