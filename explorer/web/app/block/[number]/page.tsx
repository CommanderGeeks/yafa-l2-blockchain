'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, Filter, Download, Layers, Clock, Activity, Users, Zap } from 'lucide-react';

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
  parentHash: string;
  reward: string;
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'number' | 'timestamp' | 'transactions'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterMinTx, setFilterMinTx] = useState('');
  const [filterMaxTx, setFilterMaxTx] = useState('');
  
  const blocksPerPage = 25;

  // Mock data - replace with real API calls
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
            parentHash: `0x${Math.random().toString(16).substr(2, 64)}`,
            reward: (Math.random() * 5 + 2).toFixed(4)
          };
        });
        
        setBlocks(mockBlocks);
        setTotalPages(Math.ceil(1247589 / blocksPerPage)); // Mock total pages
        
      } catch (error) {
        console.error('Failed to fetch blocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [currentPage, sortBy, sortOrder]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeAgo = (timestamp: number) => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    if (/^\d+$/.test(searchQuery)) {
      window.location.href = `/block/${searchQuery}`;
    } else {
      alert('Please enter a valid block number');
    }
  };

  const handleSort = (field: 'number' | 'timestamp' | 'transactions') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredBlocks = blocks.filter(block => {
    if (filterMinTx && block.transactions < parseInt(filterMinTx)) return false;
    if (filterMaxTx && block.transactions > parseInt(filterMaxTx)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-20 bg-gray-900/60 backdrop-blur-xl border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform">
                  <span className="text-black font-bold text-xl">Y</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  YAFA Explorer
                </h1>
                <p className="text-green-500/70 text-sm font-medium">L2 Block Explorer</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500/50 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by block number..."
                  className="w-full bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-xl pl-12 pr-4 py-3 text-green-100 placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                />
              </form>
            </div>

            {/* Network Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
              
              <div className="hidden lg:block text-right">
                <p className="text-green-400 text-sm font-semibold">Yafa L2</p>
                <p className="text-green-500/70 text-xs">Chain ID: 42069</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-green-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 py-4">
              {[
                { name: 'Explorer', href: '/', icon: Search },
                { name: 'Blocks', href: '/blocks', icon: Layers, active: true },
                { name: 'Transactions', href: '/transactions', icon: Activity },
                { name: 'Tokens', href: '/tokens', icon: Users },
                { name: 'Stats', href: '/stats', icon: Zap }
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 transition-colors group ${
                    item.active 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-green-500/70 hover:text-green-400'
                  }`}
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                Blocks
              </h1>
              <p className="text-green-500/70">Browse and explore blocks on the YAFA L2 network</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-800/50 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg hover:bg-gray-800/70 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-gray-800/50 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg hover:bg-gray-800/70 transition-all">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Latest Block', value: formatNumber(1247589), icon: Layers },
              { label: 'Avg Block Time', value: '12.3s', icon: Clock },
              { label: 'Total Transactions', value: '5.8M+', icon: Activity },
              { label: 'Network Hash Rate', value: '245 TH/s', icon: Zap }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-100 font-semibold">{stat.value}</p>
                    <p className="text-green-500/70 text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-100 mb-4">Filter Blocks</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Min Transactions</label>
                <input
                  type="number"
                  value={filterMinTx}
                  onChange={(e) => setFilterMinTx(e.target.value)}
                  className="w-full bg-gray-800/50 border border-green-500/30 rounded-lg px-3 py-2 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Max Transactions</label>
                <input
                  type="number"
                  value={filterMaxTx}
                  onChange={(e) => setFilterMaxTx(e.target.value)}
                  className="w-full bg-gray-800/50 border border-green-500/30 rounded-lg px-3 py-2 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  placeholder="1000"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterMinTx('');
                    setFilterMaxTx('');
                  }}
                  className="w-full bg-gray-800/50 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg hover:bg-gray-800/70 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blocks Table */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl overflow-hidden">
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
                          <div className="h-4 bg-gray-800/50 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  filteredBlocks.map((block) => (
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
                        <div>
                          <p>{formatTimeAgo(block.timestamp)}</p>
                          <p className="text-green-500/70 text-xs">{formatTime(block.timestamp)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
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
                          <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-green-400 h-1.5 rounded-full" 
                              style={{ width: `${getGasUsagePercentage(block.gasUsed, block.gasLimit)}%` }}
                            ></div>
                          </div>
                          <p className="text-green-500/70 text-xs">
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
              className="flex items-center space-x-1 px-3 py-2 bg-gray-800/50 border border-green-500/30 text-green-400 rounded-lg hover:bg-gray-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Previous</span>
            </button>
            
            <div className="flex items-center space-x-1">
              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      currentPage === pageNum
                        ? 'bg-green-400 text-black font-semibold'
                        : 'bg-gray-800/50 border border-green-500/30 text-green-400 hover:bg-gray-800/70'
                    }`}
                  >
                    {formatNumber(pageNum)}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-green-500/70">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-2 bg-gray-800/50 border border-green-500/30 text-green-400 rounded-lg hover:bg-gray-800/70 transition-all text-sm"
                  >
                    {formatNumber(totalPages)}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-800/50 border border-green-500/30 text-green-400 rounded-lg hover:bg-gray-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 bg-gray-900/60 backdrop-blur-xl border-t border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold">Y</span>
                </div>
                <h4 className="text-green-400 font-semibold">YAFA Explorer</h4>
              </div>
              <p className="text-green-500/70 text-sm">
                Real-time blockchain explorer for the YAFA Layer 2 network. 
                Track transactions, explore blocks, and monitor network activity.
              </p>
            </div>
            
            <div>
              <h4 className="text-green-400 font-semibold mb-4">Explorer</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">Home</Link>
                <Link href="/blocks" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">Latest Blocks</Link>
                <Link href="/transactions" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">Transactions</Link>
                <Link href="/stats" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">Statistics</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-green-400 font-semibold mb-4">Resources</h4>
              <div className="space-y-2">
                <a href="#" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">Documentation</a>
                <a href="#" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">GitHub</a>
                <a href="#" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">Official Site</a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-green-500/20 flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-500/60 text-sm">© 2024 YAFA Explorer. Powered by YAFA Technology.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-500/70 text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, rgba(34, 197, 94, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to));
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}