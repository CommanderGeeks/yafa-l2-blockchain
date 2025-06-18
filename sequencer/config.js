// config.js - Sequencer Configuration
require('dotenv').config();

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 8545,
    host: process.env.HOST || 'localhost'
  },

  // L1 Ethereum Configuration
  l1: {
    rpcUrl: process.env.L1_RPC_URL || 'http://localhost:8545', // Your Hardhat node
    chainId: 31337, // Hardhat chain ID
    privateKey: process.env.SEQUENCER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  },

  // L2 Configuration
  l2: {
    chainId: 42069, // Yafa L2 chain ID
    blockTime: 2000, // 2 seconds per block
    maxTxPerBlock: 100,
    gasLimit: 15000000
  },

  // Contract Addresses (from your deployment)
  contracts: {
    yafaBridge: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    yafaDex: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  },

  // Fee Configuration
  fees: {
    baseFee: '1000000000', // 1 gwei in wei
    priorityFee: '1000000000' // 1 gwei in wei
  },

  // Database (in-memory for Phase 1)
  database: {
    type: 'memory' // Later: 'postgresql'
  }
};