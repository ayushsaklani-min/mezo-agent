"use client";

import React from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowDownUp, Flame, KeyRound, TrendingUp, ShieldCheck } from "lucide-react";

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
  const cards = [
    {
      label: "Total Treasury (MUSD)",
      value: `$${musdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: "MUSD",
      subtext: "Mezo Bitcoin-backed stablecoin",
      icon: DollarSign,
      color: "mezo",
      badge: "Collateralized",
      borderGlow: "hover:border-mezo/50 hover:shadow-mezo/15",
      iconBg: "bg-mezo/10 text-mezo ring-1 ring-mezo/25",
    },
    {
      label: "Cross-Chain Inbound",
      value: `$${usdcBridged.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: "USDC",
      subtext: "Bridged from Base via Wormhole NTT",
      icon: ArrowDownUp,
      color: "cyan",
      badge: "1:1 Routed",
      borderGlow: "hover:border-cyan-500/50 hover:shadow-cyan-500/15",
      iconBg: "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/25",
    },
    {
      label: "Stacked Bitcoin Yield",
      value: stackedBtcYield.toFixed(6),
      unit: "BTC",
      subtext: "Auto-harvested into native Satoshis",
      icon: Flame,
      color: "amber",
      badge: "Real Satoshis",
      borderGlow: "hover:border-amber-500/50 hover:shadow-amber-500/15",
      iconBg: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25",
    },
    {
      label: "Autonomous Session Keys",
      value: activeAgentsCount.toString(),
      unit: "Active Keys",
      subtext: "Enforcing rolling hourly velocity caps",
      icon: KeyRound,
      color: "emerald",
      badge: "ERC-4337 Scoped",
      borderGlow: "hover:border-emerald-500/50 hover:shadow-emerald-500/15",
      iconBg: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`p-5 rounded-3xl bg-surface border border-surface-border relative overflow-hidden transition-all shadow-lg ${card.borderGlow}`}
          >
            {/* Ambient Background Radial */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-tight">
                {card.label}
              </span>
              <div className={`p-2.5 rounded-2xl ${card.iconBg}`}>
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                {card.value}
              </span>
              <span className="text-xs font-bold text-mezo font-mono">
                {card.unit}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border/50 text-[11px]">
              <span className="text-slate-400 truncate max-w-[170px]">{card.subtext}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-card border border-surface-border text-slate-300 shrink-0 font-medium">
                {card.badge}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
