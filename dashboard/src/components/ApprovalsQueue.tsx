"use client";

import React, { useState } from "react";
import { UserCheck, AlertTriangle, CheckCircle2, XCircle, Clock, ShieldCheck, Check, X } from "lucide-react";

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
    <div className="p-6 sm:p-7 rounded-2xl bg-white border-[3px] border-black shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FFDC9B] border-2 border-black shadow-brutal-sm flex items-center justify-center text-black">
              <UserCheck className="w-4 h-4 stroke-[3]" />
            </div>
            <h2 className="text-lg font-black text-black tracking-tight uppercase">
              Human-in-the-Loop Approvals
            </h2>
            {pendingCount > 0 ? (
              <span className="neo-badge bg-[#F7CB46] text-black text-[10px] px-2 py-0.5 rounded uppercase animate-bounce">
                {pendingCount} PENDING REVIEW
              </span>
            ) : (
              <span className="neo-badge bg-[#FAF7F0] text-black text-[10px] px-2 py-0.5 rounded uppercase">
                0 PENDING
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-700">
            Autonomous micro-payments under ${threshold} MUSD execute automatically; high-value outlays require human sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-black text-black self-start sm:self-auto">
          <span>APPROVAL THRESHOLD:</span>
          <span className="neo-badge bg-[#F7CB46] text-black px-2.5 py-1 rounded">
            ${threshold.toFixed(2)} MUSD
          </span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-black rounded-xl bg-[#FAF7F0]">
            <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-black text-black">NO HIGH-VALUE APPROVAL REQUESTS PENDING</p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              Agents operate freely within authorized sliding-window velocity limits.
            </p>
          </div>
        ) : (
          requests.map((req) => {
            const isPending = req.status === "PENDING";
            const isApproved = req.status === "APPROVED";

            return (
              <div
                key={req.id}
                className={`p-5 rounded-xl border-2 border-black transition-all ${
                  isPending
                    ? "bg-[#FFFDF0] shadow-brutal hover:shadow-brutal-lg"
                    : isApproved
                    ? "bg-[#F0FDF4] opacity-80 border-black/60 shadow-brutal-sm"
                    : "bg-[#FFF1F2] opacity-70 border-black/60 shadow-brutal-sm"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 border-black shadow-brutal-sm mt-0.5 ${
                        isPending
                          ? "bg-[#F7CB46] text-black"
                          : isApproved
                          ? "bg-[#99E885] text-black"
                          : "bg-[#FF4757] text-white"
                      }`}
                    >
                      {isPending ? (
                        <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                      ) : isApproved ? (
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <XCircle className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-black">{req.agentLabel}</span>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white border border-black shadow-brutal-sm text-black">
                          {req.target.slice(0, 8)}...{req.target.slice(-4)}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-black shadow-brutal-sm ${
                            isPending
                              ? "bg-[#F7CB46] text-black"
                              : isApproved
                              ? "bg-[#99E885] text-black"
                              : "bg-[#FF4757] text-white"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs font-black text-black mt-1.5">
                        "{req.memo}"
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-xs font-mono font-bold text-slate-700">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(req.requestedAt).toLocaleTimeString()}
                        </span>
                        <span>•</span>
                        <span>EXCEEDS ${threshold} THRESHOLD</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Value */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 self-end md:self-auto">
                    <div className="text-right">
                      <span className="text-xl font-black font-mono text-black block">
                        ${req.musdAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#FE9CE8] text-black border border-black shadow-brutal-sm inline-block mt-0.5">
                        MUSD REQUESTED
                      </span>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        {rejectingId === req.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="Reason..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-bold text-black focus:outline-none w-32"
                            />
                            <button
                              onClick={() => handleConfirmReject(req.id)}
                              className="neo-btn p-2 rounded-lg bg-[#FF4757] text-white"
                              title="Confirm Rejection"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <button
                              onClick={() => setRejectingId(null)}
                              className="p-2 rounded-lg border-2 border-black bg-white text-black hover:bg-slate-100"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => onApprove(req.id)}
                              className="neo-btn flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#99E885] hover:bg-[#86efac] text-black text-xs font-black shadow-brutal"
                              title="Release funds from Smart Account on-chain"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>APPROVE</span>
                            </button>
                            <button
                              onClick={() => setRejectingId(req.id)}
                              className="neo-btn flex items-center gap-1 px-3 py-2 rounded-xl bg-[#FF4757] hover:bg-red-600 text-white text-xs font-black shadow-brutal"
                              title="Reject spend request"
                            >
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                              <span>REJECT</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
