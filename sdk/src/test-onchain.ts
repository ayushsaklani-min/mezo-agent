import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  type Address,
  defineChain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  MezoAgentClient,
  MEZO_AGENT_ACCOUNT_ABI,
  HourlyLimitExceededError,
  MaxPerTxExceededError,
  SessionKeyRevokedError,
} from "./index.js";

const RPC_URL = "http://127.0.0.1:8545";
const CHAIN_ID = 31611;

const mezoChain = defineChain({
  id: CHAIN_ID,
  name: "Mezo Testnet Local",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const OWNER_PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const AGENT_PK = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const RECIPIENT: Address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

const ACCOUNT_ADDRESS: Address = "0x8aCd85898458400f7Db866d53FCFF6f0D49741FF";
const MUSD_ADDRESS: Address = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

const ownerAccount = privateKeyToAccount(OWNER_PK);
const agentAccount = privateKeyToAccount(AGENT_PK);

const publicClient = createPublicClient({
  chain: mezoChain,
  transport: http(RPC_URL),
});

const ownerWallet = createWalletClient({
  account: ownerAccount,
  chain: mezoChain,
  transport: http(RPC_URL),
});

async function main() {
  console.log("===============================================================================");
  console.log("🚀 STARTING ITERATIVE ON-CHAIN INTEGRATION & BLOCKCHAIN VERIFICATION SUITE");
  console.log("===============================================================================");
  console.log(`🔗 RPC Endpoint: ${RPC_URL} (Chain ID: ${CHAIN_ID})`);
  console.log(`🏛️ MezoAgentAccount: ${ACCOUNT_ADDRESS}`);
  console.log(`💵 MockMUSD Token: ${MUSD_ADDRESS}`);
  console.log(`👑 Treasury Owner: ${ownerAccount.address}`);
  console.log(`🤖 AI Agent Session Signer: ${agentAccount.address}`);
  console.log(`🎯 Recipient: ${RECIPIENT}\n`);

  let step = 1;
  const assertStep = (condition: boolean, label: string) => {
    if (!condition) {
      console.error(`❌ [STEP ${step}] FAILED: ${label}`);
      process.exit(1);
    }
    console.log(`✅ [STEP ${step}] PASSED: ${label}`);
    step++;
  };

  // -------------------------------------------------------------
  // STEP 1: Verify Initial On-Chain State
  // -------------------------------------------------------------
  console.log("--- Checking Initial On-Chain State ---");
  const onchainOwner = await publicClient.readContract({
    address: ACCOUNT_ADDRESS,
    abi: MEZO_AGENT_ACCOUNT_ABI,
    functionName: "owner",
  });
  assertStep(onchainOwner.toLowerCase() === ownerAccount.address.toLowerCase(), "Smart Account Owner matches deployer");

  const [initialMUSD, initialBTC] = (await publicClient.readContract({
    address: ACCOUNT_ADDRESS,
    abi: MEZO_AGENT_ACCOUNT_ABI,
    functionName: "getAccountBalance",
  })) as [bigint, bigint];
  console.log(`   Initial Account Balance: ${formatEther(initialMUSD)} MUSD, ${formatEther(initialBTC)} BTC`);
  assertStep(initialMUSD >= parseEther("1000"), "Treasury has at least 1,000 MUSD funded");

  // -------------------------------------------------------------
  // STEP 2: Owner Registers Session Key On-Chain
  // -------------------------------------------------------------
  console.log("\n--- Owner Registers AI Agent Session Key On-Chain ---");
  const hourlyLimit = parseEther("20"); // 20 MUSD / hour
  const dailyLimit = parseEther("100"); // 100 MUSD / day
  const maxPerTx = parseEther("10"); // 10 MUSD / tx
  const validUntil = BigInt(Math.floor(Date.now() / 1000) + 86400 * 7); // 7 days

  const regTxHash = await ownerWallet.writeContract({
    address: ACCOUNT_ADDRESS,
    abi: MEZO_AGENT_ACCOUNT_ABI,
    functionName: "createSessionKey",
    args: [
      agentAccount.address,
      hourlyLimit,
      dailyLimit,
      maxPerTx,
      validUntil,
      false, // restrictTargets
      [],    // allowedTargets
      [],    // allowedSelectors
      "Autonomous High-Frequency Research Bot",
    ],
  });
  console.log(`   createSessionKey Tx Hash: ${regTxHash}`);
  const regReceipt = await publicClient.waitForTransactionReceipt({ hash: regTxHash });
  assertStep(regReceipt.status === "success", "createSessionKey transaction confirmed on-chain");

  // -------------------------------------------------------------
  // STEP 3: SDK Initialization & Policy Query
  // -------------------------------------------------------------
  console.log("\n--- AI Agent Initializes MezoAgentClient & Queries Policy ---");
  const client = new MezoAgentClient({
    accountAddress: ACCOUNT_ADDRESS,
    sessionPrivateKey: AGENT_PK,
    rpcUrl: RPC_URL,
    network: {
      chainId: CHAIN_ID,
      name: "Mezo Testnet Local",
      rpcUrl: RPC_URL,
      explorerUrl: "http://127.0.0.1:8545",
      nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
    },
  });

  const policy = await client.getSessionPolicy();
  console.log("   On-chain Policy:", {
    active: policy.active,
    hourlyLimit: formatEther(policy.hourlyLimit),
    dailyLimit: formatEther(policy.dailyLimit),
    maxPerTx: formatEther(policy.maxPerTx),
    label: policy.label,
  });
  assertStep(policy.active === true, "Session key is active on-chain");
  assertStep(formatEther(policy.hourlyLimit) === "20", "Hourly limit is 20 MUSD");
  assertStep(formatEther(policy.maxPerTx) === "10", "Max per tx is 10 MUSD");

  const remainingHourly = await client.getRemainingHourlyBudget();
  console.log(`   Remaining hourly budget: $${remainingHourly} MUSD`);
  assertStep(remainingHourly === "20", "Initial remaining hourly budget is full 20 MUSD");

  // -------------------------------------------------------------
  // STEP 4: Real Autonomous Payment Execution On-Chain
  // -------------------------------------------------------------
  console.log("\n--- AI Agent Executes Scoped Micro-Payment On-Chain ---");
  const spendReceipt = await client.payService({
    recipient: RECIPIENT,
    amountInMUSD: 5, // 5 MUSD
  });

  console.log("   Execution Receipt:", {
    txHash: spendReceipt.txHash,
    status: spendReceipt.status,
    gasUsed: spendReceipt.gasUsed?.toString(),
    blockNumber: spendReceipt.blockNumber?.toString(),
    remainingHourlyBudget: spendReceipt.remainingHourlyBudget,
  });
  assertStep(spendReceipt.status === "CONFIRMED", "Payment successfully executed & confirmed on-chain");

  const hourlySpentAfter = await client.getHourlySpent();
  console.log(`   Hourly spent after payment: $${hourlySpentAfter} MUSD`);
  assertStep(hourlySpentAfter === "5", "On-chain hourly spent correctly updated to 5 MUSD");

  const recipientBalance = (await publicClient.readContract({
    address: MUSD_ADDRESS,
    abi: [
      {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ],
    functionName: "balanceOf",
    args: [RECIPIENT],
  })) as bigint;
  console.log(`   Recipient Token Balance on-chain: ${formatEther(recipientBalance)} MUSD`);
  assertStep(recipientBalance === parseEther("5"), "Recipient received exactly 5 MUSD on-chain");

  // -------------------------------------------------------------
  // STEP 5: MaxPerTx Cap Violation Enforcement On-Chain
  // -------------------------------------------------------------
  console.log("\n--- Testing maxPerTx Guardrail Revert On-Chain ---");
  let caughtMaxPerTx = false;
  try {
    await client.payService({
      recipient: RECIPIENT,
      amountInMUSD: 15, // 15 MUSD > 10 MUSD maxPerTx
    });
  } catch (err: any) {
    if (err instanceof MaxPerTxExceededError) {
      caughtMaxPerTx = true;
      console.log(`   Successfully caught MaxPerTxExceededError: ${err.message}`);
    } else {
      console.log(`   Caught generic contract revert: ${err?.message}`);
      if (String(err).includes("Amount exceeds maxPerTx cap")) {
        caughtMaxPerTx = true;
      }
    }
  }
  assertStep(caughtMaxPerTx, "Smart account reverted when exceeding maxPerTx cap");

  // -------------------------------------------------------------
  // STEP 6: Hourly Velocity Sliding Window Limit Revert On-Chain
  // -------------------------------------------------------------
  console.log("\n--- Testing 12-Bucket Sliding Window Hourly Cap Revert On-Chain ---");
  // Spend 10 MUSD (total 15 MUSD spent of 20 limit)
  await client.payService({ recipient: RECIPIENT, amountInMUSD: 10 });
  console.log("   Executed second 10 MUSD spend (cumulative 15 MUSD / 20 MUSD limit)");

  let caughtHourly = false;
  try {
    // Attempt to spend another 10 MUSD (would be 25 MUSD > 20 MUSD limit)
    await client.payService({
      recipient: RECIPIENT,
      amountInMUSD: 10,
    });
  } catch (err: any) {
    if (err instanceof HourlyLimitExceededError) {
      caughtHourly = true;
      console.log(`   Successfully caught HourlyLimitExceededError: ${err.message}`);
    } else if (String(err).includes("Hourly MUSD limit exceeded")) {
      caughtHourly = true;
      console.log(`   Caught on-chain revert string: Hourly MUSD limit exceeded`);
    }
  }
  assertStep(caughtHourly, "Smart contract reverted boundary-overflow spend on-chain");

  // -------------------------------------------------------------
  // STEP 7: Human-in-the-Loop Approval Queue Workflow On-Chain
  // -------------------------------------------------------------
  console.log("\n--- Testing Human-in-the-Loop Approval Queue On-Chain ---");
  const requestTx = await client.requestPaymentApproval({
    recipient: RECIPIENT,
    amountInMUSD: 50,
    memo: "Quarterly GPU Compute Cluster Lease",
  });
  console.log(`   requestExecution Tx Hash: ${requestTx}`);
  await publicClient.waitForTransactionReceipt({ hash: requestTx });

  const pendingRequests = await client.getPendingRequests();
  console.log(`   Pending Requests on-chain count: ${pendingRequests.length}`);
  assertStep(pendingRequests.length > 0, "High-value spend request recorded in on-chain queue");

  const reqId = pendingRequests[pendingRequests.length - 1].id;
  console.log(`   Approving Request ID: ${reqId} by Treasury Owner...`);

  const approveTx = await ownerWallet.writeContract({
    address: ACCOUNT_ADDRESS,
    abi: MEZO_AGENT_ACCOUNT_ABI,
    functionName: "approveExecution",
    args: [reqId],
  });
  console.log(`   approveExecution Tx Hash: ${approveTx}`);
  const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveTx });
  assertStep(approveReceipt.status === "success", "Owner approval executed & confirmed on-chain");

  const updatedRecipientBalance = (await publicClient.readContract({
    address: MUSD_ADDRESS,
    abi: [
      {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ],
    functionName: "balanceOf",
    args: [RECIPIENT],
  })) as bigint;
  console.log(`   Recipient Token Balance after approval: ${formatEther(updatedRecipientBalance)} MUSD`);
  assertStep(updatedRecipientBalance === parseEther("65"), "Recipient received +50 MUSD (total 65 MUSD)");

  // -------------------------------------------------------------
  // STEP 8: Session Key Revocation & Attack Defense On-Chain
  // -------------------------------------------------------------
  console.log("\n--- Testing Session Key Revocation On-Chain ---");
  const revokeTx = await ownerWallet.writeContract({
    address: ACCOUNT_ADDRESS,
    abi: MEZO_AGENT_ACCOUNT_ABI,
    functionName: "revokeSessionKey",
    args: [agentAccount.address],
  });
  console.log(`   revokeSessionKey Tx Hash: ${revokeTx}`);
  await publicClient.waitForTransactionReceipt({ hash: revokeTx });

  const revokedPolicy = await client.getSessionPolicy();
  assertStep(revokedPolicy.active === false, "Session key is marked inactive on-chain");

  let caughtRevoked = false;
  try {
    await client.payService({
      recipient: RECIPIENT,
      amountInMUSD: 1,
    });
  } catch (err: any) {
    if (err instanceof SessionKeyRevokedError) {
      caughtRevoked = true;
      console.log(`   Successfully caught SessionKeyRevokedError: ${err.message}`);
    } else if (String(err).includes("Session key inactive or non-existent")) {
      caughtRevoked = true;
      console.log(`   Caught on-chain revert: Session key inactive or non-existent`);
    }
  }
  assertStep(caughtRevoked, "Revoked session key blocked on-chain with zero funds lost");

  console.log("\n===============================================================================");
  console.log(`🎉 ALL ${step - 1} ON-CHAIN INTEGRATION TESTS PASSED WITH 100% SUCCESS!`);
  console.log("   Blockchain interaction is fully verified, smooth, and robust.");
  console.log("===============================================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR IN ON-CHAIN INTEGRATION:", err);
  process.exit(1);
});
