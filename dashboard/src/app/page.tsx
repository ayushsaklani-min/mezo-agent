"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { TreasuryMetrics } from "@/components/TreasuryMetrics";
import { BridgeCard } from "@/components/BridgeCard";
import { SessionKeysManager } from "@/components/SessionKeysManager";
import { AgentExecutionSandbox } from "@/components/AgentExecutionSandbox";
import { ActivityFeed } from "@/components/ActivityFeed";
import { INITIAL_ACCOUNT_DATA, INITIAL_SESSION_KEYS, MEZO_CONFIG } from "@/lib/constants";
import type { SessionKeyItem, ActivityLog } from "@/lib/types";
import { ShieldCheck, Cpu, Code2, ExternalLink } from "lucide-react";

export default function Home() {
  const [account, setAccount] = useState(INITIAL_ACCOUNT_DATA);
  const [sessionKeys, setSessionKeys] = useState<SessionKeyItem[]>(INITIAL_SESSION_KEYS);
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
    setAccount((prev) => ({
      ...prev,
      musdBalance: prev.musdBalance + musdAmount,
      usdcBridged: prev.usdcBridged + usdcAmount,
    }));

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "BRIDGE",
      title: "Cross-Chain Deposit",
      description: `Bridged ${usdcAmount} USDC from Base $\\rightarrow$ Minted ${musdAmount} MUSD on Mezo`,
      amount: `+${musdAmount.toFixed(2)} MUSD`,
      txHash: txHash,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Handle Faucet Claim
  const handleFaucetClaim = (claimedAmount: number) => {
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
      txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Handle Create Session Key
  const handleCreateKey = (newKey: SessionKeyItem) => {
    setSessionKeys((prev) => [newKey, ...prev]);

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "CREATE_KEY",
      title: "Session Key Minted",
      description: `Created key for "${newKey.label}" with $${newKey.hourlyLimit}/h limit`,
      txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Handle Revoke Key
  const handleRevokeKey = (keyId: string) => {
    const targetKey = sessionKeys.find((k) => k.id === keyId);
    setSessionKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, active: false } : k))
    );

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "REVOKE",
      title: "Session Key Revoked",
      description: `Revoked authorization for "${targetKey?.label || keyId}"`,
      txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Handle Agent Action Execution
  const handleExecuteAction = (
    keyId: string,
    actionName: string,
    costMUSD: number,
    txHash: string,
    isRevert: boolean = false
  ) => {
    const targetKey = sessionKeys.find((k) => k.id === keyId);

    if (isRevert) {
      const newLog: ActivityLog = {
        id: `log_${Date.now()}`,
        type: "PAYMENT",
        title: `${actionName} (Rejected)`,
        description: `Exceeded hourly budget cap ($${targetKey?.hourlyLimit} MUSD). Reverted on-chain.`,
        amount: `-${costMUSD.toFixed(2)} MUSD`,
        txHash: "",
        timestamp: Date.now(),
        status: "REVERTED",
      };
      setActivityLogs((prev) => [newLog, ...prev]);
      return;
    }

    // Deduct MUSD balance and update key spent
    setAccount((prev) => {
      const isDCA = actionName.includes("DCA");
      return {
        ...prev,
        musdBalance: Math.max(0, prev.musdBalance - costMUSD),
        stackedBtcYield: isDCA ? prev.stackedBtcYield + (costMUSD / 90000) : prev.stackedBtcYield,
      };
    });

    setSessionKeys((prev) =>
      prev.map((k) =>
        k.id === keyId
          ? {
              ...k,
              hourlySpent: k.hourlySpent + costMUSD,
              dailySpent: k.dailySpent + costMUSD,
            }
          : k
      )
    );

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: actionName.includes("DCA") ? "YIELD_DCA" : "PAYMENT",
      title: actionName,
      description: `Autonomous execution by "${targetKey?.label}" on Mezo`,
      amount: `-${costMUSD.toFixed(2)} MUSD`,
      txHash: txHash,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100">
      <Header ownerAddress={account.ownerAddress} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-surface via-surface-light to-surface border border-surface-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mezo/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mezo/10 border border-mezo/25 text-mezo text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AKINDO Buildathon: Build with MUSD & MEZO</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Autonomous AI Agent Smart Accounts on Bitcoin
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 leading-relaxed">
              Empowering autonomous agents with cryptographic session keys, velocity limits, and cross-chain USDC/MUSD liquidity—without giving up master treasury custody.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <a
                href={MEZO_CONFIG.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-light border border-surface-border hover:border-slate-500 text-xs font-medium text-slate-200 transition-colors"
              >
                <span>Mezo Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
                <span>MUSD Contract:</span>
                <span className="text-mezo font-bold">{MEZO_CONFIG.musdAddress.slice(0, 10)}...</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Treasury Metrics */}
        <TreasuryMetrics
          musdBalance={account.musdBalance}
          usdcBridged={account.usdcBridged}
          btcGasBalance={account.btcGasBalance}
          stackedBtcYield={account.stackedBtcYield}
          activeAgentsCount={sessionKeys.filter((k) => k.active).length}
        />

        {/* 2. Bridge & Sandbox Grid */}
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

        {/* 3. Session Keys Management */}
        <SessionKeysManager
          sessionKeys={sessionKeys}
          onCreateKey={handleCreateKey}
          onRevokeKey={handleRevokeKey}
        />

        {/* 4. Real-time On-Chain Activity Feed */}
        <ActivityFeed logs={activityLogs} />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-mezo" />
            <span>Built for the Mezo Buildathon on AKINDO</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Network: Mezo Testnet (31611)</span>
            <span>•</span>
            <span>EVM Compatible</span>
            <span>•</span>
            <span>BTC Native Gas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
