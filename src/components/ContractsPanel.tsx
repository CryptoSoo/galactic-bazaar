/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Briefcase, Clock, ShieldCheck, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { Contract, Ship } from '../types';
import { translateCargoName, getShipNickname } from '../utils/api';

interface ContractsPanelProps {
  contracts: Contract[];
  ships: Ship[];
  loading: boolean;
  onAccept: (contractId: string) => Promise<void>;
  onDeliver: (contractId: string, shipSymbol: string, tradeSymbol: string, units: number) => Promise<void>;
  onFulfill: (contractId: string) => Promise<void>;
}

export default function ContractsPanel({
  contracts,
  ships,
  loading,
  onAccept,
  onDeliver,
  onFulfill,
}: ContractsPanelProps) {
  const [selectedShipSymbol, setSelectedShipSymbol] = useState<string>('');
  const [deliverAmount, setDeliverAmount] = useState<number>(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleAccept = async (id: string) => {
    setActionLoading(id + '-accept');
    try {
      await onAccept(id);
    } catch (e) {
      // handled globally in App
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (contractId: string, tradeSymbol: string, destinationSymbol: string) => {
    if (!selectedShipSymbol) return;
    setActionLoading(contractId + '-deliver');
    try {
      await onDeliver(contractId, selectedShipSymbol, tradeSymbol, deliverAmount);
    } catch (e) {
      // handled globally in App
    } finally {
      setActionLoading(null);
    }
  };

  const handleFulfill = async (id: string) => {
    setActionLoading(id + '-fulfill');
    try {
      await onFulfill(id);
    } catch (e) {
      // handled globally in App
    } finally {
      setActionLoading(null);
    }
  };

  // Find if there are ships carrying the required contract goods and docked at the required destination
  const getEligibleShipsForDelivery = (tradeSymbol: string, destinationSymbol: string) => {
    return ships.filter((ship) => {
      // Check if ship is docked at the destination
      const isAtDestination = ship.nav.waypointSymbol === destinationSymbol && ship.nav.status === 'DOCKED';
      // Check if ship has the cargo
      const cargoItem = ship.cargo.inventory.find((i) => i.symbol === tradeSymbol);
      const hasCargo = cargoItem && cargoItem.units > 0;
      return isAtDestination && hasCargo;
    });
  };

  if (contracts.length === 0) {
    return (
      <div className="pixel-box bg-slate-900 border-slate-700 p-6 text-center" dir="rtl">
        <HelpCircle size={32} className="mx-auto text-slate-500 mb-2" />
        <h3 className="font-bold text-slate-300 font-sans">هیچ قراردادی یافت نشد</h3>
        <p className="text-xs text-slate-500 mt-1">منتظر فرستادن اطلاعات قراردادها از مرکز فرماندهی فدراسیون تجارت آزاد هستیم...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* 1. CONTRACTS HEADER WITH ? BUTTON */}
      <div className="pixel-box bg-slate-950 p-3 border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-300 font-sans">بخش دیپلماسی و قراردادهای کهکشانی</span>
          <span className="text-[10px] text-terminal-amber bg-terminal-amber/10 px-1 border border-terminal-amber/30">دفتر بازرگانی فدراسیون</span>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="px-2 py-1 bg-slate-900 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          title="راهنمای عهده‌داری قراردادها"
        >
          <span>؟</span>
          <span>راهنمای قراردادها</span>
        </button>
      </div>

      {/* TUTORIAL BOX */}
      {showHelp && (
        <div className="pixel-box bg-slate-950 border-terminal-amber p-4 text-right space-y-2 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-terminal-amber font-sans">مرجع تدارکات و پیمانکاری (فدراسیون متحد تجارت)</span>
            <button 
              onClick={() => setShowHelp(false)}
              className="text-slate-500 hover:text-slate-300 text-xs font-bold"
            >
              [بستن ✕]
            </button>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-sans">
            <p>
              به بخش <span className="text-terminal-amber font-bold">بایگانی قراردادهای تجاری کهکشان</span> خوش آمدید! در این جا می‌توانید برای فراکسیون‌های بزرگ کار کرده و مبالغ هنگفتی پاداش دریافت کنید:
            </p>
            <ul className="list-disc pr-4 space-y-1 text-slate-400">
              <li>
                <span className="text-terminal-cyan font-bold">پذیرش قرارداد (Accept):</span> قرارداد را امضا کنید تا بخشی از مبلغ قرارداد به عنوان پیش‌پرداخت فضایی فوراً به حسابتان واریز شود.
              </li>
              <li>
                <span className="text-terminal-amber font-bold">تأمین و تحویل کالا (Deliver):</span> کالای درخواستی (مثلاً سنگ آهن یا هیدروژن) را با استخراج یا خرید جمع‌آوری کنید. سفینه حامل کالا را به ایستگاه مقصد بفرستید، پهلو بدهید (Docked)، سپس از گزینه تحویل کالا در این صفحه استفاده کنید.
              </li>
              <li>
                <span className="text-terminal-green font-bold">تسویه نهایی (Fulfill):</span> پس از تحویل ۱۰۰٪ حجم درخواستی کالا، دکمه تسویه نهایی فعال می‌شود. آن را بفشارید تا تسویه نهایی به اتمام رسیده و مانده پاداش را تماماً دریافت کنید.
              </li>
            </ul>
          </div>
        </div>
      )}

      {contracts.map((contract) => {
        const isAccepted = contract.accepted;
        const isFulfilled = contract.fulfilled;
        const deadline = new Date(contract.terms.deadline);
        const deliverInfo = contract.terms.deliver?.[0]; // SpaceTraders typically has 1 main delivery term per contract

        return (
          <div
            key={contract.id}
            className={`pixel-box bg-slate-900 border-slate-700 p-4 text-right relative ${
              isFulfilled ? 'border-terminal-green/30 opacity-80' : isAccepted ? 'border-terminal-cyan/60' : 'border-terminal-amber/50'
            }`}
          >
            {/* Status indicator tag */}
            <div className="absolute top-4 left-4">
              {isFulfilled ? (
                <span className="flex items-center gap-1 text-xs text-terminal-green bg-terminal-green/10 px-2 py-0.5 border border-terminal-green/30 font-sans">
                  <CheckCircle2 size={12} /> تکمیل شده
                </span>
              ) : isAccepted ? (
                <span className="flex items-center gap-1 text-xs text-terminal-cyan bg-terminal-cyan/10 px-2 py-0.5 border border-terminal-cyan/30 font-sans">
                  <Clock size={12} className="animate-pulse" /> در حال اجرا
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-terminal-amber bg-terminal-amber/10 px-2 py-0.5 border border-terminal-amber/30 font-sans">
                  <Briefcase size={12} /> پیشنهاد جدید
                </span>
              )}
            </div>

            {/* Contract Title & Lore */}
            <div className="mb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-sans">
                <span>پیمان تجاری با فرقه:</span>
                <span className="text-terminal-cyan">{contract.faction}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                مقررات کهکشانی {contract.type === 'PROCUREMENT' ? 'تهیه و تحویل کالا' : contract.type} از جانب حاکمیت کهکشانی ابلاغ گردیده است. مأمور با تکمیل این فرآیند پاداش شایسته‌ای دریافت می‌کند.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 bg-slate-950/60 p-3 border border-slate-800 rounded">
              {/* Payment Details */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">پاداش تایید اولیه:</span>
                  <span className="font-mono text-terminal-cyan font-bold">{contract.terms.payment.onAccepted.toLocaleString()} ¤</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">پاداش تکمیل نهایی:</span>
                  <span className="font-mono text-terminal-green font-bold">{contract.terms.payment.onFulfilled.toLocaleString()} ¤</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 mt-1.5">
                  <span className="text-slate-500">مهلت نهایی کهکشانی:</span>
                  <span className="text-slate-400 font-mono text-[10px]" dir="ltr">{deadline.toLocaleString('fa-IR')}</span>
                </div>
              </div>

              {/* Delivery specifications */}
              {deliverInfo && (
                <div className="border-t md:border-t-0 md:border-r border-slate-800 pr-0 md:pr-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>کالای درخواستی:</span>
                    <span className="font-bold text-terminal-cyan">
                      {translateCargoName(deliverInfo.tradeSymbol, deliverInfo.tradeSymbol)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>پایگاه مقصد تحویل:</span>
                    <span className="font-mono text-[11px] text-terminal-cyan">{deliverInfo.destinationSymbol}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>پیشرفت تحویل:</span>
                      <span className="font-mono text-slate-200">
                        {deliverInfo.unitsFulfilled} از {deliverInfo.unitsRequired} واحد
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 border border-slate-700 overflow-hidden">
                      <div
                        className="bg-terminal-green h-full transition-all"
                        style={{ width: `${(deliverInfo.unitsFulfilled / deliverInfo.unitsRequired) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col gap-3 mt-4 pt-3 border-t border-slate-800">
              {!isAccepted && !isFulfilled && (
                <button
                  onClick={() => handleAccept(contract.id)}
                  disabled={loading || actionLoading !== null}
                  className="w-full p-2.5 bg-terminal-cyan/10 hover:bg-terminal-cyan/20 text-terminal-cyan border-2 border-terminal-cyan font-bold font-sans cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading === contract.id + '-accept' ? 'در حال ثبت قرارداد...' : 'قبول رسمی پیمان تجاری و دریافت اعتبار اولیه'}
                </button>
              )}

              {isAccepted && !isFulfilled && deliverInfo && (
                <div className="space-y-3">
                  {/* Cargo delivery widget */}
                  <div className="bg-slate-950 p-3 border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 mb-2 font-sans">بخش تحویل کدهای حمل و نقل</h4>

                    {getEligibleShipsForDelivery(deliverInfo.tradeSymbol, deliverInfo.destinationSymbol).length === 0 ? (
                      <p className="text-xs text-terminal-amber">
                        ⚠️ هیچ سفینه بارگذاری شده با {translateCargoName(deliverInfo.tradeSymbol, deliverInfo.tradeSymbol)} در پایگاه {deliverInfo.destinationSymbol} پهلو نگرفته است. برای تحویل، ابتدا سفینه خود را در این پایگاه بارگذاری و مستقر کنید.
                      </p>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <select
                          value={selectedShipSymbol}
                          onChange={(e) => {
                            setSelectedShipSymbol(e.target.value);
                            const ship = ships.find(s => s.symbol === e.target.value);
                            const item = ship?.cargo.inventory.find(i => i.symbol === deliverInfo.tradeSymbol);
                            if (item) setDeliverAmount(Math.min(item.units, deliverInfo.unitsRequired - deliverInfo.unitsFulfilled));
                          }}
                          className="w-full sm:flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-100 p-2 rounded focus:outline-none"
                        >
                          <option value="">-- انتخاب سفینه پهلو گرفته جهت تحویل بار --</option>
                          {getEligibleShipsForDelivery(deliverInfo.tradeSymbol, deliverInfo.destinationSymbol).map((ship) => {
                            const units = ship.cargo.inventory.find((i) => i.symbol === deliverInfo.tradeSymbol)?.units || 0;
                            const nickname = getShipNickname(ship.symbol);
                            const displayName = nickname ? `${ship.symbol} (${nickname})` : ship.symbol;
                            return (
                              <option key={ship.symbol} value={ship.symbol}>
                                {displayName} ({units} واحد {translateCargoName(deliverInfo.tradeSymbol, deliverInfo.tradeSymbol)} موجود)
                              </option>
                            );
                          })}
                        </select>

                        {selectedShipSymbol && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs text-slate-400 shrink-0">مقدار:</span>
                            <input
                              type="number"
                              min={1}
                              max={
                                ships.find((s) => s.symbol === selectedShipSymbol)?.cargo.inventory.find(
                                  (i) => i.symbol === deliverInfo.tradeSymbol
                                )?.units || 1
                              }
                              value={deliverAmount}
                              onChange={(e) => setDeliverAmount(parseInt(e.target.value) || 1)}
                              className="w-16 bg-slate-900 border border-slate-700 text-center text-xs p-1.5 text-slate-100 font-mono"
                            />
                            <button
                              onClick={() => handleDeliver(contract.id, deliverInfo.tradeSymbol, deliverInfo.destinationSymbol)}
                              disabled={loading || actionLoading !== null}
                              className="px-4 py-2 bg-terminal-cyan hover:bg-terminal-cyan/80 text-slate-950 text-xs font-bold font-sans cursor-pointer transition-colors"
                            >
                              {actionLoading === contract.id + '-deliver' ? 'تحویل...' : 'تحویل کالا'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fulfill action button */}
                  <button
                    onClick={() => handleFulfill(contract.id)}
                    disabled={loading || actionLoading !== null || deliverInfo.unitsFulfilled < deliverInfo.unitsRequired}
                    className={`w-full p-2.5 font-bold font-sans transition-all flex items-center justify-center gap-2 ${
                      deliverInfo.unitsFulfilled >= deliverInfo.unitsRequired
                        ? 'bg-terminal-green text-slate-950 cursor-pointer hover:opacity-90'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    {actionLoading === contract.id + '-fulfill'
                      ? 'در حال نهایی‌سازی...'
                      : deliverInfo.unitsFulfilled >= deliverInfo.unitsRequired
                      ? 'تکمیل نهایی قرارداد و تسویه حساب مالی'
                      : 'پس از تحویل تمام کالاهای درخواستی تسویه حساب فعال می‌شود'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
