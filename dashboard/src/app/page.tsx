"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { TreasuryMetrics } from "@/components/TreasuryMetrics";
import { BridgeCard } from "@/components/BridgeCard";
import { SessionKeysManager } from "@/components/SessionKeysManager";
import { AgentExecutionSandbox } from "@/components/AgentExecutionSandbox";
import { ActivityFeed } from "@/components/ActivityFeed";
import { StorySection } from "@/components/StorySection";
import { TransactionConfirmationModal, ConfirmationDetails } from "@/components/TransactionConfirmationModal";
import { AlertRulesModal } from "@/components/AlertRulesModal";
import { INITIAL_ACCOUNT_DATA, INITIAL_SESSION_KEYS, MEZO_CONFIG } from "@/lib/constants";
import type { SessionKeyItem, ActivityLog } from "@/lib/types";
import { ShieldCheck, Cpu, Code2, ExternalLink, ArrowDown, Sparkles, Terminal, BookOpen, Layers } from "lucide-react";

export default function Home() {
  const [account, setAccount] = useState(INITIAL_ACCOUNT_DATA);
  const [sessionKeys, setSessionKeys] = useState<SessionKeyItem[]>(INITIAL_SESSION_KEYS);
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "log_init",
      type: "CREATE_KEY",
      title: "Agent Session Keys Initialized",
      description: "Deployed 3 budget-capped agent keys on Mezo Testnet (31611)",
      txHash: "0x39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff8014589234",
      timestamp: Date.now() - 3600 * 1000 * 2,
      status: "SUCCESS",
    },
    {
      id: "log_bridge_prev",
      type: "BRIDGE",
      title: "Cross-Chain Inbound Liquidity",
      description: "Bridged 2,500 USDC from Base into MezoAgent MUSD Treasury",
      amount: "+2,500.00 MUSD",
      txHash: "0x82b9e3a9675a2a3dFde7bcD65B81c6F1DC068f59aAa99730AdE5c7413b49deA1",
      timestamp: Date.now() - 3600 * 1000 * 4,
      status: "SUCCESS",
    },
  ]);

  // Handle Bridge USDC -> MUSD
  const handleBridgeSuccess = (usdcAmount: number, musdAmount: number, txHash: string) => {
    const prevBalance = account.musdBalance;
    const nextBalance = prevBalance + musdAmount;

    setAccount((prev) => ({
      ...prev,
      musdBalance: nextBalance,
      usdcBridged: prev.usdcBridged + usdcAmount,
    }));

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "BRIDGE",
      title: "Cross-Chain Deposit",
      description: `Bridged ${usdcAmount} USDC from Base → Minted ${musdAmount} MUSD on Mezo`,
      amount: `+${musdAmount.toFixed(2)} MUSD`,
      txHash: txHash,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    // Open Confirmation Card Modal
    setConfirmationDetails({
      isOpen: true,
      type: "BRIDGE",
      status: "SUCCESS",
      title: "Cross-Chain Deposit Confirmed",
      subtitle: `Successfully converted ${usdcAmount} USDC from Base into ${musdAmount} native MUSD on Mezo via Wormhole NTT routing.`,
      amount: `+${musdAmount.toFixed(2)} MUSD`,
      txHash: txHash,
      stateDiff: {
        label: "Mezo MUSD Treasury Vault",
        before: `$${prevBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} MUSD`,
        after: `$${nextBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} MUSD`,
      },
    });
  };

  // Handle Faucet Claim
  const handleFaucetClaim = (claimedAmount: number) => {
    const fakeTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    setAccount((prev) => ({
      ...prev,
      usdcBridged: prev.usdcBridged + claimedAmount,
    }));

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "BRIDGE",
      title: "USDC Testnet Faucet",
      description: `Claimed ${claimedAmount} Mock USDC for cross-chain simulation`,
      amount: `+${claimedAmount} USDC`,
      txHash: fakeTx,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    // Open Confirmation Card Modal
    setConfirmationDetails({
      isOpen: true,
      type: "FAUCET",
      status: "SUCCESS",
      title: "Mock USDC Faucet Drip Confirmed",
      subtitle: `Allocated ${claimedAmount} Mock USDC to simulate cross-chain treasury deposits and agent liquidity delegation.`,
      amount: `+${claimedAmount} USDC`,
      txHash: fakeTx,
      stateDiff: {
        label: "Simulated Testnet Liquidity",
        before: `$${account.usdcBridged.toLocaleString()} USDC`,
        after: `$${(account.usdcBridged + claimedAmount).toLocaleString()} USDC`,
      },
    });
  };

  // Handle Create Session Key
  const handleCreateKey = (newKey: SessionKeyItem) => {
    const fakeTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    setSessionKeys((prev) => [newKey, ...prev]);

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "CREATE_KEY",
      title: "Session Key Minted",
      description: `Created key for "${newKey.label}" with $${newKey.hourlyLimit}/h limit`,
      txHash: fakeTx,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    // Open Confirmation Card Modal
    setConfirmationDetails({
      isOpen: true,
      type: "CREATE_KEY",
      status: "SUCCESS",
      title: "AI Agent Session Key Deployed",
      subtitle: `Successfully deployed on-chain spending policy for "${newKey.label}". Hardware velocity limit set to $${newKey.hourlyLimit} MUSD/h.`,
      amount: `$${newKey.hourlyLimit} MUSD/h Cap`,
      agentLabel: newKey.label,
      txHash: fakeTx,
      stateDiff: {
        label: "Agent Permission Status",
        before: "Unregistered",
        after: `Active ($${newKey.hourlyLimit}/h limit)`,
      },
    });
  };

  // Handle Revoke Key
  const handleRevokeKey = (keyId: string) => {
    const targetKey = sessionKeys.find((k) => k.id === keyId);
    const fakeTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    setSessionKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, active: false } : k))
    );

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "REVOKE",
      title: "Session Key Revoked",
      description: `Revoked authorization for "${targetKey?.label || keyId}"`,
      txHash: fakeTx,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    // Open Confirmation Card Modal
    setConfirmationDetails({
      isOpen: true,
      type: "REVOKE_KEY",
      status: "SUCCESS",
      title: "Session Key Revocation Confirmed",
      subtitle: `Owner executed instant on-chain revocation for "${targetKey?.label || keyId}". Any future transaction will be blocked by MezoAgentAccount.`,
      agentLabel: targetKey?.label,
      txHash: fakeTx,
      stateDiff: {
        label: "On-Chain Authorization",
        before: "Active Session Key",
        after: "PERMANENTLY REVOKED (Blocked)",
      },
    });
  };

  // Handle Agent Action Execution
  const handleExecuteAction = (
    keyId: string,
    actionName: string,
    costMUSD: number,
    txHash: string,
    isRevert: boolean = false,
    revertReason?: string
  ) => {
    const targetKey = sessionKeys.find((k) => k.id === keyId);

    if (isRevert) {
      const description = revertReason
        ? `Reverted on-chain: ${revertReason}`
        : `Exceeded hourly budget cap ($${targetKey?.hourlyLimit} MUSD). Reverted on-chain.`;

      const newLog: ActivityLog = {
        id: `log_${Date.now()}`,
        type: "PAYMENT",
        title: `${actionName} (Rejected)`,
        description,
        amount: `-${costMUSD.toFixed(2)} MUSD`,
        txHash: "",
        timestamp: Date.now(),
        status: "REVERTED",
      };
      setActivityLogs((prev) => [newLog, ...prev]);

      // Open Confirmation Card Modal with Revert Warning
      setConfirmationDetails({
        isOpen: true,
        type: "REVERT",
        status: "REVERTED",
        title: "Transaction Reverted by Mezo EVM",
        subtitle: `Cryptographic policy guardrail blocked unauthorized execution by "${targetKey?.label || 'Agent'}". Master treasury suffered $0.00 loss.`,
        amount: `$${costMUSD.toFixed(2)} Attempted`,
        revertReason: revertReason || `Attempted spend exceeded $${targetKey?.hourlyLimit} MUSD hourly velocity cap.`,
        stateDiff: {
          label: "Treasury Protection",
          before: `Attempted Outflow: $${costMUSD.toFixed(2)}`,
          after: "$0.00 Spent (Guaranteed Safe)",
        },
      });
      return;
    }

    // Deduct MUSD balance and update key spent
    const prevMusd = account.musdBalance;
    const nextMusd = Math.max(0, prevMusd - costMUSD);
    const isDCA = actionName.includes("DCA");

    setAccount((prev) => ({
      ...prev,
      musdBalance: nextMusd,
      stackedBtcYield: isDCA ? prev.stackedBtcYield + costMUSD / 90000 : prev.stackedBtcYield,
    }));

    const prevSpent = targetKey?.hourlySpent || 0;
    const nextSpent = prevSpent + costMUSD;

    setSessionKeys((prev) =>
      prev.map((k) =>
        k.id === keyId
          ? {
              ...k,
              hourlySpent: nextSpent,
              dailySpent: k.dailySpent + costMUSD,
            }
          : k
      )
    );

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: isDCA ? "YIELD_DCA" : "PAYMENT",
      title: actionName,
      description: `Autonomous execution by "${targetKey?.label}" on Mezo`,
      amount: `-${costMUSD.toFixed(2)} MUSD`,
      txHash: txHash,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    // Open Confirmation Card Modal for Success
    setConfirmationDetails({
      isOpen: true,
      type: "AGENT_EXECUTION",
      status: "SUCCESS",
      title: "Autonomous Action Confirmed",
      subtitle: `Agent "${targetKey?.label}" completed "${actionName}" on Mezo Testnet within authorized session bounds.`,
      amount: `-${costMUSD.toFixed(2)} MUSD`,
      txHash: txHash,
      agentLabel: targetKey?.label,
      stateDiff: {
        label: `Agent Hourly Envelope ($${targetKey?.hourlyLimit} Cap)`,
        before: `$${prevSpent.toFixed(2)} Spent`,
        after: `$${nextSpent.toFixed(2)} Spent ($${(targetKey?.hourlyLimit ? targetKey.hourlyLimit - nextSpent : 0).toFixed(2)} remaining)`,
      },
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07080E] text-slate-100 font-sans selection:bg-mezo/30 selection:text-orange-200">
      <Header
        ownerAddress={account.ownerAddress}
        isLiveMode={isLiveMode}
        onToggleMode={() => setIsLiveMode((prev) => !prev)}
        onOpenAlerts={() => setIsAlertModalOpen(true)}
      />

      <main className="flex-1 w-full space-y-12">
        {/* 1. HERO SECTION (High-Impact Storytelling & Live Pulse) */}
        <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-mezo/20 via-orange-500/10 to-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
            {/* AKINDO Buildathon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-card border border-surface-border text-xs font-semibold shadow-lg"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mezo opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-mezo"></span>
              </span>
              <span className="text-white">AKINDO Buildathon:</span>
              <span className="text-mezo font-bold">Build with MUSD and MEZO</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">$7,000 Prize Track</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
            >
              Autonomous AI Agents Need Capital to Act.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mezo via-orange-400 to-amber-200">
                Giving Them Master Keys Puts Treasuries at Risk.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              MezoAgent provides <strong>budget-controlled smart accounts</strong> on Bitcoin's economic layer. Delegate cryptographic session keys with on-chain sliding window velocity limits, function selector whitelisting, and auto-compounding Bitcoin yield—without surrendering treasury custody.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-2"
            >
              <button
                onClick={() => scrollToSection("interactive-os")}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-mezo to-orange-500 hover:from-orange-400 hover:to-orange-500 text-black text-sm font-extrabold shadow-xl shadow-mezo/25 transition-all flex items-center gap-2 group"
              >
                <span>Launch Treasury OS</span>
                <ArrowDown className="w-4 h-4 text-black group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection("security-story")}
                className="px-6 py-3.5 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-500 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-mezo" />
                <span>How Session Keys Work</span>
              </button>

              <a
                href={MEZO_CONFIG.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 rounded-2xl bg-surface-light/60 border border-surface-border hover:border-slate-500 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <span>Mezo Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </motion.div>

            {/* Proof Badges Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left"
            >
              <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border/70">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Master Key Custody</span>
                <span className="block text-sm font-extrabold text-emerald-400 mt-0.5">0% Risk / Untouched</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border/70">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Hourly Velocity Limit</span>
                <span className="block text-sm font-extrabold text-mezo mt-0.5">12-Bucket Sliding Window</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border/70">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Cross-Chain Liquidity</span>
                <span className="block text-sm font-extrabold text-cyan-400 mt-0.5">1:1 USDC → MUSD (Demo)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border/70">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Yield Compounding</span>
                <span className="block text-sm font-extrabold text-amber-400 mt-0.5">Auto BTC Yield (Testnet)</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. STORYTELLING ARCHITECTURE SECTION */}
        <div id="security-story">
          <StorySection />
        </div>

        {/* 3. LIVE INTERACTIVE TREASURY COCKPIT */}
        <section id="interactive-os" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
          {/* Section Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-surface-card border border-surface-border">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-mezo mb-1">
                <Terminal className="w-4 h-4" />
                <span>LIVE MEZO EVM COCKPIT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Autonomous Treasury & Key Control Center
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Interact with on-chain session keys, bridge cross-chain liquidity, and simulate autonomous micro-payments.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-slate-400 font-mono">Chain ID:</span>
              <span className="text-xs font-mono px-3 py-1 rounded-xl bg-surface-light border border-surface-border text-white font-bold">
                {MEZO_CONFIG.chainId} (Mezo Testnet)
              </span>
            </div>
          </div>

          {/* Treasury Metrics Bar */}
          <TreasuryMetrics
            musdBalance={account.musdBalance}
            usdcBridged={account.usdcBridged}
            btcGasBalance={account.btcGasBalance}
            stackedBtcYield={account.stackedBtcYield}
            activeAgentsCount={sessionKeys.filter((k) => k.active).length}
          />

          {/* Bridge & Sandbox Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <BridgeCard
                onBridgeSuccess={handleBridgeSuccess}
                onFaucetClaim={handleFaucetClaim}
              />
            </div>
            <div className="lg:col-span-7">
              <AgentExecutionSandbox
                sessionKeys={sessionKeys}
                onExecuteAction={handleExecuteAction}
              />
            </div>
          </div>

          {/* Session Keys Management */}
          <SessionKeysManager
            sessionKeys={sessionKeys}
            onCreateKey={handleCreateKey}
            onRevokeKey={handleRevokeKey}
          />

          {/* Real-time Activity Feed */}
          <ActivityFeed logs={activityLogs} />
        </section>
      </main>

      {/* Confirmation Modal / Card (Pops up on every single transaction/confirmation) */}
      <TransactionConfirmationModal
        details={confirmationDetails}
        onClose={() => setConfirmationDetails(null)}
      />

      {/* Alert Rules & Webhook Configuration Modal */}
      <AlertRulesModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        smartAccountAddress={account.accountAddress}
      />

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-mezo" />
            <span className="text-slate-400 font-medium">Built for the Mezo Buildathon on AKINDO</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Mezo Testnet (31611)</span>
            <span>•</span>
            <span>BTC Native Gas</span>
            <span>•</span>
            <span>MUSD Stablecoin</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
