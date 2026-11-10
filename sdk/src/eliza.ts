import { MezoAgentClient } from "./client.js";
import type { Address } from "viem";

/**
 * ElizaOS / Autonomous Agent Action Plugin for Mezo MUSD transactions.
 */
export function createElizaMezoAction(client: MezoAgentClient) {
  return {
    name: "MEZO_PAY_MUSD",
    similes: ["PAY_MUSD", "SEND_MUSD_PAYMENT", "PAY_ON_MEZO"],
    description: "Autonomously pays for services on the Mezo Bitcoin economic layer using MUSD within authorized limits.",
    validate: async () => {
      const policy = await client.getPolicy();
      return policy.active;
    },
    handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
      try {
        const { recipient, amount, memo } = options;
        const receipt = await client.payService({
          recipient: recipient as Address,
          amountInMUSD: amount,
          memo: memo || "Autonomous Eliza action",
        });

        if (callback) {
          callback({
            text: `Successfully paid ${amount} MUSD to ${recipient} on Mezo. Tx Hash: ${receipt.txHash}`,
            content: receipt,
          });
        }
        return true;
      } catch (error: any) {
        if (callback) {
          callback({
            text: `Failed to pay on Mezo: ${error?.message || error}`,
          });
        }
        return false;
      }
    },
  };
}
