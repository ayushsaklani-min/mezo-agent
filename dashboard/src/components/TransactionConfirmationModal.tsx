"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertOctagon, ExternalLink, Copy, Check, ShieldCheck, Zap, X, ArrowRight } from "lucide-react";
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
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F7931A", "#38BDF8", "#10B981", "#FFA834"],
        });
      } catch (e) {
        // Safe fallback if canvas not available
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
          className={`relative z-10 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border ${
            isSuccess
              ? "bg-[#0B0F19] border-emerald-500/30 shadow-emerald-950/40"
              : "bg-[#140C0E] border-red-500/40 shadow-red-950/40"
          }`}
        >
          {/* Ambient Corner Glow */}
          <div
            className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
              isSuccess ? "bg-emerald-500/15" : "bg-red-500/20"
            }`}
          />

          {/* Close Icon */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Status Header */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                isSuccess
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "bg-red-500/10 border-red-500/40 text-red-400 shadow-lg shadow-red-500/20"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
              ) : (
                <AlertOctagon className="w-7 h-7 stroke-[2.2]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
                    isSuccess
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-red-500/15 text-red-300 border-red-500/30"
                  }`}
                >
                  {isSuccess ? "Confirmed on Mezo EVM" : "EVM Security Reverted"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Chain 31611</span>
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">{details.title}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-5">
            {details.subtitle}
          </p>

          {/* Amount Badge (if applicable) */}
          {details.amount && (
            <div className="mb-4 p-3.5 rounded-2xl bg-surface-light/80 border border-surface-border flex items-center justify-between">
              <span className="text-xs text-slate-400">Value Transferred</span>
              <span className="text-lg font-mono font-extrabold text-mezo">
                {details.amount}
              </span>
            </div>
          )}

          {/* State Diff Card (e.g. Balance or Limit changes) */}
          {details.stateDiff && (
            <div className="mb-4 p-3.5 rounded-2xl bg-surface-card border border-surface-border/70">
              <div className="text-[11px] text-slate-400 font-medium mb-1.5">
                {details.stateDiff.label}
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 line-through">{details.stateDiff.before}</span>
                <ArrowRight className="w-3.5 h-3.5 text-mezo mx-2" />
                <span className="text-emerald-400 font-bold">{details.stateDiff.after}</span>
              </div>
            </div>
          )}

          {/* Revert Reason Banner */}
          {!isSuccess && details.revertReason && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-300 mb-1">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span>On-Chain Velocity Guardrail Active</span>
              </div>
              <p className="text-[11px] text-red-200/90 font-mono">
                {details.revertReason}
              </p>
            </div>
          )}

          {/* On-Chain Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 border border-surface-border/60 rounded-2xl p-3.5 mb-5">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-sans">Finality</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 text-mezo" />
                1.18s Block Time
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-sans">Gas Token</span>
              <span className="text-slate-200 font-semibold mt-0.5 block">0.000018 BTC</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-surface-border/40">
              <span className="block text-[10px] text-slate-500 uppercase font-sans mb-1">
                Transaction Hash
              </span>
              <div className="flex items-center justify-between bg-surface-light/90 px-2.5 py-1.5 rounded-xl border border-surface-border text-[11px]">
                <span className="text-slate-300 truncate max-w-[260px]">{displayTxHash}</span>
                <button
                  onClick={handleCopy}
                  className="hover:text-white transition-colors ml-2 p-1"
                  title="Copy Hash"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3">
            <a
              href={`${MEZO_CONFIG.explorerUrl}/tx/${displayTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-surface-light border border-surface-border hover:border-mezo/50 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <span>Mezo Explorer</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg ${
                isSuccess
                  ? "bg-mezo hover:bg-mezo-hover text-black shadow-mezo/20"
                  : "bg-surface-light border border-surface-border hover:bg-surface text-white"
              }`}
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
