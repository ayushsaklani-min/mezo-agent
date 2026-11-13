"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Lock,
  RefreshCw,
  Coins,
  Scale,
  Sparkles,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
} from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";
import { DeveloperQuickstartModal } from "@/components/DeveloperQuickstartModal";
import { SecurityAuditModal } from "@/components/SecurityAuditModal";

export default function LandingPage() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
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

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
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

  const colorSwatches = [
    { name: "Bubblegum Pink", hex: "#FE9CE8", bgClass: "bg-[#FE9CE8]" },
    { name: "Sky Cyan", hex: "#C0F7FE", bgClass: "bg-[#C0F7FE]" },
    { name: "Lime Mint", hex: "#99E885", bgClass: "bg-[#99E885]" },
    { name: "Mezo Gold", hex: "#F7CB46", bgClass: "bg-[#F7CB46]" },
    { name: "Warm Peach", hex: "#FFDC9B", bgClass: "bg-[#FFDC9B]" },
    { name: "Pitch Black", hex: "#000000", bgClass: "bg-[#000000]" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8] text-black font-sans selection:bg-[#F7CB46] selection:text-black">
      {/* 1. FLOATING NAVIGATION BAR */}
      <header className="border-b-[3px] border-black bg-white sticky top-0 z-40 shadow-brutal-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-[#F7CB46] border-[2.5px] border-black flex items-center justify-center shadow-brutal-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
              <Shield className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-black">MezoAgent</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#99E885] text-black border border-black font-black uppercase tracking-wider shadow-brutal-sm">
                  Autonomous OS
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-700 hidden sm:block">
                AI Agent Treasury on Bitcoin L2
              </p>
            </div>
          </Link>

          {/* Navigation Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-black text-black">
            <a href="#concept" className="hover:text-amber-600 transition-colors uppercase tracking-wider">
              Concept
            </a>
            <a href="#palette" className="hover:text-amber-600 transition-colors uppercase tracking-wider">
              Colors
            </a>
            <a href="#architecture" className="hover:text-amber-600 transition-colors uppercase tracking-wider">
              Architecture
            </a>
            <a href="#sliding-window" className="hover:text-amber-600 transition-colors uppercase tracking-wider">
              Sliding Window
            </a>
            <a href="#sdk" className="hover:text-amber-600 transition-colors uppercase tracking-wider">
              SDK & Tooling
            </a>
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[#99E885] border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1 font-black text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>Security Proofs</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mezo Testnet Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFDF8] border-2 border-black text-xs font-mono font-black shadow-brutal-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#99E885] border border-black inline-block animate-pulse"></span>
              <span className="text-black text-[11px]">MEZO 31611</span>
            </div>

            {/* SDK Modal Trigger */}
            <button
              onClick={() => setIsSdkModalOpen(true)}
              className="neo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-black text-xs font-black text-black shadow-brutal-sm hover:bg-[#C0F7FE]"
            >
              <Code2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span className="hidden md:inline">SDK Docs</span>
            </button>

            {/* Primary Action: Launch Cockpit */}
            <Link
              href="/app"
              className="neo-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F7CB46] text-black font-black text-xs border-2 border-black shadow-brutal hover:bg-[#eec038]"
            >
              <span>Launch Cockpit</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION - NEO-BRUTALISM MASTERPIECE (MATCHING USER REFERENCE) */}
      <section id="concept" className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Top meta label as seen in reference */}
        <div className="flex justify-between items-center mb-4 text-xs font-mono font-black text-black uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-black inline-block"></span>
            AKINDO BUILDATHON // TRACK $7,000
          </span>
          <span className="hidden sm:inline-block">BITCOIN ECONOMIC LAYER // MUSD & MEZO</span>
        </div>

        {/* Master Wireframe Box (direct match to reference with 8 anchor points) */}
        <div className="neo-wireframe bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-brutal-xl relative overflow-visible">
          {/* Top Row: Concept Badge & Grid Accent */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Concept Pill Badge with bracket accents from reference */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF8] border-2 border-black shadow-brutal-sm font-black text-xs uppercase tracking-wider text-black">
                <span className="w-1.5 h-3 bg-black inline-block rounded-xs"></span>
                <span>CONCEPT</span>
                <span className="w-1.5 h-3 bg-black inline-block rounded-xs"></span>
              </div>
              <span className="text-xs font-mono font-black uppercase text-gray-700 tracking-wider">
                UX / UI DESIGN • PROVABLE TREASURY
              </span>
            </div>

            {/* Mini Figma / Grid decorative block as seen in top right of reference */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="relative">
                {/* Back pink card */}
                <div className="w-10 h-10 rounded-xl bg-[#FE9CE8] border-2 border-black shadow-brutal-sm absolute -top-1.5 -left-1.5 rotate-[-6deg]" />
                {/* Front yellow card */}
                <div className="w-10 h-10 rounded-xl bg-[#F7CB46] border-2 border-black shadow-brutal-sm relative flex items-center justify-center font-black text-xs">
                  ⚡
                </div>
              </div>
            </div>
          </div>

          {/* Main Title & Geometric Slicing Accent */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-black tracking-tight leading-[1.0] uppercase">
                NEO-
                <br />
                BRUTALISM
                <br />
                <span className="bg-[#F7CB46] px-2 py-0.5 border-2 border-black inline-block shadow-brutal-sm mt-1">
                  AI TREASURY
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg font-bold text-gray-800 max-w-2xl leading-relaxed pt-2">
                Autonomous AI agents need capital to execute API queries, hire subagents, and transact.
                Giving them raw master keys is unacceptable. MezoAgent enforces scoped session keys bounded by
                12-bucket sliding-window velocity envelopes on Bitcoin L2.
              </p>

              {/* CTAs and 1-Click Install */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link
                  href="/app"
                  className="neo-btn flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F7CB46] border-[2.5px] border-black text-black font-black text-sm shadow-brutal hover:bg-[#eec038]"
                >
                  <span>Launch Live Cockpit</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>

                {/* 1-Click Copy Install */}
                <div
                  onClick={handleCopyInstall}
                  className="neo-btn flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border-2 border-black cursor-pointer text-xs font-mono font-black text-black shadow-brutal hover:bg-[#C0F7FE] transition-all"
                >
                  <Terminal className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>npm install mezo-agent-sdk viem</span>
                  <div className="p-1 rounded-md bg-black text-white ml-1">
                    {copiedInstall ? (
                      <Check className="w-3 h-3 text-[#99E885] stroke-[3]" />
                    ) : (
                      <Copy className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                <a
                  href="https://www.npmjs.com/package/mezo-agent-sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white border-2 border-black text-xs font-black text-black shadow-brutal hover:bg-[#FFDC9B]"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-black" />
                  <span>npm v1.0.2</span>
                  <ExternalLink className="w-3.5 h-3.5 text-black ml-0.5" />
                </a>
              </div>
            </div>

            {/* Geometric Art from reference: Circle with hatching lines + Tilted Sticker Badge */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center relative py-6">
              {/* Star sparkle accent */}
              <div className="absolute top-0 right-4 text-3xl font-black text-black animate-spin" style={{ animationDuration: "12s" }}>
                ✦
              </div>

              {/* Green circle with diagonal hatching lines slicing across (Exact Reference Element!) */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-[#99E885] border-[3px] border-black shadow-brutal-lg flex items-center justify-center overflow-hidden">
                {/* Diagonal stripes /// */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-45deg] scale-125">
                  <div className="w-full flex flex-col gap-2.5">
                    <div className="h-2 bg-black w-full" />
                    <div className="h-2 bg-black w-full" />
                    <div className="h-2 bg-black w-full" />
                  </div>
                </div>
                {/* Inner center badge */}
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-white border-2 border-black shadow-brutal-sm flex flex-col items-center justify-center">
                  <Shield className="w-8 h-8 text-black stroke-[2.5]" />
                  <span className="text-[9px] font-mono font-black mt-0.5">SLIDING</span>
                </div>
              </div>

              {/* Tilted Sticker Badge: "Make an appointment" in ref -> "★ 100% INVARIANT VERIFIED" */}
              <motion.div
                whileHover={{ rotate: 0, scale: 1.05 }}
                className="mt-6 px-4 py-2 rounded-xl bg-[#F7CB46] border-2 border-black shadow-brutal font-black text-xs text-black uppercase tracking-wider rotate-[-5deg] cursor-pointer"
              >
                ★ 100% INVARIANT VERIFIED ★
              </motion.div>
            </div>
          </div>
        </div>

        {/* 3. HERO INTERACTIVE SIMULATION SANDBOX */}
        <div className="mt-8">
          <div className="neo-box-lg bg-white rounded-3xl p-6 sm:p-7 shadow-brutal-lg text-left space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C0F7FE] border-2 border-black flex items-center justify-center shadow-brutal-sm">
                  <Terminal className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-wider">
                    Interactive Session Key Engine Preview
                  </h3>
                  <p className="text-xs font-bold text-gray-700">
                    Test how the 12-bucket sliding window defends against attacks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-black">
                <span className="text-black uppercase">Sliding Window:</span>
                <span className="px-3 py-1 rounded-xl bg-[#99E885] border-2 border-black text-black font-black text-xs shadow-brutal-sm">
                  ${simTotalSpent.toFixed(2)} / ${simHourlyLimit}.00 MUSD
                </span>
              </div>
            </div>

            {/* Progress Envelope Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-black text-black">
                <span>1-Hour Rolling Spend Envelope (12 x 300s Buckets)</span>
                <span>{((simTotalSpent / simHourlyLimit) * 100).toFixed(0)}% Utilized</span>
              </div>
              <div className="h-4 w-full bg-[#FFFDF8] rounded-xl overflow-hidden p-0.5 border-2 border-black shadow-brutal-sm">
                <motion.div
                  className="h-full bg-[#F7CB46] rounded-lg border-r-2 border-black"
                  animate={{ width: `${Math.min(100, (simTotalSpent / simHourlyLimit) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Interactive Simulation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => runSimulation("valid")}
                className="neo-btn flex items-center justify-between p-3.5 rounded-2xl bg-[#99E885] border-2 border-black shadow-brutal hover:bg-[#86dd71] text-left"
              >
                <div>
                  <span className="block text-xs font-black text-black uppercase">Valid Micro-Payment</span>
                  <span className="block text-[11px] font-bold text-gray-800">$0.25 LLM Search API</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-black stroke-[2.5]" />
              </button>

              <button
                onClick={() => runSimulation("attack")}
                className="neo-btn flex items-center justify-between p-3.5 rounded-2xl bg-[#FE9CE8] border-2 border-black shadow-brutal hover:bg-[#f881de] text-left"
              >
                <div>
                  <span className="block text-xs font-black text-black uppercase">Prompt Injection Attack</span>
                  <span className="block text-[11px] font-bold text-gray-800">Simulate $100 Drain</span>
                </div>
                <AlertTriangle className="w-5 h-5 text-black stroke-[2.5]" />
              </button>

              <button
                onClick={() => runSimulation("threshold")}
                className="neo-btn flex items-center justify-between p-3.5 rounded-2xl bg-[#FFDC9B] border-2 border-black shadow-brutal hover:bg-[#f7ce7f] text-left"
              >
                <div>
                  <span className="block text-xs font-black text-black uppercase">Threshold Trigger</span>
                  <span className="block text-[11px] font-bold text-gray-800">$15.00 GPU Cluster Lease</span>
                </div>
                <ShieldAlert className="w-5 h-5 text-black stroke-[2.5]" />
              </button>
            </div>

            {/* Reactive Simulation Telemetry Feed */}
            <div className="p-3.5 rounded-2xl bg-black border-2 border-black text-xs font-mono space-y-1 shadow-brutal-sm">
              {simStep === "idle" && (
                <p className="text-gray-400 font-bold">
                  &gt; Engine standby. Click any button above to test on-chain verification.
                </p>
              )}
              {simStep === "spending" && (
                <p className="text-[#99E885] font-black">
                  &gt; [SUCCESS] $0.25 MUSD authorized. Disbursed to 0x1a2b... within rolling window. Next bucket in 240s.
                </p>
              )}
              {simStep === "blocked" && (
                <p className="text-[#FE9CE8] font-black">
                  &gt; [ON-CHAIN REVERT] HourlyLimitExceeded: Attempted $100.00 exceeds envelope. Zero outflow. Attack thwarted!
                </p>
              )}
              {simStep === "queued" && (
                <p className="text-[#FFDC9B] font-black">
                  &gt; [QUEUED FOR HUMAN APPROVAL] Spend $15.00 &gt; $10.00 micro-threshold. Routed to Safe multisig queue.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEDICATED NEO-BRUTALISM COLOR PALETTE (EXACTLY LIKE THE REFERENCE IMAGE!) */}
      <section id="palette" className="w-full bg-[#C0F7FE] border-y-[3px] border-black py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 text-center">
          {/* Header Pill Badge - direct match to "NEO-BRUTALISM COLORS!" in reference */}
          <div className="inline-block">
            <div className="px-6 py-2 rounded-full bg-white border-2 border-black shadow-brutal font-black text-sm uppercase tracking-widest text-black">
              NEO-BRUTALISM COLORS!
            </div>
          </div>

          <p className="text-xs sm:text-sm font-black text-black uppercase tracking-wider max-w-xl mx-auto">
            Design tokens extracted directly from the reference guide. Click any card to copy its hex code.
          </p>

          {/* 6 Color Swatch Cards (Exact match to reference bottom cards!) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {colorSwatches.map((swatch) => (
              <motion.div
                key={swatch.hex}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ y: 0, scale: 0.98 }}
                onClick={() => handleCopyColor(swatch.hex)}
                className="neo-btn bg-white border-2 border-black rounded-2xl p-2.5 shadow-brutal cursor-pointer flex flex-col items-center"
              >
                {/* Color Block */}
                <div
                  className={`w-full h-24 rounded-xl border-2 border-black ${swatch.bgClass} flex items-center justify-center`}
                >
                  {copiedColor === swatch.hex && (
                    <span className="px-2 py-0.5 bg-white border border-black rounded font-black text-[10px] text-black shadow-brutal-sm">
                      COPIED!
                    </span>
                  )}
                </div>
                {/* Hex Label */}
                <div className="pt-2 text-center">
                  <span className="block font-mono font-black text-xs text-black uppercase">
                    {swatch.hex}
                  </span>
                  <span className="block text-[10px] font-bold text-gray-600">
                    {swatch.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. METRIC TRUST TICKER */}
      <section className="bg-white border-b-[3px] border-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-[#FFFDF8] border-2 border-black rounded-2xl shadow-brutal-sm">
              <span className="block text-2xl font-black text-black font-mono">31611</span>
              <span className="text-xs text-gray-700 font-bold uppercase">Mezo Testnet Chain ID</span>
            </div>
            <div className="p-3 bg-[#99E885] border-2 border-black rounded-2xl shadow-brutal-sm">
              <span className="block text-2xl font-black text-black font-mono">25 / 25</span>
              <span className="text-xs text-black font-bold uppercase">Foundry Tests Passing</span>
            </div>
            <div className="p-3 bg-[#C0F7FE] border-2 border-black rounded-2xl shadow-brutal-sm">
              <span className="block text-2xl font-black text-black font-mono">128,000</span>
              <span className="text-xs text-black font-bold uppercase">Invariant Fuzz Runs</span>
            </div>
            <div className="p-3 bg-[#F7CB46] border-2 border-black rounded-2xl shadow-brutal-sm">
              <span className="block text-2xl font-black text-black font-mono">v1.0.2</span>
              <span className="text-xs text-black font-bold uppercase">npm Published SDK</span>
            </div>
            <div className="p-3 bg-[#FFDC9B] border-2 border-black rounded-2xl shadow-brutal-sm col-span-2 md:col-span-1">
              <span className="block text-2xl font-black text-black font-mono">BTC + MUSD</span>
              <span className="text-xs text-black font-bold uppercase">Bitcoin Gas & Stablecoin</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE PROBLEM VS THE SOLUTION CHAPTER */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 rounded-lg bg-[#F7CB46] border-2 border-black font-mono font-black text-xs uppercase tracking-wider text-black shadow-brutal-sm">
            THE ARCHITECTURAL SHIFT
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight uppercase">
            Why Autonomous Agents Fail Without On-Chain Guardrails
          </h2>
          <p className="text-sm font-bold text-gray-700">
            Current Web3 tooling assumes human confirmation on every signature. Giving an autonomous agent raw keys
            exposes your entire treasury to catastrophic prompt-injection and loop drain vulnerabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bad: Raw Keys */}
          <div className="neo-box-lg rounded-3xl bg-[#FECDD3] border-[3px] border-black p-8 space-y-5 shadow-brutal-lg">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase">The Danger: Raw Keys in .env</h3>
              <p className="text-xs font-bold text-gray-700 mt-1">What most AI agent frameworks use today</p>
            </div>
            <ul className="space-y-3 text-xs font-bold text-black">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-xs font-black shrink-0">✕</span>
                <span><strong>Single Point of Failure:</strong> 1 prompt injection exploit transfers 100% of treasury capital.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-xs font-black shrink-0">✕</span>
                <span><strong>No Velocity Limiting:</strong> Infinite loops drain gas and funds in minutes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-xs font-black shrink-0">✕</span>
                <span><strong>Arbitrary Target Exploits:</strong> Agent can invoke <code>approve(attacker, max)</code> on any token.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-xs font-black shrink-0">✕</span>
                <span><strong>Zero Governance:</strong> High-value transactions cannot be routed to human review.</span>
              </li>
            </ul>
          </div>

          {/* Good: MezoAgent Smart Accounts */}
          <div className="neo-box-lg rounded-3xl bg-[#C0F7FE] border-[3px] border-black p-8 space-y-5 shadow-brutal-lg">
            <div className="w-12 h-12 rounded-2xl bg-[#99E885] border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase">The MezoAgent Guardrail</h3>
              <p className="text-xs font-bold text-gray-700 mt-1">Institutional smart account policy engine on Mezo</p>
            </div>
            <ul className="space-y-3 text-xs font-bold text-black">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-[#99E885] border border-black text-black flex items-center justify-center text-xs font-black shrink-0">✓</span>
                <span><strong>Vault Stays in Cold Storage:</strong> Safe multisig or owner EOA holds custody; agents receive scoped session keys.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-[#99E885] border border-black text-black flex items-center justify-center text-xs font-black shrink-0">✓</span>
                <span><strong>12-Bucket Sliding-Window Spend:</strong> Mathematical velocity enforcement eliminates 59m/61m double spends.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-[#99E885] border border-black text-black flex items-center justify-center text-xs font-black shrink-0">✓</span>
                <span><strong>Selector-Level Authorization:</strong> Strict <code>(target, bytes4)</code> whitelist blocks rogue token approvals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-[#99E885] border border-black text-black flex items-center justify-center text-xs font-black shrink-0">✓</span>
                <span><strong>Human-in-the-Loop Thresholds:</strong> Micro-spends execute instantly; high-value calls route to approval queue.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. FEATURE BENTO GRID */}
      <section id="sliding-window" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 rounded-lg bg-[#FFDC9B] border-2 border-black font-mono font-black text-xs uppercase tracking-wider text-black shadow-brutal-sm">
            CORE PLATFORM PRIMITIVES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight uppercase">
            Engineered for Mathematical Correctness
          </h2>
          <p className="text-sm font-bold text-gray-700">
            Every security invariant is enforced at the smart contract level on Mezo EVM, proven by 128,000 stateful invariant runs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento 1: 12-Bucket Sliding Window */}
          <div className="md:col-span-2 rounded-3xl bg-white border-[3px] border-black p-7 space-y-4 shadow-brutal-lg">
            <div className="p-3 rounded-2xl bg-[#F7CB46] text-black w-fit border-2 border-black shadow-brutal-sm">
              <RefreshCw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black uppercase">12-Bucket Sliding-Window Velocity Envelope</h3>
              <p className="text-xs font-bold text-gray-700 mt-1 leading-relaxed">
                Naive time windows reset every hour, allowing agents to spend 100% at 0:59 and 100% at 1:01 (200% double-spend).
                MezoAgent slices each hour into 12 circular 300-second sub-buckets. Spending velocity is continuously bounded across any 60-minute window.
              </p>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-9 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono font-black border-2 border-black shadow-brutal-sm transition-all ${
                    i < 4
                      ? "bg-[#F7CB46] text-black"
                      : "bg-[#FFFDF8] text-gray-600"
                  }`}
                >
                  <span>{i * 5}m</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bento 2: Human-in-the-Loop Queue */}
          <div className="rounded-3xl bg-[#FFDC9B] border-[3px] border-black p-7 space-y-4 shadow-brutal-lg">
            <div className="p-3 rounded-2xl bg-white text-black w-fit border-2 border-black shadow-brutal-sm">
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black uppercase">Human-in-the-Loop Thresholds</h3>
              <p className="text-xs font-bold text-gray-700 mt-1 leading-relaxed">
                Autonomous micro-payments under $10 MUSD disburse instantly with zero latency. Allocations above the threshold route to an on-chain queue for multi-party human sign-off.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-white border-2 border-black text-xs font-mono font-black text-black shadow-brutal-sm">
              <div className="flex justify-between pb-1 border-b-2 border-black">
                <span>Threshold:</span>
                <span className="bg-[#F7CB46] px-1 rounded border border-black">$10.00 MUSD</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>High-Value Flow:</span>
                <span className="text-[#99E885] bg-black px-1 rounded">Multisig Signoff</span>
              </div>
            </div>
          </div>

          {/* Bento 3: Granular Selector Allowlist */}
          <div className="rounded-3xl bg-[#C0F7FE] border-[3px] border-black p-7 space-y-4 shadow-brutal-lg">
            <div className="p-3 rounded-2xl bg-white text-black w-fit border-2 border-black shadow-brutal-sm">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black uppercase">Granular Function Filtering</h3>
              <p className="text-xs font-bold text-gray-700 mt-1 leading-relaxed">
                Session keys are bound to explicit <code>(target, bytes4 selector)</code> tuples. Rogue <code>approve()</code> calls on token contracts are blocked on-chain.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs text-black shadow-brutal-sm space-y-1">
              <div className="text-emerald-700">0xa9059cbb → transfer() Allowed</div>
              <div className="text-red-700">0x095ea7b3 → approve() BLOCKED</div>
            </div>
          </div>

          {/* Bento 4: EIP-1271 Safe Multisig Native */}
          <div className="rounded-3xl bg-[#99E885] border-[3px] border-black p-7 space-y-4 shadow-brutal-lg">
            <div className="p-3 rounded-2xl bg-white text-black w-fit border-2 border-black shadow-brutal-sm">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black uppercase">EIP-1271 Safe Multisig Native</h3>
              <p className="text-xs font-bold text-gray-700 mt-1 leading-relaxed">
                Full contract wallet compatibility. DAOs, Gnosis Safe, and institutional multisig treasuries can hold ownership over agent accounts directly.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border-2 border-black font-mono font-black text-xs text-black shadow-brutal-sm">
              IERC1271.isValidSignature() Supported
            </div>
          </div>

          {/* Bento 5: Bitcoin Native Gas & Yield */}
          <div className="rounded-3xl bg-[#FE9CE8] border-[3px] border-black p-7 space-y-4 shadow-brutal-lg">
            <div className="p-3 rounded-2xl bg-white text-black w-fit border-2 border-black shadow-brutal-sm">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black uppercase">Bitcoin Native Gas & Yield</h3>
              <p className="text-xs font-bold text-gray-700 mt-1 leading-relaxed">
                Natively built for Mezo. Accounts hold MUSD reserves and pay gas in native Bitcoin (Satoshis), with automated idle yield stacking.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border-2 border-black font-mono font-black text-xs text-black shadow-brutal-sm">
              Mezo Testnet (31611) • MUSD Stablecoin
            </div>
          </div>
        </div>
      </section>

      {/* 8. DEVELOPER SDK SECTION */}
      <section id="sdk" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-lg bg-[#FE9CE8] border-2 border-black font-mono font-black text-xs uppercase tracking-wider text-black shadow-brutal-sm">
              DEVELOPER INFRASTRUCTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase mt-2">
              Plug-and-Play AI Agent SDK
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700 mt-1">
              Integrate budget-controlled execution into LangChain, ElizaOS, or standalone Node bots in 3 lines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.npmjs.com/package/mezo-agent-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border-2 border-black text-xs font-black text-black shadow-brutal hover:bg-[#C0F7FE]"
            >
              <span>View on npm</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>
            <a
              href="https://github.com/ayushsaklani-min/mezo-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border-2 border-black text-xs font-black text-black shadow-brutal hover:bg-[#F7CB46]"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>
          </div>
        </div>

        {/* Code Container */}
        <div className="rounded-3xl bg-white border-[3px] border-black p-6 shadow-brutal-lg relative overflow-hidden">
          {/* Code Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b-2 border-black">
            {(["ts", "langchain", "eliza", "curl"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`neo-btn px-4 py-2 rounded-xl text-xs font-black border-2 border-black transition-all ${
                  activeCodeTab === tab
                    ? "bg-[#F7CB46] text-black shadow-brutal-sm"
                    : "bg-white text-black hover:bg-[#C0F7FE] shadow-brutal-sm"
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
          <div className="mt-4 p-4 rounded-2xl bg-black border-2 border-black shadow-brutal-sm overflow-x-auto">
            <pre className="text-xs font-mono font-bold leading-relaxed text-[#99E885]">
              <code>{codeSnippets[activeCodeTab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#F7CB46] border-[3px] border-black p-8 sm:p-12 text-center relative overflow-hidden shadow-brutal-xl space-y-6">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white border-2 border-black font-mono font-black text-xs uppercase tracking-wider text-black shadow-brutal-sm">
              READY FOR PRODUCTION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight uppercase">
              Give Your AI Agents Autonomous Capital on Bitcoin.
            </h2>
            <p className="text-sm font-bold text-black leading-relaxed">
              Launch the live interactive cockpit now to mint ephemeral session keys, bridge testnet liquidity,
              and watch rate limits protect your funds in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <Link
              href="/app"
              className="neo-btn flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black text-sm border-2 border-black shadow-brutal-lg hover:bg-[#FFFDF8]"
            >
              <span>Launch Live Cockpit</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="neo-btn flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#99E885] border-2 border-black text-black font-black text-xs shadow-brutal-lg hover:bg-[#83df6e]"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
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

      {/* 10. FOOTER */}
      <footer className="border-t-[3px] border-black bg-white py-12 shadow-[0px_-4px_0px_0px_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-bold text-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F7CB46] border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-black text-base uppercase">MezoAgent</span>
              <p className="text-[11px] font-bold text-gray-700">Budget-Controlled AI Agent Smart Accounts on Bitcoin</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-black">
            <Link href="/app" className="hover:underline">
              Live Cockpit
            </Link>
            <span>•</span>
            <a
              href="https://www.npmjs.com/package/mezo-agent-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              npm SDK
            </a>
            <span>•</span>
            <a
              href="https://github.com/ayushsaklani-min/mezo-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href={`${MEZO_CONFIG.explorerUrl}/address/${MEZO_CONFIG.accountAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
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
