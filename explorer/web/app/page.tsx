'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, Clock, Zap, Users, Layers, 
  Search, Globe, Database, Shield
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    latestBlock: 1247589,
    totalTransactions: 5847392,
    totalAddresses: 98742,
    avgBlockTime: 12.3,
    currentTPS: 45.7,
    gasPrice: 25,
    networkStatus: 'healthy' as const
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="title-gradient">
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
                className="form-input pl-14 pr-6 py-4 text-lg"
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 form-button">
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
              <div key={i} className="explorer-card">
                <div className="skeleton w-12 h-12 rounded-xl mb-4"></div>
                <div className="skeleton h-8 rounded mb-2"></div>
                <div className="skeleton h-4 rounded"></div>
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
                  value: formatNumber(stats.latestBlock), 
                  icon: Layers, 
                  trend: '+1.2%'
                },
                { 
                  label: 'Total Transactions', 
                  value: `${Math.floor(stats.totalTransactions / 1000000)}M+`, 
                  icon: Activity, 
                  trend: '+5.8%'
                },
                { 
                  label: 'Active Addresses', 
                  value: `${Math.floor(stats.totalAddresses / 1000)}K+`, 
                  icon: Users, 
                  trend: '+2.1%'
                },
                { 
                  label: 'Current TPS', 
                  value: stats.currentTPS.toFixed(1), 
                  icon: Zap, 
                  trend: '+0.5%'
                }
              ].map((stat, index) => (
                <div key={index} className="stat-card group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="stat-card-icon group-hover:scale-110">
                      <stat.icon className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="badge-success">
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="stat-card-value">{stat.value}</h3>
                  <p className="stat-card-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Network Health */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="explorer-card">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-green-100 flex items-center space-x-2">
                  <Globe className="w-6 h-6 text-green-400" />
                  <span>Network Health</span>
                </h2>
                <div className="status-online">
                  <div className="status-dot-green"></div>
                  <span className="font-medium">All Systems Operational</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Indexer', status: 'Syncing blocks', progress: 100, icon: Database },
                  { name: 'API', status: 'Serving data', progress: 100, icon: Activity },
                  { name: 'WebSocket', status: 'Real-time updates', progress: 100, icon: Zap }
                ].map((service, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <service.icon className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-100 mb-2">{service.name}</h3>
                    <p className="text-green-500/70 text-sm mb-3">{service.status}</p>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${service.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-green-400 text-sm mt-2 font-medium">{service.progress}%</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'View Blocks', href: '/blocks', icon: '📦', desc: 'Browse latest blocks' },
                { name: 'Transactions', href: '/transactions', icon: '💸', desc: 'Search transactions' },
                { name: 'Statistics', href: '/stats', icon: '📊', desc: 'Network analytics' },
                { name: 'Tokens', href: '/tokens', icon: '🪙', desc: 'Token information' }
              ].map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="explorer-card text-center"
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