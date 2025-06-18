import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Max 100 per page
    const status = searchParams.get('status'); // success, failed, pending
    const blockNumber = searchParams.get('block');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (blockNumber) {
      where.blockNumber = BigInt(blockNumber);
    }

    // Get total count for pagination
    const total = await db.transaction.count({ where });

    // Get transactions
    const transactions = await db.transaction.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        block: {
          select: {
            timestamp: true
          }
        }
      }
    });

    // Transform the data
    const transformedTransactions = transactions.map(tx => {
      const age = Math.floor((Date.now() - tx.timestamp.getTime()) / 1000);
      
      // Extract method from input data
      let method = 'Transfer';
      if (tx.input && tx.input !== '0x' && tx.input.length >= 10) {
        const methodSignature = tx.input.slice(0, 10);
        // Map common method signatures to readable names
        const methodMap: { [key: string]: string } = {
          '0xa9059cbb': 'Transfer',
          '0x23b872dd': 'Transfer From',
          '0x095ea7b3': 'Approve',
          '0x40c10f19': 'Mint',
          '0x42966c68': 'Burn',
          '0x7ff36ab5': 'Swap Exact ETH For Tokens',
          '0x18cbafe5': 'Swap Exact Tokens For ETH',
          '0x38ed1739': 'Swap Exact Tokens For Tokens',
          '0xf305d719': 'Add Liquidity ETH',
          '0xe8e33700': 'Add Liquidity'
        };
        method = methodMap[methodSignature] || methodSignature;
      }

      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber.toString(),
        blockHash: tx.blockHash,
        transactionIndex: tx.transactionIndex,
        from: tx.from,
        to: tx.to || '',
        value: tx.value,
        gas: tx.gas,
        gasUsed: tx.gasUsed || tx.gas,
        gasPrice: tx.gasPrice,
        maxFeePerGas: tx.maxFeePerGas,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
        nonce: tx.nonce.toString(),
        input: tx.input,
        status: tx.status,
        timestamp: tx.timestamp.toISOString(),
        age,
        method
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: transformedTransactions
      },
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });

  } catch (error) {
    console.error('Transactions API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 });
  }
}