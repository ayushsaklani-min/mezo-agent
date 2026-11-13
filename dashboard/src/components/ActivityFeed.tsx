"use client";

import React, { useState } from "react";
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
    <div className="p-6 sm:p-7 rounded-2xl bg-white border-[3px] border-black shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FE9CE8] border-2 border-black shadow-brutal-sm flex items-center justify-center text-black">
              <Activity className="w-4 h-4 stroke-[3]" />
            </div>
            <h2 className="text-lg font-black text-black tracking-tight uppercase">
              On-Chain Activity Feed
            </h2>
            <span className="neo-badge bg-[#FAF7F0] text-black text-[10px] px-2 py-0.5 rounded uppercase">
              {logs.length} EVENTS RECORDED
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700">
            Real-time events verified and indexed from Mezo EVM smart contracts
          </p>
        </div>

        {/* Audit Trail Export Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="neo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#FFE600] text-xs font-black text-black shadow-brutal-sm"
            title="Download CSV Audit Log"
          >
            {downloadSuccess === "CSV" ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="neo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#38BDF8] text-xs font-black text-black shadow-brutal-sm"
            title="Download JSON Audit Log"
          >
            {downloadSuccess === "JSON" ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            ) : (
              <FileJson className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>EXPORT JSON</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-10 text-xs font-bold text-slate-500 bg-[#FAF7F0] rounded-xl border-2 border-dashed border-black">
            NO TRANSACTIONS RECORDED IN THIS SESSION.
          </div>
        ) : (
          logs.map((log) => {
            const isSuccess = log.status === "SUCCESS";

            return (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-white border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-brutal-sm hover:shadow-brutal transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 border-black shadow-brutal-sm ${
                      isSuccess
                        ? "bg-[#99E885] text-black"
                        : "bg-[#FF4757] text-white"
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
                      <span className="font-black text-sm text-black">{log.title}</span>
                      {log.amount && (
                        <span className="font-mono font-black text-black bg-[#FFDC9B] px-1.5 py-0.2 rounded border border-black shadow-brutal-sm">
                          {log.amount}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 text-xs font-bold mt-0.5">{log.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-black/20">
                  <span className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>

                  {log.txHash ? (
                    <a
                      href={`${MEZO_CONFIG.explorerUrl}/tx/${log.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn flex items-center gap-1 font-mono text-xs text-black bg-[#C0F7FE] hover:bg-[#7dd3fc] px-2.5 py-1 rounded-md shadow-brutal-sm"
                    >
                      <span>{log.txHash.slice(0, 8)}...</span>
                      <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                    </a>
                  ) : (
                    <span className="neo-badge text-[10px] text-white font-mono font-black px-2 py-0.5 rounded bg-[#FF4757]">
                      REVERTED
                    </span>
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
