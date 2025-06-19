// TokensPage.tsx - Updated with consistent explorer layout
'use client';

import React, { useState, useEffect } from 'react';
import ExplorerLayout from '@/components/ExplorerLayout';
import { Filter, Download, TrendingUp, Users, Globe, Activity } from 'lucide-react';

interface Token {
  id: number;
  name: string;
  symbol: string;
  type: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  contract: string;
  verified: boolean;
}

const TokensPage = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof Token>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock token data
  const mockTokens: Token[] = [
    {
      id: 1,
      name: 'Yafa Token',
      symbol: 'YAFA',
      type: 'ERC1155',
      price: 306.2761,
      change24h: 7.74,
      marketCap: 333000000,
      volume24h: 26000000,
      holders: 47344,
      contract: '0x163d...36b8',
      verified: true
    },
    {
      id: 2,
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'ERC721',
      price: 392.6454,
      change24h: 8.97,
      marketCap: 119500000,
      volume24h: 14200000,
      holders: 8374,
      contract: '0x5e3c...6729',
      verified: true
    },
    {
      id: 3,
      name: 'Wrapped Ether',
      symbol: 'WETH',
      type: 'ERC1155',
      price: 316.2704,
      change24h: 4.29,
      marketCap: 158700000,
      volume24h: 31300000,
      holders: 22590,
      contract: '0xc656...3468',
      verified: true
    },
    {
      id: 4,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      type: 'ERC721',
      price: 289.8609,
      change24h: -2.80,
      marketCap: 378300000,
      volume24h: 56900000,
      holders: 14061,
      contract: '0x4555...d918',
      verified: true
    },
    {
      id: 5,
      name: 'Chainlink Token',
      symbol: 'LINK',
      type: 'ERC1155',
      price: 650.9758,
      change24h: 6.17,
      marketCap: 400100000,
      volume24h: 57300000,
      holders: 14725,
      contract: '0x537e...532a',
      verified: true
    },
    {
      id: 6,
      name: 'Uniswap',
      symbol: 'UNI',
      type: 'ERC1155',
      price: 861.2423,
      change24h: 2.99,
      marketCap: 448600000,
      volume24h: 81500000,
      holders: 39180,
      contract: '0x8c58...c95f',
      verified: true
    },
    {
      id: 7,
      name: 'Aave',
      symbol: 'AAVE',
      type: 'ERC1155',
      price: 1234.567,
      change24h: -1.45,
      marketCap: 567800000,
      volume24h: 23400000,
      holders: 18234,
      contract: '0x9a8e...4d21',
      verified: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchTokens = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTokens(mockTokens);
      setLoading(false);
    };

    fetchTokens();
  }, []);

  const handleRefresh = () => {
    setTokens([]);
    setLoading(true);
    setTimeout(() => {
      setTokens(mockTokens);
      setLoading(false);
    }, 1000);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatChange = (change: number): JSX.Element => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '↗' : '↘'} {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  const handleSort = (field: keyof Token) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredTokens = tokens
    .filter(token => {
      if (filterType !== 'all' && token.type !== filterType) return false;
      if (searchQuery && !token.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !token.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * multiplier;
      }
      return ((aVal as number) - (bVal as number)) * multiplier;
    });

  const rightContent = (
    <div className="flex items-center space-x-2">
      <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-green-500/30 rounded-lg transition-all duration-200">
        <Filter className="w-5 h-5" aria-hidden="true" />
      </button>
      <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-green-500/30 rounded-lg transition-all duration-200">
        <Download className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <ExplorerLayout
      title="Tokens"
      subtitle="Explore tokens and contracts on the YAFA L2 network"
      showRefresh={true}
      onRefresh={handleRefresh}
      isLoading={loading}
      rightContent={rightContent}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Total Tokens</p>
              <p className="text-2xl font-bold text-green-400">2,456</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Total Holders</p>
              <p className="text-2xl font-bold text-green-400">124K+</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Total Market Cap</p>
              <p className="text-2xl font-bold text-green-400">$1.2B</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">24h Volume</p>
              <p className="text-2xl font-bold text-green-400">$45.6M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-green-100 placeholder-green-500/60 focus:outline-none focus:ring-2 focus:ring-green-400/50"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400/50"
          >
            <option value="all">All Types</option>
            <option value="ERC1155">ERC1155</option>
            <option value="ERC721">ERC721</option>
            <option value="ERC20">ERC20</option>
          </select>
        </div>
        <div className="text-green-500/70 text-sm">
          Showing {filteredTokens.length} tokens
        </div>
      </div>

      {/* Tokens Table */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800/50 border-b border-green-500/20">
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  TOKEN
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300"
                  onClick={() => handleSort('price')}
                >
                  PRICE
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300"
                  onClick={() => handleSort('change24h')}
                >
                  24H CHANGE
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300"
                  onClick={() => handleSort('marketCap')}
                >
                  MARKET CAP ↓
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300"
                  onClick={() => handleSort('volume24h')}
                >
                  24H VOLUME
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300"
                  onClick={() => handleSort('holders')}
                >
                  HOLDERS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  CONTRACT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                // Loading skeleton
                Array(7).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-20 bg-green-500/20 rounded animate-pulse"></div>
                          <div className="h-3 w-16 bg-green-500/20 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredTokens.map((token, index) => (
                  <tr key={token.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500/70">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-400">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-green-100">
                            {token.name}
                          </div>
                          <div className="text-xs text-green-500/70">
                            {token.symbol} • {token.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                      ${token.price.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatChange(token.change24h)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                      {formatNumber(token.marketCap)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                      {formatNumber(token.volume24h)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                      {token.holders.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-400 font-mono">
                          {token.contract}
                        </span>
                        <button className="text-green-500/70 hover:text-green-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
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
    </ExplorerLayout>
  );
};

export default TokensPage;