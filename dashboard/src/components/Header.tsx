"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, ExternalLink, Copy, Check, Wallet, Code2, AlertCircle, X, Bell, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";
import { useMezoWallet } from "@/lib/useMezoWallet";
import { DeveloperQuickstartModal } from "./DeveloperQuickstartModal";

interface HeaderProps {
  ownerAddress: string;
  isLiveMode?: boolean;
  onToggleMode?: () => void;
  onOpenAlerts?: () => void;
  onOpenSecurity?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ownerAddress,
  isLiveMode = false,
  onToggleMode,
  onOpenAlerts,
  onOpenSecurity,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSdkModalOpen, setIsSdkModalOpen] = useState(false);
  const wallet = useMezoWallet();

  const activeAddress = wallet.isConnected && wallet.address ? wallet.address : ownerAddress;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`;

  return (
    <>
      <header className="border-b border-surface-border/80 bg-[#07080E]/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-mezo via-orange-500 to-mezo flex items-center justify-center shadow-lg shadow-mezo/25 ring-1 ring-orange-400/40 shrink-0">
              <Shield className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">MezoAgent</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-mezo/15 text-mezo border border-mezo/30 font-bold uppercase tracking-wider">
                  Autonomous OS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Budget-Controlled AI Agent Smart Accounts on Bitcoin
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Switcher Toggle: Demo Sandbox vs Live Testnet */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isLiveMode
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-sm"
                  : "bg-surface-card border-surface-border text-slate-300 hover:border-slate-500"
              }`}
              title="Toggle between Safe Interactive Demo and Live Mezo Testnet"
            >
              <span className={`w-2 h-2 rounded-full ${isLiveMode ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"}`} />
              <span className="hidden md:inline">{isLiveMode ? "Live Testnet" : "Demo Sandbox"}</span>
              <span className="md:hidden">{isLiveMode ? "Live" : "Demo"}</span>
            </motion.button>

            {/* Alert Rules & Webhook Button */}
            {onOpenAlerts && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenAlerts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 transition-colors shadow-sm"
                title="Configure Real-Time Alerts & Webhooks"
              >
                <Bell className="w-3.5 h-3.5 text-mezo" />
                <span className="hidden sm:inline">Alerts</span>
              </motion.button>
            )}

            {/* Security & Audit Modal Button */}
            {onOpenSecurity && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenSecurity}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 transition-colors shadow-sm"
                title="View Formal Invariants, Threat Model & Bug Bounty"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Security</span>
              </motion.button>
            )}

            {/* Developer SDK Quickstart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSdkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
            >
              <Code2 className="w-3.5 h-3.5 text-mezo stroke-[2.2]" />
              <span className="hidden sm:inline">SDK</span>
            </motion.button>

            {/* AKINDO Buildathon Tag */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/40 border border-orange-700/40 text-xs text-orange-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-mezo fill-mezo/20" />
              <span>AKINDO</span>
            </div>

            {/* Network Badge / Switch Button */}
            {wallet.isConnected && !wallet.isMezoTestnet ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={wallet.switchToMezo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Switch to Mezo</span>
              </motion.button>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-400 font-bold">31611</span>
              </div>
            )}

            {/* Wallet Connect / Address Pill */}
            {!wallet.isConnected ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={wallet.connectWallet}
                disabled={wallet.isConnecting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-mezo hover:bg-mezo-hover text-black text-xs font-extrabold shadow-lg shadow-mezo/20 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span>{wallet.isConnecting ? "..." : "Connect"}</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-500 transition-colors text-xs font-mono text-slate-200 shadow-sm"
                title="Click to copy connected address"
              >
                <span>{truncatedAddress}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {wallet.error && (
        <div className="bg-amber-950/90 border-b border-amber-800/60 px-4 py-2 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{wallet.error}</span>
            </div>
            <button
              onClick={wallet.clearError}
              className="text-amber-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <DeveloperQuickstartModal
        isOpen={isSdkModalOpen}
        onClose={() => setIsSdkModalOpen(false)}
      />
    </>
  );
};
