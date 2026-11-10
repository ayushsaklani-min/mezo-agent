export const MEZO_CONFIG = {
  chainId: 31611,
  chainIdHex: "0x7b7b",
  name: "Mezo Testnet",
  rpcUrl: "https://rpc.test.mezo.org",
  explorerUrl: "https://explorer.test.mezo.org",
  faucetUrl: "https://faucet.test.mezo.org",
  musdAddress: "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186",
  gasToken: "BTC",
  buildathon: {
    event: "Build with MUSD and MEZO",
    platform: "AKINDO",
    track: "Access & Distribution (Agentic Tools / AI Wallets)",
    prizePool: "$7,000 in MEZO Grants",
  },
};

export const INITIAL_ACCOUNT_DATA = {
  accountAddress: "0x98f483D0b028d77aE37B6d123C34954Af248dC94",
  ownerAddress: "0x32A418E63991Ff71295E700b0d39e3B2F04eA312",
  musdBalance: 12500.0,
  usdcBridged: 8400.0,
  btcGasBalance: 0.145,
  stackedBtcYield: 0.0084,
};

export const INITIAL_SESSION_KEYS = [
  {
    id: "sk_1",
    label: "LLM Data & Web Scraper Agent",
    keyAddress: "0x71C02847a9D7881cE8F67C8E281F3e2D34E4c892",
    hourlyLimit: 15.0,
    hourlySpent: 3.25,
    dailyLimit: 60.0,
    dailySpent: 18.5,
    validUntil: Date.now() + 86400 * 1000 * 5, // 5 days
    active: true,
    restrictTargets: true,
    allowedTargets: [
      "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
    ],
  },
  {
    id: "sk_2",
    label: "Autonomous BTC Yield Looper",
    keyAddress: "0x4F921B66E0F1426cD0a9A7147b4A786d1C5e7F11",
    hourlyLimit: 50.0,
    hourlySpent: 22.0,
    dailyLimit: 200.0,
    dailySpent: 78.0,
    validUntil: Date.now() + 86400 * 1000 * 12, // 12 days
    active: true,
    restrictTargets: false,
    allowedTargets: [],
  },
  {
    id: "sk_3",
    label: "Compute Node Micro-Paymaster",
    keyAddress: "0xE822839AcC918C713dB3A680B1569B13481283dF",
    hourlyLimit: 5.0,
    hourlySpent: 4.8,
    dailyLimit: 30.0,
    dailySpent: 29.4,
    validUntil: Date.now() + 86400 * 1000 * 2, // 2 days
    active: true,
    restrictTargets: true,
    allowedTargets: ["0x555566667777888899990000aaaabbbbccccdddd"],
  },
];
