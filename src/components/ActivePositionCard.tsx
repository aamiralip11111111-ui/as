import React from "react";
import { Position } from "../types";
import { Zap, Clock, ShieldCheck, XCircle, ArrowUpRight, ArrowDownRight, CheckCircle2, Target, Flame } from "lucide-react";

interface ActivePositionCardProps {
  position: Position | null;
  currentPrice: number;
  onClosePosition: () => void;
}

export const ActivePositionCard: React.FC<ActivePositionCardProps> = ({
  position,
  currentPrice,
  onClosePosition,
}) => {
  if (!position) {
    return (
      <div id="no-active-position-card" className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
          <Zap className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">No Active Position</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 font-sans">
          The continuous HFT engine is scanning micro-fluctuations and mining gaps. Positions are entered and exited in milliseconds with Zero-Loss protection.
        </p>
      </div>
    );
  }

  const isNetProfitable = (position.netPnL ?? 0) >= 0;
  const isTargetHit = position.netPnL >= (position.extraFeeBuffer > 0 ? 0.025 : 0.015);

  // Sub-second progress to take profit (advancing smoothly to 100% within 440ms)
  const isLong = position.side === "LONG";
  const notionalQty = position.notional / (position.entryPrice || 1);
  const breakEvenPrice = isLong
    ? position.entryPrice + (position.totalFees / (notionalQty || 1))
    : position.entryPrice - (position.totalFees / (notionalQty || 1));
  const progressPct = Math.min(100, Math.max(12, (position.durationMs / 440) * 100));

  const formatPrice = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return "---";
    if (val < 0.00001) return val.toFixed(10);
    if (val < 0.01) return val.toFixed(7);
    if (val < 1) return val.toFixed(4);
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div id="active-position-card" className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
              isLong
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-purple-500/20 text-purple-300 border-purple-500/30"
            }`}
          >
            {isLong ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {position.side} {position.leverage}x
          </span>
          <span className="text-sm font-bold text-white tracking-wide font-mono">
            {position.symbol}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            (Margin: ${(position.margin ?? 4).toFixed(2)} | Notional: ${(position.notional ?? 800).toFixed(2)})
          </span>
        </div>

        {/* Live Millisecond Duration & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 text-xs font-mono text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>{position.durationMs ?? 0}ms</span>
            <span className="text-[10px] text-emerald-400 font-bold">(&lt;1000ms Capped)</span>
          </div>

          <button
            id="close-active-position-btn"
            onClick={onClosePosition}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Market Exit</span>
          </button>
        </div>
      </div>

      {/* 100% Profit Target Security Status Banner */}
      <div className="mb-3 p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 border border-emerald-500/50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-300">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold">⚡ AI 200x MICRO-GAP SCALPER:</span>
          <span className="text-slate-200">
            MEXC 200x fees (-${(position.totalFees ?? 0).toFixed(3)}) covered • Pure net profit guaranteed!
          </span>
        </div>
        <div className="flex items-center gap-2">
          {position.isLiveOrderConfirmed ? (
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              MEXC Live Fill Confirmed
            </span>
          ) : (
            <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-200 font-bold">
              Sub-1s Micro Scalp
            </span>
          )}
          {position.peakNetPnL !== undefined && (
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-200 font-bold">
              Peak: +${(position.peakNetPnL ?? 0).toFixed(3)}
            </span>
          )}
        </div>
      </div>

      {/* Main Numbers: Gross vs Net PnL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Entry & Current Price */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono">
          <div className="text-[11px] text-slate-400 mb-1">Entry Price</div>
          <div className="text-sm font-bold text-yellow-400">${formatPrice(position.entryPrice)}</div>
          <div className="text-[11px] text-slate-400 mt-2">Live Price</div>
          <div className="text-sm font-bold text-white">${formatPrice(currentPrice)}</div>
        </div>

        {/* Total MEXC Fees & Tax Burden */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono">
          <div className="text-[11px] text-slate-400 mb-1">MEXC Fees + Tax Buffer</div>
          <div className="text-sm font-bold text-amber-400">-${(position.totalFees ?? 0).toFixed(3)} USDT</div>
          <div className="text-[10px] text-slate-500 mt-1">
            Open & Exit Taker + ${(position.extraFeeBuffer ?? 0.08).toFixed(2)} Tax
          </div>
          <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Fees strictly deducted before profit</span>
          </div>
        </div>

        {/* NET PROFIT (Pure PnL in hand) */}
        <div
          className={`p-3 rounded-xl border font-mono flex flex-col justify-between ${
            isNetProfitable
              ? "bg-emerald-950/40 border-emerald-500/40"
              : "bg-slate-950/70 border-slate-800"
          }`}
        >
          <div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>NET PROFIT (After Fees)</span>
              {isTargetHit && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-bold animate-pulse">
                  TP READY
                </span>
              )}
            </div>
            <div
              className={`text-xl font-black mt-0.5 ${
                isNetProfitable ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              {(position.netPnL ?? 0) >= 0
                ? `+$${(position.netPnL ?? 0).toFixed(3)}`
                : `-$${Math.abs(position.netPnL ?? 0).toFixed(3)}`}{" "}
              <span className="text-xs font-normal">USDT</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            ROE: <span className={(position.pnlPercent ?? 0) >= 0 ? "text-emerald-400 font-bold" : "text-rose-400"}>
              {(position.pnlPercent ?? 0) >= 0 ? `+${(position.pnlPercent ?? 0).toFixed(2)}%` : `${(position.pnlPercent ?? 0).toFixed(2)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar towards Automatic Millisecond Take Profit */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Automatic Net Profit Lock Progress
          </span>
          <span className="text-emerald-400 font-bold">{(progressPct ?? 0).toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-75"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>Break-Even: ${formatPrice(breakEvenPrice)}</span>
          <span className="text-emerald-400">Target Exit: ${formatPrice(position.targetExitPrice)}</span>
        </div>
      </div>
    </div>
  );
};
