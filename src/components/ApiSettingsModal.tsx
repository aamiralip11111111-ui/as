import React, { useState, useEffect } from "react";
import { X, Key, ShieldCheck, CheckCircle, AlertTriangle, ExternalLink, Copy, Check, Globe, HelpCircle, Wallet, RefreshCw } from "lucide-react";
import { BotConfig, AccountBalance } from "../types";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BotConfig;
  onSaveConfig: (updated: Partial<BotConfig>, discoveredBalance?: AccountBalance) => void;
  currentBalance?: AccountBalance | null;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  currentBalance,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey || "");
  const [apiSecret, setApiSecret] = useState(config.apiSecret || "");
  const [isTestnet, setIsTestnet] = useState(config.isTestnet || false);
  const [isLive, setIsLive] = useState(config.isLive || false);
  const [serverIp, setServerIp] = useState<string>("34.34.254.207");
  const [copiedIp, setCopiedIp] = useState(false);
  const [testing, setTesting] = useState(false);
  const [discoveredBalance, setDiscoveredBalance] = useState<AccountBalance | null>(currentBalance || null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    hasTradePermission?: boolean;
    hasReadAccess?: boolean;
    isIpBlocked?: boolean;
    instruction?: string;
    totalUsdt?: number;
    futuresAvailable?: number;
    spotFree?: number;
  } | null>(null);

  // Fetch outbound server IP on modal mount
  useEffect(() => {
    if (isOpen) {
      fetch("/api/mexc/server-ip")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ip) {
            setServerIp(data.ip);
          }
        })
        .catch(() => {
          // Keep default fallback IP
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleTestConnection = async () => {
    const cleanKey = apiKey.trim().replace(/[\r\n\t ]+/g, "");
    const cleanSec = apiSecret.trim().replace(/[\r\n\t ]+/g, "");

    if (!cleanKey || !cleanSec) {
      setTestResult({
        success: false,
        message: "Please enter both MEXC API Key and API Secret first.",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/mexc/verify-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: cleanKey, apiSecret: cleanSec, isTestnet }),
      });
      const data = await res.json();

      let balanceObj: AccountBalance | null = null;
      if (data.success && typeof data.totalUsdt === "number") {
        balanceObj = {
          totalUsdt: data.totalUsdt,
          futuresAvailable: data.futuresBalance?.available || 0,
          futuresEquity: data.futuresBalance?.equity || 0,
          futuresCash: data.futuresBalance?.cash || 0,
          spotFree: data.spotBalance?.free || 0,
          spotLocked: data.spotBalance?.locked || 0,
          isLive: true,
          hasFuturesAccess: !!data.hasFuturesAccess,
          hasSpotAccess: !!data.hasSpotAccess,
          lastUpdated: Date.now(),
        };
        setDiscoveredBalance(balanceObj);
      }

      setTestResult({
        success: data.success,
        message: data.message || (data.success ? "MEXC Connected!" : "Authentication Failed"),
        hasTradePermission: data.hasTradePermission,
        hasReadAccess: data.hasReadAccess,
        isIpBlocked: data.isIpBlocked,
        instruction: data.instruction,
        totalUsdt: data.totalUsdt,
        futuresAvailable: data.futuresBalance?.available,
        spotFree: data.spotBalance?.free,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection error: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      apiKey: apiKey.trim().replace(/[\r\n\t ]+/g, ""),
      apiSecret: apiSecret.trim().replace(/[\r\n\t ]+/g, ""),
      isTestnet,
      isLive,
    }, discoveredBalance || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white font-mono">MEXC API & IP Configuration</h2>
              <p className="text-[11px] text-slate-400 font-sans">Fix Read Access, Whitelist IP, & Connect 200x Execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 space-y-5 text-xs font-mono overflow-y-auto flex-1">
          {/* Server Outbound IP Address Card */}
          <div className="bg-gradient-to-r from-emerald-950/30 via-slate-950 to-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Globe className="w-4 h-4" />
                <span>Cloud Server Outbound IP Address:</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Asia-Southeast Cloud Run
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-700 font-mono text-white text-sm font-bold tracking-wider select-all">
                {serverIp}
              </div>
              <button
                type="button"
                onClick={handleCopyIp}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-950/40"
              >
                {copiedIp ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy IP</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1 border-t border-slate-800/80">
              <span className="font-bold text-amber-400 block mb-0.5">📌 MEXC par IP kese daalein (2 Options):</span>
              <ul className="space-y-1 list-disc list-inside text-slate-300">
                <li>
                  <strong className="text-white">Option 1 (Behtareen & Recommended):</strong> MEXC API settings me{" "}
                  <span className="text-emerald-300 underline font-mono">"No IP restriction"</span> (90 days validity) choose karein. Is se kisi IP block ka khatra nahi rehta.
                </li>
                <li>
                  <strong className="text-white">Option 2 (Permanent Link):</strong> Agar IP bind karna chahte hain toh MEXC me{" "}
                  <span className="text-emerald-300 font-mono">"Link IP address"</span> par click kar ke oper wala IP (<span className="text-white font-mono">{serverIp}</span>) paste kar dein.
                </li>
              </ul>
            </div>
          </div>

          {/* Solution Guide: Read Access Fix */}
          <div className="bg-amber-950/20 border border-amber-500/40 p-4 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Fix: "API Key Sirf Read Access Show Kar Rahi Hai" (Kese Hal Karein?)</span>
            </div>
            <div className="text-[11px] text-slate-200 font-sans leading-relaxed space-y-1.5">
              <p>
                Jab aap MEXC par new API banatay hain toh MEXC <strong>by default sirf "Read"</strong> par tick lagata hai. Jab tak aap <strong>"Trade"</strong> par tick nahi lagayein gay, bot orders open/close nahi kar sakega.
              </p>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-emerald-400 font-bold">👉 MEXC Fix Steps:</div>
                <div className="text-slate-300">1. MEXC open karein &rarr; Profile icon &rarr; <strong>API Management</strong></div>
                <div className="text-slate-300">2. Apni API key ke agay <strong>"Edit" (Modify)</strong> par click karein</div>
                <div className="text-slate-300">3. Permissions me <span className="text-emerald-300 font-bold">☑️ "Trade" / "Contract Trade"</span> check box ko tick karein</div>
                <div className="text-slate-300">4. 2FA (Google Authenticator) code enter kar ke <strong>Save</strong> karein!</div>
              </div>
            </div>
          </div>

          {/* Mode Switch: Live vs Paper */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Select Execution Engine Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsLive(false)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  !isLive
                    ? "bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-950/30"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ultra-Fast Paper Sim</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Zero risk. Live real MEXC orderbook data + sub-5ms millisecond execution & fee coverage.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsLive(true)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  isLive
                    ? "bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-950/30"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Key className="w-4 h-4" />
                  <span>MEXC Live API Mode</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Connects to real MEXC Futures account. Places live 200x orders via HMAC-SHA256 signatures.
                </p>
              </button>
            </div>
          </div>

          {/* API Keys Form */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">MEXC API Key (Access Key)</label>
                <a
                  href="https://www.mexc.com/user/openapi"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Open MEXC API Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="e.g. mx0vglAbCd..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">MEXC Secret Key</label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="e.g. 5d92e8fa..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="testnet-toggle"
                checked={isTestnet}
                onChange={(e) => setIsTestnet(e.target.checked)}
                className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-700 rounded"
              />
              <label htmlFor="testnet-toggle" className="text-slate-300 cursor-pointer">
                Use MEXC Contract Testnet (Demo Futures)
              </label>
            </div>
          </div>

          {/* Connection Test Diagnostics */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                testResult.success
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                {testResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                <span>{testResult.message}</span>
              </div>

              {/* Discovered Account Balance Card */}
              {typeof testResult.totalUsdt === "number" && (
                <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-500/40 flex flex-col gap-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      Detected MEXC Balance:
                    </span>
                    <span className="text-emerald-400 text-sm font-extrabold">
                      ${testResult.totalUsdt.toFixed(2)} USDT
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Futures (Contract): <strong className="text-emerald-300 font-bold">${(testResult.futuresAvailable ?? 0).toFixed(2)}</strong></span>
                    <span>Spot Wallet: <strong className="text-slate-200">${(testResult.spotFree ?? 0).toFixed(2)}</strong></span>
                  </div>
                  {(testResult.futuresAvailable ?? 0) === 0 && (testResult.spotFree ?? 0) > 0 && (
                    <div className="mt-1 pt-1.5 border-t border-slate-800/80 text-[10px] text-amber-300 font-sans flex items-center justify-between">
                      <span>💡 200x scalper ke liye USDT Spot se Futures me Transfer karein:</span>
                      <a
                        href="https://futures.mexc.com/exchange"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-emerald-400 font-bold ml-1 hover:text-emerald-300 flex items-center gap-0.5"
                      >
                        MEXC Transfer <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {testResult.instruction && (
                <div className="text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800 text-slate-200">
                  {testResult.instruction}
                </div>
              )}

              {/* Status pills */}
              <div className="flex items-center gap-2 text-[10px] font-mono pt-1">
                <span className={`px-2 py-0.5 rounded border ${testResult.hasReadAccess ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-800 text-slate-400"}`}>
                  Read Access: {testResult.hasReadAccess ? "✅ Active" : "❌ Pending"}
                </span>
                <span className={`px-2 py-0.5 rounded border ${testResult.hasTradePermission ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
                  Contract Trade: {testResult.hasTradePermission ? "✅ Active" : "⚠️ Needs 'Trade' Checkbox in MEXC"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70 shrink-0">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !apiKey}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-mono font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            {testing ? (
              <>
                <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Checking Permissions...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Permissions & IP</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-colors shadow-lg shadow-emerald-950/40"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
