// File: src/components/explorer/ExplorerPage.tsx
import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import UnifiedNavigation from '@/components/UnifiedNavigation';
import { Activity, BarChart3, Search, Globe } from 'lucide-react';

interface ChainStats {
  totalBlocks: number;
  totalTransactions: number;
  totalAddresses: number;
  avgBlockTime: number;
  tps: number;
  latestBlock: {
    number: number;
    timestamp: string;
    transactionCount: number;
  };
}

const ExplorerPage = () => {
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError('Failed to fetch stats');
      }
    } catch (err) {
      setError('API connection failed');
      // Generate mock data for demonstration
      setStats({
        totalBlocks: 1234567,
        totalTransactions: 9876543,
        totalAddresses: 456789,
        avgBlockTime: 12.3,
        tps: 847,
        latestBlock: {
          number: 1234567,
          timestamp: new Date().toISOString(),
          transactionCount: 245
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      
      {/* Navigation */}
      <UnifiedNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12 max-w-7xl mx-auto mt-8">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                YAFA L2 Explorer
              </h1>
              <p className="text-green-500/80 text-lg font-medium mt-2">Real-time blockchain explorer for the YAFA Layer 2 network</p>
            </div>
          </div>
          
          <ConnectButton />
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-green-500/60" />
            </div>
            <input
              type="text"
              placeholder="Search by Address / Txn Hash / Block"
              className="block w-full pl-10 pr-3 py-4 border border-green-500/30 rounded-xl bg-gray-900/60 backdrop-blur-xl text-green-400 placeholder-green-500/60 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
          {loading ? (
            <>
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-green-500/20 rounded mb-2"></div>
                  <div className="h-8 bg-green-500/20 rounded mb-2"></div>
                  <div className="h-3 bg-green-500/20 rounded"></div>
                </div>
              ))}
            </>
          ) : error ? (
            <div className="col-span-full">
              <div className="bg-gray-900/40 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 text-center">
                <h3 className="text-red-400 text-lg font-bold mb-2">⚠️ Connection Error</h3>
                <p className="text-green-500/70 mb-4">{error}</p>
                <button 
                  onClick={fetchStats}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg transition-all duration-200"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : stats ? (
            <>
              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-green-500/80 text-sm font-medium tracking-wide uppercase">Latest Block</h3>
                  <span className="text-2xl">📦</span>
                </div>
                <div className="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors mb-2">
                  {formatNumber(stats.latestBlock?.number || 0)}
                </div>
                <p className="text-green-500/60 text-sm">{stats.latestBlock?.transactionCount || 0} transactions</p>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-green-500/80 text-sm font-medium tracking-wide uppercase">Total Transactions</h3>
                  <span className="text-2xl">💸</span>
                </div>
                <div className="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors mb-2">
                  {formatNumber(stats.totalTransactions || 0)}
                </div>
                <p className="text-green-500/60 text-sm">All time</p>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-green-500/80 text-sm font-medium tracking-wide uppercase">Active Addresses</h3>
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors mb-2">
                  {formatNumber(stats.totalAddresses || 0)}
                </div>
                <p className="text-green-500/60 text-sm">Unique addresses</p>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-green-500/80 text-sm font-medium tracking-wide uppercase">Network TPS</h3>
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors mb-2">
                  {stats.tps?.toString() || '0'}
                </div>
                <p className="text-green-500/60 text-sm">Avg: {stats.avgBlockTime}s blocks</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-7xl mx-auto">
          <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 group cursor-pointer hover:border-green-400/40 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-400">Network Stats</h3>
                <p className="text-green-500/70 text-sm">View detailed analytics</p>
              </div>
            </div>
            <p className="text-green-500/60 text-sm">
              Comprehensive network performance metrics and historical data
            </p>
          </div>

          <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 group cursor-pointer hover:border-green-400/40 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-400">Advanced Search</h3>
                <p className="text-green-500/70 text-sm">Find anything on-chain</p>
              </div>
            </div>
            <p className="text-green-500/60 text-sm">
              Search for blocks, transactions, addresses, and tokens
            </p>
          </div>

          <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 group cursor-pointer hover:border-green-400/40 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-400">Live Updates</h3>
                <p className="text-green-500/70 text-sm">Real-time notifications</p>
              </div>
            </div>
            <p className="text-green-500/60 text-sm">
              Get notified of new blocks and transactions as they happen
            </p>
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-green-400">
                Network Status
              </h3>
            </div>
            <div className="text-green-400 text-sm font-medium">
              All Systems Operational
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
              <h4 className="text-green-400 font-semibold mb-1">Indexer</h4>
              <p className="text-green-500/70 text-sm">Syncing blocks</p>
              <p className="text-green-400 text-xs mt-1">Block #{stats?.latestBlock?.number || 0}</p>
            </div>
            
            <div className="text-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
              <h4 className="text-green-400 font-semibold mb-1">API</h4>
              <p className="text-green-500/70 text-sm">Serving data</p>
              <p className="text-green-400 text-xs mt-1">200ms avg response</p>
            </div>
            
            <div className="text-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
              <h4 className="text-green-400 font-semibold mb-1">Database</h4>
              <p className="text-green-500/70 text-sm">Online</p>
              <p className="text-green-400 text-xs mt-1">3ms query time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorerPage;