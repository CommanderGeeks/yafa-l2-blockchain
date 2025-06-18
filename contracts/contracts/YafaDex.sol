// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract YafaDex {
    address public owner;
    uint256 public fee = 30;
    
    constructor() {
        owner = msg.sender;
    }
    
    function swap() external payable {
        // Simple swap
    }
}