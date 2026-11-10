"use client";

import React, { useState } from "react";
import { Shield, Sparkles, ExternalLink, Copy, Check, Wallet, Code2, AlertCircle, X } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";
import { useMezoWallet } from "@/lib/useMezoWallet";
import { DeveloperQuickstartModal } from "./DeveloperQuickstartModal";

interface HeaderProps {
  ownerAddress: string;
}

export const Header: React.FC<HeaderProps> = ({ ownerAddress }) => {
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
      <header className="border-b border-surface-border bg-surface/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mezo to-orange-600 flex items-center justify-center shadow-lg shadow-mezo/20 ring-1 ring-orange-400/40">
              <Shield className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">MezoAgent</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-mezo/15 text-mezo border border-mezo/30 font-medium">
                  Autonomous OS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Budget-Controlled AI Agent Smart Accounts on Bitcoin
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Developer SDK Quickstart Button */}
            <button
              onClick={() => setIsSdkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-light border border-surface-border hover:border-slate-500 text-xs font-medium text-slate-200 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-mezo" />
              <span className="hidden sm:inline">Developer SDK</span>
            </button>

            {/* AKINDO Buildathon Tag */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-950/40 border border-orange-700/40 text-xs text-orange-300">
              <Sparkles className="w-3.5 h-3.5 text-mezo" />
              <span>AKINDO Buildathon</span>
            </div>

            {/* Network Badge / Switch Button */}
            {wallet.isConnected && !wallet.isMezoTestnet ? (
              <button
                onClick={wallet.switchToMezo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium animate-pulse"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Switch to Mezo (31611)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-light border border-surface-border text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300 font-medium">{MEZO_CONFIG.name}</span>
                <span className="text-slate-500 font-mono text-[10px]">({MEZO_CONFIG.chainId})</span>
              </div>
            )}

            {/* Wallet Connect / Address Pill */}
            {!wallet.isConnected ? (
              <button
                onClick={wallet.connectWallet}
                disabled={wallet.isConnecting}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-mezo hover:bg-mezo-hover text-black text-xs font-semibold shadow-md shadow-mezo/15 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-black" />
                <span>{wallet.isConnecting ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-500 transition-colors text-xs font-mono text-slate-200"
                title="Click to copy connected address"
              >
                <span>{truncatedAddress}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {wallet.error && (
        <div className="bg-amber-950/90 border-b border-amber-800/60 px-4 py-2 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{wallet.error}</span>
            </div>
            <button
              onClick={wallet.clearError}
              className="text-amber-400 hover:text-white p-1 rounded transition-colors"
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
