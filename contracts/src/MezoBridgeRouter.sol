// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMintableERC20 is IERC20 {
    function mint(address to, uint256 amount) external;
}

/**
 * @title MezoBridgeRouter
 * @notice Cross-chain routing simulator connecting USDC liquidity to Mezo's MUSD.
 */
contract MezoBridgeRouter is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdcToken;
    IMintableERC20 public immutable musdToken;

    event CrossChainBridged(
        address indexed sender,
        address indexed targetAccount,
        uint256 usdcDeposited,
        uint256 musdMinted,
        uint256 timestamp
    );

    event ServicePaymentReceived(
        address indexed payer,
        address indexed serviceProvider,
        uint256 amountMUSD,
        string serviceId
    );

    constructor(address _usdcToken, address _musdToken) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid USDC");
        require(_musdToken != address(0), "Invalid MUSD");
        usdcToken = IERC20(_usdcToken);
        musdToken = IMintableERC20(_musdToken);
    }

    /**
     * @notice Deposit USDC (6 decimals) and bridge directly to MUSD (18 decimals) on Mezo.
     */
    function bridgeUSDCToMUSD(address targetAccount, uint256 usdcAmount) external {
        require(targetAccount != address(0), "Invalid target account");
        require(usdcAmount > 0, "Amount must be > 0");

        // Transfer USDC from sender to bridge
        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        // Convert 6 decimals to 18 decimals (1 USDC = 1 MUSD)
        uint256 musdAmount = usdcAmount * 1e12;

        // Mint or transfer MUSD to target MezoAgentAccount
        musdToken.mint(targetAccount, musdAmount);

        emit CrossChainBridged(msg.sender, targetAccount, usdcAmount, musdAmount, block.timestamp);
    }

    /**
     * @notice Mock service endpoint for AI agents to pay for compute / data feeds.
     */
    function payForService(string calldata serviceId, uint256 musdAmount) external {
        require(musdAmount > 0, "Payment must be > 0");
        IERC20(address(musdToken)).safeTransferFrom(msg.sender, address(this), musdAmount);
        emit ServicePaymentReceived(msg.sender, address(this), musdAmount, serviceId);
    }
}
