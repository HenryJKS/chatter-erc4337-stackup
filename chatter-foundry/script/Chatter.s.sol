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

        vm.startBroadcast(0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d);
        chat.setMessage("Hello");
        vm.stopBroadcast();
    }
}
