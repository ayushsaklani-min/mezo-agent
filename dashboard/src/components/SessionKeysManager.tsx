"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Key, Clock, Check, Copy, Ban, Sparkles, X, ShieldCheck, Cpu, Lock } from "lucide-react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
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
      allowedTargets: restrictTargets ? ["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"] : [],
    };

    onCreateKey(newKeyItem);
    setIsModalOpen(false);
    setLabel("");
    setCustomKey("");
  };

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white border-[3px] border-black shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black shadow-brutal-sm flex items-center justify-center text-black">
              <Key className="w-4 h-4 stroke-[3]" />
            </div>
            <h2 className="text-lg font-black text-black tracking-tight uppercase">
              Agent Session Keys
            </h2>
            <span className="neo-badge bg-[#BBF7D0] text-black text-[10px] px-2 py-0.5 rounded uppercase">
              EIP-7715 INSPIRED
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700">
            Cryptographic ephemeral keys with 12-bucket sliding window velocity controls
          </p>
        </div>

        <button
          onClick={() => {
            setKeyInputMode("enclave");
            setCustomKey("");
            setIsModalOpen(true);
          }}
          className="neo-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#FF8800] text-black text-xs font-black shadow-brutal self-start sm:self-auto uppercase tracking-wide"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>AUTHORIZE NEW KEY</span>
        </button>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        {sessionKeys.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-black rounded-xl bg-[#FAF7F0]">
            <Key className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-black text-black">NO ACTIVE SESSION KEYS FOUND</p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              Authorize a session key to delegate safe MUSD spending to an AI agent.
            </p>
          </div>
        ) : (
          sessionKeys.map((item) => {
            const hourlyPct = Math.min(100, Math.round((item.hourlySpent / item.hourlyLimit) * 100));
            const dailyPct = Math.min(100, Math.round((item.dailySpent / item.dailyLimit) * 100));
            const daysLeft = Math.max(0, Math.ceil((item.validUntil - Date.now()) / (86400 * 1000)));

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border-2 border-black transition-all ${
                  item.active
                    ? "bg-white shadow-brutal hover:shadow-brutal-lg"
                    : "bg-[#FFF1F2] border-black/80 opacity-75 shadow-brutal-sm"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 border-black shadow-brutal-sm ${
                        item.active
                          ? "bg-[#FFE600] text-black"
                          : "bg-[#FF4757] text-white"
                      }`}
                    >
                      <Key className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-black">{item.label}</span>
                        {item.active ? (
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#4ADE80] text-black border border-black shadow-brutal-sm">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#FF6B6B] text-black border border-black shadow-brutal-sm">
                            REVOKED
                          </span>
                        )}
                        {item.restrictTargets ? (
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#BAE6FD] text-black border border-black shadow-brutal-sm">
                            WHITELISTED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#FAF7F0] text-black border border-black">
                            UNRESTRICTED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs font-mono font-bold text-slate-700">
                        <span>
                          {item.keyAddress.slice(0, 10)}...{item.keyAddress.slice(-6)}
                        </span>
                        <button
                          onClick={() => handleCopy(item.id, item.keyAddress)}
                          className="hover:text-black transition-colors p-0.5 bg-[#FAF7F0] rounded border border-black"
                          title="Copy Public Key"
                        >
                          {copiedKeyId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Meta */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-black bg-[#FAF7F0] px-2.5 py-1 rounded border border-black">
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{daysLeft} DAYS LEFT</span>
                    </div>

                    {item.active && (
                      <button
                        onClick={() => onRevokeKey(item.id)}
                        className="neo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF4757] hover:bg-red-600 text-white text-xs font-black shadow-brutal-sm"
                        title="Instant on-chain revocation"
                      >
                        <Ban className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>REVOKE KEY</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bars for Hourly & Daily limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t-2 border-black/40">
                  {/* Hourly Limit */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono font-black mb-1.5 text-black">
                      <span>SLIDING HOURLY CAP</span>
                      <span>
                        ${item.hourlySpent.toFixed(2)} / ${item.hourlyLimit.toFixed(2)} MUSD
                      </span>
                    </div>
                    <div className="w-full h-3.5 bg-[#FAF7F0] rounded-md overflow-hidden border-2 border-black p-0.5 shadow-brutal-sm">
                      <div
                        className={`h-full rounded-xs transition-all ${
                          hourlyPct > 80 ? "bg-[#FF4757]" : "bg-[#FF9900]"
                        }`}
                        style={{ width: `${hourlyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Daily Limit */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono font-black mb-1.5 text-black">
                      <span>DAILY SAFETY CAP</span>
                      <span>
                        ${item.dailySpent.toFixed(2)} / ${item.dailyLimit.toFixed(2)} MUSD
                      </span>
                    </div>
                    <div className="w-full h-3.5 bg-[#FAF7F0] rounded-md overflow-hidden border-2 border-black p-0.5 shadow-brutal-sm">
                      <div
                        className={`h-full rounded-xs transition-all ${
                          dailyPct > 80 ? "bg-[#FF4757]" : "bg-[#38BDF8]"
                        }`}
                        style={{ width: `${dailyPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border-[3px] border-black rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-[10px_10px_0px_0px_#000000] relative z-10"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#FFE600] border-2 border-black flex items-center justify-center">
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-black text-black uppercase">
                    Authorize AI Agent Key
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-md border-2 border-black bg-[#FAF7F0] hover:bg-[#FF4757] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-[#FAF7F0] border-2 border-black text-xs font-black">
                <button
                  type="button"
                  onClick={() => {
                    setKeyInputMode("enclave");
                    setCustomKey("");
                  }}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    keyInputMode === "enclave"
                      ? "bg-[#FFE600] text-black border-2 border-black shadow-brutal-sm"
                      : "text-slate-700 hover:text-black"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>ENCLAVE PUBLIC KEY</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setKeyInputMode("sandbox");
                    handleGenerateRandomKey();
                  }}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    keyInputMode === "sandbox"
                      ? "bg-[#FFE600] text-black border-2 border-black shadow-brutal-sm"
                      : "text-slate-700 hover:text-black"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>MINT NEW KEYPAIR</span>
                </button>
              </div>

              {/* Security Context Banner */}
              {keyInputMode === "enclave" ? (
                <div className="p-3 rounded-xl bg-[#DCFCE7] border-2 border-black text-xs text-black font-semibold mb-4 shadow-brutal-sm">
                  🔒 <strong>Zero-Knowledge Handshake:</strong> Agent generates private key in isolated enclave (Docker/AWS KMS). Enter only public address. Private key never leaves agent environment.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#E0F2FE] border-2 border-black text-xs text-black font-semibold mb-4 shadow-brutal-sm">
                  🧪 <strong>Live Testnet Keypair:</strong> Generates fresh cryptographic keypair for autonomous micro-payment execution.
                </div>
              )}

              <form onSubmit={handleSubmitNewKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-black text-black mb-1 uppercase">
                    Agent Label / Purpose
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LangChain Search & Retrieval Worker"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-black font-bold text-xs text-black focus:outline-none focus:shadow-brutal-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-black text-black mb-1 uppercase">
                    {keyInputMode === "enclave" ? "Agent Public Address (0x...)" : "Generated Demo Address"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="0x..."
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs text-black focus:outline-none focus:shadow-brutal-sm"
                    />
                    {keyInputMode === "sandbox" && (
                      <button
                        type="button"
                        onClick={handleGenerateRandomKey}
                        className="neo-btn px-3 py-2.5 rounded-xl bg-[#FFE600] text-xs font-black text-black shrink-0"
                      >
                        NEW
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-black text-black mb-1 uppercase">
                      Hourly (MUSD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={hourlyLimit}
                      onChange={(e) => setHourlyLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs text-black focus:outline-none focus:shadow-brutal-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-black text-black mb-1 uppercase">
                      Daily Cap (MUSD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs text-black focus:outline-none focus:shadow-brutal-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-black text-black mb-1 uppercase">
                      Max / Tx (MUSD)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={maxPerTx}
                      onChange={(e) => setMaxPerTx(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs text-black focus:outline-none focus:shadow-brutal-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-black text-black mb-1 uppercase">
                    Expiration Window
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-black text-xs font-bold text-black focus:outline-none cursor-pointer"
                  >
                    <option value="1">24 Hours (High Security / Short Task)</option>
                    <option value="7">7 Days (Standard Autonomous Worker)</option>
                    <option value="30">30 Days (Production Agent Service)</option>
                    <option value="90">90 Days (Enterprise Infrastructure)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-black">
                    <input
                      type="checkbox"
                      checked={restrictTargets}
                      onChange={(e) => setRestrictTargets(e.target.checked)}
                      className="rounded border-2 border-black text-black focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span>Restrict calls to Whitelisted Target Contracts & Function Selectors</span>
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-700 hover:text-black transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="neo-btn px-5 py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#FF8800] text-black text-xs font-black shadow-brutal uppercase tracking-wide"
                  >
                    AUTHORIZE ON MEZO
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
