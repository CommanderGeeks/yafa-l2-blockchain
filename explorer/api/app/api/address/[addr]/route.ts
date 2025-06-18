import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { addr: string } }
) {
  try {
    const { addr } = params;
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include'); // transactions, tokens, etc.

    // Validate address format
    if (!addr || !addr.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid address format'
      }, { status: 400 });
    }

    const address = addr.toLowerCase();

    // Get or create address record
    let addressRecord = await db.address.findUnique({
      where: { address }
    });

    if (!addressRecord) {
      // Create address record if it doesn't exist
      addressRecord = await db.address.create({
        data: {
          address,
          balance: '0',
          nonce: BigInt(0),
          isContract: false,
          firstSeen: new Date(),
          lastSeen: new Date()
        }
      });
    }

    // Get transaction counts
    const sentTxCount = await db.transaction.count({
      where: { from: address }
    });

    const receivedTxCount = await db.transaction.count({
      where: { to: address }
    });

    const totalTxCount = sentTxCount + receivedTxCount;

    // Get recent transactions if requested
    let recentTransactions = null;
    if (include?.includes('transactions')) {
      const transactions = await db.transaction.findMany({
        where: {
          OR: [
            { from: address },
            { to: address }
          ]
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          hash: true,
          blockNumber: true,
          from: true,
          to: true,
          value: true,
          gasUsed: true,
          gasPrice: true,
          status: true,
          timestamp: true
        }
      });

      recentTransactions = transactions.map(tx => ({
        ...tx,
        blockNumber: tx.blockNumber.toString(),
        age: Math.floor((Date.now() - tx.timestamp.getTime()) / 1000),
        direction: tx.from.toLowerCase() === address ? 'sent' : 'received'
      }));
    }

    // Get token balances if requested
    let tokenBalances = null;
    if (include?.includes('tokens')) {
      // Get token transfers involving this address
      const tokenTransfers = await db.tokenTransfer.findMany({
        where: {
          OR: [
            { from: address },
            { to: address }
          ]
        },
        select: {
          tokenAddress: true,
          from: true,
          to: true,
          value: true
        }
      });

      // Calculate balances for each token
      const balanceMap = new Map<string, bigint>();
      
      for (const transfer of tokenTransfers) {
        const tokenAddr = transfer.tokenAddress;
        const value = BigInt(transfer.value);
        
        if (!balanceMap.has(tokenAddr)) {
          balanceMap.set(tokenAddr, BigInt(0));
        }
        
        if (transfer.to.toLowerCase() === address) {
          balanceMap.set(tokenAddr, balanceMap.get(tokenAddr)! + value);
        } else if (transfer.from.toLowerCase() === address) {
          balanceMap.set(tokenAddr, balanceMap.get(tokenAddr)! - value);
        }
      }

      // Get token metadata
      tokenBalances = [];
      for (const [tokenAddr, balance] of balanceMap.entries()) {
        if (balance > 0) {
          const token = await db.token.findUnique({
            where: { address: tokenAddr }
          });
          
          tokenBalances.push({
            tokenAddress: tokenAddr,
            balance: balance.toString(),
            token: token ? {
              name: token.name,
              symbol: token.symbol,
              decimals: token.decimals,
              type: token.type
            } : null
          });
        }
      }
    }

    // Check if address is a contract
    const isContract = addressRecord.code && addressRecord.code !== '0x';

    const result = {
      address: addressRecord.address,
      balance: addressRecord.balance,
      nonce: addressRecord.nonce.toString(),
      isContract,
      contractName: addressRecord.contractName,
      code: isContract ? addressRecord.code : undefined,
      transactionCount: totalTxCount,
      sentTransactions: sentTxCount,
      receivedTransactions: receivedTxCount,
      firstSeen: addressRecord.firstSeen.toISOString(),
      lastSeen: addressRecord.lastSeen.toISOString(),
      recentTransactions,
      tokenBalances
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Address API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch address data'
    }, { status: 500 });
  }
}

// Additional endpoint for address transactions with pagination
export async function POST(
  request: NextRequest,
  { params }: { params: { addr: string } }
) {
  try {
    const { addr } = params;
    const body = await request.json();
    const { page = 1, limit = 20, type = 'all' } = body; // type: 'all', 'sent', 'received'

    const address = addr.toLowerCase();
    const offset = (page - 1) * limit;

    // Build where clause based on type
    let where: any = {
      OR: [
        { from: address },
        { to: address }
      ]
    };

    if (type === 'sent') {
      where = { from: address };
    } else if (type === 'received') {
      where = { to: address };
    }

    const total = await db.transaction.count({ where });

    const transactions = await db.transaction.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { timestamp: 'desc' },
      select: {
        hash: true,
        blockNumber: true,
        from: true,
        to: true,
        value: true,
        gas: true,
        gasUsed: true,
        gasPrice: true,
        status: true,
        timestamp: true,
        input: true
      }
    });

    const transformedTransactions = transactions.map(tx => ({
      ...tx,
      blockNumber: tx.blockNumber.toString(),
      age: Math.floor((Date.now() - tx.timestamp.getTime()) / 1000),
      direction: tx.from.toLowerCase() === address ? 'sent' : 'received',
      method: tx.input && tx.input !== '0x' && tx.input.length >= 10 
        ? tx.input.slice(0, 10) 
        : 'Transfer'
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: transformedTransactions
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Address transactions API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch address transactions'
    }, { status: 500 });
  }
}