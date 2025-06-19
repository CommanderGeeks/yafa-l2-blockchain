// TransactionsPage.tsx - Updated with consistent explorer layout
'use client';

import React, { useState, useEffect } from 'react';
import ExplorerLayout from '@/components/ExplorerLayout';
import { Filter, Download, Activity, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface Transaction {
  id: string;
  hash: string;
  status: 'success' | 'failed' | 'pending';
  method: string;
  block: number;
  age: string;
  from: string;
  to: string;
  value: number;
  fee: number;
  type: string;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'transfer' | 'contract' | 'token'>('all');

  // Mock transaction data
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      hash: '0x55d5db...5701e8',
      status: 'success',
      method: 'Transfer',
      block: 1247589,
      age: '0s ago',
      from: '0x2625e6...9a4b08',
      to: '0x4abc98...9938c8',
      value: 18.3682,
      fee: 0.001293,
      type: 'transfer'
    },
    {
      id: '2',
      hash: '0xf70ecd...7ea838',
      status: 'success',
      method: 'Unstake',
      block: 1247588,
      age: '15s ago',
      from: '0x80990e...13d6b8',
      to: '0x9c1319...709c64',
      value: 15.9476,
      fee: 0.001689,
      type: 'contract'
    },
    {
      id: '3',
      hash: '0x61c9a9...9d74e8',
      status: 'success',
      method: 'Swap',
      block: 1247587,
      age: '30s ago',
      from: '0x10d1a8...5c1688',
      to: '0x04d730...b9e135',
      value: 17.1337,
      fee: 0.002983,
      type: 'contract'
    },
    {
      id: '4',
      hash: '0xa3db88...96efb8',
      status: 'success',
      method: 'Transfer',
      block: 1247586,
      age: '45s ago',
      from: '0xcc7cb7...c5aaf8',
      to: '0x46a2c0...20b911',
      value: 38.4651,
      fee: 0.002271,
      type: 'transfer'
    },
    {
      id: '5',
      hash: '0x1ef41e...9e73a6',
      status: 'success',
      method: 'Approve',
      block: 1247585,
      age: '1m ago',
      from: '0xfef4d7...c80da8',
      to: '0x4ea66f...d4dac7',
      value: 33.4824,
      fee: 0.005037,
      type: 'token'
    },
    {
      id: '6',
      hash: '0xde2b24...008fe5',
      status: 'success',
      method: 'Mint',
      block: 1247584,
      age: '1m ago',
      from: '0x99d751...9dbc08',
      to: '0x6c3030...798c9d',
      value: 10.0906,
      fee: 0.004720,
      type: 'token'
    },
    {
      id: '7',
      hash: '0x3d6bae...a6713d',
      status: 'failed',
      method: 'Approve',
      block: 1247583,
      age: '1m ago',
      from: '0x872495...a9fe88',
      to: '0x3ec4b9...17bfc8',
      value: 35.3355,
      fee: 0.001391,
      type: 'token'
    },
    {
      id: '8',
      hash: '0x20d55d...8a32c8',
      status: 'pending',
      method: 'Mint',
      block: 1247582,
      age: '1m ago',
      from: '0x9d27bc...a80da5',
      to: '0xe448dc...374c66',
      value: 7.4108,
      fee: 0.001466,
      type: 'token'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchTransactions = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(mockTransactions);
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const handleRefresh = () => {
    setTransactions([]);
    setLoading(true);
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />;
      case 'failed':
        return <div className="w-4 h-4 rounded-full bg-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" aria-hidden="true" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'transfer':
        return 'text-blue-400 bg-blue-400/10';
      case 'swap':
        return 'text-purple-400 bg-purple-400/10';
      case 'approve':
        return 'text-orange-400 bg-orange-400/10';
      case 'mint':
        return 'text-green-400 bg-green-400/10';
      case 'unstake':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const truncateHash = (hash: string, start = 6, end = 6) => {
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  };

  const rightContent = (
    <div className="flex items-center space-x-2">
      <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-green-500/30 rounded-lg transition-all duration-200">
        <Filter className="w-5 h-5" aria-hidden="true" />
      </button>
      <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-green-500/30 rounded-lg transition-all duration-200">
        <Download className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <ExplorerLayout
      title="Transactions"
      subtitle="Browse and explore transactions on the YAFA L2 network"
      showRefresh={true}
      onRefresh={handleRefresh}
      isLoading={loading}
      rightContent={rightContent}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-green-400">5.8M+</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">99.2%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">Avg Gas Price</p>
              <p className="text-2xl font-bold text-green-400">35 Gwei</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-green-500/70 text-sm">TPS (24h)</p>
              <p className="text-2xl font-bold text-green-400">45.7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-green-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-green-400 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            >
              <option value="all">All Types</option>
              <option value="transfer">Transfer</option>
              <option value="contract">Contract</option>
              <option value="token">Token</option>
            </select>
          </div>
        </div>

        <div className="text-green-500/70 text-sm">
          Showing {filteredTransactions.length} transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800/50 border-b border-green-500/20">
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Txn Hash
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Block
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Fee
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                // Loading skeleton
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-4 h-4 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-green-500/20 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(tx.status)}
                        <span className="text-sm text-green-500/70 capitalize">{tx.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-green-400 hover:text-green-300 cursor-pointer transition-colors">
                        {truncateHash(tx.hash)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${getMethodColor(tx.method)}`}>
                        {tx.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                      {tx.block.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500/70">
                      {tx.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-green-400 hover:text-green-300 cursor-pointer transition-colors">
                        {truncateHash(tx.from)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-green-400 hover:text-green-300 cursor-pointer transition-colors">
                        {truncateHash(tx.to)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                      {tx.value.toFixed(4)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500/70">
                      {tx.fee.toFixed(6)} ETH
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ExplorerLayout>
  );
};

export default TransactionsPage;