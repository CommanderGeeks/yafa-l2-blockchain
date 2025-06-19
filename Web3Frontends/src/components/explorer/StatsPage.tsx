// StatsPage.tsx - Updated with consistent explorer layout
'use client';

import React, { useState, useEffect } from 'react';
import ExplorerLayout from '@/components/ExplorerLayout';
import { Download, Activity, BarChart3, Database, Globe, Layers, Users, Zap } from 'lucide-react';

interface NetworkStats {
  totalBlocks: number;
  totalTransactions: number;
  totalAddresses: number;
  avgBlockTime: number;
  tps: number;
  networkHashrate: string;
  difficulty: string;
  chainId: number;
  gasPrice: number;
  networkUtilization: number;
  activeValidators: number;
  totalSupply: string;
}

interface ChartData {
  timestamp: string;
  value: number;
}

const StatsPage = () => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Mock stats data
  const mockStats: NetworkStats = {
    totalBlocks: 3045672,
    totalTransactions: 15934821,
    totalAddresses: 901347,
    avgBlockTime: 11.4,
    tps: 630.0,
    networkHashrate: '245.7 TH/s',
    difficulty: '15.2T',
    chainId: 2024,
    gasPrice: 35.2,
    networkUtilization: 84.7,
    activeValidators: 156,
    totalSupply: '21.0M YAFA'
  };

  // Mock chart data
  const mockChartData: ChartData[] = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    value: Math.random() * 100 + 50
  }));

  useEffect(() => {
    // Simulate API call
    const fetchStats = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
      setLoading(false);
    };

    fetchStats();
  }, [timeframe]);

  const handleRefresh = () => {
    setStats(null);
    setLoading(true);
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const rightContent = (
    <div className="flex items-center space-x-2">
      <select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value as any)}
        className="px-3 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400/50"
      >
        <option value="24h">24 Hours</option>
        <option value="7d">7 Days</option>
        <option value="30d">30 Days</option>
      </select>
      <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-green-500/30 rounded-lg transition-all duration-200">
        <Download className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <ExplorerLayout
      title="Network Statistics"
      subtitle="Comprehensive analytics and performance metrics for the YAFA L2 network"
      showRefresh={true}
      onRefresh={handleRefresh}
      isLoading={loading}
      rightContent={rightContent}
    >
      {loading ? (
        // Loading skeleton
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-green-500/20 rounded"></div>
                      <div className="h-6 w-16 bg-green-500/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Core Network Stats */}
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-6">Core Network Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Layers className="w-5 h-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Total Blocks</p>
                    <p className="text-2xl font-bold text-green-400">{formatNumber(stats?.totalBlocks || 0)}</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  +1,247 in last 24h
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Total Transactions</p>
                    <p className="text-2xl font-bold text-green-400">{formatNumber(stats?.totalTransactions || 0)}</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  +89,234 in last 24h
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Total Addresses</p>
                    <p className="text-2xl font-bold text-green-400">{formatNumber(stats?.totalAddresses || 0)}</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  +2,134 in last 24h
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-orange-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Current TPS</p>
                    <p className="text-2xl font-bold text-green-400">{stats?.tps.toFixed(1)}</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  Peak: 847.3 TPS
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-6">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Avg Block Time</p>
                    <p className="text-2xl font-bold text-green-400">{stats?.avgBlockTime.toFixed(1)}s</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  Target: 12.0s
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Network Hashrate</p>
                    <p className="text-2xl font-bold text-green-400">{stats?.networkHashrate}</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  +5.2% from yesterday
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Difficulty</p>
                    <p className="text-2xl font-bold text-green-400">{stats?.difficulty}</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  Adjusted 2h ago
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-orange-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Gas Price</p>
                    <p className="text-2xl font-bold text-green-400">{stats?.gasPrice} Gwei</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  Standard: 21 Gwei
                </div>
              </div>
            </div>
          </div>

          {/* Network Health */}
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-6">Network Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-green-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-green-500/70 text-sm">Network Utilization</p>
                      <p className="text-2xl font-bold text-green-400">{stats?.networkUtilization.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats?.networkUtilization}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Active Validators</p>
                    <p className="text-2xl font-bold text-green-400">{stats?.activeValidators}</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  98.7% uptime
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500/70 text-sm">Total Supply</p>
                    <p className="text-2xl font-bold text-green-400">{stats?.totalSupply}</p>
                  </div>
                </div>
                <div className="text-xs text-green-500/60">
                  Circulating: 18.9M
                </div>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-6">Transaction Volume ({timeframe})</h2>
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-green-500/50 mx-auto mb-4" />
                  <p className="text-green-500/70">Chart visualization would be implemented here</p>
                  <p className="text-green-500/50 text-sm mt-2">
                    Showing {timeframe} transaction volume trends
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Network Status */}
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-6">Network Status</h2>
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
                  <h4 className="text-green-400 font-semibold mb-1">Blockchain</h4>
                  <p className="text-green-500/70 text-sm">Syncing normally</p>
                  <p className="text-green-400 text-xs mt-1">Block #{stats?.totalBlocks.toLocaleString()}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
                  <h4 className="text-green-400 font-semibold mb-1">Validators</h4>
                  <p className="text-green-500/70 text-sm">All online</p>
                  <p className="text-green-400 text-xs mt-1">{stats?.activeValidators} active</p>
                </div>
                
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
                  <h4 className="text-green-400 font-semibold mb-1">Network</h4>
                  <p className="text-green-500/70 text-sm">Healthy</p>
                  <p className="text-green-400 text-xs mt-1">{stats?.networkUtilization.toFixed(1)}% utilization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ExplorerLayout>
  );
};

// Add Clock import at the top
import { Clock } from 'lucide-react';

export default StatsPage;