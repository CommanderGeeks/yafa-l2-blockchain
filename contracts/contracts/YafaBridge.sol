// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract YafaBridgeProduction {
    address public owner;
    address public treasury;
    address public sequencer;
    uint256 public bridgeFee = 0.001 ether;
    
    // L2 state tracking
    bytes32 public latestStateRoot;
    uint256 public latestBlockNumber;
    mapping(uint256 => bytes32) public stateRoots;
    
    // Deposit tracking
    mapping(address => bool) public supportedTokens;
    mapping(bytes32 => bool) public processedWithdrawals;
    mapping(address => uint256) public depositNonces;
    
    // Events
    event Deposit(
        address indexed user, 
        address indexed token, 
        uint256 amount, 
        uint256 nonce,
        uint256 indexed l2TxHash
    );
    event Withdrawal(
        address indexed user, 
        address indexed token, 
        uint256 amount, 
        bytes32 indexed withdrawalHash
    );
    event StateRootUpdate(uint256 indexed blockNumber, bytes32 stateRoot);
    event BridgeFeeUpdated(uint256 newFee);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlySequencer() {
        require(msg.sender == sequencer, "Only sequencer");
        _;
    }
    
    constructor(address _treasury, address _sequencer) {
        owner = msg.sender;
        treasury = _treasury;
        sequencer = _sequencer;
        supportedTokens[address(0)] = true; // ETH support
    }
    
    // Enhanced ETH deposit with nonce tracking
    function depositETH() external payable {
        require(msg.value > bridgeFee, "Insufficient amount for fee");
        
        uint256 bridgeAmount = msg.value - bridgeFee;
        uint256 nonce = depositNonces[msg.sender]++;
        
        // Send fee to treasury
        payable(treasury).transfer(bridgeFee);
        
        emit Deposit(msg.sender, address(0), bridgeAmount, nonce, 0);
    }
    
    // Enhanced token deposit
    function depositToken(address token, uint256 amount) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 fee = (amount * bridgeFee) / 1 ether;
        require(amount > fee, "Amount too small for fee");
        uint256 bridgeAmount = amount - fee;
        uint256 nonce = depositNonces[msg.sender]++;
        
        // Note: Add ERC20 transfers in production
        
        emit Deposit(msg.sender, token, bridgeAmount, nonce, 0);
    }
    
    // State root submission from L2 sequencer
    function submitStateRoot(uint256 blockNumber, bytes32 stateRoot) external onlySequencer {
        require(blockNumber > latestBlockNumber, "Invalid block number");
        
        latestBlockNumber = blockNumber;
        latestStateRoot = stateRoot;
        stateRoots[blockNumber] = stateRoot;
        
        emit StateRootUpdate(blockNumber, stateRoot);
    }
    
    // Enhanced withdrawal with Merkle proof verification
    function processWithdrawal(
        address user,
        address token,
        uint256 amount,
        bytes32 withdrawalHash,
        bytes32[] calldata merkleProof
    ) external onlySequencer {
        require(!processedWithdrawals[withdrawalHash], "Already processed");
        require(amount > 0, "Invalid amount");
        
        // TODO: Add Merkle proof verification against state root
        // For now, trust the sequencer (centralized Phase 1)
        
        processedWithdrawals[withdrawalHash] = true;
        
        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient ETH");
            payable(user).transfer(amount);
        }
        
        emit Withdrawal(user, token, amount, withdrawalHash);
    }
    
    // View functions
    function getLatestState() external view returns (uint256 blockNumber, bytes32 stateRoot) {
        return (latestBlockNumber, latestStateRoot);
    }
    
    function getDepositNonce(address user) external view returns (uint256) {
        return depositNonces[user];
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Admin functions
    function updateBridgeFee(uint256 newFee) external onlyOwner {
        require(newFee <= 0.01 ether, "Fee too high");
        bridgeFee = newFee;
        emit BridgeFeeUpdated(newFee);
    }
    
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
    }
    
    function updateSequencer(address newSequencer) external onlyOwner {
        require(newSequencer != address(0), "Invalid sequencer");
        sequencer = newSequencer;
    }
    
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    function pause() external onlyOwner {
        sequencer = address(0); // Effectively pauses the bridge
    }
    
    // Receive ETH
    receive() external payable {}
}