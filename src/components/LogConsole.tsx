/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { LogMessage } from '../types';

interface LogConsoleProps {
  logs: LogMessage[];
  onClear: () => void;
}

export default function LogConsole({ logs, onClear }: LogConsoleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="pixel-box bg-slate-950 p-4 font-mono text-xs text-terminal-green">
      <div className="flex items-center justify-between border-b border-terminal-green/30 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="animate-pulse text-terminal-green" />
          <span className="font-semibold text-sm font-sans">گزارش‌های ناوبری و فرماندهی</span>
        </div>
        <button
          onClick={onClear}
          className="text-terminal-green/60 hover:text-terminal-red hover:bg-terminal-red/10 p-1 transition-colors"
          title="پاک کردن گزارش‌ها"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="h-32 overflow-y-auto space-y-1.5 scrollbar-thin text-right pr-1"
        dir="rtl"
      >
        {logs.length === 0 ? (
          <p className="text-terminal-green/40 italic">هیچ پیامی در دیسپچ سنتر کهکشانی ثبت نشده است...</p>
        ) : (
          logs.map((log) => {
            const typeColor = 
              log.type === 'success' ? 'text-terminal-green font-bold' :
              log.type === 'warning' ? 'text-terminal-amber' :
              log.type === 'error' ? 'text-terminal-red animate-pulse' : 
              'text-terminal-cyan';

            return (
              <div key={log.id} className="leading-relaxed hover:bg-terminal-green/5 py-0.5 px-1 rounded">
                <span className="text-[10px] text-terminal-green/40 ml-2 select-none" dir="ltr">
                  [{log.timestamp}]
                </span>
                <span className={typeColor}>{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
