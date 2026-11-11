/**
 * SDK Integration & Export Verification Test Suite
 */
import {
  MezoAgentClient,
  MEZO_TESTNET,
  HourlyLimitExceededError,
  DailyLimitExceededError,
  SessionKeyRevokedError,
  SessionKeyExpiredError,
  TargetNotWhitelistedError,
  SelectorNotWhitelistedError,
  AccountPausedError,
} from "./index.js";

async function runTests() {
  console.log("🧪 Running @mezo-agent/sdk Verification Suite...\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      process.exit(1);
    }
    console.log(`✅ PASS: ${msg}`);
    passed++;
  }

  // 1. Verify Error Subclasses
  const hourlyErr = new HourlyLimitExceededError("2.0", "10.0", "5.0");
  assert(hourlyErr instanceof Error, "HourlyLimitExceededError extends Error");
  assert(hourlyErr.name === "HourlyLimitExceededError", "HourlyLimitExceededError correct name");
  assert(hourlyErr.hourlyLimit === "5.0", "HourlyLimitExceededError has limit property");
  assert(hourlyErr.currentSpent === "2.0", "HourlyLimitExceededError has currentSpent property");
  assert(hourlyErr.attemptedAmount === "10.0", "HourlyLimitExceededError has attemptedAmount property");

  const dailyErr = new DailyLimitExceededError("15.0", "50.0", "25.0");
  assert(dailyErr.dailyLimit === "25.0", "DailyLimitExceededError has dailyLimit property");

  const revokedErr = new SessionKeyRevokedError("0x1111111111111111111111111111111111111111");
  assert(revokedErr.sessionKey.toLowerCase() === "0x1111111111111111111111111111111111111111", "SessionKeyRevokedError contains session address");

  const targetErr = new TargetNotWhitelistedError("0x2222222222222222222222222222222222222222");
  assert(targetErr.target.toLowerCase() === "0x2222222222222222222222222222222222222222", "TargetNotWhitelistedError contains target address");

  const selectorErr = new SelectorNotWhitelistedError("0x2222222222222222222222222222222222222222", "0xa9059cbb");
  assert(selectorErr.selector === "0xa9059cbb", "SelectorNotWhitelistedError contains selector");

  const pausedErr = new AccountPausedError("0x3333333333333333333333333333333333333333");
  assert(pausedErr.accountAddress.toLowerCase() === "0x3333333333333333333333333333333333333333", "AccountPausedError contains account address");

  // 2. Verify Client Instantiation
  const client = new MezoAgentClient({
    accountAddress: "0x98f483D0b028d77aE37B6d123C34954Af248dC94",
    sessionPrivateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    network: MEZO_TESTNET,
  });

  assert(typeof client.getSessionAddress() === "string", "client.getSessionAddress returns address string");
  assert(client.getSessionAddress().startsWith("0x"), "client.getSessionAddress returns 0x prefixed hex");
  assert(client.accountAddress === "0x98f483D0b028d77aE37B6d123C34954Af248dC94", "client.accountAddress matches config");
  assert(MEZO_TESTNET.chainId === 31611, "MEZO_TESTNET chainId is 31611");

  console.log(`\n🎉 All ${passed}/${total} SDK unit and typing checks passed successfully!`);
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
