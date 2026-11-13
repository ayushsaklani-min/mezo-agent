"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Check, Lock, Bug, Terminal, FileCode2, ExternalLink, ShieldAlert, Award } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"invariants" | "threat-model" | "bounty">("invariants");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Enterprise Security & Audit Readiness</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    25/25 Tests Passing
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Cryptographic verification, formal invariant proofs, and bug bounty policy
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-surface-card text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1 rounded-xl bg-surface-card border border-surface-border text-xs font-semibold">
            <button
              onClick={() => setActiveTab("invariants")}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "invariants" ? "bg-mezo text-black font-bold shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Formal Invariants</span>
            </button>
            <button
              onClick={() => setActiveTab("threat-model")}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "threat-model" ? "bg-mezo text-black font-bold shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Threat Model</span>
            </button>
            <button
              onClick={() => setActiveTab("bounty")}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "bounty" ? "bg-mezo text-black font-bold shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Bug Bounty</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            {activeTab === "invariants" && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                  <div className="text-emerald-400 font-bold mb-1">Foundry Invariant Harness Verification:</div>
                  <div>Runs: 256 | Stateful Calls: 128,000 | Reverts Handled: 50,921</div>
                  <div className="text-slate-500 mt-1">Suite Result: OK. 25 passed; 0 failed; 0 skipped.</div>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-surface-card border border-surface-border">
                    <span className="font-bold text-white block mb-0.5">1. Sliding-Window Continuous Bound Invariant</span>
                    <p className="text-slate-400 text-[11px]">
                      Mathematical proof that across any continuous 3,600s rolling window, no agent can spend more than its designated hourly limit, eliminating the classic 59m/61m double-spend exploit.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-card border border-surface-border">
                    <span className="font-bold text-white block mb-0.5">2. Granular Call Selector Invariant</span>
                    <p className="text-slate-400 text-[11px]">
                      Guarantees agents cannot execute arbitrary calls or invoke <code className="text-mezo font-mono">IERC20.approve()</code> on treasury funds, preventing indirect allowance draining.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-card border border-surface-border">
                    <span className="font-bold text-white block mb-0.5">3. Treasury Solvency & Custody Invariant</span>
                    <p className="text-slate-400 text-[11px]">
                      The contract balance always remains strictly greater than or equal to unreserved obligations. Master keys remain entirely isolated in the human or DAO multisig.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "threat-model" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 text-red-200">
                  <strong className="block text-white mb-1">Attack Vector 1: Prompt Injection / Memory Hijack</strong>
                  <p className="text-[11px] text-slate-300">
                    If an attacker prompts the agent to drain the treasury to a rogue address, the contract halts execution instantly on-chain: the target is not whitelisted, and hourly velocity is capped.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200">
                  <strong className="block text-white mb-1">Attack Vector 2: Compromised Owner Key</strong>
                  <p className="text-[11px] text-slate-300">
                    If the owner key is compromised, an attacker cannot immediately inflate spend limits. Limit increases require a 24-hour timelock delay, allowing the security guardian to pause the account.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-cyan-200">
                  <strong className="block text-white mb-1">Zero-Knowledge Key Handshake</strong>
                  <p className="text-[11px] text-slate-300">
                    The bot generates its ECDSA private key within an isolated Docker container, AWS KMS, or hardware TEE. Only the public address is authorized on-chain.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "bounty" && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border">
                  <span className="font-bold text-white block mb-1">Responsible Disclosure Policy</span>
                  <p className="text-slate-300 text-[11px]">
                    We welcome security researchers and white-hat hackers to review our smart contracts and SDK. Vulnerabilities reported responsibly will be rewarded based on severity:
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] font-mono text-slate-400">
                    <li>• Critical (Treasury Drain / Invariant Breach): Up to $10,000 MUSD</li>
                    <li>• High (Bypass of Whitelist / Velocity Limit): Up to $5,000 MUSD</li>
                    <li>• Medium (DoS / Griefing): Up to $1,500 MUSD</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-surface-light border border-surface-border flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-white text-xs">Security Contact</span>
                    <span className="text-[11px] text-slate-400 font-mono">security@mezoagent.xyz</span>
                  </div>
                  <a
                    href="mailto:security@mezoagent.xyz"
                    className="px-3 py-1.5 rounded-xl bg-mezo text-black text-xs font-bold shadow-sm"
                  >
                    Report Finding
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-5 mt-6 border-t border-surface-border flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-surface-light hover:bg-surface-card border border-surface-border text-white text-xs font-bold transition-colors"
            >
              Close Security View
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
