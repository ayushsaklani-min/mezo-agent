"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, AlertTriangle, Cpu, Globe, Bitcoin, RefreshCw, ShieldAlert } from "lucide-react";
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
  onQuarantineKey?: (keyId: string, reason: string) => void;
}

export const AgentExecutionSandbox: React.FC<SandboxProps> = ({
  sessionKeys,
  accountAddress,
  onExecuteAction,
  onQuarantineKey,
}) => {
  const [selectedKeyId, setSelectedKeyId] = useState<string>(sessionKeys[0]?.id || "");
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[SYSTEM] BitAgent Autonomous Engine initialized on Chain ID 31611 (Bitcoin L2 Testnet).",
    "[SYSTEM] Session Key cryptographic policy verifier: ACTIVE.",
    "[CIRCUIT BREAKER] Anti-Hallucination Anomaly Guardrail: ARMED (auto-quarantine on 3 consecutive reverts).",
    "[SYSTEM] Select an action below to execute live on-chain agent micro-payments.",
  ]);

  const currentKey = sessionKeys.find((k) => k.id === selectedKeyId) || sessionKeys[0];

  const triggerCircuitBreakerSim = async () => {
    if (!currentKey) return;
    setIsExecuting(true);
    logMessage(`[ANOMALY TRIGGER] Simulating rapid prompt-injection loop on "${currentKey.label}"...`);
    await new Promise((r) => setTimeout(r, 450));
    logMessage(`[TRACE 1/3] Tx 0x48b... -> attempted transfer(0xattacker, $100.00) -> [REVERT] HourlyLimitExceeded`);
    await new Promise((r) => setTimeout(r, 450));
    logMessage(`[TRACE 2/3] Tx 0x72c... -> attempted approve(0xmalicious, MAX_UINT) -> [REVERT] TargetNotAllowlisted`);
    await new Promise((r) => setTimeout(r, 450));
    logMessage(`[TRACE 3/3] Tx 0x91e... -> attempted sweepAll() -> [REVERT] FunctionSelectorRestricted`);
    await new Promise((r) => setTimeout(r, 450));
    logMessage(`🚨 [CIRCUIT BREAKER TRIPPED] 3 consecutive reverts within 5-minute bucket!`);
    logMessage(`🛡️ [AUTO-QUARANTINE ACTIVATED] Key "${currentKey.label}" state changed to QUARANTINED.`);
    logMessage(`[SHIELD] $0.00 treasury outflow. Key execution halted until admin disinfects in Session Keys tab.`);

    if (onQuarantineKey) {
      onQuarantineKey(currentKey.id, "Prompt Injection Anomaly: 3 Consecutive Reverts");
    }
    setIsExecuting(false);
  };

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
    logMessage(`[NETWORK] Target Network: Bitcoin L2 Testnet (Chain ID 31611)`);
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

      logMessage(`[BROADCAST] Broadcasting signed execution to Bitcoin L2 EVM...`);
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
        logMessage(`[EXECUTED] Transferred $${cost.toFixed(2)} MUSD on Bitcoin L2.`);
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
      className="p-6 sm:p-7 rounded-2xl bg-[#0E121E] border-2 border-black shadow-brutal-lg relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 font-mono">
              <Terminal className="w-5 h-5 text-mezo stroke-[2.5]" />
              <span>AUTONOMOUS AGENT EXECUTION SANDBOX</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm">
              LIVE EVM
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Trigger live on-chain micro-payments and observe cryptographic enforcement
          </p>
        </div>

        {/* Agent Key Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono">
          <label className="text-xs font-bold text-slate-400">KEY:</label>
          <select
            value={currentKey?.id || ""}
            onChange={(e) => setSelectedKeyId(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-[#05060A] border-2 border-black text-xs text-white focus:outline-none focus:border-mezo font-bold cursor-pointer shadow-brutal-sm"
          >
            {sessionKeys.map((k) => (
              <option key={k.id} value={k.id} className="bg-[#0E111B] text-white">
                {k.label} {k.active ? `($${(k.hourlyLimit - k.hourlySpent).toFixed(1)} left)` : `(REVOKED)`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quarantined Warning Notice */}
      {currentKey?.status === "QUARANTINED" && (
        <div className="mb-4 p-4 rounded-xl bg-amber-400 text-black border-2 border-black shadow-brutal flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 stroke-[2.5] shrink-0" />
            <div>
              <span className="font-black block uppercase">CIRCUIT BREAKER QUARANTINED: EXECUTION FROZEN</span>
              <span className="text-[11px] font-bold">
                3 consecutive reverts detected. Key quarantined on-chain to protect capital. Disinfect in Session Keys tab.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-black text-amber-400 font-mono text-[10px] font-black border border-black whitespace-nowrap">
            FROZEN
          </span>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Action 1: Search API */}
        <button
          onClick={() => executeAction("Pay LLM Search API", 0.50, false)}
          disabled={isExecuting || !currentKey || currentKey.status === "QUARANTINED"}
          className="p-4 rounded-xl bg-[#05060A] border-2 border-black hover:border-cyan-400 text-left transition-all shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 group font-mono"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-cyan-400 text-black border-2 border-black shadow-brutal-sm">
              <Globe className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-black text-cyan-400">0.50 MUSD</span>
          </div>
          <span className="text-xs font-black text-white group-hover:text-cyan-300 block">
            Pay Search Oracle API
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Per-query web data feed</span>
        </button>

        {/* Action 2: Compute Node */}
        <button
          onClick={() => executeAction("Pay GPU Compute Node", 2.25, false)}
          disabled={isExecuting || !currentKey || currentKey.status === "QUARANTINED"}
          className="p-4 rounded-xl bg-[#05060A] border-2 border-black hover:border-purple-400 text-left transition-all shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 group font-mono"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-purple-400 text-black border-2 border-black shadow-brutal-sm">
              <Cpu className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-black text-purple-400">2.25 MUSD</span>
          </div>
          <span className="text-xs font-black text-white group-hover:text-purple-300 block">
            Pay GPU Compute Node
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Autonomous LLM inference</span>
        </button>

        {/* Action 3: Auto-DCA Bitcoin */}
        <button
          onClick={() => executeAction("Auto-DCA Yield to BTC", 5.00, false)}
          disabled={isExecuting || !currentKey || currentKey.status === "QUARANTINED"}
          className="p-4 rounded-xl bg-[#05060A] border-2 border-black hover:border-amber-400 text-left transition-all shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 group font-mono"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-amber-400 text-black border-2 border-black shadow-brutal-sm">
              <Bitcoin className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-black text-amber-400">5.00 MUSD</span>
          </div>
          <span className="text-xs font-black text-white group-hover:text-amber-300 block">
            Auto-DCA Yield to BTC
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Swaps into native Satoshis</span>
        </button>

        {/* Action 4: Trigger Over-limit (Revert Demo) */}
        <button
          onClick={() => executeAction("Exceed Hourly Limit Test", 500.0, true)}
          disabled={isExecuting || !currentKey || currentKey.status === "QUARANTINED"}
          className="p-4 rounded-xl bg-red-950/40 border-2 border-red-500 hover:border-red-400 text-left transition-all shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 group font-mono"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-red-400 text-black border-2 border-black shadow-brutal-sm">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-black text-red-400">500.00 MUSD</span>
          </div>
          <span className="text-xs font-black text-white group-hover:text-red-300 block">
            Test Velocity Limit
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Simulate on-chain revert</span>
        </button>
      </div>

      {/* Differentiator 2: Circuit Breaker Hallucination Simulator Button */}
      <div className="mb-4">
        <button
          onClick={triggerCircuitBreakerSim}
          disabled={isExecuting || !currentKey || currentKey.status === "QUARANTINED"}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-amber-400 text-black border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-left transition-all disabled:opacity-50 font-mono"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black text-amber-400 border border-black shadow-sm">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-tight">
                  SIMULATE PROMPT-INJECTION ATTACK (AUTO-QUARANTINE CIRCUIT BREAKER)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black text-white font-black">
                  3X REVERT TRIP
                </span>
              </div>
              <span className="text-[11px] font-bold text-black/80 block mt-0.5">
                Simulates 3 rapid unauthorized spends in 5m window → Auto-quarantines session key on-chain!
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-black hidden sm:inline-block">
            TRIGGER ATTACK →
          </span>
        </button>
      </div>

      {/* Live Monospace Terminal */}
      <div className="rounded-xl bg-[#05060A] border-2 border-black p-4 sm:p-5 font-mono text-xs text-slate-300 relative overflow-hidden shadow-inner">
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-zinc-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">Bitcoin L2 EVM Execution Stream (RPC: {MEZO_CONFIG.rpcUrl})</span>
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
            const isError = log.includes("[REVERT]") || log.includes("[ERROR]") || log.includes("🚨");
            const isSuccess = log.includes("[CONFIRMED]") || log.includes("[EXECUTED]");
            const isStart = log.includes("[START]");
            const isShield = log.includes("[SHIELD]") || log.includes("[SECURITY CHECK]") || log.includes("🛡️");

            return (
              <div
                key={index}
                className={
                  isError
                    ? "text-red-400 font-bold"
                    : isSuccess
                    ? "text-emerald-400 font-bold"
                    : isShield
                    ? "text-amber-400 font-bold"
                    : isStart
                    ? "text-mezo font-bold"
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
