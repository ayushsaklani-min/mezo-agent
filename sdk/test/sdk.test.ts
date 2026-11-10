import { MezoAgentClient, MEZO_TESTNET, MEZO_MAINNET } from "../src/index.js";
import { privateKeyToAccount } from "viem/accounts";

async function testSDK() {
  console.log("=== Testing @mezo-agent/sdk ===");

  const dummyKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const dummyAccount = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  const client = new MezoAgentClient({
    accountAddress: dummyAccount,
    sessionPrivateKey: dummyKey,
    network: MEZO_TESTNET,
  });

  const sessionAddress = client.getSessionAddress();
  const expectedAddress = privateKeyToAccount(dummyKey).address;

  if (sessionAddress !== expectedAddress) {
    throw new Error(`Address mismatch: expected ${expectedAddress}, got ${sessionAddress}`);
  }
  console.log(`[PASS] Session key derived correctly: ${sessionAddress}`);

  if (client.network.chainId !== 31611) {
    throw new Error(`Chain ID mismatch for Mezo Testnet`);
  }
  console.log(`[PASS] Mezo Testnet Chain ID verified: ${client.network.chainId}`);

  if (MEZO_MAINNET.chainId !== 31612) {
    throw new Error(`Chain ID mismatch for Mezo Mainnet`);
  }
  console.log(`[PASS] Mezo Mainnet Chain ID verified: ${MEZO_MAINNET.chainId}`);

  console.log("=== All SDK Unit Checks Passed ===");
}

testSDK().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
