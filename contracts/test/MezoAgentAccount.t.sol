// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MezoAgentAccount.sol";
import "../src/MezoAgentFactory.sol";
import "../src/MezoBridgeRouter.sol";
import "../src/MockMUSD.sol";
import "../src/MockUSDC.sol";

contract MezoAgentAccountTest is Test {
    MezoAgentAccount public account;
    MezoAgentFactory public factory;
    MezoBridgeRouter public router;
    MockMUSD public musd;
    MockUSDC public usdc;

    address public owner = address(0xAA11);
    address public agentKey = address(0xBB22);
    address public unauthorizedUser = address(0xDEAD);
    address public serviceProvider = address(0xCC33);

    uint256 public constant INITIAL_BALANCE = 10_000 * 1e18;
    uint256 public constant HOURLY_LIMIT = 50 * 1e18;
    uint256 public constant DAILY_LIMIT = 200 * 1e18;

    function setUp() public {
        vm.deal(owner, 10 ether);
        vm.deal(agentKey, 1 ether);
        vm.startPrank(owner);

        musd = new MockMUSD();
        usdc = new MockUSDC();
        factory = new MezoAgentFactory(address(musd));
        router = new MezoBridgeRouter(address(usdc), address(musd));

        account = new MezoAgentAccount(owner, address(musd));

        // Fund account with MUSD
        musd.mint(address(account), INITIAL_BALANCE);

        vm.stopPrank();
    }

    function test_InitialState() public view {
        assertEq(account.owner(), owner);
        assertEq(address(account.musdToken()), address(musd));
        (uint256 musdBal, ) = account.getAccountBalance();
        assertEq(musdBal, INITIAL_BALANCE);
    }

    function test_CreateSessionKey() public {
        vm.startPrank(owner);

        address[] memory targets = new address[](1);
        targets[0] = serviceProvider;

        uint256 expiry = block.timestamp + 7 days;

        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            expiry,
            true, // restrictTargets
            targets,
            "Autonomous Search Agent"
        );

        vm.stopPrank();

        (
            bool active,
            uint256 hourlyLimit,
            uint256 dailyLimit,
            uint256 validUntil,
            ,
            ,
            ,
            ,
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
    }

    function test_ExecuteAsAgent_Success() public {
        // Setup session key
        vm.startPrank(owner);
        address[] memory targets = new address[](1);
        targets[0] = serviceProvider;
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            true,
            targets,
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
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            false,
            targets,
            "Agent"
        );
        vm.stopPrank();

        vm.startPrank(agentKey);
        // Exceeds 50 MUSD hourly limit
        vm.expectRevert("Hourly MUSD limit exceeded");
        account.executeAsAgent(serviceProvider, 51 * 1e18, "");
        vm.stopPrank();
    }

    function test_ExecuteAsAgent_Expired() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](0);
        uint256 expiry = block.timestamp + 1 hours;
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            expiry,
            false,
            targets,
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
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            false,
            targets,
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
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 1 days,
            true, // Restricted
            targets,
            "Strict Agent"
        );
        vm.stopPrank();

        address rogueTarget = address(0x9999);
        vm.startPrank(agentKey);
        vm.expectRevert("Target address not whitelisted");
        account.executeAsAgent(rogueTarget, 5 * 1e18, "");
        vm.stopPrank();
    }

    function test_WindowReset() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](0);
        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 2 days,
            false,
            targets,
            "Multi-hour Agent"
        );
        vm.stopPrank();

        vm.startPrank(agentKey);
        // Spend full hourly limit (50 MUSD)
        account.executeAsAgent(serviceProvider, 50 * 1e18, "");
        assertEq(account.getRemainingHourlyBudget(agentKey), 0);

        // Advance time by 65 minutes (next hour window)
        vm.warp(block.timestamp + 65 minutes);

        // Hourly budget resets back to 50 MUSD
        assertEq(account.getRemainingHourlyBudget(agentKey), HOURLY_LIMIT);
        // Daily remaining is now 200 - 50 = 150 MUSD
        assertEq(account.getRemainingDailyBudget(agentKey), 150 * 1e18);

        // Can spend another 40 MUSD
        account.executeAsAgent(serviceProvider, 40 * 1e18, "");
        vm.stopPrank();

        assertEq(musd.balanceOf(serviceProvider), 90 * 1e18);
    }

    function test_FactoryDeployment() public {
        vm.startPrank(owner);
        musd.approve(address(factory), 100 * 1e18);
        address newAcc = factory.createAccount{value: 0.05 ether}(100 * 1e18);

        assertTrue(factory.isMezoAgentAccount(newAcc));
        assertEq(factory.getUserAccounts(owner).length, 1);
        assertEq(musd.balanceOf(newAcc), 100 * 1e18);
        assertEq(newAcc.balance, 0.05 ether);
        vm.stopPrank();
    }

    function test_CrossChainBridge() public {
        address user = address(0x5555);
        uint256 depositUSDC = 500 * 1e6; // 500 USDC (6 decimals)

        vm.startPrank(user);
        usdc.faucet(depositUSDC);
        usdc.approve(address(router), depositUSDC);

        // Bridge USDC to account
        router.bridgeUSDCToMUSD(address(account), depositUSDC);
        vm.stopPrank();

        // 500 USDC converts to 500 MUSD (18 decimals)
        // INITIAL_BALANCE (10,000) + 500 = 10,500 MUSD
        assertEq(musd.balanceOf(address(account)), INITIAL_BALANCE + (500 * 1e18));
    }

    function test_WithdrawMUSD_OnlyOwner() public {
        vm.startPrank(unauthorizedUser);
        vm.expectRevert("Only owner can call this function");
        account.withdrawMUSD(unauthorizedUser, 100 * 1e18);
        vm.stopPrank();

        uint256 ownerBalBefore = musd.balanceOf(owner);
        vm.startPrank(owner);
        account.withdrawMUSD(owner, 500 * 1e18);
        assertEq(musd.balanceOf(owner), ownerBalBefore + 500 * 1e18);
        vm.stopPrank();
    }

    function test_WithdrawGas_OnlyOwner() public {
        // Send native gas to account
        vm.prank(owner);
        (bool sent, ) = address(account).call{value: 2 ether}("");
        assertTrue(sent);

        vm.startPrank(unauthorizedUser);
        vm.expectRevert("Only owner can call this function");
        account.withdrawGas(payable(unauthorizedUser), 1 ether);
        vm.stopPrank();

        uint256 ownerBalBefore = owner.balance;
        vm.startPrank(owner);
        account.withdrawGas(payable(owner), 1 ether);
        assertEq(owner.balance, ownerBalBefore + 1 ether);
        vm.stopPrank();
    }

    function test_MultipleSessionKeys_Isolation() public {
        address agentA = address(0xAA01);
        address agentB = address(0xBB02);

        vm.startPrank(owner);
        address[] memory targets = new address[](0);
        account.createSessionKey(agentA, 20 * 1e18, 100 * 1e18, block.timestamp + 1 days, false, targets, "Agent A");
        account.createSessionKey(agentB, 50 * 1e18, 200 * 1e18, block.timestamp + 1 days, false, targets, "Agent B");
        vm.stopPrank();

        assertEq(account.getRegisteredKeysCount(), 2);

        // Agent A spends 20
        vm.prank(agentA);
        account.executeAsAgent(serviceProvider, 20 * 1e18, "");
        assertEq(account.getRemainingHourlyBudget(agentA), 0);

        // Agent B's budget is completely untouched and can spend 50
        assertEq(account.getRemainingHourlyBudget(agentB), 50 * 1e18);
        vm.prank(agentB);
        account.executeAsAgent(serviceProvider, 50 * 1e18, "");
        assertEq(account.getRemainingHourlyBudget(agentB), 0);
    }

    function test_DailyLimitExceededAcrossWindows() public {
        vm.startPrank(owner);
        address[] memory targets = new address[](0);
        // Hourly limit 50, Daily limit 100
        account.createSessionKey(agentKey, 50 * 1e18, 100 * 1e18, block.timestamp + 3 days, false, targets, "Capped Agent");
        vm.stopPrank();

        vm.startPrank(agentKey);
        // Hour 1: spend 50
        account.executeAsAgent(serviceProvider, 50 * 1e18, "");

        // Advance 1 hour
        vm.warp(block.timestamp + 1 hours);
        // Hour 2: spend 50 (Total daily spent: 100)
        account.executeAsAgent(serviceProvider, 50 * 1e18, "");

        // Advance 1 hour
        vm.warp(block.timestamp + 1 hours);
        // Hour 3: Hourly limit would be 50, but daily limit is 100 and already exhausted!
        assertEq(account.getRemainingDailyBudget(agentKey), 0);
        vm.expectRevert("Daily MUSD limit exceeded");
        account.executeAsAgent(serviceProvider, 1 * 1e18, "");
        vm.stopPrank();
    }

    function testFuzz_RateLimitBoundaries(uint96 rawLimit, uint96 rawSpend) public {
        vm.assume(rawLimit > 1e18 && rawLimit < 1_000_000 * 1e18);
        vm.assume(rawSpend > 0 && rawSpend < 1_000_000 * 1e18);

        uint256 limit = uint256(rawLimit);
        uint256 spend = uint256(rawSpend);

        address fuzzAgent = address(0xF002);
        vm.startPrank(owner);
        address[] memory targets = new address[](0);
        account.createSessionKey(fuzzAgent, limit, limit * 2, block.timestamp + 1 days, false, targets, "Fuzz");
        vm.stopPrank();

        vm.startPrank(fuzzAgent);
        if (spend <= limit && spend <= INITIAL_BALANCE) {
            account.executeAsAgent(serviceProvider, spend, "");
            assertEq(musd.balanceOf(serviceProvider), spend);
        } else if (spend > limit) {
            vm.expectRevert("Hourly MUSD limit exceeded");
            account.executeAsAgent(serviceProvider, spend, "");
        }
        vm.stopPrank();
    }
}
