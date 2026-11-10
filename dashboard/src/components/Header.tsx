"use client";

import React from "react";
import { Shield, Sparkles, ExternalLink, Copy, Check } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";

interface HeaderProps {
  ownerAddress: string;
}

export const Header: React.FC<HeaderProps> = ({ ownerAddress }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ownerAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`;

  return (
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
          {/* AKINDO Buildathon Tag */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-950/40 border border-orange-700/40 text-xs text-orange-300">
            <Sparkles className="w-3.5 h-3.5 text-mezo" />
            <span>AKINDO Buildathon</span>
          </div>

          {/* Network Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-light border border-surface-border text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">{MEZO_CONFIG.name}</span>
            <span className="text-slate-500 font-mono text-[10px]">({MEZO_CONFIG.chainId})</span>
          </div>

          {/* Wallet Address Pill */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-500 transition-colors text-xs font-mono text-slate-200"
            title="Click to copy address"
          >
            <span>{truncatedAddress}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
