export const MEZO_CONFIG = {
  chainId: 31611,
  chainIdHex: "0x7b7b",
  name: "Mezo Testnet",
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
  buildathon: {
    event: "Build with MUSD and MEZO",
    platform: "AKINDO",
    track: "Access & Distribution (Agentic Tools / AI Wallets)",
    prizePool: "$7,000 in MEZO Grants",
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
