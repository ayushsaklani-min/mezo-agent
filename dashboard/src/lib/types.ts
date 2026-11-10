export interface SessionKeyItem {
  id: string;
  label: string;
  keyAddress: string;
  hourlyLimit: number;
  hourlySpent: number;
  dailyLimit: number;
  dailySpent: number;
  validUntil: number;
  active: boolean;
  restrictTargets: boolean;
  allowedTargets: string[];
}

export interface ActivityLog {
  id: string;
  type: "PAYMENT" | "BRIDGE" | "REVOKE" | "CREATE_KEY" | "YIELD_DCA";
  title: string;
  description: string;
  amount?: string;
  txHash: string;
  timestamp: number;
  status: "SUCCESS" | "PENDING" | "REVERTED";
}
