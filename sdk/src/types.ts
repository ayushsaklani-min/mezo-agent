import type { Address, Hash, Hex } from "viem";

export interface MezoNetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const MEZO_TESTNET: MezoNetworkConfig = {
  chainId: 31611,
  name: "Mezo Testnet",
  rpcUrl: "https://rpc.test.mezo.org",
  explorerUrl: "https://explorer.test.mezo.org",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18,
  },
};

export const MEZO_MAINNET: MezoNetworkConfig = {
  chainId: 31612,
  name: "Mezo Mainnet",
  rpcUrl: "https://mezo.drpc.org",
  explorerUrl: "https://explorer.mezo.org",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18,
  },
};

export interface AgentClientConfig {
  accountAddress: Address;
  sessionPrivateKey: Hex;
  rpcUrl?: string;
  network?: MezoNetworkConfig;
}

export interface SessionPolicyView {
  active: boolean;
  hourlyLimit: bigint;
  dailyLimit: bigint;
  validUntil: bigint;
  hourlySpent: bigint;
  dailySpent: bigint;
  restrictTargets: boolean;
  label: string;
}

export interface PaymentParams {
  recipient: Address;
  amountInMUSD: string | number; // String or number in standard MUSD units (e.g. "0.5")
  calldata?: Hex;
  memo?: string;
}

export interface ExecutionReceipt {
  success: boolean;
  txHash: Hash;
  musdSpent: string;
  remainingHourlyBudget: string;
  remainingDailyBudget: string;
  recipient: Address;
  timestamp: number;
}
