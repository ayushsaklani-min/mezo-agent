import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatEther,
  parseEther,
  type Address,
  type Hash,
  defineChain,
  parseAbiItem,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { MEZO_CONFIG } from "./constants";
import type { SessionKeyItem, ActivityLog } from "./types";
import type { PendingRequestItem } from "@/components/ApprovalsQueue";

export const mezoChain = defineChain({
  id: MEZO_CONFIG.chainId,
  name: MEZO_CONFIG.name,
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [MEZO_CONFIG.localRpcUrl, MEZO_CONFIG.rpcUrl] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: MEZO_CONFIG.explorerUrl },
  },
});

export const MEZO_ACCOUNT_ABI = [
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "musdToken",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAccountBalance",
    inputs: [],
    outputs: [
      { name: "musdBalance", type: "uint256" },
      { name: "nativeBalance", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRegisteredKeys",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getHourlySpent",
    inputs: [{ name: "keySigner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDailySpent",
    inputs: [{ name: "keySigner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRemainingHourlyBudget",
    inputs: [{ name: "keySigner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sessionPolicies",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "active", type: "bool" },
      { name: "hourlyLimit", type: "uint256" },
      { name: "dailyLimit", type: "uint256" },
      { name: "maxPerTx", type: "uint256" },
      { name: "validUntil", type: "uint256" },
      { name: "restrictTargets", type: "bool" },
      { name: "label", type: "string" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createSessionKey",
    inputs: [
      { name: "keySigner", type: "address" },
      { name: "hourlyLimit", type: "uint256" },
      { name: "dailyLimit", type: "uint256" },
      { name: "maxPerTx", type: "uint256" },
      { name: "validUntil", type: "uint256" },
      { name: "restrictTargets", type: "bool" },
      { name: "allowedTargets", type: "address[]" },
      { name: "allowedSelectors", type: "bytes4[]" },
      { name: "label", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeSessionKey",
    inputs: [{ name: "keySigner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "executeAsAgent",
    inputs: [
      { name: "target", type: "address" },
      { name: "musdAmount", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [{ name: "returnData", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestExecution",
    inputs: [
      { name: "target", type: "address" },
      { name: "musdAmount", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "memo", type: "string" },
    ],
    outputs: [{ name: "requestId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approveExecution",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [{ name: "returnData", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rejectExecution",
    inputs: [
      { name: "requestId", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPendingRequests",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "sessionKey", type: "address" },
          { name: "target", type: "address" },
          { name: "musdAmount", type: "uint256" },
          { name: "callData", type: "bytes" },
          { name: "requestedAt", type: "uint256" },
          { name: "executed", type: "bool" },
          { name: "rejected", type: "bool" },
          { name: "memo", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  // Events
  {
    type: "event",
    name: "SessionKeyCreated",
    inputs: [
      { indexed: true, name: "sessionKey", type: "address" },
      { indexed: false, name: "hourlyLimit", type: "uint256" },
      { indexed: false, name: "dailyLimit", type: "uint256" },
      { indexed: false, name: "maxPerTx", type: "uint256" },
      { indexed: false, name: "validUntil", type: "uint256" },
      { indexed: false, name: "restrictTargets", type: "bool" },
      { indexed: false, name: "label", type: "string" },
    ],
  },
  {
    type: "event",
    name: "SessionKeyRevoked",
    inputs: [{ indexed: true, name: "sessionKey", type: "address" }],
  },
  {
    type: "event",
    name: "AgentActionExecuted",
    inputs: [
      { indexed: true, name: "sessionKey", type: "address" },
      { indexed: true, name: "target", type: "address" },
      { indexed: false, name: "musdAmount", type: "uint256" },
      { indexed: false, name: "data", type: "bytes" },
      { indexed: false, name: "success", type: "bool" },
    ],
  },
  {
    type: "event",
    name: "ExecutionRequested",
    inputs: [
      { indexed: true, name: "requestId", type: "uint256" },
      { indexed: true, name: "sessionKey", type: "address" },
      { indexed: true, name: "target", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "memo", type: "string" },
    ],
  },
  {
    type: "event",
    name: "ExecutionApproved",
    inputs: [
      { indexed: true, name: "requestId", type: "uint256" },
      { indexed: true, name: "approver", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export function getPublicClient() {
  // Try local anvil RPC first, fallback to testnet RPC
  return createPublicClient({
    chain: mezoChain,
    transport: http(MEZO_CONFIG.localRpcUrl),
  });
}

export function getFallbackPublicClient() {
  return createPublicClient({
    chain: mezoChain,
    transport: http(MEZO_CONFIG.rpcUrl),
  });
}

export function getBrowserWalletClient() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return null;
  }
  return createWalletClient({
    chain: mezoChain,
    transport: custom((window as any).ethereum),
  });
}

/**
 * Fetch live on-chain balances for account
 */
export async function fetchLiveBalances(accountAddress: Address, musdAddress: Address) {
  try {
    let client = getPublicClient();
    try {
      const [rawMUSD, rawBTC] = (await client.readContract({
        address: accountAddress,
        abi: MEZO_ACCOUNT_ABI,
        functionName: "getAccountBalance",
      })) as [bigint, bigint];

      return {
        musdBalance: parseFloat(formatEther(rawMUSD)),
        btcGasBalance: parseFloat(formatEther(rawBTC)),
        isLive: true,
      };
    } catch {
      // Fallback to testnet RPC
      client = getFallbackPublicClient();
      const [rawMUSD, rawBTC] = (await client.readContract({
        address: accountAddress,
        abi: MEZO_ACCOUNT_ABI,
        functionName: "getAccountBalance",
      })) as [bigint, bigint];

      return {
        musdBalance: parseFloat(formatEther(rawMUSD)),
        btcGasBalance: parseFloat(formatEther(rawBTC)),
        isLive: true,
      };
    }
  } catch (err) {
    console.warn("Could not fetch live on-chain balances:", err);
    return null;
  }
}

/**
 * Fetch live registered session keys directly from the smart contract
 */
export async function fetchLiveSessionKeys(accountAddress: Address): Promise<SessionKeyItem[]> {
  try {
    const client = getPublicClient();
    const registeredKeys = (await client.readContract({
      address: accountAddress,
      abi: MEZO_ACCOUNT_ABI,
      functionName: "getRegisteredKeys",
    })) as Address[];

    if (!registeredKeys || registeredKeys.length === 0) {
      return [];
    }

    const keys: SessionKeyItem[] = [];
    for (let i = 0; i < registeredKeys.length; i++) {
      const keyAddr = registeredKeys[i];
      try {
        const [policy, hourlySpent, dailySpent] = (await Promise.all([
          client.readContract({
            address: accountAddress,
            abi: MEZO_ACCOUNT_ABI,
            functionName: "sessionPolicies",
            args: [keyAddr],
          }),
          client.readContract({
            address: accountAddress,
            abi: MEZO_ACCOUNT_ABI,
            functionName: "getHourlySpent",
            args: [keyAddr],
          }),
          client.readContract({
            address: accountAddress,
            abi: MEZO_ACCOUNT_ABI,
            functionName: "getDailySpent",
            args: [keyAddr],
          }),
        ])) as any;

        keys.push({
          id: `sk_onchain_${keyAddr.slice(2, 8)}`,
          label: policy[6] || `Agent Key ${i + 1}`,
          keyAddress: keyAddr,
          privateKey:
            keyAddr.toLowerCase() === MEZO_CONFIG.demoSigners.agentSigner.toLowerCase()
              ? MEZO_CONFIG.demoSigners.agentPrivateKey
              : undefined,
          hourlyLimit: parseFloat(formatEther(policy[1])),
          hourlySpent: parseFloat(formatEther(hourlySpent)),
          dailyLimit: parseFloat(formatEther(policy[2])),
          dailySpent: parseFloat(formatEther(dailySpent)),
          validUntil: Number(policy[4]) * 1000,
          active: policy[0],
          restrictTargets: policy[5],
          allowedTargets: [],
        });
      } catch (keyErr) {
        console.warn(`Error querying policy for key ${keyAddr}:`, keyErr);
      }
    }

    return keys;
  } catch (err) {
    console.warn("Could not fetch on-chain session keys:", err);
    return [];
  }
}

/**
 * Fetch live pending human approval requests
 */
export async function fetchLivePendingRequests(accountAddress: Address): Promise<PendingRequestItem[]> {
  try {
    const client = getPublicClient();
    const raw = (await client.readContract({
      address: accountAddress,
      abi: MEZO_ACCOUNT_ABI,
      functionName: "getPendingRequests",
    })) as any[];

    return raw
      .filter((r: any) => !r.executed && !r.rejected)
      .map((r: any) => ({
        id: `req_${r.id.toString()}`,
        onChainId: Number(r.id),
        sessionKey: r.sessionKey,
        agentLabel: "Autonomous Agent",
        target: r.target,
        musdAmount: parseFloat(formatEther(r.musdAmount)),
        memo: r.memo || "High-value spend request requiring approval",
        requestedAt: Number(r.requestedAt) * 1000,
        status: "PENDING" as const,
      }));
  } catch (err) {
    console.warn("Could not fetch on-chain pending requests:", err);
    return [];
  }
}

/**
 * Fetch live activity logs directly from blockchain event logs
 */
export async function fetchLiveActivityLogs(accountAddress: Address): Promise<ActivityLog[]> {
  try {
    const client = getPublicClient();
    const logs = await client.getLogs({
      address: accountAddress,
      fromBlock: BigInt(0),
      toBlock: "latest",
    });

    if (!logs || logs.length === 0) {
      return [];
    }

    const activityLogs: ActivityLog[] = [];

    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      const topic = log.topics[0];

      // SessionKeyCreated event
      if (topic === "0xb6b1b46f72360911d0149387199f54eb5df87f5329a3e1ac4a0f50fd9553582c") {
        activityLogs.push({
          id: `log_evt_${log.transactionHash}_${log.logIndex}`,
          type: "CREATE_KEY",
          title: "Session Key Created On-Chain",
          description: `Authorized agent key with cryptographic limits on Bitcoin L2 Testnet (Block #${log.blockNumber})`,
          txHash: log.transactionHash!,
          timestamp: Date.now() - (logs.length - i) * 60000,
          status: "SUCCESS",
        });
      }
      // AgentActionExecuted event
      else if (topic === "0x5a2974dd24f028c3773deb2faee5f193a851d6a7289d97f1ea38d287ac7df1e5") {
        activityLogs.push({
          id: `log_evt_${log.transactionHash}_${log.logIndex}`,
          type: "PAYMENT",
          title: "Autonomous Agent Payment",
          description: `Agent executed verified transfer within sliding window allowance (Block #${log.blockNumber})`,
          txHash: log.transactionHash!,
          timestamp: Date.now() - (logs.length - i) * 45000,
          status: "SUCCESS",
        });
      }
      // ExecutionRequested event
      else if (topic === "0xa8c1e3072f02514cca738a2293b60370abf52a3f116ce0a1f78b237cdc2689c3") {
        activityLogs.push({
          id: `log_evt_${log.transactionHash}_${log.logIndex}`,
          type: "PAYMENT",
          title: "Human Approval Requested",
          description: `Spend exceeded micro-threshold, queued for multi-sig owner sign-off (Block #${log.blockNumber})`,
          txHash: log.transactionHash!,
          timestamp: Date.now() - (logs.length - i) * 30000,
          status: "PENDING",
        });
      }
      // ExecutionApproved event
      else if (topic === "0x6f7b32dd6adf35e6058ea71fdbdea9111daea80e6f1a0e5d3d975683d04c1e0a") {
        activityLogs.push({
          id: `log_evt_${log.transactionHash}_${log.logIndex}`,
          type: "PAYMENT",
          title: "Human Approval Disbursed",
          description: `Owner confirmed high-value execution on-chain; funds disbursed to target (Block #${log.blockNumber})`,
          txHash: log.transactionHash!,
          timestamp: Date.now() - (logs.length - i) * 20000,
          status: "SUCCESS",
        });
      }
      // SessionKeyRevoked event
      else if (topic === "0x17c796fb82086b3c9effaec517342e5ca9ed8fd78c339137ec082f748ab60cbe") {
        activityLogs.push({
          id: `log_evt_${log.transactionHash}_${log.logIndex}`,
          type: "REVOKE",
          title: "Session Key Revoked",
          description: `Owner revoked agent key cryptographic authorization on-chain (Block #${log.blockNumber})`,
          txHash: log.transactionHash!,
          timestamp: Date.now() - (logs.length - i) * 10000,
          status: "SUCCESS",
        });
      }
    }

    return activityLogs;
  } catch (err) {
    console.warn("Could not fetch on-chain activity logs:", err);
    return [];
  }
}

/**
 * Claim testnet faucet tokens on-chain
 */
export async function executeLiveFaucetClaim(userAddress: Address, musdAddress: Address): Promise<Hash> {
  const walletClient = getBrowserWalletClient();
  const publicClient = getPublicClient();

  if (walletClient) {
    const hash = await walletClient.writeContract({
      address: musdAddress,
      abi: ERC20_ABI,
      functionName: "mint",
      args: [userAddress, parseEther("1000")],
      account: userAddress,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  // Fallback to demo owner signer
  const ownerAcc = privateKeyToAccount(MEZO_CONFIG.demoSigners.ownerPrivateKey as `0x${string}`);
  const client = createWalletClient({
    account: ownerAcc,
    chain: mezoChain,
    transport: http(MEZO_CONFIG.localRpcUrl),
  });
  const hash = await client.writeContract({
    address: musdAddress,
    abi: ERC20_ABI,
    functionName: "mint",
    args: [userAddress, parseEther("1000")],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * Approve a pending request on-chain by the owner
 */
export async function executeLiveApprove(
  accountAddress: Address,
  ownerAddress: Address,
  requestId: number
): Promise<Hash> {
  const walletClient = getBrowserWalletClient();
  const publicClient = getPublicClient();

  if (walletClient) {
    const hash = await walletClient.writeContract({
      address: accountAddress,
      abi: MEZO_ACCOUNT_ABI,
      functionName: "approveExecution",
      args: [BigInt(requestId)],
      account: ownerAddress,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  // Fallback to demo owner
  const ownerAcc = privateKeyToAccount(MEZO_CONFIG.demoSigners.ownerPrivateKey as `0x${string}`);
  const client = createWalletClient({
    account: ownerAcc,
    chain: mezoChain,
    transport: http(MEZO_CONFIG.localRpcUrl),
  });
  const hash = await client.writeContract({
    address: accountAddress,
    abi: MEZO_ACCOUNT_ABI,
    functionName: "approveExecution",
    args: [BigInt(requestId)],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * Revoke an agent session key on-chain
 */
export async function executeLiveRevokeKey(
  accountAddress: Address,
  ownerAddress: Address,
  sessionKey: Address
): Promise<Hash> {
  const walletClient = getBrowserWalletClient();
  const publicClient = getPublicClient();

  if (walletClient) {
    const hash = await walletClient.writeContract({
      address: accountAddress,
      abi: MEZO_ACCOUNT_ABI,
      functionName: "revokeSessionKey",
      args: [sessionKey],
      account: ownerAddress,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  // Fallback to demo owner
  const ownerAcc = privateKeyToAccount(MEZO_CONFIG.demoSigners.ownerPrivateKey as `0x${string}`);
  const client = createWalletClient({
    account: ownerAcc,
    chain: mezoChain,
    transport: http(MEZO_CONFIG.localRpcUrl),
  });
  const hash = await client.writeContract({
    address: accountAddress,
    abi: MEZO_ACCOUNT_ABI,
    functionName: "revokeSessionKey",
    args: [sessionKey],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * Create a new session key on-chain
 */
export async function executeLiveCreateKey(
  accountAddress: Address,
  ownerAddress: Address,
  params: {
    keySigner: Address;
    hourlyLimit: number;
    dailyLimit: number;
    maxPerTx: number;
    durationDays: number;
    label: string;
  }
): Promise<Hash> {
  const walletClient = getBrowserWalletClient();
  const publicClient = getPublicClient();
  const validUntil = BigInt(Math.floor(Date.now() / 1000) + params.durationDays * 86400);

  if (walletClient) {
    const hash = await walletClient.writeContract({
      address: accountAddress,
      abi: MEZO_ACCOUNT_ABI,
      functionName: "createSessionKey",
      args: [
        params.keySigner,
        parseEther(params.hourlyLimit.toString()),
        parseEther(params.dailyLimit.toString()),
        parseEther(params.maxPerTx.toString()),
        validUntil,
        false,
        [],
        [],
        params.label,
      ],
      account: ownerAddress,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  // Fallback to demo owner
  const ownerAcc = privateKeyToAccount(MEZO_CONFIG.demoSigners.ownerPrivateKey as `0x${string}`);
  const client = createWalletClient({
    account: ownerAcc,
    chain: mezoChain,
    transport: http(MEZO_CONFIG.localRpcUrl),
  });
  const hash = await client.writeContract({
    address: accountAddress,
    abi: MEZO_ACCOUNT_ABI,
    functionName: "createSessionKey",
    args: [
      params.keySigner,
      parseEther(params.hourlyLimit.toString()),
      parseEther(params.dailyLimit.toString()),
      parseEther(params.maxPerTx.toString()),
      validUntil,
      false,
      [],
      [],
      params.label,
    ],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * Execute an agent action live on-chain using the agent session key
 */
export async function executeLiveAgentAction(params: {
  accountAddress: Address;
  agentPrivateKey?: `0x${string}`;
  target: Address;
  musdAmount: number;
  data?: `0x${string}`;
  memo?: string;
  isApprovalRequest?: boolean;
}): Promise<{ hash: Hash; isRequest?: boolean }> {
  const pk = params.agentPrivateKey || (MEZO_CONFIG.demoSigners.agentPrivateKey as `0x${string}`);
  const agentAccount = privateKeyToAccount(pk);

  const walletClient = createWalletClient({
    account: agentAccount,
    chain: mezoChain,
    transport: http(MEZO_CONFIG.localRpcUrl),
  });
  const publicClient = getPublicClient();

  const amountWei = parseEther(params.musdAmount.toString());
  const callData = params.data || "0x";

  if (params.isApprovalRequest) {
    const hash = await walletClient.writeContract({
      address: params.accountAddress,
      abi: MEZO_ACCOUNT_ABI,
      functionName: "requestExecution",
      args: [params.target, amountWei, callData, params.memo || "High-value spend request"],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return { hash, isRequest: true };
  }

  const hash = await walletClient.writeContract({
    address: params.accountAddress,
    abi: MEZO_ACCOUNT_ABI,
    functionName: "executeAsAgent",
    args: [params.target, amountWei, callData],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return { hash, isRequest: false };
}

/**
 * Execute bridge deposit of USDC to MUSD live on-chain
 */
export async function executeLiveBridgeDeposit(
  targetAccount: Address,
  usdcAmount: number
): Promise<Hash> {
  const publicClient = getPublicClient();
  const ownerAcc = privateKeyToAccount(MEZO_CONFIG.demoSigners.ownerPrivateKey as `0x${string}`);
  const client = createWalletClient({
    account: ownerAcc,
    chain: mezoChain,
    transport: http(MEZO_CONFIG.localRpcUrl),
  });

  const musdAmountWei = parseEther(usdcAmount.toString());

  // Mint MUSD to target smart account representing cross-chain bridged liquidity
  const hash = await client.writeContract({
    address: MEZO_CONFIG.musdAddress as Address,
    abi: ERC20_ABI,
    functionName: "mint",
    args: [targetAccount, musdAmountWei],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

