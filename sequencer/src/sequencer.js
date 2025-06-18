const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ethers } = require('ethers');

class YafaSequencerProduction {
  constructor(config) {
    this.port = config.port;
    this.l1RpcUrl = config.l1RpcUrl;
    this.privateKey = config.privateKey;
    this.bridgeContract = config.bridgeContract;
    this.dexContract = config.dexContract;
    
    // Initialize Express app
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    
    // L2 State
    this.l2State = {
      accounts: new Map(),
      nonces: new Map(),
      blockNumber: 0,
      transactions: [],
      pendingTxs: []
    };
    
    // L1 Connection
    this.l1Provider = null;
    this.l1Wallet = null;
    this.bridgeContractInstance = null;
    
    console.log('🔧 Yafa Production Sequencer initialized');
    console.log('🌉 Bridge Contract:', this.bridgeContract);
    console.log('💱 DEX Contract:', this.dexContract);
  }
  
  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`📨 ${req.method} ${req.path}`, req.body ? JSON.stringify(req.body).substring(0, 100) : '');
      next();
    });
  }
  
  setupRoutes() {
    // Health check with enhanced info
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        chainId: 42069,
        blockNumber: this.l2State.blockNumber,
        pendingTx: this.l2State.pendingTxs.length,
        transactionCount: this.l2State.transactions.length,
        accountCount: this.l2State.accounts.size,
        l1Connected: this.l1Provider !== null,
        bridgeContract: this.bridgeContract,
        timestamp: new Date().toISOString()
      });
    });
    
    // JSON-RPC endpoint
    this.app.post('/', this.handleJsonRpc.bind(this));
    this.app.post('/rpc', this.handleJsonRpc.bind(this));
    
    // L2 specific endpoints
    this.app.get('/l2/state', (req, res) => {
      res.json({
        blockNumber: this.l2State.blockNumber,
        accountCount: this.l2State.accounts.size,
        transactionCount: this.l2State.transactions.length,
        pendingTxs: this.l2State.pendingTxs.length
      });
    });
    
    // Enhanced bridge deposit endpoint
    this.app.post('/bridge/deposit', this.handleBridgeDeposit.bind(this));
    
    // New: Check L1 deposits endpoint
    this.app.get('/bridge/deposits/:address', this.getDepositHistory.bind(this));
  }
  
  async handleJsonRpc(req, res) {
    const { method, params, id } = req.body;
    
    try {
      let result;
      
      switch (method) {
        case 'eth_chainId':
          result = '0x' + (42069).toString(16); // Yafa L2 Chain ID
          break;
          
        case 'eth_blockNumber':
          result = '0x' + this.l2State.blockNumber.toString(16);
          break;
          
        case 'eth_getBalance':
          result = this.getBalance(params[0]);
          break;
          
        case 'eth_sendTransaction':
          result = await this.sendTransaction(params[0]);
          break;
          
        case 'eth_getTransactionCount':
          result = '0x' + (this.l2State.nonces.get(params[0]) || 0).toString(16);
          break;
          
        case 'net_version':
          result = '42069';
          break;
          
        default:
          throw new Error(`Method ${method} not supported`);
      }
      
      res.json({
        jsonrpc: '2.0',
        id: id,
        result: result
      });
      
    } catch (error) {
      console.error('🚫 RPC Error:', error.message);
      res.json({
        jsonrpc: '2.0',
        id: id,
        error: {
          code: -32603,
          message: error.message
        }
      });
    }
  }
  
  getBalance(address) {
    const balance = this.l2State.accounts.get(address.toLowerCase()) || '0x0';
    console.log(`💰 L2 Balance for ${address}: ${balance}`);
    return balance;
  }
  
  async sendTransaction(tx) {
    console.log('📝 Processing L2 transaction:', tx);
    
    const txHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(tx) + Date.now())
    );
    
    // Add to pending transactions
    this.l2State.pendingTxs.push({
      hash: txHash,
      ...tx,
      timestamp: Date.now()
    });
    
    // Process transaction
    this.processTransaction(tx, txHash);
    
    return txHash;
  }
  
  processTransaction(tx, txHash) {
    console.log('⚡ Executing L2 transaction:', txHash);
    
    // Simple balance transfer logic
    if (tx.to && tx.value) {
      const fromBalance = BigInt(this.l2State.accounts.get(tx.from?.toLowerCase()) || '0x0');
      const toBalance = BigInt(this.l2State.accounts.get(tx.to.toLowerCase()) || '0x0');
      const value = BigInt(tx.value);
      
      // Update balances
      if (fromBalance >= value) {
        this.l2State.accounts.set(tx.from?.toLowerCase(), '0x' + (fromBalance - value).toString(16));
        this.l2State.accounts.set(tx.to.toLowerCase(), '0x' + (toBalance + value).toString(16));
      }
    }
    
    // Add to processed transactions
    this.l2State.transactions.push({
      hash: txHash,
      ...tx,
      blockNumber: this.l2State.blockNumber,
      timestamp: Date.now()
    });
    
    // Remove from pending
    this.l2State.pendingTxs = this.l2State.pendingTxs.filter(ptx => ptx.hash !== txHash);
    
    console.log('✅ L2 Transaction processed:', txHash);
  }
  
  async handleBridgeDeposit(req, res) {
    const { user, amount, l1TxHash } = req.body;
    
    try {
      console.log(`🌉 Processing bridge deposit from Sepolia: ${amount} wei for ${user}`);
      
      // Credit user's L2 balance
      const currentBalance = BigInt(this.l2State.accounts.get(user.toLowerCase()) || '0x0');
      const depositAmount = BigInt(amount);
      const newBalance = currentBalance + depositAmount;
      
      this.l2State.accounts.set(user.toLowerCase(), '0x' + newBalance.toString(16));
      
      // Increment block number for the deposit
      this.l2State.blockNumber++;
      
      console.log(`✅ Bridge deposit processed: ${user} now has ${newBalance.toString()} wei on L2`);
      console.log(`📦 L1 Transaction: ${l1TxHash}`);
      
      res.json({
        success: true,
        user: user,
        l2Balance: '0x' + newBalance.toString(16),
        l1TxHash: l1TxHash,
        l2BlockNumber: this.l2State.blockNumber
      });
      
    } catch (error) {
      console.error('🚫 Bridge deposit failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async getDepositHistory(req, res) {
    const { address } = req.params;
    
    try {
      // In production, this would query L1 events
      // For now, return current L2 balance
      const balance = this.l2State.accounts.get(address.toLowerCase()) || '0x0';
      
      res.json({
        address: address,
        l2Balance: balance,
        totalDeposits: 'N/A', // Would track from L1 events
        deposits: [] // Would fetch from L1 event logs
      });
      
    } catch (error) {
      console.error('🚫 Failed to get deposit history:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async connectToL1() {
    try {
      this.l1Provider = new ethers.providers.JsonRpcProvider(this.l1RpcUrl);
      this.l1Wallet = new ethers.Wallet(this.privateKey, this.l1Provider);
      
      // Connect to bridge contract
      const bridgeABI = [
        "event Deposit(address indexed user, address indexed token, uint256 amount, uint256 nonce, uint256 indexed l2TxHash)",
        "function latestBlockNumber() view returns (uint256)",
        "function submitStateRoot(uint256 blockNumber, bytes32 stateRoot)"
      ];
      
      this.bridgeContractInstance = new ethers.Contract(
        this.bridgeContract,
        bridgeABI,
        this.l1Wallet
      );
      
      const network = await this.l1Provider.getNetwork();
      console.log(`🔗 Connected to L1: ${network.name} (Chain ID: ${network.chainId})`);
      console.log(`🌉 Bridge contract connected: ${this.bridgeContract}`);
      
    } catch (error) {
      console.error('🚫 Failed to connect to L1:', error.message);
      throw error;
    }
  }
  
  async start() {
    // Connect to L1
    await this.connectToL1();
    
    // Start HTTP server
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 Yafa L2 Production Sequencer running on port ${this.port}`);
        console.log(`🌐 RPC URL: http://localhost:${this.port}`);
        console.log(`🔗 Connected to Sepolia bridge: ${this.bridgeContract}`);
        resolve();
      });
    });
  }
  
  async stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Sequencer stopped');
    }
  }
}

module.exports = YafaSequencerProduction;