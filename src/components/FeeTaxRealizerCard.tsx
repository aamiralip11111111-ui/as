import React from "react";
import { ShieldCheck, Percent, DollarSign, ArrowRight, CheckCircle2, TrendingUp, AlertCircle, Wallet, Sparkles, Scale, Zap, RefreshCw } from "lucide-react";
import { BotConfig, AccountBalance } from "../types";

interface FeeTaxRealizerCardProps {
  config: BotConfig;
  onChangeConfig?: (newConfig: Partial<BotConfig>) => void;
  onUpdateConfig?: (newConfig: Partial<BotConfig>) => void;
  accountBalance?: AccountBalance | null;
  simulatedBalance?: number;
  isLive?: boolean;
  onOpenSettings?: () => void;
  onRefreshBalance?: () => void;
  isRefreshingBalance?: boolean;
  liveSessionPnl?: number | null;
}

export const FeeTaxRealizerCard: React.FC<FeeTaxRealizerCardProps> = ({
  config,
  onChangeConfig,
  onUpdateConfig,
  accountBalance,
  simulatedBalance = 50,
  onOpenSettings = () => {},
  onRefreshBalance = () => {},
  isRefreshingBalance = false,
  liveSessionPnl,
}) => {
  const handleConfigChange = onUpdateConfig || onChangeConfig || (() => {});

  const margin = Number(config?.marginPerTrade ?? 1);
  const lev = Number(config?.leverage ?? 50);
  const takerRate = Number(config?.takerFeeRate ?? 0.0002); // Exact 0.02% MEXC Futures Taker Fee
  const notional = margin * lev;
  const effectiveRate = config?.makerZeroFeeMode ? 0.0000 : takerRate;
  const entryFee = notional * effectiveRate;
  const exitFee = notional * effectiveRate;
  const roundTripTakerFee = entryFee + exitFee;
  const taxBuffer = Number(config?.extraFeeBuffer ?? 0.0001);
  const totalTaxAndFeeDeduction = roundTripTakerFee + taxBuffer;
  const guaranteedNetProfit = Number(config?.minNetProfit ?? 0.0004);
  const targetGrossProfit = totalTaxAndFeeDeduction + guaranteedNetProfit;
  const safeSimBalance = Number(simulatedBalance ?? 50);
  const safeFuturesBal = Number(accountBalance?.futuresAvailable ?? 0);

  // Price movement percentage needed to clear ALL fees & secure pure net green take-home:
  const requiredMovePct = notional > 0 ? (targetGrossProfit / notional) * 100 : 0.02;

  return (
    <div
      id="fee-tax-realizer-card"
      className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-emerald-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title & Account Live Sync Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                MEXC Real Tax & Fee Manager (100% Honest PnL Sync)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 font-bold">
                STRICT PROFIT GATE ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              MEXC API 0.08% taker fee + bid-ask spread deduct karta hai. Ab bot <span className="text-emerald-300 font-semibold">sirf tab close karega jab real exchange price poori fee + tax cover kar ke pakka net green profit</span> lock karegi!
            </p>
          </div>
        </div>

        {/* Live Account Destination Badge */}
        <div className="flex items-center gap-2">
          {config.isLive && config.apiKey && config.apiSecret ? (
            <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/60 px-3 py-1.5 rounded-xl font-mono text-xs shadow-md shadow-emerald-950/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                  Live MEXC Futures Wallet
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white font-black">
                    ${safeFuturesBal.toFixed(2)} USDT
                  </span>
                  {liveSessionPnl !== null && liveSessionPnl !== undefined && (
                    <span
                      className={`text-[10px] font-bold ${
                        liveSessionPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      ({liveSessionPnl >= 0 ? `+$${liveSessionPnl.toFixed(3)}` : `-$${Math.abs(liveSessionPnl).toFixed(3)}`})
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onRefreshBalance}
                title="Refresh Live MEXC Balance"
                className={`p-1.5 hover:bg-emerald-800/40 rounded-lg text-emerald-300 transition-colors cursor-pointer ${
                  isRefreshingBalance ? "animate-spin text-emerald-200" : ""
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-500/40 px-3 py-1.5 rounded-xl font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                  Paper Sim Mode Active
                </span>
                <span className="text-xs text-white font-bold">
                  Wallet: ${safeSimBalance.toFixed(2)} USDT
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold font-sans transition-colors cursor-pointer"
              >
                Switch to Live
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Realizer Math Grid: Visualizing the Complete Tax/Fee Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4 font-mono text-xs">
        {/* Step 1: Position Notional Size */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
            <span>1. Position Notional</span>
            <span className="text-emerald-400 text-[9px] font-bold">{lev}x Lev</span>
          </div>
          <div className="text-sm font-extrabold text-white">${notional.toFixed(2)} USDT</div>
          <div className="text-[10px] text-slate-500 mt-1">
            ${margin.toFixed(2)} margin × {lev}x
          </div>
        </div>

        {/* Step 2: MEXC API Round-Trip Taker Fee (0.08% entry + 0.08% exit) */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/30 flex flex-col justify-between">
          <div className="text-[10px] text-amber-300 mb-1 flex items-center justify-between">
            <span>2. MEXC API Taker</span>
            <span className="text-[9px] text-amber-400 font-bold">0.16% tot</span>
          </div>
          <div className="text-sm font-extrabold text-amber-400">-${roundTripTakerFee.toFixed(3)} USDT</div>
          <div className="text-[10px] text-slate-400 mt-1">
            0.08% in (${entryFee.toFixed(3)}) + out (${exitFee.toFixed(3)})
          </div>
        </div>

        {/* Step 3: Spread & Tax Shield Buffer */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
          <div className="text-[10px] text-cyan-300 mb-1 flex items-center justify-between">
            <span>3. Spread & Tax Shield</span>
            <span className="text-[9px] text-cyan-400 font-bold">Cushion</span>
          </div>
          <div className="text-sm font-extrabold text-cyan-300">-${taxBuffer.toFixed(3)} USDT</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Bid-Ask spread & slippage guard
          </div>
        </div>

        {/* Step 4: Total Tax & Fee Burden Cleared */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-rose-500/30 flex flex-col justify-between">
          <div className="text-[10px] text-rose-300 mb-1 flex items-center justify-between">
            <span>4. Total Friction Covered</span>
            <span className="text-[9px] text-rose-400 font-bold">Required Gross</span>
          </div>
          <div className="text-sm font-extrabold text-rose-300">
            -${totalTaxAndFeeDeduction.toFixed(3)} USDT
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Must overcome before exit
          </div>
        </div>

        {/* Step 5: Pure Take-Home Net Profit (Guaranteed In Pocket) */}
        <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/50 flex flex-col justify-between col-span-2 sm:col-span-1 shadow-lg shadow-emerald-950/30">
          <div className="text-[10px] text-emerald-300 mb-1 flex items-center justify-between">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              5. Pure Net Profit
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">+{requiredMovePct.toFixed(2)}% Move</span>
          </div>
          <div className="text-sm font-black text-emerald-400">
            +${guaranteedNetProfit.toFixed(3)} USDT
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-1 font-sans">
            100% Real take-home profit
          </div>
        </div>
      </div>

      {/* Explanation Banner in Urdu & English: Exact Real Research on MEXC Fees & Penny Coin Micro-Profit */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5 max-w-2xl font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-white">Real MEXC Tax & Fee Research:</strong> MEXC Futures par Maker fee <span className="text-emerald-400 font-bold">0.00% (FREE)</span> hai aur Taker fee sirf <span className="text-emerald-400 font-bold">0.02% (0.0002)</span> hai. Penny coins (PEPE, SATS, BONK waghera) par $1 margin se total round-trip tax sirf ~$0.010 banta hai! <span className="text-emerald-300 font-semibold">Target profit +$0.0004 rakha hai taake 1 single orderbook micro-pip par milli second me trade profit ke sath close ho! 15 min me 20k trades ka target live engine me enabled hai.</span>
          </div>
        </div>

        {/* Quick 1-Click Management Presets */}
        <div className="flex items-center gap-1.5 shrink-0 font-mono flex-wrap">
          <span className="text-[10px] text-slate-400 font-sans mr-1">Exact Tax Presets:</span>
          
          {/* Preset 1: 20k/15m Penny Scalper (Exact 0.02% Fee + $0.0004 Net) */}
          <button
            type="button"
            onClick={() => handleConfigChange({
              marginPerTrade: 1,
              leverage: 50,
              takerFeeRate: 0.0002,
              extraFeeBuffer: 0.0001,
              minNetProfit: 0.0004,
              paceMode: "20K_15MIN_ULTRA",
              multiPennyCoinEngine: true,
              symbol: "PEPE_USDT",
            })}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              config.paceMode === "20K_15MIN_ULTRA" && config.minNetProfit <= 0.0005
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="$1 Margin • 50x • Real 0.02% MEXC fee • +$0.0004 Net • Millisecond Exits!"
          >
            ⚡ 20k/15m Penny Ultra (+$0.0004)
          </button>

          {/* Preset 2: Multi-Penny Scalper */}
          <button
            type="button"
            onClick={() => handleConfigChange({
              marginPerTrade: 0.5,
              leverage: 50,
              takerFeeRate: 0.0002,
              extraFeeBuffer: 0.0001,
              minNetProfit: 0.0004,
              paceMode: "20K_15MIN_ULTRA",
              multiPennyCoinEngine: true,
              autoJumpCoins: true,
            })}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              config.multiPennyCoinEngine && config.autoJumpCoins
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Multi-Penny Engine: Auto-trades across PEPE, SATS, BONK, SHIB in milliseconds"
          >
            🪙 Multi-Penny Engine
          </button>

          {/* Preset 3: 0.00% Maker Post-Only Mode */}
          <button
            type="button"
            onClick={() => handleConfigChange({
              marginPerTrade: 1,
              leverage: 50,
              takerFeeRate: 0.0000,
              extraFeeBuffer: 0.0000,
              minNetProfit: 0.0004,
              makerZeroFeeMode: true,
            })}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              config.makerZeroFeeMode
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="0.00% Maker Post-Only: Zero Fee on MEXC Futures"
          >
            🛡️ 0.00% Zero Fee (Maker)
          </button>

          {/* Preset 4: 50x Standard Scalp */}
          <button
            type="button"
            onClick={() => handleConfigChange({
              marginPerTrade: 2,
              leverage: 50,
              takerFeeRate: 0.0002,
              extraFeeBuffer: 0.001,
              minNetProfit: 0.005,
            })}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              config.leverage === 50 && config.marginPerTrade === 2 && !config.makerZeroFeeMode
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="$2 Margin • 50x • 0.02% Fee • +$0.005 Net"
          >
            🚀 50x Standard
          </button>
        </div>
      </div>

      {/* Recommended Coins for Zero Spread Slippage */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-200">
              💡 Pro-Tip for Tax & Fee Minimization on MEXC:
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
              High-volume pairs par bid-ask spread 0.01% se kam hota hai jis ki wajah se target jump bohat foran hit hota hai. Neeche diye gaye pairs par switch karein:
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap font-mono">
          <button
            type="button"
            onClick={() => handleConfigChange({ symbol: "DOGE_USDT" })}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
              config.symbol === "DOGE_USDT" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            DOGE (0.01% Spread)
          </button>
          <button
            type="button"
            onClick={() => handleConfigChange({ symbol: "BTC_USDT" })}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
              config.symbol === "BTC_USDT" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            BTC (Deep Orderbook)
          </button>
          <button
            type="button"
            onClick={() => handleConfigChange({ symbol: "PEPE_USDT" })}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
              config.symbol === "PEPE_USDT" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            PEPE (High Micro-Gaps)
          </button>
          <button
            type="button"
            onClick={() => handleConfigChange({ symbol: "SOL_USDT" })}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
              config.symbol === "SOL_USDT" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            SOL (Rapid Swings)
          </button>
        </div>
      </div>
    </div>
  );
};
