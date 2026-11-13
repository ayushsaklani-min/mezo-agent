"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, ExternalLink, Activity, FileSpreadsheet, FileJson, Check } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";
import type { ActivityLog } from "@/lib/types";

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs }) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExportCSV = () => {
    const headers = [
      "Timestamp",
      "ISO_Date",
      "Type",
      "Title",
      "Amount",
      "Status",
      "TxHash",
      "Description",
      "Explorer_URL",
    ];

    const rows = logs.map((l) => [
      l.timestamp,
      new Date(l.timestamp).toISOString(),
      `"${l.type}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.amount || ""}"`,
      l.status,
      l.txHash || "",
      `"${l.description.replace(/"/g, '""')}"`,
      l.txHash ? `${MEZO_CONFIG.explorerUrl}/tx/${l.txHash}` : "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bitagent-audit-trail-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess("CSV");
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleExportJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      network: MEZO_CONFIG.name,
      chainId: MEZO_CONFIG.chainId,
      totalEvents: logs.length,
      auditTrail: logs.map((l) => ({
        ...l,
        isoDate: new Date(l.timestamp).toISOString(),
        explorerUrl: l.txHash ? `${MEZO_CONFIG.explorerUrl}/tx/${l.txHash}` : null,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bitagent-audit-trail-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess("JSON");
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      className="p-6 sm:p-7 rounded-2xl bg-[#0E121E] border-2 border-black shadow-brutal-lg relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b-2 border-black font-mono">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-mezo stroke-[2.5]" />
              <span>LIVE ON-CHAIN ACTIVITY FEED</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time events emitted from BitAgentAccount contracts on Bitcoin L2 Testnet
          </p>
        </div>

        {/* Audit Trail Export Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono">
          <span className="text-xs px-2.5 py-1 rounded-md bg-[#121622] border-2 border-black text-slate-300 font-bold hidden md:inline shadow-brutal-sm">
            {logs.length} EVENTS
          </span>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border-2 border-black text-xs font-bold text-slate-200 hover:text-white shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            title="Download CSV Audit Log for Accounting / Treasuries"
          >
            {downloadSuccess === "CSV" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-mezo stroke-[2.5]" />
            )}
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border-2 border-black text-xs font-bold text-slate-200 hover:text-white shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            title="Download JSON Audit Log for SIEM / Data Pipeline"
          >
            {downloadSuccess === "JSON" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            ) : (
              <FileJson className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
            )}
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 font-mono">
        {logs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 font-bold border-2 border-dashed border-zinc-800 rounded-xl">
            No transactions recorded in this session.
          </div>
        ) : (
          logs.map((log) => {
            const isSuccess = log.status === "SUCCESS";

            return (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-[#05060A] border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm ${
                      isSuccess
                        ? "bg-emerald-400 text-black"
                        : "bg-red-400 text-black"
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <XCircle className="w-4 h-4 stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{log.title}</span>
                      {log.amount && (
                        <span className="font-black text-mezo">
                          {log.amount}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5 font-bold">{log.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-800">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>

                  {log.txHash ? (
                    <a
                      href={`${MEZO_CONFIG.explorerUrl}/tx/${log.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-xs text-mezo hover:underline font-bold"
                    >
                      <span>{log.txHash.slice(0, 8)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-black font-black px-2 py-0.5 rounded-md bg-red-400 border border-black">
                      REVERTED
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
