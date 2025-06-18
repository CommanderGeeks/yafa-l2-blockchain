import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get basic chain stats
    const chainStats = await prisma.chainStats.findUnique({
      where: { id: 'singleton' }
    });

    // Get sync status
    const syncStatus = await prisma.syncStatus.findUnique({
      where: { id: 'singleton' }
    });

    // Get latest block
    const latestBlock = await prisma.block.findFirst({
      orderBy: { number: 'desc' },
      select: {
        number: true,
        hash: true,
        timestamp: true,
        gasUsed: true,
        gasLimit: true,
        transactionCount: true
      }
    });

    // Get block stats for the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
      recentBlocks,
      recentTransactions,
      totalAddresses,
      totalContracts
    ] = await Promise.all([
      prisma.block.count({
        where: {
          timestamp: {
            gte: twentyFourHoursAgo
          }
        }
      }),
      prisma.transaction.count({
        where: {
          block: {
            timestamp: {
              gte: twentyFourHoursAgo
            }
          }
        }
      }),
      prisma.address.count(),
      prisma.address.count({
        where: {
          isContract: true
        }
      })
    ]);

    // Calculate average block time (last 100 blocks)
    const last100Blocks = await prisma.block.findMany({
      select: {
        timestamp: true,
        number: true
      },
      orderBy: { number: 'desc' },
      take: 100
    });

    let averageBlockTime = 0;
    if (last100Blocks.length > 1) {
      const timestamps = last100Blocks.map(b => b.timestamp.getTime()).sort((a, b) => a - b);
      const timeDiffs = [];
      
      for (let i = 1; i < timestamps.length; i++) {
        timeDiffs.push(timestamps[i] - timestamps[i - 1]);
      }
      
      averageBlockTime = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length / 1000; // in seconds
    }

    // Calculate average gas price (last 1000 transactions)
    const recentTxGasPrices = await prisma.transaction.findMany({
      select: {
        gasPrice: true,
        maxFeePerGas: true
      },
      where: {
        OR: [
          { gasPrice: { not: null } },
          { maxFeePerGas: { not: null } }
        ]
      },
      orderBy: { blockNumber: 'desc' },
      take: 1000
    });

    let averageGasPrice = '0';
    if (recentTxGasPrices.length > 0) {
      const gasPrices = recentTxGasPrices.map(tx => 
        BigInt(tx.gasPrice || tx.maxFeePerGas || '0')
      );
      const sum = gasPrices.reduce((acc, price) => acc + price, 0n);
      averageGasPrice = (sum / BigInt(gasPrices.length)).toString();
    }

    // Network hashrate estimation (simplified)
    let networkHashrate = '0';
    if (latestBlock && averageBlockTime > 0) {
      // This is a very simplified estimation
      // Real hashrate calculation would need difficulty adjustment algorithm specifics
      const difficulty = chainStats?.difficulty || '1';
      try {
        const hashrateEstimate = BigInt(difficulty) / BigInt(Math.floor(averageBlockTime));
        networkHashrate = hashrateEstimate.toString();
      } catch {
        networkHashrate = '0';
      }
    }

    // Calculate network utilization
    let networkUtilization = 0;
    if (latestBlock) {
      networkUtilization = Number(
        (BigInt(latestBlock.gasUsed) * 100n) / BigInt(latestBlock.gasLimit)
      );
    }

    // Get transaction success rate
    const [successfulTxs, totalTxs] = await Promise.all([
      prisma.transaction.count({
        where: {
          status: 1,
          block: {
            timestamp: {
              gte: twentyFourHoursAgo
            }
          }
        }
      }),
      prisma.transaction.count({
        where: {
          block: {
            timestamp: {
              gte: twentyFourHoursAgo
            }
          }
        }
      })
    ]);

    const successRate = totalTxs > 0 ? (successfulTxs / totalTxs) * 100 : 100;

    const response = {
      // Current blockchain state
      latestBlock: latestBlock ? {
        number: latestBlock.number.toString(),
        hash: latestBlock.hash,
        timestamp: latestBlock.timestamp.toISOString(),
        age: Math.floor((Date.now() - latestBlock.timestamp.getTime()) / 1000),
        transactionCount: latestBlock.transactionCount,
        gasUsed: latestBlock.gasUsed,
        gasLimit: latestBlock.gasLimit,
        utilization: networkUtilization
      } : null,

      // Network statistics
      network: {
        chainId: 42069,
        name: 'Yafa L2',
        averageBlockTime: Math.round(averageBlockTime * 100) / 100,
        averageGasPrice,
        networkHashrate,
        difficulty: chainStats?.difficulty || '0',
        networkUtilization: Math.round(networkUtilization * 100) / 100
      },

      // Transaction statistics
      transactions: {
        total: chainStats?.totalTransactions.toString() || '0',
        last24h: recentTransactions,
        successRate: Math.round(successRate * 100) / 100,
        averageGasUsed: chainStats?.averageGasUsed || '0'
      },

      // Block statistics
      blocks: {
        total: latestBlock?.number.toString() || '0',
        last24h: recentBlocks,
        averageBlockTime: Math.round(averageBlockTime * 100) / 100
      },

      // Address statistics
      addresses: {
        total: totalAddresses,
        contracts: totalContracts,
        eoa: totalAddresses - totalContracts
      },

      // Sync status
      sync: {
        isSyncing: syncStatus?.isSyncing || false,
        currentBlock: syncStatus?.currentBlock.toString() || '0',
        targetBlock: syncStatus?.targetBlock?.toString(),
        blocksPerSecond: syncStatus?.blocksPerSecond || 0,
        lastSyncTime: syncStatus?.lastSyncTime?.toISOString(),
        syncPercentage: syncStatus?.targetBlock ? 
          Math.round((Number(syncStatus.currentBlock) / Number(syncStatus.targetBlock)) * 100) : 100
      },

      // Performance metrics
      performance: {
        transactionsPerSecond: averageBlockTime > 0 ? 
          Math.round((recentTransactions / 86400) * 100) / 100 : 0, // TPS over last 24h
        blocksPerMinute: averageBlockTime > 0 ? 
          Math.round((60 / averageBlockTime) * 100) / 100 : 0
      },

      // Timestamps
      lastUpdated: new Date().toISOString(),
      dataFreshness: syncStatus?.lastSyncTime ? 
        Math.floor((Date.now() - syncStatus.lastSyncTime.getTime()) / 1000) : 0
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch chain statistics' 
      },
      { status: 500 }
    );
  }
}