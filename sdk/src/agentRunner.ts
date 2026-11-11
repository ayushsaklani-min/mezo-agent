import { MezoAgentClient } from "./client.js";
import type { Address } from "viem";

export interface AutonomousTaskConfig {
  taskName: string;
  serviceProvider: Address;
  costMUSD: string;
  intervalMs: number;
  maxIterations?: number;
}

/**
 * Autonomous runner demonstrating periodic, budget-capped agent actions on Mezo.
 */
export async function runAutonomousAgentLoop(
  client: MezoAgentClient,
  config: AutonomousTaskConfig,
  onIteration?: (info: { iteration: number; txHash: string; remainingHourly: string }) => void
) {
  let iteration = 0;
  const max = config.maxIterations || 5;

  console.log(`[MezoAgent] Starting autonomous loop: "${config.taskName}"`);
  console.log(`[MezoAgent] Agent Key: ${client.getSessionAddress()}`);
  console.log(`[MezoAgent] Target Account: ${client.accountAddress}`);

  while (iteration < max) {
    iteration++;
    try {
      const remainingHourly = await client.getRemainingHourlyBudget();
      console.log(`[Loop #${iteration}] Remaining hourly budget: ${remainingHourly} MUSD`);

      if (parseFloat(remainingHourly) < parseFloat(config.costMUSD)) {
        console.warn(`[Loop #${iteration}] Budget exhausted for this hour window. Waiting.`);
        break;
      }

      const receipt = await client.payService({
        recipient: config.serviceProvider,
        amountInMUSD: config.costMUSD,
        memo: `${config.taskName} - cycle ${iteration}`,
      });

      console.log(`[Loop #${iteration}] Payment succeeded! Tx: ${receipt.txHash}`);
      if (onIteration) {
        onIteration({
          iteration,
          txHash: receipt.txHash,
          remainingHourly: receipt.remainingHourlyBudget || "0",
        });
      }
    } catch (err: any) {
      console.error(`[Loop #${iteration}] Execution error:`, err?.message || err);
      break;
    }

    if (iteration < max) {
      await new Promise((resolve) => setTimeout(resolve, config.intervalMs));
    }
  }

  console.log(`[MezoAgent] Autonomous task loop completed.`);
}
