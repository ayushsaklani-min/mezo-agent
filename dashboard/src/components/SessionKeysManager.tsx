"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Key, Clock, ShieldAlert, Check, Copy, Ban, Sparkles, X, ShieldCheck, Cpu, Lock } from "lucide-react";
import type { SessionKeyItem } from "@/lib/types";

interface SessionKeysManagerProps {
  sessionKeys: SessionKeyItem[];
  onCreateKey: (newKey: SessionKeyItem) => void;
  onRevokeKey: (keyId: string) => void;
}

export const SessionKeysManager: React.FC<SessionKeysManagerProps> = ({
  sessionKeys,
  onCreateKey,
  onRevokeKey,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // New Key Form State
  const [keyInputMode, setKeyInputMode] = useState<"enclave" | "sandbox">("enclave");
  const [label, setLabel] = useState("");
  const [hourlyLimit, setHourlyLimit] = useState("25");
  const [dailyLimit, setDailyLimit] = useState("100");
  const [durationDays, setDurationDays] = useState("7");
  const [restrictTargets, setRestrictTargets] = useState(true);
  const [customKey, setCustomKey] = useState("");

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleGenerateRandomKey = () => {
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setCustomKey(`0x${randomHex}`);
  };

  const handleSubmitNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    const finalKey = customKey || `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const newKeyItem: SessionKeyItem = {
      id: `sk_${Date.now()}`,
      label: label || "Autonomous Agent Key",
      keyAddress: finalKey,
      hourlyLimit: parseFloat(hourlyLimit) || 25,
      hourlySpent: 0,
      dailyLimit: parseFloat(dailyLimit) || 100,
      dailySpent: 0,
      validUntil: Date.now() + parseInt(durationDays, 10) * 86400 * 1000,
      active: true,
      restrictTargets: restrictTargets,
      allowedTargets: restrictTargets ? ["0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b"] : [],
    };

    onCreateKey(newKeyItem);
    setIsModalOpen(false);
    setLabel("");
    setCustomKey("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="p-6 sm:p-7 rounded-3xl bg-surface border border-surface-border shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              AI Agent Session Keys
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
              Custom Smart Account (EIP-7715 Inspired)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Cryptographic ephemeral keys with 12-bucket sliding window velocity controls
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setKeyInputMode("enclave");
            setCustomKey("");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-mezo hover:bg-mezo-hover text-black text-xs font-extrabold shadow-lg shadow-mezo/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>Authorize Session Key</span>
        </motion.button>
      </div>

      {/* Keys List */}
      <div className="space-y-3.5">
        {sessionKeys.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-surface-border rounded-2xl">
            <Key className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-semibold">No active session keys found</p>
            <p className="text-xs text-slate-500 mt-1">
              Authorize a session key to delegate safe MUSD spending to an AI agent.
            </p>
          </div>
        ) : (
          sessionKeys.map((item) => {
            const hourlyPct = Math.min(100, Math.round((item.hourlySpent / item.hourlyLimit) * 100));
            const dailyPct = Math.min(100, Math.round((item.dailySpent / item.dailyLimit) * 100));
            const daysLeft = Math.max(0, Math.ceil((item.validUntil - Date.now()) / (86400 * 1000)));

            return (
              <motion.div
                key={item.id}
                layout
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  item.active
                    ? "bg-surface-card border-surface-border hover:border-slate-600 shadow-md"
                    : "bg-red-950/15 border-red-900/40 opacity-75"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.active
                          ? "bg-mezo/10 text-mezo ring-1 ring-mezo/25"
                          : "bg-red-500/10 text-red-400 ring-1 ring-red-500/25"
                      }`}
                    >
                      <Key className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white">{item.label}</span>
                        {item.active ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-semibold">
                            Revoked
                          </span>
                        )}
                        {item.restrictTargets ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium">
                            Whitelisted Targets
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                            Unrestricted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-400">
                        <span>
                          {item.keyAddress.slice(0, 10)}...{item.keyAddress.slice(-6)}
                        </span>
                        <button
                          onClick={() => handleCopy(item.id, item.keyAddress)}
                          className="hover:text-white transition-colors p-0.5"
                          title="Copy Public Key"
                        >
                          {copiedKeyId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Meta */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{daysLeft} days left</span>
                    </div>

                    {item.active && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onRevokeKey(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-bold text-red-300 transition-colors shadow-sm"
                        title="Instant on-chain revocation (effective in next block)"
                      >
                        <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Revoke</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Progress Bars for Hourly & Daily limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-surface-border/60">
                  {/* Hourly Limit */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Sliding Hourly Velocity Cap</span>
                      <span className="font-mono text-slate-200 font-semibold">
                        ${item.hourlySpent.toFixed(2)} / ${item.hourlyLimit.toFixed(2)} MUSD
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-surface-border/50">
                      <motion.div
                        className={`h-full rounded-full transition-all ${
                          hourlyPct > 80 ? "bg-amber-500" : "bg-mezo"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${hourlyPct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Daily Limit */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Daily Safety Cap</span>
                      <span className="font-mono text-slate-200 font-semibold">
                        ${item.dailySpent.toFixed(2)} / ${item.dailyLimit.toFixed(2)} MUSD
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-surface-border/50">
                      <motion.div
                        className={`h-full rounded-full transition-all ${
                          dailyPct > 80 ? "bg-red-500" : "bg-cyan-400"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${dailyPct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal for Minting / Registering a Session Key */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0B0F19] border border-surface-border rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-mezo" />
                  <h3 className="text-base font-bold text-white">Authorize AI Agent Session Key</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-surface-card border border-surface-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setKeyInputMode("enclave");
                    setCustomKey("");
                  }}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    keyInputMode === "enclave"
                      ? "bg-mezo text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enclave Public Key</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setKeyInputMode("sandbox");
                    handleGenerateRandomKey();
                  }}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    keyInputMode === "sandbox"
                      ? "bg-mezo text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Sandbox Generator</span>
                </button>
              </div>

              {/* Security Context Banner */}
              {keyInputMode === "enclave" ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 leading-relaxed mb-4">
                  🔒 <strong>Zero-Knowledge Key Handshake:</strong> The autonomous agent generates its ECDSA private key within its local secure enclave, Docker runner, or AWS KMS. Enter only its public address below. Your master account signs on-chain authorization without the private key ever leaving the agent environment.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 leading-relaxed mb-4">
                  🧪 <strong>Interactive Sandbox Mode:</strong> A random mock address is generated for live browser demonstrations and velocity testing.
                </div>
              )}

              <form onSubmit={handleSubmitNewKey} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Agent Label / Purpose
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LangChain Search & Retrieval Worker"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-mezo"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {keyInputMode === "enclave" ? "Agent Public Address (0x...)" : "Generated Demo Address"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="0x..."
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-mezo"
                    />
                    {keyInputMode === "sandbox" && (
                      <button
                        type="button"
                        onClick={handleGenerateRandomKey}
                        className="px-3 py-2.5 rounded-xl bg-surface-light border border-surface-border text-[11px] font-bold text-slate-200 hover:text-white shrink-0"
                      >
                        New
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Sliding Hourly Limit (MUSD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={hourlyLimit}
                      onChange={(e) => setHourlyLimit(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono text-white focus:outline-none focus:border-mezo"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Daily Safety Cap (MUSD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono text-white focus:outline-none focus:border-mezo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Key Expiration Window
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs text-white focus:outline-none focus:border-mezo cursor-pointer"
                  >
                    <option value="1" className="bg-[#0B0F19]">24 Hours (High Security / Short Task)</option>
                    <option value="7" className="bg-[#0B0F19]">7 Days (Standard Autonomous Worker)</option>
                    <option value="30" className="bg-[#0B0F19]">30 Days (Production Agent Service)</option>
                    <option value="90" className="bg-[#0B0F19]">90 Days (Enterprise Infrastructure)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={restrictTargets}
                      onChange={(e) => setRestrictTargets(e.target.checked)}
                      className="rounded text-mezo focus:ring-mezo w-4 h-4 bg-slate-900 border-slate-700"
                    />
                    <span>Restrict calls to Whitelisted Target Contracts & Function Selectors</span>
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-mezo hover:bg-mezo-hover text-black text-xs font-extrabold shadow-lg shadow-mezo/20 transition-all"
                  >
                    Authorize on Mezo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
