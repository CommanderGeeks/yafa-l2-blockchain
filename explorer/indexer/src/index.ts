import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Setup logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

async function main() {
  logger.info('🚀 Starting YAFA L2 Indexer...');
  
  // Initialize Prisma client
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connection established');
    
    // Check if we can reach the RPC endpoint
    const rpcUrl = process.env.RPC_URL || 'http://localhost:3000';
    logger.info(`🔗 Connecting to YAFA L2 at ${rpcUrl}`);
    
    // For now, just keep the service running
    logger.info('📡 Indexer service is running...');
    logger.info('⏳ Waiting for YAFA L2 sequencer to be available...');
    
    // Simple health check loop
    setInterval(async () => {
      try {
        // Try to fetch the latest block
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.result) {
            const blockNumber = parseInt(data.result, 16);
            logger.info(`📦 Latest block: ${blockNumber}`);
          }
        } else {
          logger.warn(`⚠️  RPC connection failed: ${response.status}`);
        }
      } catch (error) {
        logger.warn('⚠️  Waiting for YAFA L2 sequencer...');
      }
    }, 10000); // Check every 10 seconds
    
  } catch (error) {
    logger.error('❌ Failed to start indexer:', error);
    process.exit(1);
  }
}

// Handle shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down indexer...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down indexer...');
  process.exit(0);
});

// Start the indexer
main().catch((error) => {
  logger.error('💥 Indexer crashed:', error);
  process.exit(1);
});