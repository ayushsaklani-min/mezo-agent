"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code2, Copy, Check, Terminal } from "lucide-react";
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
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border-[3px] border-black rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-[10px_10px_0px_0px_#000000] relative z-10"
        >
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-black">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#38BDF8] border-2 border-black shadow-brutal-sm flex items-center justify-center text-black">
                <Code2 className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-base font-black text-black uppercase">Developer SDK & Agent Tooling</h3>
                <p className="text-xs font-bold text-slate-700">Plug-and-play autonomous smart account integration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg border-2 border-black bg-[#FAF7F0] hover:bg-[#FF4757] hover:text-white transition-colors"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4 pb-2">
            {(["ts", "langchain", "eliza", "curl"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`neo-btn px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  activeTab === tab
                    ? "bg-[#F7CB46] text-black shadow-brutal-sm"
                    : "bg-[#FAF7F0] text-black hover:bg-white"
                }`}
              >
                {tab === "ts" && "TypeScript"}
                {tab === "langchain" && "LangChain"}
                {tab === "eliza" && "ElizaOS"}
                {tab === "curl" && "cURL RPC"}
              </button>
            ))}
          </div>

          {/* Code Viewer Container */}
          <div className="relative mt-2 rounded-xl bg-[#121212] border-2 border-black p-4 font-mono text-xs text-white overflow-x-auto shadow-[4px_4px_0px_0px_#000000]">
            <button
              onClick={handleCopy}
              className="neo-btn absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7CB46] hover:bg-[#ffb703] text-black text-xs font-black"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-800" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>COPY CODE</span>
                </>
              )}
            </button>

            <pre className="pt-2 leading-relaxed">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>

          {/* Bottom Bar */}
          <div className="mt-4 pt-3 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#99E885] border border-black" />
              <span>NPM: mezo-agent-sdk@1.0.2</span>
            </div>
            <button
              onClick={onClose}
              className="neo-btn px-4 py-2 rounded-xl bg-[#000000] text-white text-xs font-black uppercase"
            >
              CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
