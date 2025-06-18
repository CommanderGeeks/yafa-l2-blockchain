import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status'); // 'success', 'failed', or null for all
    const address = searchParams.get('address'); // filter by from/to address
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status === 'success') {
      where.status = 1;
    } else if (status === 'failed') {
      where.status = 0;
    }

    if (address) {
      where.OR = [
        { from: address.toLowerCase() },
        { to: address.toLowerCase() }
      ];
    }

    // Get total count for pagination
    const totalTransactions = await prisma.transaction.count({ where });

    // Get transactions with block info
    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        hash: true,
        blockNumber: true,
        transactionIndex: true,
        from: true,
        to: true,
        value: true,
        gasLimit: true,
        gasUsed: true,
        gasPrice: true,
        maxFeePerGas: true,
        status: true,
        type: true,
        block: {
          select: {
            timestamp: true,
            number: true
          }
        }
      },
      orderBy: [
        { blockNumber: 'desc' },
        { transactionIndex: 'desc' }
      ],
      skip: offset,
      take: limit
    });

    // Format response data
    const formattedTransactions = transactions.map(tx => {
      const gasPrice = tx.gasPrice || tx.maxFeePerGas || '0';
      const txFee = (BigInt(tx.gasUsed || '0') * BigInt(gasPrice)).toString();
      
      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber.toString(),
        index: tx.transactionIndex,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasLimit: tx.gasLimit,
        gasUsed: tx.gasUsed,
        gasPrice: gasPrice,
        transactionFee: txFee,
        status: tx.status === 1 ? 'success' : 'failed',
        type: tx.type || 0,
        timestamp: tx.block.timestamp.toISOString(),
        age: Math.floor((Date.now() - tx.block.timestamp.getTime()) / 1000),
        method: tx.to ? 'Transfer' : 'Contract Creation' // Simplified method detection
      };
    });

    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          page,
          limit,
          totalTransactions,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          status,
          address
        }
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch transactions' 
      },
      { status: 500 }
    );
  }
}