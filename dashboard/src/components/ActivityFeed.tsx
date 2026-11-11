"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, XCircle, Clock, ExternalLink, Activity, Download, FileSpreadsheet, FileJson, Check } from "lucide-react";
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
    link.setAttribute("download", `mezoagent-audit-trail-${Date.now()}.csv`);
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
    link.setAttribute("download", `mezoagent-audit-trail-${Date.now()}.json`);
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
      className="p-6 sm:p-7 rounded-3xl bg-surface border border-surface-border shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-mezo" />
              <span>Live On-Chain Activity Feed</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time events emitted from MezoAgentAccount contracts on Mezo Testnet
          </p>
        </div>

        {/* Audit Trail Export Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface-card border border-surface-border text-slate-400 font-semibold hidden md:inline">
            {logs.length} events
          </span>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 transition-colors shadow-sm"
            title="Download CSV Audit Log for Accounting / Treasuries"
          >
            {downloadSuccess === "CSV" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-mezo" />
            )}
            <span>Export CSV</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 transition-colors shadow-sm"
            title="Download JSON Audit Log for SIEM / Data Pipeline"
          >
            {downloadSuccess === "JSON" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            ) : (
              <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Export JSON</span>
          </motion.button>
        </div>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 font-medium">
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
                className="p-4 rounded-2xl bg-surface-card border border-surface-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSuccess
                        ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                        : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    ) : (
                      <XCircle className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{log.title}</span>
                      {log.amount && (
                        <span className="font-mono font-extrabold text-mezo">
                          {log.amount}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{log.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-surface-border/40">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-600" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>

                  {log.txHash ? (
                    <a
                      href={`${MEZO_CONFIG.explorerUrl}/tx/${log.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-xs text-mezo hover:underline font-semibold"
                    >
                      <span>{log.txHash.slice(0, 8)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-red-400 font-mono font-bold px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40">
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
