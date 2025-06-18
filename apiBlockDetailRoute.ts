import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const blockNumber = BigInt(params.number);

    // Get block with transactions
    const block = await prisma.block.findUnique({
      where: {
        number: blockNumber
      },
      include: {
        transactions: {
          select: {
            hash: true,
            from: true,
            to: true,
            value: true,
            gasUsed: true,
            gasPrice: true,
            status: true,
            transactionIndex: true
          },
          orderBy: {
            transactionIndex: 'asc'
          }
        }
      }
    });

    if (!block) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Block not found' 
        },
        { status: 404 }
      );
    }

    // Calculate block stats
    const totalGasUsed = block.transactions.reduce(
      (sum, tx) => sum + BigInt(tx.gasUsed || '0'), 
      0n
    );

    const successfulTxs = block.transactions.filter(tx => tx.status === 1).length;
    const failedTxs = block.transactions.filter(tx => tx.status === 0).length;

    // Get previous and next blocks
    const [prevBlock, nextBlock] = await Promise.all([
      prisma.block.findFirst({
        where: { number: blockNumber - 1n },
        select: { number: true, hash: true }
      }),
      prisma.block.findFirst({
        where: { number: blockNumber + 1n },
        select: { number: true, hash: true }
      })
    ]);

    // Format transactions
    const formattedTransactions = block.transactions.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      status: tx.status === 1 ? 'success' : 'failed',
      index: tx.transactionIndex
    }));

    const response = {
      number: block.number.toString(),
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp.toISOString(),
      difficulty: block.difficulty,
      totalDifficulty: block.totalDifficulty,
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      gasUsedPercent: ((BigInt(block.gasUsed) * 100n) / BigInt(block.gasLimit)).toString(),
      miner: block.miner,
      extraData: block.extraData,
      size: block.size,
      transactionCount: block.transactions.length,
      successfulTxs,
      failedTxs,
      totalGasUsed: totalGasUsed.toString(),
      age: Math.floor((Date.now() - block.timestamp.getTime()) / 1000),
      transactions: formattedTransactions,
      navigation: {
        prev: prevBlock ? {
          number: prevBlock.number.toString(),
          hash: prevBlock.hash
        } : null,
        next: nextBlock ? {
          number: nextBlock.number.toString(),
          hash: nextBlock.hash
        } : null
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching block:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch block details' 
      },
      { status: 500 }
    );
  }
}