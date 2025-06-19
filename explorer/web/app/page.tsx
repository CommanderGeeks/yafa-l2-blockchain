'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Activity, Clock, Zap, TrendingUp, Users, Layers, Globe } from 'lucide-react';

interface BlockData {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  gasUsed: string;
  gasLimit: string;
  miner: string;
}

interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
}

interface Stats {
  latestBlock: number;
  totalTransactions: number;
  tps: number;
  avgBlockTime: number;
  totalAddresses: number;
  marketCap: string;
  isConnected: boolean;
}

export default function ExplorerHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [stats, setStats] = useState<Stats>({
    latestBlock: 0,
    totalTransactions: 0,
    tps: 0,
    avgBlockTime: 12,
    totalAddresses: 0,
    marketCap: '0',
    isConnected: false
  });
  const [recentBlocks, setRecentBlocks] = useState<BlockData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demo - replace with real API calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock stats
        setStats({
          latestBlock: 1247589,
          totalTransactions: 5847392,
          tps: 12.5,
          avgBlockTime: 12.3,
          totalAddresses: 98742,
          marketCap: '$2.4M',
          isConnected: true
        });

        // Mock recent blocks
        const mockBlocks: BlockData[] = Array.from({ length: 6 }, (_, i) => ({
          number: 1247589 - i,
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: Date.now() - (i * 12000),
          transactions: Math.floor(Math.random() * 50) + 10,
          gasUsed: `${(Math.random() * 8000000 + 2000000).toFixed(0)}`,
          gasLimit: '10000000',
          miner: `0x${Math.random().toString(16).substr(2, 40)}`
        }));
        setRecentBlocks(mockBlocks);

        // Mock recent transactions
        const mockTxs: TransactionData[] = Array.from({ length: 8 }, (_, i) => ({
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          from: `0x${Math.random().toString(16).substr(2, 40)}`,
          to: `0x${Math.random().toString(16).substr(2, 40)}`,
          value: (Math.random() * 10).toFixed(4),
          gasPrice: `${(Math.random() * 50 + 20).toFixed(2)}`,
          timestamp: Date.now() - (i * 8000),
          status: Math.random() > 0.1 ? 'success' : 'failed'
        }));
        setRecentTransactions(mockTxs);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch explorer data');
        console.error('Explorer fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Detect search type and redirect
    if (/^\d+$/.test(searchQuery)) {
      // Block number
      window.location.href = `/block/${searchQuery}`;
    } else if (/^0x[a-fA-F0-9]{64}$/.test(searchQuery)) {
      // Transaction hash
      window.location.href = `/tx/${searchQuery}`;
    } else if (/^0x[a-fA-F0-9]{40}$/.test(searchQuery)) {
      // Address
      window.location.href = `/address/${searchQuery}`;
    } else {
      alert('Invalid search format. Enter a block number, transaction hash, or address.');
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400">
      {/* Animated Background */}
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
                <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500/50 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search blocks, transactions, addresses..."
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-xl pl-12 pr-4 py-3 text-green-100 placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                  />
                  <div className="absolute inset-0 bg-green-400/5 rounded-xl pointer-events-none opacity-0 transition-opacity"></div>
                </div>
              </form>
            </div>

            {/* Network Status */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                stats.isConnected ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  stats.isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  stats.isConnected ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stats.isConnected ? 'Live' : 'Offline'}
                </span>
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
                { name: 'Blocks', href: '/blocks', icon: Layers },
                { name: 'Transactions', href: '/transactions', icon: Activity },
                { name: 'Tokens', href: '/tokens', icon: Globe },
                { name: 'Stats', href: '/stats', icon: TrendingUp }
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-green-500/70 hover:text-green-400 transition-colors group"
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
            Welcome to YAFA L2 Explorer
          </h2>
          <p className="text-green-500/80 text-lg max-w-2xl mx-auto">
            Real-time blockchain explorer for the YAFA Layer 2 network. 
            Track transactions, explore blocks, and monitor network activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              title: 'Latest Block', 
              value: formatNumber(stats.latestBlock), 
              icon: Layers, 
              trend: '+1.2%',
              color: 'green'
            },
            { 
              title: 'Total Transactions', 
              value: formatNumber(stats.totalTransactions), 
              icon: Activity, 
              trend: '+5.8%',
              color: 'blue'
            },
            { 
              title: 'TPS', 
              value: stats.tps.toString(), 
              icon: Zap, 
              trend: '+0.3%',
              color: 'yellow'
            },
            { 
              title: 'Avg Block Time', 
              value: `${stats.avgBlockTime}s`, 
              icon: Clock, 
              trend: 'stable',
              color: 'purple'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 hover:bg-gray-900/60 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${stat.color}-400/20 to-${stat.color}-600/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stat.trend.includes('+') ? 'bg-green-500/20 text-green-400' : 
                  stat.trend.includes('-') ? 'bg-red-500/20 text-red-400' : 
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-green-100 mb-1">{stat.value}</h3>
              <p className="text-green-500/70 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Blocks */}
          <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-green-100 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-green-400" />
                <span>Latest Blocks</span>
              </h3>
              <Link href="/blocks" className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                View all →
              </Link>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-800/50 rounded-lg p-4 h-16"></div>
                ))
              ) : (
                recentBlocks.slice(0, 6).map((block) => (
                  <Link 
                    key={block.number} 
                    href={`/block/${block.number}`}
                    className="block bg-gray-800/30 hover:bg-gray-800/50 rounded-lg p-4 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                          <span className="text-green-400 font-bold text-sm">{block.number}</span>
                        </div>
                        <div>
                          <p className="text-green-100 font-semibold">Block #{formatNumber(block.number)}</p>
                          <p className="text-green-500/70 text-sm">{block.transactions} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm font-medium">{formatTime(block.timestamp)}</p>
                        <p className="text-green-500/70 text-xs">{truncateHash(block.hash)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-green-100 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span>Latest Transactions</span>
              </h3>
              <Link href="/transactions" className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                View all →
              </Link>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-800/50 rounded-lg p-4 h-16"></div>
                ))
              ) : (
                recentTransactions.slice(0, 8).map((tx) => (
                  <Link 
                    key={tx.hash} 
                    href={`/tx/${tx.hash}`}
                    className="block bg-gray-800/30 hover:bg-gray-800/50 rounded-lg p-4 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          tx.status === 'success' ? 'bg-green-400' : 
                          tx.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                        }`}></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-green-100 font-mono text-sm truncate">{truncateHash(tx.hash)}</p>
                          <p className="text-green-500/70 text-xs">{truncateHash(tx.from)} → {truncateHash(tx.to)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm font-medium">{tx.value} ETH</p>
                        <p className="text-green-500/70 text-xs">{formatTime(tx.timestamp)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Network Health */}
        <div className="mt-12 bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-green-100 mb-6 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-green-400" />
            <span>Network Health</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Indexer', status: 'Syncing blocks', active: true },
              { name: 'API', status: 'Serving data', active: true },
              { name: 'WebSocket', status: 'Real-time updates', active: stats.isConnected }
            ].map((service, index) => (
              <div key={index} className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-3 ${
                  service.active ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <p className="text-green-100 font-semibold">{service.name}</p>
                <p className="text-green-500/70 text-sm">{service.status}</p>
              </div>
            ))}
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