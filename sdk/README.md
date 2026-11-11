# @mezo-agent/sdk

> **Production-grade TypeScript SDK for autonomous AI agents transacting on Mezo Network.**
> Budget-controlled smart accounts with mathematical sliding-window spend envelopes, granular function selector whitelisting, and instant on-chain revocation.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Mezo Testnet](https://img.shields.io/badge/Network-Mezo%20Testnet%20(31611)-orange.svg)](https://explorer.test.mezo.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## The Problem
Giving autonomous AI agents (LangChain, AutoGPT, ElizaOS, Claude Computer Use) master private keys is an existential risk to treasuries. A prompt-injection attack or infinite execution loop can drain an entire wallet in seconds.

## The Solution
`@mezo-agent/sdk` enables developers and DAOs to deploy **budget-controlled smart accounts**. Master ownership remains secured in your multisig or hardware wallet, while agents operate using **ephemeral session keys** bound by:
- 🕒 **Mathematical Sliding-Window Envelopes**: 12 sub-buckets (5m each) prevent the classic 59m/61m double-spend boundary exploit.
- 🎯 **Selector-Level Whitelisting**: Authorize exact target addresses and 4-byte function signatures (e.g. disallow arbitrary `approve()` calls).
- 🛑 **Instant Key Revocation & Pausability**: Freeze compromised agents in a single block without touching other operations.
- ⏳ **Timelocked Limit Increases**: Prevent rogue admin or hacked owner keys from instantly inflating agent allowances.

---

## 📦 Installation

```bash
npm install @mezo-agent/sdk viem
# or with pnpm / bun / yarn
pnpm add @mezo-agent/sdk viem
```

---

## ⚡ 10-Minute Quickstart

### 1. Initialize the Agent Client

```typescript
import { MezoAgentClient, MEZO_TESTNET } from "@mezo-agent/sdk";

// Ephemeral agent key generated in enclave / bot environment
const client = new MezoAgentClient({
  accountAddress: "0x98f483D0b028d77aE37B6d123C34954Af248dC94",
  sessionPrivateKey: process.env.AGENT_SESSION_KEY as `0x${string}`,
  network: MEZO_TESTNET,
});
```

### 2. Inspect Remaining Sliding-Window Allowance

```typescript
// Query on-chain allowance remaining within current 1-hour and 24-hour sliding windows
const remainingHourly = await client.getRemainingHourlyBudget();
const remainingDaily = await client.getRemainingDailyBudget();

console.log(`Remaining Hourly Allowance: ${remainingHourly} MUSD`);
console.log(`Remaining Daily Allowance:  ${remainingDaily} MUSD`);
```

### 3. Execute Autonomous Payment with Typed Error Handling

```typescript
import {
  HourlyLimitExceededError,
  SessionKeyRevokedError,
  TargetNotWhitelistedError,
  AccountPausedError,
} from "@mezo-agent/sdk";

try {
  const receipt = await client.payService({
    recipient: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    amountInMUSD: "0.25",
    memo: "Autonomous Vector DB Query #892",
  });

  console.log(`✅ Payment Confirmed! Tx: ${receipt.txHash}`);
} catch (error) {
  if (error instanceof HourlyLimitExceededError) {
    console.warn("Velocity limit reached. Bot will sleep until sliding window clears.");
  } else if (error instanceof SessionKeyRevokedError) {
    console.error("Session key revoked by treasury admin. Halting worker.");
  } else if (error instanceof TargetNotWhitelistedError) {
    console.error("Target address is not authorized on-chain.");
  } else if (error instanceof AccountPausedError) {
    console.error("Smart account is paused for emergency maintenance.");
  } else {
    console.error("Execution failed:", error);
  }
}
```

---

## 🛡️ Typed Custom Errors

The SDK decodes raw EVM contract revert errors into typed, actionable JavaScript error instances:

| Error Class | On-Chain Cause | Suggested Agent Action |
|---|---|---|
| `HourlyLimitExceededError` | Rolling 1-hour sub-bucket spend reached cap | Sleep 5-15 minutes for oldest bucket to expire |
| `DailyLimitExceededError` | Rolling 24-hour spend reached cap | Halt autonomous spends until next daily cycle |
| `SessionKeyRevokedError` | Master owner or guardian revoked key | Cease operations; ping team via alerting webhook |
| `SessionKeyExpiredError` | Block timestamp exceeded key expiration | Request owner to mint new session key |
| `TargetNotWhitelistedError` | Recipient address is not on allowlist | Escalate to human operator for whitelist approval |
| `SelectorNotWhitelistedError` | Called function selector is forbidden | Restrict payload to authorized calls |
| `AccountPausedError` | Smart account is globally paused | Pause bot workflows |

---

## 🧩 Framework Integrations

Find full runnable examples in the [`examples/`](./examples) directory:

- **Standalone Bot**: [`examples/standalone-node-bot.ts`](./examples/standalone-node-bot.ts) — Minimal background worker loop.
- **LangChain / LangGraph**: [`examples/langchain-agent.ts`](./examples/langchain-agent.ts) — Dynamic structured tool with pre-flight allowance checks.
- **ElizaOS (ai16z)**: [`examples/eliza-action.ts`](./examples/eliza-action.ts) — Autonomous action handler with runtime context validation.

---

## 🌐 Network Configuration

```typescript
export const MEZO_TESTNET = {
  id: 31611,
  name: "Mezo Testnet",
  rpcUrl: "https://rpc.test.mezo.org",
  explorerUrl: "https://explorer.test.mezo.org",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  musdAddress: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
};
```

---

## 🔐 Security Architecture

- **True Sliding Window**: Fixed 1-hour windows allow an attacker to spend 100% at 0:59 and another 100% at 1:01 (200% spend in 2 minutes). MezoAgent uses a **12-bucket sliding window (300 seconds per bucket)**, mathematically bounding velocity across any continuous 3600-second interval.
- **Formal Invariant Testing**: Verified with Foundry invariant fuzz tests over **128,000+ stateful calls**. Invariants proved:
  1. `spentInWindow <= hourlyLimit`
  2. `spentInDay <= dailyLimit`
  3. `contractBalance >= reservedObligations`
- **Zero-Knowledge Key Handshake**: Private keys never leave the agent host environment. The owner registers only the public `address` on-chain.

---

## 📜 License
MIT © 2026 MezoAgent Team
