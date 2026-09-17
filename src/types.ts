export interface AccountBalance {
  totalUsdt: number;
  futuresAvailable: number;
  futuresEquity: number;
  futuresCash: number;
  spotFree: number;
  spotLocked: number;
  isLive: boolean;
  hasFuturesAccess: boolean;
  hasSpotAccess: boolean;
  lastUpdated: number;
}

export interface BotConfig {
  symbol: string;
  leverage: number;
  marginPerTrade: number;
  takerFeeRate: number; // e.g. 0.0002 for 0.02%
  extraFeeBuffer: number; // e.g. $0.06 extra buffer as requested
  minNetProfit: number; // e.g. $0.05
  emergencyStopLossPct: number; // e.g. 0.25% (critical for 200x leverage)
  tickVelocityThreshold: number; // price delta per tick to trigger entry
  continuousTrading: boolean; // keep trading automatically non-stop
  cooldownMs: number; // ms pause between trades
  isLive: boolean; // true = MEXC API, false = ultra-fast simulation
  apiKey: string;
  apiSecret: string;
  isTestnet: boolean;
  guaranteedProfitMode: boolean; // 100% Profit Target Sniper: strictly trails and locks net positive profit
  trailingProfitStep: number; // e.g. $0.015 trailing drop allowed from peak net profit
  aiAutoPilot: boolean; // AI Strongest Bot: autonomous AI-driven entries
  aiAutoTradeThreshold: number; // minimum momentum score (e.g. 60) for AI entry
  openType: number; // 2 = Cross Margin (MEXC Default), 1 = Isolated Margin
  zeroLossScratchEnabled: boolean; // Zero-Loss Protection: scratches instantly at breakeven before adverse slippage
  turboMode: boolean; // Ultra-HFT Mode for 10+ trades/sec & 25,000/15min pace
  paceMode?: "10_PER_MIN" | "30_PER_MIN" | "TURBO_10K_15M" | "20K_15MIN_ULTRA"; // 20k trades in 15min (~22.2 trades/sec millisecond scalping)
  autoJumpCoins?: boolean; // Auto-detect and jump to coins making micro-gap surges
  multiPennyCoinEngine?: boolean; // Multi-penny coin simultaneous micro-gap scalper
  pennyCoinsList?: string[]; // Selected penny coins for sub-millisecond hunting
  makerZeroFeeMode?: boolean; // 0% Maker fee mode (Post-Only) to eliminate taker fees
  biDirectional: boolean; // Scalp LONG on upward ticks & SHORT on downward ticks
  maxConcurrentSlots: number; // 1 to 5 parallel scalp slots
}

export interface VolatileCoin {
  symbol: string;
  name: string;
  tag: string;
  lastPrice: number;
  priceFormatted: string;
  change24h: number;
  spreadPct: number;
  contractSize: number;
  maxLeverage: number;
  isMicroPenny: boolean;
  volatilityScore: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  margin: number;
  notional: number;
  entryFee: number;
  estExitFee: number;
  extraFeeBuffer: number;
  totalFees: number;
  grossPnL: number;
  netPnL: number;
  pnlPercent: number;
  targetExitPrice: number;
  liquidationPrice: number;
  openTimestamp: number;
  durationMs: number;
  status: "OPEN" | "CLOSING" | "CLOSED";
  peakNetPnL?: number;
  highestPrice?: number;
  isFeeCovered?: boolean;
  isTrailingProfitActive?: boolean;
  liveOrderId?: string;
  liveVol?: number;
  isLiveOrderConfirmed?: boolean;
  fillTimestamp?: number;
}

export interface CompletedTrade {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  leverage: number;
  margin: number;
  notional: number;
  entryPrice: number;
  exitPrice: number;
  entryFee: number;
  exitFee: number;
  totalFees: number;
  grossPnL: number;
  netPnL: number;
  roePercent: number;
  executionLatencyMs: number;
  openTimestamp: number;
  closeTimestamp: number;
  durationMs: number;
  exitReason: string;
}

export interface MarketTicker {
  symbol: string;
  lastPrice: number;
  bid1: number;
  ask1: number;
  high24: number;
  low24: number;
  volume24: number;
  fundingRate: number;
  riseFallRate: number;
  timestamp: number;
}

export interface TickDataPoint {
  time: number;
  price: number;
  velocity: number;
}

export interface BotStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  scratchedTrades?: number; // Zero-Loss Scratch Trades ($0.00 loss)
  winRate: number;
  totalGrossPnL: number;
  totalFeesPaid: number;
  totalNetPnL: number;
  avgLatencyMs: number;
  consecutiveWins: number;
  maxDrawdown: number;
  startedAt: number | null;
  tradesPerSecond?: number;
  projected15mTrades?: number;
}

export interface AIRegimeAnalysis {
  regime: string;
  momentumScore: number;
  actionRecommendation: string;
  microTakeProfitRecommendation: number;
  riskAnalysisUrduEnglish: string;
  timestamp: number;
}
