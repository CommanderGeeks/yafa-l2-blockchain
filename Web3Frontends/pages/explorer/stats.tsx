'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowDown, 
  ArrowUp, 
  BarChart3, 
  Database, 
  Download, 
  Globe, 
  Layers, 
  Minus, 
  RotateCw, // Use RotateCw instead of Refresh
  Search, 
  Server, 
  Users, 
  Zap 
} from 'lucide-react';
import StatsCard from '../../src/components/explorer/StatsCard';
import SkeletonLoader from '../../src/components/explorer/SkeletonLoader';
import TxThroughputChart from '../../src/components/explorer/Charts/TxThroughputChart';
import BlockTimeChart from '../../src/components/explorer/Charts/BlockTimeChart';

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
  networkHashrate: string;
  difficulty: string;
  chainId: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      
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
        },
        networkHashrate: '1.23 PH/s',
        difficulty: '15.67T',
        chainId: 31337
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Chain Statistics
            </h1>
            <p className="text-green-500/70 text-lg mt-2">
              Real-time network metrics and analytics
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 
                     border border-green-500/50 rounded-lg transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw className={`w-4 h-4 text-green-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-green-400 font-medium">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array(8).fill(0).map((_, i) => (
              <SkeletonLoader key={i} type="stats" />
            ))}
          </div>
        ) : error ? (
          <div className="yafa-card text-center mb-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-red-400 text-xl font-bold mb-2">Data Unavailable</h3>
            <p className="text-green-500/70 mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : stats ? (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Blocks"
                value={formatNumber(stats.totalBlocks)}
                subtitle={`Latest: #${stats.latestBlock.number}`}
                icon="📦"
                trend="up"
                trendValue="+2.3%"
              />
              
              <StatsCard
                title="Total Transactions"
                value={formatNumber(stats.totalTransactions)}
                subtitle={`${stats.latestBlock.transactionCount} in latest block`}
                icon="💸"
                trend="up"
                trendValue="+5.7%"
              />
              
              <StatsCard
                title="Active Addresses"
                value={formatNumber(stats.totalAddresses)}
                subtitle="Unique addresses"
                icon="👥"
                trend="up"
                trendValue="+1.2%"
              />
              
              <StatsCard
                title="Network TPS"
                value={stats.tps.toString()}
                subtitle={`Avg block time: ${stats.avgBlockTime}s`}
                icon="⚡"
                trend="neutral"
              />
            </div>

            {/* Network Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Chain ID"
                value={stats.chainId.toString()}
                subtitle="Network identifier"
                icon="🔗"
                trend="neutral"
              />
              
              <StatsCard
                title="Hashrate"
                value={stats.networkHashrate}
                subtitle="Network security"
                icon="⛏️"
                trend="up"
                trendValue="+0.8%"
              />
              
              <StatsCard
                title="Difficulty"
                value={stats.difficulty}
                subtitle="Mining difficulty"
                icon="🎯"
                trend="down"
                trendValue="-1.1%"
              />
              
              <StatsCard
                title="Status"
                value="Online"
                subtitle="All systems operational"
                icon="✅"
                trend="neutral"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Transaction Throughput Chart */}
              <div className="yafa-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-bold text-green-400">
                      Transaction Throughput
                    </h3>
                  </div>
                </div>
                <TxThroughputChart />
              </div>

              {/* Block Time Chart */}
              <div className="yafa-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-bold text-green-400">
                      Block Time Analysis
                    </h3>
                  </div>
                </div>
                <BlockTimeChart />
              </div>
            </div>

            {/* Network Health Overview */}
            <div className="yafa-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-green-400">
                    Network Health
                  </h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sync Status */}
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
                  <h4 className="text-green-400 font-semibold mb-1">Indexer</h4>
                  <p className="text-green-500/70 text-sm">Syncing blocks</p>
                  <p className="text-green-400 text-xs mt-1">Block #{stats.latestBlock.number}</p>
                </div>
                
                {/* API Status */}
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
                  <h4 className="text-green-400 font-semibold mb-1">API</h4>
                  <p className="text-green-500/70 text-sm">Serving data</p>
                  <p className="text-green-400 text-xs mt-1">200ms avg response</p>
                </div>
                
                {/* Database Status */}
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
                  <h4 className="text-green-400 font-semibold mb-1">Database</h4>
                  <p className="text-green-500/70 text-sm">Online</p>
                  <p className="text-green-400 text-xs mt-1">3ms query time</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}