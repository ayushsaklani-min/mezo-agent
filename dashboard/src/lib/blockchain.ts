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
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { MEZO_CONFIG } from "./constants";

export const mezoChain = defineChain({
  id: MEZO_CONFIG.chainId,
  name: MEZO_CONFIG.name,
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [MEZO_CONFIG.rpcUrl] },
  },
  blockExplorers: {
    default: { name: "MezoScan", url: MEZO_CONFIG.explorerUrl },
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
    const client = getPublicClient();
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
  } catch (err) {
    console.warn("Could not fetch live on-chain balances, using fallback:", err);
    return null;
  }
}

/**
 * Fetch live pending human approval requests
 */
export async function fetchLivePendingRequests(accountAddress: Address) {
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
        agentLabel: "Autonomous Mezo Agent",
        target: r.target,
        musdAmount: parseFloat(formatEther(r.musdAmount)),
        memo: r.memo || "High-value spend request requiring approval",
        requestedAt: Number(r.requestedAt) * 1000,
        status: "PENDING" as const,
      }));
  } catch (err) {
    console.warn("Could not fetch on-chain pending requests:", err);
    return null;
  }
}

/**
 * Claim testnet faucet tokens on-chain
 */
export async function executeLiveFaucetClaim(userAddress: Address, musdAddress: Address): Promise<Hash> {
  const walletClient = getBrowserWalletClient();
  if (!walletClient) throw new Error("No Web3 wallet connected");

  const hash = await walletClient.writeContract({
    address: musdAddress,
    abi: ERC20_ABI,
    functionName: "mint",
    args: [userAddress, parseEther("1000")],
    account: userAddress,
  });

  const publicClient = getPublicClient();
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
  if (!walletClient) throw new Error("No Web3 wallet connected");

  const hash = await walletClient.writeContract({
    address: accountAddress,
    abi: MEZO_ACCOUNT_ABI,
    functionName: "approveExecution",
    args: [BigInt(requestId)],
    account: ownerAddress,
  });

  const publicClient = getPublicClient();
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
  if (!walletClient) throw new Error("No Web3 wallet connected");

  const hash = await walletClient.writeContract({
    address: accountAddress,
    abi: MEZO_ACCOUNT_ABI,
    functionName: "revokeSessionKey",
    args: [sessionKey],
    account: ownerAddress,
  });

  const publicClient = getPublicClient();
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
  if (!walletClient) throw new Error("No Web3 wallet connected");

  const validUntil = BigInt(Math.floor(Date.now() / 1000) + params.durationDays * 86400);

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

  const publicClient = getPublicClient();
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
