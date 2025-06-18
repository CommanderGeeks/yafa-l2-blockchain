import { PrismaClient } from '@prisma/client';
import { Block } from 'viem';
import winston from 'winston';

export class ReorgHandler {
  private prisma: PrismaClient;
  private logger: winston.Logger;
  private reorgDepth: number;

  constructor(prisma: PrismaClient, logger: winston.Logger, reorgDepth: number = 12) {
    this.prisma = prisma;
    this.logger = logger;
    this.reorgDepth = reorgDepth;
  }

  async checkForReorg(newBlock: Block): Promise<void> {
    const blockNumber = newBlock.number!;
    
    // Skip reorg check for genesis or very early blocks
    if (blockNumber <= BigInt(this.reorgDepth)) {
      return;
    }

    try {
      // Get the stored block at this height
      const storedBlock = await this.prisma.block.findUnique({
        where: { number: blockNumber }
      });

      // If no stored block, this is a new block (no reorg)
      if (!storedBlock) {
        return;
      }

      // If hashes match, no reorg
      if (storedBlock.hash === newBlock.hash) {
        return;
      }

      // Reorg detected!
      this.logger.warn('Blockchain reorganization detected', {
        blockNumber: blockNumber.toString(),
        storedHash: storedBlock.hash,
        newHash: newBlock.hash
      });

      await this.handleReorg(blockNumber);
      
    } catch (error) {
      this.logger.error('Failed to check for reorg', {
        blockNumber: blockNumber.toString(),
        error
      });
      throw error;
    }
  }

  private async handleReorg(reorgStartBlock: bigint): Promise<void> {
    this.logger.info('Starting reorg handling', {
      reorgStartBlock: reorgStartBlock.toString()
    });

    try {
      // Find the common ancestor by checking parent blocks
      const commonAncestor = await this.findCommonAncestor(reorgStartBlock);
      
      this.logger.info('Found common ancestor', {
        commonAncestor: commonAncestor.toString()
      });

      // Remove invalidated data from database
      await this.removeInvalidatedData(commonAncestor + 1n);
      
      // Update sync status to re-index from common ancestor
      await this.updateSyncStatusForReorg(commonAncestor);
      
      this.logger.info('Reorg handling completed', {
        removedFromBlock: (commonAncestor + 1n).toString()
      });
      
    } catch (error) {
      this.logger.error('Failed to handle reorg', {
        reorgStartBlock: reorgStartBlock.toString(),
        error
      });
      throw error;
    }
  }

  private async findCommonAncestor(startBlock: bigint): Promise<bigint> {
    let currentBlock = startBlock;
    
    // Go back up to reorgDepth blocks to find common ancestor
    while (currentBlock > 0n && currentBlock > startBlock - BigInt(this.reorgDepth)) {
      try {
        // Get block from database
        const storedBlock = await this.prisma.block.findUnique({
          where: { number: currentBlock }
        });

        if (!storedBlock) {
          currentBlock--;
          continue;
        }

        // Get current block from chain (would need RPC client here)
        // For now, assume we need to go back further
        currentBlock--;
        
      } catch (error) {
        this.logger.error('Error finding common ancestor', {
          currentBlock: currentBlock.toString(),
          error
        });
        currentBlock--;
      }
    }

    // Return the block before where we started removing
    return Math.max(0, Number(currentBlock));
  }

  private async removeInvalidatedData(fromBlock: bigint): Promise<void> {
    this.logger.info('Removing invalidated data', {
      fromBlock: fromBlock.toString()
    });

    await this.prisma.$transaction(async (tx) => {
      // Remove logs
      await tx.log.deleteMany({
        where: {
          blockNumber: {
            gte: fromBlock
          }
        }
      });

      // Remove token transfers
      await tx.tokenTransfer.deleteMany({
        where: {
          blockNumber: {
            gte: fromBlock
          }
        }
      });

      // Remove transactions
      await tx.transaction.deleteMany({
        where: {
          blockNumber: {
            gte: fromBlock
          }
        }
      });

      // Remove blocks
      await tx.block.deleteMany({
        where: {
          number: {
            gte: fromBlock
          }
        }
      });

      this.logger.info('Invalidated data removed', {
        fromBlock: fromBlock.toString()
      });
    });
  }

  private async updateSyncStatusForReorg(lastValidBlock: bigint): Promise<void> {
    await this.prisma.syncStatus.update({
      where: { id: 'singleton' },
      data: {
        currentBlock: lastValidBlock,
        lastSyncTime: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async getReorgStats(): Promise<{
    totalReorgs: number;
    lastReorgBlock?: bigint;
    averageReorgDepth: number;
  }> {
    // This would require a reorg_events table to track historical reorgs
    // For now, return basic stats
    return {
      totalReorgs: 0,
      averageReorgDepth: 0
    };
  }
}