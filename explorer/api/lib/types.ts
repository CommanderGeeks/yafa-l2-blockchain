// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Database models (matching Prisma schema)
export interface Block {
  id: string;
  number: bigint;
  hash: string;
  parentHash: string;
  nonce: string;
  timestamp: Date;
  gasUsed: string;
  gasLimit: string;
  difficulty?: string;
  totalDifficulty?: string;
  size?: string;
  miner: string;
  baseFeePerGas?: string;
  extraData?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  hash: string;
  blockNumber: bigint;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to?: string;
  value: string;
  gas: string;
  gasUsed?: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce: bigint;
  input: string;
  status: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Log {
  id: string;
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;
  address: string;
  topics: string[];
  data: string;
  removed: boolean;
  createdAt: Date;
}

export interface Address {
  id: string;
  address: string;
  balance: string;
  nonce: bigint;
  code?: string;
  isContract: boolean;
  contractName?: string;
  firstSeen: Date;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Token {
  id: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  type: TokenType;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenTransfer {
  id: string;
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;
  tokenAddress: string;
  from: string;
  to: string;
  value: string;
  createdAt: Date;
}

export interface SyncStatus {
  id: string;
  currentBlock: bigint;
  isSyncing: boolean;
  lastSyncTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChainStats {
  id: string;
  totalBlocks: bigint;
  totalTransactions: bigint;
  totalAddresses: bigint;
  totalContracts: bigint;
  averageBlockTime: number;
  networkHashrate?: string;
  updatedAt: Date;
}

// Enums
export enum TokenType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155'
}

export enum TransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending'
}

// API request/response types
export interface BlocksRequest {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
}

export interface BlocksResponse {
  blocks: Block[];
}

export interface TransactionsRequest {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
  blockNumber?: string;
  address?: string;
  sort?: 'asc' | 'desc';
}

export interface TransactionsResponse {
  transactions: Transaction[];
}

export interface AddressRequest {
  include?: string[]; // ['transactions', 'tokens', 'contracts']
}

export interface AddressResponse {
  address: Address;
  transactionCount?: number;
  sentTransactions?: number;
  receivedTransactions?: number;
  tokenBalances?: TokenBalance[];
  recentTransactions?: Transaction[];
}

export interface TokenRequest {
  include?: string[]; // ['transfers', 'holders', 'price']
}

export interface TokenResponse {
  token: Token;
  transferCount?: number;
  holdersCount?: number;
  recentTransfers?: TokenTransfer[];
  topHolders?: TokenHolder[];
  priceData?: TokenPriceData;
}

export interface SearchRequest {
  query: string;
  type?: 'auto' | 'block' | 'transaction' | 'address' | 'token';
}

export interface SearchResponse {
  type: 'block' | 'transaction' | 'address' | 'token';
  data: Block | Transaction | Address | Token;
}

export interface StatsResponse {
  latestBlock: {
    number: string;
    hash: string;
    timestamp: string;
    transactionCount: number;
    gasUsed: string;
    gasLimit: string;
    utilization: number;
  };
  network: {
    averageBlockTime: number;
    averageGasPrice: string;
    networkUtilization: number;
    hashrate?: string;
  };
  transactions: {
    total: string;
    last24h: number;
    successRate: number;
  };
  blocks: {
    total: string;
    last24h: number;
  };
  addresses: {
    total: number;
    contracts: number;
  };
}

// Helper types
export interface TokenBalance {
  tokenAddress: string;
  balance: string;
  token?: {
    name: string;
    symbol: string;
    decimals: number;
    type: TokenType;
  };
}

export interface TokenHolder {
  rank: number;
  address: string;
  balance: string;
  percentage: string;
}

export interface TokenPriceData {
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated?: Date;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  additionalData?: Record<string, any>;
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  database: boolean;
  indexer: boolean;
  rpc: boolean;
  websocket: boolean;
  version: string;
  uptime: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: string;
}

export interface NewBlockMessage extends WebSocketMessage {
  type: 'new_block';
  payload: {
    number: string;
    hash: string;
    timestamp: string;
    transactionCount: number;
    gasUsed: string;
    gasLimit: string;
    miner: string;
  };
}

export interface NewTransactionMessage extends WebSocketMessage {
  type: 'new_transaction';
  payload: {
    hash: string;
    blockNumber: string;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
    status: string;
  };
}

export interface StatsUpdateMessage extends WebSocketMessage {
  type: 'stats_update';
  payload: StatsResponse;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
}

export interface NotFoundError extends ApiError {
  code: 'NOT_FOUND';
  resource: string;
  identifier: string;
}

export interface RateLimitError extends ApiError {
  code: 'RATE_LIMIT_EXCEEDED';
  retryAfter: number;
}

// Utility types
export type SortOrder = 'asc' | 'desc';
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';
export type ChartType = 'line' | 'bar' | 'area';

// Configuration types
export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
}

export interface IndexerConfig {
  rpcUrl: string;
  wsUrl?: string;
  pollInterval: number;
  batchSize: number;
  reorgDepth: number;
  startBlock: number;
}

export interface ServerConfig {
  port: number;
  host: string;
  cors: {
    origins: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}