# Yafa L2 Blockchain - Deployment Guide

🚀 **Complete guide to deploy your own Layer 2 blockchain with Ethereum bridge**

## Overview

This system creates a fully functional Layer 2 blockchain that bridges real ETH from Ethereum Sepolia testnet to your custom L2 chain (Chain ID: 42069). Users can deposit Sepolia ETH and receive it on your L2 blockchain.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ethereum L1   │    │   Yafa L2       │    │  Bridge UI      │
│   (Sepolia)     │◄──►│   Sequencer     │◄──►│  (HTML/JS)      │
│                 │    │                 │    │                 │
│ Bridge Contract │    │ Chain ID: 42069 │    │ User Interface  │
│ DEX Contract    │    │ Port: 3000      │    │ Port: 8080      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### Required Software
- **Node.js** (v16+): https://nodejs.org/
- **Git**: https://git-scm.com/
- **MetaMask**: Browser extension for wallet interaction

### Required Accounts & Keys
- **Ethereum wallet** with Sepolia testnet ETH
- **Infura account**: Get API key from https://infura.io/
- **Etherscan account**: Get API key from https://etherscan.io/ (optional)

### Get Sepolia ETH
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Alchemy Faucet**: https://sepoliafaucet.com/
- **Chainlink Faucet**: https://faucets.chain.link/

## Project Structure

```
yafa-l2-blockchain/
├── contracts/                 # Smart contracts & deployment
│   ├── contracts/
│   │   ├── YafaBridgeProduction.sol
│   │   └── YafaDex.sol
│   ├── scripts/
│   │   └── deploy-sepolia.js
│   ├── hardhat.config.js
│   └── .env
├── sequencer/                 # L2 blockchain sequencer
│   ├── src/
│   │   ├── index.js
│   │   └── sequencer.js
│   ├── package.json
│   └── .env
└── bridge-html/              # User interface
    └── index.html
```

## Step-by-Step Deployment

### 1. Initial Setup

```bash
# Clone or create project directory
mkdir yafa-l2-blockchain
cd yafa-l2-blockchain

# Create directory structure
mkdir -p {contracts,sequencer,bridge-html,scripts,docs}
```

### 2. Smart Contracts Setup

```bash
cd contracts

# Initialize Hardhat project
npm init -y
npm install --save-dev hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install ethers dotenv

# Initialize Hardhat
npx hardhat init
# Choose: "Create a JavaScript project"
```

#### 2.1 Configure hardhat.config.js

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const INFURA_KEY = process.env.INFURA_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: 20000000000,
      gas: 6000000
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  }
};
```

#### 2.2 Configure Environment (.env)

```bash
# contracts/.env
PRIVATE_KEY=your_wallet_private_key_here
INFURA_KEY=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **Security Warning**: Never commit private keys to version control!

#### 2.3 Deploy Smart Contracts

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

**Expected Output:**
```
🚀 Deploying Yafa L2 to Sepolia...
✅ YafaBridgeProduction deployed to: 0x[CONTRACT_ADDRESS]
✅ YafaDex deployed to: 0x[CONTRACT_ADDRESS]
💾 Deployment info saved to deployments-sepolia.json
```

**Save the contract addresses** - you'll need them for the sequencer!

### 3. L2 Sequencer Setup

```bash
cd ../sequencer

# Initialize sequencer
npm init -y
npm install express ethers dotenv cors helmet
npm install --save-dev nodemon
```

#### 3.1 Configure Package.json Scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

#### 3.2 Configure Environment (.env)

```bash
# sequencer/.env
PORT=3000
L1_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=YOUR_PRIVATE_KEY
BRIDGE_CONTRACT=0x[BRIDGE_CONTRACT_ADDRESS_FROM_DEPLOYMENT]
DEX_CONTRACT=0x[DEX_CONTRACT_ADDRESS_FROM_DEPLOYMENT]
TREASURY_ADDRESS=YOUR_WALLET_ADDRESS
L2_CHAIN_ID=42069
L2_NETWORK_NAME=Yafa L2
BRIDGE_FEE=0.001
```

Replace placeholders with:
- `YOUR_INFURA_KEY`: Your Infura project ID
- `YOUR_PRIVATE_KEY`: Your wallet private key
- `[BRIDGE_CONTRACT_ADDRESS]`: Address from deployment output
- `[DEX_CONTRACT_ADDRESS]`: Address from deployment output
- `YOUR_WALLET_ADDRESS`: Your Ethereum address

### 4. Bridge Frontend Setup

```bash
cd ../bridge-html

# Create HTTP server for frontend
npm init -y
npm install -g http-server
```

Update the `index.html` file with your deployed contract addresses:

```javascript
// Update these lines in index.html
const BRIDGE_ADDRESS = "0x[YOUR_BRIDGE_CONTRACT_ADDRESS]";
const DEX_ADDRESS = "0x[YOUR_DEX_CONTRACT_ADDRESS]";
```

## Running the System

### Start All Services

You need **3 terminal windows** running simultaneously:

#### Terminal 1: L2 Sequencer
```bash
cd yafa-l2-blockchain/sequencer
npm run dev
```
**Expected Output:**
```
🚀 Yafa L2 Production Sequencer running on port 3000
🌐 RPC URL: http://localhost:3000
🔗 Connected to Sepolia bridge: 0x[CONTRACT_ADDRESS]
```

#### Terminal 2: Bridge Frontend
```bash
cd yafa-l2-blockchain/bridge-html
npx http-server -p 8080
```
**Expected Output:**
```
Starting up http-server, serving ./
Available on:
  http://localhost:8080
```

#### Terminal 3: (Optional) Monitoring
```bash
# Monitor sequencer logs
cd yafa-l2-blockchain/sequencer
tail -f logs/sequencer.log
```

## MetaMask Configuration

### Add Sepolia Network

1. **Open MetaMask**
2. **Network Dropdown** → "Add Network"
3. **Add Network Manually**:
   - **Network Name**: `Sepolia`
   - **RPC URL**: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
   - **Chain ID**: `11155111`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: `https://sepolia.etherscan.io`

### Import Test Account (Optional)

For testing, you can import the account you used for deployment:
1. **MetaMask** → **Import Account**
2. **Paste your private key**
3. **Switch to this account**

## Testing the Bridge

### 1. Access the Bridge Interface

Open: **http://localhost:8080**

### 2. Connect Wallet

1. **Click "Connect MetaMask"**
2. **Approve connection**
3. **Ensure you're on Sepolia network**

### 3. Bridge ETH

1. **Enter amount** (try 0.01 ETH)
2. **Click "Bridge to Yafa L2"**
3. **Confirm MetaMask transaction**
4. **Wait for confirmation**
5. **Watch L2 balance update**

### Expected Flow:
```
L1 Balance: 1.0000 ETH → 0.9890 ETH (-0.011 ETH total)
L2 Balance: 0.0000 ETH → 0.0100 ETH (+0.01 ETH)
Treasury: +0.001 ETH (bridge fee)
```

## Verification & Monitoring

### Check Contract on Etherscan

Visit your deployed contracts on Sepolia Etherscan:
- **Bridge**: `https://sepolia.etherscan.io/address/[BRIDGE_ADDRESS]`
- **DEX**: `https://sepolia.etherscan.io/address/[DEX_ADDRESS]`

### Monitor L2 Health

Check sequencer health:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "chainId": 42069,
  "blockNumber": 1,
  "pendingTx": 0,
  "l1Connected": true
}
```

### View L2 State

```bash
curl http://localhost:3000/l2/state
```

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to L1"
- **Check**: Infura API key is correct
- **Check**: Internet connection
- **Fix**: Update `L1_RPC_URL` in sequencer/.env

#### 2. "Contract not found"
- **Check**: Contract addresses are correct
- **Check**: Deployed to Sepolia (not localhost)
- **Fix**: Redeploy contracts or update addresses

#### 3. "MetaMask connection failed"
- **Check**: MetaMask is installed
- **Check**: On Sepolia network
- **Fix**: Add Sepolia network manually

#### 4. "Insufficient ETH"
- **Check**: Have Sepolia ETH in wallet
- **Fix**: Get ETH from faucet

#### 5. "Bridge transaction fails"
- **Check**: Enough ETH for gas + bridge amount + fee
- **Check**: Contract addresses are correct
- **Fix**: Try smaller amount

### Debug Mode

Enable verbose logging:

```bash
# In sequencer/.env, add:
DEBUG=true
LOG_LEVEL=verbose
```

### Reset L2 State

If you need to reset your L2 blockchain:

```bash
cd sequencer
# Stop sequencer (Ctrl+C)
# Delete state file (if exists)
rm -f l2-state.json
# Restart sequencer
npm run dev
```

## Security Considerations

### For Production Deployment

1. **Use Hardware Wallet**: Don't use private keys in .env files
2. **Secure RPC Endpoints**: Use authentication for production RPCs
3. **Smart Contract Audits**: Audit contracts before mainnet
4. **Multi-signature Treasury**: Use multi-sig for treasury management
5. **Rate Limiting**: Add rate limiting to prevent spam
6. **SSL/HTTPS**: Use HTTPS for all web interfaces

### Environment Security

```bash
# Set proper file permissions
chmod 600 .env
chmod 600 */env

# Never commit sensitive files
echo "*.env" >> .gitignore
echo "deployments-*.json" >> .gitignore
```

## Next Steps

### Phase 2: Add Features
- **Decentralized validators**
- **$YAFA token integration**
- **Solana bridge**
- **Governance system**

### Production Deployment
- **Cloud hosting** (AWS/DigitalOcean)
- **Domain name** and SSL
- **Public RPC endpoints**
- **Mainnet deployment**

## Support

### Resources
- **Hardhat Docs**: https://hardhat.org/docs
- **Ethers.js Docs**: https://docs.ethers.org/
- **Sepolia Faucet**: https://sepoliafaucet.com/

### Common Commands

```bash
# Compile contracts
npx hardhat compile

# Deploy contracts
npx hardhat run scripts/deploy-sepolia.js --network sepolia

# Start sequencer
cd sequencer && npm run dev

# Start bridge
cd bridge-html && npx http-server -p 8080

# Check sequencer health
curl http://localhost:3000/health
```

---

**🎉 Congratulations!** You now have a fully functional Layer 2 blockchain with Ethereum bridge capabilities!

Your Yafa L2 blockchain can process real ETH transactions and provides a foundation for building advanced DeFi applications.