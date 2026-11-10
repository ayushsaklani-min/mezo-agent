import { MezoAgentClient } from "./client.js";
import { createMezoPaymentTool } from "./langchain.js";
import { MEZO_TESTNET } from "./types.js";

/**
 * Autonomous AI Agent Execution Simulator.
 * Demonstrates an AI agent inspecting its budget and making intelligent decisions.
 */
export async function startAutonomousAgentDemo() {
  console.log("=================================================");
  console.log("   MezoAgent: Autonomous AI Agent Runtime Demo   ");
  console.log("=================================================");

  // Ephemeral test key
  const dummyKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const dummyAccount = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const providerAddress = "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b";

  const client = new MezoAgentClient({
    accountAddress: dummyAccount,
    sessionPrivateKey: dummyKey,
    network: MEZO_TESTNET,
  });

  const tool = createMezoPaymentTool(client);

  console.log(`[AGENT BOOT] Session Signer: ${client.getSessionAddress()}`);
  console.log(`[AGENT BOOT] Target Treasury: ${client.accountAddress}`);
  console.log(`[AGENT BOOT] Network: ${MEZO_TESTNET.name} (Chain ID: ${MEZO_TESTNET.chainId})`);
  console.log(`[AGENT TOOL] Tool "${tool.name}" registered in agent memory.`);

  console.log("\n[DECISION 1] AI received user prompt: 'Gather real-time Bitcoin mempool data and pay oracle fee.'");
  console.log(`[ACTION 1] Autonomous tool execution: mezo_pay_musd({ recipient: '${providerAddress}', amount: '0.25' })`);

  // Emulate tool response
  const simulatedHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  console.log(`[ON-CHAIN MEZO] Verified: Hourly limit valid. Target allowed.`);
  console.log(`[ON-CHAIN MEZO] Tx Hash: ${simulatedHash}`);
  console.log(`[RESULT] Mempool oracle fee paid: 0.25 MUSD. Remaining hourly budget: 14.75 MUSD.`);

  console.log("\n[DECISION 2] AI detects high MUSD treasury balance: 'Executing auto-DCA yield conversion to BTC.'");
  const dcaHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  console.log(`[ON-CHAIN MEZO] Converted 5.00 MUSD yield -> 0.0000555 BTC credited to treasury.`);
  console.log(`[ON-CHAIN MEZO] DCA Tx: ${dcaHash}`);

  console.log("\n=================================================");
  console.log("   Demo completed successfully on Mezo Layer!   ");
  console.log("=================================================");
}

if (process.argv[1]?.includes("demoAgent")) {
  startAutonomousAgentDemo();
}
