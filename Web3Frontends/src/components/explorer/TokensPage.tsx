'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Download, TrendingUp, TrendingDown, 
  ExternalLink, Users, Globe, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holders: number;
  transfers: number;
  price: string;
  marketCap: string;
  change24h: number;
  volume24h: string;
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  verified: boolean;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ERC20' | 'ERC721' | 'ERC1155'>('all');
  const [sortBy, setSortBy] = useState<'marketCap' | 'holders' | 'transfers'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock tokens
        const tokenNames = [
          'Yafa Token', 'USD Coin', 'Wrapped Ether', 'Dai Stablecoin', 'Chainlink Token',
          'Uniswap', 'Aave Token', 'Compound', 'Maker', 'Polygon', 'The Graph',
          'SushiSwap', '1inch Token', 'Balancer', 'Yearn Finance', 'Curve DAO Token'
        ];
        
        const tokenSymbols = [
          'YAFA', 'USDC', 'WETH', 'DAI', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR', 
          'MATIC', 'GRT', 'SUSHI', '1INCH', 'BAL', 'YFI', 'CRV'
        ];

        const mockTokens: Token[] = Array.from({ length: 50 }, (_, i) => ({
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          name: tokenNames[i % tokenNames.length],
          symbol: tokenSymbols[i % tokenSymbols.length],
          decimals: 18,
          totalSupply: (Math.random() * 1000000000).toFixed(0),
          holders: Math.floor(Math.random() * 50000) + 1000,
          transfers: Math.floor(Math.random() * 1000000) + 10000,
          price: (Math.random() * 1000).toFixed(4),
          marketCap: `${(Math.random() * 500).toFixed(1)}M`,
          change24h: (Math.random() - 0.5) * 20, // -10% to +10%
          volume24h: `${(Math.random() * 100).toFixed(1)}M`,
          type: ['ERC20', 'ERC721', 'ERC1155'][Math.floor(Math.random() * 3)] as any,
          verified: Math.random() > 0.3 // 70% verified
        }));
        
        setTokens(mockTokens);
        
      } catch (error) {
        console.error('Failed to fetch tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatPercentage = (change: number) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    
    return (
      <div className={`flex items-center space-x-1 ${
        isPositive ? 'text-green-400' : 
        isNegative ? 'text-red-400' : 'text-gray-400'
      }`}>
        {isPositive ? <ArrowUp className="w-3 h-3" /> : 
         isNegative ? <ArrowDown className="w-3 h-3" /> : 
         <Minus className="w-3 h-3" />}
        <span className="text-xs font-medium">{Math.abs(change).toFixed(2)}%</span>
      </div>
    );
  };

  const handleSort = (field: 'marketCap' | 'holders' | 'transfers') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredTokens = tokens.filter(token => {
    if (typeFilter !== 'all' && token.type !== typeFilter) return false;
    if (searchQuery && !token.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !token.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold title-gradient mb-2">
                Tokens
              </h1>
              <p className="text-green-500/70">Explore tokens and contracts on the YAFA L2 network</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="form-button-secondary">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <button className="form-button-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total Tokens', value: '2,456', icon: Globe },
              { label: 'Total Holders', value: '124K+', icon: Users },
              { label: 'Total Market Cap', value: '$1.2B', icon: TrendingUp },
              { label: '24h Volume', value: '$45.6M', icon: TrendingUp }
            ].map((stat, index) => (
              <div key={index} className="explorer-card">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-100 font-semibold text-lg">{stat.value}</p>
                    <p className="text-green-500/70 text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="explorer-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tokens..."
                  className="form-input pl-10 w-64"
                />
              </div>
              
              <div>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="form-input w-32"
                >
                  <option value="all">All Types</option>
                  <option value="ERC20">ERC20</option>
                  <option value="ERC721">ERC721</option>
                  <option value="ERC1155">ERC1155</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-green-500/70">
              Showing {filteredTokens.length} tokens
            </div>
          </div>
        </div>

        {/* Tokens Table */}
        <div className="explorer-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/50 border-b border-green-500/20">
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    24h Change
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300 transition-colors"
                    onClick={() => handleSort('marketCap')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Market Cap</span>
                      {sortBy === 'marketCap' && (
                        <span className="text-green-300">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    24h Volume
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300 transition-colors"
                    onClick={() => handleSort('holders')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Holders</span>
                      {sortBy === 'holders' && (
                        <span className="text-green-300">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Contract
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="skeleton h-4 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  filteredTokens.map((token, index) => (
                    <tr key={token.address} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-100 font-semibold">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                            <span className="text-green-400 font-bold text-xs">{token.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-green-100 font-semibold">{token.symbol}</p>
                              {token.verified && (
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                              <span className={`badge-${
                                token.type === 'ERC20' ? 'success' : 
                                token.type === 'ERC721' ? 'info' : 'warning'
                              }`}>
                                {token.type}
                              </span>
                            </div>
                            <p className="text-green-500/70 text-sm">{token.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-100 font-medium">${token.price}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPercentage(token.change24h)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-100 font-medium">${token.marketCap}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-100">${token.volume24h}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-100">{formatNumber(token.holders)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/token/${token.address}`}
                            className="text-green-400 hover:text-green-300 font-mono text-sm transition-colors"
                          >
                            {truncateHash(token.address)}
                          </Link>
                          <button 
                            onClick={() => navigator.clipboard.writeText(token.address)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}