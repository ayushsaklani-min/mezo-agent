# MezoAgent: Autonomous AI Agent Smart Accounts & Treasury on Mezo

[![Live App](https://img.shields.io/badge/Live%20Demo-dashboard--iota--blue--90.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://dashboard-iota-blue-90.vercel.app)
[![Mezo Network](https://img.shields.io/badge/Mezo-Testnet%20(31611)-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white)](https://mezo.org)
[![Akindo Buildathon](https://img.shields.io/badge/Akindo-Build%20with%20MUSD%20%26%20MEZO-FF7A00?style=for-the-badge)](https://app.akindo.io)
[![Solidity Tests](https://img.shields.io/badge/Foundry%20Tests-15%2F15%20Passing-emerald?style=for-the-badge)](contracts/)

> **Live Deployment:** [https://dashboard-iota-blue-90.vercel.app](https://dashboard-iota-blue-90.vercel.app)  
> **Submission for the "Build with MUSD and MEZO" Buildathon on AKINDO.**  
> Track: **Access & Distribution for MUSD/MEZO (Agentic Tools / AI Wallets)** and **DeFi Yield Stacking**.

---

## 1. Executive Summary

Autonomous AI agents (trading bots, data collectors, oracle crawlers, automated customer service) need capital to pay for APIs, compute, data feeds, and gas. However, giving an LLM full custody of a master private key is dangerous: prompt injections, memory exploits, or logic flaws can drain 100% of the funds in seconds.

**MezoAgent** solves this by providing **Budget-Controlled Smart Accounts with Cryptographic Session Keys** natively built for Mezo's Bitcoin economic layer:
1. **Isolated Smart Account (`MezoAgentAccount`):** Holds MUSD (Mezo's Bitcoin-backed stablecoin) and native BTC gas.
2. **Ephemeral Session Keys:** Users issue time-bound keys to AI agents with strict on-chain velocity limits (e.g. max $25 MUSD per hour, max $100 MUSD per day).
3. **Target Contract Whitelisting:** Agents can only spend MUSD at sanctioned target contracts (e.g. specific API paymasters, compute nodes, or DEX routers).
4. **Cross-Chain Inbound Liquidity:** Deposit USDC from Base or Ethereum → seamlessly routes into MUSD on Mezo via `MezoBridgeRouter`.
5. **Auto-DCA & Yield Stacking:** Idle MUSD yield is automatically harvested and converted into real native Bitcoin (Satoshis).

---

## 2. Architecture Overview

```
                               ┌─────────────────────────────┐
                               │     Master Owner / DAO      │
                               │   (Deposits USDC / MUSD)    │
                               └──────────────┬──────────────┘
                                              │
                    1. Issues Ephemeral Key   │  2. Whitelists Targets & Caps
                                              ▼
                        ┌───────────────────────────────────────────┐
                        │        MezoAgentAccount.sol               │
                        │                                           │
                        │   • MUSD Balance + BTC Gas Balance        │
                        │   • Hourly Velocity Limit Engine          │
                        │   • Daily Velocity Limit Engine           │
                        │   • Whitelisted Target Mapping            │
                        │   • Instant Owner Revocation Switch       │
                        └─────────────────────┬─────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │     Agent Session #1    │                     │     Agent Session #2    │
         │  • Pay LLM Search APIs  │                     │  • Auto-DCA Yield into  │
         │  • Max $15 MUSD / hour  │                     │    real native Bitcoin  │
         │  • Restrict to Oracles  │                     │  • Max $50 MUSD / hour  │
         └─────────────────────────┘                     └─────────────────────────┘
```

---

## 3. Repository Structure

```
mezo-agent/
├── contracts/                  # Foundry Smart Contracts
│   ├── src/
│   │   ├── MezoAgentAccount.sol # Core smart account with session key policy engine
│   │   ├── MezoAgentFactory.sol # Factory deploying deterministic agent accounts
│   │   ├── MezoBridgeRouter.sol # Cross-chain USDC -> MUSD router simulator
│   │   ├── MockMUSD.sol         # Mezo USD token (18 decimals)
│   │   └── MockUSDC.sol         # USDC token (6 decimals)
│   ├── test/
│   │   └── MezoAgentAccount.t.sol # 15 Unit, boundary, fuzz, and integration tests
│   └── script/
│       └── Deploy.s.sol         # Deployment script for Mezo Testnet
├── sdk/                        # TypeScript Agent SDK (@mezo-agent/sdk)
│   ├── src/
│   │   ├── client.ts            # MezoAgentClient for autonomous scripts
│   │   ├── agentRunner.ts       # Periodic autonomous execution loops
│   │   ├── types.ts             # Complete TypeScript interfaces & network definitions
│   │   └── abi.ts               # Strongly typed ABIs
│   └── test/
│       └── sdk.test.ts          # Automated SDK unit tests
├── dashboard/                  # Production Next.js 14 Web3 Dashboard
│   ├── src/
│   │   ├── app/                 # App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/          # Header, TreasuryMetrics, BridgeCard, SessionKeysManager, Sandbox
│   │   └── lib/                 # Constants, types, and Mezo config
└── README.md                   # Comprehensive project architecture & developer guide
```

---

## 4. Smart Contracts & Foundry Verification

### Key Contract Features
* **Reentrancy Protection:** All fund-moving methods protected by OpenZeppelin's `ReentrancyGuard`.
* **Safe Transfers:** Utilizes OpenZeppelin `SafeERC20` for token transfer safety.
* **Window-Based Velocity Resets:** Hourly windows (`block.timestamp / 3600`) and Daily windows (`block.timestamp / 86400`) ensure automatic allowance refreshes without requiring maintenance transactions.
* **Target Enforcement:** Optional whitelist flag restricts calls strictly to approved contract addresses.

### Running Foundry Tests
```bash
cd contracts
forge test -vv
```

**Results:**
```
Ran 15 tests for test/MezoAgentAccount.t.sol:MezoAgentAccountTest
[PASS] testFuzz_RateLimitBoundaries(uint96,uint96) (runs: 256)
[PASS] test_CreateSessionKey()
[PASS] test_CrossChainBridge()
[PASS] test_DailyLimitExceededAcrossWindows()
[PASS] test_ExecuteAsAgent_ExceedsHourlyLimit()
[PASS] test_ExecuteAsAgent_Expired()
[PASS] test_ExecuteAsAgent_Revoked()
[PASS] test_ExecuteAsAgent_Success()
[PASS] test_ExecuteAsAgent_TargetNotAllowed()
[PASS] test_FactoryDeployment()
[PASS] test_InitialState()
[PASS] test_MultipleSessionKeys_Isolation()
[PASS] test_WindowReset()
[PASS] test_WithdrawGas_OnlyOwner()
[PASS] test_WithdrawMUSD_OnlyOwner()
Suite result: ok. 15 passed; 0 failed; 0 skipped
```

---

## 5. TypeScript SDK (`@mezo-agent/sdk`)

Autonomous agent integration in 5 lines of code:

```typescript
import { MezoAgentClient, MEZO_TESTNET } from "@mezo-agent/sdk";

// 1. Initialize client using the agent's ephemeral session key
const agent = new MezoAgentClient({
  accountAddress: "0xAgentSmartAccountAddress...",
  sessionPrivateKey: process.env.AGENT_SESSION_PRIVATE_KEY,
  network: MEZO_TESTNET,
});

// 2. Check remaining hourly spending allowance
const remainingBudget = await agent.getRemainingHourlyBudget();
console.log(`Current hourly budget: ${remainingBudget} MUSD`);

// 3. Autonomously pay for an API query
const receipt = await agent.payService({
  recipient: "0xSearchOracleProvider...",
  amountInMUSD: "0.50",
  memo: "Per-call web search oracle",
});

console.log(`Transaction confirmed on Mezo: ${receipt.txHash}`);
```

---

## 6. Next.js 14 Production Dashboard

The dashboard provides master owners with real-time treasury monitoring, session key minting, bridge simulation, and an interactive agent execution sandbox.

### Running the Dashboard Locally
```bash
cd dashboard
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Key Interactive Features
1. **Cross-Chain Bridge:** Convert incoming USDC (from Base/Ethereum) directly into MUSD. Includes a 1-click **"+1,000 Mock USDC"** faucet button for instant evaluation.
2. **Session Key Manager:** Mint new session keys with custom hourly/daily allowances, expiration timers, and target restrictions.
3. **Live Execution Sandbox:** Trigger autonomous agent tasks (e.g. "Pay LLM Search API", "Auto-DCA to BTC") and watch the live monospace terminal verify cryptographic signatures and rate limits in real time.
4. **On-Chain Activity Feed:** Real-time stream of all events with direct links to the Mezo Testnet Explorer.

---

## 7. Mezo Testnet Network Parameters

* **Network Name:** Mezo Testnet
* **Chain ID:** `31611` (`0x7b7b`)
* **RPC Endpoint:** `https://rpc.test.mezo.org`
* **Block Explorer:** [https://explorer.test.mezo.org](https://explorer.test.mezo.org)
* **Gas Token:** `BTC` (18 decimals)
* **Standard MUSD Cross-Chain Contract:** `0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186`

---

## 8. License
MIT License. Open-source for the Mezo Network and Supernormal Foundation ecosystem.
