import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import { formatBlockForApi } from '../../../../lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const { number } = params;

    // Validate block number
    if (!number || !number.match(/^\d+$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid block number format'
      }, { status: 400 });
    }

    const blockNumber = BigInt(number);

    // Get block with transactions
    const block = await db.block.findUnique({
      where: { number: blockNumber },
      include: {
        transactions: {
          orderBy: { transactionIndex: 'asc' },
          take: 100 // Limit transactions for performance
        },
        _count: {
          select: { transactions: true }
        }
      }
    });

    if (!block) {
      return NextResponse.json({
        success: false,
        error: 'Block not found'
      }, { status: 404 });
    }

    // Format block data
    const formattedBlock = {
      ...formatBlockForApi(block),
      transactionCount: block._count.transactions,
      transactions: block.transactions.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasUsed: tx.gasUsed || tx.gas,
        gasPrice: tx.gasPrice,
        status: tx.status
      }))
    };

    return NextResponse.json({
      success: true,
      data: formattedBlock
    });

  } catch (error) {
    console.error('Single block API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch block'
    }, { status: 500 });
  }
}