"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Zap, ArrowDownUp } from "lucide-react";

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
    <div className="p-6 sm:p-7 rounded-2xl bg-white border-[3px] border-black shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8] border-2 border-black shadow-brutal-sm flex items-center justify-center">
              <ArrowDownUp className="w-4 h-4 text-black stroke-[3]" />
            </div>
            <h2 className="text-lg font-black text-black tracking-tight uppercase">
              Liquidity Inbound
            </h2>
            <span className="neo-badge bg-[#FFE600] text-black text-[10px] px-2 py-0.5 rounded uppercase">
              Wormhole NTT
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700">
            Route external USDC directly into Mezo MUSD smart treasury
          </p>
        </div>

        {/* Faucet Helper Button */}
        <button
          onClick={handleClaimFaucet}
          disabled={isClaiming}
          className="neo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black shadow-brutal-sm self-start sm:self-auto disabled:opacity-50"
        >
          {isClaiming ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-black stroke-[3]" />
          )}
          <span>+1,000 MUSD FAUCET</span>
        </button>
      </div>

      <form onSubmit={handleBridge} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Source Chain Selector */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
            <label className="block text-[10px] uppercase font-mono font-black tracking-wider text-slate-700 mb-1">
              SOURCE NETWORK
            </label>
            <div className="flex items-center justify-between">
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
                className="bg-transparent text-sm font-black text-black focus:outline-none cursor-pointer"
              >
                <option value="Base" className="bg-white text-black font-bold">Base Chain</option>
                <option value="Ethereum" className="bg-white text-black font-bold">Ethereum Mainnet</option>
                <option value="BNB Chain" className="bg-white text-black font-bold">BNB Smart Chain</option>
              </select>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[#BAE6FD] text-black border border-black shadow-brutal-sm">
                USDC (6 dec)
              </span>
            </div>
          </div>

          {/* Destination */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
            <label className="block text-[10px] uppercase font-mono font-black tracking-wider text-slate-700 mb-1">
              DESTINATION TREASURY
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-black">Mezo Network</span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[#FFD7A8] text-black border border-black shadow-brutal-sm">
                MUSD (18 dec)
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-black">
            <label className="uppercase tracking-wider font-mono">
              Deposit Amount (USDC)
            </label>
            <span className="font-mono text-[11px] bg-[#FAF7F0] px-2 py-0.5 border border-black rounded">
              1 USDC = 1 MUSD
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-black shadow-brutal text-base font-mono font-black text-black placeholder-slate-400 focus:outline-none focus:shadow-brutal-lg transition-all"
              placeholder="0.00"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {["250", "500", "1000"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="text-xs font-mono font-black px-2.5 py-1 rounded bg-[#F4EFE6] hover:bg-[#FFE600] border-2 border-black text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isBridging}
          className="neo-btn w-full py-4 px-4 rounded-xl bg-[#FF9900] hover:bg-[#FF8800] text-black font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-brutal active:shadow-none disabled:opacity-50"
        >
          {isBridging ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black stroke-[3]" />
              <span>ROUTING VIA WORMHOLE NTT...</span>
            </>
          ) : (
            <>
              <span>BRIDGE {amount || "0"} USDC → MUSD</span>
              <ArrowRight className="w-5 h-5 text-black stroke-[3]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
