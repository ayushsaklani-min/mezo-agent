export const MEZO_AGENT_ACCOUNT_ABI = [
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
    name: "createSessionKey",
    inputs: [
      { name: "keySigner", type: "address" },
      { name: "hourlyLimit", type: "uint256" },
      { name: "dailyLimit", type: "uint256" },
      { name: "validUntil", type: "uint256" },
      { name: "restrictTargets", type: "bool" },
      { name: "allowedTargets", type: "address[]" },
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
    name: "getRemainingHourlyBudget",
    inputs: [{ name: "keySigner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRemainingDailyBudget",
    inputs: [{ name: "keySigner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
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
    name: "sessionPolicies",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "active", type: "bool" },
      { name: "hourlyLimit", type: "uint256" },
      { name: "dailyLimit", type: "uint256" },
      { name: "validUntil", type: "uint256" },
      { name: "hourlySpent", type: "uint256" },
      { name: "currentHourWindow", type: "uint256" },
      { name: "dailySpent", type: "uint256" },
      { name: "currentDayWindow", type: "uint256" },
      { name: "restrictTargets", type: "bool" },
      { name: "label", type: "string" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AgentActionExecuted",
    inputs: [
      { name: "sessionKey", type: "address", indexed: true },
      { name: "target", type: "address", indexed: true },
      { name: "musdAmount", type: "uint256", indexed: false },
      { name: "selector", type: "bytes4", indexed: false },
      { name: "callSuccess", type: "bool", indexed: false },
    ],
  },
] as const;

export const MEZO_FACTORY_ABI = [
  {
    type: "function",
    name: "createAccount",
    inputs: [{ name: "initialMUSD", type: "uint256" }],
    outputs: [{ name: "account", type: "address" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getUserAccounts",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
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
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "faucet",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
