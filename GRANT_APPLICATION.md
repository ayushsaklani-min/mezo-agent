# AKINDO Grant Application: MezoAgent

**Program:** Build with MUSD and MEZO ($7,000 in MEZO Grants)  
**Host:** AKINDO $\times$ Mezo Network $\times$ Supernormal Foundation  
**Project Name:** MezoAgent  
**Category/Track:** Access & Distribution for MUSD/MEZO (Agentic Tools / AI Wallets) & DeFi Yield  
**Target Networks:** Mezo Testnet (31611), Mezo Mainnet (31612), Base, Ethereum  

---

### 1. Elevator Pitch (50 words)
Autonomous AI agents need capital for compute and APIs, but storing master private keys invites catastrophic wallet drain. **MezoAgent** introduces budget-controlled smart accounts with cryptographic session keys and velocity limits on Mezo, routing cross-chain USDC into MUSD and auto-stacking Bitcoin yield.

---

### 2. Problem & Market Opportunity
As LLM agents (LangChain, CrewAI, AutoGen, ElizaOS) evolve into economic actors, they must pay for compute, web scraping, RPC endpoints, and oracle feeds. Today, developers face a dangerous dilemma:
1. **Full Custody Risk:** Storing master keys in server environments. A single prompt injection, memory leak, or compromised agent drains the entire treasury.
2. **Manual Approval Bottleneck:** Human-in-the-loop approvals break 24/7 autonomy.

**The Mezo Opportunity:**  
Mezo provides the premier Bitcoin-native financial platform with **MUSD** (Bitcoin-backed USD stablecoin) and **BTC as native gas**. MezoAgent makes MUSD the de facto currency of the autonomous machine economy.

---

### 3. Core Features & Technical Innovation
* **Velocity-Limited Session Keys:** Smart contract accounts enforce hourly (`block.timestamp / 3600`) and daily (`block.timestamp / 86400`) spending caps without requiring manual reset transactions.
* **Target Whitelisting:** Ephemeral agent keys are cryptographically constrained to call only authorized service providers or DEX routers.
* **Cross-Chain Inbound Liquidity:** Deposit USDC on Base or Ethereum $\rightarrow$ automatically routes 1:1 into native MUSD on Mezo via `MezoBridgeRouter`.
* **Auto-DCA Bitcoin Yield:** Idle MUSD treasury deposits generate yield that automatically compounds into native Satoshis (BTC).
* **Multi-Framework SDK:** Ready-to-use adapters for TypeScript, LangChain (`createMezoPaymentTool`), and ElizaOS (`createElizaMezoAction`).

---

### 4. Milestone Schedule & Budget Breakdown ($7,000 MEZO)

| Phase | Milestone Deliverables | Funding Requested | Status |
| :--- | :--- | :--- | :--- |
| **Wave 1: Core Protocol** | Solidity smart contracts (`MezoAgentAccount`, `MezoAgentFactory`, `MezoBridgeRouter`, `MockMUSD`, `MockUSDC`). 15 Foundry tests with fuzzing. Mezo testnet deployment script. | **$2,500 in MEZO** | **COMPLETE** |
| **Wave 2: SDK & Web3 Dashboard** | Production TypeScript SDK (`@mezo-agent/sdk`), LangChain/ElizaOS plugins, Next.js 14 dashboard with live agent execution sandbox and browser wallet support. | **$2,500 in MEZO** | **COMPLETE** |
| **Wave 3: Testnet Pilot & Mainnet** | Security audit of session key contracts, mainnet contract deployment, onboarding 5 pilot autonomous agent developers on Mezo. | **$2,000 in MEZO** | **SCHEDULED** |

---

### 5. Technical Verification & Code Quality
* **Contracts:** 100% Solidity 0.8.24 with OpenZeppelin 5.7.0 primitives and `ReentrancyGuard`.
* **Testing:** 15 automated test cases including boundary and 256-run fuzz tests.
* **SDK:** Zero-dependency modern TypeScript package built on `viem`.
* **CI/CD:** Automated GitHub Actions pipeline verifying contract test passes and frontend build.

---

### 6. Compliance & KYB Readiness
The team is prepared to complete standard Know-Your-Business (KYB) and tax compliance verification (W-8BEN/W-9, government ID, proof of address) upon selection for the 14-day TWAP MEZO grant distribution.
