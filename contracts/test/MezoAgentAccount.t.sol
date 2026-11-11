// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MezoAgentAccount.sol";
import "../src/MezoAgentFactory.sol";
import "../src/MezoBridgeRouter.sol";
import "../src/MockMUSD.sol";
import "../src/MockUSDC.sol";

// Mock Target Contract to test selector whitelisting
contract MockTargetService {
    uint256 public queryCount;
    event QueryExecuted(uint256 count, string memo);

    function executeQuery(string calldata memo) external returns (bool) {
        queryCount++;
        emit QueryExecuted(queryCount, memo);
        return true;
    }

    function dangerousOperation() external pure returns (bool) {
        return true;
    }
}

contract MezoAgentAccountTest is Test {
    MezoAgentAccount public account;
    MezoAgentFactory public factory;
    MezoBridgeRouter public router;
    MockMUSD public musd;
    MockUSDC public usdc;
    MockTargetService public targetService;

    address public owner = address(0xAA11);
    address public guardian = address(0xAA22);
    address public agentKey = address(0xBB22);
    address public unauthorizedUser = address(0xDEAD);
    address public serviceProvider = address(0xCC33);

    uint256 public constant INITIAL_BALANCE = 10_000 * 1e18;
    uint256 public constant HOURLY_LIMIT = 50 * 1e18;
    uint256 public constant DAILY_LIMIT = 200 * 1e18;
    uint256 public constant TIMELOCK_DELAY = 1 days;

    function setUp() public {
        vm.deal(owner, 10 ether);
        vm.deal(guardian, 1 ether);
        vm.deal(agentKey, 1 ether);
        vm.startPrank(owner);

        musd = new MockMUSD();
        usdc = new MockUSDC();
        factory = new MezoAgentFactory(address(musd));
        router = new MezoBridgeRouter(address(usdc), address(musd));
        targetService = new MockTargetService();

        account = new MezoAgentAccount(owner, address(musd), TIMELOCK_DELAY);
        account.setGuardian(guardian);

        // Fund account with MUSD
        musd.mint(address(account), INITIAL_BALANCE);

        vm.stopPrank();
    }

    function test_InitialState() public view {
        assertEq(account.owner(), owner);
        assertEq(account.guardian(), guardian);
        assertEq(address(account.musdToken()), address(musd));
        (uint256 musdBal, ) = account.getAccountBalance();
        assertEq(musdBal, INITIAL_BALANCE);
    }

    function test_CreateSessionKey() public {
        vm.startPrank(owner);

        address[] memory targets = new address[](1);
        targets[0] = serviceProvider;

        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = MockTargetService.executeQuery.selector;

        uint256 expiry = block.timestamp + 7 days;

        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            expiry,
            true, // restrictTargets
            targets,
            selectors,
            "Autonomous Search Agent"
        );

        vm.stopPrank();

        (
            bool active,
            uint256 hourlyLimit,
            uint256 dailyLimit,
            uint256 validUntil,
            bool restrictTargets,
            string memory label
        ) = account.sessionPolicies(agentKey);

        assertTrue(active);
        assertEq(hourlyLimit, HOURLY_LIMIT);
        assertEq(dailyLimit, DAILY_LIMIT);
        assertEq(validUntil, expiry);
        assertTrue(restrictTargets);
        assertEq(label, "Autonomous Search Agent");
        assertTrue(account.isTargetAllowed(agentKey, serviceProvider));
        assertTrue(account.isFunctionAllowed(agentKey, serviceProvider, MockTargetService.executeQuery.selector));
    }

    function test_ExecuteAsAgent_Success() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](1);
        targets[0] = serviceProvider;
        bytes4[] memory selectors = new bytes4[](0);

        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            true,
            targets,
            selectors,
            "Payment Agent"
        );
        vm.stopPrank();

        // Execute payment as agent
        vm.startPrank(agentKey);
        uint256 payAmount = 10 * 1e18;
        account.executeAsAgent(serviceProvider, payAmount, "");
        vm.stopPrank();

        assertEq(musd.balanceOf(serviceProvider), payAmount);
        assertEq(account.getRemainingHourlyBudget(agentKey), HOURLY_LIMIT - payAmount);
        assertEq(account.getRemainingDailyBudget(agentKey), DAILY_LIMIT - payAmount);
    }

    function test_ExecuteAsAgent_ExceedsHourlyLimit() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](1);
        targets[0] = serviceProvider;
        bytes4[] memory selectors = new bytes4[](0);

        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            false,
            targets,
            selectors,
            "Agent"
        );
        vm.stopPrank();

        vm.startPrank(agentKey);
        // Exceeds 50 MUSD hourly limit
        vm.expectRevert("Hourly MUSD limit exceeded");
        account.executeAsAgent(serviceProvider, 51 * 1e18, "");
        vm.stopPrank();
    }

    // ------------------------------------------------------------------------
    // P0 SECURITY FIX TEST: TRUE SLIDING WINDOW PREVENTS BOUNDARY ATTACK
    // ------------------------------------------------------------------------
    function test_SlidingWindow_PreventsBoundaryAttack() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](1);
        targets[0] = serviceProvider;
        bytes4[] memory selectors = new bytes4[](0);

        // Limit: 50 MUSD / hour
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 2 days,
            false,
            targets,
            selectors,
            "Boundary Attack Tester"
        );
        vm.stopPrank();

        // Start at t = 3540 seconds (59 minutes into hour 0)
        vm.warp(3540);

        vm.startPrank(agentKey);
        // Spend full hourly limit at 59 mins
        account.executeAsAgent(serviceProvider, 50 * 1e18, "");
        assertEq(account.getHourlySpent(agentKey), 50 * 1e18);

        // Advance by only 2 minutes to t = 3660 (61 minutes from t=0, in next fixed hour)
        vm.warp(3660);

        // Under fixed window, this would exploit and reset to 0!
        // Under our multi-bucket sliding window, bucket from t=3540 is STILL ACTIVE (< 3600s old).
        // Attempting to spend even 1 MUSD must revert!
        vm.expectRevert("Hourly MUSD limit exceeded");
        account.executeAsAgent(serviceProvider, 1 * 1e18, "");

        // Advance to t = 7200 (> 3600s after the first spend)
        vm.warp(7200);

        // Now the first spend has exited the 1-hour sliding window!
        assertEq(account.getHourlySpent(agentKey), 0);
        assertEq(account.getRemainingHourlyBudget(agentKey), HOURLY_LIMIT);

        // Can safely execute new spend
        account.executeAsAgent(serviceProvider, 30 * 1e18, "");
        vm.stopPrank();

        assertEq(musd.balanceOf(serviceProvider), 80 * 1e18);
    }

    // ------------------------------------------------------------------------
    // P0 SECURITY FIX TEST: FUNCTION SELECTOR WHITELISTING & APPROVE BLOCK
    // ------------------------------------------------------------------------
    function test_FunctionSelectorWhitelisting() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](1);
        targets[0] = address(targetService);

        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = MockTargetService.executeQuery.selector;

        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            true, // Restrict targets and selectors
            targets,
            selectors,
            "Scoped Caller"
        );
        vm.stopPrank();

        vm.startPrank(agentKey);

        // Allowed selector: executeQuery
        bytes memory validCall = abi.encodeWithSelector(MockTargetService.executeQuery.selector, "Search Query");
        account.executeAsAgent(address(targetService), 0, validCall);
        assertEq(targetService.queryCount(), 1);

        // Disallowed selector: dangerousOperation
        bytes memory rogueCall = abi.encodeWithSelector(MockTargetService.dangerousOperation.selector);
        vm.expectRevert("Function selector not whitelisted");
        account.executeAsAgent(address(targetService), 0, rogueCall);

        vm.stopPrank();
    }

    function test_DirectMUSDApprove_Forbidden() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](1);
        targets[0] = address(musd);

        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = musd.approve.selector;

        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            true,
            targets,
            selectors,
            "Approval Attacker"
        );
        vm.stopPrank();

        vm.startPrank(agentKey);
        bytes memory approveCall = abi.encodeWithSelector(musd.approve.selector, unauthorizedUser, 1000 * 1e18);
        vm.expectRevert("Direct MUSD approve forbidden for agent keys");
        account.executeAsAgent(address(musd), 0, approveCall);
        vm.stopPrank();
    }

    // ------------------------------------------------------------------------
    // P0 SECURITY FIX TEST: EMERGENCY PAUSE & REVOKE ALL
    // ------------------------------------------------------------------------
    function test_EmergencyPause_OwnerAndGuardian() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](1);
        targets[0] = serviceProvider;
        bytes4[] memory selectors = new bytes4[](0);

        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            false,
            targets,
            selectors,
            "Agent"
        );
        vm.stopPrank();

        // Guardian pauses the account
        vm.prank(guardian);
        account.pause();
        assertTrue(account.paused());

        // Agent execution is frozen
        vm.startPrank(agentKey);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        account.executeAsAgent(serviceProvider, 10 * 1e18, "");
        vm.stopPrank();

        // Guardian cannot unpause (only owner)
        vm.prank(guardian);
        vm.expectRevert("Only owner can call this function");
        account.unpause();

        // Owner unpauses
        vm.prank(owner);
        account.unpause();
        assertFalse(account.paused());

        // Agent can execute again
        vm.prank(agentKey);
        account.executeAsAgent(serviceProvider, 10 * 1e18, "");
        assertEq(musd.balanceOf(serviceProvider), 10 * 1e18);
    }

    function test_RevokeAllSessionKeys() public {
        vm.startPrank(owner);
        address agent2 = address(0xBB33);
        address[] memory targets = new address[](0);
        bytes4[] memory selectors = new bytes4[](0);

        account.createSessionKey(agentKey, HOURLY_LIMIT, DAILY_LIMIT, block.timestamp + 1 days, false, targets, selectors, "Key 1");
        account.createSessionKey(agent2, HOURLY_LIMIT, DAILY_LIMIT, block.timestamp + 1 days, false, targets, selectors, "Key 2");

        // Emergency: Revoke all keys
        account.revokeAllSessionKeys();
        vm.stopPrank();

        (bool active1,,,,,) = account.sessionPolicies(agentKey);
        (bool active2,,,,,) = account.sessionPolicies(agent2);
        assertFalse(active1);
        assertFalse(active2);
    }

    // ------------------------------------------------------------------------
    // P0 SECURITY FIX TEST: TIMELOCK FOR LIMIT INCREASES
    // ------------------------------------------------------------------------
    function test_TimelockForLimitIncrease() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](0);
        bytes4[] memory selectors = new bytes4[](0);

        account.createSessionKey(agentKey, HOURLY_LIMIT, DAILY_LIMIT, block.timestamp + 7 days, false, targets, selectors, "Agent");

        // Propose limit increase
        uint256 newHourly = 100 * 1e18;
        uint256 newDaily = 500 * 1e18;
        account.proposeLimitIncrease(agentKey, newHourly, newDaily);

        // Immediate execution rejected
        vm.expectRevert("Timelock delay not elapsed");
        account.executeLimitIncrease(agentKey);

        // Warp past timelock delay (1 day)
        vm.warp(block.timestamp + TIMELOCK_DELAY + 1);

        account.executeLimitIncrease(agentKey);
        vm.stopPrank();

        (,uint256 h, uint256 d,,,) = account.sessionPolicies(agentKey);
        assertEq(h, newHourly);
        assertEq(d, newDaily);
    }

    function test_ExecuteAsAgent_Expired() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](0);
        bytes4[] memory selectors = new bytes4[](0);
        uint256 expiry = block.timestamp + 1 hours;
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            expiry,
            false,
            targets,
            selectors,
            "Expiring Agent"
        );
        vm.stopPrank();

        // Fast forward 2 hours
        vm.warp(block.timestamp + 2 hours);

        vm.startPrank(agentKey);
        vm.expectRevert("Session key has expired");
        account.executeAsAgent(serviceProvider, 10 * 1e18, "");
        vm.stopPrank();
    }

    function test_ExecuteAsAgent_Revoked() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](0);
        bytes4[] memory selectors = new bytes4[](0);
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            false,
            targets,
            selectors,
            "To Be Revoked"
        );

        // Revoke
        account.revokeSessionKey(agentKey);
        vm.stopPrank();

        vm.startPrank(agentKey);
        vm.expectRevert("Session key inactive or non-existent");
        account.executeAsAgent(serviceProvider, 5 * 1e18, "");
        vm.stopPrank();
    }

    function test_ExecuteAsAgent_TargetNotAllowed() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](1);
        targets[0] = serviceProvider;
        bytes4[] memory selectors = new bytes4[](0);
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            true, // Restricted
            targets,
            selectors,
            "Strict Agent"
        );
        vm.stopPrank();

        address rogueTarget = address(0x9999);
        vm.startPrank(agentKey);
        vm.expectRevert("Target address not whitelisted");
        account.executeAsAgent(rogueTarget, 5 * 1e18, "");
        vm.stopPrank();
    }

    function test_FactoryDeployment() public {
        vm.startPrank(owner);
        musd.approve(address(factory), 100 * 1e18);
        address newAcc = factory.createAccount{value: 0.05 ether}(100 * 1e18);
        vm.stopPrank();

        assertTrue(factory.isMezoAgentAccount(newAcc));
        assertEq(musd.balanceOf(newAcc), 100 * 1e18);
        assertEq(newAcc.balance, 0.05 ether);
        assertEq(factory.totalAccountsCount(), 1);
    }

    function test_CrossChainBridge() public {
        vm.startPrank(owner);
        uint256 usdcAmount = 500 * 1e6; // 500 USDC
        usdc.mint(owner, usdcAmount);
        usdc.approve(address(router), usdcAmount);

        // Mint liquidity into router for 1:1 payout
        musd.mint(address(router), 10_000 * 1e18);

        router.bridgeUSDCToMUSD(address(account), usdcAmount);
        vm.stopPrank();

        assertEq(musd.balanceOf(address(account)), INITIAL_BALANCE + 500 * 1e18);
    }

    function test_WithdrawMUSD_OnlyOwner() public {
        uint256 ownerBalBefore = musd.balanceOf(owner);

        vm.prank(unauthorizedUser);
        vm.expectRevert("Only owner can call this function");
        account.withdrawMUSD(unauthorizedUser, 500 * 1e18);

        vm.prank(owner);
        account.withdrawMUSD(owner, 500 * 1e18);
        assertEq(musd.balanceOf(owner), ownerBalBefore + 500 * 1e18);
    }

    function test_WithdrawGas_OnlyOwner() public {
        // Fund account with native BTC
        vm.deal(address(account), 1 ether);

        vm.prank(unauthorizedUser);
        vm.expectRevert("Only owner can call this function");
        account.withdrawGas(payable(unauthorizedUser), 0.5 ether);

        uint256 ownerBalBefore = owner.balance;
        vm.prank(owner);
        account.withdrawGas(payable(owner), 0.5 ether);
        assertEq(owner.balance, ownerBalBefore + 0.5 ether);
    }

    function testFuzz_RateLimitBoundaries(uint96 spendAmount1, uint96 spendAmount2) public {
        vm.assume(spendAmount1 > 0 && spendAmount1 <= HOURLY_LIMIT);
        vm.assume(spendAmount2 > 0 && spendAmount2 <= HOURLY_LIMIT);

        vm.startPrank(owner);
        address[] memory targets = new address[](0);
        bytes4[] memory selectors = new bytes4[](0);
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 10 days,
            false,
            targets,
            selectors,
            "Fuzz Agent"
        );
        vm.stopPrank();

        vm.startPrank(agentKey);
        account.executeAsAgent(serviceProvider, spendAmount1, "");

        if (uint256(spendAmount1) + uint256(spendAmount2) <= HOURLY_LIMIT) {
            account.executeAsAgent(serviceProvider, spendAmount2, "");
            assertEq(musd.balanceOf(serviceProvider), uint256(spendAmount1) + uint256(spendAmount2));
        } else {
            vm.expectRevert("Hourly MUSD limit exceeded");
            account.executeAsAgent(serviceProvider, spendAmount2, "");
        }
        vm.stopPrank();
    }
}
