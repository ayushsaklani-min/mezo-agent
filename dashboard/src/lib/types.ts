export interface SessionKeyItem {
  id: string;
  label: string;
  keyAddress: string;
  privateKey?: string;
  hourlyLimit: number;
  hourlySpent: number;
  dailyLimit: number;
  dailySpent: number;
  validUntil: number;
  active: boolean;
  restrictTargets: boolean;
  allowedTargets: string[];
  // Differentiator 2: Auto-Quarantine Circuit Breaker
  status?: "ACTIVE" | "QUARANTINED" | "REVOKED";
  consecutiveReverts?: number;
  quarantineReason?: string;
  quarantinedAt?: number;
}

export interface ActivityLog {
  id: string;
  type: "PAYMENT" | "BRIDGE" | "REVOKE" | "CREATE_KEY" | "YIELD_DCA" | "QUARANTINE" | "A2A_SETTLEMENT" | "ENDOWMENT_DEPOSIT";
  title: string;
  description: string;
  amount?: string;
  txHash: string;
  timestamp: number;
  status: "SUCCESS" | "PENDING" | "REVERTED";
}

// Differentiator 1: Self-Funding Endowment Vault
export interface EndowmentVault {
  principalMUSD: number;
  btcPrincipal: number;
  apy: number;
  accruedYieldMUSD: number;
  accruedBtcYield: number;
  autoCompound: boolean;
  yieldDrawnTotal: number;
  isActive: boolean;
  lastUpdated: number;
}

// Differentiator 3: Agent-to-Agent (A2A) Micro-Invoicing & Settlement
export interface A2AInvoice {
  id: string;
  invoiceNumber: string;
  sellerAgent: string;
  sellerAddress: string;
  buyerAgent: string;
  buyerAddress: string;
  serviceName: string;
  deliverableCid: string;
  deliverableSummary: string;
  amountMUSD: number;
  timestamp: number;
  status: "ISSUED" | "VERIFYING" | "SETTLED" | "DISPUTED";
  txHash?: string;
}
