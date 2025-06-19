import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;

    // Validate hash format
    if (!hash || !hash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid transaction hash format'
      }, { status: 400 });
    }

    // Get transaction with related data
    const transaction = await db.transaction.findUnique({
      where: { hash },
      include: {
        block: {
          select: {
            number: true,
            timestamp: true,
            miner: true
          }
        },
        logs: {
          orderBy: { logIndex: 'asc' }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found'
      }, { status: 404 });
    }

    // Extract method from input data
    let method = 'Transfer';
    let decodedInput = null;
    if (transaction.input && transaction.input !== '0x' && transaction.input.length >= 10) {
      const methodSignature = transaction.input.slice(0, 10);
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

    // Calculate transaction fee
    const gasUsed = BigInt(transaction.gasUsed || transaction.gas);
    const gasPrice = BigInt(transaction.gasPrice);
    const transactionFee = (gasUsed * gasPrice).toString();

    // Calculate age
    const age = Math.floor((Date.now() - transaction.timestamp.getTime()) / 1000);

    // Process logs for token transfers and events
    const processedLogs = transaction.logs.map(log => ({
      address: log.address,
      topics: log.topics,
      data: log.data,
      logIndex: log.logIndex,
      removed: log.removed,
      // Try to decode common events
      decoded: decodeLogEvent(log)
    }));

    const transformedTransaction = {
      hash: transaction.hash,
      blockNumber: transaction.blockNumber.toString(),
      blockHash: transaction.blockHash,
      transactionIndex: transaction.transactionIndex,
      from: transaction.from,
      to: transaction.to || '',
      value: transaction.value,
      gas: transaction.gas,
      gasUsed: transaction.gasUsed || transaction.gas,
      gasPrice: transaction.gasPrice,
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      nonce: transaction.nonce.toString(),
      input: transaction.input,
      status: transaction.status,
      timestamp: transaction.timestamp.toISOString(),
      age,
      method,
      transactionFee,
      block: {
        number: transaction.block.number.toString(),
        timestamp: transaction.block.timestamp.toISOString(),
        miner: transaction.block.miner
      },
      logs: processedLogs
    };

    return NextResponse.json({
      success: true,
      data: transformedTransaction
    });

  } catch (error) {
    console.error('Transaction API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transaction'
    }, { status: 500 });
  }
}

// Helper function to decode common log events
function decodeLogEvent(log: any) {
  try {
    // ERC20 Transfer event: Transfer(address,address,uint256)
    if (log.topics.length === 3 && log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
      return {
        event: 'Transfer',
        from: '0x' + log.topics[1].slice(26), // Remove padding
        to: '0x' + log.topics[2].slice(26),
        value: log.data
      };
    }

    // ERC20 Approval event: Approval(address,address,uint256)
    if (log.topics.length === 3 && log.topics[0] === '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925') {
      return {
        event: 'Approval',
        owner: '0x' + log.topics[1].slice(26),
        spender: '0x' + log.topics[2].slice(26),
        value: log.data
      };
    }

    // Swap event (Uniswap-style)
    if (log.topics[0] === '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822') {
      return {
        event: 'Swap',
        // Would need more sophisticated decoding for full swap data
        rawData: log.data
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}