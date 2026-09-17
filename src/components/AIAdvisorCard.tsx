import React, { useState } from "react";
import { Sparkles, BrainCircuit, RefreshCw, Check, ArrowRight, Zap, Bot, ShieldCheck } from "lucide-react";
import { AIRegimeAnalysis } from "../types";

interface AIAdvisorCardProps {
  analysis: AIRegimeAnalysis | null;
  loading: boolean;
  onRefreshAI: () => void;
  onApplyRecommendation: (recProfit: number) => void;
  symbol: string;
  aiAutoPilot: boolean;
  onToggleAiAutoPilot: (enabled: boolean) => void;
  onForceAiTrade?: () => void;
  isEngineRunning: boolean;
  hasOpenPosition: boolean;
}

export const AIAdvisorCard: React.FC<AIAdvisorCardProps> = ({
  analysis,
  loading,
  onRefreshAI,
  onApplyRecommendation,
  symbol,
  aiAutoPilot,
  onToggleAiAutoPilot,
  onForceAiTrade,
  isEngineRunning,
  hasOpenPosition,
}) => {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (analysis?.microTakeProfitRecommendation) {
      onApplyRecommendation(analysis.microTakeProfitRecommendation);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  const isBullish = analysis?.actionRecommendation === "AGGRESSIVE_SCALP" || 
                    analysis?.actionRecommendation === "MODERATE_SCALP" ||
                    (analysis?.momentumScore ?? 0) >= 65;

  return (
    <div id="ai-advisor-card" className="bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Gemini AI Strongest Scalp Engine
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                gemini-3.8-flash
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Autonomous micro-regime detection & fee-aware entry optimizer for {symbol}
            </span>
          </div>
        </div>

        {/* AI Actions: Autopilot Switch & Re-scan */}
        <div className="flex items-center gap-2">
          {/* Autopilot toggle */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-mono transition-all ${
            aiAutoPilot 
              ? "bg-purple-950/80 border-purple-500/60 text-purple-200" 
              : "bg-slate-800/60 border-slate-700 text-slate-400"
          }`}>
            <input
              type="checkbox"
              id="ai-autopilot-toggle"
              checked={aiAutoPilot}
              onChange={(e) => onToggleAiAutoPilot(e.target.checked)}
              className="w-3.5 h-3.5 text-purple-500 bg-slate-900 border-purple-500 rounded focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="ai-autopilot-toggle" className="cursor-pointer select-none font-bold flex items-center gap-1">
              <Bot className="w-3 h-3 text-purple-400" />
              <span>AI Auto-Pilot {aiAutoPilot ? "ON" : "OFF"}</span>
            </label>
          </div>

          <button
            id="refresh-ai-btn"
            onClick={onRefreshAI}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-purple-400" : "text-slate-400"}`} />
            <span>{loading ? "Analyzing..." : "Re-Scan"}</span>
          </button>
        </div>
      </div>

      {/* AI Assessment Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        {/* Regime Badge */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Market Regime & Confidence</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs">
              {analysis?.regime?.replace(/_/g, " ") || "BULLISH SURGE"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
            <span>Momentum: <strong className="text-purple-300 font-bold">{analysis?.momentumScore || 85}/100</strong></span>
            <span className={`px-1.5 py-0.2 rounded font-bold ${isBullish ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" : "bg-amber-950/80 text-amber-400 border border-amber-800"}`}>
              {analysis?.actionRecommendation || "AGGRESSIVE_SCALP"}
            </span>
          </div>
        </div>

        {/* Urdu & English Trader Guidance */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 md:col-span-2 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Strategy Insight (Urdu / English)
            </span>
            <div className="flex items-center gap-2">
              {analysis?.microTakeProfitRecommendation && (
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors"
                >
                  {applied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Target Set</span>
                    </>
                  ) : (
                    <>
                      <span>Set Profit ${analysis.microTakeProfitRecommendation}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </>
                  )}
                </button>
              )}

              {onForceAiTrade && (
                <button
                  onClick={onForceAiTrade}
                  disabled={hasOpenPosition}
                  className={`flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded font-bold transition-all ${
                    hasOpenPosition
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm shadow-purple-900/40 cursor-pointer"
                  }`}
                  title="Execute an instant 200x scalp order authorized by AI"
                >
                  <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>Execute AI Trade</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-200 text-xs font-sans leading-relaxed">
            {analysis?.riskAnalysisUrduEnglish ||
              "Market me micro-surge hai. 200x leverage par fees ($0.06 buffer) cover hotay hi bot turant profit nikal kar hat jaye ga."}
          </p>
          {aiAutoPilot && (
            <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-purple-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                AI Strongest Auto-Pilot Active: Bot will auto-open 200x trades when AI signals Bullish momentum.
              </span>
              <span className="font-bold text-emerald-400">
                {isEngineRunning ? "🟢 Engine Running" : "⚠️ Start Engine to Enable"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
