// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Script.sol";
import "../src/Chatter.sol";

contract ChatterScript is Script {
    // Run on testnet
    // function run() public {
    //     string memory mnemonic = vm.envString("MNEMONIC");
    //     uint256 privateKey = vm.deriveKey(mnemonic, 0);

    //     vm.startBroadcast(privateKey);
    //     Chatter chat = new Chatter();

    //     vm.stopBroadcast();
    // }

    // Run on local
    function run() public {
        vm.broadcast();
        Chatter chat = new Chatter();

        vm.startBroadcast();
        chat.setMessage("Hello");
        vm.stopBroadcast();
    }
}
