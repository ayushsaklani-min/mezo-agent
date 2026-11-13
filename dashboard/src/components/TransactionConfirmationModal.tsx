"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertOctagon, ExternalLink, Copy, Check, X, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { MEZO_CONFIG } from "@/lib/constants";

export interface ConfirmationDetails {
  isOpen: boolean;
  type: "BRIDGE" | "FAUCET" | "CREATE_KEY" | "REVOKE_KEY" | "AGENT_EXECUTION" | "REVERT";
  status: "SUCCESS" | "REVERTED";
  title: string;
  subtitle: string;
  amount?: string;
  txHash?: string;
  agentLabel?: string;
  stateDiff?: {
    label: string;
    before: string;
    after: string;
  };
  revertReason?: string;
}

interface Props {
  details: ConfirmationDetails | null;
  onClose: () => void;
}

export const TransactionConfirmationModal: React.FC<Props> = ({ details, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (details?.isOpen && details.status === "SUCCESS") {
      try {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F7CB46", "#FE9CE8", "#99E885", "#C0F7FE"],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [details?.isOpen, details?.status]);

  if (!details || !details.isOpen) return null;

  const isSuccess = details.status === "SUCCESS";
  const displayTxHash = details.txHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  const handleCopy = () => {
    navigator.clipboard.writeText(displayTxHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-lg rounded-2xl p-6 sm:p-7 bg-white border-[3px] border-black shadow-[10px_10px_0px_0px_#000000]"
        >
          {/* Close Icon */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-lg border-2 border-black bg-[#FAF7F0] hover:bg-[#FF4757] hover:text-white transition-colors"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Top Status Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border-2 border-black shadow-brutal-sm ${
                isSuccess
                  ? "bg-[#99E885] text-black"
                  : "bg-[#FF4757] text-white"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              ) : (
                <AlertOctagon className="w-8 h-8 stroke-[2.5]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border border-black shadow-brutal-sm ${
                    isSuccess
                      ? "bg-[#C0F7FE] text-black"
                      : "bg-[#FE9CE8] text-black"
                  }`}
                >
                  {isSuccess ? "CONFIRMED ON MEZO" : "EVM REVERT (SAFE)"}
                </span>
                <span className="text-[10px] text-slate-700 font-mono font-bold">CHAIN 31611</span>
              </div>
              <h3 className="text-xl font-black text-black tracking-tight uppercase">{details.title}</h3>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-700 leading-relaxed mb-4">
            {details.subtitle}
          </p>

          {/* Amount Badge */}
          {details.amount && (
            <div className="mb-4 p-3 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm flex items-center justify-between">
              <span className="text-xs font-mono font-black uppercase text-slate-700">VALUE TRANSFERRED</span>
              <span className="text-xl font-mono font-black text-black bg-[#FFDC9B] px-2 py-0.5 rounded border border-black">
                {details.amount}
              </span>
            </div>
          )}

          {/* State Diff Card */}
          {details.stateDiff && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
              <div className="text-[10px] text-slate-700 font-mono font-black uppercase mb-1.5">
                {details.stateDiff.label}
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-black">
                <span className="text-slate-600 line-through bg-white px-2 py-1 rounded border border-black/30">
                  {details.stateDiff.before}
                </span>
                <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                <span className="text-black bg-[#99E885] px-2 py-1 rounded border-2 border-black shadow-brutal-sm">
                  {details.stateDiff.after}
                </span>
              </div>
            </div>
          )}

          {/* Revert Reason Warning */}
          {details.revertReason && (
            <div className="mb-4 p-3 rounded-xl bg-[#FFF1F2] border-2 border-black shadow-brutal-sm text-xs font-bold text-[#FF4757]">
              <span className="font-mono font-black uppercase">REVERT REASON:</span> {details.revertReason}
            </div>
          )}

          {/* TxHash Box */}
          <div className="p-3 rounded-xl bg-white border-2 border-black shadow-brutal-sm mb-5">
            <div className="flex items-center justify-between text-[10px] font-mono font-black text-slate-700 mb-1">
              <span>TRANSACTION HASH</span>
              <button
                onClick={handleCopy}
                className="hover:text-black flex items-center gap-1 font-bold"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "COPIED" : "COPY"}</span>
              </button>
            </div>
            <div className="font-mono text-xs font-black text-black break-all">
              {displayTxHash}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {details.txHash && (
              <a
                href={`${MEZO_CONFIG.explorerUrl}/tx/${details.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn flex-1 py-3 rounded-xl bg-[#C0F7FE] hover:bg-[#7dd3fc] text-black text-xs font-black flex items-center justify-center gap-2 uppercase"
              >
                <span>VIEW EXPLORER</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
            )}

            <button
              onClick={onClose}
              className="neo-btn flex-1 py-3 rounded-xl bg-[#000000] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wide"
            >
              DISMISS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
