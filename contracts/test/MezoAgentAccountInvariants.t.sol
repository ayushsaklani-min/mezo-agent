// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "forge-std/StdInvariant.sol";
import "../src/MezoAgentAccount.sol";
import "../src/MockMUSD.sol";

contract AgentHandler is Test {
    MezoAgentAccount public account;
    MockMUSD public musd;

    address public owner;
    address public agentKey;
    address public target;

    uint256 public constant HOURLY_LIMIT = 100 * 1e18;
    uint256 public constant DAILY_LIMIT = 500 * 1e18;

    uint256 public totalSpent;
    bool public wasRevoked;
    bool public wasPaused;

    constructor(MezoAgentAccount _account, MockMUSD _musd, address _owner, address _agentKey, address _target) {
        account = _account;
        musd = _musd;
        owner = _owner;
        agentKey = _agentKey;
        target = _target;
    }

    function spend(uint256 rawAmount) external {
        uint256 amount = bound(rawAmount, 1 * 1e18, 50 * 1e18);

        vm.prank(agentKey);
        try account.executeAsAgent(target, amount, "") {
            totalSpent += amount;
        } catch {
            // Revert is expected if limits exceeded, paused, or revoked
        }
    }

    function warpTime(uint256 timeJump) external {
        uint256 jump = bound(timeJump, 60, 7200); // 1 min to 2 hours
        vm.warp(block.timestamp + jump);
    }

    function pauseAccount() external {
        vm.prank(owner);
        account.pause();
        wasPaused = true;
    }

    function unpauseAccount() external {
        vm.prank(owner);
        account.unpause();
        wasPaused = false;
    }

    function revokeKey() external {
        vm.prank(owner);
        account.revokeSessionKey(agentKey);
        wasRevoked = true;
    }
}

contract MezoAgentAccountInvariantsTest is StdInvariant, Test {
    MezoAgentAccount public account;
    MockMUSD public musd;
    AgentHandler public handler;

    address public owner = address(0x1111);
    address public agentKey = address(0x2222);
    address public target = address(0x3333);

    uint256 public constant INITIAL_VAULT = 1_000_000 * 1e18;
    uint256 public constant HOURLY_LIMIT = 100 * 1e18;
    uint256 public constant DAILY_LIMIT = 500 * 1e18;

    function setUp() public {
        vm.deal(owner, 10 ether);
        vm.deal(agentKey, 1 ether);

        vm.startPrank(owner);
        musd = new MockMUSD();
        account = new MezoAgentAccount(owner, address(musd), 0);

        musd.mint(address(account), INITIAL_VAULT);

        address[] memory targets = new address[](1);
        targets[0] = target;
        bytes4[] memory selectors = new bytes4[](0);

        account.createSessionKey(
            agentKey,
            HOURLY_LIMIT,
            DAILY_LIMIT,
            block.timestamp + 365 days,
            false,
            targets,
            selectors,
            "Invariant Test Agent"
        );
        vm.stopPrank();

        handler = new AgentHandler(account, musd, owner, agentKey, target);

        targetContract(address(handler));
    }

    // Invariant 1: Hourly spent in any active sliding window NEVER exceeds HOURLY_LIMIT
    function invariant_HourlySpendNeverExceedsCap() public view {
        uint256 currentHourly = account.getHourlySpent(agentKey);
        assertLe(currentHourly, HOURLY_LIMIT, "INVARIANT BREACH: Hourly spend exceeded hourly limit!");
    }

    // Invariant 2: Daily spent in any active sliding window NEVER exceeds DAILY_LIMIT
    function invariant_DailySpendNeverExceedsCap() public view {
        uint256 currentDaily = account.getDailySpent(agentKey);
        assertLe(currentDaily, DAILY_LIMIT, "INVARIANT BREACH: Daily spend exceeded daily limit!");
    }

    // Invariant 3: Treasury solvency - Account balance + target balance never exceeds initial deposit
    function invariant_Solvency() public view {
        uint256 accBal = musd.balanceOf(address(account));
        uint256 targetBal = musd.balanceOf(target);
        assertEq(accBal + targetBal, INITIAL_VAULT, "INVARIANT BREACH: Token conservation violated!");
    }
}
