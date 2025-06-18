import dotenv from 'dotenv';
import { createPublicClient, webSocket, http, Block, Transaction } from 'viem';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import WebSocket from 'ws';
import { ReorgHandler } from './reorg-handler';

dotenv.config();

// Logger configuration
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
    }),
    new winston.transports.File({ filename: 'indexer.log' })
  ]
});

interface IndexerConfig {
  rpcUrl: string;
  wsUrl?: string;
  pollInterval: number;
  batchSize: number;
  reorgDepth: number;
  startBlock: bigint;
}

export class YafaIndexer {
  private prisma: PrismaClient;
  private publicClient: any;
  private wsClient: any;
  private config: IndexerConfig;
  private isRunning: boolean = false;
  private reorgHandler: ReorgHandler;
  private lastProcessedBlock: bigint = 0n;

  constructor(config: IndexerConfig) {
    this.config = config;
    this.prisma = new PrismaClient();
    this.reorgHandler = new ReorgHandler(this.prisma, logger);
    
    // Initialize HTTP client
    this.publicClient = createPublicClient({
      transport: http(config.rpcUrl),
    });

    // Initialize WebSocket client if URL provided
    if (config.wsUrl) {
      try {
        this.wsClient = createPublicClient({
          transport: webSocket(config.wsUrl),
        });
      } catch (error) {
        logger.warn('WebSocket connection failed, falling back to polling', { error });
      }
    }
  }

  async start(): Promise<void> {
    logger.info('Starting YAFA L2 Indexer...', {
      rpcUrl: this.config.rpcUrl,
      wsUrl: this.config.wsUrl,
      reorgDepth: this.config.reorgDepth
    });

    this.isRunning = true;

    try {
      // Initialize database
      await this.initializeDatabase();
      
      // Get starting block
      this.lastProcessedBlock = await this.getLastProcessedBlock();
      
      logger.info('Indexer initialized', { 
        lastProcessedBlock: this.lastProcessedBlock.toString() 
      });

      // Start indexing
      if (this.wsClient) {
        await this.startWebSocketIndexing();
      } else {
        await this.startPollingIndexing();
      }
    } catch (error) {
      logger.error('Failed to start indexer', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('Stopping indexer...');
    this.isRunning = false;
    await this.prisma.$disconnect();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      logger.info('Database connection established');
      
      // Initialize sync status
      await this.prisma.syncStatus.upsert({
        where: { id: 'singleton' },
        update: { isSyncing: true },
        create: {
          id: 'singleton',
          currentBlock: this.config.startBlock,
          isSyncing: true
        }
      });
    } catch (error) {
      logger.error('Database initialization failed', { error });
      throw error;
    }
  }

  private async getLastProcessedBlock(): Promise<bigint> {
    try {
      const syncStatus = await this.prisma.syncStatus.findUnique({
        where: { id: 'singleton' }
      });
      
      if (syncStatus) {
        return syncStatus.currentBlock;
      }
      
      // Check latest block in database
      const latestBlock = await this.prisma.block.findFirst({
        orderBy: { number: 'desc' }
      });
      
      return latestBlock ? latestBlock.number : this.config.startBlock;
    } catch (error) {
      logger.error('Failed to get last processed block', { error });
      return this.config.startBlock;
    }
  }

  private async startWebSocketIndexing(): Promise<void> {
    logger.info('Starting WebSocket indexing...');
    
    try {
      // Subscribe to new blocks
      this.wsClient.watchBlocks({
        onBlock: async (block: Block) => {
          await this.processBlock(block);
        },
        onError: (error: Error) => {
          logger.error('WebSocket error, falling back to polling', { error });
          this.startPollingIndexing();
        }
      });
      
      // Catch up on missed blocks
      await this.catchUpBlocks();
      
    } catch (error) {
      logger.error('WebSocket indexing failed, falling back to polling', { error });
      await this.startPollingIndexing();
    }
  }

  private async startPollingIndexing(): Promise<void> {
    logger.info('Starting polling indexing...', { 
      interval: this.config.pollInterval 
    });

    while (this.isRunning) {
      try {
        const latestBlockNumber = await this.publicClient.getBlockNumber();
        
        if (latestBlockNumber > this.lastProcessedBlock) {
          await this.processMissingBlocks(this.lastProcessedBlock + 1n, latestBlockNumber);
        }
        
        await this.sleep(this.config.pollInterval);
      } catch (error) {
        logger.error('Polling error', { error });
        await this.sleep(this.config.pollInterval);
      }
    }
  }

  private async catchUpBlocks(): Promise<void> {
    try {
      const latestBlockNumber = await this.publicClient.getBlockNumber();
      
      if (latestBlockNumber > this.lastProcessedBlock) {
        logger.info('Catching up on missed blocks', {
          from: this.lastProcessedBlock.toString(),
          to: latestBlockNumber.toString()
        });
        
        await this.processMissingBlocks(this.lastProcessedBlock + 1n, latestBlockNumber);
      }
    } catch (error) {
      logger.error('Failed to catch up blocks', { error });
    }
  }

  private async processMissingBlocks(fromBlock: bigint, toBlock: bigint): Promise<void> {
    const totalBlocks = Number(toBlock - fromBlock + 1n);
    let processed = 0;

    for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber += BigInt(this.config.batchSize)) {
      const batchEnd = blockNumber + BigInt(this.config.batchSize) - 1n;
      const actualEnd = batchEnd > toBlock ? toBlock : batchEnd;
      
      await this.processBatch(blockNumber, actualEnd);
      
      processed += Number(actualEnd - blockNumber + 1n);
      logger.info('Batch processed', {
        progress: `${processed}/${totalBlocks}`,
        percentage: Math.round((processed / totalBlocks) * 100)
      });
    }
  }

  private async processBatch(fromBlock: bigint, toBlock: bigint): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
      promises.push(this.processBlockByNumber(blockNumber));
    }
    
    await Promise.all(promises);
  }

  private async processBlockByNumber(blockNumber: bigint): Promise<void> {
    try {
      const block = await this.publicClient.getBlock({
        blockNumber,
        includeTransactions: true
      });
      
      await this.processBlock(block);
    } catch (error) {
      logger.error('Failed to process block', { blockNumber: blockNumber.toString(), error });
      throw error;
    }
  }

  private async processBlock(block: Block): Promise<void> {
    try {
      // Check for reorg
      await this.reorgHandler.checkForReorg(block);
      
      // Process block in transaction
      await this.prisma.$transaction(async (tx) => {
        // Save block
        await this.saveBlock(block, tx);
        
        // Process transactions
        if (block.transactions && Array.isArray(block.transactions)) {
          for (const [index, txHash] of block.transactions.entries()) {
            if (typeof txHash === 'string') {
              await this.processTransaction(txHash, block.number!, index, tx);
            }
          }
        }
        
        // Update stats
        await this.updateChainStats(block, tx);
      });
      
      this.lastProcessedBlock = block.number!;
      
      // Update sync status
      await this.updateSyncStatus(block.number!);
      
      logger.debug('Block processed', { 
        number: block.number!.toString(),
        hash: block.hash,
        transactions: block.transactions?.length || 0
      });
      
    } catch (error) {
      logger.error('Failed to process block', { 
        blockNumber: block.number?.toString(),
        error 
      });
      throw error;
    }
  }

  private async saveBlock(block: Block, tx: any): Promise<void> {
    await tx.block.upsert({
      where: { number: block.number! },
      update: {
        hash: block.hash!,
        parentHash: block.parentHash!,
        timestamp: new Date(Number(block.timestamp) * 1000),
        difficulty: block.difficulty?.toString(),
        totalDifficulty: block.totalDifficulty?.toString(),
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        miner: block.miner!,
        extraData: block.extraData,
        transactionCount: block.transactions?.length || 0,
        size: Number(block.size || 0),
        updatedAt: new Date()
      },
      create: {
        number: block.number!,
        hash: block.hash!,
        parentHash: block.parentHash!,
        timestamp: new Date(Number(block.timestamp) * 1000),
        difficulty: block.difficulty?.toString(),
        totalDifficulty: block.totalDifficulty?.toString(),
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        miner: block.miner!,
        extraData: block.extraData,
        transactionCount: block.transactions?.length || 0,
        size: Number(block.size || 0)
      }
    });
  }

  private async processTransaction(txHash: string, blockNumber: bigint, index: number, tx: any): Promise<void> {
    try {
      const transaction = await this.publicClient.getTransaction({ hash: txHash as `0x${string}` });
      const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
      
      // Save transaction
      await tx.transaction.upsert({
        where: { hash: txHash },
        update: {
          blockNumber,
          transactionIndex: index,
          from: transaction.from.toLowerCase(),
          to: transaction.to?.toLowerCase(),
          value: transaction.value.toString(),
          gasLimit: transaction.gas.toString(),
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: transaction.gasPrice?.toString(),
          maxFeePerGas: transaction.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: transaction.maxPriorityFeePerGas?.toString(),
          input: transaction.input,
          nonce: transaction.nonce,
          type: transaction.type ? Number(transaction.type) : 0,
          status: receipt.status === 'success' ? 1 : 0,
          updatedAt: new Date()
        },
        create: {
          hash: txHash,
          blockNumber,
          transactionIndex: index,
          from: transaction.from.toLowerCase(),
          to: transaction.to?.toLowerCase(),
          value: transaction.value.toString(),
          gasLimit: transaction.gas.toString(),
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: transaction.gasPrice?.toString(),
          maxFeePerGas: transaction.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: transaction.maxPriorityFeePerGas?.toString(),
          input: transaction.input,
          nonce: transaction.nonce,
          type: transaction.type ? Number(transaction.type) : 0,
          status: receipt.status === 'success' ? 1 : 0
        }
      });
      
      // Process logs
      for (const [logIndex, log] of receipt.logs.entries()) {
        await this.processLog(log, txHash, blockNumber, logIndex, tx);
      }
      
      // Update address information
      await this.updateAddresses(transaction, receipt, tx);
      
    } catch (error) {
      logger.error('Failed to process transaction', { txHash, error });
      // Don't throw - continue with other transactions
    }
  }

  private async processLog(log: any, txHash: string, blockNumber: bigint, logIndex: number, tx: any): Promise<void> {
    try {
      await tx.log.upsert({
        where: {
          transactionHash_logIndex: {
            transactionHash: txHash,
            logIndex
          }
        },
        update: {
          blockNumber,
          address: log.address.toLowerCase(),
          topics: log.topics,
          data: log.data
        },
        create: {
          transactionHash: txHash,
          logIndex,
          blockNumber,
          address: log.address.toLowerCase(),
          topics: log.topics,
          data: log.data
        }
      });
      
      // Process token transfers (ERC20/ERC721)
      await this.processTokenTransfer(log, txHash, blockNumber, logIndex, tx);
      
    } catch (error) {
      logger.error('Failed to process log', { txHash, logIndex, error });
    }
  }

  private async processTokenTransfer(log: any, txHash: string, blockNumber: bigint, logIndex: number, tx: any): Promise<void> {
    // ERC20 Transfer event signature
    const ERC20_TRANSFER_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    
    if (log.topics[0] === ERC20_TRANSFER_SIGNATURE && log.topics.length >= 3) {
      try {
        const from = '0x' + log.topics[1].slice(-40);
        const to = '0x' + log.topics[2].slice(-40);
        const value = log.data;
        
        await tx.tokenTransfer.upsert({
          where: {
            transactionHash_logIndex: {
              transactionHash: txHash,
              logIndex
            }
          },
          update: {
            blockNumber,
            tokenAddress: log.address.toLowerCase(),
            from: from.toLowerCase(),
            to: to.toLowerCase(),
            value
          },
          create: {
            transactionHash: txHash,
            logIndex,
            blockNumber,
            tokenAddress: log.address.toLowerCase(),
            from: from.toLowerCase(),
            to: to.toLowerCase(),
            value
          }
        });
      } catch (error) {
        logger.error('Failed to process token transfer', { txHash, logIndex, error });
      }
    }
  }

  private async updateAddresses(transaction: any, receipt: any, tx: any): Promise<void> {
    const addresses = new Set<string>();
    
    // Add transaction addresses
    addresses.add(transaction.from.toLowerCase());
    if (transaction.to) {
      addresses.add(transaction.to.toLowerCase());
    }
    
    // Add log addresses
    for (const log of receipt.logs) {
      addresses.add(log.address.toLowerCase());
    }
    
    // Update each address
    for (const address of addresses) {
      try {
        await tx.address.upsert({
          where: { address },
          update: {
            lastSeen: new Date(),
            updatedAt: new Date()
          },
          create: {
            address,
            firstSeen: new Date(),
            lastSeen: new Date()
          }
        });
      } catch (error) {
        logger.error('Failed to update address', { address, error });
      }
    }
  }

  private async updateChainStats(block: Block, tx: any): Promise<void> {
    try {
      await tx.chainStats.upsert({
        where: { id: 'singleton' },
        update: {
          latestBlock: block.number!,
          latestBlockHash: block.hash!,
          updatedAt: new Date()
        },
        create: {
          id: 'singleton',
          latestBlock: block.number!,
          latestBlockHash: block.hash!,
          totalTransactions: 0n,
          totalAddresses: 0n
        }
      });
    } catch (error) {
      logger.error('Failed to update chain stats', { error });
    }
  }

  private async updateSyncStatus(blockNumber: bigint): Promise<void> {
    try {
      await this.prisma.syncStatus.update({
        where: { id: 'singleton' },
        data: {
          currentBlock: blockNumber,
          lastSyncTime: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to update sync status', { error });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
if (require.main === module) {
  const config: IndexerConfig = {
    rpcUrl: process.env.RPC_URL || 'http://localhost:3000',
    wsUrl: process.env.RPC_WSS_URL,
    pollInterval: parseInt(process.env.INDEXER_POLL_INTERVAL || '5000'),
    batchSize: parseInt(process.env.INDEXER_BATCH_SIZE || '100'),
    reorgDepth: parseInt(process.env.REORG_DEPTH || '12'),
    startBlock: BigInt(process.env.START_BLOCK || '0')
  };

  const indexer = new YafaIndexer(config);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await indexer.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await indexer.stop();
    process.exit(0);
  });

  // Start indexer
  indexer.start().catch((error) => {
    logger.error('Indexer failed to start', { error });
    process.exit(1);
  });
}