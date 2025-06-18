import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get chain statistics
    const [
      latestBlock,
      totalBlocks,
      totalTransactions,
      totalAddresses,
      contractCount,
      recentBlocks,
      recentTransactions
    ] = await Promise.all([
      // Latest block
      prisma.block.findFirst({
        orderBy: { number: 'desc' },
        include: {
          _count: {
            select: { transactions: true }
          }
        }
      }),
      
      // Total blocks
      prisma.block.count(),
      
      // Total transactions
      prisma.transaction.count(),
      
      // Total addresses
      prisma.address.count(),
      
      // Contract count
      prisma.address.count({
        where: { isContract: true }
      }),
      
      // Recent blocks (last 24h)
      prisma.block.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Recent transactions (last 24h)
      prisma.transaction.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    if (!latestBlock) {
      return NextResponse.json({
        success: false,
        error: 'No blocks found'
      }, { status: 404 });
    }

    // Calculate network statistics
    const last10Blocks = await prisma.block.findMany({
      take: 10,
      orderBy: { number: 'desc' },
      select: {
        timestamp: true,
        gasUsed: true,
        gasLimit: true
      }
    });

    // Calculate average block time
    let averageBlockTime = 12; // Default fallback
    if (last10Blocks.length > 1) {
      const blockTimes = [];
      for (let i = 0; i < last10Blocks.length - 1; i++) {
        const timeDiff = new Date(last10Blocks[i].timestamp).getTime() - 
                        new Date(last10Blocks[i + 1].timestamp).getTime();
        blockTimes.push(timeDiff / 1000);
      }
      averageBlockTime = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length;
    }

    // Calculate average gas price from recent transactions
    const recentTxs = await prisma.transaction.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' },
      select: { gasPrice: true }
    });

    const averageGasPrice = recentTxs.length > 0 
      ? recentTxs.reduce((sum, tx) => sum + BigInt(tx.gasPrice), BigInt(0)) / BigInt(recentTxs.length)
      : BigInt(0);

    // Calculate network utilization
    const totalGasUsed = last10Blocks.reduce((sum, block) => sum + BigInt(block.gasUsed), BigInt(0));
    const totalGasLimit = last10Blocks.reduce((sum, block) => sum + BigInt(block.gasLimit), BigInt(0));
    const networkUtilization = totalGasLimit > 0 
      ? Number(totalGasUsed * BigInt(100) / totalGasLimit)
      : 0;

    // Calculate success rate
    const successfulTxs = await prisma.transaction.count({
      where: {
        status: '1',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    const successRate = recentTransactions > 0 
      ? (successfulTxs / recentTransactions) * 100 
      : 100;

    const stats = {
      latestBlock: {
        number: latestBlock.number.toString(),
        hash: latestBlock.hash,
        timestamp: latestBlock.timestamp.toISOString(),
        transactionCount: latestBlock._count.transactions,
        gasUsed: latestBlock.gasUsed,
        gasLimit: latestBlock.gasLimit,
        utilization: Number(BigInt(latestBlock.gasUsed) * BigInt(100) / BigInt(latestBlock.gasLimit))
      },
      network: {
        averageBlockTime: Math.round(averageBlockTime),
        averageGasPrice: averageGasPrice.toString(),
        networkUtilization: Math.round(networkUtilization * 100) / 100
      },
      transactions: {
        total: totalTransactions.toString(),
        last24h: recentTransactions,
        successRate: Math.round(successRate * 100) / 100
      },
      blocks: {
        total: totalBlocks.toString(),
        last24h: recentBlocks
      },
      addresses: {
        total: totalAddresses,
        contracts: contractCount
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}