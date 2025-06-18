import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const txHash = params.hash;

    // Get transaction with block and logs
    const transaction = await prisma.transaction.findUnique({
      where: {
        hash: txHash
      },
      include: {
        block: {
          select: {
            number: true,
            hash: true,
            timestamp: true,
            miner: true
          }
        },
        logs: {
          select: {
            logIndex: true,
            address: true,
            topics: true,
            data: true
          },
          orderBy: {
            logIndex: 'asc'
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction not found' 
        },
        { status: 404 }
      );
    }

    // Get token transfers for this transaction
    const tokenTransfers = await prisma.tokenTransfer.findMany({
      where: {
        transactionHash: txHash
      },
      orderBy: {
        logIndex: 'asc'
      }
    });

    // Calculate transaction fee
    const gasPrice = transaction.gasPrice || transaction.maxFeePerGas || '0';
    const transactionFee = (BigInt(transaction.gasUsed || '0') * BigInt(gasPrice)).toString();
    
    // Format logs with decoded information
    const formattedLogs = transaction.logs.map(log => ({
      index: log.logIndex,
      address: log.address,
      topics: log.topics,
      data: log.data,
      // Add basic event detection
      eventName: detectEventName(log.topics[0]),
    }));

    // Format token transfers
    const formattedTokenTransfers = tokenTransfers.map(transfer => ({
      tokenAddress: transfer.tokenAddress,
      from: transfer.from,
      to: transfer.to,
      value: transfer.value,
      tokenId: transfer.tokenId,
      logIndex: transfer.logIndex
    }));

    const response = {
      hash: transaction.hash,
      status: transaction.status === 1 ? 'success' : 'failed',
      blockNumber: transaction.blockNumber.toString(),
      blockHash: transaction.block.hash,
      transactionIndex: transaction.transactionIndex,
      confirmations: 1, // Would need to calculate based on latest block
      
      // Transaction details
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      gasLimit: transaction.gasLimit,
      gasUsed: transaction.gasUsed,
      gasPrice: gasPrice,
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      transactionFee,
      
      // Gas efficiency
      gasUsedPercent: transaction.gasUsed ? 
        ((BigInt(transaction.gasUsed) * 100n) / BigInt(transaction.gasLimit)).toString() : '0',
      
      // Transaction data
      input: transaction.input,
      nonce: transaction.nonce,
      type: transaction.type || 0,
      
      // Block information
      timestamp: transaction.block.timestamp.toISOString(),
      age: Math.floor((Date.now() - transaction.block.timestamp.getTime()) / 1000),
      miner: transaction.block.miner,
      
      // Logs and events
      logs: formattedLogs,
      logCount: transaction.logs.length,
      
      // Token transfers
      tokenTransfers: formattedTokenTransfers,
      tokenTransferCount: tokenTransfers.length,
      
      // Advanced info
      isContractCreation: !transaction.to,
      method: getMethodName(transaction.input),
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch transaction details' 
      },
      { status: 500 }
    );
  }
}

// Helper function to detect event names from topic hash
function detectEventName(topicHash: string): string {
  const knownEvents: { [key: string]: string } = {
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef': 'Transfer',
    '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925': 'Approval',
    '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0': 'OwnershipTransferred',
    '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c': 'Deposit',
    '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65': 'Withdrawal'
  };
  
  return knownEvents[topicHash] || 'Unknown';
}

// Helper function to extract method name from input data
function getMethodName(input: string | null): string {
  if (!input || input === '0x' || input.length < 10) {
    return 'Transfer';
  }
  
  const methodId = input.slice(0, 10);
  
  const knownMethods: { [key: string]: string } = {
    '0xa9059cbb': 'transfer',
    '0x23b872dd': 'transferFrom',
    '0x095ea7b3': 'approve',
    '0x40c10f19': 'mint',
    '0x42966c68': 'burn',
    '0x2e1a7d4d': 'withdraw',
    '0xd0e30db0': 'deposit'
  };
  
  return knownMethods[methodId] || 'Unknown';
}