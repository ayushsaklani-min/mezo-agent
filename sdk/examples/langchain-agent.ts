/**
 * LangChain Tool Integration Example for MezoAgent
 *
 * Demonstrates how to give an autonomous LLM Agent (LangChain / LangGraph)
 * the capability to spend MUSD on Mezo without handing it private key control over the treasury.
 *
 * All transactions are guarded by on-chain sliding-window velocity limits.
 */

import {
  MezoAgentClient,
  MEZO_TESTNET,
  HourlyLimitExceededError,
  SessionKeyRevokedError,
  TargetNotWhitelistedError,
} from "../src/index.js";

// LangChain Tool structure
export interface MezoPaymentInput {
  recipient: `0x${string}`;
  amountInMUSD: string;
  memo: string;
}

/**
 * Creates a LangChain-compatible structured tool for autonomous MUSD disbursements.
 */
export function createMezoPaymentTool(client: MezoAgentClient) {
  return {
    name: "mezo_pay_service",
    description:
      "Execute an on-chain MUSD payment to a whitelisted service provider on Mezo Network. " +
      "Protected by on-chain sliding-window budget limits and automated key revocation.",
    schema: {
      type: "object",
      properties: {
        recipient: {
          type: "string",
          description: "0x Ethereum-style address of the recipient service on Mezo",
        },
        amountInMUSD: {
          type: "string",
          description: "Amount to transfer in MUSD (e.g., '1.5')",
        },
        memo: {
          type: "string",
          description: "Short note describing the reason for payment",
        },
      },
      required: ["recipient", "amountInMUSD", "memo"],
    },
    func: async ({ recipient, amountInMUSD, memo }: MezoPaymentInput) => {
      try {
        // Pre-flight check: verify budget before initiating on-chain tx
        const remainingHourly = await client.getRemainingHourlyBudget();
        if (parseFloat(remainingHourly) < parseFloat(amountInMUSD)) {
          return {
            status: "budget_exceeded",
            message: `Payment denied: Requested ${amountInMUSD} MUSD exceeds remaining hourly allowance of ${remainingHourly} MUSD.`,
            retryAfterMinutes: 5,
          };
        }

        const isAllowed = await client.isTargetAllowed(recipient);
        if (!isAllowed) {
          return {
            status: "target_forbidden",
            message: `Payment denied: Recipient ${recipient} is not on the smart account whitelist.`,
          };
        }

        const receipt = await client.payService({
          recipient,
          amountInMUSD,
          memo,
        });

        return {
          status: "success",
          txHash: receipt.txHash,
          blockNumber: receipt.blockNumber.toString(),
          explorerUrl: `${MEZO_TESTNET.explorerUrl}/tx/${receipt.txHash}`,
          message: `Successfully transferred ${amountInMUSD} MUSD to ${recipient}`,
        };
      } catch (err: any) {
        if (err instanceof HourlyLimitExceededError) {
          return {
            status: "error",
            code: "RATE_LIMITED",
            message: "Velocity limit exceeded on-chain. Try again when sliding window clears.",
          };
        }
        if (err instanceof SessionKeyRevokedError) {
          return {
            status: "revoked",
            code: "KEY_REVOKED",
            message: "Session key has been revoked by account owner. Agent execution terminated.",
          };
        }
        if (err instanceof TargetNotWhitelistedError) {
          return {
            status: "unauthorized",
            code: "TARGET_NOT_ALLOWED",
            message: "Target contract is not whitelisted by account owner.",
          };
        }
        return {
          status: "failed",
          error: err.message,
        };
      }
    },
  };
}

// Example usage
async function runLangChainSimulation() {
  console.log("=== Initializing LangChain MezoAgent Worker ===");

  const client = new MezoAgentClient({
    accountAddress: "0x98f483D0b028d77aE37B6d123C34954Af248dC94",
    sessionPrivateKey: (process.env.AGENT_SESSION_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") as `0x${string}`,
    network: MEZO_TESTNET,
  });

  const tool = createMezoPaymentTool(client);
  console.log(`Tool ready: ${tool.name}`);

  // Simulating an LLM tool call
  console.log("Invoking tool with simulated LLM query payload...");
  const result = await tool.func({
    recipient: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    amountInMUSD: "0.50",
    memo: "LangChain Research Agent Vector DB Retrieval Fee",
  });

  console.log("Tool execution result:", result);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runLangChainSimulation().catch(console.error);
}
