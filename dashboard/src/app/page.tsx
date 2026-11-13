"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Terminal,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Sparkles,
  Cpu,
  Layers,
  Lock,
  RefreshCw,
  FileSpreadsheet,
  Bell,
  Play,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Zap,
  Coins,
  Scale,
  GitBranch,
  Bot,
} from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";
import { DeveloperQuickstartModal } from "@/components/DeveloperQuickstartModal";
import { SecurityAuditModal } from "@/components/SecurityAuditModal";

export default function LandingPage() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [isSdkModalOpen, setIsSdkModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<"ts" | "langchain" | "eliza" | "curl">("ts");

  // Hero Live Interactive Simulation State
  const [simStep, setSimStep] = useState<"idle" | "spending" | "blocked" | "queued">("idle");
  const [simSpendAmount, setSimSpendAmount] = useState(0.25);
  const [simTotalSpent, setSimTotalSpent] = useState(2.5);
  const simHourlyLimit = 15.0;

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("npm install mezo-agent-sdk viem");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const runSimulation = (type: "valid" | "attack" | "threshold") => {
    if (type === "valid") {
      setSimStep("spending");
      setSimSpendAmount(0.25);
      setTimeout(() => {
        setSimTotalSpent((prev) => Math.min(simHourlyLimit, prev + 0.25));
      }, 300);
    } else if (type === "attack") {
      setSimStep("blocked");
      setSimSpendAmount(100.0);
    } else if (type === "threshold") {
      setSimStep("queued");
      setSimSpendAmount(15.0);
    }
  };

  const codeSnippets = {
    ts: `import { MezoAgentClient, MEZO_TESTNET } from "mezo-agent-sdk";

// Initialize client with agent's scoped session key
const agent = new MezoAgentClient({
  accountAddress: "${MEZO_CONFIG.accountAddress}",
  sessionPrivateKey: process.env.AGENT_SESSION_PRIVATE_KEY!,
  network: MEZO_TESTNET,
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

    langchain: `import { MezoAgentClient } from "mezo-agent-sdk";
import { createMezoPaymentTool } from "mezo-agent-sdk/langchain";
import { ChatOpenAI } from "@langchain/openai";

const client = new MezoAgentClient({ ... });
const mezoTool = createMezoPaymentTool(client);

// Give the tool to your autonomous LangChain agent
const tools = [mezoTool];
const model = new ChatOpenAI({ modelName: "gpt-4o" });
// Agent now autonomously spends within hard session key caps!`,

    eliza: `import { createElizaMezoAction } from "mezo-agent-sdk/eliza";
import { MezoAgentClient } from "mezo-agent-sdk";

export const mezoPlugin = {
  name: "mezo-agent-plugin",
  description: "Spend MUSD safely on Mezo Bitcoin Layer",
  actions: [
    createElizaMezoAction(new MezoAgentClient({ ... }))
  ],
};`,

    curl: `# Query remaining hourly budget directly via Mezo RPC
curl -X POST https://rpc.test.mezo.org \\
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
    <div className="min-h-screen flex flex-col bg-[#07080E] text-slate-100 font-sans selection:bg-mezo/30 selection:text-orange-200">
      {/* 1. FLOATING NAVIGATION BAR */}
      <header className="border-b border-surface-border/80 bg-[#07080E]/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-mezo via-orange-500 to-mezo flex items-center justify-center shadow-lg shadow-mezo/25 ring-1 ring-orange-400/40 shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">MezoAgent</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-mezo/15 text-mezo border border-mezo/30 font-bold uppercase tracking-wider">
                  Autonomous OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI Agent Treasury on Bitcoin
              </p>
            </div>
          </Link>

          {/* Navigation Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#architecture" className="hover:text-mezo transition-colors">
              Architecture
            </a>
            <a href="#sliding-window" className="hover:text-mezo transition-colors">
              Sliding Window
            </a>
            <a href="#human-in-the-loop" className="hover:text-mezo transition-colors">
              Approvals Queue
            </a>
            <a href="#sdk" className="hover:text-mezo transition-colors">
              SDK & Tooling
            </a>
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Formal Security</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mezo Testnet Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 text-[11px]">Mezo 31611</span>
            </div>

            {/* SDK Modal Trigger */}
            <button
              onClick={() => setIsSdkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-mezo" />
              <span className="hidden md:inline">SDK</span>
            </button>

            {/* Primary Action: Launch Cockpit */}
            <Link
              href="/app"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-mezo to-orange-500 text-black font-extrabold text-xs shadow-lg shadow-mezo/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Launch Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient Gradient Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-mezo/20 via-orange-500/10 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

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
            <span className="text-slate-400 font-mono text-[11px]">$7,000 Track</span>
          </motion.div>

          {/* Master Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
          >
            Autonomous AI Agents Need Capital to Act.{" "}
            <span className="block mt-2 bg-gradient-to-r from-mezo via-amber-300 to-orange-400 bg-clip-text text-transparent">
              Giving Them Master Keys is Unacceptable.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            MezoAgent is the programmable treasury layer for autonomous AI agents on Mezo's Bitcoin economic layer.
            Empower agents with scoped, ephemeral session keys bounded by mathematical 12-bucket sliding-window velocity
            envelopes, selector-level permissions, and human-in-the-loop approvals.
          </motion.p>

          {/* Primary Action Buttons & Install Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-3"
          >
            <Link
              href="/app"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-mezo to-orange-500 text-black font-extrabold text-sm shadow-xl shadow-mezo/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Launch Live Cockpit</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            {/* 1-Click Copy Install */}
            <div
              onClick={handleCopyInstall}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-500 cursor-pointer text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm group"
            >
              <Terminal className="w-3.5 h-3.5 text-mezo" />
              <span>npm install mezo-agent-sdk viem</span>
              <div className="p-1 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors ml-1">
                {copiedInstall ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                )}
              </div>
            </div>

            {/* Direct npm package link */}
            <a
              href="https://www.npmjs.com/package/mezo-agent-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white transition-colors shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>npm v1.0.2</span>
              <ExternalLink className="w-3 h-3 text-slate-500 ml-0.5" />
            </a>
          </motion.div>

          {/* 3. HERO LIVE INTERACTIVE SIMULATION SANDBOX CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="pt-8 max-w-3xl mx-auto"
          >
            <div className="rounded-3xl bg-surface-card/90 border border-surface-border p-6 shadow-2xl backdrop-blur-md relative overflow-hidden text-left space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-mezo/15 text-mezo border border-mezo/30">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Interactive Session Key Engine Preview</h3>
                    <p className="text-[11px] text-slate-400">Test how the 12-bucket sliding window defends against attacks</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">Sliding Window:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-surface-light border border-surface-border text-emerald-400 font-bold text-[11px]">
                    ${simTotalSpent.toFixed(2)} / ${simHourlyLimit}.00 MUSD
                  </span>
                </div>
              </div>

              {/* Progress Envelope Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>1-Hour Rolling Spend Envelope (12 x 300s Buckets)</span>
                  <span>{((simTotalSpent / simHourlyLimit) * 100).toFixed(0)}% Utilized</span>
                </div>
                <div className="h-2.5 w-full bg-surface-light rounded-full overflow-hidden p-0.5 border border-surface-border">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-mezo rounded-full"
                    animate={{ width: `${Math.min(100, (simTotalSpent / simHourlyLimit) * 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Interactive Simulation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  onClick={() => runSimulation("valid")}
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 hover:bg-emerald-950/60 transition-all text-left group"
                >
                  <div>
                    <span className="block text-[11px] font-bold text-emerald-400">Valid Micro-Payment</span>
                    <span className="block text-[10px] text-slate-400">$0.25 LLM Search API</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => runSimulation("attack")}
                  className="flex items-center justify-between p-3 rounded-2xl bg-red-950/30 border border-red-500/40 hover:bg-red-950/60 transition-all text-left group"
                >
                  <div>
                    <span className="block text-[11px] font-bold text-red-400">Prompt Injection</span>
                    <span className="block text-[10px] text-slate-400">Simulate $100 Drain</span>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => runSimulation("threshold")}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 hover:bg-amber-950/60 transition-all text-left group"
                >
                  <div>
                    <span className="block text-[11px] font-bold text-amber-400">Threshold Trigger</span>
                    <span className="block text-[10px] text-slate-400">$15.00 GPU Cluster Lease</span>
                  </div>
                  <ShieldAlert className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Reactive Simulation Telemetry Feed */}
              <div className="p-3.5 rounded-2xl bg-[#04060A] border border-surface-border text-xs font-mono space-y-1">
                {simStep === "idle" && (
                  <p className="text-slate-500">
                    &gt; Engine standby. Click any button above to test on-chain verification.
                  </p>
                )}
                {simStep === "spending" && (
                  <p className="text-emerald-400">
                    &gt; [SUCCESS] $0.25 MUSD authorized. Disbursed to 0x1a2b... within rolling window. Next bucket in 240s.
                  </p>
                )}
                {simStep === "blocked" && (
                  <p className="text-red-400 font-bold">
                    &gt; [ON-CHAIN REVERT] HourlyLimitExceeded: Attempted $100.00 exceeds envelope. Zero outflow. Agent key isolated.
                  </p>
                )}
                {simStep === "queued" && (
                  <p className="text-amber-400 font-bold">
                    &gt; [QUEUED FOR HUMAN APPROVAL] Spend $15.00 &gt; $10.00 micro-threshold. Routed to Safe multisig queue.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. METRIC TRUST TICKER */}
      <section className="border-y border-surface-border/80 bg-surface/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3">
              <span className="block text-2xl font-extrabold text-white font-mono">31611</span>
              <span className="text-xs text-slate-400 font-medium">Mezo Testnet Chain ID</span>
            </div>
            <div className="p-3">
              <span className="block text-2xl font-extrabold text-emerald-400 font-mono">25 / 25</span>
              <span className="text-xs text-slate-400 font-medium">Foundry Tests Passing</span>
            </div>
            <div className="p-3">
              <span className="block text-2xl font-extrabold text-cyan-400 font-mono">128,000</span>
              <span className="text-xs text-slate-400 font-medium">Invariant Fuzz Runs</span>
            </div>
            <div className="p-3">
              <span className="block text-2xl font-extrabold text-mezo font-mono">v1.0.2</span>
              <span className="text-xs text-slate-400 font-medium">npm Published SDK</span>
            </div>
            <div className="p-3 col-span-2 md:col-span-1">
              <span className="block text-2xl font-extrabold text-amber-300 font-mono">BTC + MUSD</span>
              <span className="text-xs text-slate-400 font-medium">Bitcoin Gas & Stablecoin</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE PROBLEM VS THE SOLUTION CHAPTER */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold text-mezo uppercase tracking-wider">
            THE ARCHITECTURAL SHIFT
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Autonomous Agents Fail Without On-Chain Guardrails
          </h2>
          <p className="text-sm text-slate-400">
            Current Web3 tooling assumes human confirmation on every signature. Giving an autonomous agent raw keys
            exposes your entire treasury to catastrophic prompt-injection and loop drain vulnerabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bad: Raw Keys */}
          <div className="rounded-3xl bg-red-950/10 border border-red-500/20 p-8 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">The Danger: Raw Keys in .env</h3>
              <p className="text-xs text-slate-400 mt-1">What most AI agent frameworks use today</p>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Single Point of Failure:</strong> 1 prompt injection exploit transfers 100% of treasury capital.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>No Velocity Limiting:</strong> Infinite loops drain gas and funds in minutes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Arbitrary Target Exploits:</strong> Agent can invoke <code>approve(attacker, max)</code> on any token.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Zero Governance:</strong> High-value transactions cannot be routed to human review.</span>
              </li>
            </ul>
          </div>

          {/* Good: MezoAgent Smart Accounts */}
          <div className="rounded-3xl bg-emerald-950/10 border border-emerald-500/30 p-8 space-y-5 shadow-lg shadow-emerald-500/5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">The MezoAgent Guardrail</h3>
              <p className="text-xs text-slate-400 mt-1">Institutional smart account policy engine on Mezo</p>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Vault Stays in Cold Storage:</strong> Safe multisig or owner EOA holds custody; agents receive scoped session keys.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>12-Bucket Sliding-Window Spend:</strong> Mathematical velocity enforcement eliminates 59m/61m double spends.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Selector-Level Authorization:</strong> Strict <code>(target, bytes4)</code> whitelist blocks rogue token approvals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Human-in-the-Loop Thresholds:</strong> Micro-spends execute instantly; high-value calls route to approval queue.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. FEATURE BENTO GRID (HIGH-CRAFT INSTITUTIONAL ARCHITECTURE) */}
      <section id="sliding-window" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold text-mezo uppercase tracking-wider">
            CORE PLATFORM PRIMITIVES
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Mathematical Correctness
          </h2>
          <p className="text-sm text-slate-400">
            Every security invariant is enforced at the smart contract level on Mezo EVM, proven by 128,000 stateful invariant runs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento 1: 12-Bucket Sliding Window */}
          <div className="md:col-span-2 rounded-3xl bg-surface-card border border-surface-border p-7 space-y-4 relative overflow-hidden group hover:border-slate-500 transition-colors">
            <div className="p-3 rounded-2xl bg-mezo/10 text-mezo w-fit border border-mezo/25">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">12-Bucket Sliding-Window Velocity Envelope</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Naive time windows reset every hour, allowing agents to spend 100% at 0:59 and 100% at 1:01 (200% double-spend).
                MezoAgent slices each hour into 12 circular 300-second sub-buckets. Spending velocity is continuously bounded across any 60-minute window.
              </p>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold border transition-colors ${
                    i < 4
                      ? "bg-mezo/20 border-mezo/50 text-mezo"
                      : "bg-surface-light border-surface-border text-slate-500"
                  }`}
                >
                  <span>{i * 5}m</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bento 2: Human-in-the-Loop Queue */}
          <div id="human-in-the-loop" className="rounded-3xl bg-surface-card border border-surface-border p-7 space-y-4 hover:border-slate-500 transition-colors">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/25">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Human-in-the-Loop Thresholds</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Autonomous micro-payments under $10 MUSD disburse instantly with zero latency. Allocations above the threshold route to an on-chain queue for multi-party human sign-off.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-surface-light border border-surface-border text-[11px] font-mono text-slate-300">
              <div className="flex justify-between pb-1 border-b border-surface-border">
                <span>Threshold:</span>
                <span className="text-amber-400 font-bold">$10.00 MUSD</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>High-Value Flow:</span>
                <span className="text-emerald-400 font-bold">Safe Multisig Approval</span>
              </div>
            </div>
          </div>

          {/* Bento 3: Granular Selector Allowlist */}
          <div className="rounded-3xl bg-surface-card border border-surface-border p-7 space-y-4 hover:border-slate-500 transition-colors">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/25">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Granular Function Filtering</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Session keys are bound to explicit <code>(target, bytes4 selector)</code> tuples. Rogue <code>approve()</code> calls on token contracts are blocked on-chain.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-light font-mono text-[11px] text-cyan-300">
              0xa9059cbb → transfer() Allowed<br />
              0x095ea7b3 → approve() BLOCKED
            </div>
          </div>

          {/* Bento 4: EIP-1271 Safe Multisig Native */}
          <div className="rounded-3xl bg-surface-card border border-surface-border p-7 space-y-4 hover:border-slate-500 transition-colors">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">EIP-1271 Safe Multisig Native</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Full contract wallet compatibility. DAOs, Gnosis Safe, and institutional multisig treasuries can hold ownership over agent accounts directly.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-light font-mono text-[11px] text-emerald-300">
              IERC1271.isValidSignature() Supported
            </div>
          </div>

          {/* Bento 5: Bitcoin Native Gas & Yield */}
          <div className="rounded-3xl bg-surface-card border border-surface-border p-7 space-y-4 hover:border-slate-500 transition-colors">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 w-fit border border-orange-500/25">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Bitcoin Native Gas & Yield</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Natively built for Mezo. Accounts hold MUSD reserves and pay gas in native Bitcoin (Satoshis), with automated idle yield stacking.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-light font-mono text-[11px] text-orange-300">
              Mezo Testnet (31611) • MUSD Stablecoin
            </div>
          </div>

          {/* Bento 6: Self-Funding Endowment Vault (Differentiator 1) */}
          <div className="rounded-3xl bg-surface-card border border-amber-500/30 p-7 space-y-4 hover:border-amber-400/60 transition-colors shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-mezo w-fit border border-amber-500/25">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-mezo border border-amber-500/40 font-bold">
                8.4% APY Yield
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Self-Funding Endowment Mode</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Lock principal capital into cold custody. The agent's 12-bucket sliding window envelope strictly draws from <strong>accrued Bitcoin staking yield</strong>. Perpetual operation with 0% risk to principal.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-light font-mono text-[11px] text-amber-300">
              ΔPrincipal == 0 • Safe Cold Storage
            </div>
          </div>

          {/* Bento 7: Autonomous Multi-Agent Invoicing (Differentiator 3) */}
          <div className="rounded-3xl bg-surface-card border border-purple-500/30 p-7 space-y-4 hover:border-purple-400/60 transition-colors shadow-lg shadow-purple-500/5">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit border border-purple-500/25">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold">
                EIP-712 Invoices
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Agent-to-Agent (A2A) Settlement</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Autonomous machine-to-machine coordination. Worker agents emit cryptographic invoices with IPFS proofs; orchestrator session keys verify deliverables and disburse sub-cent MUSD.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-light font-mono text-[11px] text-purple-300">
              Zero-Human P2P Micro-Payments on Bitcoin
            </div>
          </div>
        </div>
      </section>

      {/* 7. DEVELOPER SDK SECTION */}
      <section id="sdk" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-mezo uppercase tracking-wider">
              DEVELOPER INFRASTRUCTURE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Plug-and-Play AI Agent SDK
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Integrate budget-controlled execution into LangChain, ElizaOS, or standalone Node bots in 3 lines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.npmjs.com/package/mezo-agent-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>View on npm</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
            <a
              href="https://github.com/ayushsaklani-min/mezo-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Code Container */}
        <div className="rounded-3xl bg-[#04060A] border border-surface-border p-6 shadow-2xl relative overflow-hidden">
          {/* Code Tabs */}
          <div className="flex items-center gap-2 pb-4 border-b border-surface-border">
            {(["ts", "langchain", "eliza", "curl"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCodeTab === tab
                    ? "bg-mezo text-black shadow-md shadow-mezo/20"
                    : "bg-surface-card text-slate-400 hover:text-white hover:bg-surface-light"
                }`}
              >
                {tab === "ts" && "TypeScript SDK"}
                {tab === "langchain" && "LangChain Tool"}
                {tab === "eliza" && "ElizaOS Action"}
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

      {/* 8. CALL TO ACTION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-surface-card via-surface-card to-surface-light border border-surface-border p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-mezo/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-mono font-bold text-mezo uppercase tracking-wider">
              READY FOR PRODUCTION
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Give Your AI Agents Autonomous Capital on Bitcoin.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Launch the live interactive cockpit now to mint ephemeral session keys, bridge testnet liquidity,
              and watch rate limits protect your funds in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pt-2">
            <Link
              href="/app"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-mezo to-orange-500 text-black font-extrabold text-sm shadow-xl shadow-mezo/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Launch Live Cockpit</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Inspect Formal Invariants</span>
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

      {/* 9. FOOTER */}
      <footer className="border-t border-surface-border bg-surface/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-mezo/20 border border-mezo/40 flex items-center justify-center text-mezo">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm">MezoAgent</span>
              <p className="text-[11px] text-slate-400">Budget-Controlled AI Agent Smart Accounts on Bitcoin</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <a
              href="https://dashboard-iota-blue-90.vercel.app"
              className="hover:text-mezo transition-colors"
            >
              Live App
            </a>
            <span>•</span>
            <a
              href="https://www.npmjs.com/package/mezo-agent-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-mezo transition-colors"
            >
              npm SDK
            </a>
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
              Mezo Explorer
            </a>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
