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
import {
  HourlyLimitExceededError,
  DailyLimitExceededError,
  SessionKeyRevokedError,
  SessionKeyExpiredError,
  TargetNotWhitelistedError,
  SelectorNotWhitelistedError,
  AccountPausedError,
  MezoAgentError,
} from "./errors.js";

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

  public getSessionAddress(): Address {
    return this.sessionSigner.address;
  }

  public async getRemainingHourlyBudget(): Promise<string> {
    const rawBudget = (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "getRemainingHourlyBudget",
      args: [this.sessionSigner.address],
    })) as bigint;

    return formatEther(rawBudget);
  }

  public async getRemainingDailyBudget(): Promise<string> {
    const rawBudget = (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "getRemainingDailyBudget",
      args: [this.sessionSigner.address],
    })) as bigint;

    return formatEther(rawBudget);
  }

  public async getHourlySpent(): Promise<string> {
    const raw = (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "getHourlySpent",
      args: [this.sessionSigner.address],
    })) as bigint;

    return formatEther(raw);
  }

  public async getDailySpent(): Promise<string> {
    const raw = (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "getDailySpent",
      args: [this.sessionSigner.address],
    })) as bigint;

    return formatEther(raw);
  }

  public async isTargetAllowed(target: Address): Promise<boolean> {
    return (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "isTargetAllowed",
      args: [this.sessionSigner.address, target],
    })) as boolean;
  }

  public async isFunctionAllowed(target: Address, selector: Hex): Promise<boolean> {
    return (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "isFunctionAllowed",
      args: [this.sessionSigner.address, target, selector],
    })) as boolean;
  }

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

  public async getSessionPolicy(): Promise<SessionPolicyView> {
    const policy = (await this.publicClient.readContract({
      address: this.accountAddress,
      abi: MEZO_AGENT_ACCOUNT_ABI,
      functionName: "sessionPolicies",
      args: [this.sessionSigner.address],
    })) as [boolean, bigint, bigint, bigint, boolean, string];

    return {
      active: policy[0],
      hourlyLimit: policy[1],
      dailyLimit: policy[2],
      validUntil: policy[3],
      restrictTargets: policy[4],
      label: policy[5],
    };
  }

  public async getPolicy(): Promise<SessionPolicyView> {
    return this.getSessionPolicy();
  }

  /**
   * Autonomously pay for an authorized service or transfer MUSD.
   */
  public async payService(params: PaymentParams): Promise<ExecutionReceipt> {
    const parsedAmount = parseEther(params.amountInMUSD.toString());
    const calldata = params.calldata || "0x";

    try {
      const hash = (await this.walletClient.writeContract({
        address: this.accountAddress,
        abi: MEZO_AGENT_ACCOUNT_ABI,
        functionName: "executeAsAgent",
        args: [params.recipient, parsedAmount, calldata],
      })) as Hash;

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      const remainingHourlyBudget = await this.getRemainingHourlyBudget().catch(() => "0");

      return {
        txHash: hash,
        target: params.recipient,
        musdAmount: params.amountInMUSD.toString(),
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
        status: receipt.status === "success" ? "CONFIRMED" : "REVERTED",
        success: receipt.status === "success",
        recipient: params.recipient,
        remainingHourlyBudget,
      };
    } catch (err: any) {
      this._handleContractError(err, params.amountInMUSD.toString(), params.recipient);
      throw err;
    }
  }

  /**
   * Execute an arbitrary contract call through the session key.
   */
  public async executeCall(target: Address, musdAmount: string | number, data: Hex): Promise<ExecutionReceipt> {
    return this.payService({
      recipient: target,
      amountInMUSD: musdAmount,
      calldata: data,
    });
  }

  private _handleContractError(err: any, attemptedAmount: string, target: Address): void {
    const errMsg = err?.message || String(err);

    if (errMsg.includes("Hourly MUSD limit exceeded")) {
      throw new HourlyLimitExceededError("MAX", attemptedAmount, "Hourly Velocity Cap");
    }
    if (errMsg.includes("Daily MUSD limit exceeded")) {
      throw new DailyLimitExceededError("MAX", attemptedAmount, "Daily Safety Cap");
    }
    if (errMsg.includes("Session key inactive or non-existent")) {
      throw new SessionKeyRevokedError(this.sessionSigner.address);
    }
    if (errMsg.includes("Session key has expired")) {
      throw new SessionKeyExpiredError(0);
    }
    if (errMsg.includes("Target address not whitelisted")) {
      throw new TargetNotWhitelistedError(target);
    }
    if (errMsg.includes("Function selector not whitelisted")) {
      throw new SelectorNotWhitelistedError(target, "0x");
    }
    if (errMsg.includes("EnforcedPause")) {
      throw new AccountPausedError(this.accountAddress);
    }
  }
}
