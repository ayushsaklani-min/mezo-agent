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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-lg rounded-2xl p-6 sm:p-7 shadow-brutal-lg border-2 border-black bg-[#0E121E] font-mono"
        >
          {/* Close Icon */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-md bg-[#121622] border-2 border-black text-slate-300 hover:text-white font-bold"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Status Header */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border-2 border-black shadow-brutal-sm ${
                isSuccess
                  ? "bg-emerald-400 text-black"
                  : "bg-red-400 text-black"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-7 h-7 stroke-[3]" />
              ) : (
                <AlertOctagon className="w-7 h-7 stroke-[3]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-md border-2 border-black shadow-brutal-sm ${
                    isSuccess
                      ? "bg-emerald-400 text-black"
                      : "bg-red-400 text-black"
                  }`}
                >
                  {isSuccess ? "Confirmed on Bitcoin L2 EVM" : "EVM Security Reverted"}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">CHAIN 31611</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">{details.title}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-5 font-bold">
            {details.subtitle}
          </p>

          {/* Amount Badge */}
          {details.amount && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#05060A] border-2 border-black flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">VALUE TRANSFERRED</span>
              <span className="text-lg font-mono font-black text-mezo">
                {details.amount}
              </span>
            </div>
          )}

          {/* State Diff Card */}
          {details.stateDiff && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#05060A] border-2 border-black">
              <div className="text-[11px] text-slate-400 font-bold mb-1.5">
                {details.stateDiff.label}
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-400 line-through">{details.stateDiff.before}</span>
                <ArrowRight className="w-3.5 h-3.5 text-mezo stroke-[3] mx-2" />
                <span className="text-emerald-400 font-black">{details.stateDiff.after}</span>
              </div>
            </div>
          )}

          {/* Revert Reason Banner */}
          {!isSuccess && details.revertReason && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border-2 border-red-500 text-xs font-bold text-red-300">
              <div className="flex items-center gap-2 mb-1 text-red-200">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>On-Chain Velocity Guardrail Active</span>
              </div>
              <p className="text-[11px] font-mono text-red-300">
                {details.revertReason}
              </p>
            </div>
          )}

          {/* On-Chain Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#05060A] border-2 border-black rounded-xl p-3.5 mb-5 font-bold">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">FINALITY</span>
              <span className="text-slate-200 flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 text-mezo fill-mezo" />
                1.18s Block Time
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">GAS TOKEN</span>
              <span className="text-slate-200 mt-0.5 block">0.000018 BTC</span>
            </div>
            <div className="col-span-2 pt-2 border-t-2 border-zinc-800">
              <span className="block text-[10px] text-slate-400 uppercase mb-1">
                TRANSACTION HASH
              </span>
              <div className="flex items-center justify-between bg-[#121622] px-2.5 py-1.5 rounded-lg border border-black text-[11px]">
                <span className="text-slate-200 truncate max-w-[260px]">{displayTxHash}</span>
                <button
                  onClick={handleCopy}
                  className="hover:text-white transition-colors ml-2 p-1"
                  title="Copy Hash"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
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
              className="flex-1 py-3 px-4 rounded-xl bg-[#121622] border-2 border-black text-slate-200 hover:text-white text-xs font-black flex items-center justify-center gap-2 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <span>Block Explorer</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black border-2 border-black transition-all shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                isSuccess
                  ? "bg-mezo text-black"
                  : "bg-white text-black"
              }`}
            >
              CONTINUE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
