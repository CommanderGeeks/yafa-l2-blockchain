'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Filter, Download, Clock, Activity, Zap } from 'lucide-react';

interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  gasUsed: string;
  gasLimit: string;
  miner: string;
  difficulty: string;
  size: number;
  reward: string;
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'number' | 'timestamp' | 'transactions'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const blocksPerPage = 25;

  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock blocks
        const mockBlocks: Block[] = Array.from({ length: blocksPerPage }, (_, i) => {
          const blockNumber = 1247589 - ((currentPage - 1) * blocksPerPage) - i;
          return {
            number: blockNumber,
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            timestamp: Date.now() - (i * 12000) - ((currentPage - 1) * blocksPerPage * 12000),
            transactions: Math.floor(Math.random() * 150) + 10,
            gasUsed: `${(Math.random() * 8000000 + 2000000).toFixed(0)}`,
            gasLimit: '10000000',
            miner: `0x${Math.random().toString(16).substr(2, 40)}`,
            difficulty: `${(Math.random() * 1000000 + 100000).toFixed(0)}`,
            size: Math.floor(Math.random() * 50000 + 10000),
            reward: (Math.random() * 5 + 2).toFixed(4)
          };
        });
        
        setBlocks(mockBlocks);
        setTotalPages(Math.ceil(1247589 / blocksPerPage));
        
      } catch (error) {
        console.error('Failed to fetch blocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [currentPage, sortBy, sortOrder]);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getGasUsagePercentage = (used: string, limit: string) => {
    return ((parseInt(used) / parseInt(limit)) * 100).toFixed(1);
  };

  const handleSort = (field: 'number' | 'timestamp' | 'transactions') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold title-gradient mb-2">
                Blocks
              </h1>
              <p className="text-green-500/70">Browse and explore blocks on the YAFA L2 network</p>
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
              { label: 'Latest Block', value: formatNumber(1247589), icon: Activity },
              { label: 'Avg Block Time', value: '12.3s', icon: Clock },
              { label: 'Total Transactions', value: '5.8M+', icon: Activity },
              { label: 'Network Hash Rate', value: '245 TH/s', icon: Zap }
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

        {/* Blocks Table */}
        <div className="explorer-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/50 border-b border-green-500/20">
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300 transition-colors"
                    onClick={() => handleSort('number')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Block</span>
                      {sortBy === 'number' && (
                        <span className="text-green-300">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300 transition-colors"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Age</span>
                      {sortBy === 'timestamp' && (
                        <span className="text-green-300">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider cursor-pointer hover:text-green-300 transition-colors"
                    onClick={() => handleSort('transactions')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Txns</span>
                      {sortBy === 'transactions' && (
                        <span className="text-green-300">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Miner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Gas Used
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Reward
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="skeleton h-4 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  blocks.map((block) => (
                    <tr key={block.number} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/block/${block.number}`}
                          className="text-green-400 hover:text-green-300 font-mono text-sm transition-colors"
                        >
                          {formatNumber(block.number)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                        {formatTime(block.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                        <span className="badge-success">
                          {block.transactions}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                        <Link 
                          href={`/address/${block.miner}`}
                          className="font-mono text-green-400 hover:text-green-300 transition-colors"
                        >
                          {truncateHash(block.miner)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                        <div>
                          <p>{formatNumber(parseInt(block.gasUsed))}</p>
                          <div className="progress-bar mt-1">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: `${getGasUsagePercentage(block.gasUsed, block.gasLimit)}%` }}
                            ></div>
                          </div>
                          <p className="text-green-500/70 text-xs mt-1">
                            {getGasUsagePercentage(block.gasUsed, block.gasLimit)}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                        {formatBytes(block.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                        <span className="text-green-400 font-medium">{block.reward} ETH</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-green-500/70">
            Showing page {currentPage} of {formatNumber(totalPages)} 
            ({formatNumber(blocksPerPage)} blocks per page)
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="form-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      currentPage === pageNum
                        ? 'bg-green-400 text-black font-semibold'
                        : 'form-button-secondary'
                    }`}
                  >
                    {formatNumber(pageNum)}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="form-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}