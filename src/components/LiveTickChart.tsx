import React, { useEffect, useRef } from "react";
import { TickDataPoint, Position } from "../types";
import { TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface LiveTickChartProps {
  ticks: TickDataPoint[];
  currentPrice: number;
  symbol: string;
  position: Position | null;
  velocity: number;
  tickRatePerSec: number;
}

export const LiveTickChart: React.FC<LiveTickChartProps> = ({
  ticks,
  currentPrice,
  symbol,
  position,
  velocity,
  tickRatePerSec,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI crisp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    if (ticks.length < 2) {
      ctx.fillStyle = "#64748b";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Streaming MEXC Futures millisecond ticks...", width / 2, height / 2);
      return;
    }

    // Determine min and max
    let minPrice = Math.min(...ticks.map((t) => t.price));
    let maxPrice = Math.max(...ticks.map((t) => t.price));

    // Include position levels in chart scale if active
    if (position) {
      minPrice = Math.min(minPrice, position.entryPrice, position.targetExitPrice, position.liquidationPrice);
      maxPrice = Math.max(maxPrice, position.entryPrice, position.targetExitPrice);
    }

    // Add padding to price range
    const range = Math.max(maxPrice - minPrice, currentPrice * 0.0005);
    const paddedMin = minPrice - range * 0.15;
    const paddedMax = maxPrice + range * 0.15;
    const priceSpan = paddedMax - paddedMin || 1;

    const getY = (price: number) => {
      const normalized = (price - paddedMin) / priceSpan;
      return height - 20 - normalized * (height - 40);
    };

    const getX = (index: number) => {
      return (index / (ticks.length - 1)) * (width - 70) + 10;
    };

    // Draw subtle grid lines
    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let i = 1; i <= 3; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(width - 60, y);
      ctx.stroke();

      const priceVal = paddedMax - (i / 4) * priceSpan;
      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(priceVal.toFixed(currentPrice < 1 ? 6 : 2), width - 55, y + 3);
    }
    ctx.setLineDash([]);

    // Draw Position horizontal indicator lines
    if (position) {
      // 1. Entry line (Yellow)
      const entryY = getY(position.entryPrice);
      ctx.strokeStyle = "rgba(234, 179, 8, 0.85)";
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, entryY);
      ctx.lineTo(width - 60, entryY);
      ctx.stroke();
      ctx.fillStyle = "#eab308";
      ctx.font = "10px monospace";
      ctx.fillText("ENTRY", width - 55, entryY + 3);

      // 2. Break-even (Fees & Tax Covered) line (Cyan)
      const breakEvenPrice = position.entryPrice + (position.totalFees / (position.notional / position.entryPrice));
      const beY = getY(breakEvenPrice);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.85)";
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, beY);
      ctx.lineTo(width - 60, beY);
      ctx.stroke();
      ctx.fillStyle = "#06b6d4";
      ctx.fillText("FEES COVERED", width - 55, beY + 3);

      // 3. Take Profit Target (Emerald)
      const tpY = getY(position.targetExitPrice);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
      ctx.setLineDash([4, 2]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, tpY);
      ctx.lineTo(width - 60, tpY);
      ctx.stroke();
      ctx.fillStyle = "#10b981";
      ctx.fillText("TARGET TP", width - 55, tpY + 3);

      ctx.setLineDash([]);
    }

    // Draw price area gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (velocity >= 0) {
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.25)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
    } else {
      gradient.addColorStop(0, "rgba(244, 63, 94, 0.2)");
      gradient.addColorStop(1, "rgba(244, 63, 94, 0.0)");
    }

    ctx.beginPath();
    ticks.forEach((tick, idx) => {
      const x = getX(idx);
      const y = getY(tick.price);
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Close area to bottom
    const lastX = getX(ticks.length - 1);
    ctx.lineTo(lastX, height - 20);
    ctx.lineTo(getX(0), height - 20);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw price trajectory line
    ctx.beginPath();
    ctx.strokeStyle = velocity >= 0 ? "#10b981" : "#f43f5e";
    ctx.lineWidth = 2.2;
    ticks.forEach((tick, idx) => {
      const x = getX(idx);
      const y = getY(tick.price);
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw pulse dot at current tick
    const currentY = getY(currentPrice);
    ctx.beginPath();
    ctx.arc(lastX, currentY, 5, 0, Math.PI * 2);
    ctx.fillStyle = velocity >= 0 ? "#10b981" : "#f43f5e";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [ticks, currentPrice, position, velocity]);

  const isUpward = velocity >= 0;

  return (
    <div id="live-tick-chart-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
      {/* Chart Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
            {symbol} Micro-Tick Stream
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            60 FPS LIVE
          </span>
        </div>

        {/* Micro-Velocity status badge */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 text-[11px]">Tick Velocity:</span>
            <span className={`font-bold flex items-center ${isUpward ? "text-emerald-400" : "text-rose-400"}`}>
              {isUpward ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {velocity >= 0 ? `+${velocity.toFixed(4)}` : velocity.toFixed(4)}
            </span>
          </div>

          <div className="bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60 text-slate-300 text-[11px]">
            {tickRatePerSec} ticks/s
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="relative w-full h-56 sm:h-64 bg-slate-950/60 rounded-xl overflow-hidden border border-slate-800/80">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Dynamic Legend */}
        <div className="absolute bottom-2 left-3 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-slate-800">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Live Price
          </span>
          {position && (
            <>
              <span className="flex items-center gap-1 text-yellow-400">
                <span className="w-2.5 h-0.5 bg-yellow-400 inline-block" /> Entry
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> Fee Cover (+Tax)
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Net TP Exit
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
