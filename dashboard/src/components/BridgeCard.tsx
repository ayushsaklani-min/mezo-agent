"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Zap } from "lucide-react";

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

  const handleClaimFaucet = async () => {
    setIsClaiming(true);
    try {
      await onFaucetClaim(1000);
    } catch (err) {
      console.warn("Faucet error:", err);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    setIsBridging(true);
    try {
      await onBridgeSuccess(numericAmount, numericAmount, "");
    } catch (err) {
      console.warn("Bridge error:", err);
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="p-6 sm:p-7 rounded-2xl bg-[#0E121E] border-2 border-black shadow-brutal-lg relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
              CROSS-CHAIN LIQUIDITY
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm">
              WORMHOLE NTT
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Deposit external USDC into native MUSD smart treasury
          </p>
        </div>

        {/* Faucet Helper Button */}
        <button
          onClick={handleClaimFaucet}
          disabled={isClaiming}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-black border-2 border-black font-mono text-xs font-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          {isClaiming ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
          ) : (
            <Zap className="w-3.5 h-3.5 fill-black" />
          )}
          <span>+1,000 MUSD FAUCET</span>
        </button>
      </div>

      <form onSubmit={handleBridge} className="space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Source Chain Selector */}
          <div className="p-3.5 rounded-xl bg-[#05060A] border-2 border-black">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
              SOURCE NETWORK
            </label>
            <div className="flex items-center justify-between">
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
                className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
              >
                <option value="Base" className="bg-[#0E111B] text-white">Base Chain</option>
                <option value="Ethereum" className="bg-[#0E111B] text-white">Ethereum Mainnet</option>
                <option value="BNB Chain" className="bg-[#0E111B] text-white">BNB Smart Chain</option>
              </select>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500 text-white font-black border border-black">
                USDC (6 dec)
              </span>
            </div>
          </div>

          {/* Destination */}
          <div className="p-3.5 rounded-xl bg-[#05060A] border-2 border-black">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
              DESTINATION TREASURY
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white">Bitcoin L2 (31611)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400 text-black font-black border border-black">
                MUSD (18 dec)
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-[11px]">
            <label className="font-bold text-slate-200">
              Deposit Amount (USDC)
            </label>
            <span className="text-slate-400 font-mono font-bold">Peg: 1.0000 MUSD / USDC</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#05060A] border-2 border-black focus:border-mezo text-sm font-mono font-bold text-white placeholder-slate-500 transition-colors"
              placeholder="Enter amount..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 font-mono">
              <button
                type="button"
                onClick={() => setAmount("250")}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#121622] border-2 border-black text-slate-200 font-bold hover:bg-mezo hover:text-black transition-colors"
              >
                250
              </button>
              <button
                type="button"
                onClick={() => setAmount("500")}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#121622] border-2 border-black text-slate-200 font-bold hover:bg-mezo hover:text-black transition-colors"
              >
                500
              </button>
              <button
                type="button"
                onClick={() => setAmount("1000")}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#121622] border-2 border-black text-slate-200 font-bold hover:bg-mezo hover:text-black transition-colors"
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
          className="w-full py-3.5 px-4 rounded-xl bg-mezo text-black font-black text-xs border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isBridging ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>ROUTING USDC TO MUSD TREASURY...</span>
            </>
          ) : (
            <>
              <span>BRIDGE {amount || "0"} USDC → MUSD TREASURY</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
