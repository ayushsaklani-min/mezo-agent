"use client";

import React from "react";
import { ArrowUpRight, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";
import type { ActivityLog } from "@/lib/types";

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs }) => {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Live On-Chain Activity Feed</h2>
          <p className="text-xs text-slate-400">
            Real-time events emitted from MezoAgentAccount contracts
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500">
          {logs.length} transactions recorded
        </span>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No transactions recorded in this session.
          </div>
        ) : (
          logs.map((log) => {
            const isSuccess = log.status === "SUCCESS";

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-surface-light/70 border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSuccess
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{log.title}</span>
                      {log.amount && (
                        <span className="font-mono font-bold text-mezo">
                          {log.amount}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{log.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>

                  {log.txHash ? (
                    <a
                      href={`${MEZO_CONFIG.explorerUrl}/tx/${log.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-[11px] text-mezo hover:underline"
                    >
                      <span>{log.txHash.slice(0, 8)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-red-400 font-mono">REVERTED</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
