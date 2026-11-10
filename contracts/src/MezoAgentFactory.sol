// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MezoAgentAccount.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MezoAgentFactory
 * @notice Factory for deploying personalized MezoAgentAccount smart accounts.
 */
contract MezoAgentFactory {
    using SafeERC20 for IERC20;

    address public immutable musdToken;
    address[] public allAccounts;
    mapping(address => address[]) public userAccounts;
    mapping(address => bool) public isMezoAgentAccount;

    event AccountCreated(
        address indexed owner,
        address indexed account,
        uint256 index,
        uint256 timestamp
    );

    constructor(address _musdToken) {
        require(_musdToken != address(0), "Invalid MUSD address");
        musdToken = _musdToken;
    }

    /**
     * @notice Deploy a new MezoAgentAccount for the caller.
     * @param initialMUSD Optional initial MUSD deposit transferred from caller.
     */
    function createAccount(uint256 initialMUSD) external payable returns (address account) {
        MezoAgentAccount newAccount = new MezoAgentAccount(msg.sender, musdToken);
        account = address(newAccount);

        allAccounts.push(account);
        userAccounts[msg.sender].push(account);
        isMezoAgentAccount[account] = true;

        // If native gas provided, forward to new account
        if (msg.value > 0) {
            (bool success, ) = account.call{value: msg.value}("");
            require(success, "Failed to fund native gas");
        }

        // If initial MUSD specified, transfer directly into account
        if (initialMUSD > 0) {
            IERC20(musdToken).safeTransferFrom(msg.sender, account, initialMUSD);
        }

        emit AccountCreated(msg.sender, account, allAccounts.length - 1, block.timestamp);
    }

    function getUserAccounts(address user) external view returns (address[] memory) {
        return userAccounts[user];
    }

    function totalAccountsCount() external view returns (uint256) {
        return allAccounts.length;
    }
}
