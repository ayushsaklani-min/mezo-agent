"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Send, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

interface AlertRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  smartAccountAddress: string;
}

export const AlertRulesModal: React.FC<AlertRulesModalProps> = ({
  isOpen,
  onClose,
  smartAccountAddress,
}) => {
  const [webhookUrl, setWebhookUrl] = useState("https://discord.com/api/webhooks/123456789/sample-token");
  const [notifyOn80Pct, setNotifyOn80Pct] = useState(true);
  const [notifyOnReverts, setNotifyOnReverts] = useState(true);
  const [notifyOnRevocation, setNotifyOnRevocation] = useState(true);
  const [notifyOnExpiration, setNotifyOnExpiration] = useState(false);
  const [pingStatus, setPingStatus] = useState<"idle" | "sending" | "success">("idle");
  const [testPayloadPreview, setTestPayloadPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestPing = () => {
    setPingStatus("sending");
    const payload = {
      event: "VELOCITY_CAP_REVERT",
      severity: "CRITICAL_ALERT",
      account: smartAccountAddress,
      agentKey: "0x39a17e36ba4a6b4d238ff944bacb478cbed5efcae",
      agentLabel: "Autonomous LLM Research Bot",
      attemptedAmount: "250.00 MUSD",
      hourlyLimit: "15.00 MUSD",
      reason: "Hourly velocity cap exceeded on Mezo (0x08c379a0)",
      timestamp: new Date().toISOString(),
      network: "Mezo Testnet (31611)",
      suggestedAction: "Smart contract prevented treasury outflow. Key remains active under sliding window.",
    };

    setTestPayloadPreview(JSON.stringify(payload, null, 2));

    setTimeout(() => {
      setPingStatus("success");
      setTimeout(() => setPingStatus("idle"), 3500);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-surface border border-surface-border rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-border/70 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-mezo">
                <Bell className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Real-Time Security & Budget Alerts
                </h3>
                <p className="text-xs text-slate-400">
                  Deliver instant webhook alerts to Discord, Slack, or Telegram
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

          <div className="space-y-4 text-xs">
            {/* Webhook Endpoint Input */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                Webhook URL (Discord / Slack / Custom SIEM)
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-slate-200 font-mono focus:outline-none focus:border-mezo transition-colors"
              />
            </div>

            {/* Notification Triggers */}
            <div className="space-y-2 pt-2">
              <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Active Alert Triggers
              </span>

              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-surface-border/70 cursor-pointer hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block font-bold text-slate-200">Budget Warning (&gt;= 80% Hourly Cap)</span>
                    <span className="text-[11px] text-slate-400">Notifies ops team before an agent gets rate limited.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOn80Pct}
                  onChange={(e) => setNotifyOn80Pct(e.target.checked)}
                  className="rounded text-mezo focus:ring-mezo w-4 h-4 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-surface-border/70 cursor-pointer hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="block font-bold text-slate-200">Velocity Revert Detected (Potential Rogue Bot)</span>
                    <span className="text-[11px] text-slate-400">Triggered when contract blocks an unauthorized spend attempt.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnReverts}
                  onChange={(e) => setNotifyOnReverts(e.target.checked)}
                  className="rounded text-mezo focus:ring-mezo w-4 h-4 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-surface-border/70 cursor-pointer hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="block font-bold text-slate-200">Emergency Actions & Key Revocation</span>
                    <span className="text-[11px] text-slate-400">Instant ping when owner or guardian triggers emergency stop.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnRevocation}
                  onChange={(e) => setNotifyOnRevocation(e.target.checked)}
                  className="rounded text-mezo focus:ring-mezo w-4 h-4 bg-slate-900 border-slate-700"
                />
              </label>
            </div>

            {/* Test Ping Preview */}
            {testPayloadPreview && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto">
                <div className="flex items-center justify-between text-slate-400 pb-1 mb-1 border-b border-slate-800 text-[10px]">
                  <span>DISPATCHED WEBHOOK PAYLOAD</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <pre>{testPayloadPreview}</pre>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-5 mt-4 border-t border-surface-border/70">
            <button
              onClick={handleTestPing}
              disabled={pingStatus === "sending"}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-light border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Send className={`w-3.5 h-3.5 ${pingStatus === "sending" ? "animate-spin text-mezo" : "text-mezo"}`} />
              <span>{pingStatus === "sending" ? "Pinging..." : pingStatus === "success" ? "Ping Dispatched!" : "Test Webhook Ping"}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-mezo hover:bg-mezo-hover text-black text-xs font-extrabold shadow-md transition-colors"
            >
              Save Alert Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
