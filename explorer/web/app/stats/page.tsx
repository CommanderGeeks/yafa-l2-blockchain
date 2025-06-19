'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Activity, Clock, Zap, TrendingUp, TrendingDown, 
  Users, Layers, Globe, Database, Server, Cpu, 
  BarChart3, PieChart, LineChart, Calendar,
  ArrowUp, ArrowDown, Minus, Download, Refresh
} from 'lucide-react';

interface NetworkStats {
  totalBlocks: number;
  totalTransactions: number;
  totalAddresses: number;
  avgBlockTime: number;
  currentTPS: number;
  peakTPS: number;
  totalValueLocked: string;
  marketCap: string;
  networkHashRate: string;
  activeValidators: number;
  gasPrice: {
    slow: number;
    standard: number;
    fast: number;
  };
}

interface ChartData {
  timestamp: number;
  blocks: number;
  transactions: number;
  gasUsed: number;
  activeAddresses: number;
}

interface TopToken {
  address: string;
  name: string;
  symbol: string;
  holders: number;
  totalSupply: string;
  marketCap: string;
  price: string;
  change24h: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topTokens, setTopTokens] = useState<TopToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'transactions' | 'blocks' | 'gasUsed' | 'activeAddresses'>('transactions');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock network stats
        const mockStats: NetworkStats = {
          totalBlocks: 1247589,
          totalTransactions: 5847392,
          totalAddresses: 98742,
          avgBlockTime: 12.3,
          currentTPS: 45.7,
          peakTPS: 234.5,
          totalValueLocked: '124.5M',
          marketCap: '2.4B',
          networkHashRate: '245.7',
          activeValidators: 21,
          gasPrice: {
            slow: 25,
            standard: 35,
            fast: 50
          }
        };
        
        // Mock chart data
        const mockChartData: ChartData[] = Array.from({ length: 30 }, (_, i) => ({
          timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
          blocks: Math.floor(Math.random() * 7200) + 6000,
          transactions: Math.floor(Math.random() * 50000) + 100000,
          gasUsed: Math.floor(Math.random() * 800000000) + 200000000,
          activeAddresses: Math.floor(Math.random() * 5000) + 8000
        }));
        
        // Mock top tokens
        const mockTokens: TopToken[] = [
          {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            name: 'Yafa Token',
            symbol: 'YAFA',
            holders: 12543,
            totalSupply: '1000000000',
            marketCap: '125.4M',
            price: '0.1254',
            change24h: 5.67
          },
          {
            address: '0x2345678901bcdef1234567890abcdef123456789',
            name: 'USD Coin',
            symbol: 'USDC',
            holders: 8921,
            totalSupply: '50000000',
            marketCap: '50.0M',
            price: '1.0000',
            change24h: -0.02
          },
          {
            address: '0x3456789012cdef1234567890abcdef1234567890',
            name: 'Wrapped Ether',
            symbol: 'WETH',
            holders: 7654,
            totalSupply: '15000',
            marketCap: '37.5M',
            price: '2500.00',
            change24h: 3.24
          },
          {
            address: '0x456789012dcdef1234567890abcdef12345678901',
            name: 'Dai Stablecoin',
            symbol: 'DAI',
            holders: 5432,
            totalSupply: '25000000',
            marketCap: '25.0M',
            price: '0.9998',
            change24h: 0.01
          },
          {
            address: '0x56789012ecdef1234567890abcdef123456789012',
            name: 'Chainlink Token',
            symbol: 'LINK',
            holders: 3210,
            totalSupply: '1000000',
            marketCap: '15.0M',
            price: '15.00',
            change24h: -2.15
          }
        ];
        
        setStats(mockStats);
        setChartData(mockChartData);
        setTopTokens(mockTokens);
        
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedTimeframe]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // Simple chart component (you could replace with a proper charting library)
  const SimpleChart = ({ data, metric }: { data: ChartData[], metric: keyof ChartData }) => {
    const values = data.map(d => d[metric] as number);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return (
      <div className="h-32 w-full relative">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#22c55e', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 300;
              const y = 100 - ((d[metric] as number - min) / (max - min)) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Chart area */}
          <polygon
            fill="url(#chartGradient)"
            points={`0,100 ${data.map((d, i) => {
              const x = (i / (data.length - 1)) * 300;
              const y = 100 - ((d[metric] as number - min) / (max - min)) * 100;
              return `${x},${y}`;
            }).join(' ')} 300,100`}
          />
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute top-0 -left-12 text-xs text-green-500/70">
          {formatLargeNumber(max)}
        </div>
        <div className="absolute bottom-0 -left-12 text-xs text-green-500/70">
          {formatLargeNumber(min)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-400">Loading network statistics...</p>
        </div>
      </div>
    );
  }

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
                { name: 'Blocks', href: '/blocks', icon: Layers },
                { name: 'Transactions', href: '/transactions', icon: Activity },
                { name: 'Tokens', href: '/tokens', icon: Users },
                { name: 'Stats', href: '/stats', icon: Zap, active: true }
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
                Network Statistics
              </h1>
              <p className="text-green-500/70">Real-time analytics and insights for the YAFA L2 network</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-gray-800/50 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg hover:bg-gray-800/70 transition-all">
                <Refresh className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-gray-800/50 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg hover:bg-gray-800/70 transition-all">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats && [
            { 
              label: 'Total Blocks', 
              value: formatNumber(stats.totalBlocks), 
              icon: Layers,
              color: 'blue',
              change: 2.4
            },
            { 
              label: 'Total Transactions', 
              value: formatLargeNumber(stats.totalTransactions), 
              icon: Activity,
              color: 'green',
              change: 5.8
            },
            { 
              label: 'Active Addresses', 
              value: formatLargeNumber(stats.totalAddresses), 
              icon: Users,
              color: 'purple',
              change: 1.2
            },
            { 
              label: 'Current TPS', 
              value: stats.currentTPS.toFixed(1), 
              icon: Zap,
              color: 'yellow',
              change: -0.5
            }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 hover:bg-gray-900/60 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-green-400/20 to-emerald-600/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-green-400" />
                </div>
                {formatPercentage(stat.change)}
              </div>
              <h3 className="text-2xl font-bold text-green-100 mb-1">{stat.value}</h3>
              <p className="text-green-500/70 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Network Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Performance Metrics */}
          <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-green-100 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span>Performance Metrics</span>
              </h2>
              
              <div className="flex items-center space-x-2">
                <select 
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="bg-gray-800/50 border border-green-500/30 text-green-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50"
                >
                  <option value="transactions">Transactions</option>
                  <option value="blocks">Blocks</option>
                  <option value="gasUsed">Gas Used</option>
                  <option value="activeAddresses">Active Addresses</option>
                </select>
                
                <select 
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="bg-gray-800/50 border border-green-500/30 text-green-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50"
                >
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="1y">1 Year</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <SimpleChart data={chartData} metric={selectedMetric} />
              
              <div className="flex items-center justify-between text-sm text-green-500/70">
                <span>{formatDate(chartData[0]?.timestamp || Date.now())}</span>
                <span>{formatDate(chartData[chartData.length - 1]?.timestamp || Date.now())}</span>
              </div>
            </div>
          </div>

          {/* Gas Price Tracker */}
          <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-100 mb-6 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span>Gas Tracker</span>
            </h3>
            
            {stats && (
              <div className="space-y-4">
                {[
                  { label: 'Slow', price: stats.gasPrice.slow, color: 'red', time: '~2 min' },
                  { label: 'Standard', price: stats.gasPrice.standard, color: 'yellow', time: '~1 min' },
                  { label: 'Fast', price: stats.gasPrice.fast, color: 'green', time: '~30 sec' }
                ].map((gas, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        gas.color === 'red' ? 'bg-red-400' :
                        gas.color === 'yellow' ? 'bg-yellow-400' : 'bg-green-400'
                      }`}></div>
                      <div>
                        <p className="text-green-100 font-medium">{gas.label}</p>
                        <p className="text-green-500/70 text-xs">{gas.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-100 font-semibold">{gas.price} Gwei</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Network Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Health */}
          <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-100 mb-6 flex items-center space-x-2">
              <Server className="w-5 h-5 text-green-400" />
              <span>System Health</span>
            </h3>
            
            {stats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-500/70">Average Block Time</span>
                  <span className="text-green-100 font-semibold">{stats.avgBlockTime}s</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-green-500/70">Peak TPS</span>
                  <span className="text-green-100 font-semibold">{stats.peakTPS}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-green-500/70">Network Hash Rate</span>
                  <span className="text-green-100 font-semibold">{stats.networkHashRate} TH/s</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-green-500/70">Active Validators</span>
                  <span className="text-green-100 font-semibold">{stats.activeValidators}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-green-500/70">Total Value Locked</span>
                  <span className="text-green-100 font-semibold">${stats.totalValueLocked}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-green-500/70">Market Cap</span>
                  <span className="text-green-100 font-semibold">${stats.marketCap}</span>
                </div>
              </div>
            )}
          </div>

          {/* Network Activity */}
          <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-100 mb-6 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span>Network Activity (24h)</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-green-500/70">New Blocks</span>
                <div className="text-right">
                  <span className="text-green-100 font-semibold">7,200</span>
                  <div className="flex items-center space-x-1 text-green-400">
                    <ArrowUp className="w-3 h-3" />
                    <span className="text-xs">2.4%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-500/70">New Transactions</span>
                <div className="text-right">
                  <span className="text-green-100 font-semibold">234,567</span>
                  <div className="flex items-center space-x-1 text-green-400">
                    <ArrowUp className="w-3 h-3" />
                    <span className="text-xs">5.8%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-500/70">New Addresses</span>
                <div className="text-right">
                  <span className="text-green-100 font-semibold">1,234</span>
                  <div className="flex items-center space-x-1 text-green-400">
                    <ArrowUp className="w-3 h-3" />
                    <span className="text-xs">1.2%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-500/70">Gas Used</span>
                <div className="text-right">
                  <span className="text-green-100 font-semibold">89.2%</span>
                  <div className="w-24 bg-gray-700/50 rounded-full h-2 mt-1">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '89.2%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-500/70">Average Transaction Fee</span>
                <div className="text-right">
                  <span className="text-green-100 font-semibold">0.0012 ETH</span>
                  <div className="flex items-center space-x-1 text-red-400">
                    <ArrowDown className="w-3 h-3" />
                    <span className="text-xs">0.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Tokens */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-green-100 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-green-400" />
              <span>Top Tokens by Market Cap</span>
            </h2>
            
            <Link href="/tokens" className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
              View all tokens →
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-500/20">
                  <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Rank</th>
                  <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Token</th>
                  <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Price</th>
                  <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">24h Change</th>
                  <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Market Cap</th>
                  <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Holders</th>
                  <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Contract</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {topTokens.map((token, index) => (
                  <tr key={token.address} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 whitespace-nowrap">
                      <span className="text-green-100 font-semibold">#{index + 1}</span>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                          <span className="text-green-400 font-bold text-xs">{token.symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-green-100 font-semibold">{token.symbol}</p>
                          <p className="text-green-500/70 text-sm">{token.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span className="text-green-100 font-medium">${token.price}</span>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      {formatPercentage(token.change24h)}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span className="text-green-100 font-medium">${token.marketCap}</span>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span className="text-green-100">{formatNumber(token.holders)}</span>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <Link 
                        href={`/token/${token.address}`}
                        className="text-green-400 hover:text-green-300 font-mono text-sm transition-colors"
                      >
                        {truncateHash(token.address)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Block Production */}
          <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-100 mb-4 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-green-400" />
              <span>Block Production</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Latest Block</span>
                <span className="text-green-100 font-medium">#1,247,589</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Block Reward</span>
                <span className="text-green-100 font-medium">2.5 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Difficulty</span>
                <span className="text-green-100 font-medium">12.5T</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Uncle Rate</span>
                <span className="text-green-100 font-medium">2.1%</span>
              </div>
            </div>
          </div>

          {/* Memory Pool */}
          <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-100 mb-4 flex items-center space-x-2">
              <Database className="w-5 h-5 text-green-400" />
              <span>Memory Pool</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Pending Txns</span>
                <span className="text-green-100 font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Queue Size</span>
                <span className="text-green-100 font-medium">5.2 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Average Wait</span>
                <span className="text-green-100 font-medium">45s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Dropped Txns</span>
                <span className="text-green-100 font-medium">23</span>
              </div>
            </div>
          </div>

          {/* Node Distribution */}
          <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-100 mb-4 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-green-400" />
              <span>Node Distribution</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Total Nodes</span>
                <span className="text-green-100 font-medium">1,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Full Nodes</span>
                <span className="text-green-100 font-medium">1,623</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Light Nodes</span>
                <span className="text-green-100 font-medium">224</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70 text-sm">Mining Nodes</span>
                <span className="text-green-100 font-medium">187</span>
              </div>
            </div>
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