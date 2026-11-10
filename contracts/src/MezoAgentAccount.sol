// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MezoAgentAccount
 * @notice Programmable smart account for autonomous AI agents on Mezo.
 * @dev Enforces cryptographic session key validation, velocity limits, and target whitelisting for MUSD expenditures.
 */
contract MezoAgentAccount is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public owner;
    IERC20 public immutable musdToken;

    struct SessionPolicy {
        bool active;
        uint256 hourlyLimit;      // Max MUSD allowed per 1-hour window
        uint256 dailyLimit;       // Max MUSD allowed per 24-hour window
        uint256 validUntil;       // Unix timestamp after which session key expires
        uint256 hourlySpent;      // Amount spent in current hour window
        uint256 currentHourWindow;// Current hour index: block.timestamp / 3600
        uint256 dailySpent;       // Amount spent in current day window
        uint256 currentDayWindow; // Current day index: block.timestamp / 86400
        bool restrictTargets;     // Whether agent is restricted to whitelisted targets
        string label;             // Human-readable agent name / role
    }

    // Mapping from session key address to its policy
    mapping(address => SessionPolicy) public sessionPolicies;

    // Mapping: sessionKey => targetAddress => isAllowed
    mapping(address => mapping(address => bool)) public isTargetAllowed;

    // Array of all registered session keys for auditing & UI display
    address[] public registeredKeys;

    // Events
    event SessionKeyCreated(
        address indexed sessionKey,
        uint256 hourlyLimit,
        uint256 dailyLimit,
        uint256 validUntil,
        bool restrictTargets,
        string label
    );
    event SessionKeyRevoked(address indexed sessionKey);
    event TargetWhitelisted(address indexed sessionKey, address indexed target, bool allowed);
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

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _owner, address _musdToken) {
        require(_owner != address(0), "Invalid owner address");
        require(_musdToken != address(0), "Invalid MUSD address");
        owner = _owner;
        musdToken = IERC20(_musdToken);
    }

    receive() external payable {}

    // ------------------------------------------------------------------------
    // OWNER MANAGEMENT
    // ------------------------------------------------------------------------

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @notice Register or update a session key for an autonomous agent.
     */
    function createSessionKey(
        address keySigner,
        uint256 hourlyLimit,
        uint256 dailyLimit,
        uint256 validUntil,
        bool restrictTargets,
        address[] calldata allowedTargets,
        string calldata label
    ) external onlyOwner {
        require(keySigner != address(0), "Invalid key signer");
        require(validUntil > block.timestamp, "Expiry must be in future");
        require(hourlyLimit <= dailyLimit, "Hourly limit cannot exceed daily limit");

        if (!sessionPolicies[keySigner].active && sessionPolicies[keySigner].validUntil == 0) {
            registeredKeys.push(keySigner);
        }

        uint256 hourNow = block.timestamp / 3600;
        uint256 dayNow = block.timestamp / 86400;

        sessionPolicies[keySigner] = SessionPolicy({
            active: true,
            hourlyLimit: hourlyLimit,
            dailyLimit: dailyLimit,
            validUntil: validUntil,
            hourlySpent: 0,
            currentHourWindow: hourNow,
            dailySpent: 0,
            currentDayWindow: dayNow,
            restrictTargets: restrictTargets,
            label: label
        });

        for (uint256 i = 0; i < allowedTargets.length; i++) {
            isTargetAllowed[keySigner][allowedTargets[i]] = true;
            emit TargetWhitelisted(keySigner, allowedTargets[i], true);
        }

        emit SessionKeyCreated(keySigner, hourlyLimit, dailyLimit, validUntil, restrictTargets, label);
    }

    /**
     * @notice Revoke a session key immediately.
     */
    function revokeSessionKey(address keySigner) external onlyOwner {
        require(sessionPolicies[keySigner].active, "Session key is not active");
        sessionPolicies[keySigner].active = false;
        emit SessionKeyRevoked(keySigner);
    }

    /**
     * @notice Whitelist or remove a specific target contract for an agent.
     */
    function setTargetAllowed(address keySigner, address target, bool allowed) external onlyOwner {
        isTargetAllowed[keySigner][target] = allowed;
        emit TargetWhitelisted(keySigner, target, allowed);
    }

    /**
     * @notice Withdraw MUSD back to owner or designated address.
     */
    function withdrawMUSD(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient");
        musdToken.safeTransfer(to, amount);
        emit FundsWithdrawn(to, amount);
    }

    /**
     * @notice Withdraw native gas (BTC) back to owner.
     */
    function withdrawGas(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient native balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Native transfer failed");
    }

    // ------------------------------------------------------------------------
    // AGENT EXECUTION
    // ------------------------------------------------------------------------

    /**
     * @notice Execute an authorized action on behalf of the smart account.
     * @param target The target contract or recipient.
     * @param musdAmount The amount of MUSD to transfer to the target (can be 0 for pure calls).
     * @param data The calldata payload to execute on the target.
     */
    function executeAsAgent(
        address target,
        uint256 musdAmount,
        bytes calldata data
    ) external nonReentrant returns (bytes memory returnData) {
        SessionPolicy storage policy = sessionPolicies[msg.sender];
        require(policy.active, "Session key inactive or non-existent");
        require(block.timestamp <= policy.validUntil, "Session key has expired");

        if (policy.restrictTargets) {
            require(isTargetAllowed[msg.sender][target], "Target address not whitelisted");
        }

        // Window-based velocity checks
        uint256 hourNow = block.timestamp / 3600;
        if (hourNow > policy.currentHourWindow) {
            policy.currentHourWindow = hourNow;
            policy.hourlySpent = 0;
        }

        uint256 dayNow = block.timestamp / 86400;
        if (dayNow > policy.currentDayWindow) {
            policy.currentDayWindow = dayNow;
            policy.dailySpent = 0;
        }

        if (musdAmount > 0) {
            require(policy.hourlySpent + musdAmount <= policy.hourlyLimit, "Hourly MUSD limit exceeded");
            require(policy.dailySpent + musdAmount <= policy.dailyLimit, "Daily MUSD limit exceeded");
            require(musdToken.balanceOf(address(this)) >= musdAmount, "Insufficient MUSD account balance");

            policy.hourlySpent += musdAmount;
            policy.dailySpent += musdAmount;

            musdToken.safeTransfer(target, musdAmount);
        }

        bytes4 selector = bytes4(0);
        bool callSuccess = true;

        if (data.length > 0) {
            selector = bytes4(data[0]) | (bytes4(data[1]) >> 8) | (bytes4(data[2]) >> 16) | (bytes4(data[3]) >> 24);
            (callSuccess, returnData) = target.call(data);
            require(callSuccess, "Agent target call failed");
        }

        emit AgentActionExecuted(msg.sender, target, musdAmount, selector, callSuccess);
    }

    // ------------------------------------------------------------------------
    // VIEW HELPERS
    // ------------------------------------------------------------------------

    function getRegisteredKeysCount() external view returns (uint256) {
        return registeredKeys.length;
    }

    function getRemainingHourlyBudget(address keySigner) external view returns (uint256) {
        SessionPolicy memory policy = sessionPolicies[keySigner];
        if (!policy.active || block.timestamp > policy.validUntil) return 0;
        uint256 hourNow = block.timestamp / 3600;
        if (hourNow > policy.currentHourWindow) return policy.hourlyLimit;
        if (policy.hourlySpent >= policy.hourlyLimit) return 0;
        return policy.hourlyLimit - policy.hourlySpent;
    }

    function getRemainingDailyBudget(address keySigner) external view returns (uint256) {
        SessionPolicy memory policy = sessionPolicies[keySigner];
        if (!policy.active || block.timestamp > policy.validUntil) return 0;
        uint256 dayNow = block.timestamp / 86400;
        if (dayNow > policy.currentDayWindow) return policy.dailyLimit;
        if (policy.dailySpent >= policy.dailyLimit) return 0;
        return policy.dailyLimit - policy.dailySpent;
    }

    function getAccountBalance() external view returns (uint256 musdBalance, uint256 nativeBalance) {
        return (musdToken.balanceOf(address(this)), address(this).balance);
    }
}
