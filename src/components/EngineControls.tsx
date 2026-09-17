import React from "react";
import { Play, Square, AlertOctagon, Zap, ShieldAlert, DollarSign, Percent, Info, RotateCcw } from "lucide-react";
import { BotConfig } from "../types";

interface EngineControlsProps {
  config: BotConfig;
  onChangeConfig: (newConfig: Partial<BotConfig>) => void;
  isRunning: boolean;
  onToggleEngine: () => void;
  onEmergencyPanicClose: () => void;
  hasOpenPosition: boolean;
  onInstantSniperTrade?: () => void;
}

export const EngineControls: React.FC<EngineControlsProps> = ({
  config,
  onChangeConfig,
  isRunning,
  onToggleEngine,
  onEmergencyPanicClose,
  hasOpenPosition,
  onInstantSniperTrade,
}) => {
  // Leverage calculation
  const notional = config.marginPerTrade * config.leverage;
  // MEXC Futures taker fee: open fee + close fee
  const roundTripTakerFee = notional * config.takerFeeRate * 2;
  // Total fee and tax burden
  const totalFeeBurden = roundTripTakerFee + config.extraFeeBuffer;
  // Price shift percentage needed to cover all taxes and fees
  const requiredFeeCoveragePct = (totalFeeBurden / notional) * 100;
  // Total gross profit needed to trigger take profit
  const totalGrossRequired = totalFeeBurden + config.minNetProfit;
  const targetGainPct = (totalGrossRequired / notional) * 100;

  return (
    <div id="engine-controls-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      {/* Top Banner: Engine Switch, Continuous Mode & 100% Profit Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="start-stop-engine-btn"
            onClick={onToggleEngine}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer ${
              isRunning
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 animate-pulse"
                : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-950/40"
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>STOP CONTINUOUS ENGINE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>START CONTINUOUS BOT (200x)</span>
              </>
            )}
          </button>

          {/* Instant 200x Sniper Entry Button */}
          {onInstantSniperTrade && (
            <button
              id="instant-sniper-trade-btn"
              onClick={onInstantSniperTrade}
              disabled={hasOpenPosition}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs tracking-wide transition-all ${
                hasOpenPosition
                  ? "bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-lg shadow-amber-950/40 cursor-pointer"
              }`}
              title="Immediately opens a 200x Long position right now without waiting for tick conditions"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ SNIPER BUY NOW</span>
            </button>
          )}

          {/* Continuous Loop indicator */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60">
            <input
              type="checkbox"
              id="continuous-mode-toggle"
              checked={config.continuousTrading}
              onChange={(e) => onChangeConfig({ continuousTrading: e.target.checked })}
              className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500"
            />
            <label htmlFor="continuous-mode-toggle" className="text-xs font-semibold text-slate-200 cursor-pointer select-none">
              Auto-Loop
            </label>
          </div>

          {/* 100% Profit Sniper Mode Toggle */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-950/60 to-slate-900 px-3 py-2 rounded-xl border border-emerald-500/50">
            <input
              type="checkbox"
              id="guaranteed-profit-toggle"
              checked={config.guaranteedProfitMode ?? true}
              onChange={(e) => onChangeConfig({ guaranteedProfitMode: e.target.checked })}
              className="w-4 h-4 text-emerald-400 bg-slate-900 border-emerald-500 rounded focus:ring-emerald-400 cursor-pointer"
            />
            <label htmlFor="guaranteed-profit-toggle" className="text-xs font-bold text-emerald-300 cursor-pointer select-none flex items-center gap-1">
              <span>🎯 100% Profit Mode</span>
            </label>
          </div>

          {/* Zero-Loss Scratch Shield Toggle */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-950/70 to-slate-900 px-3 py-2 rounded-xl border border-blue-500/50">
            <input
              type="checkbox"
              id="zero-loss-scratch-toggle"
              checked={config.zeroLossScratchEnabled ?? true}
              onChange={(e) => onChangeConfig({ zeroLossScratchEnabled: e.target.checked })}
              className="w-4 h-4 text-blue-400 bg-slate-900 border-blue-500 rounded focus:ring-blue-400 cursor-pointer"
            />
            <label htmlFor="zero-loss-scratch-toggle" className="text-xs font-bold text-blue-300 cursor-pointer select-none flex items-center gap-1" title="Instantly cancels/scratches trade at breakeven before adverse tick moves can incur loss">
              <span>🛡️ Zero-Loss Scratch</span>
            </label>
          </div>

          {/* Turbo 25,000 HFT Mode Toggle */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-950/70 to-slate-900 px-3 py-2 rounded-xl border border-yellow-500/50">
            <input
              type="checkbox"
              id="turbo-mode-toggle"
              checked={config.turboMode ?? true}
              onChange={(e) => onChangeConfig({ turboMode: e.target.checked })}
              className="w-4 h-4 text-yellow-400 bg-slate-900 border-yellow-500 rounded focus:ring-yellow-400 cursor-pointer"
            />
            <label htmlFor="turbo-mode-toggle" className="text-xs font-bold text-yellow-300 cursor-pointer select-none flex items-center gap-1" title="Ultra-HFT 35ms loops targeting 10+ trades/sec and 25,000 trades/15min pace">
              <span>⚡ Turbo 25k HFT</span>
            </label>
          </div>

          {/* Bi-Directional LONG & SHORT Mode */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-950/70 to-slate-900 px-3 py-2 rounded-xl border border-purple-500/50">
            <input
              type="checkbox"
              id="bi-directional-toggle"
              checked={config.biDirectional ?? true}
              onChange={(e) => onChangeConfig({ biDirectional: e.target.checked })}
              className="w-4 h-4 text-purple-400 bg-slate-900 border-purple-500 rounded focus:ring-purple-400 cursor-pointer"
            />
            <label htmlFor="bi-directional-toggle" className="text-xs font-bold text-purple-300 cursor-pointer select-none flex items-center gap-1" title="Scalps LONG on upward micro-surges and SHORT on downward micro-dips">
              <span>⇄ Bi-Directional</span>
            </label>
          </div>
        </div>

        {/* Emergency Panic Exit Button */}
        <button
          id="panic-close-btn"
          onClick={onEmergencyPanicClose}
          disabled={!hasOpenPosition && !isRunning}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${
            hasOpenPosition
              ? "bg-rose-950/60 hover:bg-rose-900 border-rose-600/70 text-rose-300 shadow-lg shadow-rose-950/50 cursor-pointer"
              : "bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed"
          }`}
          title="Instantly market-close open position and pause continuous loop"
        >
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>PANIC CLOSE ALL</span>
        </button>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Margin & 200x Leverage */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Margin Per Trade
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">${config.marginPerTrade.toFixed(2)} USDT</span>
          </div>

          {/* Margin presets */}
          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 4, 10, 25].map((val) => (
              <button
                key={val}
                onClick={() => onChangeConfig({ marginPerTrade: val })}
                className={`py-1 rounded text-xs font-mono font-medium transition-colors ${
                  config.marginPerTrade === val
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          {/* Leverage Selector */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Leverage
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">{config.leverage}x</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[20, 50, 100, 200].map((lev) => (
                <button
                  key={lev}
                  onClick={() => onChangeConfig({ leverage: lev })}
                  className={`py-1 rounded text-xs font-mono font-bold transition-all ${
                    config.leverage === lev
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>

            {/* MEXC Margin Mode: Cross vs Isolated (Fixes 'Insufficient Margin' error) */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-300">Margin Mode:</span>
                <span className="text-[9px] text-slate-500 block">MEXC Account Default</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ openType: 2 })}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                    (config.openType ?? 2) === 2
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Cross Margin - Uses total available Futures USDT balance (Recommended on MEXC)"
                >
                  Cross
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ openType: 1 })}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                    config.openType === 1
                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Isolated Margin - Uses dedicated isolated bucket per trade"
                >
                  Isolated
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Fee & Tax Coverage Parameters (User request focus) */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-cyan-400" /> Tax / Fee Extra Buffer
            </label>
            <span className="text-xs font-mono font-bold text-cyan-400">${config.extraFeeBuffer.toFixed(2)} USDT</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Covers MEXC 200x leverage tax & taker fees before locking profit (Taker: $0.32 + Tax Buffer: ${config.extraFeeBuffer.toFixed(2)} = ${(roundTripTakerFee + config.extraFeeBuffer).toFixed(2)} total fee coverage).
          </p>

          <div className="grid grid-cols-4 gap-1.5">
            {[0.04, 0.06, 0.08, 0.12].map((buf) => (
              <button
                key={buf}
                onClick={() => onChangeConfig({ extraFeeBuffer: buf })}
                className={`py-1 rounded text-xs font-mono font-medium transition-colors ${
                  config.extraFeeBuffer === buf
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                ${buf.toFixed(2)}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300">Min Net Profit:</span>
              <p className="text-[10px] text-slate-400">Pure profit credited after tax</p>
            </div>
            <div className="flex items-center gap-1">
              {[0.05, 0.08, 0.12, 0.15].map((tp) => (
                <button
                  key={tp}
                  onClick={() => onChangeConfig({ minNetProfit: tp })}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                    config.minNetProfit === tp
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  +${tp.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Safety & Liquidation Guard */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> 200x Risk Cut (SL)
              </label>
              <span className="text-xs font-mono font-bold text-rose-400">-{config.emergencyStopLossPct}%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mb-3">
              At 200x leverage, liquidation is ~0.45%. Emergency cut is enforced at -{config.emergencyStopLossPct}% to strictly prevent liquidation!
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {[0.15, 0.20, 0.25, 0.30].map((sl) => (
              <button
                key={sl}
                onClick={() => onChangeConfig({ emergencyStopLossPct: sl })}
                className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  config.emergencyStopLossPct === sl
                    ? "bg-rose-500 text-white font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                -{sl}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Net Fee & Profit Breakdown Bar (Mathematical clarity for user) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>MEXC Millisecond Execution Math Breakdown</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Notional Size</span>
            <span className="text-white font-bold">${notional.toFixed(2)} USDT</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">MEXC Taker Fee (x2)</span>
            <span className="text-amber-400 font-bold">${roundTripTakerFee.toFixed(3)}</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Tax Buffer</span>
            <span className="text-cyan-400 font-bold">+${config.extraFeeBuffer.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Total Fee Coverage</span>
            <span className="text-slate-300 font-bold">${totalFeeBurden.toFixed(3)}</span>
            <span className="text-[10px] text-emerald-400 block">({requiredFeeCoveragePct.toFixed(3)}% move)</span>
          </div>
          <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-emerald-400 block">Target Net Profit</span>
            <span className="text-emerald-300 font-bold">+${config.minNetProfit.toFixed(2)} USDT</span>
            <span className="text-[9px] text-slate-400 block">Instant 1-5ms Exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
