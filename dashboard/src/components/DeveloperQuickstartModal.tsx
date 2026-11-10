"use client";

import React, { useState } from "react";
import { X, Code2, Copy, Check, Terminal, Sparkles } from "lucide-react";
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
    ts: `import { MezoAgentClient, MEZO_TESTNET } from "@mezo-agent/sdk";

// Initialize client with agent's ephemeral session key
const agent = new MezoAgentClient({
  accountAddress: "0x98f483D0b028d77aE37B6d123C34954Af248dC94",
  sessionPrivateKey: process.env.AGENT_SESSION_PRIVATE_KEY!,
  network: MEZO_TESTNET,
});

// Check remaining hourly allowance in MUSD
const budget = await agent.getRemainingHourlyBudget();
console.log(\`Remaining MUSD: \${budget}\`);

// Autonomously pay for an API query
const receipt = await agent.payService({
  recipient: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
  amountInMUSD: "0.25",
  memo: "LLM Web Search Oracle Query",
});

console.log(\`Paid! Tx: \${receipt.txHash}\`);`,

    langchain: `import { MezoAgentClient } from "@mezo-agent/sdk";
import { createMezoPaymentTool } from "@mezo-agent/sdk/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";

const client = new MezoAgentClient({ ... });
const mezoTool = createMezoPaymentTool(client);

// Give the tool to your autonomous LangChain agent
const tools = [mezoTool];
const model = new ChatOpenAI({ modelName: "gpt-4o" });
// Agent now autonomously spends within hard session key caps!`,

    eliza: `import { createElizaMezoAction } from "@mezo-agent/sdk/eliza";
import { MezoAgentClient } from "@mezo-agent/sdk";

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
      "to":"0x98f483D0b028d77aE37B6d123C34954Af248dC94",
      "data":"0x789b91e900000000000000000000000071C02847a9D7881cE8F67C8E281F3e2D34E4c892"
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-surface-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-mezo" />
            <h3 className="text-base font-bold text-white">Developer SDK & Agent Adapters</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 pb-2">
          <button
            onClick={() => setActiveTab("ts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "ts" ? "bg-mezo text-black font-bold" : "bg-surface-light text-slate-400 hover:text-white"
            }`}
          >
            TypeScript SDK
          </button>
          <button
            onClick={() => setActiveTab("langchain")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "langchain" ? "bg-mezo text-black font-bold" : "bg-surface-light text-slate-400 hover:text-white"
            }`}
          >
            LangChain Tool
          </button>
          <button
            onClick={() => setActiveTab("eliza")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "eliza" ? "bg-mezo text-black font-bold" : "bg-surface-light text-slate-400 hover:text-white"
            }`}
          >
            ElizaOS Action
          </button>
          <button
            onClick={() => setActiveTab("curl")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "curl" ? "bg-mezo text-black font-bold" : "bg-surface-light text-slate-400 hover:text-white"
            }`}
          >
            cURL / JSON-RPC
          </button>
        </div>

        {/* Code Box */}
        <div className="mt-2 rounded-xl bg-[#06080E] border border-surface-border p-4 font-mono text-xs text-slate-300 relative">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-light border border-surface-border hover:border-slate-500 text-xs text-slate-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Copy Code</span>
              </>
            )}
          </button>

          <pre className="overflow-x-auto pr-16 leading-relaxed text-slate-300">
            {codeSnippets[activeTab]}
          </pre>
        </div>

        <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-slate-400">
          <span>Target Network: {MEZO_CONFIG.name} (Chain ID {MEZO_CONFIG.chainId})</span>
          <span className="text-mezo font-mono">npm install @mezo-agent/sdk</span>
        </div>
      </div>
    </div>
  );
};
