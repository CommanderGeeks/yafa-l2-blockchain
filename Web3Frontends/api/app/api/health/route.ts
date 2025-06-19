import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    const dbCheck = await db.$queryRaw`SELECT 1 as health`;
    const isDatabaseHealthy = Array.isArray(dbCheck) && dbCheck.length > 0;

    // Get basic stats
    const blockCount = await db.block.count();
    const transactionCount = await db.transaction.count();

    // Get latest block to check if indexer is working
    const latestBlock = await db.block.findFirst({
      orderBy: { number: 'desc' }
    });

    const now = new Date();
    const isIndexerHealthy = latestBlock 
      ? (now.getTime() - latestBlock.timestamp.getTime()) < 300000 // Less than 5 minutes old
      : false;

    const healthData = {
      status: isDatabaseHealthy && isIndexerHealthy ? 'healthy' : 'degraded',
      timestamp: now.toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      services: {
        database: isDatabaseHealthy,
        indexer: isIndexerHealthy
      },
      stats: {
        totalBlocks: blockCount,
        totalTransactions: transactionCount,
        latestBlock: latestBlock ? {
          number: latestBlock.number.toString(),
          timestamp: latestBlock.timestamp.toISOString(),
          age: Math.floor((now.getTime() - latestBlock.timestamp.getTime()) / 1000)
        } : null
      }
    };

    const statusCode = healthData.status === 'healthy' ? 200 : 503;

    return NextResponse.json({
      success: true,
      data: healthData
    }, { status: statusCode });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        services: {
          database: false,
          indexer: false
        },
        error: 'Health check failed'
      }
    }, { status: 503 });
  }
}