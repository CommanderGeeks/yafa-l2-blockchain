// File: pages/pools/all.tsx - Enhanced Version
import React, { useState, useEffect } from 'react';
import EnhancedNavigation from '@/components/UnifiedNavigation';
import dynamic from 'next/dynamic';

// Import icons dynamically to avoid hydration issues
const DynamicDollarSign = dynamic(() => import('lucide-react').then((mod) => mod.DollarSign), { ssr: false });
const DynamicZap = dynamic(() => import('lucide-react').then((mod) => mod.Zap), { ssr: false });
const DynamicDroplets = dynamic(() => import('lucide-react').then((mod) => mod.Droplets), { ssr: false });
const DynamicUsers = dynamic(() => import('lucide-react').then((mod) => mod.Users), { ssr: false });
const DynamicSearch = dynamic(() => import('lucide-react').then((mod) => mod.Search), { ssr: false });
const DynamicFilter = dynamic(() => import('lucide-react').then((mod) => mod.Filter), { ssr: false });
const DynamicExternalLink = dynamic(() => import('lucide-react').then((mod) => mod.ExternalLink), { ssr: false });

interface Pool {
  id: string;
  address: string;
  tokenA: { 
    symbol: string; 
    address: string; 
    logoUrl?: string;
    decimals: number;
    price: number;
  };
  tokenB: { 
    symbol: string; 
    address: string; 
    logoUrl?: string;
    decimals: number;
    price: number;
  };
  tvl: number;
  volume24h: number;
  volume7d: number;
  fees24h: number;
  apr: number;
  apy: number;
  fee: number;
  liquidity: number;
  lpTokens: number;
  reserve0: number;
  reserve1: number;
  poolShare: number;
  priceChange24h: number;
  volumeChange24h: number;
  transactions24h: number;
  uniqueUsers24h: number;
  createdAt: string;
  lastActivity: string;
}

export default function AllPools() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'volume24h' | 'apr' | 'fees24h'>('tvl');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'high-volume' | 'new' | 'stable'>('all');

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    setLoading(true);
    try {
      // In real app, this would be an API call
      // const response = await fetch('/api/pools');
      // const data = await response.json();
      
      // Mock data with comprehensive information
      const mockPools = [
        {
          id: '1',
          address: '0x1234567890123456789012345678901234567890',
          tokenA: { 
            symbol: 'ETH', 
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            logoUrl: '/tokens/default.svg',
            decimals: 18,
            price: 2450.75
          },
          tokenB: { 
            symbol: 'USDC', 
            address: '0xA0b86a33E6441c8e5D8F8B0A0A2E7A2d7b9C7b5e', 
            logoUrl: '/tokens/default.svg',
            decimals: 6,
            price: 1.00
          },
          tvl: 12500000,
          volume24h: 850000,
          volume7d: 5200000,
          fees24h: 2550,
          apr: 12.5,
          apy: 13.2,
          fee: 0.3,
          liquidity: 12500000,
          lpTokens: 1000000,
          reserve0: 5102.5,
          reserve1: 12500000,
          poolShare: 100,
          priceChange24h: 2.4,
          volumeChange24h: 15.8,
          transactions24h: 1247,
          uniqueUsers24h: 389,
          createdAt: '2024-01-15T10:30:00Z',
          lastActivity: '2024-06-19T18:45:00Z'
        },
        {
          id: '2',
          address: '0x9876543210987654321098765432109876543210',
          tokenA: { 
            symbol: 'YAFA', 
            address: '0x9876543210987654321098765432109876543210', 
            logoUrl: '/tokens/default.svg',
            decimals: 18,
            price: 0.125
          },
          tokenB: { 
            symbol: 'ETH', 
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            logoUrl: '/tokens/default.svg',
            decimals: 18,
            price: 2450.75
          },
          tvl: 7500000,
          volume24h: 425000,
          volume7d: 2800000,
          fees24h: 1275,
          apr: 18.2,
          apy: 19.8,
          fee: 0.3,
          liquidity: 7500000,
          lpTokens: 650000,
          reserve0: 60000000,
          reserve1: 3061.2,
          poolShare: 100,
          priceChange24h: -1.2,
          volumeChange24h: 8.7,
          transactions24h: 892,
          uniqueUsers24h: 234,
          createdAt: '2024-02-01T14:20:00Z',
          lastActivity: '2024-06-19T18:42:00Z'
        },
        {
          id: '3',
          address: '0x5555666677778888999900001111222233334444',
          tokenA: { 
            symbol: 'WBTC', 
            address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 
            logoUrl: '/tokens/default.svg',
            decimals: 8,
            price: 67500.00
          },
          tokenB: { 
            symbol: 'ETH', 
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
            logoUrl: '/tokens/default.svg',
            decimals: 18,
            price: 2450.75
          },
          tvl: 3200000,
          volume24h: 180000,
          volume7d: 1100000,
          fees24h: 540,
          apr: 8.7,
          apy: 9.1,
          fee: 0.3,
          liquidity: 3200000,
          lpTokens: 280000,
          reserve0: 47.4,
          reserve1: 1305.5,
          poolShare: 100,
          priceChange24h: 0.8,
          volumeChange24h: -5.2,
          transactions24h: 456,
          uniqueUsers24h: 167,
          createdAt: '2024-03-10T09:15:00Z',
          lastActivity: '2024-06-19T18:38:00Z'
        }
      ];
      
      setPools(mockPools);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch pools:', error);
      setLoading(false);
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedPools = pools
    .filter(pool => {
      const matchesSearch = searchTerm === '' || 
        pool.tokenA.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.tokenB.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filterBy) {
        case 'high-volume':
          return matchesSearch && pool.volume24h > 500000;
        case 'new':
          return matchesSearch && new Date(pool.createdAt) > new Date('2024-05-01');
        case 'stable':
          return matchesSearch && Math.abs(pool.priceChange24h) < 2;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * multiplier;
    });

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (num: number) => {
    const isPositive = num >= 0;
    return (
      <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
        {isPositive ? '+' : ''}{num.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Navigation */}
      <EnhancedNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto mt-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              All Liquidity Pools
            </h1>
            <p className="text-green-500/80 text-lg font-medium mt-2">
              Discover and invest in available liquidity pools
            </p>
          </div>

                      {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <DynamicDollarSign className="w-6 h-6 text-green-400" />
                <span className="text-green-500/70 text-sm font-medium">Total TVL</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                ${pools.reduce((acc, pool) => acc + pool.tvl, 0).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <DynamicZap className="w-6 h-6 text-emerald-400" />
                <span className="text-green-500/70 text-sm font-medium">24h Volume</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                ${pools.reduce((acc, pool) => acc + pool.volume24h, 0).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <DynamicDroplets className="w-6 h-6 text-blue-400" />
                <span className="text-green-500/70 text-sm font-medium">Active Pools</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{pools.length}</p>
            </div>
            
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <DynamicUsers className="w-6 h-6 text-purple-400" />
                <span className="text-green-500/70 text-sm font-medium">24h Users</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {pools.reduce((acc, pool) => acc + pool.uniqueUsers24h, 0)}
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <DynamicSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500/50" />
                <input
                  type="text"
                  placeholder="Search pools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-green-500/30 rounded-xl text-green-400 placeholder-green-500/50 focus:border-green-400 focus:outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <DynamicFilter className="w-5 h-5 text-green-500/70" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="bg-gray-800/50 border border-green-500/30 rounded-lg px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none"
                  >
                    <option value="all">All Pools</option>
                    <option value="high-volume">High Volume</option>
                    <option value="new">New Pools</option>
                    <option value="stable">Stable Pairs</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pool List */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 shadow-2xl shadow-green-500/10">
            
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-7 gap-6 pb-6 border-b border-green-500/20 text-green-500/70 text-sm font-semibold uppercase tracking-wide">
              <div className="col-span-2">Pool</div>
              <div className="text-right cursor-pointer hover:text-green-400 transition-colors" onClick={() => handleSort('tvl')}>
                TVL {sortBy === 'tvl' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className="text-right cursor-pointer hover:text-green-400 transition-colors" onClick={() => handleSort('volume24h')}>
                24h Volume {sortBy === 'volume24h' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className="text-right cursor-pointer hover:text-green-400 transition-colors" onClick={() => handleSort('fees24h')}>
                24h Fees {sortBy === 'fees24h' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className="text-right cursor-pointer hover:text-green-400 transition-colors" onClick={() => handleSort('apr')}>
                APR/APY {sortBy === 'apr' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className="text-right">Action</div>
            </div>

            {/* Pool Rows */}
            <div className="space-y-4 mt-6">
              {/* Debug info */}
              {console.log('Loading:', loading, 'Pools length:', pools.length, 'Filtered length:', filteredAndSortedPools.length)}
              
              {loading ? (
                // Loading skeleton
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-800/20 rounded-2xl p-6 mb-4">
                    <div className="hidden md:grid grid-cols-7 gap-6 items-center">
                      <div className="col-span-2 flex items-center space-x-4">
                        <div className="flex -space-x-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                          <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-5 bg-gray-700 rounded w-24"></div>
                          <div className="h-3 bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                      {Array(5).fill(0).map((_, j) => (
                        <div key={j} className="text-right space-y-2">
                          <div className="h-5 bg-gray-700 rounded w-20 ml-auto"></div>
                          <div className="h-3 bg-gray-700 rounded w-16 ml-auto"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Mobile skeleton */}
                    <div className="md:hidden space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex -space-x-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                          <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-5 bg-gray-700 rounded w-24"></div>
                          <div className="h-3 bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Array(4).fill(0).map((_, k) => (
                          <div key={k} className="space-y-2">
                            <div className="h-3 bg-gray-700 rounded w-16"></div>
                            <div className="h-5 bg-gray-700 rounded w-20"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredAndSortedPools.length === 0 ? (
                // Empty state
                <div className="text-center py-16">
                  <div className="text-6xl mb-6">💧</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-3">No Pools Found</h3>
                  <p className="text-green-500/70 text-lg">Try adjusting your search or filters</p>
                  <p className="text-green-500/50 text-sm mt-2">Total pools: {pools.length}</p>
                </div>
              ) : (
                // Pool list
                filteredAndSortedPools.map((pool) => (
                  <div key={pool.id} className="bg-gray-800/20 hover:bg-gray-800/40 rounded-2xl p-6 mb-4 transition-all duration-300 border border-green-500/10 hover:border-green-500/30 group">
                    
                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-7 gap-6 items-center">
                      
                      {/* Pool Info - Takes 2 columns */}
                      <div className="col-span-2 flex items-center space-x-4">
                        <div className="flex -space-x-3">
                          <img 
                            src="/tokens/default.svg"
                            alt={pool.tokenA.symbol}
                            className="w-12 h-12 rounded-full border-3 border-gray-900 bg-gray-800"
                          />
                          <img 
                            src="/tokens/default.svg"
                            alt={pool.tokenB.symbol}
                            className="w-12 h-12 rounded-full border-3 border-gray-900 bg-gray-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-green-400">
                              {pool.tokenA.symbol}/{pool.tokenB.symbol}
                            </h3>
                            <DynamicExternalLink className="w-4 h-4 text-green-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-green-500/70">
                            <span>{pool.fee}% fee</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <DynamicUsers className="w-3 h-3" />
                              <span>{pool.uniqueUsers24h} users</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TVL */}
                      <div className="text-right space-y-1">
                        <div className="text-xl font-bold text-green-400">
                          {formatNumber(pool.tvl)}
                        </div>
                        <div className="text-sm text-green-500/60">
                          ${pool.liquidity.toLocaleString()}
                        </div>
                      </div>

                      {/* 24h Volume */}
                      <div className="text-right space-y-1">
                        <div className="text-xl font-bold text-green-400">
                          {formatNumber(pool.volume24h)}
                        </div>
                        <div className="text-sm">
                          {formatPercentage(pool.volumeChange24h)}
                        </div>
                      </div>

                      {/* 24h Fees */}
                      <div className="text-right space-y-1">
                        <div className="text-xl font-bold text-emerald-400">
                          {formatNumber(pool.fees24h)}
                        </div>
                        <div className="text-sm text-green-500/60">
                          {pool.transactions24h.toLocaleString()} txns
                        </div>
                      </div>

                      {/* APR/APY */}
                      <div className="text-right space-y-1">
                        <div className="text-xl font-bold text-emerald-400">
                          {pool.apr.toFixed(1)}%
                        </div>
                        <div className="text-sm text-green-500/60">
                          APY: {pool.apy.toFixed(1)}%
                        </div>
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <button 
                          onClick={() => window.location.href = `/pools?tokenA=${pool.tokenA.address}&tokenB=${pool.tokenB.address}`}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                        >
                          Add Liquidity
                        </button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-6">
                      
                      {/* Pool Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex -space-x-3">
                            <img 
                              src="/tokens/default.svg"
                              alt={pool.tokenA.symbol}
                              className="w-12 h-12 rounded-full border-3 border-gray-900 bg-gray-800"
                            />
                            <img 
                              src="/tokens/default.svg"
                              alt={pool.tokenB.symbol}
                              className="w-12 h-12 rounded-full border-3 border-gray-900 bg-gray-800"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-green-400">
                              {pool.tokenA.symbol}/{pool.tokenB.symbol}
                            </h3>
                            <div className="text-sm text-green-500/70">{pool.fee}% fee</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-400">{pool.apr.toFixed(1)}%</div>
                          <div className="text-sm text-green-500/60">APR</div>
                        </div>
                      </div>

                      {/* Pool Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/30 rounded-xl p-4">
                          <div className="text-sm text-green-500/70 mb-1">TVL</div>
                          <div className="text-lg font-bold text-green-400">{formatNumber(pool.tvl)}</div>
                        </div>
                        <div className="bg-gray-900/30 rounded-xl p-4">
                          <div className="text-sm text-green-500/70 mb-1">24h Volume</div>
                          <div className="text-lg font-bold text-green-400">{formatNumber(pool.volume24h)}</div>
                        </div>
                        <div className="bg-gray-900/30 rounded-xl p-4">
                          <div className="text-sm text-green-500/70 mb-1">24h Fees</div>
                          <div className="text-lg font-bold text-emerald-400">{formatNumber(pool.fees24h)}</div>
                        </div>
                        <div className="bg-gray-900/30 rounded-xl p-4">
                          <div className="text-sm text-green-500/70 mb-1">Users</div>
                          <div className="text-lg font-bold text-green-400">{pool.uniqueUsers24h}</div>
                        </div>
                      </div>

                      {/* Mobile Action */}
                      <button 
                        onClick={() => window.location.href = `/pools?tokenA=${pool.tokenA.address}&tokenB=${pool.tokenB.address}`}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                      >
                        Add Liquidity
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pool Details Expanded (Optional) */}
            {filteredAndSortedPools.length > 0 && (
              <div className="mt-8 pt-8 border-t border-green-500/20">
                <div className="text-center text-green-500/60 text-sm">
                  Showing {filteredAndSortedPools.length} of {pools.length} pools
                  {searchTerm && ` matching "${searchTerm}"`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}