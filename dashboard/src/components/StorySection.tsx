"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, KeyRound, Gauge, Coins, ArrowRight, Lock, CheckCircle2, Flame, Bot, Layers } from "lucide-react";

export const StorySection: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    {
      id: "custody",
      number: "01",
      badge: "The AI Custody Dilemma",
      title: "Giving AI Agents Master Keys is Financial Suicide",
      description:
        "Every autonomous trading bot, data scraper, and LLM oracle needs money to execute transactions. But handing an AI agent master private key access means a single prompt injection, memory hijack, or coding bug can drain your treasury in one block.",
      icon: ShieldAlert,
      color: "red",
      stats: [
        { label: "Master Key Exposure", value: "100% Risk", warning: true },
        { label: "Treasury Drain Risk", value: "Catastrophic", warning: true },
        { label: "Traditional Workaround", value: "Manual Approval (Stalls Autonomy)", warning: false },
      ],
      diagram: "vulnerability",
    },
    {
      id: "session-keys",
      number: "02",
      badge: "Cryptographic Delegation",
      title: "Ephemeral Session Keys with Scoped Permissions",
      description:
        "MezoAgent decouples master ownership from execution authority. The human or DAO retains 100% custody of the treasury, while agents operate with scoped, temporary session keys. Instant one-click revocation cuts off any agent in a single on-chain transaction.",
      icon: KeyRound,
      color: "mezo",
      stats: [
        { label: "Master Key Exposure", value: "0% (Zero Risk)", warning: false },
        { label: "Key Lifetime", value: "Configurable (24h - 90d)", warning: false },
        { label: "Revocation Time", value: "< 1.2s on Mezo", warning: false },
      ],
      diagram: "session",
    },
    {
      id: "velocity",
      number: "03",
      badge: "Hardware-Enforced Velocity",
      title: "Rolling Hourly & Daily EVM Spending Envelopes",
      description:
        "Define strict mathematical velocity bounds. If an agent with a $15/hour cap attempts to execute a $500 rogue trade, the MezoAgent smart contract automatically halts and reverts on-chain at the EVM opcode level—preventing any token outflow.",
      icon: Gauge,
      color: "cyan",
      stats: [
        { label: "Hourly Cap Enforcement", value: "On-Chain EVM Opcode", warning: false },
        { label: "Target Restriction", value: "Strict Contract Whitelist", warning: false },
        { label: "Reentrancy Protection", value: "OpenZeppelin Guard", warning: false },
      ],
      diagram: "velocity",
    },
    {
      id: "yield",
      number: "04",
      badge: "Bitcoin Economic Layer",
      title: "Auto-Compounding MUSD Yield into Native Satoshis",
      description:
        "Mezo transforms idle treasury capital into productive Bitcoin wealth. While agents execute their designated tasks, treasury MUSD yield is automatically harvested and dollar-cost-averaged into real native Bitcoin (Satoshis) directly on Mezo.",
      icon: Coins,
      color: "amber",
      stats: [
        { label: "Base Asset", value: "MUSD (Bitcoin-Backed USD)", warning: false },
        { label: "Yield Target", value: "Native Satoshis (BTC)", warning: false },
        { label: "Inbound Liquidity", value: "Wormhole NTT (USDC 1:1)", warning: false },
      ],
      diagram: "yield",
    },
  ];

  return (
    <section className="py-12 border-t border-b border-surface-border/50 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-mezo/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mezo/10 border border-mezo/25 text-mezo text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>The Architectural Breakthrough</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            How MezoAgent Solves the Autonomous Custody Trilemma
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            Autonomous execution requires autonomy without catastrophic vulnerability. Explore how our smart contracts provide cryptographic guardrails on Bitcoin.
          </p>
        </div>

        {/* Chapter Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 max-w-4xl mx-auto">
          {chapters.map((ch, idx) => {
            const isSelected = activeChapter === idx;
            const Icon = ch.icon;

            return (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(idx)}
                className={`p-3.5 rounded-2xl text-left transition-all border flex items-center gap-3 ${
                  isSelected
                    ? "bg-surface-light border-mezo/60 shadow-lg shadow-mezo/10"
                    : "bg-surface/50 border-surface-border hover:border-slate-600 hover:bg-surface-light/40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                    isSelected
                      ? "bg-mezo text-black"
                      : "bg-surface-card text-slate-400"
                  }`}
                >
                  {ch.number}
                </div>
                <div className="overflow-hidden">
                  <span className="block text-[11px] font-semibold text-white truncate">
                    {ch.badge}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    Chapter {ch.number}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Story Presentation Card */}
        <div className="max-w-5xl mx-auto">
          {chapters.map((ch, idx) => {
            if (activeChapter !== idx) return null;
            const Icon = ch.icon;

            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="p-6 sm:p-9 rounded-3xl bg-surface border border-surface-border shadow-2xl relative overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Text & Specs */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-mono bg-surface-light border border-surface-border text-slate-300">
                      <span>Chapter {ch.number}</span>
                      <span>•</span>
                      <span className="text-mezo">{ch.badge}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {ch.title}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {ch.description}
                    </p>

                    {/* Stats List */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                      {ch.stats.map((stat, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-2xl bg-surface-card border border-surface-border/70"
                        >
                          <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                            {stat.label}
                          </span>
                          <span
                            className={`block text-xs font-mono font-bold mt-1 ${
                              stat.warning ? "text-red-400" : "text-emerald-400"
                            }`}
                          >
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Visual Infographic Card */}
                  <div className="lg:col-span-5">
                    <div className="p-5 rounded-2xl bg-surface-card border border-surface-border/80 shadow-inner relative">
                      {ch.id === "custody" && (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 flex items-center justify-between">
                            <span className="font-bold">Raw Private Key Storage</span>
                            <span className="px-2 py-0.5 rounded bg-red-900/50 text-[10px] font-bold">EXPOSED</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
                            ⚠️ Memory Injection Vulnerability: An external prompt attack can instruct the LLM to send 100% of the DAO vault to an attacker wallet.
                          </div>
                          <div className="p-3 rounded-xl bg-black/60 border border-red-900/30 text-[11px] text-red-400">
                            Result: Full loss of treasury assets in block #1.
                          </div>
                        </div>
                      )}

                      {ch.id === "session-keys" && (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex items-center justify-between">
                            <span className="font-bold">Ephemeral Session Key</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-[10px] font-bold">SECURE</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                            🔒 Master key never leaves the owner wallet. Ephemeral key signed on-chain with time-bound expiration and restricted call targets.
                          </div>
                          <div className="p-3 rounded-xl bg-mezo/10 border border-mezo/25 text-[11px] text-mezo">
                            Owner can execute `revokeSessionKey()` at any second to kill rogue agent execution instantly.
                          </div>
                        </div>
                      )}

                      {ch.id === "velocity" && (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 flex items-center justify-between">
                            <span className="font-bold">Velocity Limit Engine</span>
                            <span className="px-2 py-0.5 rounded bg-cyan-900/50 text-[10px] font-bold">ACTIVE</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                            ⏱️ Rolling 1-Hour window: Maximum $25 MUSD.<br />
                            ⏱️ Rolling 24-Hour safety net: Maximum $100 MUSD.
                          </div>
                          <div className="p-3 rounded-xl bg-black/60 border border-cyan-800/30 text-[11px] text-cyan-400">
                            Attempted spend of $26 MUSD? Transaction reverts with opcode 0x08c379a0. Zero treasury impact.
                          </div>
                        </div>
                      )}

                      {ch.id === "yield" && (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 flex items-center justify-between">
                            <span className="font-bold">Bitcoin Yield Loop</span>
                            <span className="px-2 py-0.5 rounded bg-amber-900/50 text-[10px] font-bold">COMPOUNDING</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                            🪙 MUSD treasury balance generates Bitcoin staking yield on Mezo.<br />
                            ⚡ Auto-compounds yield into native Satoshis without manual gas spend.
                          </div>
                          <div className="p-3 rounded-xl bg-black/60 border border-amber-800/30 text-[11px] text-amber-400">
                            Agent operates continuously while treasury grows in hard Bitcoin money.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
