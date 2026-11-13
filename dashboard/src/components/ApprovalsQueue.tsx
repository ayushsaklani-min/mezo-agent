"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, UserCheck, Eye, Terminal } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";

export interface PendingRequestItem {
  id: string;
  onChainId?: number;
  sessionKey: string;
  agentLabel: string;
  target: string;
  musdAmount: number;
  memo: string;
  requestedAt: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ApprovalsQueueProps {
  requests: PendingRequestItem[];
  threshold: number;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

export const ApprovalsQueue: React.FC<ApprovalsQueueProps> = ({
  requests,
  threshold,
  onApprove,
  onReject,
}) => {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const handleConfirmReject = (id: string) => {
    onReject(id, rejectReason || "Rejected by treasury administrator");
    setRejectingId(null);
    setRejectReason("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="p-6 sm:p-7 rounded-3xl bg-surface border border-surface-border shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-mezo" />
              <span>Human-in-the-Loop Approval Queue</span>
            </h2>
            {pendingCount > 0 ? (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                {pendingCount} Pending Review
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-card border border-surface-border text-slate-400">
                0 Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Autonomous micro-payments under ${threshold} MUSD execute automatically; transactions above threshold require multi-sig or human sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 self-start sm:self-auto">
          <span>Threshold:</span>
          <span className="px-2.5 py-1 rounded-xl bg-surface-card border border-surface-border text-mezo font-bold">
            ${threshold.toFixed(2)} MUSD
          </span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-surface-border/70 rounded-2xl">
            <ShieldCheck className="w-7 h-7 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-semibold">No high-value approval requests pending</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Agents operate freely within authorized per-transaction and velocity limits.
            </p>
          </div>
        ) : (
          requests.map((req) => {
            const isPending = req.status === "PENDING";
            const isApproved = req.status === "APPROVED";

            return (
              <motion.div
                key={req.id}
                layout
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isPending
                    ? "bg-amber-950/15 border-amber-900/40 shadow-md"
                    : isApproved
                    ? "bg-surface-card border-surface-border opacity-70"
                    : "bg-red-950/15 border-red-900/30 opacity-60"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isPending
                          ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                          : isApproved
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {isPending ? (
                        <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                      ) : isApproved ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white">{req.agentLabel}</span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-light border border-surface-border text-slate-300">
                          {req.target.slice(0, 8)}...{req.target.slice(-4)}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            isPending
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : isApproved
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 font-medium">
                        "{req.memo}"
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(req.requestedAt).toLocaleTimeString()}
                        </span>
                        <span>•</span>
                        <span>Gated: Exceeds ${threshold} threshold</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action Buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-0 border-surface-border/40 shrink-0">
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">Requested</span>
                      <span className="block font-mono font-extrabold text-sm sm:text-base text-mezo">
                        ${req.musdAmount.toFixed(2)} MUSD
                      </span>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setRejectingId(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-surface-light hover:bg-red-950/40 border border-surface-border hover:border-red-800 text-xs font-bold text-slate-300 hover:text-red-300 transition-colors"
                        >
                          Reject
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onApprove(req.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-mezo hover:bg-mezo-hover text-black text-xs font-extrabold shadow-md transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Approve & Disburse</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reject Reason Input (If toggled) */}
                <AnimatePresence>
                  {rejectingId === req.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-surface-border/60 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Reason for rejection (e.g. Unverified counterparty)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400 font-mono"
                      />
                      <button
                        onClick={() => handleConfirmReject(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
