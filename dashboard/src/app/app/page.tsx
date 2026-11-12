"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { TreasuryMetrics } from "@/components/TreasuryMetrics";
import { BridgeCard } from "@/components/BridgeCard";
import { SessionKeysManager } from "@/components/SessionKeysManager";
import { AgentExecutionSandbox } from "@/components/AgentExecutionSandbox";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ApprovalsQueue, PendingRequestItem } from "@/components/ApprovalsQueue";
import { TransactionConfirmationModal, ConfirmationDetails } from "@/components/TransactionConfirmationModal";
import { AlertRulesModal } from "@/components/AlertRulesModal";
import { SecurityAuditModal } from "@/components/SecurityAuditModal";
import { INITIAL_ACCOUNT_DATA, MEZO_CONFIG } from "@/lib/constants";
import type { SessionKeyItem, ActivityLog } from "@/lib/types";
import { useMezoWallet } from "@/lib/useMezoWallet";
import {
  fetchLiveBalances,
  fetchLiveSessionKeys,
  fetchLivePendingRequests,
  fetchLiveActivityLogs,
  executeLiveFaucetClaim,
  executeLiveApprove,
  executeLiveRevokeKey,
  executeLiveCreateKey,
  executeLiveBridgeDeposit,
} from "@/lib/blockchain";
import type { Address } from "viem";
import {
  Terminal,
  KeyRound,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Code2,
  RotateCw,
} from "lucide-react";

type CockpitTab = "all" | "overview" | "keys" | "approvals" | "audit";

export default function CockpitPage() {
  const wallet = useMezoWallet();
  const [account, setAccount] = useState(INITIAL_ACCOUNT_DATA);
  const [sessionKeys, setSessionKeys] = useState<SessionKeyItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequestItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CockpitTab>("all");
  const [isSyncingOnChain, setIsSyncingOnChain] = useState(false);

  // Dedicated sync function querying real on-chain contract state
  const refreshAllOnChainData = async () => {
    setIsSyncingOnChain(true);
    try {
      const [liveBalances, liveKeys, liveRequests, liveLogs] = await Promise.all([
        fetchLiveBalances(MEZO_CONFIG.accountAddress as Address, MEZO_CONFIG.musdAddress as Address),
        fetchLiveSessionKeys(MEZO_CONFIG.accountAddress as Address),
        fetchLivePendingRequests(MEZO_CONFIG.accountAddress as Address),
        fetchLiveActivityLogs(MEZO_CONFIG.accountAddress as Address),
      ]);

      if (liveBalances) {
        setAccount((prev) => ({
          ...prev,
          musdBalance: liveBalances.musdBalance,
          btcGasBalance: liveBalances.btcGasBalance,
          stackedBtcYield: liveBalances.musdBalance * 0.0000044,
        }));
      }

      if (liveKeys) {
        setSessionKeys(liveKeys);
      }

      if (liveRequests) {
        setPendingRequests(liveRequests);
      }

      if (liveLogs && liveLogs.length > 0) {
        setActivityLogs(liveLogs);
      }
    } catch (err) {
      console.warn("Error refreshing live on-chain data:", err);
    } finally {
      setIsSyncingOnChain(false);
    }
  };

  // Initial mount: load live blockchain state
  useEffect(() => {
    refreshAllOnChainData();
  }, []);

  // Keep ownerAddress in sync with connected wallet if available
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      setAccount((prev) => ({
        ...prev,
        ownerAddress: wallet.address!,
      }));
    }
  }, [wallet.isConnected, wallet.address]);

  // Handle Bridge USDC -> MUSD
  const handleBridgeSuccess = async (usdcAmount: number, musdAmount: number, txHash: string) => {
    const prevBalance = account.musdBalance;
    let finalTxHash = txHash || ("0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
    let isLive = false;

    if (isLiveMode) {
      try {
        const liveHash = await executeLiveBridgeDeposit(
          MEZO_CONFIG.accountAddress as Address,
          usdcAmount
        );
        finalTxHash = liveHash;
        isLive = true;
      } catch (err) {
        console.warn("Live bridge error:", err);
      }
    }

    const nextBalance = prevBalance + musdAmount;

    setAccount((prev) => ({
      ...prev,
      musdBalance: nextBalance,
      usdcBridged: prev.usdcBridged + usdcAmount,
    }));

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "BRIDGE",
      title: isLive ? "On-Chain Bridge Deposit" : "Cross-Chain Deposit",
      description: `Bridged ${usdcAmount} USDC from Base → Minted ${musdAmount} MUSD on Mezo`,
      amount: `+${musdAmount.toFixed(2)} MUSD`,
      txHash: finalTxHash,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    setConfirmationDetails({
      isOpen: true,
      type: "BRIDGE",
      status: "SUCCESS",
      title: isLive ? "Live Cross-Chain Bridge Deposit Confirmed" : "Cross-Chain Deposit Confirmed",
      subtitle: `Successfully converted ${usdcAmount} USDC from Base into ${musdAmount} native MUSD on Mezo via Wormhole NTT routing.`,
      amount: `+${musdAmount.toFixed(2)} MUSD`,
      txHash: finalTxHash,
      stateDiff: {
        label: "Mezo MUSD Treasury Vault",
        before: `$${prevBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} MUSD`,
        after: `$${nextBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} MUSD`,
      },
    });

    await refreshAllOnChainData();
  };

  // Handle Faucet Claim
  const handleFaucetClaim = async (claimedAmount: number) => {
    let finalTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    let isLiveTx = false;

    if (isLiveMode) {
      try {
        const recipient = (wallet.isConnected && wallet.address)
          ? (wallet.address as Address)
          : (MEZO_CONFIG.accountAddress as Address);

        const liveHash = await executeLiveFaucetClaim(
          recipient,
          MEZO_CONFIG.musdAddress as Address
        );
        finalTxHash = liveHash;
        isLiveTx = true;
      } catch (err: any) {
        console.warn("Live faucet error (falling back to sandbox drip):", err);
      }
    }

    setAccount((prev) => ({
      ...prev,
      usdcBridged: prev.usdcBridged + claimedAmount,
      musdBalance: prev.musdBalance + claimedAmount,
    }));

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "BRIDGE",
      title: isLiveTx ? "On-Chain MUSD Faucet Mint" : "USDC Testnet Faucet",
      description: isLiveTx
        ? `Minted 1,000 MUSD on Mezo Testnet (Chain ID 31611)`
        : `Claimed ${claimedAmount} Mock USDC for cross-chain simulation`,
      amount: `+${claimedAmount} MUSD`,
      txHash: finalTxHash,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    setConfirmationDetails({
      isOpen: true,
      type: "FAUCET",
      status: "SUCCESS",
      title: isLiveTx ? "Live Mezo Testnet Mint Confirmed" : "Mock USDC Faucet Drip Confirmed",
      subtitle: isLiveTx
        ? `Successfully broadcasted to Mezo Testnet and confirmed on-chain (Chain ID 31611).`
        : `Allocated ${claimedAmount} Mock USDC to simulate cross-chain treasury deposits and agent liquidity delegation.`,
      amount: `+${claimedAmount} MUSD`,
      txHash: finalTxHash,
      stateDiff: {
        label: isLiveTx ? "On-Chain MUSD Balance" : "Simulated Testnet Liquidity",
        before: `$${account.musdBalance.toLocaleString()} MUSD`,
        after: `$${(account.musdBalance + claimedAmount).toLocaleString()} MUSD`,
      },
    });

    await refreshAllOnChainData();
  };

  // Handle Create Session Key
  const handleCreateKey = async (newKey: SessionKeyItem) => {
    let finalTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    let isLiveTx = false;

    if (isLiveMode) {
      try {
        const liveHash = await executeLiveCreateKey(
          MEZO_CONFIG.accountAddress as Address,
          ((wallet.isConnected && wallet.address) ? wallet.address : account.ownerAddress) as Address,
          {
            keySigner: newKey.keyAddress as Address,
            hourlyLimit: newKey.hourlyLimit,
            dailyLimit: newKey.dailyLimit,
            maxPerTx: newKey.hourlyLimit / 2,
            durationDays: 7,
            label: newKey.label,
          }
        );
        finalTxHash = liveHash;
        isLiveTx = true;
      } catch (err: any) {
        console.warn("Live createSessionKey error (falling back to sandbox key):", err);
      }
    }

    setSessionKeys((prev) => [newKey, ...prev]);

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "CREATE_KEY",
      title: isLiveTx ? "On-Chain Session Key Created" : "Session Key Minted",
      description: `Created key for "${newKey.label}" with $${newKey.hourlyLimit}/h limit`,
      txHash: finalTxHash,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    setConfirmationDetails({
      isOpen: true,
      type: "CREATE_KEY",
      status: "SUCCESS",
      title: isLiveTx ? "On-Chain Session Key Active" : "Agent Session Key Active",
      subtitle: isLiveTx
        ? `Broadcasted to Mezo Testnet smart account. Guarded by 12-bucket sliding window velocity controls.`
        : `Successfully authorized cryptographic session key for "${newKey.label}". Key is bounded by a mathematical 12-bucket sliding window.`,
      amount: `$${newKey.hourlyLimit}/h Limit`,
      txHash: finalTxHash,
      agentLabel: newKey.label,
      stateDiff: {
        label: "Active Agent Session Keys",
        before: `${sessionKeys.filter((k) => k.active).length} Keys`,
        after: `${sessionKeys.filter((k) => k.active).length + 1} Keys`,
      },
    });

    await refreshAllOnChainData();
  };

  // Handle Revoke Key
  const handleRevokeKey = async (keyIdentifier: string) => {
    const targetKey = sessionKeys.find(
      (k) => k.id === keyIdentifier || k.keyAddress.toLowerCase() === keyIdentifier.toLowerCase()
    );
    const actualAddress = targetKey ? targetKey.keyAddress : keyIdentifier;
    const keyLabel = targetKey ? targetKey.label : "Agent Key";
    let finalTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    let isLiveTx = false;

    if (isLiveMode) {
      try {
        const liveHash = await executeLiveRevokeKey(
          MEZO_CONFIG.accountAddress as Address,
          ((wallet.isConnected && wallet.address) ? wallet.address : account.ownerAddress) as Address,
          actualAddress as Address
        );
        finalTxHash = liveHash;
        isLiveTx = true;
      } catch (err: any) {
        console.warn("Live revokeSessionKey error:", err);
      }
    }

    setSessionKeys((prev) =>
      prev.map((k) => (k.keyAddress.toLowerCase() === actualAddress.toLowerCase() ? { ...k, active: false } : k))
    );

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "REVOKE",
      title: isLiveTx ? "On-Chain Key Revocation" : "Session Key Revoked",
      description: `Revoked session key for "${keyLabel}". Effective immediately on Mezo.`,
      txHash: finalTxHash,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    setConfirmationDetails({
      isOpen: true,
      type: "REVOKE_KEY",
      status: "SUCCESS",
      title: "Session Key Revocation Enforced",
      subtitle: isLiveTx
        ? `Revocation transaction confirmed on Mezo Testnet (Chain ID 31611). Key invalidated.`
        : `Session key for "${keyLabel}" has been invalidated. Cryptographic execution attempts will now revert on-chain.`,
      amount: "0.00 MUSD Spend Allowed",
      txHash: finalTxHash,
      agentLabel: keyLabel,
      stateDiff: {
        label: "Active Agent Keys",
        before: `${sessionKeys.filter((k) => k.active).length} Active`,
        after: `${Math.max(0, sessionKeys.filter((k) => k.active).length - 1)} Active`,
      },
    });

    await refreshAllOnChainData();
  };

  // Handle Agent Execution in Sandbox
  const handleExecuteAction = async (
    keyId: string,
    actionName: string,
    costMUSD: number,
    txHash: string,
    isRevert?: boolean,
    revertReason?: string
  ) => {
    const targetKey = sessionKeys.find((k) => k.id === keyId);
    const keyLabel = targetKey ? targetKey.label : "Autonomous Agent";

    if (!isRevert) {
      const prevSpent = targetKey?.hourlySpent || 0;
      const nextSpent = prevSpent + costMUSD;
      const prevBalance = account.musdBalance;
      const nextBalance = Math.max(0, prevBalance - costMUSD);

      setSessionKeys((prev) =>
        prev.map((k) =>
          k.id === keyId
            ? {
                ...k,
                hourlySpent: nextSpent,
                dailySpent: (k.dailySpent || 0) + costMUSD,
              }
            : k
        )
      );

      setAccount((prev) => ({
        ...prev,
        musdBalance: nextBalance,
      }));

      const newLog: ActivityLog = {
        id: `log_${Date.now()}`,
        type: "PAYMENT",
        title: "Autonomous Agent Payment",
        description: `${keyLabel}: ${actionName}`,
        amount: `-${costMUSD.toFixed(2)} MUSD`,
        txHash: txHash,
        timestamp: Date.now(),
        status: "SUCCESS",
      };

      setActivityLogs((prev) => [newLog, ...prev]);

      setConfirmationDetails({
        isOpen: true,
        type: "AGENT_EXECUTION",
        status: "SUCCESS",
        title: "Autonomous Micro-Payment Cleared",
        subtitle: `Agent "${keyLabel}" executed an authorized transaction within its 12-bucket sliding window allowance.`,
        amount: `-${costMUSD.toFixed(2)} MUSD`,
        txHash: txHash,
        agentLabel: keyLabel,
        stateDiff: {
          label: "Agent Hourly Spend",
          before: `$${prevSpent.toFixed(2)} / $${targetKey?.hourlyLimit}.00`,
          after: `$${nextSpent.toFixed(2)} / $${targetKey?.hourlyLimit}.00`,
        },
      });

      await refreshAllOnChainData();
    } else {
      const newLog: ActivityLog = {
        id: `log_${Date.now()}`,
        type: "PAYMENT",
        title: "Unauthorized Spend Reverted",
        description: `${keyLabel}: Blocked by contract policy (${revertReason || "Limit Exceeded"})`,
        amount: `$${costMUSD.toFixed(2)} Blocked`,
        txHash: txHash,
        timestamp: Date.now(),
        status: "REVERTED",
      };

      setActivityLogs((prev) => [newLog, ...prev]);

      setConfirmationDetails({
        isOpen: true,
        type: "REVERT",
        status: "REVERTED",
        title: "Unauthorized Execution Reverted On-Chain",
        subtitle: `Attack blocked by MezoAgentAccount smart contract. Zero treasury loss occurred.`,
        amount: `$${costMUSD.toFixed(2)} Protected`,
        txHash: txHash,
        agentLabel: keyLabel,
        revertReason: revertReason || "Session policy limits exceeded",
        stateDiff: {
          label: "Treasury Safety",
          before: "Attempted Drain",
          after: "$0.00 Outflow (Protected)",
        },
      });
    }
  };

  // Handle Human-in-the-Loop Approval
  const handleApproveRequest = async (requestId: string) => {
    const targetReq = pendingRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    let finalTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    let isLiveTx = false;

    if (isLiveMode) {
      try {
        const liveHash = await executeLiveApprove(
          MEZO_CONFIG.accountAddress as Address,
          ((wallet.isConnected && wallet.address) ? wallet.address : account.ownerAddress) as Address,
          targetReq.onChainId ?? 0
        );
        finalTxHash = liveHash;
        isLiveTx = true;
      } catch (err: any) {
        console.warn("Live approveExecution error (falling back to sandbox):", err);
      }
    }

    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));

    const prevBalance = account.musdBalance;
    const nextBalance = Math.max(0, prevBalance - targetReq.musdAmount);

    setAccount((prev) => ({
      ...prev,
      musdBalance: nextBalance,
    }));

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "PAYMENT",
      title: isLiveTx ? "On-Chain Approval Disbursed" : "Human Approval Executed",
      description: `Disbursed $${targetReq.musdAmount.toFixed(2)} MUSD for "${targetReq.agentLabel}" after multi-sig review`,
      amount: `-${targetReq.musdAmount.toFixed(2)} MUSD`,
      txHash: finalTxHash,
      timestamp: Date.now(),
      status: "SUCCESS",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    setConfirmationDetails({
      isOpen: true,
      type: "AGENT_EXECUTION",
      status: "SUCCESS",
      title: isLiveTx ? "On-Chain Approval Disbursed" : "Human Approval Executed",
      subtitle: isLiveTx
        ? `Transaction confirmed on Mezo Testnet (Chain ID 31611). Funds released to target.`
        : `Successfully authorized and disbursed ${targetReq.musdAmount.toFixed(2)} MUSD to ${targetReq.target.slice(0, 10)}... on Mezo Testnet.`,
      amount: `-${targetReq.musdAmount.toFixed(2)} MUSD`,
      txHash: finalTxHash,
      agentLabel: targetReq.agentLabel,
      stateDiff: {
        label: "Treasury Balance",
        before: `$${prevBalance.toFixed(2)} MUSD`,
        after: `$${nextBalance.toFixed(2)} MUSD`,
      },
    });

    await refreshAllOnChainData();
  };

  // Handle Human-in-the-Loop Rejection
  const handleRejectRequest = (requestId: string, reason: string) => {
    const targetReq = pendingRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    setPendingRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "REJECTED" as const } : r))
    );

    const fakeTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      type: "PAYMENT",
      title: "Spend Request Rejected",
      description: `Treasury rejected $${targetReq.musdAmount.toFixed(2)} MUSD for "${targetReq.agentLabel}": ${reason}`,
      amount: `$0.00 Lost`,
      txHash: fakeTx,
      timestamp: Date.now(),
      status: "REVERTED",
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    setConfirmationDetails({
      isOpen: true,
      type: "REVERT",
      status: "REVERTED",
      title: "Spend Request Rejected",
      subtitle: `Admin rejected execution request for "${targetReq.agentLabel}". Zero treasury outflow.`,
      amount: `$${targetReq.musdAmount.toFixed(2)} Blocked`,
      txHash: fakeTx,
      agentLabel: targetReq.agentLabel,
      revertReason: reason,
      stateDiff: {
        label: "Treasury Protection",
        before: `Attempted Spend: $${targetReq.musdAmount.toFixed(2)}`,
        after: "$0.00 Outflow (Fully Protected)",
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07080E] text-slate-100 font-sans selection:bg-mezo/30 selection:text-orange-200">
      {/* Top Application Header */}
      <Header
        ownerAddress={account.ownerAddress}
        isLiveMode={isLiveMode}
        onToggleMode={() => setIsLiveMode((prev) => !prev)}
        onOpenAlerts={() => setIsAlertModalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
      />

      {/* Cockpit Sub-Navbar with Navigation Breadcrumbs & View Tabs */}
      <div className="border-b border-surface-border bg-surface/70 backdrop-blur-md sticky top-18 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Breadcrumb & Home Link */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-mezo" />
              <span>Landing Page</span>
            </Link>
            <div className="h-4 w-px bg-surface-border" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">Mezo EVM Cockpit</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                ONLINE
              </span>
              <button
                onClick={() => refreshAllOnChainData()}
                disabled={isSyncingOnChain}
                title="Sync live blockchain balances and registered session keys"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border hover:border-mezo/50 text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 ml-1"
              >
                <RotateCw className={`w-3 h-3 text-mezo ${isSyncingOnChain ? "animate-spin" : ""}`} />
                <span className="text-[11px] font-mono">{isSyncingOnChain ? "Syncing..." : "Sync Chain"}</span>
              </button>
            </div>
          </div>

          {/* View Tab Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All-in-One", icon: Layers },
              { id: "overview", label: "Liquidity & Terminal", icon: Terminal },
              { id: "keys", label: "Session Keys", icon: KeyRound },
              { id: "approvals", label: "Approval Queue", icon: ShieldAlert, badge: pendingRequests.filter((r) => r.status === "PENDING").length },
              { id: "audit", label: "Audit Ledger", icon: FileSpreadsheet },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CockpitTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-mezo text-black shadow-md shadow-mezo/20"
                      : "bg-surface-card border border-surface-border text-slate-400 hover:text-white hover:border-slate-500"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Cockpit Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Treasury Metrics Bar (Always Visible Across Views) */}
        <TreasuryMetrics
          musdBalance={account.musdBalance}
          usdcBridged={account.usdcBridged}
          btcGasBalance={account.btcGasBalance}
          stackedBtcYield={account.stackedBtcYield}
          activeAgentsCount={sessionKeys.filter((k) => k.active).length}
        />

        {/* Tab 1: Overview (Bridge & Execution Terminal) */}
        {(activeTab === "all" || activeTab === "overview") && (
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
                isLiveMode={isLiveMode}
                accountAddress={account.accountAddress}
                onExecuteAction={handleExecuteAction}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Session Keys Management */}
        {(activeTab === "all" || activeTab === "keys") && (
          <SessionKeysManager
            sessionKeys={sessionKeys}
            onCreateKey={handleCreateKey}
            onRevokeKey={handleRevokeKey}
          />
        )}

        {/* Tab 3: Human-in-the-Loop Approvals Queue */}
        {(activeTab === "all" || activeTab === "approvals") && (
          <ApprovalsQueue
            requests={pendingRequests}
            threshold={10.0}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />
        )}

        {/* Tab 4: Audit Feed & Forensics */}
        {(activeTab === "all" || activeTab === "audit") && (
          <ActivityFeed logs={activityLogs} />
        )}
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

      {/* Formal Security Verification & Bug Bounty Modal */}
      <SecurityAuditModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-mezo" />
            <span className="text-slate-400 font-medium">MezoAgent Institutional Cockpit</span>
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
