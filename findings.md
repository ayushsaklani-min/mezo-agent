# Findings & Architectural Decisions: MezoAgent

## 1. Network & Ecosystem Findings
- **Chain Architecture:** Mezo is EVM-compatible with Cosmos SDK/CometBFT underlying consensus.
- **Gas Token:** Unlike Ethereum/Base where ETH is gas, Mezo uses `BTC` (18 decimals) as the native fee token.
- **Testnet RPC:** `https://rpc.test.mezo.org` (Chain ID `31611`).
- **Standardized MUSD Contract:** `0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186` deployed cross-chain via Wormhole NTT.

## 2. Problem Space & Value Proposition
- AI agents are increasingly tasked with autonomous operations (e.g. paying for per-call APIs, purchasing datasets, rebalancing liquidity).
- Standard wallets store raw private keys in plaintext or environment variables. If an LLM is prompt-injected or compromised, all funds are stolen.
- **MezoAgent Solution:**
  1. Master Treasury holds MUSD funds on Mezo.
  2. Owner issues temporary **Session Keys** with:
     - Hard lifetime (e.g. 24 hours).
     - Strict rate limit (e.g. maximum 25 MUSD per hour).
     - Strict target whitelist (e.g. can only call specific service contracts or DEX routers).
  3. The agent signs transactions using its ephemeral session key. The `MezoAgentAccount` contract enforces the policy on-chain.

## 3. Akindo Hackathon Alignment
- Mezo specifically published Track 2 prompt: *"Agentic Tools / AI Wallets: Budget-controlled MUSD wallets or infrastructure tailored for AI agents interacting with the Mezo ecosystem."*
- Cross-chain bridge: Integrates USDC on Base/Ethereum seamlessly into MUSD on Mezo.
