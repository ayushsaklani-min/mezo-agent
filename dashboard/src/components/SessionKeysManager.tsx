"use client";

import React, { useState } from "react";
import { Plus, Key, Clock, ShieldAlert, Check, Copy, Ban, Sparkles } from "lucide-react";
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
    <div className="p-6 rounded-2xl bg-surface border border-surface-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>AI Agent Session Keys</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-mono">
              ERC-4337 Compatible
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographic ephemeral keys with velocity controls and target limits
          </p>
        </div>

        <button
          onClick={() => {
            handleGenerateRandomKey();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-mezo hover:bg-mezo-hover text-black text-xs font-semibold shadow-md shadow-mezo/15 transition-all"
        >
          <Plus className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Mint Session Key</span>
        </button>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        {sessionKeys.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-surface-border rounded-xl">
            <Key className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">No active session keys found</p>
            <p className="text-xs text-slate-500 mt-1">
              Mint a session key to delegate safe MUSD spending to an AI agent.
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
                className={`p-4 rounded-xl border transition-all ${
                  item.active
                    ? "bg-surface-light/60 border-surface-border hover:border-slate-600"
                    : "bg-red-950/10 border-red-900/30 opacity-70"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        item.active
                          ? "bg-mezo/10 text-mezo ring-1 ring-mezo/20"
                          : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                      }`}
                    >
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{item.label}</span>
                        {item.active ? (
                          <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.2 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                            Revoked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-slate-400">
                        <span>
                          {item.keyAddress.slice(0, 10)}...{item.keyAddress.slice(-6)}
                        </span>
                        <button
                          onClick={() => handleCopy(item.id, item.keyAddress)}
                          className="hover:text-white transition-colors"
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
                      <button
                        onClick={() => onRevokeKey(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-[11px] font-medium text-red-300 transition-colors"
                        title="Instant on-chain revocation"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bars for Hourly & Daily limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-surface-border/60">
                  {/* Hourly Limit */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Hourly Velocity Cap</span>
                      <span className="font-mono text-slate-200">
                        ${item.hourlySpent.toFixed(2)} / ${item.hourlyLimit.toFixed(2)} MUSD
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          hourlyPct > 80 ? "bg-amber-500" : "bg-mezo"
                        }`}
                        style={{ width: `${hourlyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Daily Limit */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Daily Safety Cap</span>
                      <span className="font-mono text-slate-200">
                        ${item.dailySpent.toFixed(2)} / ${item.dailyLimit.toFixed(2)} MUSD
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          dailyPct > 80 ? "bg-red-500" : "bg-cyan-400"
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

      {/* Modal for Minting a New Session Key */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-mezo" />
              <span>Configure AI Agent Session Key</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Deploy an on-chain authorization policy for your autonomous agent.
            </p>

            <form onSubmit={handleSubmitNewKey} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Agent Label / Purpose
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Per-Call Search Agent"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-mezo"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Ephemeral Key Public Address
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light border border-surface-border text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-mezo"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomKey}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 text-[11px] font-medium text-slate-200 hover:text-white shrink-0"
                  >
                    Random
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Hourly Limit (MUSD)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={hourlyLimit}
                    onChange={(e) => setHourlyLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light border border-surface-border text-xs font-mono text-white focus:outline-none focus:border-mezo"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Daily Limit (MUSD)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light border border-surface-border text-xs font-mono text-white focus:outline-none focus:border-mezo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Session Expiration
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light border border-surface-border text-xs text-white focus:outline-none focus:border-mezo"
                >
                  <option value="1">24 Hours</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="restrict"
                  checked={restrictTargets}
                  onChange={(e) => setRestrictTargets(e.target.checked)}
                  className="rounded border-slate-700 text-mezo focus:ring-mezo"
                />
                <label htmlFor="restrict" className="text-xs text-slate-300 cursor-pointer">
                  Restrict to whitelisted API & DEX target contracts only
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-mezo hover:bg-mezo-hover text-xs font-semibold text-black shadow-md shadow-mezo/20"
                >
                  Confirm & Mint Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
