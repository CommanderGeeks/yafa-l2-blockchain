// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IYafaFactory.sol";
import "./YafaPair.sol";

/**
 * @title YafaFactory
 * @notice Factory contract for creating and managing Yafa DEX pairs
 * @dev Forked from Uniswap V2 with gas optimizations
 */
contract YafaFactory is IYafaFactory {
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    /**
     * @notice Creates a new trading pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @return pair The address of the newly created pair
     */
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'YafaDEX: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'YafaDEX: ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'YafaDEX: PAIR_EXISTS');
        
        bytes memory bytecode = type(YafaPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        IYafaPair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, 'YafaDEX: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, 'YafaDEX: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }
}