import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import BlockCard from '../components/BlockCard';
import TransactionCard from '../components/TransactionCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatDistanceToNow } from 'date-fns';

interface ChainStats {
  latestBlock: {
    number: string;
    hash: string;
    timestamp: string;
    transactionCount: number;
    gasUsed: string;
    gasLimit: string;
    utilization: number;
  } | null;
  network: {
    averageBlockTime: number;
    averageGasPrice: string;
    networkUtilization: number;
  };
  transactions: {
    total: string;
    last24h: number;
    successRate: number;
  };
  blocks: {
    total: string;
    last24h: number;
  };
  addresses: {
    total: number;
    contracts: number;
  };
}

interface Block {
  number: string;
  hash: string;
  timestamp: string;
  gasUsed: string;
  gasLimit: string;
  gasUsedPercent: string;
  miner: string;
  transactionCount: number;
  age: number;
}

interface Transaction {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: string;
  age: number;
  method: string;
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    try {
      const [statsRes, blocksRes, txsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blocks?limit=5`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/txs?limit=10`)
      ]);

      const [statsData, blocksData, txsData] = await Promise.all([
        statsRes.json(),
        blocksRes.json(),
        txsRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (blocksData.success) setBlocks(blocksData.data.blocks);
      if (txsData.success) setTransactions(txsData.data.transactions);

    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format values for display
  const formatValue = (value: string | number, type: 'ether' | 'gwei' | 'number' = 'number') => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    switch (type) {
      case 'ether':
        if (num === 0) return '0 ETH';
        if (num < 0.001) return '<0.001 ETH';
        return `${num.toFixed(4)} ETH`;
      case 'gwei':
        return `${(num / 1e9).toFixed(2)} Gwei`;
      case 'number':
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toLocaleString();
    }
  };

  const formatAge = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="yafa-card max-w-md mx-auto">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Data</h2>
            <p className="text-green-500/70 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchData();
              }}
              className="yafa-button-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent animate-gradient mb-4">
          YAFA L2 Explorer
        </h1>
        <p className="text-green-500/70 text-xl max-w-2xl mx-auto">
          Real-time blockchain explorer for the YAFA Layer 2 network. 
          Track transactions, explore blocks, and monitor network activity.
        </p>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <SkeletonLoader key={i} className="h-32" />
          ))
        ) : stats ? (
          <>
            <StatsCard
              title="Latest Block"
              value={stats.latestBlock?.number || '0'}
              subtitle={stats.latestBlock ? formatAge(Date.now() / 1000 - new Date(stats.latestBlock.timestamp).getTime() / 1000) : 'Unknown'}
              icon="📦"
              trend={stats.blocks.last24h > 0 ? 'up' : 'neutral'}
            />
            <StatsCard
              title="Total Transactions"
              value={formatValue(stats.transactions.total)}
              subtitle={`${stats.transactions.last24h} in 24h`}
              icon="💸"
              trend={stats.transactions.last24h > 0 ? 'up' : 'neutral'}
            />
            <StatsCard
              title="Active Addresses"
              value={formatValue(stats.addresses.total)}
              subtitle={`${stats.addresses.contracts} contracts`}
              icon="👥"
              trend="neutral"
            />
            <StatsCard
              title="Network Utilization"
              value={`${stats.network.networkUtilization.toFixed(1)}%`}
              subtitle={`Avg: ${stats.network.averageBlockTime}s block time`}
              icon="⚡"
              trend={stats.network.networkUtilization > 50 ? 'up' : 'neutral'}
            />
          </>
        ) : null}
      </div>

      {/* Latest Blocks and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Latest Blocks */}
        <div className="yafa-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gradient">Latest Blocks</h2>
            <a 
              href="/blocks" 
              className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
            >
              View all →
            </a>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <SkeletonLoader key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map((block, index) => (
                <div 
                  key={block.hash}
                  className="flex items-center justify-between p-4 bg-gray-950/60 rounded-xl border border-green-500/10 hover:border-green-500/30 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={`/block/${block.number}`}
                          className="text-green-400 font-bold hover:text-green-300 transition-colors"
                        >
                          #{block.number}
                        </a>
                        <span className="text-green-500/60 text-sm">
                          {formatAge(block.age)}
                        </span>
                      </div>
                      <div className="text-green-500/70 text-sm">
                        {block.transactionCount} txns
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-green-400 font-mono text-sm">
                      {formatValue(block.gasUsed)} / {formatValue(block.gasLimit)}
                    </div>
                    <div className="text-green-500/60 text-sm">
                      {block.gasUsedPercent}% used
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Transactions */}
        <div className="yafa-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gradient">Latest Transactions</h2>
            <a 
              href="/transactions" 
              className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
            >
              View all →
            </a>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {Array(10).fill(0).map((_, i) => (
                <SkeletonLoader key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.hash}
                  className="flex items-center justify-between p-3 bg-gray-950/60 rounded-lg border border-green-500/10 hover:border-green-500/30 transition-all group"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <a 
                          href={`/tx/${tx.hash}`}
                          className="text-green-400 font-mono text-sm hover:text-green-300 transition-colors truncate"
                        >
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </a>
                        <span className="text-green-500/60 text-xs">
                          {formatAge(tx.age)}
                        </span>
                      </div>
                      <div className="text-green-500/70 text-xs">
                        {tx.method} • Block {tx.blockNumber}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="text-green-400 font-mono text-sm">
                      {formatValue(tx.value, 'ether')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Network Health */}
      {stats && (
        <div className="mt-12 yafa-card">
          <h2 className="text-2xl font-bold text-gradient mb-6">Network Health</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">
                {stats.transactions.successRate >= 95 ? '🟢' : 
                 stats.transactions.successRate >= 90 ? '🟡' : '🔴'}
              </div>
              <div className="text-green-400 font-bold text-xl">
                {stats.transactions.successRate.toFixed(1)}%
              </div>
              <div className="text-green-500/70 text-sm">Success Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-green-400 font-bold text-xl">
                {stats.network.averageBlockTime}s
              </div>
              <div className="text-green-500/70 text-sm">Block Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">💨</div>
              <div className="text-green-400 font-bold text-xl">
                {formatValue(stats.network.averageGasPrice, 'gwei')}
              </div>
              <div className="text-green-500/70 text-sm">Gas Price</div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;