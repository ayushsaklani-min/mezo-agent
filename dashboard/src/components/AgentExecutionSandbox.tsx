"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, Cpu, Globe, Bitcoin, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
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
    <div className="p-6 sm:p-7 rounded-2xl bg-white border-[3px] border-black shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden">
      {/* Top Console Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FF9900] border-2 border-black shadow-brutal-sm flex items-center justify-center text-black">
              <Terminal className="w-4 h-4 stroke-[3]" />
            </div>
            <h2 className="text-lg font-black text-black tracking-tight uppercase">
              Agent Execution Sandbox
            </h2>
            <span className="neo-badge bg-[#4ADE80] text-black text-[10px] px-2 py-0.5 rounded uppercase">
              EVM LIVE
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700">
            Trigger live on-chain micro-payments and observe cryptographic enforcement
          </p>
        </div>

        {/* Agent Key Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-mono font-black uppercase text-black">AGENT:</label>
          <select
            value={currentKey?.id || ""}
            onChange={(e) => setSelectedKeyId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] border-2 border-black shadow-brutal-sm text-xs font-bold text-black focus:outline-none cursor-pointer"
          >
            {sessionKeys.map((k) => (
              <option key={k.id} value={k.id} className="bg-white text-black font-bold">
                {k.label} {k.active ? `($${(k.hourlyLimit - k.hourlySpent).toFixed(1)} left)` : `(REVOKED)`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Action 1: Search API */}
        <button
          onClick={() => executeAction("Pay LLM Search API", 0.50, false)}
          disabled={isExecuting || !currentKey}
          className="neo-btn p-4 rounded-xl bg-[#BAE6FD] hover:bg-[#7DD3FC] text-left transition-all disabled:opacity-50 text-black flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-black shadow-brutal-sm flex items-center justify-center">
              <Globe className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-black bg-white px-2 py-0.5 rounded border border-black shadow-brutal-sm">
              0.50 MUSD
            </span>
          </div>
          <div>
            <span className="text-xs font-black block">
              Pay Search Oracle API
            </span>
            <span className="text-[11px] font-semibold text-slate-800 mt-0.5 block">
              Per-query web feed
            </span>
          </div>
        </button>

        {/* Action 2: GPU Compute */}
        <button
          onClick={() => executeAction("Pay GPU Compute Node", 2.25, false)}
          disabled={isExecuting || !currentKey}
          className="neo-btn p-4 rounded-xl bg-[#E9D5FF] hover:bg-[#D8B4FE] text-left transition-all disabled:opacity-50 text-black flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-black shadow-brutal-sm flex items-center justify-center">
              <Cpu className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-black bg-white px-2 py-0.5 rounded border border-black shadow-brutal-sm">
              2.25 MUSD
            </span>
          </div>
          <div>
            <span className="text-xs font-black block">
              Pay GPU Compute Node
            </span>
            <span className="text-[11px] font-semibold text-slate-800 mt-0.5 block">
              Autonomous LLM inference
            </span>
          </div>
        </button>

        {/* Action 3: Auto-DCA */}
        <button
          onClick={() => executeAction("Auto-DCA Yield to BTC", 5.00, false)}
          disabled={isExecuting || !currentKey}
          className="neo-btn p-4 rounded-xl bg-[#FED7AA] hover:bg-[#FDBA74] text-left transition-all disabled:opacity-50 text-black flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-black shadow-brutal-sm flex items-center justify-center">
              <Bitcoin className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-black bg-white px-2 py-0.5 rounded border border-black shadow-brutal-sm">
              5.00 MUSD
            </span>
          </div>
          <div>
            <span className="text-xs font-black block">
              Auto-DCA Yield to BTC
            </span>
            <span className="text-[11px] font-semibold text-slate-800 mt-0.5 block">
              Swaps into Satoshis
            </span>
          </div>
        </button>

        {/* Action 4: Test Velocity Limit (Revert) */}
        <button
          onClick={() => executeAction("Exceed Hourly Limit Test", 500.0, true)}
          disabled={isExecuting || !currentKey}
          className="neo-btn p-4 rounded-xl bg-[#FECDD3] hover:bg-[#FDA4AF] text-left transition-all disabled:opacity-50 text-black flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-black shadow-brutal-sm flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-black bg-white px-2 py-0.5 rounded border border-black shadow-brutal-sm text-red-600">
              500 MUSD
            </span>
          </div>
          <div>
            <span className="text-xs font-black text-red-950 block">
              Test Velocity Cap
            </span>
            <span className="text-[11px] font-semibold text-slate-800 mt-0.5 block">
              Simulate on-chain revert
            </span>
          </div>
        </button>
      </div>

      {/* Retro Cyber Terminal */}
      <div className="rounded-xl bg-[#121212] border-[3px] border-black p-4 font-mono text-xs text-white relative shadow-[4px_4px_0px_0px_#FFE600] overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b-2 border-white/20 text-[11px]">
          <div className="flex items-center gap-2">
            {/* Retro GUI circles */}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF4757] border border-black" />
              <div className="w-3 h-3 rounded-full bg-[#FFE600] border border-black" />
              <div className="w-3 h-3 rounded-full bg-[#4ADE80] border border-black" />
            </div>
            <span className="text-slate-300 font-bold ml-1">
              MEZO EVM LIVE STREAM (CHAIN 31611)
            </span>
          </div>
          {isExecuting && (
            <div className="flex items-center gap-1.5 text-[#FFE600] font-black">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>TRANSMITTING...</span>
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-none">
          {consoleLogs.map((log, index) => {
            const isError = log.includes("[REVERT]") || log.includes("[ERROR]");
            const isSuccess = log.includes("[CONFIRMED]") || log.includes("[EXECUTED]");
            const isStart = log.includes("[START]");
            const isShield = log.includes("[SHIELD]") || log.includes("[POLICY CHECK]");
            const isQueued = log.includes("[QUEUED]");

            return (
              <div
                key={index}
                className={
                  isError
                    ? "text-[#FF6B6B] font-black"
                    : isSuccess
                    ? "text-[#4ADE80] font-black"
                    : isShield
                    ? "text-[#FFE600] font-bold"
                    : isQueued
                    ? "text-[#38BDF8] font-bold"
                    : isStart
                    ? "text-[#FFA834] font-bold"
                    : "text-slate-300"
                }
              >
                {log}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
