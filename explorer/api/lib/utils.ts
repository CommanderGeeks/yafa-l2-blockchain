import { NextRequest } from 'next/server';
import { ApiResponse, PaginationInfo, ApiError } from './types';

// Response helpers
export function createSuccessResponse<T>(
  data: T, 
  pagination?: PaginationInfo
): ApiResponse<T> {
  return {
    success: true,
    data,
    pagination
  };
}

export function createErrorResponse(
  error: string | ApiError,
  statusCode?: number
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: typeof error === 'string' ? error : error.message
  };
}

// Pagination helpers
export function parsePaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

export function createPaginationInfo(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
}

// Validation helpers
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export function isValidBlockNumber(blockNumber: string): boolean {
  return /^\d+$/.test(blockNumber) && parseInt(blockNumber) >= 0;
}

export function isValidHexString(str: string): boolean {
  return /^0x[a-fA-F0-9]*$/.test(str);
}

// Data transformation helpers
export function formatBlockForApi(block: any) {
  return {
    number: block.number.toString(),
    hash: block.hash,
    parentHash: block.parentHash,
    timestamp: block.timestamp.toISOString(),
    gasUsed: block.gasUsed,
    gasLimit: block.gasLimit,
    gasUsedPercent: block.gasLimit 
      ? ((BigInt(block.gasUsed) * BigInt(100)) / BigInt(block.gasLimit)).toString()
      : '0',
    miner: block.miner,
    difficulty: block.difficulty || '0',
    totalDifficulty: block.totalDifficulty || '0',
    size: block.size || '0',
    transactionCount: block._count?.transactions || 0,
    age: Math.floor((Date.now() - block.timestamp.getTime()) / 1000)
  };
}

export function formatTransactionForApi(tx: any) {
  const age = Math.floor((Date.now() - tx.timestamp.getTime()) / 1000);
  
  // Extract method from input data
  let method = 'Transfer';
  if (tx.input && tx.input !== '0x' && tx.input.length >= 10) {
    const methodSignature = tx.input.slice(0, 10);
    method = getMethodName(methodSignature);
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
}

export function formatAddressForApi(address: any) {
  return {
    address: address.address,
    balance: address.balance,
    nonce: address.nonce.toString(),
    isContract: address.isContract,
    contractName: address.contractName,
    code: address.code,
    firstSeen: address.firstSeen.toISOString(),
    lastSeen: address.lastSeen.toISOString()
  };
}

export function formatTokenForApi(token: any) {
  return {
    address: token.address,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    totalSupply: token.totalSupply,
    type: token.type,
    createdAt: token.createdAt.toISOString()
  };
}

// Method signature mapping
export function getMethodName(methodSignature: string): string {
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
    '0xe8e33700': 'Add Liquidity',
    '0xba087652': 'Remove Liquidity',
    '0x022c0d9f': 'Swap',
    '0x12aa3caf': 'Collect',
    '0x414bf389': 'Exact Input Single',
    '0xc04b8d59': 'Exact Input',
    '0xdb3e2198': 'Exact Output Single',
    '0xf28c0498': 'Exact Output',
    '0xac9650d8': 'Multicall',
    '0x5ae401dc': 'Multicall With Deadline'
  };
  
  return methodMap[methodSignature] || methodSignature;
}

// Log event decoding
export function decodeLogEvent(log: any) {
  try {
    // ERC20 Transfer event: Transfer(address,address,uint256)
    if (log.topics.length === 3 && log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
      return {
        event: 'Transfer',
        from: '0x' + log.topics[1].slice(26),
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

    // ERC721 Transfer event: Transfer(address,address,uint256)
    if (log.topics.length === 4 && log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
      return {
        event: 'NFT Transfer',
        from: '0x' + log.topics[1].slice(26),
        to: '0x' + log.topics[2].slice(26),
        tokenId: log.topics[3]
      };
    }

    // Uniswap V2 Swap event
    if (log.topics[0] === '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822') {
      return {
        event: 'Swap',
        rawData: log.data
      };
    }

    // Uniswap V2 Sync event
    if (log.topics[0] === '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1') {
      return {
        event: 'Sync',
        rawData: log.data
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Error handling
export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Database errors
    if (error.message.includes('unique constraint')) {
      return {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists'
      };
    }
    
    if (error.message.includes('foreign key constraint')) {
      return {
        code: 'INVALID_REFERENCE',
        message: 'Referenced resource does not exist'
      };
    }
    
    // Network errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to external service'
      };
    }
    
    // Default error
    return {
      code: 'INTERNAL_ERROR',
      message: error.message
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred'
  };
}

// Rate limiting helpers
export function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `rate_limit:${ip}`;
}

// Cache helpers
export function getCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export function getCacheTTL(type: 'block' | 'transaction' | 'address' | 'stats'): number {
  switch (type) {
    case 'block': return 60; // 1 minute
    case 'transaction': return 300; // 5 minutes
    case 'address': return 180; // 3 minutes
    case 'stats': return 30; // 30 seconds
    default: return 60;
  }
}

// Data conversion helpers
export function bigintToString(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(bigintToString);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = bigintToString(value);
    }
    return converted;
  }
  
  return obj;
}

export function stringToBigint(str: string): bigint {
  try {
    return BigInt(str);
  } catch {
    return BigInt(0);
  }
}

// Search helpers
export function detectSearchType(query: string): 'block' | 'transaction' | 'address' | 'unknown' {
  const trimmed = query.trim();
  
  if (isValidBlockNumber(trimmed)) {
    return 'block';
  }
  
  if (isValidTransactionHash(trimmed)) {
    return 'transaction';
  }
  
  if (isValidAddress(trimmed)) {
    return 'address';
  }
  
  return 'unknown';
}

// Time helpers
export function getTimeRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case '1h':
      start.setHours(end.getHours() - 1);
      break;
    case '6h':
      start.setHours(end.getHours() - 6);
      break;
    case '24h':
      start.setDate(end.getDate() - 1);
      break;
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    default:
      start.setDate(end.getDate() - 1);
  }
  
  return { start, end };
}

// Statistics helpers
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 10000) / 100; // 2 decimal places
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

export function calculateMovingAverage(values: number[], windowSize: number = 10): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(Math.round(average * 100) / 100);
  }
  
  return result;
}

// Environment helpers
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value || defaultValue || '';
}

export function getEnvNumber(name: string, defaultValue?: number): number {
  const value = process.env[name];
  if (!value) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${name} is required`);
    }
    return defaultValue;
  }
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  
  return parsed;
}

export function getEnvBoolean(name: string, defaultValue?: boolean): boolean {
  const value = process.env[name];
  if (!value) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${name} is required`);
    }
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true';
}

// Logging helpers
export function logApiRequest(request: NextRequest, startTime: number, statusCode: number) {
  const duration = Date.now() - startTime;
  const method = request.method;
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method,
    url,
    statusCode,
    duration,
    userAgent
  }));
}

// Health check helpers
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // This would typically use your database client
    // const result = await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function checkRpcHealth(rpcUrl: string): Promise<boolean> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }),
      signal: AbortSignal.timeout(5000)
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

// CORS helpers
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',');
  const isAllowed = !origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
}