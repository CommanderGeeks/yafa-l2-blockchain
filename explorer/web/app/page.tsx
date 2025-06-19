'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, Clock, Zap, TrendingUp, Users, Layers, 
  ArrowRight, Search, Globe, Database, Shield, Cpu
} from 'lucide-react';

interface NetworkStats {
  latestBlock: number;
  totalTransactions: number;
  totalAddresses: number;
  avgBlockTime: number;
  currentTPS: number;
  gasPrice: number;
  networkStatus: 'healthy' | 'degraded' | 'down';
}

interface RecentBlock {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  gasUsed: string;
  miner: string;
}

interface RecentTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'success' | 'failed';
}

export default function HomePage() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<RecentBlock[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with real API calls
        setStats({
          latestBlock: 1247589,
          totalTransactions: 5847392,
          totalAddresses: 98742,
          avgBlockTime: 12.3,
          currentTPS: 45.7,
          gasPrice: 25,
          networkStatus: 'healthy'
        });

        setRecentBlocks(Array.from({ length: 6 }, (_, i) => ({
          number: 1247589 - i,
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: Date.now() - (i * 12000),
          transactions: Math.floor(Math.random() * 50) + 10,
          gasUsed: `${(Math.random() * 8000000 + 2000000).toFixed(0)}`,
          miner: `0x${Math.random().toString(16).substr(2, 40)}`
        })));

        setRecentTransactions(Array.from({ length: 8 }, (_, i) => ({
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          from: `0x${Math.random().toString(16).substr(2, 40)}`,
          to: `0x${Math.random().toString(16).substr(2, 40)}`,
          value: (Math.random() * 10).toFixed(4),
          timestamp: Date.now() - (i * 8000),
          status: Math.random() > 0.1 ? 'success' : 'failed'
        })));

      } catch (err) {
        setError('Failed to fetch explorer data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              YAFA L2 Explorer
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-green-500/80 mb-8 max-w-3xl mx-auto">
            Real-time blockchain explorer for the YAFA Layer 2 network. 
            Track transactions, explore blocks, and monitor network activity.
          </p>
          
          {/* Quick Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500/50 w-6 h-6" />
              <input
                type="text"
                placeholder="Search blocks, transactions, addresses..."
                className="w-full bg-gray-900/50 backdrop-blur-sm border-2 border-green-500/30 rounded-2xl pl-14 pr-6 py-4 text-lg text-green-100 placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all">
                Search
              </button>
            </div>
            <p className="text-green-500/60 text-sm mt-2">
              Search by block number, transaction hash, or address
            </p>
          </div>
        </div>
      </section>

      {/* Network Status */}
      {error ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-red-900/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Connection Error</h3>
            <p className="text-red-300/70">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
            >
              Retry Connection
            </button>
          </div>
        </section>
      ) : loading ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl mb-4"></div>
                <div className="h-8 bg-green-500/20 rounded mb-2"></div>
                <div className="h-4 bg-green-500/10 rounded"></div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          {/* Network Stats */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: 'Latest Block', 
                  value: formatNumber(stats?.latestBlock || 0), 
                  icon: Layers, 
                  trend: '+1.2%',
                  color: 'blue'
                },
                { 
                  label: 'Total Transactions', 
                  value: `${Math.floor((stats?.totalTransactions || 0) / 1000000)}M+`, 
                  icon: Activity, 
                  trend: '+5.8%',
                  color: 'green'
                },
                { 
                  label: 'Active Addresses', 
                  value: `${Math.floor((stats?.totalAddresses || 0) / 1000)}K+`, 
                  icon: Users, 
                  trend: '+2.1%',
                  color: 'purple'
                },
                { 
                  label: 'Current TPS', 
                  value: stats?.currentTPS?.toFixed(1) || '0', 
                  icon: Zap, 
                  trend: '+0.5%',
                  color: 'yellow'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:bg-gray-900/60 hover:border-green-400/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-green-400 text-sm font-medium bg-green-500/10 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-green-100 mb-1">{stat.value}</h3>
                  <p className="text-green-500/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Network Health */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-green-100 flex items-center space-x-2">
                  <Globe className="w-6 h-6 text-green-400" />
                  <span>Network Health</span>
                </h2>
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">All Systems Operational</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Indexer', status: 'Syncing blocks', progress: 100, icon: Database },
                  { name: 'API', status: 'Serving data', progress: 100, icon: Cpu },
                  { name: 'WebSocket', status: 'Real-time updates', progress: 100, icon: Activity }
                ].map((service, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <service.icon className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-100 mb-2">{service.name}</h3>
                    <p className="text-green-500/70 text-sm mb-3">{service.status}</p>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${service.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-green-400 text-sm mt-2 font-medium">{service.progress}%</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Blocks */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-green-100 flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-green-400" />
                    <span>Latest Blocks</span>
                  </h3>
                  <Link 
                    href="/blocks" 
                    className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {recentBlocks.slice(0, 6).map((block) => (
                    <Link 
                      key={block.number} 
                      href={`/block/${block.number}`}
                      className="block bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-4 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center">
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
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-green-100 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span>Latest Transactions</span>
                  </h3>
                  <Link 
                    href="/transactions" 
                    className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {recentTransactions.slice(0, 8).map((tx) => (
                    <Link 
                      key={tx.hash} 
                      href={`/tx/${tx.hash}`}
                      className="block bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-4 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            tx.status === 'success' ? 'bg-green-400' : 'bg-red-400'
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
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Bridge Assets', href: '/bridge', icon: '🌉', desc: 'Transfer between chains' },
                { name: 'Swap Tokens', href: '/swap', icon: '🔄', desc: 'Trade tokens instantly' },
                { name: 'Provide Liquidity', href: '/pools', icon: '💧', desc: 'Earn fees from trading' },
                { name: 'Analytics', href: '/analytics', icon: '📈', desc: 'View market data' }
              ].map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:bg-gray-900/60 hover:border-green-400/40 transition-all duration-300 group text-center"
                >
                  <div className="text-4xl mb-4">{link.icon}</div>
                  <h3 className="text-lg font-bold text-green-100 mb-2">{link.name}</h3>
                  <p className="text-green-500/70 text-sm">{link.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}