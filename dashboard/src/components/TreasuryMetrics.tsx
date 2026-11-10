"use client";

import React from "react";
import { DollarSign, ArrowDownUp, Flame, KeyRound } from "lucide-react";

interface MetricsProps {
  musdBalance: number;
  usdcBridged: number;
  btcGasBalance: number;
  stackedBtcYield: number;
  activeAgentsCount: number;
}

export const TreasuryMetrics: React.FC<MetricsProps> = ({
  musdBalance,
  usdcBridged,
  stackedBtcYield,
  activeAgentsCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. MUSD Balance */}
      <div className="p-5 rounded-2xl bg-surface border border-surface-border relative overflow-hidden group hover:border-mezo/40 transition-all shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-mezo/5 rounded-full blur-2xl group-hover:bg-mezo/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Total Treasury (MUSD)</span>
          <div className="p-2 rounded-xl bg-mezo/10 text-mezo">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            ${musdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-mezo font-semibold">MUSD</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Mezo Bitcoin-backed stablecoin</p>
      </div>

      {/* 2. Bridged USDC */}
      <div className="p-5 rounded-2xl bg-surface border border-surface-border relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Cross-Chain USDC</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <ArrowDownUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            ${usdcBridged.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-cyan-400 font-semibold">USDC</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Inbound from Base & Ethereum</p>
      </div>

      {/* 3. Stacked BTC Yield */}
      <div className="p-5 rounded-2xl bg-surface border border-surface-border relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Stacked Bitcoin Yield</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {stackedBtcYield.toFixed(6)}
          </span>
          <span className="text-xs text-amber-400 font-semibold">BTC</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Auto-harvested into native Satoshis</p>
      </div>

      {/* 4. Active Session Keys */}
      <div className="p-5 rounded-2xl bg-surface border border-surface-border relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Autonomous Agents</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <KeyRound className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {activeAgentsCount}
          </span>
          <span className="text-xs text-emerald-400 font-semibold">Active Keys</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Budget-enforced smart sessions</p>
      </div>
    </div>
  );
};
