//// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/forge-std/src/Test.sol";
import "lib/forge-std/src/console2.sol";
import "../src/Chatter.sol";

contract ChatterTest is Test {
    Chatter public chat;

    function setUp() public {
        chat = new Chatter();
    }

    function test_message() public {
        chat.setMessage("test1");
    }
}