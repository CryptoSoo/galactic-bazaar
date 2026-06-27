/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Rocket, Compass, Briefcase, ShoppingBag, Landmark, 
  Terminal, Shield, Key, Sparkles, RefreshCw, LogOut, Info, AlertCircle, Settings2
} from 'lucide-react';

import { Agent, Contract, Ship, Waypoint, Market, Shipyard, LogMessage } from './types';
import { request, translateCargoName, getServerResetTime } from './utils/api';

import AgentHUD from './components/AgentHUD';
import FleetCommand from './components/FleetCommand';
import SystemMap from './components/SystemMap';
import ContractsPanel from './components/ContractsPanel';
import MarketTerminal from './components/MarketTerminal';
import ShipyardTerminal from './components/ShipyardTerminal';
import LogConsole from './components/LogConsole';
import ShipUpgrades from './components/ShipUpgrades';
import { getShipUpgrades } from './utils/upgradeEngine';

export default function App() {
  // Authentication & Configuration State
  const [token, setToken] = useState<string>(() => {
    const saved = localStorage.getItem('spacetraders_token') || '';
    if (saved === 'undefined' || saved === 'null' || saved.trim() === '' || saved.trim().length < 20) {
      localStorage.removeItem('spacetraders_token');
      return '';
    }
    return saved.trim();
  });
  const [inputToken, setInputToken] = useState('');
  const [registerSymbol, setRegisterSymbol] = useState('');
  const [registerFaction, setRegisterFaction] = useState('COSMIC');
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍🚀');

  // Core Game Entities
  const [agent, setAgent] = useState<Agent | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedShipSymbol, setSelectedShipSymbol] = useState<string>('');
  
  // Terminal Context State
  const [activeMarket, setActiveMarket] = useState<Market | null>(null);
  const [activeShipyard, setActiveShipyard] = useState<Shipyard | null>(null);

  // Status and UI States
  const [activeTab, setActiveTab] = useState<'fleet' | 'map' | 'contracts' | 'market' | 'shipyard' | 'upgrades'>('fleet');
  const [globalLoading, setGlobalLoading] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [resetTime, setResetTime] = useState<string>('');

  // Stars background stars coordinates
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: string }>>([]);

  // Generate stars on startup
  useEffect(() => {
    const starList = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: `${Math.random() * 3}s`,
    }));
    setStars(starList);
  }, []);

  // System Dispatch logger helper
  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: LogMessage = {
      id: Math.random().toString(),
      text,
      type,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
    };
    setLogs((prev) => [...prev, newLog].slice(-100)); // Keep last 100 logs
  };

  // Error boundary helper
  const handleError = (err: any) => {
    const msg = err instanceof Error ? err.message : 'خطای ارتباط با سیستم فضایی';
    setErrorBanner(msg);
    addLog(`⚠️ خطا: ${msg}`, 'error');
  };

  // Fetch all core SpaceTraders data
  const loadGameData = async (activeToken: string) => {
    if (!activeToken) return;
    setGlobalLoading(true);
    setErrorBanner(null);
    try {
      // 1. Fetch Agent Stats & Reset time
      const agentData = await request<Agent>('/my/agent', 'GET', null, activeToken);
      const mod = Number(localStorage.getItem(`spacetraders_credits_mod_${activeToken}`) || 0);
      setAgent({
        ...agentData,
        credits: Math.max(0, agentData.credits + mod),
      });
      getServerResetTime().then(setResetTime).catch(() => {});

      // 2. Fetch Contracts list
      const contractsList = await request<Contract[]>('/my/contracts', 'GET', null, activeToken);
      setContracts(contractsList);

      // 3. Fetch Ships list
      const shipsList = await request<Ship[]>('/my/ships', 'GET', null, activeToken);
      
      const upgradedShips = shipsList.map((s) => {
        const capacityBonus = getShipUpgrades(s.symbol).cargoLevel * 5;
        return {
          ...s,
          cargo: {
            ...s.cargo,
            capacity: s.cargo.capacity + capacityBonus,
          },
        };
      });
      setShips(upgradedShips);

      if (shipsList.length > 0) {
        // Auto select first ship if none active
        if (!selectedShipSymbol || !shipsList.some(s => s.symbol === selectedShipSymbol)) {
          setSelectedShipSymbol(shipsList[0].symbol);
        }
      }

      // 4. Fetch System Waypoints based on Agent headquarters
      const systemSymbol = agentData.headquarters.split('-').slice(0, 2).join('-');
      const waypointsList = await request<Waypoint[]>(`/systems/${systemSymbol}/waypoints`, 'GET', null, activeToken);
      setWaypoints(waypointsList);

      addLog(`📡 ارتباط رادیویی مجدداً با سیستم مرکزی ${systemSymbol} برقرار شد.`, 'success');
    } catch (e: any) {
      handleError(e);
      const errMsg = e?.message || '';
      if (
        errMsg.includes('token') || 
        errMsg.includes('Authorization') || 
        errMsg.includes('Bearer') || 
        errMsg.includes('401') || 
        errMsg.includes('unauthorized') ||
        errMsg.includes('اعتبار سنجی') ||
        errMsg.includes('احراز هویت')
      ) {
        // Clear invalid token
        localStorage.removeItem('spacetraders_token');
        setToken('');
        setAgent(null);
        setErrorBanner('توکن شما معتبر نیست یا منقضی شده است (احتمالاً به دلیل ریست شدن دوره‌ای سرورهای رسمی SpaceTraders.io). لطفاً مأمور یا خلبان جدید ثبت کنید.');
        addLog('⚠️ لغو اتصال: توکن معتبر نیست یا سرور ریست شده است. لطفاً مأمور جدید ثبت کنید.', 'error');
      }
    } finally {
      setGlobalLoading(false);
    }
  };

  // Automatically trigger game load on token change
  useEffect(() => {
    if (token && token !== 'undefined' && token !== 'null' && token.trim().length >= 20) {
      loadGameData(token);
    } else if (token) {
      localStorage.removeItem('spacetraders_token');
      setToken('');
    }
  }, [token]);

  // Context-aware market & shipyard updates
  useEffect(() => {
    const updateTerminals = async () => {
      const activeShip = ships.find((s) => s.symbol === selectedShipSymbol);
      if (!activeShip || !token) return;

      const waypointSymbol = activeShip.nav.waypointSymbol;
      const systemSymbol = activeShip.nav.systemSymbol;
      const currentWaypoint = waypoints.find((w) => w.symbol === waypointSymbol);

      if (!currentWaypoint) return;

      // Update local Marketplace details if ship is docked there
      const hasMarket = currentWaypoint.traits.some((t) => t.symbol === 'MARKETPLACE');
      if (hasMarket && activeShip.nav.status === 'DOCKED') {
        try {
          const marketData = await request<Market>(
            `/systems/${systemSymbol}/waypoints/${waypointSymbol}/market`,
            'GET',
            null,
            token
          );
          setActiveMarket(marketData);
        } catch (e) {
          // Silent catch or minor warning
          setActiveMarket(null);
        }
      } else {
        setActiveMarket(null);
      }

      // Update Shipyard details if ship is docked at shipyard waypoint
      const hasShipyard = currentWaypoint.traits.some((t) => t.symbol === 'SHIPYARD');
      if (hasShipyard && activeShip.nav.status === 'DOCKED') {
        try {
          const shipyardData = await request<Shipyard>(
            `/systems/${systemSymbol}/waypoints/${waypointSymbol}/shipyard`,
            'GET',
            null,
            token
          );
          setActiveShipyard(shipyardData);
        } catch (e) {
          setActiveShipyard(null);
        }
      } else {
        setActiveShipyard(null);
      }
    };

    updateTerminals();
  }, [selectedShipSymbol, ships, waypoints, token]);

  // Login handler
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    localStorage.setItem('spacetraders_token', inputToken.trim());
    setToken(inputToken.trim());
    addLog('🧬 احراز هویت خلبان با موفقیت تایید شد. ورود به هاب فرماندهی...', 'success');
  };

  // Quick register default pilot handler (1-click start!)
  const handleQuickStart = async () => {
    setGlobalLoading(true);
    setErrorBanner(null);
    // Generate highly randomized and unique Call Sign (e.g. CAP_XXXXXX) to avoid conflicts
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const symbol = `CAP_${randomId}`;
    try {
      const result = await fetch('https://api.spacetraders.io/v2/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          faction: 'COSMIC',
        }),
      });

      const json = await result.json();
      if (!result.ok) {
        throw new Error(json.error?.message || 'خطا در ثبت نام مأمور فضایی');
      }

      const newToken = json.data.token;
      localStorage.setItem('spacetraders_token', newToken);
      setToken(newToken);
      addLog(`✨ خلبان جدید ${symbol} با موفقیت در اتحادیه فرماندهی ثبت نام شد!`, 'success');
    } catch (e) {
      handleError(e);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Manual register pilot
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    const cleanSymbol = registerSymbol.trim().toUpperCase();
    if (!cleanSymbol) return;

    // Validate Symbol for SpaceTraders.io constraints (English alphanumeric, starts with letter, 3-14 chars)
    if (!/^[A-Z][A-Z0-9_-]{2,13}$/.test(cleanSymbol)) {
      setErrorBanner('شناسه خلبانی باید بین ۳ تا ۱۴ کاراکتر، فقط حاوی حروف انگلیسی (A-Z)، اعداد، خط تیره (-) یا خط زیرین (_) بوده و حتماً با یک حرف انگلیسی شروع شود.');
      addLog('⚠️ خطای معتبرسازی: شناسه خلبانی نامعتبر است (از حروف انگلیسی و بدون فاصله استفاده کنید).', 'error');
      return;
    }

    setGlobalLoading(true);
    setErrorBanner(null);
    try {
      const result = await fetch('https://api.spacetraders.io/v2/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: cleanSymbol,
          faction: registerFaction,
        }),
      });

      const json = await result.json();
      if (!result.ok) {
        throw new Error(json.error?.message || 'ثبت نام مأمور فضایی با خطا مواجه شد');
      }

      const newToken = json.data.token;
      localStorage.setItem('spacetraders_token', newToken);
      setToken(newToken);
      addLog(`✨ مأمور جدید ${cleanSymbol} با فرقه ${registerFaction} ایجاد شد!`, 'success');
    } catch (e) {
      handleError(e);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('spacetraders_token');
    setToken('');
    setAgent(null);
    setShips([]);
    setContracts([]);
    setWaypoints([]);
    setSelectedShipSymbol('');
    setErrorBanner(null);
    addLog('👋 خروج موفقیت‌آمیز. کدهای دسترسی پایگاه فضایی پاکسازی شدند.', 'warning');
  };

  // Command: Dock ship
  const handleDock = async (shipSymbol: string) => {
    if (!token) return;
    try {
      await request(`/my/ships/${shipSymbol}/dock`, 'POST', null, token);
      addLog(`⚓ سفینه ${shipSymbol} با موفقیت در بندرگاه لنگر انداخت.`, 'success');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Orbit ship
  const handleOrbit = async (shipSymbol: string) => {
    if (!token) return;
    try {
      await request(`/my/ships/${shipSymbol}/orbit`, 'POST', null, token);
      addLog(`🛰️ سفینه ${shipSymbol} موتورهای گریز از مرکز را روشن کرده و وارد مدار سیاره شد.`, 'success');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Refuel ship
  const handleRefuel = async (shipSymbol: string) => {
    if (!token) return;
    try {
      await request(`/my/ships/${shipSymbol}/refuel`, 'POST', null, token);
      addLog(`⛽ عملیات سوخت‌گیری مجدد سفینه ${shipSymbol} با موفقیت انجام شد.`, 'success');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Mine/Extract resources
  const handleExtract = async (shipSymbol: string) => {
    if (!token) return;
    try {
      const data = await request<any>(`/my/ships/${shipSymbol}/extract`, 'POST', null, token);
      const yieldItem = data.extraction.yield;
      const translatedName = translateCargoName(yieldItem.symbol, yieldItem.symbol);
      addLog(`☄️ موفقیت استخراج: سفینه ${shipSymbol} مقدار ${yieldItem.units} واحد [${translatedName}] استخراج کرد!`, 'success');
      
      // Upgrade bonus: Quantum Magnetic Drill extra yield refine credits
      const drillLevel = getShipUpgrades(shipSymbol).drillLevel;
      if (drillLevel > 0) {
        const bonusCredits = drillLevel * 1200;
        addLog(`⚡ تشعشع فوتونی مته ارتقاء یافته (سطح ${drillLevel}): کلوخه‌های معدنی دوردست تصفیه شده و معادل ${bonusCredits} ¤ به حساب شما واریز شد!`, 'success');
        const currentMod = Number(localStorage.getItem(`spacetraders_credits_mod_${token}`) || 0);
        localStorage.setItem(`spacetraders_credits_mod_${token}`, String(currentMod + bonusCredits));
        setAgent((prev) => prev ? { ...prev, credits: prev.credits + bonusCredits } : null);
      }
      
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Navigate ship to waypoint
  const handleNavigate = async (shipSymbol: string, waypointSymbol: string) => {
    if (!token) return;
    try {
      const data = await request<any>(`/my/ships/${shipSymbol}/navigate`, 'POST', { waypointSymbol }, token);
      const arrival = new Date(data.nav.route.arrivalTime).toLocaleTimeString('fa-IR');
      addLog(`🚀 کورس سفر فضایی سفینه ${shipSymbol} به مقصد ${waypointSymbol} برنامه‌ریزی شد. زمان ورود به بندر: ${arrival}`, 'info');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Buy Cargo
  const handleBuyCargo = async (shipSymbol: string, tradeSymbol: string, units: number) => {
    if (!token) return;
    try {
      await request(`/my/ships/${shipSymbol}/purchase`, 'POST', { symbol: tradeSymbol, units }, token);
      const translatedName = translateCargoName(tradeSymbol, tradeSymbol);
      addLog(`🛒 خرید کالا: تعداد ${units} واحد ${translatedName} به مخزن بار سفینه ${shipSymbol} افزوده شد.`, 'success');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Sell Cargo
  const handleSellCargo = async (shipSymbol: string, tradeSymbol: string, units: number) => {
    if (!token) return;
    try {
      await request(`/my/ships/${shipSymbol}/sell`, 'POST', { symbol: tradeSymbol, units }, token);
      const translatedName = translateCargoName(tradeSymbol, tradeSymbol);
      addLog(`💰 فروش کالا: تعداد ${units} واحد ${translatedName} از انبار سفینه ${shipSymbol} با سود عالی فروخته شد.`, 'success');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Accept Contract
  const handleAcceptContract = async (contractId: string) => {
    if (!token) return;
    try {
      await request(`/my/contracts/${contractId}/accept`, 'POST', null, token);
      addLog(`📜 قرارداد پذیرفته شد! اعتبار پیش‌پرداخت اولیه فورا به حساب شما واریز گردید.`, 'success');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Deliver contract items
  const handleDeliverContract = async (contractId: string, shipSymbol: string, tradeSymbol: string, units: number) => {
    if (!token) return;
    try {
      await request(`/my/contracts/${contractId}/deliver`, 'POST', { shipSymbol, tradeSymbol, units }, token);
      const translatedName = translateCargoName(tradeSymbol, tradeSymbol);
      addLog(`📦 تحویل بار: مقدار ${units} واحد ${translatedName} از سفینه ${shipSymbol} تحویل مأمور فدراسیون شد.`, 'success');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Fulfill Contract
  const handleFulfillContract = async (contractId: string) => {
    if (!token) return;
    try {
      await request(`/my/contracts/${contractId}/fulfill`, 'POST', null, token);
      addLog(`🏆 تبریک مأمور! قرارداد شما با موفقیت تکمیل شد. پاداش بزرگ تسویه نهایی به اعتبارات شما افزوده شد!`, 'success');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Command: Purchase spaceship
  const handleBuyShip = async (shipType: string, waypointSymbol: string) => {
    if (!token) return;
    try {
      await request(`/my/ships`, 'POST', { shipType, waypointSymbol }, token);
      addLog(`🏭 تبریک! سفینه فضایی مدرن کلاس ${shipType} خریداری و به ناوگان شما در پایگاه ${waypointSymbol} ملحق شد.`, 'success');
      loadGameData(token);
    } catch (e) {
      handleError(e);
    }
  };

  // Callback: Ship Upgrade Completed
  const handleUpgradeComplete = (costCredits: number) => {
    // 1. Instantly update local state for snappy visual feedback
    setAgent((prev) => prev ? { ...prev, credits: Math.max(0, prev.credits - costCredits) } : null);

    // 2. Persist in localStorage mod and reload
    if (token) {
      const currentMod = Number(localStorage.getItem(`spacetraders_credits_mod_${token}`) || 0);
      localStorage.setItem(`spacetraders_credits_mod_${token}`, String(currentMod - costCredits));
      loadGameData(token);
    }
  };

  const activeShip = ships.find((s) => s.symbol === selectedShipSymbol) || null;

  return (
    <div className="min-h-screen bg-retro-bg text-slate-100 flex flex-col font-sans select-none relative pb-10">
      {/* CRT Scanline Overlay */}
      <div className="crt-overlay" />

      {/* Render Dynamic Starry Sky */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              top: `${star.y}%`,
              left: `${star.x}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${2 + star.size * 1.5}s`,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* ERROR BANNER */}
      {errorBanner && (
        <div className="bg-terminal-red/90 text-white p-3 font-sans text-xs flex items-center justify-between gap-3 text-right z-50 sticky top-0 border-b-2 border-red-700" dir="rtl">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button 
            onClick={() => setErrorBanner(null)} 
            className="text-white hover:text-red-200 text-xs px-2 py-0.5 border border-white rounded font-bold cursor-pointer"
          >
            بستن هشدار
          </button>
        </div>
      )}

      {/* LOGIN & CHAR REGISTER SCREEN */}
      {!token ? (
        <div className="flex-1 flex items-center justify-center p-4 z-10" dir="rtl">
          <div className="w-full max-w-lg bg-retro-card pixel-box border-slate-700 p-6 md:p-8 space-y-6">
            
            {/* Visual Header */}
            <div className="text-center space-y-2">
              <span className="text-3xl animate-bounce inline-block">🚀</span>
              <h1 className="text-2xl font-black font-sans text-terminal-cyan tracking-wider">
                بــنــدرگــاه کــیــهــانــی
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                شبیه‌ساز و کلاینت پیشرفته تجارت، ناوبری و معدن‌کاری کهکشانی در بستر شبکه SpaceTraders.io
              </p>
            </div>

            {/* Quick 1-Click login banner */}
            <div className="bg-terminal-cyan/5 border border-dashed border-terminal-cyan/30 p-4 rounded text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-terminal-cyan text-xs font-bold font-sans">
                <Sparkles size={14} className="animate-pulse" />
                <span>شروع سریع با یک کلیک!</span>
              </div>
              <p className="text-[10px] text-slate-400">
                اگر خلبان ثبت‌نام شده ندارید، برای شما بلافاصله یک کاپیتان جدید با ۱۷۵,۰۰۰ کوین به همراه ناو جنگی فرماندهی ثبت می‌کنیم!
              </p>
              <button
                type="button"
                onClick={handleQuickStart}
                disabled={globalLoading}
                className="w-full py-2 bg-terminal-cyan hover:bg-terminal-cyan/95 text-slate-950 font-bold font-sans text-xs cursor-pointer border-2 border-slate-950 shadow-[0_4px_0_0_#00f0ff] transition-all transform active:translate-y-1 active:shadow-none"
              >
                {globalLoading ? 'در حال صدور گواهی پرواز...' : 'ثبت کاپیتان و پرواز فوری 🌌'}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-1 border-t border-b border-slate-800">
              <span>یا ورود با حساب قبلی / ثبت دستی خلبان</span>
            </div>

            {/* Selection modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Login mode */}
              <form onSubmit={handleLogin} className="space-y-3 border-l md:border-l border-slate-800 md:pl-4">
                <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Key size={12} className="text-terminal-amber" />
                  <span>ورود با توکن خلبانی</span>
                </h3>
                {inputToken.startsWith('eyJhbGci') && (
                  <div className="bg-terminal-green/10 border border-terminal-green/30 p-2 text-[10px] text-terminal-green font-sans leading-relaxed text-right">
                    📡 <span className="font-bold">کد توکن شخصی شما شناسایی شد!</span> برای شروع فوری بازی با اکانت واقعی خود دکمه زیر را بفشارید.
                  </div>
                )}
                <input
                  type="password"
                  placeholder="توکن SpaceTraders را وارد کنید..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 text-center rounded font-mono focus:outline-none focus:border-terminal-amber"
                />
                <button
                  type="submit"
                  disabled={globalLoading || !inputToken}
                  className="w-full py-1.5 bg-terminal-cyan hover:bg-terminal-cyan/90 text-slate-950 font-bold font-sans text-xs cursor-pointer border-2 border-slate-950 shadow-[0_3px_0_0_#00f0ff] transition-all transform active:translate-y-0.5 active:shadow-none"
                >
                  تایید و اتصال به اکانت واقعی 🚀
                </button>
              </form>

              {/* Create new mode */}
              <form onSubmit={handleRegister} className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Shield size={12} className="text-terminal-cyan" />
                  <span>ثبت دستی خلبان جدید</span>
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="کال ساین (۳ تا ۱۴ کاراکتر انگلیسی)"
                    value={registerSymbol}
                    onChange={(e) => setRegisterSymbol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 text-center rounded font-mono focus:outline-none focus:border-terminal-cyan"
                    maxLength={14}
                  />
                  <select
                    value={registerFaction}
                    onChange={(e) => setRegisterFaction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-1.5 rounded focus:outline-none"
                  >
                    <option value="COSMIC">جناح COSMIC (کهکشان صلح)</option>
                    <option value="VOID">جناح VOID (خلأ جاذبه)</option>
                    <option value="GALACTIC">جناح GALACTIC (امپراطوری قانون)</option>
                    <option value="QUANTUM">جناح QUANTUM (فناوری کوانتوم)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={globalLoading || !registerSymbol}
                  className="w-full py-1.5 bg-slate-900 hover:bg-terminal-cyan hover:text-slate-950 text-terminal-cyan font-bold font-sans text-xs cursor-pointer border border-terminal-cyan transition-colors"
                >
                  ثبت خلبان
                </button>
              </form>

            </div>

            <p className="text-[10px] text-slate-500 text-center font-sans">
              * این بازی از وب‌سایت اصلی SpaceTraders استفاده می‌کند و تمام اطلاعات بر روی سرورهای ابری کهکشان ذخیره می‌شوند.
            </p>
          </div>
        </div>
      ) : (
        /* GAME DASHBOARD HUBS */
        <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-4 z-10 flex-1 flex flex-col justify-between">
          
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🛰️</span>
              <div>
                <h1 className="text-lg font-black text-terminal-cyan tracking-wider font-sans">
                  بــنــدرگــاه کــیــهــانــی
                </h1>
                <p className="text-[10px] text-slate-400 font-sans">کلاینت بومی خلبانی و تجارت کیهانی به زبان فارسی</p>
              </div>
            </div>

            {/* Logout & Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadGameData(token)}
                disabled={globalLoading}
                className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 font-sans cursor-pointer transition-colors"
                title="بروزرسانی داده‌های سرور"
              >
                <RefreshCw size={12} className={globalLoading ? 'animate-spin' : ''} />
                <span>بروزرسانی شبکه</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-slate-950 hover:bg-terminal-red/10 border border-terminal-red/30 text-terminal-red hover:text-white text-xs flex items-center gap-1 font-sans cursor-pointer transition-colors"
                title="خروج از حساب خلبانی"
              >
                <LogOut size={12} />
                <span>خروج از پایگاه</span>
              </button>
            </div>
          </div>

          {/* User Stats HUD */}
          <AgentHUD agent={agent} loading={globalLoading} onRefresh={() => loadGameData(token)} resetTime={resetTime} />

          {/* Interactive Navigation System Tabs */}
          <div className="flex flex-wrap items-center bg-slate-950 p-1.5 border border-slate-800 gap-1" dir="rtl">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'fleet' ? 'bg-terminal-cyan text-slate-950' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Rocket size={14} />
              <span>فرماندهی ناوگان ({ships.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'map' ? 'bg-terminal-cyan text-slate-950' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Compass size={14} />
              <span>نقشه و رادار منظومه</span>
            </button>

            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'contracts' ? 'bg-terminal-cyan text-slate-950' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Briefcase size={14} />
              <span>پیمان‌های کهکشانی ({contracts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('market')}
              disabled={!activeShip || activeShip.nav.status !== 'DOCKED'}
              className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'market' 
                  ? 'bg-terminal-cyan text-slate-950' 
                  : activeShip && activeShip.nav.status === 'DOCKED'
                  ? 'text-slate-400 hover:text-slate-100 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
              title="برای ورود به بازار، سفینه شما باید در ایستگاه پهلو گرفته باشد."
            >
              <ShoppingBag size={14} />
              <span>بازار محلی پایگاه</span>
            </button>

            <button
              onClick={() => setActiveTab('shipyard')}
              disabled={!activeShip || activeShip.nav.status !== 'DOCKED'}
              className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'shipyard' 
                  ? 'bg-terminal-cyan text-slate-950' 
                  : activeShip && activeShip.nav.status === 'DOCKED'
                  ? 'text-slate-400 hover:text-slate-100 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
              title="برای خرید سفینه، سفینه شما باید در پایگاه کشتی‌سازی مستقر باشد."
            >
              <Landmark size={14} />
              <span>کارگاه کشتی‌سازی</span>
            </button>

            <button
              onClick={() => setActiveTab('upgrades')}
              className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upgrades' ? 'bg-terminal-cyan text-slate-950' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Settings2 size={14} />
              <span>کالیبره و ارتقای سفینه ⚙️</span>
            </button>
          </div>

          {/* Core Content Area */}
          <div className="flex-1 min-h-[350px]">
            {activeTab === 'fleet' && (
              <FleetCommand
                ships={ships}
                loading={globalLoading}
                onDock={handleDock}
                onOrbit={handleOrbit}
                onRefuel={handleRefuel}
                onExtract={handleExtract}
                onSelectShip={(sym) => {
                  setSelectedShipSymbol(sym);
                  addLog(`📍 ناوگان: سفینه فعال شما به ${sym} تغییر یافت.`, 'info');
                }}
                selectedShipSymbol={selectedShipSymbol}
              />
            )}

            {activeTab === 'map' && (
              <SystemMap
                waypoints={waypoints}
                ships={ships}
                loading={globalLoading}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'contracts' && (
              <ContractsPanel
                contracts={contracts}
                ships={ships}
                loading={globalLoading}
                onAccept={handleAcceptContract}
                onDeliver={handleDeliverContract}
                onFulfill={handleFulfillContract}
              />
            )}

            {activeTab === 'market' && (
              <MarketTerminal
                market={activeMarket}
                selectedShip={activeShip}
                loading={globalLoading}
                onBuy={handleBuyCargo}
                onSell={handleSellCargo}
              />
            )}

            {activeTab === 'shipyard' && (
              <ShipyardTerminal
                shipyard={activeShipyard}
                selectedShip={activeShip}
                loading={globalLoading}
                onBuyShip={handleBuyShip}
              />
            )}

            {activeTab === 'upgrades' && (
              <ShipUpgrades
                ship={activeShip}
                agentCredits={agent?.credits || 0}
                onUpgradeComplete={handleUpgradeComplete}
                addLog={addLog}
              />
            )}
          </div>

          {/* BOTTOM FIXED COMM LOG CONSOLE */}
          <LogConsole logs={logs} onClear={() => setLogs([])} />

        </div>
      )}
    </div>
  );
}
