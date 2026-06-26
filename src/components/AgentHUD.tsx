/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Coins, Shield, Landmark, Orbit, RefreshCw } from 'lucide-react';
import { Agent } from '../types';

interface AgentHUDProps {
  agent: Agent | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function AgentHUD({ agent, loading, onRefresh }: AgentHUDProps) {
  if (!agent) {
    return (
      <div className="pixel-box bg-slate-900/60 p-4 animate-pulse flex items-center justify-center text-slate-400">
        در حال اتصال به دیتابیس هویت خلبان...
      </div>
    );
  }

  return (
    <div className="pixel-box bg-slate-900 border-slate-700 p-4 text-right relative overflow-hidden" dir="rtl">
      {/* Background neon glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-terminal-cyan/5 blur-xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Name and faction */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-none bg-terminal-cyan/10 border-2 border-terminal-cyan flex items-center justify-center relative">
            <span className="text-xl font-bold text-terminal-cyan animate-pulse">⚓</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-terminal-green" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-sans">{agent.symbol}</h2>
              <span className="text-[10px] px-1.5 py-0.5 bg-terminal-cyan/15 text-terminal-cyan border border-terminal-cyan/30 rounded-none font-mono">
                PILOT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Shield size={12} className="text-terminal-amber" />
              <span>جناح آغازین: </span>
              <span className="text-terminal-amber font-semibold">{agent.startingFaction}</span>
            </p>
          </div>
        </div>

        {/* Currency & Base info */}
        <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
          {/* Credits */}
          <div className="bg-slate-950/80 p-2 border border-slate-800/80 flex items-center gap-3 justify-end rounded-sm">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">اعتبار کل (کوین)</span>
              <span className="text-base font-bold text-terminal-amber font-mono tracking-wider">
                {agent.credits.toLocaleString('en-US')} ¤
              </span>
            </div>
            <div className="p-1.5 bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber">
              <Coins size={16} />
            </div>
          </div>

          {/* Headquarters / Ships */}
          <div className="bg-slate-950/80 p-2 border border-slate-800/80 flex items-center gap-3 justify-end rounded-sm">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">تعداد ناوگان / ستاد</span>
              <span className="text-xs font-bold text-terminal-cyan block truncate max-w-[130px] font-mono">
                {agent.shipCount} سفینه • {agent.headquarters.split('-')[0]}
              </span>
            </div>
            <div className="p-1.5 bg-terminal-cyan/10 border border-terminal-cyan/30 text-terminal-cyan">
              <Landmark size={16} />
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 border border-terminal-cyan/40 hover:border-terminal-cyan bg-slate-950 hover:bg-terminal-cyan/10 text-terminal-cyan transition-all flex items-center justify-center cursor-pointer w-full sm:w-auto"
          title="بروزرسانی داده‌های سفینه"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="sm:hidden mr-2 font-sans text-xs">بروزرسانی وضعیت</span>
        </button>
      </div>
    </div>
  );
}
