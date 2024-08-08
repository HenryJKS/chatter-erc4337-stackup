//// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/forge-std/src/Script.sol";
import "../src/Chatter.sol";

contract ChatterScript is Script {

    function run() public {
        vm.broadcast();
        new Chatter();
    }
}