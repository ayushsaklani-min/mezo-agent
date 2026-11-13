export const MEZO_CONFIG = {
  chainId: 31611,
  chainIdHex: "0x7b7b",
  name: "Bitcoin L2 Testnet",
  rpcUrl: "https://rpc.test.mezo.org",
  localRpcUrl: "http://127.0.0.1:8545",
  explorerUrl: "https://explorer.test.mezo.org",
  faucetUrl: "https://faucet.test.mezo.org",
  musdAddress: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  factoryAddress: "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0",
  accountAddress: "0x75537828f2ce51be7289709686A69CbFDbB714F1",
  usdcAddress: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
  bridgeRouterAddress: "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
  recipientAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  gasToken: "BTC",
  demoSigners: {
    owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    ownerPrivateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    agentSigner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    agentPrivateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  networkTier: {
    type: "Bitcoin L2 Autonomous Layer",
    consensus: "BTC Staking & Proof-of-Yield",
  },
};

export const INITIAL_ACCOUNT_DATA = {
  accountAddress: "0x75537828f2ce51be7289709686A69CbFDbB714F1",
  ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  musdBalance: 935.0,
  usdcBridged: 1000.0,
  btcGasBalance: 0.05,
  stackedBtcYield: 0.00412,
};

export const INITIAL_SESSION_KEYS: any[] = [];

// Differentiator 1: Self-Funding Endowment Vault Initial State
export const INITIAL_ENDOWMENT_VAULT = {
  principalMUSD: 5000.0,
  btcPrincipal: 0.15,
  apy: 8.4, // 8.4% APY on Bitcoin staking & MUSD yield
  accruedYieldMUSD: 42.68,
  accruedBtcYield: 0.00126,
  autoCompound: false,
  yieldDrawnTotal: 18.25,
  isActive: true,
  lastUpdated: Date.now(),
};

// Differentiator 3: Agent-to-Agent (A2A) Micro-Invoices Initial State
export const INITIAL_A2A_INVOICES = [
  {
    id: "inv_1",
    invoiceNumber: "INV-2026-0891",
    sellerAgent: "DeepSeek Formal Invariant Auditor",
    sellerAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    buyerAgent: "Autonomous Research Orchestrator",
    buyerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    serviceName: "Formal Bytecode Verification & Invariant Proof",
    deliverableCid: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    deliverableSummary: "128,000 invariant fuzz states passed; zero reentrancy or double-spend vectors detected.",
    amountMUSD: 1.5,
    timestamp: Date.now() - 3600000,
    status: "SETTLED" as const,
    txHash: "0x98f4e247e8c1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7",
  },
  {
    id: "inv_2",
    invoiceNumber: "INV-2026-0892",
    sellerAgent: "Perplexity Web-Search Oracle",
    sellerAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    buyerAgent: "Autonomous Research Orchestrator",
    buyerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    serviceName: "Live Bitcoin Mempool & Macro Sentiment Scrape",
    deliverableCid: "ipfs://bafybeifxace239kfj20fj290fj209fj209fkslsfjk2938jsldf",
    deliverableSummary: "Fetched 142 live transaction traces & fee estimates from Bitcoin L1 mempool.",
    amountMUSD: 0.75,
    timestamp: Date.now() - 1800000,
    status: "SETTLED" as const,
    txHash: "0x12c4b8e99d0123456789abcdef0123456789abcdef0123456789abcdef012345",
  },
  {
    id: "inv_3",
    invoiceNumber: "INV-2026-0893",
    sellerAgent: "Wormhole NTT Fast Liquidity Relayer",
    sellerAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    buyerAgent: "Autonomous Research Orchestrator",
    buyerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    serviceName: "Cross-Chain Relayer Gas Hedging & Routing",
    deliverableCid: "ipfs://bafybeicm37dnqp20948fh10293h47g019284h019284hf",
    deliverableSummary: "Relayed 250 USDC inbound payload from Base to Bitcoin L2 Testnet (Chain ID 31611).",
    amountMUSD: 2.2,
    timestamp: Date.now() - 600000,
    status: "ISSUED" as const,
  },
];
