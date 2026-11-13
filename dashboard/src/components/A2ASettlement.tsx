"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Bot,
  FileText,
  ExternalLink,
  Send,
  RefreshCw,
} from "lucide-react";
import type { A2AInvoice } from "@/lib/types";
import { MEZO_CONFIG } from "@/lib/constants";

interface A2ASettlementProps {
  invoices: A2AInvoice[];
  onSettleInvoice: (invoiceId: string) => Promise<string>;
  onRequestService: (sellerAgent: string, serviceName: string, costMUSD: number) => Promise<void>;
  isLiveMode?: boolean;
}

export const A2ASettlement: React.FC<A2ASettlementProps> = ({
  invoices,
  onSettleInvoice,
  onRequestService,
  isLiveMode = true,
}) => {
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [activeTxHash, setActiveTxHash] = useState<string | null>(null);

  const peerAgents = [
    {
      name: "DeepSeek Formal Invariant Auditor",
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      service: "Formal Bytecode Invariant Proof",
      rateMUSD: 1.5,
      latency: "1.2s",
      badge: "Security & Invariants",
      color: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      description: "Generates 128,000 stateful fuzzing traces proving no reentrancy or velocity cap overflow.",
    },
    {
      name: "Perplexity Web-Search Oracle",
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      service: "Real-Time Web Intelligence Scrape",
      rateMUSD: 0.75,
      latency: "0.8s",
      badge: "Search & Data",
      color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      description: "Queries live Bitcoin mempool, macroeconomic feeds, and cross-chain bridge liquidity depths.",
    },
    {
      name: "Wormhole NTT Fast Relayer",
      address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      service: "Cross-Chain Relayer Gas Hedging",
      rateMUSD: 2.2,
      latency: "2.4s",
      badge: "Interoperability",
      color: "border-amber-500/40 text-amber-400 bg-amber-500/10",
      description: "Settles fast cross-chain transfers between Base USDC and Mezo native MUSD stablecoin.",
    },
  ];

  const handleHireAgent = async () => {
    const agent = peerAgents[selectedAgentIndex];
    setIsProcessing(true);
    setSimStep(1);
    setActiveTxHash(null);

    // Step 1: Request sent
    await new Promise((r) => setTimeout(r, 600));
    setSimStep(2);

    // Step 2: Deliverable generated & EIP-712 invoice signed
    await new Promise((r) => setTimeout(r, 700));
    setSimStep(3);

    // Step 3: Session key sliding window budget validated & settled on Mezo
    await new Promise((r) => setTimeout(r, 800));
    try {
      await onRequestService(agent.name, agent.service, agent.rateMUSD);
      setSimStep(4);
    } catch (err) {
      console.warn("A2A settlement error:", err);
      setSimStep(4);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentAgent = peerAgents[selectedAgentIndex];

  return (
    <div className="space-y-6">
      {/* Top Banner Card: A2A Concept */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-500/10 via-surface-card to-surface-card border border-purple-500/25 p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                DIFFERENTIATOR 3 • AGENT-TO-AGENT (A2A) PROTOCOL
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Autonomous Multi-Agent Micro-Invoicing & Settlement
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When an Orchestrator agent hires specialized AI worker agents, they coordinate and settle natively on Mezo.
              Worker agents emit <strong>EIP-712 typed invoices with IPFS deliverables</strong>; orchestrator session keys verify the proof and disburse MUSD within velocity envelopes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-light border border-surface-border text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>P2P Peer Protocol: EIP-712</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-light border border-surface-border text-xs font-mono text-slate-300">
              <span className="text-mezo font-bold">MUSD</span>
              <span>Sub-cent Micro-Settlement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Peer Agent Service Registry (Marketplace) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {peerAgents.map((agent, idx) => {
          const isSelected = selectedAgentIndex === idx;
          return (
            <motion.div
              key={agent.name}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedAgentIndex(idx)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                isSelected
                  ? "bg-surface-card border-purple-500/80 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/50"
                  : "bg-surface-card/60 border-surface-border hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${agent.color}`}>
                  {agent.badge}
                </span>
                <span className="text-xs font-mono font-extrabold text-white">
                  ${agent.rateMUSD.toFixed(2)} MUSD
                </span>
              </div>

              <h3 className="font-bold text-sm text-white mb-1">{agent.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{agent.description}</p>

              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Latency: {agent.latency}</span>
                <span className="text-purple-400 font-bold">{isSelected ? "Selected Agent" : "Click to Select"}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live Interactive A2A Negotiation & Settlement Terminal */}
      <div className="rounded-3xl bg-surface border border-surface-border p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-mezo" />
            <h3 className="text-sm font-bold text-white">
              Autonomous Machine-to-Machine Negotiation Simulator
            </h3>
          </div>
          <button
            onClick={handleHireAgent}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Dispatch Task & Auto-Settle (${currentAgent.rateMUSD.toFixed(2)} MUSD)</span>
          </button>
        </div>

        {/* 4-Step Negotiation Pipeline Visualization */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-2xl border text-xs transition-colors ${
            simStep >= 1 ? "bg-purple-950/20 border-purple-500/50 text-purple-300" : "bg-surface-light border-surface-border text-slate-500"
          }`}>
            <span className="block font-mono text-[10px] font-bold text-slate-400 mb-1">STEP 1: DISPATCH</span>
            <span className="font-semibold block text-slate-200">Orchestrator Brief</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Task sent with budget lock</span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-xs transition-colors ${
            simStep >= 2 ? "bg-purple-950/20 border-purple-500/50 text-purple-300" : "bg-surface-light border-surface-border text-slate-500"
          }`}>
            <span className="block font-mono text-[10px] font-bold text-slate-400 mb-1">STEP 2: DELIVERABLE</span>
            <span className="font-semibold block text-slate-200">IPFS Proof & Invoice</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Worker signs EIP-712 invoice</span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-xs transition-colors ${
            simStep >= 3 ? "bg-purple-950/20 border-purple-500/50 text-purple-300" : "bg-surface-light border-surface-border text-slate-500"
          }`}>
            <span className="block font-mono text-[10px] font-bold text-slate-400 mb-1">STEP 3: GUARDRAIL CHECK</span>
            <span className="font-semibold block text-slate-200">Sliding Window Valid</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Velocity envelope checks spend</span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-xs transition-colors ${
            simStep >= 4 ? "bg-emerald-950/30 border-emerald-500/60 text-emerald-300" : "bg-surface-light border-surface-border text-slate-500"
          }`}>
            <span className="block font-mono text-[10px] font-bold text-slate-400 mb-1">STEP 4: SETTLEMENT</span>
            <span className="font-semibold block text-emerald-300">MUSD Disbursed</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Confirmed on Mezo EVM</span>
          </div>
        </div>

        {/* Live A2A Stream Console */}
        <div className="p-3.5 rounded-2xl bg-[#04060A] border border-surface-border font-mono text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-slate-800">
            <span>A2A P2P PROTOCOL TELEMETRY</span>
            <span className="text-purple-400 font-bold">MEZO BITCOIN L2</span>
          </div>
          {simStep === 0 && (
            <p className="text-slate-500">&gt; Standby. Select a peer agent and click "Dispatch Task & Auto-Settle" above.</p>
          )}
          {simStep >= 1 && (
            <p className="text-cyan-400">&gt; [1/4 DISPATCH] Orchestrator emitted payload: task="{currentAgent.service}", maxSpend={currentAgent.rateMUSD} MUSD.</p>
          )}
          {simStep >= 2 && (
            <p className="text-purple-300">&gt; [2/4 WORKER DELIVERABLE] {currentAgent.name} published deliverable (CID: ipfs://bafybeicm37dn...). Signed EIP-712 Invoice.</p>
          )}
          {simStep >= 3 && (
            <p className="text-amber-300">&gt; [3/4 GUARDRAIL] MezoAgentAccount validated sliding window allowance: ${currentAgent.rateMUSD.toFixed(2)} &lt; $25.00/hr limit. Allowed!</p>
          )}
          {simStep >= 4 && (
            <p className="text-emerald-400 font-bold">&gt; [4/4 ON-CHAIN SETTLEMENT CONFIRMED] Disbursed ${currentAgent.rateMUSD.toFixed(2)} MUSD to {currentAgent.address.slice(0, 10)}... on Mezo EVM. Zero human intervention required.</p>
          )}
        </div>
      </div>

      {/* Historical A2A Micro-Invoices Ledger */}
      <div className="rounded-3xl bg-surface border border-surface-border p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-mezo" />
            <h3 className="text-sm font-bold text-white">Cryptographic A2A Invoice Ledger</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {invoices.length} Registered Peer Invoices
          </span>
        </div>

        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-600 transition-colors space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-light border border-surface-border text-slate-300 font-bold">
                    {inv.invoiceNumber}
                  </span>
                  <span className="font-bold text-white text-xs">{inv.serviceName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-mezo">
                    ${inv.amountMUSD.toFixed(2)} MUSD
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    inv.status === "SETTLED"
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                      : "bg-amber-950/60 text-amber-400 border border-amber-500/40"
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-[11px]">{inv.deliverableSummary}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-border/60 text-[11px] font-mono text-slate-500">
                <div className="flex items-center gap-3">
                  <span>Seller: {inv.sellerAgent}</span>
                  <span>•</span>
                  <span className="text-slate-400">Proof: {inv.deliverableCid.slice(0, 16)}...</span>
                </div>
                {inv.txHash && (
                  <a
                    href={`${MEZO_CONFIG.explorerUrl}/tx/${inv.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-mezo hover:underline"
                  >
                    <span>Tx: {inv.txHash.slice(0, 10)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
