// BlocksPage.tsx - Updated with consistent explorer layout
'use client';

import React, { useState, useEffect } from 'react';
import ExplorerLayout from '@/components/ExplorerLayout';
import { Filter, Download, Activity, Clock, Zap, Layers } from 'lucide-react';

interface Block {
  number: number;
  hash: string;
  timestamp: string;
  miner: string;
  txCount: number;
  gasUsed: string;
  gasLimit: string;
  reward: number;
  size: string;
  utilization: number;
}

const BlocksPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof Block>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock blocks data
  const mockBlocks: Block[] = [
    {
      number: 1247589,
      hash: '0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
      timestamp: '2024-01-15T10:30:45Z',
      miner: '0x1234567890123456789012345678901234567890',
      txCount: 245,
      gasUsed: '14,523,891',
      gasLimit: '15,000,000',
      reward: 2.5,
      size: '67.2 KB',
      utilization: 96.8
    },
    {
      number: 1247588,
      hash: '0xb2c3d4e5f6789012345678901234567890123456789012345678901234567890a1',
      timestamp: '2024-01-15T10:30:30Z',
      miner: '0x2345678901234567890123456789012345678901',
      txCount: 198,
      gasUsed: '12,856,743',
      gasLimit: '15,000,000',
      reward: 2.3,
      size: '58.7 KB',
      utilization: 85.7
    },
    {
      number: 1247587,
      hash: '0xc3d4e5f6789012345678901234567890123456789012345678901234567890a1b2',
      timestamp: '2024-01-15T10:30:15Z',
      miner: '0x3456789012345678901234567890123456789012',
      txCount: 312,
      gasUsed: '14,891,256',
      gasLimit: '15,000,000',
      reward: 2.7,
      size: '72.1 KB',
      utilization: 99.3
    },
    {
      number: 1247586,
      hash: '0xd4e5f6789012345678901234567890123456789012345678901234567890a1b2c3',
      timestamp: '2024-01-15T10:30:00Z',
      miner: '0x4567890123456789012345678901234567890123',
      txCount: 167,
      gasUsed: '11,234,567',
      gasLimit: '15,000,000',
      reward: 2.1,
      size: '51.3 KB',
      utilization: 74.9
    },
    {
      number: 1247585,
      hash: '0xe5f6789012345678901234567890123456789012345678901234567890a1b2c3d4',
      timestamp: '2024-01-15T10:29:45Z',
      miner: '0x5678901234567890123456789012345678901234',
      txCount: 289,
      gasUsed: '13,456,789',
      gasLimit: '15,000,000',
      reward: 2.6,
      size: '65.8 KB',
      utilization: 89.7
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchBlocks = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBlocks(mockBlocks);
      setLoading(false);
    };

    fetchBlocks();
  }, []);

  const handleRefresh = () => {
    setBlocks([]);
    setLoading(true);
    setTimeout(() => {
      setBlocks(mockBlocks);
      setLoading(false);
    }, 1000);
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const truncateHash = (hash: string, start = 8, end = 8) => {
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  };

  const handleSort = (field: keyof Block) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedBlocks = [...blocks].sort((a, b) => {
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
      title="Blocks"
      subtitle="Browse and explore blocks on the YAFA L2 network"
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
              <Layers className="w-5 h-5 text-green-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Latest Block</p>
              <p className="text-2xl font-bold text-green-400">#3.0M</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Avg Block Time</p>
              <p className="text-2xl font-bold text-green-400">11.4s</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-green-400">15.9M</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Network Hash Rate</p>
              <p className="text-2xl font-bold text-green-400">245 TH/s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blocks Table */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800/50 border-b border-green-500/20">
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300 transition-colors"
                  onClick={() => handleSort('number')}
                >
                  Block
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Hash
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300 transition-colors"
                  onClick={() => handleSort('timestamp')}
                >
                  Age
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Miner
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300 transition-colors"
                  onClick={() => handleSort('txCount')}
                >
                  Txns
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Gas Used
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Gas Limit
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300 transition-colors"
                  onClick={() => handleSort('reward')}
                >
                  Reward
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Size
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                // Loading skeleton
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-8 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : (
                sortedBlocks.map((block) => (
                  <tr key={block.number} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                      #{block.number.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-green-400 hover:text-green-300 cursor-pointer transition-colors">
                        {truncateHash(block.hash)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500/70">
                      {formatTimeAgo(block.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-green-400 hover:text-green-300 cursor-pointer transition-colors">
                        {truncateHash(block.miner)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                      {block.txCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                      <div className="flex flex-col">
                        <span>{block.gasUsed}</span>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                          <div 
                            className="bg-green-400 h-1 rounded-full" 
                            style={{ width: `${block.utilization}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500/70">
                      {block.gasLimit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                      {block.reward} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500/70">
                      {block.size}
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

export default BlocksPage;