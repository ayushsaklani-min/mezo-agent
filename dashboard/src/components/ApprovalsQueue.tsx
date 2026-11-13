"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, UserCheck } from "lucide-react";

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
      className="p-6 sm:p-7 rounded-2xl bg-[#0E121E] border-2 border-black shadow-brutal-lg relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-2 border-black font-mono">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-mezo stroke-[2.5]" />
              <span>HUMAN-IN-THE-LOOP APPROVAL QUEUE</span>
            </h2>
            {pendingCount > 0 ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-amber-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm animate-pulse">
                {pendingCount} PENDING REVIEW
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#121622] text-slate-300 border-2 border-black font-black uppercase">
                0 PENDING
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Autonomous micro-payments under ${threshold} MUSD execute instantly; requests above threshold require multi-sig review.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 self-start sm:self-auto">
          <span>THRESHOLD:</span>
          <span className="px-2.5 py-1 rounded-md bg-amber-400 text-black border-2 border-black font-black shadow-brutal-sm">
            ${threshold.toFixed(2)} MUSD
          </span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3 font-mono">
        {requests.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-xl">
            <ShieldCheck className="w-7 h-7 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-bold">No high-value approval requests pending</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Agents operate freely within authorized velocity envelopes.
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
                className={`p-4 sm:p-5 rounded-xl border-2 border-black transition-all shadow-brutal ${
                  isPending
                    ? "bg-[#05060A]"
                    : isApproved
                    ? "bg-emerald-950/20 opacity-80"
                    : "bg-red-950/20 opacity-70"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shrink-0 mt-0.5 shadow-brutal-sm ${
                        isPending
                          ? "bg-amber-400 text-black"
                          : isApproved
                          ? "bg-emerald-400 text-black"
                          : "bg-red-400 text-black"
                      }`}
                    >
                      {isPending ? (
                        <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                      ) : isApproved ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <XCircle className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-white">{req.agentLabel}</span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#121622] border-2 border-black text-slate-200 font-bold">
                          {req.target.slice(0, 8)}...{req.target.slice(-4)}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border-2 border-black font-black uppercase shadow-brutal-sm ${
                            isPending
                              ? "bg-amber-400 text-black"
                              : isApproved
                              ? "bg-emerald-400 text-black"
                              : "bg-red-400 text-black"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 font-bold">
                        "{req.memo}"
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(req.requestedAt).toLocaleTimeString()}
                        </span>
                        <span>•</span>
                        <span>Exceeds ${threshold} micro-threshold</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action Buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-0 border-zinc-800 shrink-0">
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400 uppercase font-mono font-bold">REQUESTED</span>
                      <span className="block font-mono font-black text-sm sm:text-base text-mezo">
                        ${req.musdAmount.toFixed(2)} MUSD
                      </span>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRejectingId(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900 border-2 border-red-600 text-xs font-black text-red-300 transition-colors shadow-brutal-sm"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => onApprove(req.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-mezo text-black text-xs font-black border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Approve & Disburse</span>
                        </button>
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
                      className="mt-3 pt-3 border-t-2 border-black flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Reason for rejection (e.g. Unverified counterparty)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#05060A] border-2 border-black text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400 font-mono"
                      />
                      <button
                        onClick={() => handleConfirmReject(req.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-500 text-black text-xs font-black border-2 border-black shadow-brutal-sm"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white font-bold"
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
