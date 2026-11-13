"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, Copy, Check, Wallet, Code2, AlertCircle, X, Bell, ShieldCheck, Zap } from "lucide-react";
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
  isLiveMode = true,
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
      <header className="border-b-[3px] border-black bg-white sticky top-0 z-40 shadow-[0_4px_0_0_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF9900] border-2 border-black shadow-brutal-sm flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-black stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-black">MezoAgent</span>
                <span className="neo-badge bg-[#FFE600] text-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  AUTONOMOUS OS
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 hidden sm:block">
                Budget-Controlled AI Agent Smart Accounts on Bitcoin
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mode Switcher Toggle: Demo Sandbox vs Live Testnet */}
            <button
              onClick={onToggleMode}
              className={`neo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black ${
                isLiveMode
                  ? "bg-[#4ADE80] text-black"
                  : "bg-[#FFE600] text-black"
              }`}
              title="Toggle between Safe Interactive Demo and Live Mezo Testnet"
            >
              <span className={`w-2.5 h-2.5 rounded-full border border-black ${isLiveMode ? "bg-black animate-ping" : "bg-black"}`} />
              <span className="hidden md:inline">{isLiveMode ? "LIVE TESTNET" : "DEMO SANDBOX"}</span>
              <span className="md:hidden">{isLiveMode ? "LIVE" : "DEMO"}</span>
            </button>

            {/* Alert Rules & Webhook Button */}
            {onOpenAlerts && (
              <button
                onClick={onOpenAlerts}
                className="neo-btn bg-white hover:bg-yellow-50 text-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                title="Configure Real-Time Alerts & Webhooks"
              >
                <Bell className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">ALERTS</span>
              </button>
            )}

            {/* Security & Audit Modal Button */}
            {onOpenSecurity && (
              <button
                onClick={onOpenSecurity}
                className="neo-btn bg-white hover:bg-emerald-50 text-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                title="View Formal Invariants, Threat Model & Bug Bounty"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span className="hidden sm:inline">AUDIT</span>
              </button>
            )}

            {/* Developer SDK Quickstart Button */}
            <button
              onClick={() => setIsSdkModalOpen(true)}
              className="neo-btn bg-[#38BDF8] text-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            >
              <Code2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">SDK</span>
            </button>

            {/* AKINDO Buildathon Tag */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6584] border-2 border-black shadow-brutal-sm text-xs text-black font-black">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>AKINDO $7K</span>
            </div>

            {/* Network Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F0] border-2 border-black shadow-brutal-sm text-xs font-mono font-black text-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 border border-black" />
              <span>31611</span>
            </div>

            {/* Wallet Connect / Address Pill */}
            {!wallet.isConnected ? (
              <button
                onClick={wallet.connectWallet}
                disabled={wallet.isConnecting}
                className="neo-btn bg-[#FF9900] text-black text-xs font-black px-4 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Wallet className="w-4 h-4 text-black stroke-[2.5]" />
                <span>{wallet.isConnecting ? "CONNECTING..." : "CONNECT"}</span>
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="neo-btn bg-white text-black px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2"
                title="Click to copy connected address"
              >
                <span>{truncatedAddress}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {wallet.error && (
        <div className="bg-[#FF4757] text-white border-b-2 border-black px-4 py-2 text-xs font-bold shadow-brutal-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{wallet.error}</span>
            </div>
            <button
              onClick={wallet.clearError}
              className="hover:bg-black/20 p-1 rounded-md transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
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
