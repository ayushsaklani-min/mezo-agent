"use client";

import React, { useState } from "react";
import { ArrowRight, RefreshCw, Zap, CheckCircle2, ShieldCheck } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";

interface BridgeCardProps {
  onBridgeSuccess: (usdcAmount: number, musdAmount: number, txHash: string) => void;
  onFaucetClaim: (claimedAmount: number) => void;
}

export const BridgeCard: React.FC<BridgeCardProps> = ({
  onBridgeSuccess,
  onFaucetClaim,
}) => {
  const [amount, setAmount] = useState<string>("250");
  const [sourceChain, setSourceChain] = useState<string>("Base");
  const [isBridging, setIsBridging] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const handleClaimFaucet = () => {
    setIsClaiming(true);
    setTimeout(() => {
      onFaucetClaim(1000);
      setIsClaiming(false);
    }, 600);
  };

  const handleBridge = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    setIsBridging(true);
    setLastTxHash(null);

    setTimeout(() => {
      // Simulate real Mezo tx hash
      const randomHex = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      const fakeTx = `0x${randomHex}`;

      onBridgeSuccess(numericAmount, numericAmount, fakeTx);
      setLastTxHash(fakeTx);
      setIsBridging(false);
    }, 900);
  };

  return (
    <div className="p-6 rounded-2xl bg-surface border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Cross-Chain Liquidity Inbound</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
              Wormhole NTT
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Convert external USDC into native Mezo MUSD smart treasury
          </p>
        </div>

        {/* Faucet Helper Button */}
        <button
          onClick={handleClaimFaucet}
          disabled={isClaiming}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-light border border-surface-border hover:border-mezo/40 text-xs text-slate-200 transition-colors"
        >
          {isClaiming ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-mezo" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-mezo" />
          )}
          <span>+1,000 Mock USDC</span>
        </button>
      </div>

      <form onSubmit={handleBridge} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Source Chain Selector */}
          <div className="p-3 rounded-xl bg-surface-light border border-surface-border">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Source Chain & Asset
            </label>
            <div className="flex items-center justify-between">
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none"
              >
                <option value="Base" className="bg-surface text-white">Base Chain</option>
                <option value="Ethereum" className="bg-surface text-white">Ethereum Mainnet</option>
                <option value="BNB Chain" className="bg-surface text-white">BNB Smart Chain</option>
              </select>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                USDC
              </span>
            </div>
          </div>

          {/* Destination */}
          <div className="p-3 rounded-xl bg-surface-light border border-surface-border">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Destination Treasury
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Mezo Network</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">
                MUSD (1:1)
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Bridge Amount (USDC)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-surface-border focus:border-mezo focus:ring-1 focus:ring-mezo text-sm font-mono text-white placeholder-slate-500 transition-colors"
              placeholder="Enter USDC amount..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAmount("500")}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                500
              </button>
              <button
                type="button"
                onClick={() => setAmount("1000")}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                1000
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isBridging}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-mezo to-orange-600 hover:from-orange-500 hover:to-orange-600 text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-mezo/20 transition-all disabled:opacity-50"
        >
          {isBridging ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Routing USDC to MUSD Treasury...</span>
            </>
          ) : (
            <>
              <span>Bridge {amount || "0"} USDC → MUSD</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </>
          )}
        </button>
      </form>

      {/* Success Notification */}
      {lastTxHash && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Bridged successfully into MezoAgent Treasury!</span>
          </div>
          <a
            href={`${MEZO_CONFIG.explorerUrl}/tx/${lastTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 underline font-mono text-[11px]"
          >
            {lastTxHash.slice(0, 10)}...
          </a>
        </div>
      )}
    </div>
  );
};
