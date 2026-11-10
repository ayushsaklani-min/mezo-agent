import { MezoAgentClient } from "./client.js";
import type { Address } from "viem";

export interface LangChainToolConfig {
  client: MezoAgentClient;
}

/**
 * Standard LangChain / AI Agent tool definition for paying in MUSD on Mezo.
 * Conforms to OpenAI function-calling and LangChain dynamic tool interfaces.
 */
export function createMezoPaymentTool(client: MezoAgentClient) {
  return {
    name: "mezo_pay_musd",
    description:
      "Pay for services, API calls, compute, or data providers using MUSD on the Mezo Bitcoin Layer. Checks remaining hourly/daily budget before executing.",
    parameters: {
      type: "object",
      properties: {
        recipientAddress: {
          type: "string",
          description: "Ethereum/Mezo address of the service provider or recipient.",
        },
        amountMUSD: {
          type: "string",
          description: "Amount of MUSD to pay (e.g. '0.5' for 50 cents).",
        },
        reason: {
          type: "string",
          description: "Explanation or memo for this expenditure.",
        },
      },
      required: ["recipientAddress", "amountMUSD"],
    },
    execute: async (args: { recipientAddress: string; amountMUSD: string; reason?: string }) => {
      const remainingHourly = await client.getRemainingHourlyBudget();
      if (parseFloat(remainingHourly) < parseFloat(args.amountMUSD)) {
        return {
          success: false,
          error: `Rate limit breach: remaining hourly budget is only ${remainingHourly} MUSD, requested ${args.amountMUSD} MUSD.`,
        };
      }

      const receipt = await client.payService({
        recipient: args.recipientAddress as Address,
        amountInMUSD: args.amountMUSD,
        memo: args.reason,
      });

      return {
        success: receipt.success,
        txHash: receipt.txHash,
        amountPaid: `${args.amountMUSD} MUSD`,
        remainingHourlyBudget: `${receipt.remainingHourlyBudget} MUSD`,
        recipient: receipt.recipient,
      };
    },
  };
}
