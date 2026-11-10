# Task Plan: MezoAgent (Mezo USDC/MUSD Buildathon)

## Overview
**MezoAgent** is an autonomous AI agent smart account and treasury infrastructure built for the Mezo network. It allows humans, DAOs, and applications to deposit USDC (bridged from Base/Ethereum) or MUSD, creating isolated, budget-controlled smart accounts with cryptographic session keys. AI agents can autonomously execute on-chain payments, yield rebalancing, and API settlements without risk of draining the master treasury.

## AKINDO Buildathon Alignment
- **Track:** Access and Distribution for MUSD/MEZO (Agentic Tools / AI Wallets) + DeFi (Automated Stacking & Yield)
- **Target Chains:** Mezo Testnet (Chain ID 31611), Base, Ethereum
- **Core Assets:** MUSD (`0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186`), USDC, BTC (native gas)

---

## Phases & Status

### Phase 1: Planning, Documentation & Google Docs Sync `[in_progress]`
- [x] Create project structure and local persistent planning files.
- [x] Sync comprehensive architecture and specification into Google Doc (`1SyiFX6o2_Cy-hZ8FGZHAh82iRf-9LeO0AsDHEwSRIV4`).
- [ ] Document contract specifications, threat model, and session key cryptography.

### Phase 2: Smart Contract Architecture & Testing `[pending]`
- [ ] Implement `MezoAgentAccount.sol` (Session key validation, rate limits, spending allowances, target whitelist).
- [ ] Implement `MezoAgentFactory.sol` (Deterministic deployment of agent accounts).
- [ ] Implement `MockMUSD.sol` & `MockUSDC.sol` with faucet and bridge simulation.
- [ ] Implement `MezoBridgeRouter.sol` (Cross-chain USDC -> MUSD allocation).
- [ ] Create automated test suite verifying security invariants (unauthorized signer, spending cap overflow, expired session).

### Phase 3: MezoAgent SDK & Autonomous Agent Runtime `[pending]`
- [ ] Build TypeScript SDK (`@mezo-agent/sdk`) providing `MezoAgentClient`.
- [ ] Build simulated autonomous agent runner executing on-chain actions (API payment, yield compounding, auto-DCA).

### Phase 4: Modern Web Dashboard (Next.js + Tailwind + Lucide + Viem) `[pending]`
- [ ] Scaffold Next.js application with Tailwind CSS and Dark/Modern Web3 Theme.
- [ ] Interactive Treasury Overview (USDC & MUSD balances, total volume, active agents).
- [ ] Session Key Manager (Mint key, configure hourly/daily allowance, whitelist targets, revoke key).
- [ ] Live Agent Execution Sandbox (Trigger autonomous agent tasks with real-time logs).
- [ ] Interactive Faucet & Bridge Simulator (Deposit USDC -> Mint MUSD on Mezo).

### Phase 5: Verification, Git & Deployment Prep `[pending]`
- [ ] Verify test suite and frontend build (`npm run build`).
- [ ] Initialize Git repository, commit all codebase assets with descriptive messages.
- [ ] Prepare deployment configuration (Vercel / Railway / production static export).
- [ ] Complete submission documentation for AKINDO.
