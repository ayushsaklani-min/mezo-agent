"use client";

import React, { useState } from "react";
import { Shield, Copy, Check, Wallet, Code2, AlertCircle, X, Bell, ShieldCheck } from "lucide-react";
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
      <header className="border-b-2 border-black bg-[#0E1119] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mezo border-2 border-black flex items-center justify-center shadow-brutal-sm shrink-0">
              <Shield className="w-5 h-5 text-black stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">BitAgent</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm">
                  AgentOS
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
                AI Agent Treasury on Bitcoin L2
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Switcher Toggle: Demo Sandbox vs Live Testnet */}
            <button
              onClick={onToggleMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black text-xs font-mono font-bold transition-all shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                isLiveMode
                  ? "bg-emerald-400 text-black"
                  : "bg-surface-card text-slate-200"
              }`}
              title="Toggle between Safe Interactive Demo and Live Testnet"
            >
              <span className={`w-2 h-2 rounded-full ${isLiveMode ? "bg-black animate-pulse" : "bg-cyan-400"}`} />
              <span className="hidden md:inline">{isLiveMode ? "LIVE TESTNET" : "DEMO SANDBOX"}</span>
              <span className="md:hidden">{isLiveMode ? "LIVE" : "DEMO"}</span>
            </button>

            {/* Alert Rules & Webhook Button */}
            {onOpenAlerts && (
              <button
                onClick={onOpenAlerts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border-2 border-black text-xs font-mono font-bold text-slate-200 hover:text-white transition-all shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                title="Configure Real-Time Alerts & Webhooks"
              >
                <Bell className="w-3.5 h-3.5 text-mezo stroke-[2.5]" />
                <span className="hidden sm:inline">ALERTS</span>
              </button>
            )}

            {/* Security & Audit Modal Button */}
            {onOpenSecurity && (
              <button
                onClick={onOpenSecurity}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border-2 border-black text-xs font-mono font-bold text-slate-200 hover:text-white transition-all shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                title="View Formal Invariants, Threat Model & Bug Bounty"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                <span className="hidden sm:inline">SECURITY</span>
              </button>
            )}

            {/* Developer SDK Quickstart Button */}
            <button
              onClick={() => setIsSdkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border-2 border-black text-xs font-mono font-bold text-slate-200 hover:text-white transition-all shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Code2 className="w-3.5 h-3.5 text-mezo stroke-[2.5]" />
              <span className="hidden sm:inline">SDK</span>
            </button>

            {/* Network Badge / Switch Button */}
            {wallet.isConnected && !wallet.isMezoTestnet ? (
              <button
                onClick={wallet.switchToMezo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-black border-2 border-black text-xs font-black shadow-brutal-sm animate-pulse"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>SWITCH NETWORK</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121622] border-2 border-black text-xs font-mono shadow-brutal-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-black">31611</span>
              </div>
            )}

            {/* Wallet Connect / Address Pill */}
            {!wallet.isConnected ? (
              <button
                onClick={wallet.connectWallet}
                disabled={wallet.isConnecting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-mezo text-black text-xs font-black border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-black stroke-[3]" />
                <span>{wallet.isConnecting ? "..." : "CONNECT"}</span>
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121622] border-2 border-black text-xs font-mono font-bold text-slate-200 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
                title="Click to copy connected address"
              >
                <span>{truncatedAddress}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {wallet.error && (
        <div className="bg-amber-950/90 border-b border-amber-800/60 px-4 py-2 text-xs text-amber-200 font-mono">
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
