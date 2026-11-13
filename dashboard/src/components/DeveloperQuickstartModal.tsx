"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code2, Copy, Check, BookOpen } from "lucide-react";
import { MEZO_CONFIG } from "@/lib/constants";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperQuickstartModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"ts" | "langchain" | "eliza" | "curl">("ts");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippets = {
    ts: `// 1. Install via npm:
// npm install mezo-agent-sdk viem

import { MezoAgentClient, MEZO_TESTNET } from "mezo-agent-sdk";

// Initialize client with agent's ephemeral session key
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
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";

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

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#0B0F19] border border-surface-border rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative z-10"
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-mezo/10 text-mezo ring-1 ring-mezo/25">
                <Code2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Developer SDK & Agent Adapters</h3>
                <p className="text-xs text-slate-400">Plug-and-play autonomous smart account integration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4 pb-2">
            {(["ts", "langchain", "eliza", "curl"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? "bg-mezo text-black shadow-md shadow-mezo/20"
                    : "bg-surface-card text-slate-400 hover:text-white hover:bg-surface-light"
                }`}
              >
                {tab === "ts" && "TypeScript SDK"}
                {tab === "langchain" && "LangChain Tool"}
                {tab === "eliza" && "ElizaOS Action"}
                {tab === "curl" && "cURL RPC"}
              </button>
            ))}
          </div>

          {/* Code Viewer Container */}
          <div className="relative mt-2 rounded-2xl bg-[#04060A] border border-surface-border p-4 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-[11px] font-sans font-semibold text-slate-200 hover:text-white transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <pre className="pr-24 leading-relaxed font-mono">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>

          {/* Info Footer */}
          <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-mezo" />
              Package: <a href="https://www.npmjs.com/package/mezo-agent-sdk" target="_blank" rel="noopener noreferrer" className="text-mezo font-bold font-mono underline hover:text-orange-400">mezo-agent-sdk</a>
            </span>
            <span className="font-mono text-slate-500">Node.js 18+ / Browser</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
