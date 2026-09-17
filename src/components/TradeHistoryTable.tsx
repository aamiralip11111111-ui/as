import React, { useState } from "react";
import { CompletedTrade } from "../types";
import { History, Download, Trash2, ArrowUpRight, CheckCircle, ShieldAlert } from "lucide-react";

interface TradeHistoryTableProps {
  trades: CompletedTrade[];
  onClearHistory: () => void;
}

export const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({ trades, onClearHistory }) => {
  const [filter, setFilter] = useState<"ALL" | "WINS" | "LOSSES">("ALL");

  const filteredTrades = trades.filter((t) => {
    if (filter === "WINS") return t.netPnL > 0;
    if (filter === "LOSSES") return t.netPnL <= 0;
    return true;
  });

  const exportCSV = () => {
    if (trades.length === 0) return;
    const headers = [
      "ID",
      "Timestamp",
      "Symbol",
      "Side",
      "Leverage",
      "Margin",
      "EntryPrice",
      "ExitPrice",
      "FeesDeducted",
      "GrossPnL",
      "NetPnL",
      "DurationMs",
      "LatencyMs",
      "ExitReason",
    ];

    const rows = trades.map((t) => [
      t.id,
      new Date(t.closeTimestamp).toISOString(),
      t.symbol,
      t.side,
      `${t.leverage}x`,
      t.margin,
      t.entryPrice,
      t.exitPrice,
      t.totalFees,
      t.grossPnL,
      t.netPnL,
      t.durationMs,
      t.executionLatencyMs,
      `"${t.exitReason}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mexc_scalper_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const timeStr = d.toTimeString().split(" ")[0];
    const ms = String(d.getMilliseconds()).padStart(3, "0");
    return `${timeStr}.${ms}`;
  };

  const formatTradePrice = (p: number) => {
    if (p === undefined || p === null || isNaN(p)) return "---";
    if (p < 0.00001) return p.toFixed(10);
    if (p < 0.01) return p.toFixed(7);
    if (p < 1) return p.toFixed(4);
    return p.toFixed(2);
  };

  return (
    <div id="trade-history-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Continuous Scalp Execution Log
          </h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
            {trades.length} Completed
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === "ALL" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({trades.length})
            </button>
            <button
              onClick={() => setFilter("WINS")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === "WINS" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Wins
            </button>
            <button
              onClick={() => setFilter("LOSSES")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === "LOSSES" ? "bg-rose-500/20 text-rose-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Losses
            </button>
          </div>

          {/* Export CSV */}
          <button
            id="export-csv-btn"
            onClick={exportCSV}
            disabled={trades.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
            title="Export trades as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          {/* Clear */}
          <button
            id="clear-history-btn"
            onClick={onClearHistory}
            disabled={trades.length === 0}
            className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 disabled:opacity-40 border border-slate-700 transition-colors"
            title="Clear trade history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[11px] text-slate-400 bg-slate-950/80 sticky top-0 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Pair & Side</th>
              <th className="py-2.5 px-3">Entry & Exit</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Latency</th>
              <th className="py-2.5 px-3">MEXC Fees</th>
              <th className="py-2.5 px-3">Net Profit</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-sans text-xs">
                  No completed scalps yet. Start the engine to stream live millisecond trades.
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade, index) => {
                const isWin = trade.netPnL > 0;
                return (
                  <tr key={`${trade.id}-${trade.closeTimestamp}-${index}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {formatTime(trade.closeTimestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                      <span className="text-white">{trade.symbol}</span>{" "}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          trade.side === "LONG"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        }`}
                      >
                        {trade.side} {trade.leverage}x
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-yellow-400">${formatTradePrice(trade.entryPrice)}</span>{" "}
                      <span className="text-slate-500">→</span>{" "}
                      <span className="text-white font-bold">${formatTradePrice(trade.exitPrice)}</span>
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-medium whitespace-nowrap">
                      {trade.durationMs}ms
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      ⚡ {trade.executionLatencyMs.toFixed(1)}ms
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      -${trade.totalFees.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                      <span className={trade.netPnL > 0 ? "text-emerald-400" : trade.netPnL === 0 ? "text-blue-400" : "text-rose-400"}>
                        {trade.netPnL > 0
                          ? `+$${trade.netPnL.toFixed(3)}`
                          : trade.netPnL === 0
                          ? "$0.000"
                          : `-$${Math.abs(trade.netPnL).toFixed(3)}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {trade.netPnL > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-2.5 h-2.5" /> Fees Covered + Profit
                        </span>
                      ) : trade.exitReason.includes("Zero-Loss") || trade.exitReason.includes("Scratch") || trade.netPnL === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          <CheckCircle className="w-2.5 h-2.5" /> 🛡️ Zero-Loss Scratch ($0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <ShieldAlert className="w-2.5 h-2.5" /> {trade.exitReason}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
