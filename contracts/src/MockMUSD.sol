// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockMUSD
 * @notice Mock implementation of Mezo USD (MUSD) - Bitcoin-backed stablecoin.
 * Standard cross-chain address on mainnet: 0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186
 */
contract MockMUSD is ERC20, Ownable {
    constructor() ERC20("Mezo USD", "MUSD") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function faucet(uint256 amount) external {
        require(amount <= 10_000 * 10 ** decimals(), "Faucet request exceeds maximum");
        _mint(msg.sender, amount);
    }
}
