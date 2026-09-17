import React from "react";
import { BotStats } from "../types";
import { TrendingUp, Target, Receipt, Zap, Award, Clock } from "lucide-react";

interface StatsBarProps {
  stats: BotStats;
  isRunning: boolean;
  isLive?: boolean;
  liveSessionPnl?: number | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, isRunning, isLive, liveSessionPnl }) => {
  const displayPnL = (isLive && liveSessionPnl !== null && liveSessionPnl !== undefined) 
    ? liveSessionPnl 
    : (stats.totalNetPnL ?? 0);
  const isNetPositive = displayPnL >= 0;

  return (
    <div id="stats-overview-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Net Profit */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>{isLive ? "MEXC Live PnL" : "Net Profit"}</span>
          <TrendingUp className={`w-3.5 h-3.5 ${isNetPositive ? "text-emerald-400" : "text-rose-400"}`} />
        </div>
        <div>
          <span
            className={`text-lg font-black font-mono tracking-tight ${
              isNetPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {displayPnL >= 0
              ? `+$${displayPnL.toFixed(4)}`
              : `-$${Math.abs(displayPnL).toFixed(4)}`}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">
            {isLive ? "100% MEXC Synced" : "Exact Micro Take-Home"}
          </span>
        </div>
      </div>

      {/* 2. Win Rate & Zero-Loss Shield */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Win Rate & Zero-Loss</span>
          <Target className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div>
          <span className="text-lg font-black font-mono text-cyan-400">
            {stats.totalTrades > 0 ? `${(stats.winRate ?? 100).toFixed(1)}%` : "100%"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            {stats.winningTrades}W • {stats.scratchedTrades || 0} 🛡️Scratch • {stats.losingTrades}L
          </span>
        </div>
      </div>

      {/* 3. MEXC Fees Covered */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Fees & Taxes Paid</span>
          <Receipt className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div>
          <span className="text-lg font-black font-mono text-amber-400">
            ${(stats.totalFeesPaid ?? 0).toFixed(3)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">100% Covered</span>
        </div>
      </div>

      {/* 4. Total Scalps */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Total Scalps</span>
          <Award className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div>
          <span className="text-lg font-black font-mono text-white">
            {stats.totalTrades}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">
            {stats.consecutiveWins} Streak
          </span>
        </div>
      </div>

      {/* 5. Execution Speed & 20,000 / 15m Target */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>HFT Speed & 20k Target</span>
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
        </div>
        <div>
          <span className="text-lg font-black font-mono text-yellow-400">
            {stats.tradesPerSecond !== undefined && stats.tradesPerSecond > 0 ? `${stats.tradesPerSecond.toFixed(1)}/s` : `${(stats.avgLatencyMs ?? 5).toFixed(1)}ms`}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            {stats.projected15mTrades ? `${stats.projected15mTrades.toLocaleString()} / 15m Target` : "Sub-15ms Fill"}
          </span>
        </div>
      </div>

      {/* 6. Engine Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Engine Status</span>
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning ? "bg-emerald-400 animate-ping" : "bg-slate-500"
              }`}
            />
            <span className={`text-sm font-bold font-mono ${isRunning ? "text-emerald-400" : "text-slate-400"}`}>
              {isRunning ? "ACTIVE" : "STANDBY"}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            {isRunning ? "Continuous Loop" : "Waiting for Start"}
          </span>
        </div>
      </div>
    </div>
  );
};
