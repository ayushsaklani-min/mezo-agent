// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MezoAgentAccount
 * @notice Enterprise-grade smart account for autonomous AI agents on Mezo.
 * @dev Enforces cryptographic session key validation, true sliding-window velocity limits,
 *      granular (target, selector) whitelisting, guardian emergency freeze, and Safe/multisig compatibility.
 */
contract MezoAgentAccount is ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ------------------------------------------------------------------------
    // CONSTANTS & SLIDING WINDOW CONFIG
    // ------------------------------------------------------------------------
    uint256 public constant HOURLY_WINDOW = 3600;       // 1 hour
    uint256 public constant HOURLY_BUCKET_SIZE = 300;   // 5 minutes per bucket
    uint256 public constant HOURLY_BUCKETS = 12;        // 12 * 300s = 3600s

    uint256 public constant DAILY_WINDOW = 86400;       // 24 hours
    uint256 public constant DAILY_BUCKET_SIZE = 3600;   // 1 hour per bucket
    uint256 public constant DAILY_BUCKETS = 24;         // 24 * 3600s = 86400s

    address public owner;
    address public guardian; // Optional security guardian (can freeze/pause in emergency)
    IERC20 public immutable musdToken;

    // Timelock configuration for limit increases (enterprise safety)
    uint256 public timelockDelay;

    struct SessionPolicy {
        bool active;
        uint256 hourlyLimit;      // Max MUSD allowed in any sliding 1-hour window
        uint256 dailyLimit;       // Max MUSD allowed in any sliding 24-hour window
        uint256 validUntil;       // Unix timestamp after which session key expires
        bool restrictTargets;     // Whether agent is restricted to whitelisted targets & selectors
        string label;             // Human-readable agent name / role
    }

    struct SlidingWindow {
        uint256[12] hourlyAmounts;
        uint256[12] hourlyTimestamps;
        uint256[24] dailyAmounts;
        uint256[24] dailyTimestamps;
    }

    struct LimitProposal {
        uint256 newHourlyLimit;
        uint256 newDailyLimit;
        uint256 executeAfter;
    }

    // Mapping from session key address to its policy
    mapping(address => SessionPolicy) public sessionPolicies;

    // Mapping from session key to sliding window tracking
    mapping(address => SlidingWindow) internal sessionWindows;

    // Granular Whitelisting:
    // sessionKey => targetAddress => isAllowed
    mapping(address => mapping(address => bool)) public isTargetAllowed;

    // sessionKey => targetAddress => functionSelector => isAllowed
    mapping(address => mapping(address => mapping(bytes4 => bool))) public isFunctionAllowed;

    // Pending limit increase proposals (timelock enforced)
    mapping(address => LimitProposal) public pendingLimitProposals;

    // Array of all registered session keys for auditing & UI display
    address[] public registeredKeys;

    // ------------------------------------------------------------------------
    // EVENTS
    // ------------------------------------------------------------------------
    event SessionKeyCreated(
        address indexed sessionKey,
        uint256 hourlyLimit,
        uint256 dailyLimit,
        uint256 validUntil,
        bool restrictTargets,
        string label
    );
    event SessionKeyRevoked(address indexed sessionKey);
    event AllSessionKeysRevoked(uint256 timestamp);
    event TargetWhitelisted(address indexed sessionKey, address indexed target, bool allowed);
    event FunctionWhitelisted(address indexed sessionKey, address indexed target, bytes4 indexed selector, bool allowed);
    event AgentActionExecuted(
        address indexed sessionKey,
        address indexed target,
        uint256 musdAmount,
        bytes4 selector,
        bool callSuccess
    );
    event FundsDeposited(address indexed sender, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event GuardianUpdated(address indexed previousGuardian, address indexed newGuardian);
    event LimitIncreaseProposed(address indexed sessionKey, uint256 newHourly, uint256 newDaily, uint256 executeAfter);
    event LimitIncreaseExecuted(address indexed sessionKey, uint256 newHourly, uint256 newDaily);
    event LimitsUpdated(address indexed sessionKey, uint256 newHourly, uint256 newDaily);

    // ------------------------------------------------------------------------
    // MODIFIERS
    // ------------------------------------------------------------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyOwnerOrGuardian() {
        require(msg.sender == owner || (guardian != address(0) && msg.sender == guardian), "Not owner or guardian");
        _;
    }

    constructor(address _owner, address _musdToken, uint256 _timelockDelay) {
        require(_owner != address(0), "Invalid owner address");
        require(_musdToken != address(0), "Invalid MUSD address");
        owner = _owner;
        musdToken = IERC20(_musdToken);
        timelockDelay = _timelockDelay;
    }

    receive() external payable {}

    // ------------------------------------------------------------------------
    // OWNER & GUARDIAN MANAGEMENT
    // ------------------------------------------------------------------------

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setGuardian(address _guardian) external onlyOwner {
        emit GuardianUpdated(guardian, _guardian);
        guardian = _guardian;
    }

    function setTimelockDelay(uint256 _delay) external onlyOwner {
        timelockDelay = _delay;
    }

    /**
     * @notice Emergency Pause: freezes all agent executions immediately.
     */
    function pause() external onlyOwnerOrGuardian {
        _pause();
    }

    /**
     * @notice Unpause: resumes agent operations once safety is confirmed.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ------------------------------------------------------------------------
    // SESSION KEY LIFECYCLE
    // ------------------------------------------------------------------------

    /**
     * @notice Register a session key for an autonomous agent.
     * @dev Only the public key derived by the agent is registered; the private key never touches the chain.
     */
    function createSessionKey(
        address keySigner,
        uint256 hourlyLimit,
        uint256 dailyLimit,
        uint256 validUntil,
        bool restrictTargets,
        address[] calldata allowedTargets,
        bytes4[] calldata allowedSelectors,
        string calldata label
    ) external onlyOwner {
        require(keySigner != address(0), "Invalid key signer");
        require(validUntil > block.timestamp, "Expiry must be in future");
        require(hourlyLimit <= dailyLimit, "Hourly limit cannot exceed daily limit");

        if (!sessionPolicies[keySigner].active && sessionPolicies[keySigner].validUntil == 0) {
            registeredKeys.push(keySigner);
        }

        sessionPolicies[keySigner] = SessionPolicy({
            active: true,
            hourlyLimit: hourlyLimit,
            dailyLimit: dailyLimit,
            validUntil: validUntil,
            restrictTargets: restrictTargets,
            label: label
        });

        for (uint256 i = 0; i < allowedTargets.length; i++) {
            isTargetAllowed[keySigner][allowedTargets[i]] = true;
            emit TargetWhitelisted(keySigner, allowedTargets[i], true);

            // If selectors provided, whitelist them for this target
            for (uint256 j = 0; j < allowedSelectors.length; j++) {
                isFunctionAllowed[keySigner][allowedTargets[i]][allowedSelectors[j]] = true;
                emit FunctionWhitelisted(keySigner, allowedTargets[i], allowedSelectors[j], true);
            }
        }

        emit SessionKeyCreated(keySigner, hourlyLimit, dailyLimit, validUntil, restrictTargets, label);
    }

    /**
     * @notice Revoke a session key immediately.
     */
    function revokeSessionKey(address keySigner) external onlyOwnerOrGuardian {
        require(sessionPolicies[keySigner].active, "Session key is not active");
        sessionPolicies[keySigner].active = false;
        emit SessionKeyRevoked(keySigner);
    }

    /**
     * @notice Emergency action: instantly revokes all active session keys.
     */
    function revokeAllSessionKeys() external onlyOwnerOrGuardian {
        for (uint256 i = 0; i < registeredKeys.length; i++) {
            address key = registeredKeys[i];
            if (sessionPolicies[key].active) {
                sessionPolicies[key].active = false;
                emit SessionKeyRevoked(key);
            }
        }
        emit AllSessionKeysRevoked(block.timestamp);
    }

    /**
     * @notice Whitelist or remove a specific target contract for an agent.
     */
    function setTargetAllowed(address keySigner, address target, bool allowed) external onlyOwner {
        isTargetAllowed[keySigner][target] = allowed;
        emit TargetWhitelisted(keySigner, target, allowed);
    }

    /**
     * @notice Whitelist or remove a specific function selector for an agent on a target contract.
     */
    function setFunctionAllowed(address keySigner, address target, bytes4 selector, bool allowed) external onlyOwner {
        isFunctionAllowed[keySigner][target][selector] = allowed;
        emit FunctionWhitelisted(keySigner, target, selector, allowed);
    }

    // ------------------------------------------------------------------------
    // TIMELOCK FOR LIMIT INCREASES
    // ------------------------------------------------------------------------

    /**
     * @notice Propose an increase to an agent's hourly or daily spending limits.
     */
    function proposeLimitIncrease(address keySigner, uint256 newHourly, uint256 newDaily) external onlyOwner {
        require(sessionPolicies[keySigner].active, "Session key inactive");
        require(newHourly <= newDaily, "Hourly limit cannot exceed daily limit");

        uint256 executeAfter = block.timestamp + timelockDelay;
        pendingLimitProposals[keySigner] = LimitProposal({
            newHourlyLimit: newHourly,
            newDailyLimit: newDaily,
            executeAfter: executeAfter
        });

        emit LimitIncreaseProposed(keySigner, newHourly, newDaily, executeAfter);
    }

    /**
     * @notice Execute an approved limit increase after the timelock delay has elapsed.
     */
    function executeLimitIncrease(address keySigner) external onlyOwner {
        LimitProposal memory proposal = pendingLimitProposals[keySigner];
        require(proposal.executeAfter > 0, "No pending proposal");
        require(block.timestamp >= proposal.executeAfter, "Timelock delay not elapsed");

        sessionPolicies[keySigner].hourlyLimit = proposal.newHourlyLimit;
        sessionPolicies[keySigner].dailyLimit = proposal.newDailyLimit;

        delete pendingLimitProposals[keySigner];
        emit LimitIncreaseExecuted(keySigner, proposal.newHourlyLimit, proposal.newDailyLimit);
    }

    /**
     * @notice Instant reduction of limits (lowering limits never requires a timelock).
     */
    function reduceLimitsInstant(address keySigner, uint256 newHourly, uint256 newDaily) external onlyOwner {
        SessionPolicy storage policy = sessionPolicies[keySigner];
        require(policy.active, "Session key inactive");
        require(newHourly <= policy.hourlyLimit && newDaily <= policy.dailyLimit, "Can only reduce limits");
        require(newHourly <= newDaily, "Hourly cannot exceed daily");

        policy.hourlyLimit = newHourly;
        policy.dailyLimit = newDaily;

        emit LimitsUpdated(keySigner, newHourly, newDaily);
    }

    // ------------------------------------------------------------------------
    // TREASURY WITHDRAWALS (OWNER ONLY)
    // ------------------------------------------------------------------------

    function withdrawMUSD(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient");
        musdToken.safeTransfer(to, amount);
        emit FundsWithdrawn(to, amount);
    }

    function withdrawGas(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient native balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Native transfer failed");
    }

    // ------------------------------------------------------------------------
    // AGENT EXECUTION ENGINE
    // ------------------------------------------------------------------------

    /**
     * @notice Execute an authorized action on behalf of the smart account.
     * @dev Validates session key status, expiry, target whitelist, selector whitelist, and true sliding-window rate limits.
     * @param target The target contract or recipient.
     * @param musdAmount The amount of MUSD to transfer to the target.
     * @param data The calldata payload to execute on the target.
     */
    function executeAsAgent(
        address target,
        uint256 musdAmount,
        bytes calldata data
    ) external nonReentrant whenNotPaused returns (bytes memory returnData) {
        SessionPolicy storage policy = sessionPolicies[msg.sender];
        require(policy.active, "Session key inactive or non-existent");
        require(block.timestamp <= policy.validUntil, "Session key has expired");

        bytes4 selector = bytes4(0);
        if (data.length >= 4) {
            selector = bytes4(data[:4]);
        }

        if (policy.restrictTargets) {
            require(isTargetAllowed[msg.sender][target], "Target address not whitelisted");
            if (data.length >= 4) {
                require(isFunctionAllowed[msg.sender][target][selector], "Function selector not whitelisted");
            }
            // Strict defense-in-depth: disallow agents from approving attacker allowances
            if (target == address(musdToken) && selector == IERC20.approve.selector) {
                revert("Direct MUSD approve forbidden for agent keys");
            }
        }

        // True sliding window velocity checks
        if (musdAmount > 0) {
            uint256 currentHourlySpent = getHourlySpent(msg.sender);
            require(currentHourlySpent + musdAmount <= policy.hourlyLimit, "Hourly MUSD limit exceeded");

            uint256 currentDailySpent = getDailySpent(msg.sender);
            require(currentDailySpent + musdAmount <= policy.dailyLimit, "Daily MUSD limit exceeded");

            require(musdToken.balanceOf(address(this)) >= musdAmount, "Insufficient MUSD account balance");

            _recordSpend(msg.sender, musdAmount);
            musdToken.safeTransfer(target, musdAmount);
        }

        bool callSuccess = true;
        if (data.length > 0) {
            (callSuccess, returnData) = target.call(data);
            require(callSuccess, "Agent target call failed");
        }

        emit AgentActionExecuted(msg.sender, target, musdAmount, selector, callSuccess);
    }

    // ------------------------------------------------------------------------
    // SLIDING WINDOW INTERNALS
    // ------------------------------------------------------------------------

    function _recordSpend(address keySigner, uint256 amount) internal {
        SlidingWindow storage window = sessionWindows[keySigner];

        // 1. Record Hourly Spend (12 buckets of 300s)
        uint256 hourlyBucketIdx = (block.timestamp / HOURLY_BUCKET_SIZE) % HOURLY_BUCKETS;
        uint256 hourlyBucketTime = (block.timestamp / HOURLY_BUCKET_SIZE) * HOURLY_BUCKET_SIZE;
        uint256 hourlyMarker = hourlyBucketTime + 1; // +1 to distinguish from uninitialized 0

        if (window.hourlyTimestamps[hourlyBucketIdx] != hourlyMarker) {
            // New bucket interval reached: overwrite stale bucket data
            window.hourlyTimestamps[hourlyBucketIdx] = hourlyMarker;
            window.hourlyAmounts[hourlyBucketIdx] = amount;
        } else {
            window.hourlyAmounts[hourlyBucketIdx] += amount;
        }

        // 2. Record Daily Spend (24 buckets of 3600s)
        uint256 dailyBucketIdx = (block.timestamp / DAILY_BUCKET_SIZE) % DAILY_BUCKETS;
        uint256 dailyBucketTime = (block.timestamp / DAILY_BUCKET_SIZE) * DAILY_BUCKET_SIZE;
        uint256 dailyMarker = dailyBucketTime + 1; // +1 to distinguish from uninitialized 0

        if (window.dailyTimestamps[dailyBucketIdx] != dailyMarker) {
            // New daily bucket reached: overwrite stale data
            window.dailyTimestamps[dailyBucketIdx] = dailyMarker;
            window.dailyAmounts[dailyBucketIdx] = amount;
        } else {
            window.dailyAmounts[dailyBucketIdx] += amount;
        }
    }

    // ------------------------------------------------------------------------
    // VIEW FUNCTIONS & AUDIT HELPERS
    // ------------------------------------------------------------------------

    /**
     * @notice Sums expenditure across the active buckets within the last 3600 seconds.
     */
    function getHourlySpent(address keySigner) public view returns (uint256 total) {
        SlidingWindow storage window = sessionWindows[keySigner];
        uint256 nowSec = block.timestamp;

        for (uint256 i = 0; i < HOURLY_BUCKETS; i++) {
            uint256 marker = window.hourlyTimestamps[i];
            if (marker != 0) {
                uint256 bucketStartTime = marker - 1;
                if (nowSec >= bucketStartTime && nowSec - bucketStartTime < HOURLY_WINDOW) {
                    total += window.hourlyAmounts[i];
                }
            }
        }
    }

    /**
     * @notice Sums expenditure across the active buckets within the last 86400 seconds.
     */
    function getDailySpent(address keySigner) public view returns (uint256 total) {
        SlidingWindow storage window = sessionWindows[keySigner];
        uint256 nowSec = block.timestamp;

        for (uint256 i = 0; i < DAILY_BUCKETS; i++) {
            uint256 marker = window.dailyTimestamps[i];
            if (marker != 0) {
                uint256 bucketStartTime = marker - 1;
                if (nowSec >= bucketStartTime && nowSec - bucketStartTime < DAILY_WINDOW) {
                    total += window.dailyAmounts[i];
                }
            }
        }
    }

    function getRemainingHourlyBudget(address keySigner) external view returns (uint256) {
        SessionPolicy memory policy = sessionPolicies[keySigner];
        if (!policy.active || block.timestamp > policy.validUntil) return 0;
        uint256 spent = getHourlySpent(keySigner);
        if (spent >= policy.hourlyLimit) return 0;
        return policy.hourlyLimit - spent;
    }

    function getRemainingDailyBudget(address keySigner) external view returns (uint256) {
        SessionPolicy memory policy = sessionPolicies[keySigner];
        if (!policy.active || block.timestamp > policy.validUntil) return 0;
        uint256 spent = getDailySpent(keySigner);
        if (spent >= policy.dailyLimit) return 0;
        return policy.dailyLimit - spent;
    }

    function getRegisteredKeysCount() external view returns (uint256) {
        return registeredKeys.length;
    }

    function getAccountBalance() external view returns (uint256 musdBalance, uint256 nativeBalance) {
        return (musdToken.balanceOf(address(this)), address(this).balance);
    }
}
