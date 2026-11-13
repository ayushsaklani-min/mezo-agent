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
      label: "TOTAL TREASURY",
      value: `$${musdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: "MUSD",
      subtext: "Mezo Bitcoin-backed stablecoin",
      icon: DollarSign,
      badge: "COLLATERALIZED",
      cardBg: "bg-white",
      badgeBg: "bg-[#FFE600]",
      iconBg: "bg-[#FF9900]",
    },
    {
      label: "CROSS-CHAIN INBOUND",
      value: `$${usdcBridged.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: "USDC",
      subtext: "Bridged from Base via Wormhole NTT",
      icon: ArrowDownUp,
      badge: "1:1 ROUTED",
      cardBg: "bg-white",
      badgeBg: "bg-[#BAE6FD]",
      iconBg: "bg-[#38BDF8]",
    },
    {
      label: "STACKED BITCOIN YIELD",
      value: stackedBtcYield.toFixed(6),
      unit: "BTC",
      subtext: "Auto-harvested into native Satoshis",
      icon: Flame,
      badge: "SATOSHIS",
      cardBg: "bg-white",
      badgeBg: "bg-[#FEF08A]",
      iconBg: "bg-[#FACC15]",
    },
    {
      label: "ACTIVE SESSION KEYS",
      value: activeAgentsCount.toString(),
      unit: "KEYS",
      subtext: "12-bucket sliding window velocity",
      icon: KeyRound,
      badge: "ERC-4337",
      cardBg: "bg-white",
      badgeBg: "bg-[#BBF7D0]",
      iconBg: "bg-[#4ADE80]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            whileHover={{ x: -2, y: -2 }}
            className={`p-5 rounded-2xl ${card.cardBg} border-[3px] border-black shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-black text-black tracking-wider uppercase">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} border-2 border-black shadow-brutal-sm flex items-center justify-center text-black`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black font-mono text-black tracking-tight">
                  {card.value}
                </span>
                <span className="text-xs font-mono font-black text-black bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-black">
                  {card.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-black/80 text-[11px]">
              <span className="text-slate-700 font-semibold truncate max-w-[160px]">{card.subtext}</span>
              <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${card.badgeBg} border-2 border-black shadow-brutal-sm text-black shrink-0`}>
                {card.badge}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
