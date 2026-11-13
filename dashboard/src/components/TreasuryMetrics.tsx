"use client";

import React from "react";
import { motion } from "framer-motion";
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
  const cards = [
    {
      label: "TOTAL TREASURY (MUSD)",
      value: `$${musdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: "MUSD",
      subtext: "Bitcoin-backed USD stablecoin",
      icon: DollarSign,
      badge: "Collateralized",
      badgeClass: "bg-amber-400 text-black",
      iconBg: "bg-mezo text-black border-2 border-black shadow-brutal-sm",
    },
    {
      label: "CROSS-CHAIN INBOUND",
      value: `$${usdcBridged.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: "USDC",
      subtext: "Bridged from Base via Wormhole NTT",
      icon: ArrowDownUp,
      badge: "1:1 Routed",
      badgeClass: "bg-cyan-400 text-black",
      iconBg: "bg-cyan-400 text-black border-2 border-black shadow-brutal-sm",
    },
    {
      label: "STACKED BITCOIN YIELD",
      value: stackedBtcYield.toFixed(6),
      unit: "BTC",
      subtext: "Auto-harvested into native Satoshis",
      icon: Flame,
      badge: "Real Satoshis",
      badgeClass: "bg-emerald-400 text-black",
      iconBg: "bg-emerald-400 text-black border-2 border-black shadow-brutal-sm",
    },
    {
      label: "AUTONOMOUS SESSION KEYS",
      value: activeAgentsCount.toString(),
      unit: "Active Keys",
      subtext: "Enforcing rolling hourly velocity caps",
      icon: KeyRound,
      badge: "ERC-4337 Scoped",
      badgeClass: "bg-purple-400 text-black",
      iconBg: "bg-purple-400 text-black border-2 border-black shadow-brutal-sm",
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
            className="p-5 rounded-2xl bg-[#0E121E] border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-black text-slate-400 tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                  <Icon className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {card.value}
                </span>
                <span className="text-xs font-mono font-black text-mezo">
                  {card.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-black text-[11px]">
              <span className="text-slate-400 font-mono truncate max-w-[170px]">{card.subtext}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border-2 border-black font-black uppercase shadow-brutal-sm ${card.badgeClass}`}>
                {card.badge}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
