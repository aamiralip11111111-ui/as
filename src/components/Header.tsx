import React from "react";
import { Zap, Volume2, VolumeX, ShieldCheck, Key, RefreshCw, Wallet } from "lucide-react";
import { MarketTicker, AccountBalance } from "../types";
import { soundFX } from "../utils/audio";

interface HeaderProps {
  ticker: MarketTicker | null;
  activeSymbol: string;
  onSelectSymbol: (sym: string) => void;
  isRunning: boolean;
  isLive: boolean;
  onOpenSettings: () => void;
  latencyMs: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRefreshTicker: () => void;
  serverIp?: string;
  accountBalance?: AccountBalance | null;
  simulatedBalance: number;
  onRefreshBalance?: () => void;
  isRefreshingBalance?: boolean;
}

export const SUPPORTED_PAIRS = [
  { id: "SATS_USDT", label: "SATS (0.0000000098) Micro", prec: 10, isMicro: true },
  { id: "PEPE_USDT", label: "PEPE (0.0000033) Ultra Volatile", prec: 10, isMicro: true },
  { id: "1000000BABYDOGE_USDT", label: "BABYDOGE (0.00035)", prec: 7, isMicro: true },
  { id: "1000BONK_USDT", label: "1000BONK (0.0026)", prec: 6, isMicro: true },
  { id: "1000000MOG_USDT", label: "1000000MOG", prec: 5, isMicro: true },
  { id: "SHIB_USDT", label: "SHIB (0.0000048)", prec: 8, isMicro: true },
  { id: "TURBO_USDT", label: "TURBO (0.00087)", prec: 7, isMicro: true },
  { id: "DOGE_USDT", label: "DOGE/USDT", prec: 4, isMicro: false },
  { id: "BTC_USDT", label: "BTC/USDT", prec: 2, isMicro: false },
  { id: "ETH_USDT", label: "ETH/USDT", prec: 2, isMicro: false },
  { id: "SOL_USDT", label: "SOL/USDT", prec: 2, isMicro: false },
];

function formatCoinPrice(price?: number): string {
  if (price === undefined || price === null || isNaN(price)) return "---";
  if (price < 0.00001) return price.toFixed(10);
  if (price < 0.01) return price.toFixed(7);
  if (price < 1) return price.toFixed(4);
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const Header: React.FC<HeaderProps> = ({
  ticker,
  activeSymbol,
  onSelectSymbol,
  isRunning,
  isLive,
  onOpenSettings,
  latencyMs,
  soundEnabled,
  onToggleSound,
  onRefreshTicker,
  serverIp,
  accountBalance,
  simulatedBalance,
  onRefreshBalance,
  isRefreshingBalance = false,
}) => {
  const priceDisplay = formatCoinPrice(ticker?.lastPrice);

  const change24h = ticker?.riseFallRate ? (ticker.riseFallRate * 100).toFixed(2) : "+0.00";
  const isPositive = Number(change24h) >= 0;

  return (
    <header id="app-header" className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                MEXC <span className="text-emerald-400">MicroScalp</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  200x HFT ULTRA
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Zero-Loss Scratch Protection • 25,000 Trades Pace • Sub-Millisecond Micro-Gap Extraction
            </p>
          </div>
        </div>

        {/* Pair Selector & Live Price */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full">
          <div className="flex items-center gap-1">
            {SUPPORTED_PAIRS.map((pair) => (
              <button
                key={pair.id}
                id={`pair-btn-${pair.id}`}
                onClick={() => onSelectSymbol(pair.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeSymbol === pair.id
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                {pair.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-700 mx-1 hidden md:block" />

          {/* Live Price Tag */}
          <div className="flex items-center gap-2 px-2.5 py-0.5">
            <span className="font-mono font-bold text-white text-sm tracking-wide">
              ${priceDisplay}
            </span>
            <span
              className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded ${
                isPositive ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
              }`}
            >
              {isPositive ? `+${change24h}%` : `${change24h}%`}
            </span>
            <button
              id="refresh-ticker-btn"
              onClick={onRefreshTicker}
              title="Refresh MEXC Ticker"
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Indicators & Action Tools */}
        <div className="flex items-center gap-2">
          {/* Latency badge */}
          <div
            id="latency-badge"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono text-slate-300"
            title="Tick execution loop latency"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{latencyMs.toFixed(1)}ms</span>
          </div>

          {/* Mode Pill */}
          <div
            id="mode-pill"
            onClick={onOpenSettings}
            className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isLive
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                : "bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30"
            }`}
            title="Click to configure MEXC API credentials"
          >
            {isLive ? (
              <>
                <Key className="w-3 h-3 text-amber-300" />
                <span>MEXC LIVE API</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3 text-blue-300" />
                <span>SIM PAPER TRADING</span>
              </>
            )}
          </div>

          {/* Account Balance Display Pill */}
          <div
            id="account-balance-pill"
            onClick={isLive ? onRefreshBalance : onOpenSettings}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
              isLive
                ? accountBalance && accountBalance.totalUsdt > 0
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
                  : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750"
                : "bg-teal-950/60 text-teal-300 border-teal-500/30 hover:bg-teal-900/40"
            }`}
            title={isLive ? "Click to refresh live MEXC Balance" : "Simulated trading balance"}
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex items-center gap-1.5">
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-sans font-normal">
                    {isLive ? "Futures:" : "Sim Balance:"}
                  </span>
                  <span className={`font-extrabold tracking-tight ${isLive && accountBalance && (accountBalance.futuresAvailable ?? 0) < 1 ? "text-amber-300" : "text-white"}`}>
                    ${isLive
                      ? (accountBalance ? (accountBalance.futuresAvailable ?? 0).toFixed(2) : "0.00")
                      : (simulatedBalance ?? 50).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-400">USDT</span>
                </div>
                {isLive && accountBalance && (accountBalance.spotFree ?? 0) > 0 && (
                  <div className="text-[9px] text-slate-400 flex items-center gap-1 justify-end">
                    <span>Spot:</span>
                    <span className="text-slate-300 font-medium">${(accountBalance.spotFree ?? 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            {isLive && onRefreshBalance && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefreshBalance();
                }}
                className={`ml-0.5 text-slate-400 hover:text-emerald-300 transition-transform ${isRefreshingBalance ? "animate-spin text-emerald-400" : ""}`}
                title="Refresh MEXC Balance Now"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Server IP Reference Button */}
          <button
            id="quick-server-ip-btn"
            onClick={onOpenSettings}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-emerald-300 transition-colors"
            title="Click to view and copy Server Outbound IP for MEXC Whitelist"
          >
            <span className="text-slate-400">IP:</span>
            <span>{serverIp || "34.34.254.207"}</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={() => {
              onToggleSound();
              soundFX.playToggle();
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? "bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700"
                : "bg-slate-800/50 border-slate-800 text-slate-500 hover:bg-slate-700"
            }`}
            title={soundEnabled ? "Audio effects active (Click to mute)" : "Audio muted (Click to enable)"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Button */}
          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">API Setup</span>
          </button>
        </div>
      </div>
    </header>
  );
};
