import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  parseEther,
  type Address,
  type Hash,
  type Hex,
  defineChain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { MEZO_TESTNET, type AgentClientConfig, type ExecutionReceipt, type PaymentParams, type SessionPolicyView } from "./types.js";
import { MEZO_AGENT_ACCOUNT_ABI } from "./abi.js";

export class MezoAgentClient {
  public readonly accountAddress: Address;
  public readonly sessionSigner: ReturnType<typeof privateKeyToAccount>;
  public readonly publicClient: any;
  public readonly walletClient: any;
  public readonly network = MEZO_TESTNET;

  constructor(config: AgentClientConfig) {
    this.accountAddress = config.accountAddress;
    this.sessionSigner = privateKeyToAccount(config.sessionPrivateKey);

    const rpcUrl = config.rpcUrl || config.network?.rpcUrl || MEZO_TESTNET.rpcUrl;
    const chainId = config.network?.chainId || MEZO_TESTNET.chainId;

    const mezoChain = defineChain({
      id: chainId,
      name: config.network?.name || "Mezo Network",
      nativeCurrency: {
        name: "Bitcoin",
        symbol: "BTC",
        decimals: 18,
      },
      rpcUrls: {
        default: { http: [rpcUrl] },
      },
    });

    this.publicClient = createPublicClient({
      chain: mezoChain,
      transport: http(rpcUrl),
    });

    this.walletClient = createWalletClient({
      account: this.sessionSigner,
      chain: mezoChain,
      transport: http(rpcUrl),
    });
  }

  /**
   * Get the session key public address.
   */
  public getSessionAddress(): Address {
    return this.sessionSigner.address;
  }

  /**
   * Query the remaining MUSD budget allowed in the current 1-hour window.
   */
  public async getRemainingHourlyBudget(): Promise<string> {
    const rawBudget = (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "getRemainingHourlyBudget",
      args: [this.sessionSigner.address],
    })) as bigint;

    return formatEther(rawBudget);
  }

  /**
   * Query the remaining MUSD budget allowed in the current 24-hour window.
   */
  public async getRemainingDailyBudget(): Promise<string> {
    const rawBudget = (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "getRemainingDailyBudget",
      args: [this.sessionSigner.address],
    })) as bigint;

    return formatEther(rawBudget);
  }

  /**
   * Query total account MUSD balance and native BTC gas balance.
   */
  public async getAccountBalances(): Promise<{ musd: string; btcGas: string }> {
    const [rawMUSD, rawBTC] = (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "getAccountBalance",
    })) as [bigint, bigint];

    return {
      musd: formatEther(rawMUSD),
      btcGas: formatEther(rawBTC),
    };
  }

  /**
   * Query policy details for this agent's session key.
   */
  public async getPolicy(): Promise<SessionPolicyView> {
    const policy = (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "sessionPolicies",
      args: [this.sessionSigner.address],
    })) as [boolean, bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean, string];

    return {
      active: policy[0],
      hourlyLimit: policy[1],
      dailyLimit: policy[2],
      validUntil: policy[3],
      hourlySpent: policy[4],
      dailySpent: policy[6],
      restrictTargets: policy[8],
      label: policy[9],
    };
  }

  /**
   * Autonomous agent payment to a service provider (API, data vendor, LLM compute).
   */
  public async payService(params: PaymentParams): Promise<ExecutionReceipt> {
    const amountBigInt = parseEther(params.amountInMUSD.toString());
    const dataHex: Hex = params.calldata || "0x";

    const hash = (await this.walletClient.writeContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "executeAsAgent",
      args: [params.recipient, amountBigInt, dataHex],
    })) as Hash;

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

    const [remainingHourly, remainingDaily] = await Promise.all([
      this.getRemainingHourlyBudget(),
      this.getRemainingDailyBudget(),
    ]);

    return {
      success: receipt.status === "success",
      txHash: hash,
      musdSpent: params.amountInMUSD.toString(),
      remainingHourlyBudget: remainingHourly,
      remainingDailyBudget: remainingDaily,
      recipient: params.recipient,
      timestamp: Date.now(),
    };
  }
}
