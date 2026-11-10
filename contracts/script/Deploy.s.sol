// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockMUSD.sol";
import "../src/MockUSDC.sol";
import "../src/MezoAgentAccount.sol";
import "../src/MezoAgentFactory.sol";
import "../src/MezoBridgeRouter.sol";

contract DeployMezoAgent is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying MezoAgent suite from:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mock Tokens (or reference live contracts)
        MockMUSD musd = new MockMUSD();
        console.log("MockMUSD deployed at:", address(musd));

        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // 2. Deploy MezoAgentFactory
        MezoAgentFactory factory = new MezoAgentFactory(address(musd));
        console.log("MezoAgentFactory deployed at:", address(factory));

        // 3. Deploy Bridge Router
        MezoBridgeRouter router = new MezoBridgeRouter(address(usdc), address(musd));
        console.log("MezoBridgeRouter deployed at:", address(router));

        // 4. Deploy demo agent account
        musd.approve(address(factory), 1_000 * 1e18);
        address demoAccount = factory.createAccount(1_000 * 1e18);
        console.log("Demo MezoAgentAccount deployed at:", demoAccount);

        vm.stopBroadcast();
    }
}
