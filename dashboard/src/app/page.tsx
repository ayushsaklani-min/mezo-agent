"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Coins,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";
import { DeveloperQuickstartModal } from "@/components/DeveloperQuickstartModal";
import { SecurityAuditModal } from "@/components/SecurityAuditModal";

export default function LandingPage() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [isSdkModalOpen, setIsSdkModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<"ts" | "langchain" | "curl">("ts");

  // Hero Live Interactive Simulation State
  const [simStep, setSimStep] = useState<"idle" | "spending" | "blocked" | "queued">("idle");
  const [simTotalSpent, setSimTotalSpent] = useState(2.5);
  const simHourlyLimit = 15.0;

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("npm install bitagent-sdk viem");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const runSimulation = (type: "valid" | "attack" | "threshold") => {
    if (type === "valid") {
      setSimStep("spending");
      setTimeout(() => {
        setSimTotalSpent((prev) => Math.min(simHourlyLimit, prev + 0.25));
      }, 300);
    } else if (type === "attack") {
      setSimStep("blocked");
    } else if (type === "threshold") {
      setSimStep("queued");
    }
  };

  const codeSnippets = {
    ts: `import { AgentClient, BITCOIN_L2 } from "bitagent-sdk";

// Initialize client with agent's scoped session key
const agent = new AgentClient({
  accountAddress: "${MEZO_CONFIG.accountAddress}",
  sessionPrivateKey: process.env.AGENT_SESSION_PRIVATE_KEY!,
  network: BITCOIN_L2,
});

// Check remaining hourly allowance in MUSD
const budget = await agent.getRemainingHourlyBudget();
console.log(\`Remaining MUSD: \${budget}\`);

// Autonomously pay for an API query
const receipt = await agent.payService({
  recipient: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  amountInMUSD: "0.25",
  memo: "LLM Web Search Oracle Query",
});

console.log(\`Paid! Tx: \${receipt.txHash}\`);`,

    langchain: `import { AgentClient } from "bitagent-sdk";
import { createAgentPaymentTool } from "bitagent-sdk/langchain";
import { ChatOpenAI } from "@langchain/openai";

const client = new AgentClient({ ... });
const paymentTool = createAgentPaymentTool(client);

// Give the tool to your autonomous LangChain agent
const tools = [paymentTool];
const model = new ChatOpenAI({ modelName: "gpt-4o" });
// Agent now autonomously spends within hard session key caps!`,

    curl: `# Query remaining hourly budget directly via Bitcoin L2 RPC
curl -X POST https://rpc.testnet.bitcoin-l2.org \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_call",
    "params":[{
      "to":"${MEZO_CONFIG.accountAddress}",
      "data":"0x789b91e900000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8"
    }, "latest"],
    "id":1
  }'`,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090D] text-slate-100 font-sans selection:bg-mezo selection:text-black">
      {/* 1. NEO-BRUTALIST TOP NAVIGATION */}
      <header className="border-b-2 border-black bg-[#0E1119] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-mezo border-2 border-black flex items-center justify-center shadow-brutal group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal-lg transition-all shrink-0">
              <Shield className="w-5 h-5 text-black stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">BitAgent</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400 text-black border-2 border-black font-black uppercase shadow-brutal-sm">
                  AgentOS
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
                AI Agent Treasury on Bitcoin L2
              </p>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-bold text-slate-300">
            <a href="#simulator" className="hover:text-mezo transition-colors">
              Live Simulator
            </a>
            <a href="#superpowers" className="hover:text-mezo transition-colors">
              Superpowers
            </a>
            <a href="#sdk" className="hover:text-mezo transition-colors">
              Developer SDK
            </a>
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Formal Security</span>
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* L2 Testnet Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-400 text-black border-2 border-black font-mono font-black text-xs shadow-brutal-sm">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span>BTC L2 #31611</span>
            </div>

            {/* SDK Trigger */}
            <button
              onClick={() => setIsSdkModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border-2 border-black text-xs font-bold text-slate-200 hover:text-white shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <Code2 className="w-3.5 h-3.5 text-mezo" />
              <span>SDK Docs</span>
            </button>

            {/* Primary Action Button */}
            <Link
              href="/app"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-mezo text-black font-black text-xs border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <span>LAUNCH COCKPIT</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          {/* Tag Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-400 text-black border-2 border-black font-black text-xs shadow-brutal"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>AUTONOMOUS AGENT TREASURY • BITCOIN L2</span>
          </motion.div>

          {/* Master Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]"
          >
            Autonomous AI Agents.{" "}
            <span className="block mt-2 text-mezo underline decoration-black decoration-4">
              Yield-Funded Execution.
            </span>
            <span className="block mt-1 text-slate-100">
              Zero Principal Risk.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            The institutional execution and treasury management OS on Bitcoin L2.
            Grant agents ephemeral scoped session keys, automatic circuit breakers, and 
            operational gas funded 100% by native 8.4% APY Bitcoin staking yield.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link
              href="/app"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-mezo text-black font-black text-sm border-2 border-black shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <span>ENTER AGENT COCKPIT</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>

            {/* 1-Click Copy Install */}
            <div
              onClick={handleCopyInstall}
              className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl bg-[#121622] text-slate-200 border-2 border-black font-mono text-xs font-bold shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer transition-all group"
            >
              <Terminal className="w-4 h-4 text-mezo" />
              <span>npm i bitagent-sdk viem</span>
              <div className="p-1 rounded-md bg-white/10 group-hover:bg-white/20 transition-colors ml-1">
                {copiedInstall ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                )}
              </div>
            </div>

            {/* Explorer Link */}
            <a
              href={`${MEZO_CONFIG.explorerUrl}/address/${MEZO_CONFIG.accountAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-surface-card text-slate-300 border-2 border-black text-xs font-bold shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <span>Block Explorer</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </motion.div>

          {/* 3. HERO LIVE INTERACTIVE SIMULATION SANDBOX */}
          <motion.div
            id="simulator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="pt-6 max-w-3xl mx-auto"
          >
            <div className="rounded-2xl bg-[#0E121D] border-2 border-black p-6 shadow-brutal-lg text-left space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-400 text-black border-2 border-black shadow-brutal-sm">
                    <Terminal className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Live On-Chain Policy Simulator</h3>
                    <p className="text-[11px] font-mono text-slate-400">Test autonomous execution guardrails in real time</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">Rolling Envelope:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-light border-2 border-black text-emerald-400 font-black text-[11px] shadow-brutal-sm">
                    ${simTotalSpent.toFixed(2)} / ${simHourlyLimit}.00 MUSD
                  </span>
                </div>
              </div>

              {/* Progress Envelope Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                  <span>1-Hour Rolling Spend Envelope (12 x 300s Buckets)</span>
                  <span className="text-white">{((simTotalSpent / simHourlyLimit) * 100).toFixed(0)}% Utilized</span>
                </div>
                <div className="h-3 w-full bg-[#05060A] rounded-lg overflow-hidden p-0.5 border-2 border-black shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-mezo rounded-md"
                    animate={{ width: `${Math.min(100, (simTotalSpent / simHourlyLimit) * 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Interactive Simulation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  onClick={() => runSimulation("valid")}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/80 hover:bg-emerald-900/50 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all text-left group"
                >
                  <div>
                    <span className="block text-xs font-black text-emerald-400">1. Micro-Payment</span>
                    <span className="block text-[10px] font-mono text-slate-300">$0.25 LLM Query</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => runSimulation("attack")}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-950/40 border-2 border-red-500/80 hover:bg-red-900/50 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all text-left group"
                >
                  <div>
                    <span className="block text-xs font-black text-red-400">2. Prompt Injection</span>
                    <span className="block text-[10px] font-mono text-slate-300">$100 Drain Attempt</span>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => runSimulation("threshold")}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-950/40 border-2 border-amber-500/80 hover:bg-amber-900/50 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all text-left group"
                >
                  <div>
                    <span className="block text-xs font-black text-amber-400">3. Multisig Queue</span>
                    <span className="block text-[10px] font-mono text-slate-300">$15.00 GPU Cluster</span>
                  </div>
                  <ShieldAlert className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Console Feedback */}
              <div className="p-3.5 rounded-xl bg-[#05060A] border-2 border-black text-xs font-mono space-y-1 shadow-inner">
                {simStep === "idle" && (
                  <p className="text-slate-500">
                    &gt; Simulator ready. Click any action button above to test on-chain verification.
                  </p>
                )}
                {simStep === "spending" && (
                  <p className="text-emerald-400 font-bold">
                    &gt; [SUCCESS] $0.25 MUSD authorized. Disbursed instantly within rolling window. Tx verified on-chain.
                  </p>
                )}
                {simStep === "blocked" && (
                  <p className="text-red-400 font-black">
                    &gt; [CIRCUIT BREAKER TRIPPED] $100.00 exceeds $15.00 envelope. Zero outflow. Agent key quarantined!
                  </p>
                )}
                {simStep === "queued" && (
                  <p className="text-amber-400 font-black">
                    &gt; [ROUTED TO HUMAN MULTISIG] Spend $15.00 &gt; $10.00 micro-cap. Placed into on-chain approvals queue.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. NEO-BRUTALIST METRIC RIBBON */}
      <section className="border-y-2 border-black bg-[#0C0F17] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#121622] border-2 border-black shadow-brutal-sm">
              <span className="block text-2xl font-black text-white font-mono">31611</span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">Bitcoin L2 Chain</span>
            </div>
            <div className="p-3 rounded-xl bg-[#121622] border-2 border-black shadow-brutal-sm">
              <span className="block text-2xl font-black text-emerald-400 font-mono">8.4% APY</span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">Native Bitcoin Staking</span>
            </div>
            <div className="p-3 rounded-xl bg-[#121622] border-2 border-black shadow-brutal-sm">
              <span className="block text-2xl font-black text-amber-400 font-mono">0% RISK</span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">Cold Principal Locked</span>
            </div>
            <div className="p-3 rounded-xl bg-[#121622] border-2 border-black shadow-brutal-sm">
              <span className="block text-2xl font-black text-cyan-400 font-mono">25 / 25</span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">Invariant Fuzz Passes</span>
            </div>
            <div className="p-3 rounded-xl bg-[#121622] border-2 border-black shadow-brutal-sm col-span-2 md:col-span-1">
              <span className="block text-2xl font-black text-purple-400 font-mono">EIP-712</span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">A2A Micro-Settlement</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE 3 CORE SUPERPOWERS (PRODUCT FEATURES) */}
      <section id="superpowers" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-mezo text-black border-2 border-black font-mono font-black text-xs shadow-brutal-sm">
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>BUILT DIFFERENT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            The Three Pillars of BitAgent
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Engineered from first principles for autonomous AI agents operating on Bitcoin's economic layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Superpower 1: Self-Funding Endowment Vault */}
          <div className="rounded-2xl bg-[#0E121E] border-2 border-black p-6 shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-400 text-black border-2 border-black shadow-brutal-sm">
                  <Coins className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border-2 border-black font-black">
                  8.4% APY
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Self-Funding Endowment Vault</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Lock base capital in cold custody. Your autonomous agents draw gas and API payment allowances purely from accrued Bitcoin staking yield. If an agent loops, zero principal is touched.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#05060A] border-2 border-black font-mono text-[11px] text-amber-400">
              <div className="flex justify-between pb-1 border-b border-zinc-800">
                <span>Principal Lock:</span>
                <span className="font-bold text-white">Cold Safe Multisig</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Operational Outflow:</span>
                <span className="font-bold text-emerald-400">100% Staking Yield</span>
              </div>
            </div>
          </div>

          {/* Superpower 2: Auto-Quarantine Circuit Breaker */}
          <div className="rounded-2xl bg-[#0E121E] border-2 border-black p-6 shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-red-400 text-black border-2 border-black shadow-brutal-sm">
                  <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-400/20 text-red-300 border-2 border-black font-black">
                  TRIPWIRE ACTIVE
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Auto-Quarantine Circuit Breaker</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  On-chain rolling velocity envelopes restrict per-transaction and daily limits. If prompt-injected or hallucinating, 3 consecutive reverts immediately quarantine the session key on-chain.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#05060A] border-2 border-black font-mono text-[11px] text-red-400">
              <div className="flex justify-between pb-1 border-b border-zinc-800">
                <span>Revert Threshold:</span>
                <span className="font-bold text-white">3 Consecutive Trips</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Intervention:</span>
                <span className="font-bold text-red-400">Instant On-Chain Isolation</span>
              </div>
            </div>
          </div>

          {/* Superpower 3: Agent-to-Agent (A2A) Micro-Settlement */}
          <div className="rounded-2xl bg-[#0E121E] border-2 border-black p-6 shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-purple-400 text-black border-2 border-black shadow-brutal-sm">
                  <Bot className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-400/20 text-purple-300 border-2 border-black font-black">
                  EIP-712 MUSD
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Agent-to-Agent (A2A) Settlement</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Autonomous peer agents negotiate and bill each other for specialized compute. Invoices are cryptographically signed with EIP-712 and settle in native MUSD without human intervention.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#05060A] border-2 border-black font-mono text-[11px] text-purple-400">
              <div className="flex justify-between pb-1 border-b border-zinc-800">
                <span>Invoice Standard:</span>
                <span className="font-bold text-white">EIP-712 Typed Data</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Settlement Currency:</span>
                <span className="font-bold text-cyan-400">Native MUSD Stablecoin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DEVELOPER SDK SECTION */}
      <section id="sdk" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-400 text-black border-2 border-black font-mono font-black text-xs shadow-brutal-sm">
              <Code2 className="w-3.5 h-3.5" />
              <span>3 LINES OF CODE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              Integrate Budget-Controlled Agents
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Supports TypeScript, LangChain tools, and standard JSON-RPC calls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ayushsaklani-min/mezo-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-card border-2 border-black text-xs font-bold text-slate-200 hover:text-white shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Code Container */}
        <div className="rounded-2xl bg-[#05060A] border-2 border-black p-6 shadow-brutal-lg relative overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-2 pb-4 border-b-2 border-black">
            {(["ts", "langchain", "curl"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border-2 border-black ${
                  activeCodeTab === tab
                    ? "bg-mezo text-black shadow-brutal-sm"
                    : "bg-[#121622] text-slate-400 hover:text-white"
                }`}
              >
                {tab === "ts" && "TypeScript SDK"}
                {tab === "langchain" && "LangChain Agent Tool"}
                {tab === "curl" && "cURL JSON-RPC"}
              </button>
            ))}
          </div>

          {/* Snippet */}
          <pre className="pt-4 text-xs font-mono leading-relaxed text-slate-300 overflow-x-auto">
            <code>{codeSnippets[activeCodeTab]}</code>
          </pre>
        </div>
      </section>

      {/* 7. NEO-BRUTAL CALL TO ACTION BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-mezo border-2 border-black p-8 sm:p-12 text-center text-black relative overflow-hidden shadow-brutal-lg space-y-6">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-mono font-black uppercase tracking-wider px-3 py-1 rounded-md bg-black text-white inline-block">
              ENTERPRISE READY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Test the Autonomous Agent Cockpit on Bitcoin L2.
            </h2>
            <p className="text-sm font-medium text-black/80 leading-relaxed max-w-xl mx-auto">
              Launch the live command center to issue scoped session keys, trigger circuit breakers, 
              and inspect real-time staking yield streaming on Bitcoin L2.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pt-2">
            <Link
              href="/app"
              className="flex items-center gap-2 px-6 py-4 rounded-xl bg-black text-white font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_#FFFFFF] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#FFFFFF] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <span>LAUNCH LIVE COCKPIT NOW</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center gap-2 px-5 py-4 rounded-xl bg-white text-black font-black text-xs border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>INSPECT FORMAL INVARIANTS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <DeveloperQuickstartModal
        isOpen={isSdkModalOpen}
        onClose={() => setIsSdkModalOpen(false)}
      />

      <SecurityAuditModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* 8. NEO-BRUTALIST FOOTER */}
      <footer className="border-t-2 border-black bg-[#0A0D15] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-mezo border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
              <Shield className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <span className="font-black text-white text-sm">BitAgent</span>
              <p className="text-[11px] font-mono text-slate-400">Autonomous Execution Layer on Bitcoin L2</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold">
            <Link href="/app" className="hover:text-mezo transition-colors">
              Cockpit App
            </Link>
            <span>•</span>
            <a
              href="https://github.com/ayushsaklani-min/mezo-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-mezo transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href={`${MEZO_CONFIG.explorerUrl}/address/${MEZO_CONFIG.accountAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-mezo transition-colors"
            >
              Block Explorer (31611)
            </a>
            <span>•</span>
            <span className="text-slate-500">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
