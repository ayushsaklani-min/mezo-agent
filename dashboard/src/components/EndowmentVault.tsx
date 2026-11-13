"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Lock,
  RefreshCw,
  Zap,
  ArrowUpRight,
  Info,
  Sliders,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { EndowmentVault as EndowmentVaultType } from "@/lib/types";

interface EndowmentVaultProps {
  vault: EndowmentVaultType;
  onDepositPrincipal: (amountMUSD: number, amountBTC: number) => void;
  onToggleAutoCompound: (enabled: boolean) => void;
  onDrawYield: (amountMUSD: number) => void;
}

export const EndowmentVault: React.FC<EndowmentVaultProps> = ({
  vault,
  onDepositPrincipal,
  onToggleAutoCompound,
  onDrawYield,
}) => {
  const [liveYieldMUSD, setLiveYieldMUSD] = useState(vault.accruedYieldMUSD);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositMUSD, setDepositMUSD] = useState("500");
  const [depositBTC, setDepositBTC] = useState("0.02");

  // Real-time micro-yield ticker: accumulates fractionally every second based on 8.4% APY
  useEffect(() => {
    // 8.4% APY on principalMUSD divided into seconds
    const yearlyYield = (vault.principalMUSD * (vault.apy / 100));
    const yieldPerSecond = yearlyYield / (365 * 24 * 3600);

    const interval = setInterval(() => {
      setLiveYieldMUSD((prev) => prev + (yieldPerSecond * 0.5));
    }, 500);

    return () => clearInterval(interval);
  }, [vault.principalMUSD, vault.apy]);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const musd = parseFloat(depositMUSD) || 0;
    const btc = parseFloat(depositBTC) || 0;
    if (musd > 0 || btc > 0) {
      onDepositPrincipal(musd, btc);
      setIsDepositOpen(false);
    }
  };

  const availableYieldBudget = Math.max(0, liveYieldMUSD - vault.yieldDrawnTotal);

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Self-Funding Concept */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-surface-card to-surface-card border border-amber-500/25 p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-mezo border border-amber-500/40">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-mezo uppercase tracking-wider">
                DIFFERENTIATOR 1 • SELF-FUNDING ENDOWMENT
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Yield-Funded Autonomous Agents (Perpetual Endowment)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Principal capital ($5,000 MUSD + 0.15 BTC) remains <strong>permanently locked in cold custody</strong> earning 8.4% APY on Mezo.
              Agent operational session keys strictly spend from <strong>accrued Bitcoin staking yield</strong>. Zero risk to principal balance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mezo hover:bg-mezo-hover text-black text-xs font-black shadow-lg shadow-mezo/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Add to Endowment</span>
            </button>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-light border border-surface-border text-xs font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[11px] font-mono">Matsnet Yield Active (8.4% APY)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Locked Cold Principal */}
        <div className="rounded-2xl bg-surface-card border border-surface-border p-5 space-y-2 relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Locked Principal (Cold)</span>
            <Lock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              ${vault.principalMUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-mono text-slate-400">MUSD</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400 pt-1 border-t border-surface-border/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ {vault.btcPrincipal} BTC Staked (Untouchable)</span>
          </div>
        </div>

        {/* Metric 2: Live Accrued Yield */}
        <div className="rounded-2xl bg-surface-card border border-emerald-500/30 p-5 space-y-2 relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
            <span>Accrued Yield (Live Ticker)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-300 font-mono">
              ${liveYieldMUSD.toFixed(4)}
            </span>
            <span className="text-xs font-mono text-emerald-500 font-bold">MUSD</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-surface-border/60">
            <span>Rate:</span>
            <span className="text-emerald-400 font-bold">~${((vault.principalMUSD * 0.084) / 30).toFixed(2)}/mo</span>
          </div>
        </div>

        {/* Metric 3: Active Spend Allowance from Yield */}
        <div className="rounded-2xl bg-surface-card border border-surface-border p-5 space-y-2 relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Yield Operational Budget</span>
            <Zap className="w-4 h-4 text-mezo" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              ${availableYieldBudget.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-mezo font-bold">MUSD Free</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-surface-border/60">
            <span>Yield Drawn to Date:</span>
            <span className="text-slate-300">${vault.yieldDrawnTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Metric 4: Auto-Compounding Mode */}
        <div className="rounded-2xl bg-surface-card border border-surface-border p-5 space-y-2 relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Surplus Yield Strategy</span>
            <Sliders className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="pt-1 flex items-center justify-between">
            <span className="text-sm font-bold text-white">
              {vault.autoCompound ? "Auto-Compound" : "Stream to Agents"}
            </span>
            <button
              onClick={() => onToggleAutoCompound(!vault.autoCompound)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                vault.autoCompound ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  vault.autoCompound ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 pt-1.5 border-t border-surface-border/60">
            {vault.autoCompound
              ? "Surplus yield auto-restakes into Mezo HODL"
              : "Surplus yield available for autonomous agents"}
          </p>
        </div>
      </div>

      {/* Visual Safety Architecture Comparison Card */}
      <div className="rounded-3xl bg-surface-card border border-surface-border p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Endowment Invariant: Principal Isolation Mechanics
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
            INVARIANT PRESERVED: ΔPrincipal == 0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-light border border-surface-border space-y-2">
            <span className="font-bold text-slate-200 block uppercase tracking-wider text-[11px]">
              Cold Treasury Enclave (Gnosis Safe / Owner EOA)
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Principal MUSD and Bitcoin are deposited via `depositEndowment()`. The smart contract disallows any session key `execute()` call from touching the principal balance. Only the multi-sig owner can withdraw the principal after a 7-day timelock.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-light border border-surface-border space-y-2">
            <span className="font-bold text-slate-200 block uppercase tracking-wider text-[11px]">
              Agent Operational Pipeline (12-Bucket Sliding Window)
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The agent’s hourly velocity limit is bounded dynamically by:
              <br />
              <code className="text-mezo font-mono text-[10px] mt-1 block">
                maxSpendable = min(sessionKey.hourlyLimit, accruedYield - yieldDrawn)
              </code>
              Even if an agent runs indefinitely, it can never spend faster than the yield generated.
            </p>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface border border-surface-border rounded-3xl p-6 shadow-2xl relative space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2.5">
                  <Coins className="w-5 h-5 text-mezo" />
                  <h3 className="text-base font-bold text-white">Deposit to Perpetual Endowment</h3>
                </div>
                <button
                  onClick={() => setIsDepositOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Deposit MUSD Principal (Generates 8.4% APY)
                  </label>
                  <input
                    type="number"
                    value={depositMUSD}
                    onChange={(e) => setDepositMUSD(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-white font-mono focus:outline-none focus:border-mezo"
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Deposit Native Bitcoin Principal (BTC Staking)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={depositBTC}
                    onChange={(e) => setDepositBTC(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-white font-mono focus:outline-none focus:border-mezo"
                    placeholder="0.02"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                  ⚡ Deposited funds are placed into Mezo Matsnet staking. All future agent executions will draw solely from this yield.
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                  <button
                    type="button"
                    onClick={() => setIsDepositOpen(false)}
                    className="px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-mezo text-black font-extrabold hover:bg-mezo-hover shadow-lg"
                  >
                    Confirm Deposit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
