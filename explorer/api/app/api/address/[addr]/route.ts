import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { addr: string } }
) {
  try {
    const address = params.addr.toLowerCase();
    const { searchParams } = new URL(request.url);
    const includeTransactions = searchParams.get('transactions') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Get address information
    const addressInfo = await prisma.address.findUnique({
      where: { address },
      include: {
        tokenBalances: {
          take: 50, // Limit token balances to prevent huge responses
          orderBy: {
            updatedAt: 'desc'
          }
        }
      }
    });

    // Get transaction counts
    const [sentCount, receivedCount] = await Promise.all([
      prisma.transaction.count({
        where: { from: address }
      }),
      prisma.transaction.count({
        where: { to: address }
      })
    ]);

    const totalTransactions = sentCount + receivedCount;

    // Get recent transactions if requested
    let transactions = [];
    let transactionsPagination = null;

    if (includeTransactions) {
      const txs = await prisma.transaction.findMany({
        where: {
          OR: [
            { from: address },
            { to: address }
          ]
        },
        select: {
          hash: true,
          blockNumber: true,
          from: true,
          to: true,
          value: true,
          gasUsed: true,
          gasPrice: true,
          status: true,
          block: {
            select: {
              timestamp: true
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

      transactions = txs.map(tx => ({
        hash: tx.hash,
        blockNumber: tx.blockNumber.toString(),
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        status: tx.status === 1 ? 'success' : 'failed',
        timestamp: tx.block.timestamp.toISOString(),
        age: Math.floor((Date.now() - tx.block.timestamp.getTime()) / 1000),
        direction: tx.from === address ? 'out' : 'in'
      }));

      const totalPages = Math.ceil(totalTransactions / limit);
      transactionsPagination = {
        page,
        limit,
        totalTransactions,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    }

    // Get token transfer counts
    const [tokenSentCount, tokenReceivedCount] = await Promise.all([
      prisma.tokenTransfer.count({
        where: { from: address }
      }),
      prisma.tokenTransfer.count({
        where: { to: address }
      })
    ]);

    // Check if this is a contract
    const isContract = addressInfo?.isContract || false;
    
    // For contracts, get additional information
    let contractInfo = null;
    if (isContract) {
      // Get contract creation transaction
      const creationTx = await prisma.transaction.findFirst({
        where: {
          to: null, // Contract creation
          from: address
        },
        include: {
          block: {
            select: {
              timestamp: true,
              number: true
            }
          }
        },
        orderBy: {
          blockNumber: 'asc'
        }
      });

      contractInfo = {
        isToken: !!addressInfo?.tokenName,
        tokenInfo: addressInfo?.tokenName ? {
          name: addressInfo.tokenName,
          symbol: addressInfo.tokenSymbol,
          decimals: addressInfo.tokenDecimals,
          totalSupply: addressInfo.tokenTotalSupply,
          type: addressInfo.tokenType
        } : null,
        createdAt: creationTx?.block.timestamp.toISOString(),
        createdInBlock: creationTx?.block.number.toString(),
        creationTxHash: creationTx?.hash
      };
    }

    const response = {
      address,
      balance: addressInfo?.balance || '0',
      nonce: addressInfo?.nonce || 0,
      isContract,
      contractInfo,
      
      // Transaction statistics
      transactionCount: totalTransactions,
      sentTransactions: sentCount,
      receivedTransactions: receivedCount,
      
      // Token transfer statistics
      tokenTransferCount: tokenSentCount + tokenReceivedCount,
      tokenTransfersSent: tokenSentCount,
      tokenTransfersReceived: tokenReceivedCount,
      
      // Token balances
      tokenBalances: addressInfo?.tokenBalances.map(tb => ({
        tokenAddress: tb.tokenAddress,
        balance: tb.balance,
        lastUpdated: tb.updatedAt.toISOString()
      })) || [],
      
      // Activity timestamps
      firstSeen: addressInfo?.firstSeen?.toISOString(),
      lastSeen: addressInfo?.lastSeen?.toISOString(),
      
      // Recent transactions (if requested)
      ...(includeTransactions && {
        transactions,
        transactionsPagination
      })
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch address details' 
      },
      { status: 500 }
    );
  }
}