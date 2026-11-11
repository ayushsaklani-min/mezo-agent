/**
 * ElizaOS (ai16z) Action Integration Example for MezoAgent
 *
 * Demonstrates how to equip an ElizaOS character/agent with safe autonomous
 * on-chain spend actions on Mezo Testnet (Chain ID 31611).
 *
 * Pattern:
 * - Checks context and remaining budget before action execution
 * - Calls `payService` via MezoAgentClient
 * - Returns structured callback messages to Eliza's runtime
 */

import {
  MezoAgentClient,
  MEZO_TESTNET,
  HourlyLimitExceededError,
  SessionKeyRevokedError,
  TargetNotWhitelistedError,
} from "../src/index.js";

// Minimal Eliza Action Interface Definition
export interface IAgentRuntime {
  getSetting(key: string): string | undefined;
}

export interface Memory {
  content: {
    text: string;
    targetAddress?: string;
    amount?: string;
    reason?: string;
  };
}

export interface State {
  [key: string]: any;
}

export interface HandlerCallback {
  (response: { text: string; data?: any }): Promise<void>;
}

export interface Action {
  name: string;
  similes: string[];
  description: string;
  validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ) => Promise<boolean>;
  examples: any[][];
}

/**
 * Eliza Action: MEZO_PAY
 */
export const mezoPayAction: Action = {
  name: "MEZO_PAY",
  similes: ["PAY_MUSD", "SEND_MUSD_PAYMENT", "DISBURSE_BUDGET", "PURCHASE_API_CREDITS"],
  description:
    "Autonomous on-chain disbursement of MUSD on Mezo Network guarded by smart account sliding window limits.",

  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    // Validate that required env vars and message parameters exist
    const hasAccount = !!runtime.getSetting("MEZO_ACCOUNT_ADDRESS");
    const hasKey = !!runtime.getSetting("MEZO_SESSION_KEY");
    return hasAccount && hasKey;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: any,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    const accountAddress = runtime.getSetting("MEZO_ACCOUNT_ADDRESS") as `0x${string}`;
    const sessionKey = runtime.getSetting("MEZO_SESSION_KEY") as `0x${string}`;

    const client = new MezoAgentClient({
      accountAddress,
      sessionPrivateKey: sessionKey,
      network: MEZO_TESTNET,
    });

    const target = (message.content.targetAddress || "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b") as `0x${string}`;
    const amount = message.content.amount || "0.10";
    const reason = message.content.reason || "Autonomous compute payment";

    try {
      // 1. Invariant check on client side
      const remainingHourly = await client.getRemainingHourlyBudget();
      if (parseFloat(remainingHourly) < parseFloat(amount)) {
        if (callback) {
          await callback({
            text: `⚠️ Payment delayed: Spend of ${amount} MUSD exceeds remaining sliding window budget (${remainingHourly} MUSD).`,
          });
        }
        return false;
      }

      // 2. Submit transaction
      const receipt = await client.payService({
        recipient: target,
        amountInMUSD: amount,
        memo: reason,
      });

      if (callback) {
        await callback({
          text: `✅ Payment of ${amount} MUSD confirmed on Mezo!\nTx: ${receipt.txHash}\nExplorer: ${MEZO_TESTNET.explorerUrl}/tx/${receipt.txHash}`,
          data: receipt,
        });
      }
      return true;
    } catch (err: any) {
      let errorMessage = err.message;
      if (err instanceof HourlyLimitExceededError) {
        errorMessage = "Velocity limit breached! Contract prevented spending over hourly cap.";
      } else if (err instanceof SessionKeyRevokedError) {
        errorMessage = "Emergency: Session key revoked by treasury admin.";
      } else if (err instanceof TargetNotWhitelistedError) {
        errorMessage = `Target ${target} is not in the allowed counterparty whitelist.`;
      }

      if (callback) {
        await callback({
          text: `❌ Mezo payment failed: ${errorMessage}`,
          data: { error: err.name },
        });
      }
      return false;
    }
  },

  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "Can you pay 0.25 MUSD to 0x1a2b... for the GPU inference lease?" },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Executing autonomous payment through MezoAgent smart account session key...",
          action: "MEZO_PAY",
        },
      },
    ],
  ],
};
