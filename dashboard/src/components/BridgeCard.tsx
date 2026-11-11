"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Zap, CheckCircle2, ShieldCheck, Coins, Sparkles } from "lucide-react";
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

  const handleClaimFaucet = () => {
    setIsClaiming(true);
    setTimeout(() => {
      onFaucetClaim(1000);
      setIsClaiming(false);
    }, 500);
  };

  const handleBridge = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    setIsBridging(true);

    setTimeout(() => {
      const randomHex = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      const fakeTx = `0x${randomHex}`;

      onBridgeSuccess(numericAmount, numericAmount, fakeTx);
      setIsBridging(false);
    }, 750);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="p-6 sm:p-7 rounded-3xl bg-surface border border-surface-border shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Cross-Chain Liquidity Inbound
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
              Testnet Bridge Simulation
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Convert external USDC into native Mezo MUSD smart treasury (Production: Wormhole NTT)
          </p>
        </div>

        {/* Faucet Helper Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClaimFaucet}
          disabled={isClaiming}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-light border border-surface-border hover:border-mezo/40 text-xs font-semibold text-slate-200 transition-colors shadow-sm self-start sm:self-auto"
        >
          {isClaiming ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-mezo" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-mezo fill-mezo/20" />
          )}
          <span>+1,000 Mock USDC</span>
        </motion.button>
      </div>

      <form onSubmit={handleBridge} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Source Chain Selector */}
          <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border/80">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Source Network
            </label>
            <div className="flex items-center justify-between">
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="Base" className="bg-[#0E111B] text-white">Base Chain</option>
                <option value="Ethereum" className="bg-[#0E111B] text-white">Ethereum Mainnet</option>
                <option value="BNB Chain" className="bg-[#0E111B] text-white">BNB Smart Chain</option>
              </select>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-extrabold border border-blue-500/30">
                USDC (6 dec)
              </span>
            </div>
          </div>

          {/* Destination */}
          <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border/80">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Destination Treasury
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Mezo Network</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 font-extrabold border border-orange-500/30">
                MUSD (18 dec)
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-[11px]">
            <label className="font-semibold text-slate-300">
              Deposit Amount (USDC)
            </label>
            <span className="text-slate-400 font-mono">Rate: 1.0000 MUSD / USDC</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-surface-card border border-surface-border focus:border-mezo focus:ring-1 focus:ring-mezo text-sm font-mono text-white placeholder-slate-500 transition-colors"
              placeholder="Enter amount..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAmount("250")}
                className="text-[11px] font-mono px-2 py-1 rounded-lg bg-surface-light border border-surface-border text-slate-300 hover:text-white hover:border-slate-500"
              >
                250
              </button>
              <button
                type="button"
                onClick={() => setAmount("500")}
                className="text-[11px] font-mono px-2 py-1 rounded-lg bg-surface-light border border-surface-border text-slate-300 hover:text-white hover:border-slate-500"
              >
                500
              </button>
              <button
                type="button"
                onClick={() => setAmount("1000")}
                className="text-[11px] font-mono px-2 py-1 rounded-lg bg-surface-light border border-surface-border text-slate-300 hover:text-white hover:border-slate-500"
              >
                1000
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isBridging}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-mezo via-orange-500 to-mezo hover:from-orange-400 hover:to-orange-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-mezo/20 transition-all disabled:opacity-50"
        >
          {isBridging ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Routing USDC to MUSD Treasury...</span>
            </>
          ) : (
            <>
              <span>Bridge {amount || "0"} USDC → MUSD</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};
