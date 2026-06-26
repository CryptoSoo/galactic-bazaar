/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Compass, Info, MapPin, Eye, Zap, Landmark, ShoppingBag, Radio } from 'lucide-react';
import { Waypoint, Ship } from '../types';
import { translateWaypointType, getWaypointPersianName, getShipNickname, translateTraitName } from '../utils/api';

interface SystemMapProps {
  waypoints: Waypoint[];
  ships: Ship[];
  loading: boolean;
  onNavigate: (shipSymbol: string, waypointSymbol: string) => Promise<void>;
}

export default function SystemMap({ waypoints, ships, loading, onNavigate }: SystemMapProps) {
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [selectedShipSymbol, setSelectedShipSymbol] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState(false);

  // Filter out unique systems or system name
  const systemName = waypoints[0]?.symbol.split('-').slice(0, 2).join('-') || 'منظومه محلی';

  const handleNavigate = async () => {
    if (!selectedShipSymbol || !selectedWaypoint) return;
    setActionLoading(true);
    try {
      await onNavigate(selectedShipSymbol, selectedWaypoint.symbol);
    } catch (e) {
      // handled globally in App
    } finally {
      setActionLoading(false);
    }
  };

  // Get symbol/icon representation for waypoint type
  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'PLANET': return '🪐';
      case 'GAS_GIANT': return '🪐';
      case 'MOON': return '🌑';
      case 'ASTEROID_FIELD': return '☄️';
      case 'ORBITAL_STATION': return '🛰️';
      case 'JUMP_GATE': return '🌀';
      default: return '📍';
    }
  };

  // Min and max coordinate calculations to scale coordinates into a radar-box
  const padding = 20;
  const xCoords = waypoints.map((w) => w.x);
  const yCoords = waypoints.map((w) => w.y);
  const minX = Math.min(...xCoords, -50);
  const maxX = Math.max(...xCoords, 50);
  const minY = Math.min(...yCoords, -50);
  const maxY = Math.max(...yCoords, 50);

  const getRelativePosition = (x: number, y: number) => {
    const scaleX = (x - minX) / (maxX - minX || 1);
    const scaleY = (y - minY) / (maxY - minY || 1);
    // return values in percentage for absolute placement (from 10% to 90% to avoid edge cutoff)
    return {
      left: `${10 + scaleX * 80}%`,
      bottom: `${10 + scaleY * 80}%`,
    };
  };

  // Find which ships are currently at this waypoint
  const getShipsAtWaypoint = (waypointSymbol: string) => {
    return ships.filter((ship) => ship.nav.waypointSymbol === waypointSymbol && ship.nav.status !== 'IN_TRANSIT');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" dir="rtl">
      {/* Visual Radar Map Grid */}
      <div className="lg:col-span-2 pixel-box bg-slate-950 p-4 flex flex-col h-[400px] relative overflow-hidden border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 z-10">
          <div className="flex items-center gap-2 text-terminal-cyan">
            <Compass size={18} className="animate-spin" />
            <h3 className="font-bold font-sans text-sm">رادار ناوبری منظومه: <span className="font-mono text-xs">{systemName}</span></h3>
          </div>
          
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="h-6 w-6 bg-slate-900 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-slate-950 font-bold text-xs cursor-pointer transition-all flex items-center justify-center rounded-none"
              title="راهنمای ناوبری و رادار"
            >
              ؟
            </button>
            <span className="text-[9px] font-mono text-slate-500">HOLOMAP GRID v2.4</span>
          </div>
        </div>

        {/* TUTORIAL BOX */}
        {showHelp && (
          <div className="pixel-box bg-slate-950 border-terminal-amber p-4 text-right space-y-2 mb-2 z-20 overflow-y-auto max-h-[300px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-terminal-amber font-sans">دفترچه فرکانس ناوبری کهکشانی (سیستم خلبانی خودکار)</span>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-slate-500 hover:text-slate-300 text-xs font-bold"
              >
                [بستن ✕]
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-sans">
              <p>
                به <span className="text-terminal-cyan font-bold">بخش برنامه‌ریزی ناوبری فضا-زمان</span> خوش آمدید! در این بخش می‌توانید فاصله نقاط منظومه را روی هولوگرام راداری سنجیده و سفینه‌های خود را گسیل کنید:
              </p>
              <ul className="list-disc pr-4 space-y-1 text-slate-400">
                <li>
                  <span className="text-terminal-cyan font-bold">رادار موقعیت‌یاب:</span> نقاط روی نقشه نشان‌دهنده سیارات (🪐)، قمرها (🌑)، کمربندهای سیارکی (☄️) و ایستگاه‌های مداری (🛰️) هستند.
                </li>
                <li>
                  <span className="text-terminal-amber font-bold">انتخاب ایستگاه:</span> با کلیک بر روی هر نقطه در رادار، شناسنامه، مختصات موقعیتی، لیست سفینه‌های مستقر و کدهای تراکنش بازار و کشتی‌سازی آن نقطه فاش خواهد شد.
                </li>
                <li>
                  <span className="text-terminal-green font-bold">پرواز فضایی و ناوبری:</span> پس از انتخاب نقطه مقصد، یکی از سفینه‌های خود را در نوار برنامه‌ریزی پایینی انتخاب کرده و دکمه <span className="text-slate-200">پرواز فضایی</span> را بفشارید. دقت کنید که سفینه نباید در وضعیت پهلو گرفته باشد و سوخت کافی در اختیار داشته باشد.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* The Radar Grid Box */}
        <div className="flex-1 w-full bg-slate-900/40 relative border border-slate-800/80 rounded-sm">
          {/* Radar Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-dashed border-terminal-cyan/5 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-dashed border-terminal-cyan/5 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] border border-dashed border-terminal-cyan/5 rounded-full pointer-events-none" />
          {/* Axis lines */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-800/30 pointer-events-none" />
          <div className="absolute left-1/2 top-0 w-[1px] h-full bg-slate-800/30 pointer-events-none" />

          {/* Render Waypoints as interactive radar dots */}
          {waypoints.map((waypoint) => {
            const pos = getRelativePosition(waypoint.x, waypoint.y);
            const isSelected = selectedWaypoint?.symbol === waypoint.symbol;
            const shipsCount = getShipsAtWaypoint(waypoint.symbol).length;
            const hasMarket = waypoint.traits.some((t) => t.symbol === 'MARKETPLACE');
            const hasShipyard = waypoint.traits.some((t) => t.symbol === 'SHIPYARD');

            return (
              <button
                key={waypoint.symbol}
                onClick={() => setSelectedWaypoint(waypoint)}
                className="absolute -translate-x-1/2 translate-y-1/2 cursor-pointer group transition-all z-10"
                style={{ left: pos.left, bottom: pos.bottom }}
              >
                {/* Node icon & label */}
                <div className="relative flex flex-col items-center">
                  {/* Ships presence indicator beacon */}
                  {shipsCount > 0 && (
                    <div className="absolute -top-3 w-4 h-4 bg-terminal-cyan/20 border border-terminal-cyan rounded-full animate-ping pointer-events-none" />
                  )}

                  <span className={`text-lg p-1 rounded-full transition-all duration-200 ${
                    isSelected ? 'scale-125 filter drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] bg-slate-800 border-2 border-terminal-cyan' : 'hover:scale-110'
                  }`}>
                    {getWaypointIcon(waypoint.type)}
                  </span>

                  {/* Tiny text identifier */}
                  <span className={`text-[8px] font-mono mt-0.5 px-1 ${
                    isSelected ? 'text-terminal-cyan font-bold bg-slate-900 border border-terminal-cyan/30' : 'text-slate-400 group-hover:text-slate-200 bg-slate-950/80 rounded'
                  }`}>
                    {waypoint.symbol.split('-').pop()}
                  </span>

                  {/* Presence badges */}
                  <div className="absolute -top-2 flex gap-0.5">
                    {hasMarket && <span className="text-[7px] bg-amber-500/80 text-slate-950 px-0.5 rounded-sm">M</span>}
                    {hasShipyard && <span className="text-[7px] bg-cyan-500/80 text-slate-950 px-0.5 rounded-sm">S</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-500 mt-2 text-center font-sans">
          💡 برای مشاهده جزئیات بیشتر و پهلوگیری سفینه‌ها، روی آیکون‌های بالا کلیک کنید.
        </p>
      </div>

      {/* Info and Navigation panel */}
      <div className="pixel-box bg-slate-900 border-slate-700 p-4 flex flex-col justify-between h-[400px]">
        {selectedWaypoint ? (
          <div className="flex-1 flex flex-col justify-between">
            {/* Top Details */}
            <div className="space-y-3">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] text-terminal-cyan font-mono block tracking-wider" dir="ltr">
                  {selectedWaypoint.symbol}
                </span>
                <h4 className="text-base font-bold text-slate-100 flex flex-col font-sans mt-0.5">
                  <span className="flex items-center gap-1.5">
                    <span>{getWaypointIcon(selectedWaypoint.type)}</span>
                    <span>{translateWaypointType(selectedWaypoint.type)}</span>
                  </span>
                  <span className="text-xs text-terminal-amber mt-1 leading-normal font-sans">
                    {getWaypointPersianName(selectedWaypoint.symbol, selectedWaypoint.type)}
                  </span>
                </h4>
              </div>

              {/* Coordinates and position */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 border border-slate-800 rounded font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">موقعیت X</span>
                  <span className="text-slate-300 font-bold">{selectedWaypoint.x}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">موقعیت Y</span>
                  <span className="text-slate-300 font-bold">{selectedWaypoint.y}</span>
                </div>
              </div>

              {/* Traits list */}
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">ویژگی‌های پایگاه:</span>
                {selectedWaypoint.traits.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">هیچ جزئیات ویژه‌ای ثبت نشده است.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedWaypoint.traits.map((trait) => (
                      <span
                        key={trait.symbol}
                        className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 flex items-center gap-1 rounded"
                        title={trait.description}
                      >
                        {trait.symbol === 'MARKETPLACE' && <ShoppingBag size={10} className="text-terminal-amber" />}
                        {trait.symbol === 'SHIPYARD' && <Landmark size={10} className="text-terminal-cyan" />}
                        {trait.symbol === 'OUTPOST' && <Radio size={10} className="text-terminal-green" />}
                        <span>{translateTraitName(trait.symbol, trait.name)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ships present */}
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">سفینه‌های مستقر:</span>
                {getShipsAtWaypoint(selectedWaypoint.symbol).length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">هیچ سفینه‌ای در حال حاضر در این نقطه پهلو نگرفته است.</p>
                ) : (
                  <div className="space-y-1">
                    {getShipsAtWaypoint(selectedWaypoint.symbol).map((ship) => {
                      const nickname = getShipNickname(ship.symbol);
                      return (
                        <div key={ship.symbol} className="text-xs bg-slate-950/60 p-1.5 border border-slate-850 flex items-center justify-between font-mono">
                          <div className="flex flex-col text-right">
                            <span className="text-terminal-cyan font-bold">{ship.symbol}</span>
                            {nickname && (
                              <span className="text-[10px] text-terminal-amber font-sans">({nickname})</span>
                            )}
                          </div>
                          <span className="text-[10px] px-1 bg-terminal-cyan/10 text-terminal-cyan border border-terminal-cyan/20">
                            {ship.nav.status === 'DOCKED' ? 'پهلو گرفته' : 'مدار'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Course Plotter / Navigation command */}
            <div className="border-t border-slate-800 pt-3 mt-3">
              <h5 className="text-xs font-bold text-slate-400 mb-2 font-sans flex items-center gap-1">
                <Zap size={12} className="text-terminal-cyan" />
                <span>برنامه‌ریزی کورس ناوبری</span>
              </h5>

              {ships.filter(s => s.nav.status !== 'IN_TRANSIT' && s.nav.waypointSymbol !== selectedWaypoint.symbol).length === 0 ? (
                <p className="text-[10px] text-terminal-amber">
                  ⚠️ هیچ سفینه آزاری برای حرکت به این نقطه در دسترس نیست (سفینه‌ها در محل هستند یا در حال حرکت).
                </p>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedShipSymbol}
                    onChange={(e) => setSelectedShipSymbol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none"
                  >
                    <option value="">-- انتخاب سفینه جهت پلات کورس --</option>
                    {ships
                      .filter((s) => s.nav.status !== 'IN_TRANSIT' && s.nav.waypointSymbol !== selectedWaypoint.symbol)
                      .map((ship) => {
                        const currentWp = waypoints.find((w) => w.symbol === ship.nav.waypointSymbol);
                        const wpPersian = currentWp ? getWaypointPersianName(currentWp.symbol, currentWp.type) : '';
                        const cleanSymbol = ship.nav.waypointSymbol.split('-').pop();
                        const nickname = getShipNickname(ship.symbol);
                        const displaySymbol = nickname ? `${ship.symbol} (${nickname})` : ship.symbol;
                        return (
                          <option key={ship.symbol} value={ship.symbol}>
                            {displaySymbol} (مستقر در: {cleanSymbol} {wpPersian ? `[${wpPersian}]` : ''} • سوخت: {ship.fuel.current}/{ship.fuel.capacity})
                          </option>
                        );
                      })}
                  </select>

                  <button
                    onClick={handleNavigate}
                    disabled={loading || actionLoading || !selectedShipSymbol}
                    className={`w-full p-2 text-xs font-bold font-sans transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                      selectedShipSymbol
                        ? 'bg-terminal-cyan text-slate-950 hover:bg-terminal-cyan/90'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {actionLoading ? 'در حال شبیه‌سازی پرش و حرکت...' : 'محاسبه مسیر و پرواز فضایی 🚀'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
            <Info size={32} className="text-slate-700 mb-2" />
            <h4 className="text-xs font-bold text-slate-400 font-sans">هیچ نقطه مسیری انتخاب نشده است</h4>
            <p className="text-[11px] text-slate-500 mt-1">یک سیاره، کمربند سیارکی یا ایستگاه را روی رادار نقشه کلیک کنید تا جزئیات ناوبری لود شود.</p>
          </div>
        )}
      </div>
    </div>
  );
}
