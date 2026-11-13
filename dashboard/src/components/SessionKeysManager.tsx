"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Key, Clock, ShieldAlert, Check, Copy, Ban, Sparkles, X, ShieldCheck, Cpu, Lock, AlertTriangle } from "lucide-react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { SessionKeyItem } from "@/lib/types";

interface SessionKeysManagerProps {
  sessionKeys: SessionKeyItem[];
  onCreateKey: (newKey: SessionKeyItem) => void;
  onRevokeKey: (keyId: string) => void;
  onReactivateKey?: (keyId: string) => void;
}

export const SessionKeysManager: React.FC<SessionKeysManagerProps> = ({
  sessionKeys,
  onCreateKey,
  onRevokeKey,
  onReactivateKey,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [selectedQuarantineKey, setSelectedQuarantineKey] = useState<SessionKeyItem | null>(null);

  // New Key Form State
  const [keyInputMode, setKeyInputMode] = useState<"enclave" | "sandbox">("enclave");
  const [label, setLabel] = useState("");
  const [hourlyLimit, setHourlyLimit] = useState("25");
  const [dailyLimit, setDailyLimit] = useState("100");
  const [maxPerTx, setMaxPerTx] = useState("5");
  const [durationDays, setDurationDays] = useState("7");
  const [restrictTargets, setRestrictTargets] = useState(true);
  const [customKey, setCustomKey] = useState("");

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleGenerateRandomKey = () => {
    try {
      const pk = generatePrivateKey();
      const acc = privateKeyToAccount(pk);
      setCustomKey(acc.address);
    } catch (_) {
      const randomHex = Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      setCustomKey(`0x${randomHex}`);
    }
  };

  const handleSubmitNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    let generatedPrivKey: string | undefined = undefined;
    let finalKey = customKey;

    if (!finalKey) {
      try {
        const pk = generatePrivateKey();
        const acc = privateKeyToAccount(pk);
        finalKey = acc.address;
        generatedPrivKey = pk;
      } catch (_) {
        finalKey = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      }
    }

    const newKeyItem: SessionKeyItem = {
      id: `sk_${Date.now()}`,
      label: label || "Autonomous Agent Key",
      keyAddress: finalKey,
      privateKey: generatedPrivKey,
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
      className="p-6 sm:p-7 rounded-2xl bg-[#0E121E] border-2 border-black shadow-brutal-lg relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
              AI AGENT SESSION KEYS
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-emerald-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm">
              SCOPED POLICIES
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Cryptographic ephemeral keys with 12-bucket sliding window velocity envelopes
          </p>
        </div>

        <button
          onClick={() => {
            setKeyInputMode("enclave");
            setCustomKey("");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mezo text-black text-xs font-black border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>AUTHORIZE SESSION KEY</span>
        </button>
      </div>

      {/* Keys List */}
      <div className="space-y-3.5 font-mono">
        {sessionKeys.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-xl">
            <Key className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-bold">No active session keys found</p>
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
                className={`p-4 sm:p-5 rounded-xl border-2 border-black transition-all shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                  item.active
                    ? "bg-[#05060A]"
                    : "bg-red-950/20 opacity-75"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm ${
                        item.active
                          ? "bg-mezo text-black"
                          : "bg-red-500 text-black"
                      }`}
                    >
                      <Key className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-white">{item.label}</span>
                        {item.status === "QUARANTINED" ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-amber-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                            <span>QUARANTINED (CIRCUIT BREAKER)</span>
                          </span>
                        ) : item.active ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm">
                            Revoked
                          </span>
                        )}
                        {item.restrictTargets ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm">
                            Whitelisted Targets
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#121622] text-slate-300 border-2 border-black font-black uppercase">
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
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Meta */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{daysLeft}d left</span>
                    </div>

                    {item.status === "QUARANTINED" ? (
                      <button
                        onClick={() => setSelectedQuarantineKey(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-black border-2 border-black text-xs font-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>INSPECT & DISINFECT</span>
                      </button>
                    ) : item.active ? (
                      <button
                        onClick={() => onRevokeKey(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-black border-2 border-black text-xs font-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                        title="Instant on-chain revocation (effective in next block)"
                      >
                        <Ban className="w-3.5 h-3.5 stroke-[3]" />
                        <span>REVOKE</span>
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Progress Bars for Hourly & Daily limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t-2 border-black">
                  {/* Hourly Limit */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-400">Sliding Hourly Envelope</span>
                      <span className="text-slate-200">
                        ${item.hourlySpent.toFixed(2)} / ${item.hourlyLimit.toFixed(2)} MUSD
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-black rounded-lg overflow-hidden border-2 border-black">
                      <motion.div
                        className={`h-full rounded-md transition-all ${
                          hourlyPct > 80 ? "bg-amber-400" : "bg-mezo"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${hourlyPct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Daily Limit */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-400">Daily Safety Cap</span>
                      <span className="text-slate-200">
                        ${item.dailySpent.toFixed(2)} / ${item.dailyLimit.toFixed(2)} MUSD
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-black rounded-lg overflow-hidden border-2 border-black">
                      <motion.div
                        className={`h-full rounded-md transition-all ${
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E121E] border-2 border-black rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-brutal-lg relative z-10 font-mono"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-mezo stroke-[2.5]" />
                  <h3 className="text-base font-black text-white">Authorize AI Agent Session Key</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-[#05060A] border-2 border-black text-xs font-black">
                <button
                  type="button"
                  onClick={() => {
                    setKeyInputMode("enclave");
                    setCustomKey("");
                  }}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 border border-black ${
                    keyInputMode === "enclave"
                      ? "bg-mezo text-black shadow-sm font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Enclave Public Key</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setKeyInputMode("sandbox");
                    handleGenerateRandomKey();
                  }}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 border border-black ${
                    keyInputMode === "sandbox"
                      ? "bg-mezo text-black shadow-sm font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Sandbox Generator</span>
                </button>
              </div>

              {/* Security Context Banner */}
              {keyInputMode === "enclave" ? (
                <div className="p-3 rounded-xl bg-emerald-400/10 border-2 border-black text-[11px] text-emerald-300 font-bold leading-relaxed mb-4">
                  🔒 <strong>Zero-Knowledge Key Handshake:</strong> The autonomous agent generates its private key locally in its enclave. Only provide its public address. Your master smart account signs on-chain authorization.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-cyan-400/10 border-2 border-black text-[11px] text-cyan-300 font-bold leading-relaxed mb-4">
                  🧪 <strong>Interactive Sandbox Mode:</strong> A random mock address is generated for live browser demonstrations and velocity testing.
                </div>
              )}

              <form onSubmit={handleSubmitNewKey} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Agent Label / Purpose
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LangChain Search & Retrieval Worker"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05060A] border-2 border-black text-xs text-white placeholder-slate-500 focus:outline-none focus:border-mezo"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    {keyInputMode === "enclave" ? "Agent Public Address (0x...)" : "Generated Demo Address"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="0x..."
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#05060A] border-2 border-black text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-mezo"
                    />
                    {keyInputMode === "sandbox" && (
                      <button
                        type="button"
                        onClick={handleGenerateRandomKey}
                        className="px-3 py-2.5 rounded-xl bg-[#121622] border-2 border-black text-[11px] font-black text-slate-200 hover:text-white shrink-0 shadow-brutal-sm"
                      >
                        New
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Hourly Limit (MUSD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={hourlyLimit}
                      onChange={(e) => setHourlyLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#05060A] border-2 border-black text-xs font-mono text-white focus:outline-none focus:border-mezo"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Daily Cap (MUSD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#05060A] border-2 border-black text-xs font-mono text-white focus:outline-none focus:border-mezo"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Max Per Tx (MUSD)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={maxPerTx}
                      onChange={(e) => setMaxPerTx(e.target.value)}
                      placeholder="0 = none"
                      className="w-full px-3 py-2 rounded-xl bg-[#05060A] border-2 border-black text-xs font-mono text-white focus:outline-none focus:border-mezo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Key Expiration Window
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05060A] border-2 border-black text-xs text-white focus:outline-none focus:border-mezo cursor-pointer font-bold"
                  >
                    <option value="1" className="bg-[#0B0F19]">24 Hours (High Security / Short Task)</option>
                    <option value="7" className="bg-[#0B0F19]">7 Days (Standard Autonomous Worker)</option>
                    <option value="30" className="bg-[#0B0F19]">30 Days (Production Agent Service)</option>
                    <option value="90" className="bg-[#0B0F19]">90 Days (Enterprise Infrastructure)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-bold">
                    <input
                      type="checkbox"
                      checked={restrictTargets}
                      onChange={(e) => setRestrictTargets(e.target.checked)}
                      className="rounded text-mezo focus:ring-mezo w-4 h-4 bg-slate-900 border-2 border-black"
                    />
                    <span>Restrict calls to Whitelisted Target Contracts & Function Selectors</span>
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-mezo text-black text-xs font-black border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    Authorize on Mezo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Inspect Incident & Disinfect Modal */}
        {selectedQuarantineKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0E121E] border-2 border-black rounded-2xl p-6 sm:p-7 shadow-brutal-lg relative overflow-hidden font-mono"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-400 text-black border-2 border-black shadow-brutal-sm">
                    <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Circuit Breaker Anomaly Report</h3>
                    <p className="text-xs text-amber-400 font-bold">Key Quarantined via On-Chain Anomaly Rule</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuarantineKey(null)}
                  className="text-slate-400 hover:text-white p-1 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-amber-400/10 border-2 border-black text-slate-300 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Agent Identifier:</span>
                    <span className="text-white font-black">{selectedQuarantineKey.label}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Consecutive Reverts:</span>
                    <span className="text-red-400 font-black">{selectedQuarantineKey.consecutiveReverts || 3} Failed Traces</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Trip Cause:</span>
                    <span className="text-amber-400 font-bold">{selectedQuarantineKey.quarantineReason || "Prompt Injection / Rapid Velocity Breach"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#05060A] border-2 border-black font-mono text-[11px] text-slate-300 space-y-1">
                  <div className="text-slate-500 text-[10px] pb-1 border-b border-zinc-800">LAST TRACED CALLDATA IN SANDBOX</div>
                  <div className="text-red-400 break-all font-bold">
                    0xa9059cbb000000000000000000000000attacker999900000000000000000000000000000064
                  </div>
                  <div className="text-slate-400 text-[10px] pt-1">
                    Status: <span className="text-amber-400 font-black">Isolated</span>. Smart account halted execution before state modification.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#121622] border-2 border-black text-slate-300 text-[11px] font-bold">
                  <strong>Admin Guidance:</strong> If this was a test, disinfect the key (clearing the counter). If compromised, permanently slash and revoke it.
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-black gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onRevokeKey) onRevokeKey(selectedQuarantineKey.id);
                      setSelectedQuarantineKey(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 text-black text-xs font-black border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <Ban className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Slash & Revoke Key</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onReactivateKey) onReactivateKey(selectedQuarantineKey.id);
                      setSelectedQuarantineKey(null);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-400 text-black text-xs font-black border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 stroke-[3]" />
                    <span>Disinfect & Reactivate</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
