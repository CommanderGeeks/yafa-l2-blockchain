'use client';

import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import SkeletonLoader from '../components/SkeletonLoader';

export default function HomePage() {
  const [stats, setStats] = useState(null);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gray-900/60 backdrop-blur-xl border-b border-green-500/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-black font-bold text-xl">Y</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                YAFA Explorer
              </h1>
              <p className="text-green-500/70">L2 Block Explorer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-green-400 mb-4">
            Welcome to YAFA L2 Explorer
          </h2>
          <p className="text-green-500/70 text-lg">
            Real-time blockchain explorer for the YAFA Layer 2 network
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            <>
              <SkeletonLoader type="stats" />
              <SkeletonLoader type="stats" />
              <SkeletonLoader type="stats" />
              <SkeletonLoader type="stats" />
            </>
          ) : error ? (
            <div className="col-span-full">
              <div className="yafa-card text-center">
                <h3 className="text-red-400 text-lg font-bold mb-2">⚠️ Connection Error</h3>
                <p className="text-green-500/70 mb-4">{error}</p>
                <button 
                  onClick={fetchStats}
                  className="btn-primary"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : stats ? (
            <>
              <StatsCard
                title="Latest Block"
                value={stats.latestBlock?.number || '0'}
                icon="📦"
                trend="neutral"
              />
              <StatsCard
                title="Total Transactions"
                value={stats.transactions?.total || '0'}
                icon="💸"
                trend="up"
              />
              <StatsCard
                title="Network Status"
                value="Online"
                subtitle="All systems operational"
                icon="⚡"
                trend="neutral"
              />
              <StatsCard
                title="Block Time"
                value="~12s"
                subtitle="Average block time"
                icon="⏰"
                trend="neutral"
              />
            </>
          ) : null}
        </div>

        {/* Status Section */}
        <div className="yafa-card text-center">
          <h3 className="text-2xl font-bold text-green-400 mb-4">🎉 Explorer Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2 animate-pulse"></div>
              <p className="text-green-400 font-semibold">Indexer</p>
              <p className="text-green-500/70 text-sm">Syncing blocks</p>
            </div>
            <div>
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2 animate-pulse"></div>
              <p className="text-green-400 font-semibold">API</p>
              <p className="text-green-500/70 text-sm">Serving data</p>
            </div>
            <div>
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2 animate-pulse"></div>
              <p className="text-green-400 font-semibold">Web</p>
              <p className="text-green-500/70 text-sm">Online</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}