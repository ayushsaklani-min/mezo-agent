"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Lock, Bug, Award, CheckCircle2 } from "lucide-react";

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"invariants" | "threat-model" | "bounty">("invariants");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white border-[3px] border-black rounded-2xl p-6 sm:p-8 shadow-[10px_10px_0px_0px_#000000] relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#99E885] border-2 border-black shadow-brutal-sm flex items-center justify-center text-black">
                <ShieldCheck className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-black tracking-tight flex items-center gap-2 uppercase">
                  <span>Security & Audit Readiness</span>
                  <span className="neo-badge bg-[#F7CB46] text-black text-[10px] px-2 py-0.5 rounded">
                    25/25 VERIFIED
                  </span>
                </h3>
                <p className="text-xs font-bold text-slate-700">
                  Cryptographic verification, formal invariant proofs & threat modeling
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg border-2 border-black bg-[#FAF7F0] hover:bg-[#FF4757] hover:text-white transition-colors"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1 rounded-xl bg-[#FAF7F0] border-2 border-black text-xs font-black">
            <button
              onClick={() => setActiveTab("invariants")}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase ${
                activeTab === "invariants" ? "bg-[#F7CB46] text-black border-2 border-black shadow-brutal-sm" : "text-slate-700 hover:text-black"
              }`}
            >
              <Award className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Invariants</span>
            </button>
            <button
              onClick={() => setActiveTab("threat-model")}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase ${
                activeTab === "threat-model" ? "bg-[#F7CB46] text-black border-2 border-black shadow-brutal-sm" : "text-slate-700 hover:text-black"
              }`}
            >
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Threats</span>
            </button>
            <button
              onClick={() => setActiveTab("bounty")}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase ${
                activeTab === "bounty" ? "bg-[#F7CB46] text-black border-2 border-black shadow-brutal-sm" : "text-slate-700 hover:text-black"
              }`}
            >
              <Bug className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Bug Bounty</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4 text-xs leading-relaxed text-black">
            {activeTab === "invariants" && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-[#121212] border-2 border-black font-mono text-[11px] text-white shadow-brutal-sm">
                  <div className="text-[#99E885] font-black mb-1">FOUNDRY INVARIANT HARNESS VERIFICATION:</div>
                  <div>Runs: 256 | Stateful Calls: 128,000 | Reverts Handled: 50,921</div>
                  <div className="text-[#FFE600] mt-1 font-bold">Suite Result: OK. 25 passed; 0 failed; 0 skipped.</div>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
                    <span className="font-black text-black block mb-1 uppercase">1. Sliding-Window Continuous Bound Invariant</span>
                    <p className="text-slate-700 text-xs font-semibold">
                      Mathematical proof that across any continuous 3,600s rolling window, no agent can spend more than its designated hourly limit, eliminating the classic 59m/61m double-spend exploit.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
                    <span className="font-black text-black block mb-1 uppercase">2. Granular Call Selector Invariant</span>
                    <p className="text-slate-700 text-xs font-semibold">
                      Guarantees agents cannot execute arbitrary calls or invoke <code className="bg-white px-1 py-0.5 rounded border border-black font-mono font-bold">IERC20.approve()</code> on treasury funds, preventing indirect allowance draining.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
                    <span className="font-black text-black block mb-1 uppercase">3. Treasury Solvency & Custody Invariant</span>
                    <p className="text-slate-700 text-xs font-semibold">
                      The contract balance always remains strictly greater than or equal to unreserved obligations. Master keys remain entirely isolated in the human or DAO multisig.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "threat-model" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#FFF1F2] border-2 border-black shadow-brutal-sm">
                  <strong className="block text-[#FF4757] font-black mb-1 uppercase">Vector 1: Prompt Injection / Memory Hijack</strong>
                  <p className="text-xs font-bold text-slate-800">
                    If an attacker prompts the agent to drain the treasury to a rogue address, the contract halts execution instantly on-chain: target is not whitelisted, and velocity envelope is capped.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-brutal-sm">
                  <strong className="block text-black font-black mb-1 uppercase">Vector 2: Compromised Owner Key</strong>
                  <p className="text-xs font-bold text-slate-800">
                    If owner key is compromised, an attacker cannot immediately inflate spend limits. Limit increases require a 24-hour timelock delay, allowing security guardian to pause.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F0FDF4] border-2 border-black shadow-brutal-sm">
                  <strong className="block text-emerald-800 font-black mb-1 uppercase">Zero-Knowledge Key Handshake</strong>
                  <p className="text-xs font-bold text-slate-800">
                    The bot generates its ECDSA private key within an isolated Docker container, AWS KMS, or hardware TEE. Only public address is authorized on-chain.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "bounty" && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
                  <span className="font-black text-black block mb-1 uppercase">Responsible Disclosure Policy</span>
                  <p className="text-slate-700 text-xs font-semibold">
                    We welcome security researchers and white-hat hackers to review our smart contracts and SDK:
                  </p>
                  <ul className="mt-2 space-y-1 font-mono text-xs font-black text-black">
                    <li>• Critical (Treasury Drain / Invariant Breach): Up to $10,000 MUSD</li>
                    <li>• High (Bypass of Whitelist / Velocity Limit): Up to $5,000 MUSD</li>
                    <li>• Medium (DoS / Griefing): Up to $1,500 MUSD</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-white border-2 border-black shadow-brutal-sm flex items-center justify-between">
                  <div>
                    <span className="block font-black text-black text-xs uppercase">Security Contact</span>
                    <span className="text-xs font-mono font-bold text-slate-700">security@mezoagent.xyz</span>
                  </div>
                  <a
                    href="mailto:security@mezoagent.xyz"
                    className="neo-btn px-3 py-1.5 rounded-lg bg-[#F7CB46] text-black text-xs font-black"
                  >
                    REPORT FINDING
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-5 mt-6 border-t-2 border-black flex items-center justify-end">
            <button
              onClick={onClose}
              className="neo-btn px-5 py-2.5 rounded-xl bg-[#000000] text-white text-xs font-black uppercase tracking-wide"
            >
              CLOSE AUDIT VIEW
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
