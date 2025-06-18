require('dotenv').config();

// Debug logging to confirm env vars are loaded
console.log('🔍 Environment loaded:');
console.log('  BRIDGE_CONTRACT:', process.env.BRIDGE_CONTRACT);
console.log('  DEX_CONTRACT:', process.env.DEX_CONTRACT);

const YafaSequencer = require('./sequencer');

async function main() {
  console.log('🚀 Starting Yafa L2 Sequencer...');
  
  // Validate environment variables
  const requiredEnvVars = [
    'L1_RPC_URL',
    'PRIVATE_KEY',
    'BRIDGE_CONTRACT',
    'DEX_CONTRACT'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('📝 Please check your .env file');
    process.exit(1);
  }
  
  try {
    const sequencer = new YafaSequencer({
      port: process.env.PORT || 3000,
      l1RpcUrl: process.env.L1_RPC_URL,
      privateKey: process.env.PRIVATE_KEY,
      bridgeContract: process.env.BRIDGE_CONTRACT,
      dexContract: process.env.DEX_CONTRACT,
      treasuryAddress: process.env.TREASURY_ADDRESS
    });
    
    await sequencer.start();
    
    console.log('✅ Yafa L2 Sequencer is running!');
    console.log(`🌐 RPC Server: http://localhost:${sequencer.port}`);
    console.log(`🔗 Connected to Sepolia bridge: ${process.env.BRIDGE_CONTRACT}`);
    console.log(`💱 DEX Contract: ${process.env.DEX_CONTRACT}`);
    
  } catch (error) {
    console.error('❌ Failed to start sequencer:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Yafa L2 Sequencer...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Yafa L2 Sequencer...');
  process.exit(0);
});

main().catch(console.error);