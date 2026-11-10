# MezoAgent: Autonomous AI Agent Smart Accounts & Treasury Infrastructure on Mezo

**Product Specification & Technical Architecture**  
**Event:** Build with MUSD and MEZO (AKINDO Buildathon)  
**Track:** Access and Distribution for MUSD/MEZO (Agentic Tools / AI Wallets) & DeFi Yield  
**Author:** MezoAgent Core Team  
**Status:** In Progress / Alpha Specification  

---

## 1. Executive Summary

As autonomous AI agents evolve from read-only chatbots to on-chain economic actors, they require programmatic access to capital to pay for compute, API calls, oracle data feeds, storage, and cross-chain transactions. However, granting autonomous agents unconstrained access to private keys creates catastrophic financial vulnerability: prompt injections, model hallucinations, or server compromises can instantly drain an entire treasury.

**MezoAgent** solves this by introducing **Budget-Controlled Smart Accounts with Cryptographic Session Keys** natively built for **Mezo's Bitcoin economic layer**. 

Users or DAOs deposit **USDC** (from Base or Ethereum) or **MUSD** into an isolated MezoAgent Smart Account. They issue scoped, time-bound **Session Keys** to autonomous AI agents with hard mathematical constraints:
- **Velocity Limit:** Maximum spend per hour/day (e.g., max 25 MUSD per hour).
- **Target Contract Whitelist:** Agents can only call sanctioned contract addresses (e.g., specific API payment escrows or DEX routers).
- **Time-to-Live (TTL):** Ephemeral lifetime after which keys expire automatically.
- **Auto-DCA & Yield Loop:** Idle MUSD deposits earn automated yield and can continuously accumulate native Bitcoin (BTC).

---

## 2. Problem Statement

### 2.1 The AI Agent Treasury Vulnerability
Modern agent frameworks (such as LangChain, CrewAI, AutoGen, and ElizaOS) require funds to pay for tools (web scraping, RPC access, LLM compute, data APIs). Currently, developers are forced into two bad extremes:
1. **Full Custody (Dangerous):** Storing a private key in the agent's environment. A single prompt injection or memory leak drains 100% of the funds.
2. **Manual Approval (Unscalable):** Human must approve every transaction. Destroys the entire premise of autonomous 24/7 agent workflows.

### 2.2 The Mezo & Bitcoin Economy Opportunity
Mezo enables a thriving Bitcoin financial ecosystem powered by **MUSD** (Bitcoin-backed USD stablecoin) and **BTC as native gas**. To establish MUSD as the world's premier stablecoin for the machine economy, AI agents need frictionless, native infrastructure to transact, hold, and earn yield in MUSD on Mezo.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             USER / MASTER OWNER                             │
│                  (Controls Master Smart Account via Web UI)                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ 1. Deposits USDC / MUSD
                                       │ 2. Issues Scoped Session Key
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MezoAgentAccount (Smart Contract)                      │
│                                                                             │
│   • Master Owner: Full Control & Revocation                                 │
│   • Treasury Vault: Holds MUSD & Native BTC Gas                             │
│   • Policy Engine:                                                          │
│       - Session Key Hash Registry                                           │
│       - Spend Window (e.g. 50 MUSD / 24h)                                   │
│       - Cumulative Window Spend Tracking                                    │
│       - Whitelisted Target Addresses & Selectors                            │
└───────────────────────▲─────────────────────────────▲───────────────────────┘
                        │                             │
    3. Executes Action  │                             │ 3. Executes Action
       (Within Limits)  │                             │    (Within Limits)
                        │                             │
┌───────────────────────┴────────┐   ┌────────────────┴───────────────────────┐
│       AI Agent #1 (Per-Call)   │   │         AI Agent #2 (Yield & DCA)      │
│  • Holds Ephemeral Session Key │   │  • Holds Ephemeral Session Key         │
│  • Pays for Web & Data APIs    │   │  • Harvests MUSD Yield                 │
│  • Max 5 MUSD / hour           │   │  • Auto-swaps 20% to native BTC        │
└────────────────────────────────┘   └────────────────────────────────────────┘
```

---

## 4. Smart Contract Suite

### 4.1 `MezoAgentAccount.sol`
Each agent treasury is an individual smart contract owned by the user. Key functionalities:
* **`depositMUSD(uint256 amount)`**: Master or cross-chain bridge deposits MUSD into the account.
* **`createSessionKey(address keySigner, uint256 hourlyLimit, uint256 validUntil, address[] allowedTargets)`**: Owner authorizes an agent's public key with granular permissions.
* **`revokeSessionKey(address keySigner)`**: Instant kill-switch by owner.
* **`executeAsAgent(address target, uint256 value, bytes calldata data)`**: Called by the ephemeral session key. Validates:
  1. `msg.sender == keySigner`
  2. `block.timestamp <= validUntil`
  3. `allowedTargets.contains(target)`
  4. `hourlySpent + value <= hourlyLimit` (resets every 3600 seconds)
  5. Transfers MUSD to target or executes approved call.

### 4.2 `MezoAgentFactory.sol`
* Uses `CREATE2` to deploy deterministic agent accounts for any user.
* Maintains a global registry of deployed accounts and active agents.

### 4.3 `MezoBridgeRouter.sol`
* Cross-chain bridge router interface accepting USDC from Base or Ethereum, minting/crediting MUSD on Mezo, and routing directly to the user's `MezoAgentAccount`.

---

## 5. MezoAgent TypeScript SDK (`@mezo-agent/sdk`)

The SDK enables any AI agent or autonomous script to interface with its smart account in under 5 lines of code:

```typescript
import { MezoAgentClient } from "@mezo-agent/sdk";

// 1. Initialize client using the agent's ephemeral session key
const agent = new MezoAgentClient({
  accountAddress: "0xAgentSmartAccountAddress...",
  sessionPrivateKey: process.env.AGENT_SESSION_PRIVATE_KEY,
  rpcUrl: "https://rpc.test.mezo.org",
});

// 2. Query remaining spending budget
const budget = await agent.getRemainingHourlyBudget();
console.log(`Remaining MUSD budget for this hour: ${budget} MUSD`);

// 3. Autonomous micro-payment to an API provider
const tx = await agent.payService({
  recipient: "0xApiDataProviderAddress...",
  amountInMUSD: "0.25",
  memo: "LLM Search Query #4081",
});
console.log(`Payment confirmed on Mezo: ${tx.hash}`);
```

---

## 6. AKINDO Buildathon Wave Milestones

| Milestone | Deliverable | Target Timeline |
| :--- | :--- | :--- |
| **Wave 1: Core Protocol & Contracts** | Solidity contracts compiled & unit-tested with Foundry/Hardhat. Faucet & mock tokens deployed to Mezo Testnet (31611). | Week 1 |
| **Wave 2: Agent SDK & Web Dashboard** | Full Next.js 14 Web3 dashboard with Wagmi/Viem. Session Key minting, budget monitors, live agent execution sandbox. | Week 2 |
| **Wave 3: Cross-chain USDC Bridge & Demo** | Cross-chain Base $\leftrightarrow$ Mezo simulation, live autonomous agent demo video, AKINDO submission. | Week 3 |

---

## 7. Compliance & KYB Readiness
In accordance with Mezo Network and Supernormal Foundation guidelines:
* Project repository is open-sourced under MIT License.
* Codebase includes comprehensive unit tests and automated verification scripts.
* Core team documentation and wallet signatures prepared for 14-day TWAP MEZO grant distribution.
