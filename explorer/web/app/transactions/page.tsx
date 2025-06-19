'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Filter, Download, Activity, 
  ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Clock
} from 'lucide-react';

interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failed' | 'pending';
  method?: string;
  type: 'transfer' | 'contract' | 'token';
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'transfer' | 'contract' | 'token'>('all');
  
  const transactionsPerPage = 25;

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock transactions
        const mockTransactions: Transaction[] = Array.from({ length: transactionsPerPage }, (_, i) => {
          const methods = ['Transfer', 'Approve', 'Swap', 'Mint', 'Burn', 'Stake', 'Unstake'];
          const types: ('transfer' | 'contract' | 'token')[] = ['transfer', 'contract', 'token'];
          const statuses: ('success' | 'failed' | 'pending')[] = ['success', 'failed', 'pending'];
          
          return {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            blockNumber: 1247589 - i - ((currentPage - 1) * transactionsPerPage),
            timestamp: Date.now() - (i * 15000) - ((currentPage - 1) * transactionsPerPage * 15000),
            from: `0x${Math.random().toString(16).substr(2, 40)}`,
            to: `0x${Math.random().toString(16).substr(2, 40)}`,
            value: (Math.random() * 50).toFixed(6),
            gasUsed: `${Math.floor(Math.random() * 100000) + 21000}`,
            gasPrice: `${Math.floor(Math.random() * 50) + 20}`,
            status: statuses[Math.floor(Math.random() * (Math.random() > 0.1 ? 1 : statuses.length))], // 90% success
            method: Math.random() > 0.4 ? methods[Math.floor(Math.random() * methods.length)] : undefined,
            type: types[Math.floor(Math.random() * types.length)]
          };
        });
        
        setTransactions(mockTransactions);
        setTotalPages(Math.ceil(5847392 / transactionsPerPage)); // Mock total
        
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, statusFilter, typeFilter]);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const truncateHash = (hash: string, start = 8, end = 6) => {
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4 text-blue-400" />;
      case 'contract':
        return <Activity className="w-4 h-4 text-purple-400" />;
      case 'token':
        return <ArrowDownLeft className="w-4 h-4 text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold title-gradient mb-2">
                Transactions
              </h1>
              <p className="text-green-500/70">Browse and explore transactions on the YAFA L2 network</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="form-button-secondary">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <button className="form-button-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total Transactions', value: '5.8M+', icon: Activity },
              { label: 'Success Rate', value: '99.2%', icon: CheckCircle },
              { label: 'Avg Gas Price', value: '35 Gwei', icon: Activity },
              { label: 'TPS (24h)', value: '45.7', icon: Activity }
            ].map((stat, index) => (
              <div key={index} className="explorer-card">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-100 font-semibold text-lg">{stat.value}</p>
                    <p className="text-green-500/70 text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="explorer-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-1">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="form-input w-32"
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
                  className="form-input w-32"
                >
                  <option value="all">All Types</option>
                  <option value="transfer">Transfer</option>
                  <option value="contract">Contract</option>
                  <option value="token">Token</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-green-500/70">
              Showing {filteredTransactions.length} transactions
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="explorer-card overflow-hidden">
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
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="skeleton h-4 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.hash} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(tx.status)}
                          {getTypeIcon(tx.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/tx/${tx.hash}`}
                          className="text-green-400 hover:text-green-300 font-mono text-sm transition-colors"
                        >
                          {truncateHash(tx.hash)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.method ? (
                          <span className="badge-info">
                            {tx.method}
                          </span>
                        ) : (
                          <span className="text-green-500/70 text-sm">Transfer</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/block/${tx.blockNumber}`}
                          className="text-green-400 hover:text-green-300 transition-colors text-sm"
                        >
                          {formatNumber(tx.blockNumber)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-500/70 text-sm">
                        {formatTime(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/address/${tx.from}`}
                          className="text-green-400 hover:text-green-300 font-mono text-sm transition-colors"
                        >
                          {truncateHash(tx.from)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/address/${tx.to}`}
                          className="text-green-400 hover:text-green-300 font-mono text-sm transition-colors"
                        >
                          {truncateHash(tx.to)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-100">
                        <div className="text-green-400 font-medium">
                          {parseFloat(tx.value).toFixed(4)} ETH
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-500/70 text-sm">
                        {(parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice) / 1e9).toFixed(6)} ETH
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-green-500/70">
            Showing page {currentPage} of {formatNumber(totalPages)} 
            ({formatNumber(transactionsPerPage)} transactions per page)
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="form-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      currentPage === pageNum
                        ? 'bg-green-400 text-black font-semibold'
                        : 'form-button-secondary'
                    }`}
                  >
                    {formatNumber(pageNum)}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="form-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}