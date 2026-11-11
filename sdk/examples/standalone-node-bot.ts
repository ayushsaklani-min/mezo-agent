/**
 * Standalone Node.js Autonomous Agent Example
 * 
 * Demonstrates an autonomous bot running on Mezo Testnet (Chain ID 31611):
 * - Checks its remaining sliding-window hourly budget
 * - Safely pays an oracle or worker service
 * - Recovers gracefully from velocity limits and on-chain security guardrails
 */

import {
  MezoAgentClient,
  MEZO_TESTNET,
  HourlyLimitExceededError,
  SessionKeyRevokedError,
  TargetNotWhitelistedError,
} from "@mezo-agent/sdk";

async function main() {
  console.log("=== MezoAgent Autonomous Worker Startup ===");

  const SMART_ACCOUNT = "0x98f483D0b028d77aE37B6d123C34954Af248dC94";
  // Ephemeral session private key (never master key)
  const SESSION_KEY = process.env.AGENT_SESSION_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const SERVICE_PROVIDER = "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b";

  // 1. Initialize MezoAgent Client
  const agent = new MezoAgentClient({
    accountAddress: SMART_ACCOUNT,
    sessionPrivateKey: SESSION_KEY as `0x${string}`,
    network: MEZO_TESTNET,
  });

  console.log(`Agent Ephemeral Signer: ${agent.getSessionAddress()}`);

  // 2. Query remaining sliding-window budget
  const hourlyAllowance = await agent.getRemainingHourlyBudget();
  const dailyAllowance = await agent.getRemainingDailyBudget();
  console.log(`Remaining Hourly Allowance: ${hourlyAllowance} MUSD`);
  console.log(`Remaining Daily Allowance:  ${dailyAllowance} MUSD`);

  // 3. Check if target service is whitelisted
  const isAllowed = await agent.isTargetAllowed(SERVICE_PROVIDER);
  if (!isAllowed) {
    console.error(`Target ${SERVICE_PROVIDER} is not whitelisted by account owner!`);
    return;
  }

  // 4. Autonomous Payment Execution with Typed Error Handling
  try {
    console.log("Submitting autonomous payment for LLM Oracle query...");
    const receipt = await agent.payService({
      recipient: SERVICE_PROVIDER,
      amountInMUSD: "0.25",
      memo: "Autonomous Search Query #1042",
    });

    console.log(`Payment Confirmed on Mezo!`);
    console.log(`Tx Hash: ${receipt.txHash}`);
    console.log(`Explorer: ${MEZO_TESTNET.explorerUrl}/tx/${receipt.txHash}`);
  } catch (error) {
    if (error instanceof HourlyLimitExceededError) {
      console.warn("Velocity limit reached! Agent will pause until sliding window clears.");
    } else if (error instanceof SessionKeyRevokedError) {
      console.error("Session key has been revoked by master owner. Halting bot.");
    } else if (error instanceof TargetNotWhitelistedError) {
      console.error("Target contract is not authorized.");
    } else {
      console.error("Unexpected execution error:", error);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
