import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalBlocks = await prisma.block.count();

    // Get blocks with transaction count
    const blocks = await prisma.block.findMany({
      select: {
        number: true,
        hash: true,
        parentHash: true,
        timestamp: true,
        gasLimit: true,
        gasUsed: true,
        miner: true,
        transactionCount: true,
        size: true,
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: {
        number: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Format response data
    const formattedBlocks = blocks.map(block => ({
      number: block.number.toString(),
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp.toISOString(),
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      gasUsedPercent: ((BigInt(block.gasUsed) * 100n) / BigInt(block.gasLimit)).toString(),
      miner: block.miner,
      transactionCount: block._count.transactions,
      size: block.size,
      age: Math.floor((Date.now() - block.timestamp.getTime()) / 1000)
    }));

    const totalPages = Math.ceil(totalBlocks / limit);

    return NextResponse.json({
      success: true,
      data: {
        blocks: formattedBlocks,
        pagination: {
          page,
          limit,
          totalBlocks,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blocks' 
      },
      { status: 500 }
    );
  }
}