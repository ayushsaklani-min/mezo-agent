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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-white border-[3px] border-black rounded-2xl p-6 sm:p-7 shadow-[10px_10px_0px_0px_#000000] relative overflow-hidden text-black"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FE9CE8] border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                <Bell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-black tracking-tight uppercase">
                  Real-Time Security & Budget Alerts
                </h3>
                <p className="text-xs font-bold text-gray-700">
                  Deliver instant webhook alerts to Discord, Slack, or Telegram
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-[#FFDC9B] text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="space-y-4 text-xs font-bold">
            {/* Webhook Endpoint Input */}
            <div>
              <label className="block text-black font-black uppercase text-[11px] mb-1.5 tracking-wider">
                Webhook URL (Discord / Slack / SIEM)
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF8] border-2 border-black text-black font-mono text-xs focus:outline-none focus:bg-[#C0F7FE]/30 shadow-brutal-sm transition-all"
              />
            </div>

            {/* Notification Triggers */}
            <div className="space-y-2.5 pt-2">
              <span className="block text-black font-black uppercase tracking-wider text-[11px]">
                Active Alert Triggers
              </span>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFFDF8] border-2 border-black shadow-brutal-sm cursor-pointer hover:bg-[#F7CB46]/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F7CB46] border-2 border-black flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block font-black text-black text-xs">Budget Warning (&ge; 80% Hourly Cap)</span>
                    <span className="text-[11px] font-semibold text-gray-600">Notifies ops team before an agent gets rate limited.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOn80Pct}
                  onChange={(e) => setNotifyOn80Pct(e.target.checked)}
                  className="rounded border-2 border-black text-black focus:ring-black w-5 h-5 accent-black cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFFDF8] border-2 border-black shadow-brutal-sm cursor-pointer hover:bg-[#FE9CE8]/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FE9CE8] border-2 border-black flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block font-black text-black text-xs">Velocity Revert Detected (Potential Rogue Bot)</span>
                    <span className="text-[11px] font-semibold text-gray-600">Triggered when contract blocks an unauthorized spend attempt.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnReverts}
                  onChange={(e) => setNotifyOnReverts(e.target.checked)}
                  className="rounded border-2 border-black text-black focus:ring-black w-5 h-5 accent-black cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFFDF8] border-2 border-black shadow-brutal-sm cursor-pointer hover:bg-[#C0F7FE]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#99E885] border-2 border-black flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block font-black text-black text-xs">Emergency Actions & Key Revocation</span>
                    <span className="text-[11px] font-semibold text-gray-600">Instant ping when owner or guardian triggers emergency stop.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnRevocation}
                  onChange={(e) => setNotifyOnRevocation(e.target.checked)}
                  className="rounded border-2 border-black text-black focus:ring-black w-5 h-5 accent-black cursor-pointer"
                />
              </label>
            </div>

            {/* Test Ping Preview */}
            {testPayloadPreview && (
              <div className="p-3.5 rounded-xl bg-black border-2 border-black text-[11px] font-mono text-[#99E885] max-h-36 overflow-y-auto shadow-brutal-sm">
                <div className="flex items-center justify-between text-white pb-1.5 mb-1.5 border-b border-gray-700 text-[10px] font-bold">
                  <span>DISPATCHED WEBHOOK PAYLOAD</span>
                  <span className="bg-[#99E885] text-black px-1.5 py-0.5 rounded border border-black font-black">200 OK</span>
                </div>
                <pre>{testPayloadPreview}</pre>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-5 mt-5 border-t-2 border-black">
            <button
              onClick={handleTestPing}
              disabled={pingStatus === "sending"}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C0F7FE] border-2 border-black text-black text-xs font-black shadow-brutal-sm hover:bg-[#a5f3fc] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Send className={`w-3.5 h-3.5 stroke-[2.5] ${pingStatus === "sending" ? "animate-spin" : ""}`} />
              <span>{pingStatus === "sending" ? "Pinging..." : pingStatus === "success" ? "Ping Dispatched!" : "Test Webhook Ping"}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#F7CB46] hover:bg-[#eec038] border-2 border-black text-black text-xs font-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              Save Alert Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
