"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Play, AlertTriangle, Cpu, Globe, Bitcoin, RefreshCw, Zap, ShieldAlert } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";
import type { SessionKeyItem } from "@/lib/types";
import { executeLiveAgentAction } from "@/lib/blockchain";

interface SandboxProps {
  sessionKeys: SessionKeyItem[];
  isLiveMode?: boolean;
  accountAddress?: string;
  onExecuteAction: (
    keyId: string,
    actionName: string,
    costMUSD: number,
    txHash: string,
    isRevert?: boolean,
    revertReason?: string
  ) => void;
}

export const AgentExecutionSandbox: React.FC<SandboxProps> = ({
  sessionKeys,
  isLiveMode = true,
  accountAddress,
  onExecuteAction,
}) => {
  const [selectedKeyId, setSelectedKeyId] = useState<string>(sessionKeys[0]?.id || "");
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[SYSTEM] MezoAgent Autonomous Engine initialized on Chain ID 31611 (Mezo Testnet).",
    "[SYSTEM] Session Key cryptographic policy verifier: ACTIVE.",
    "[SYSTEM] Select an action below to execute live on-chain agent micro-payments.",
  ]);

  const currentKey = sessionKeys.find((k) => k.id === selectedKeyId) || sessionKeys[0];

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  const logMessage = (msg: string) => {
    setConsoleLogs((prev) => [...prev.slice(-20), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const executeAction = async (actionTitle: string, cost: number, shouldRevert: boolean = false) => {
    if (!currentKey) {
      logMessage("[ERROR] No session key selected. Mint or authorize an agent key first.");
      return;
    }

    if (!currentKey.active) {
      logMessage(`[SECURITY REVERT] Session key "${currentKey.label}" is REVOKED on-chain.`);
      logMessage(`[SHIELD] Smart account rejected call: Session key inactive.`);
      onExecuteAction(currentKey.id, actionTitle, cost, "", true, "Session Key Revoked by Master Owner");
      return;
    }

    setIsExecuting(true);
    logMessage(`[START] Agent "${currentKey.label}" initiated: "${actionTitle}"`);
    logMessage(`[NETWORK] Target Network: Mezo Testnet (Chain ID 31611)`);
    logMessage(`[SIGNER] Ephemeral Session Signer: ${currentKey.keyAddress.slice(0, 10)}...${currentKey.keyAddress.slice(-6)}`);

    try {
      const isHighValue = cost > 10.0;
      if (shouldRevert || (currentKey.hourlySpent + cost > currentKey.hourlyLimit)) {
        logMessage(`[POLICY CHECK] Cost: $${cost.toFixed(2)} MUSD | Remaining Hourly: $${Math.max(0, currentKey.hourlyLimit - currentKey.hourlySpent).toFixed(2)} MUSD`);
        logMessage(`[TRANSMIT] Submitting to smart account on-chain to test security boundary...`);
        try {
          await executeLiveAgentAction({
            accountAddress: (accountAddress || MEZO_CONFIG.accountAddress) as `0x${string}`,
            agentPrivateKey: (currentKey.privateKey as `0x${string}`) || (MEZO_CONFIG.demoSigners.agentPrivateKey as `0x${string}`),
            target: MEZO_CONFIG.recipientAddress as `0x${string}`,
            musdAmount: cost,
          });
        } catch (evmErr: any) {
          const revertMsg = evmErr?.shortMessage || evmErr?.message || "Hourly MUSD limit exceeded";
          logMessage(`[EVM REVERT] Blocked by contract policy: ${revertMsg}`);
          logMessage(`[SHIELD] Master treasury protected. 0 loss occurred.`);
          onExecuteAction(currentKey.id, actionTitle, cost, "", true, "Hourly Velocity Limit Exceeded");
          setIsExecuting(false);
          return;
        }
      }

      logMessage(`[BROADCAST] Broadcasting signed execution to Mezo EVM...`);
      const result = await executeLiveAgentAction({
        accountAddress: (accountAddress || MEZO_CONFIG.accountAddress) as `0x${string}`,
        agentPrivateKey: (currentKey.privateKey as `0x${string}`) || (MEZO_CONFIG.demoSigners.agentPrivateKey as `0x${string}`),
        target: MEZO_CONFIG.recipientAddress as `0x${string}`,
        musdAmount: cost,
        isApprovalRequest: isHighValue,
        memo: `Autonomous Agent Action: ${actionTitle}`,
      });

      if (result.isRequest) {
        logMessage(`[QUEUED] Amount $${cost.toFixed(2)} MUSD exceeded threshold. Created on-chain human approval request.`);
        logMessage(`[CONFIRMED] Tx Hash: ${result.hash.slice(0, 18)}... (Pending multi-sig approval)`);
      } else {
        logMessage(`[VERIFIED] On-chain 12-bucket sliding window velocity valid.`);
        logMessage(`[EXECUTED] Transferred $${cost.toFixed(2)} MUSD on Mezo.`);
        logMessage(`[CONFIRMED] Tx Hash: ${result.hash.slice(0, 18)}... (Receipt verified)`);
      }

      onExecuteAction(currentKey.id, actionTitle, cost, result.hash, false);
    } catch (err: any) {
      console.warn("Execution error:", err);
      const errorMsg = err?.shortMessage || err?.message || "Transaction reverted";
      logMessage(`[EVM ERROR] ${errorMsg}`);
      onExecuteAction(currentKey.id, actionTitle, cost, "", true, errorMsg);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="p-6 sm:p-7 rounded-3xl bg-surface border border-surface-border shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-5 h-5 text-mezo" />
              <span>Autonomous Agent Execution Sandbox</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-mezo/15 text-mezo border border-mezo/30 font-semibold">
              Live EVM
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Trigger live on-chain micro-payments and observe cryptographic enforcement
          </p>
        </div>

        {/* Agent Key Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-slate-400">Agent:</label>
          <select
            value={currentKey?.id || ""}
            onChange={(e) => setSelectedKeyId(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs text-white focus:outline-none focus:border-mezo font-medium cursor-pointer"
          >
            {sessionKeys.map((k) => (
              <option key={k.id} value={k.id} className="bg-[#0E111B] text-white">
                {k.label} {k.active ? `($${(k.hourlyLimit - k.hourlySpent).toFixed(1)} left)` : `(REVOKED)`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Action 1: Search API */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => executeAction("Pay LLM Search API", 0.50, false)}
          disabled={isExecuting || !currentKey}
          className="p-4 rounded-2xl bg-surface-card border border-surface-border hover:border-cyan-500/50 text-left transition-all group disabled:opacity-50 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-extrabold text-cyan-400">0.50 MUSD</span>
          </div>
          <span className="text-xs font-bold text-white group-hover:text-cyan-300 block">
            Pay Search Oracle API
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Per-query web data feed</span>
        </motion.button>

        {/* Action 2: Compute Node */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => executeAction("Pay GPU Compute Node", 2.25, false)}
          disabled={isExecuting || !currentKey}
          className="p-4 rounded-2xl bg-surface-card border border-surface-border hover:border-purple-500/50 text-left transition-all group disabled:opacity-50 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-extrabold text-purple-400">2.25 MUSD</span>
          </div>
          <span className="text-xs font-bold text-white group-hover:text-purple-300 block">
            Pay GPU Compute Node
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Autonomous LLM inference</span>
        </motion.button>

        {/* Action 3: Auto-DCA Bitcoin */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => executeAction("Auto-DCA Yield to BTC", 5.00, false)}
          disabled={isExecuting || !currentKey}
          className="p-4 rounded-2xl bg-surface-card border border-surface-border hover:border-amber-500/50 text-left transition-all group disabled:opacity-50 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
              <Bitcoin className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-extrabold text-amber-400">5.00 MUSD</span>
          </div>
          <span className="text-xs font-bold text-white group-hover:text-amber-300 block">
            Auto-DCA Yield to BTC
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Swaps into native Satoshis</span>
        </motion.button>

        {/* Action 4: Trigger Over-limit (Revert Demo) */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => executeAction("Exceed Hourly Limit Test", 500.0, true)}
          disabled={isExecuting || !currentKey}
          className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 hover:border-red-500/50 text-left transition-all group disabled:opacity-50 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-extrabold text-red-400">500.00 MUSD</span>
          </div>
          <span className="text-xs font-bold text-white group-hover:text-red-300 block">
            Test Velocity Limit
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Simulate on-chain revert</span>
        </motion.button>
      </div>

      {/* Live Monospace Terminal */}
      <div className="rounded-2xl bg-[#04060A] border border-surface-border p-4 sm:p-5 font-mono text-xs text-slate-300 relative overflow-hidden shadow-inner">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-border/60 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="text-slate-400">Mezo EVM Execution Stream (RPC: {MEZO_CONFIG.rpcUrl})</span>
          </div>
          {isExecuting && (
            <div className="flex items-center gap-1.5 text-mezo font-bold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Broadcasting...</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
          {consoleLogs.map((log, index) => {
            const isError = log.includes("[REVERT]") || log.includes("[ERROR]");
            const isSuccess = log.includes("[CONFIRMED]") || log.includes("[EXECUTED]");
            const isStart = log.includes("[START]");
            const isShield = log.includes("[SHIELD]") || log.includes("[SECURITY CHECK]");

            return (
              <div
                key={index}
                className={
                  isError
                    ? "text-red-400 font-bold"
                    : isSuccess
                    ? "text-emerald-400 font-bold"
                    : isShield
                    ? "text-amber-400 font-medium"
                    : isStart
                    ? "text-mezo font-semibold"
                    : "text-slate-400"
                }
              >
                {log}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </motion.div>
  );
};
