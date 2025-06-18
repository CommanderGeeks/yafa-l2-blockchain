// API client for YAFA Explorer
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Block {
  number: string;
  hash: string;
  parentHash: string;
  timestamp: string;
  gasUsed: string;
  gasLimit: string;
  gasUsedPercent: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  size: string;
  transactionCount: number;
  transactions?: Transaction[];
}

export interface Transaction {
  hash: string;
  blockNumber: string;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasUsed: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce: string;
  input: string;
  status: string;
  timestamp: string;
  age: number;
  method?: string;
  logs?: Log[];
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: number;
  removed: boolean;
}

export interface Address {
  address: string;
  balance: string;
  nonce: string;
  code?: string;
  isContract: boolean;
  contractName?: string;
  transactionCount: number;
  firstSeen: string;
  lastSeen: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  holders?: number;
}

export interface ChainStats {
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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Blocks API
  async getBlocks(page = 1, limit = 10): Promise<ApiResponse<{ blocks: Block[] }>> {
    return this.request(`/api/blocks?page=${page}&limit=${limit}`);
  }

  async getBlock(blockNumber: string | number): Promise<ApiResponse<Block>> {
    return this.request(`/api/blocks/${blockNumber}`);
  }

  async getLatestBlocks(limit = 5): Promise<ApiResponse<{ blocks: Block[] }>> {
    return this.request(`/api/blocks?limit=${limit}`);
  }

  // Transactions API
  async getTransactions(page = 1, limit = 10): Promise<ApiResponse<{ transactions: Transaction[] }>> {
    return this.request(`/api/txs?page=${page}&limit=${limit}`);
  }

  async getTransaction(hash: string): Promise<ApiResponse<Transaction>> {
    return this.request(`/api/txs/${hash}`);
  }

  async getLatestTransactions(limit = 10): Promise<ApiResponse<{ transactions: Transaction[] }>> {
    return this.request(`/api/txs?limit=${limit}`);
  }

  // Address API
  async getAddress(address: string): Promise<ApiResponse<Address>> {
    return this.request(`/api/address/${address}`);
  }

  async getAddressTransactions(
    address: string, 
    page = 1, 
    limit = 10
  ): Promise<ApiResponse<{ transactions: Transaction[] }>> {
    return this.request(`/api/address/${address}/txs?page=${page}&limit=${limit}`);
  }

  async getAddressTokens(address: string): Promise<ApiResponse<{ tokens: Token[] }>> {
    return this.request(`/api/address/${address}/tokens`);
  }

  // Token API
  async getToken(address: string): Promise<ApiResponse<Token>> {
    return this.request(`/api/token/${address}`);
  }

  async getTokenTransfers(
    address: string, 
    page = 1, 
    limit = 10
  ): Promise<ApiResponse<{ transfers: Transaction[] }>> {
    return this.request(`/api/token/${address}/transfers?page=${page}&limit=${limit}`);
  }

  async getTokenHolders(
    address: string, 
    page = 1, 
    limit = 10
  ): Promise<ApiResponse<{ holders: any[] }>> {
    return this.request(`/api/token/${address}/holders?page=${page}&limit=${limit}`);
  }

  // Statistics API
  async getChainStats(): Promise<ApiResponse<ChainStats>> {
    return this.request('/api/stats');
  }

  async getChartData(
    type: 'blocks' | 'transactions' | 'gas' | 'addresses',
    period: '24h' | '7d' | '30d' = '24h'
  ): Promise<ApiResponse<any[]>> {
    return this.request(`/api/stats/charts/${type}?period=${period}`);
  }

  // Search API
  async search(query: string): Promise<ApiResponse<{
    type: 'block' | 'transaction' | 'address' | 'token';
    data: any;
  }>> {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`);
  }

  // Health Check
  async getHealth(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/api/health');
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export individual methods for convenience
export const {
  getBlocks,
  getBlock,
  getLatestBlocks,
  getTransactions,
  getTransaction,
  getLatestTransactions,
  getAddress,
  getAddressTransactions,
  getAddressTokens,
  getToken,
  getTokenTransfers,
  getTokenHolders,
  getChainStats,
  getChartData,
  search,
  getHealth,
} = api;

// Utility functions
export const formatValue = (value: string | number, decimals = 18): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const divisor = Math.pow(10, decimals);
  const formatted = num / divisor;
  
  if (formatted === 0) return '0';
  if (formatted < 0.000001) return '<0.000001';
  if (formatted < 1) return formatted.toFixed(6);
  if (formatted < 1000) return formatted.toFixed(4);
  if (formatted < 1000000) return `${(formatted / 1000).toFixed(2)}K`;
  return `${(formatted / 1000000).toFixed(2)}M`;
};

export const formatHash = (hash: string, length = 10): string => {
  if (!hash) return '';
  const start = length / 2;
  const end = length / 2;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
};

export const formatAge = (timestamp: string | number): string => {
  const now = Date.now();
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp * 1000;
  const diffSeconds = Math.floor((now - time) / 1000);
  
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
};

export const formatGas = (gas: string | number): string => {
  const gasNum = typeof gas === 'string' ? parseInt(gas) : gas;
  if (gasNum >= 1000000) return `${(gasNum / 1000000).toFixed(2)}M`;
  if (gasNum >= 1000) return `${(gasNum / 1000).toFixed(1)}K`;
  return gasNum.toString();
};

export const formatGwei = (wei: string | number): string => {
  const weiNum = typeof wei === 'string' ? parseInt(wei) : wei;
  const gwei = weiNum / 1e9;
  if (gwei < 1) return gwei.toFixed(2);
  return Math.round(gwei).toString();
};