# MezoAgent: Autonomous AI Agent Smart Accounts & Treasury on Mezo

[![Live App](https://img.shields.io/badge/Live%20Demo-dashboard--iota--blue--90.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://dashboard-iota-blue-90.vercel.app)
[![npm version](https://img.shields.io/badge/npm-mezo--agent--sdk%20v1.0.0-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/mezo-agent-sdk)
[![Mezo Network](https://img.shields.io/badge/Mezo-Testnet%20(31611)-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white)](https://mezo.org)
[![Akindo Buildathon](https://img.shields.io/badge/Akindo-Build%20with%20MUSD%20%26%20MEZO-FF7A00?style=for-the-badge)](https://app.akindo.io)
[![Solidity Tests](https://img.shields.io/badge/Foundry%20Tests-25%2F25%20Passing-emerald?style=for-the-badge)](contracts/)
[![Formal Invariants](https://img.shields.io/badge/Fuzz%20Invariants-128k%20Calls%20Passed-blue?style=for-the-badge)](contracts/test/MezoAgentAccountInvariants.t.sol)
[![SDK Tests](https://img.shields.io/badge/SDK%20Tests-17%2F17%20Passing-indigo?style=for-the-badge)](sdk/)

> **🌐 Live Landing Page:** [https://dashboard-iota-blue-90.vercel.app](https://dashboard-iota-blue-90.vercel.app)  
> **⚡ Live Institutional Cockpit:** [https://dashboard-iota-blue-90.vercel.app/app](https://dashboard-iota-blue-90.vercel.app/app)  
> **📦 Official npm SDK:** [https://www.npmjs.com/package/mezo-agent-sdk](https://www.npmjs.com/package/mezo-agent-sdk)  
> **📄 Product & Security Specification:** [Google Docs Link](https://docs.google.com/document/d/1SyiFX6o2_Cy-hZ8FGZHAh82iRf-9LeO0AsDHEwSRIV4/edit)  
> **🏆 AKINDO Buildathon Track:** "Build with MUSD and MEZO" ($7,000 USD Prize Pool)  
> • *Track 1: Access & Distribution for MUSD/MEZO (Agentic Tools / AI Wallets)*  
> • *Track 2: DeFi Yield Stacking*

### Deployed Smart Contracts (Mezo Testnet Chain ID: `31611`)

| Contract | Address | Explorer |
| :--- | :--- | :--- |
| **MezoAgentFactory** | `0x199468533b66d7F3B3673f4C79374EB70932a99E` | [View on Mezo Explorer](https://explorer.test.mezo.org/address/0x199468533b66d7F3B3673f4C79374EB70932a99E) |
| **MezoAgentAccount (Vault)** | `0x98f483D0b028d77aE37B6d123C34954Af248dC94` | [View on Mezo Explorer](https://explorer.test.mezo.org/address/0x98f483D0b028d77aE37B6d123C34954Af248dC94) |
| **MUSD Stablecoin** | `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9` | [View on Mezo Explorer](https://explorer.test.mezo.org/address/0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9) |

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

## 4. Smart Contracts & Formal Verification

### Key Contract Security Invariants
* **12-Bucket Sliding-Window Spend Envelope:** Unlike naive fixed windows vulnerable to boundary double-spend attacks (spending at 0:59 and 1:01), MezoAgent slices every hour into 12 distinct 300-second buckets. The spending envelope enforces true sliding-window velocity.
* **Granular Target & Function Selector Whitelisting:** Session keys are scoped to exact `(targetAddress, bytes4 selector)` tuples. Even if an agent interacts with a whitelisted ERC20 or router, unauthorized `approve()` or arbitrary method calls are blocked and reverted on-chain.
* **Max-Per-Transaction Cap (`maxPerTx`):** Guarantees that rogue or compromised agents cannot liquidate an entire hourly allocation in a single batch call.
* **Human-in-the-Loop Threshold Queue:** Autonomous micro-transactions (e.g. < $10.00 MUSD) disburse instantly, while high-value actions automatically route into an on-chain execution queue requiring master owner or Safe multisig approval.
* **EIP-1271 Smart Contract Wallet & Safe Multisig Compatibility:** Full support for `IERC1271.isValidSignature`, allowing DAOs and Gnosis Safe treasuries to own agent accounts and sign off on limit raises.
* **Emergency Circuit Breakers:** OpenZeppelin `Pausable` support, `revokeAllSessionKeys()`, and dedicated security `guardian` role.

### Running Foundry Invariant & Unit Tests
```bash
cd contracts
forge test -vvv
```

**Results (25 Passed, 0 Failed, 0 Skipped):**
```
Ran 22 tests for test/MezoAgentAccount.t.sol:MezoAgentAccountTest
[PASS] testFuzz_RateLimitBoundaries(uint96,uint96) (runs: 256)
[PASS] test_CreateSessionKey()
[PASS] test_CrossChainBridge()
[PASS] test_DailyLimitExceededAcrossWindows()
[PASS] test_EIP1271_SignatureValidation()
[PASS] test_ExecuteAsAgent_ExceedsHourlyLimit()
[PASS] test_ExecuteAsAgent_Expired()
[PASS] test_ExecuteAsAgent_Revoked()
[PASS] test_ExecuteAsAgent_Success()
[PASS] test_ExecuteAsAgent_TargetNotAllowed()
[PASS] test_FactoryDeployment()
[PASS] test_HumanInTheLoop_ApprovalQueue()
[PASS] test_HumanInTheLoop_Reject()
[PASS] test_InitialState()
[PASS] test_MaxPerTxCap()
[PASS] test_MultipleSessionKeys_Isolation()
[PASS] test_SlidingWindowBucketing()
[PASS] test_TokenAllowlistRestriction()
[PASS] test_WindowReset()
[PASS] test_WithdrawGas_OnlyOwner()
[PASS] test_WithdrawMUSD_OnlyOwner()
[PASS] test_WithdrawMUSD_RevertsOnNonOwner()

Ran 3 tests for test/MezoAgentAccountInvariants.t.sol:MezoAgentAccountInvariantTest
[PASS] invariant_KeyIsolation() (runs: 256, calls: 128000)
[PASS] invariant_RevokedKeysCannotSpend() (runs: 256, calls: 128000)
[PASS] invariant_SpentNeverExceedsLimits() (runs: 256, calls: 128000)
Suite result: ok. 25 passed; 0 failed; 0 skipped
```

---

## 5. TypeScript SDK (`mezo-agent-sdk`)

[![npm](https://img.shields.io/npm/v/mezo-agent-sdk.svg)](https://www.npmjs.com/package/mezo-agent-sdk)

The production SDK is published on the official npm registry: [https://www.npmjs.com/package/mezo-agent-sdk](https://www.npmjs.com/package/mezo-agent-sdk)

### Installation
```bash
npm install mezo-agent-sdk viem
```

### Autonomous Agent Integration
```typescript
import { MezoAgentClient, MEZO_TESTNET } from "mezo-agent-sdk";

// 1. Initialize client using the agent's ephemeral session key
const agent = new MezoAgentClient({
  accountAddress: "0x98f483D0b028d77aE37B6d123C34954Af248dC94",
  sessionPrivateKey: process.env.AGENT_SESSION_PRIVATE_KEY!,
  network: MEZO_TESTNET,
});

// 2. Check remaining hourly spending allowance
const remainingBudget = await agent.getRemainingHourlyBudget();
console.log(`Current hourly budget: ${remainingBudget} MUSD`);

// 3. Autonomously pay for an API query
const receipt = await agent.payService({
  recipient: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
  amountInMUSD: "0.50",
  memo: "Per-call web search oracle",
});

console.log(`Transaction confirmed on Mezo: ${receipt.txHash}`);
```

---

## 6. Next.js 14 Production Web Application

The platform features a dual-route architecture built for both high-converting landing presentation and institutional operations:
* **Landing Page (`/`):** Interactive hero simulation widget, velocity envelope visualizer, problem vs. solution chapter, feature bento grid, and SDK showcase.
* **Institutional Cockpit (`/app`):** Full-screen treasury cockpit with tabbed workstations:
  * **Liquidity & Terminal:** Cross-chain bridge with 1-click testnet mock USDC faucet drip and live monospace execution terminal.
  * **Session Keys:** Ephemeral key manager supporting ZK Secure Enclave public key import and quick sandbox generation with 12-bucket sliding spend meters.
  * **Approvals Queue:** Human-in-the-loop pending execution requests exceeding the $10 micro-threshold with on-chain Approve / Reject actions.
  * **Audit Ledger:** Chronological transaction ledger with Mezo Explorer links and 1-click forensic CSV & SIEM JSON exports.

### Running the Web App Locally
```bash
cd dashboard
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the landing page or [http://localhost:3000/app](http://localhost:3000/app) for the cockpit.

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
