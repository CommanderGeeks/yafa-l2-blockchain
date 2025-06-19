import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { addr: string } }
) {
  try {
    const { addr } = params;
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include'); // transfers, holders, etc.

    // Validate address format
    if (!addr || !addr.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token address format'
      }, { status: 400 });
    }

    const tokenAddress = addr.toLowerCase();

    // Get token record
    const token = await db.token.findUnique({
      where: { address: tokenAddress }
    });

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token not found'
      }, { status: 404 });
    }

    // Get transfer count
    const transferCount = await db.tokenTransfer.count({
      where: { tokenAddress }
    });

    // Get unique holders count
    const uniqueHolders = await db.tokenTransfer.findMany({
      where: { tokenAddress },
      select: { to: true },
      distinct: ['to']
    });

    const holdersCount = uniqueHolders.length;

    // Get recent transfers if requested
    let recentTransfers = null;
    if (include?.includes('transfers')) {
      const transfers = await db.tokenTransfer.findMany({
        where: { tokenAddress },
        orderBy: { blockNumber: 'desc' },
        take: 20,
        include: {
          transaction: {
            select: {
              hash: true,
              timestamp: true,
              status: true
            }
          }
        }
      });

      recentTransfers = transfers.map(transfer => ({
        transactionHash: transfer.transactionHash,
        blockNumber: transfer.blockNumber.toString(),
        logIndex: transfer.logIndex,
        from: transfer.from,
        to: transfer.to,
        value: transfer.value,
        timestamp: transfer.transaction?.timestamp.toISOString(),
        status: transfer.transaction?.status,
        age: transfer.transaction 
          ? Math.floor((Date.now() - transfer.transaction.timestamp.getTime()) / 1000)
          : null
      }));
    }

    // Get top holders if requested
    let topHolders = null;
    if (include?.includes('holders')) {
      // Calculate balances for each holder
      const transfers = await db.tokenTransfer.findMany({
        where: { tokenAddress },
        select: {
          from: true,
          to: true,
          value: true
        }
      });

      const balanceMap = new Map<string, bigint>();

      // Calculate balances
      for (const transfer of transfers) {
        const value = BigInt(transfer.value);
        
        // Add to recipient
        if (!balanceMap.has(transfer.to)) {
          balanceMap.set(transfer.to, BigInt(0));
        }
        balanceMap.set(transfer.to, balanceMap.get(transfer.to)! + value);
        
        // Subtract from sender (if not mint)
        if (transfer.from !== '0x0000000000000000000000000000000000000000') {
          if (!balanceMap.has(transfer.from)) {
            balanceMap.set(transfer.from, BigInt(0));
          }
          balanceMap.set(transfer.from, balanceMap.get(transfer.from)! - value);
        }
      }

      // Filter out zero balances and sort
      const holders = Array.from(balanceMap.entries())
        .filter(([_, balance]) => balance > 0)
        .sort(([, a], [, b]) => b > a ? 1 : b < a ? -1 : 0)
        .slice(0, 50)
        .map(([address, balance], index) => ({
          rank: index + 1,
          address,
          balance: balance.toString(),
          percentage: token.totalSupply 
            ? ((balance * BigInt(10000)) / BigInt(token.totalSupply)).toString() + 'bps'
            : '0%'
        }));

      topHolders = holders;
    }

    // Get price data if available (this would typically come from an external API)
    let priceData = null;
    // For now, we'll just provide a placeholder structure
    if (include?.includes('price')) {
      priceData = {
        price: null,
        priceChange24h: null,
        marketCap: null,
        volume24h: null,
        lastUpdated: null
      };
    }

    const result = {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      totalSupply: token.totalSupply,
      type: token.type,
      transferCount,
      holdersCount,
      createdAt: token.createdAt.toISOString(),
      recentTransfers,
      topHolders,
      priceData
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Token API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch token data'
    }, { status: 500 });
  }
}

// Additional endpoint for token transfers with pagination
export async function POST(
  request: NextRequest,
  { params }: { params: { addr: string } }
) {
  try {
    const { addr } = params;
    const body = await request.json();
    const { page = 1, limit = 20, address = null } = body; // Optional filter by holder address

    const tokenAddress = addr.toLowerCase();
    const offset = (page - 1) * limit;

    // Build where clause
    let where: any = { tokenAddress };
    if (address) {
      where.OR = [
        { from: address.toLowerCase() },
        { to: address.toLowerCase() }
      ];
    }

    const total = await db.tokenTransfer.count({ where });

    const transfers = await db.tokenTransfer.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { blockNumber: 'desc' },
      include: {
        transaction: {
          select: {
            hash: true,
            timestamp: true,
            status: true
          }
        }
      }
    });

    const transformedTransfers = transfers.map(transfer => ({
      transactionHash: transfer.transactionHash,
      blockNumber: transfer.blockNumber.toString(),
      logIndex: transfer.logIndex,
      from: transfer.from,
      to: transfer.to,
      value: transfer.value,
      timestamp: transfer.transaction?.timestamp.toISOString(),
      status: transfer.transaction?.status,
      age: transfer.transaction 
        ? Math.floor((Date.now() - transfer.transaction.timestamp.getTime()) / 1000)
        : null
    }));

    return NextResponse.json({
      success: true,
      data: {
        transfers: transformedTransfers
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Token transfers API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch token transfers'
    }, { status: 500 });
  }
}