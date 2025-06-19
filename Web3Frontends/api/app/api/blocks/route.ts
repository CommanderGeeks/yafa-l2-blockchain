import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 per page
    const offset = (page - 1) * limit;

    // Get blocks with transaction count
    const [blocks, totalCount] = await Promise.all([
      prisma.block.findMany({
        take: limit,
        skip: offset,
        orderBy: { number: 'desc' },
        include: {
          _count: {
            select: { transactions: true }
          }
        }
      }),
      prisma.block.count()
    ]);

    // Format blocks for response
    const formattedBlocks = blocks.map(block => {
      const gasUsedPercent = Number(BigInt(block.gasUsed) * BigInt(100) / BigInt(block.gasLimit));
      
      return {
        number: block.number.toString(),
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: block.timestamp.toISOString(),
        gasUsed: block.gasUsed,
        gasLimit: block.gasLimit,
        gasUsedPercent: gasUsedPercent.toFixed(2),
        miner: block.miner,
        difficulty: block.difficulty,
        totalDifficulty: block.totalDifficulty,
        size: block.size,
        transactionCount: block._count.transactions,
        age: Math.floor((Date.now() - block.timestamp.getTime()) / 1000)
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        blocks: formattedBlocks,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Blocks API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}