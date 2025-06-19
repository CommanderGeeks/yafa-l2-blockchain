'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Activity, Clock, Zap, ExternalLink, Copy, Check, 
  AlertTriangle, CheckCircle, XCircle, ArrowRight, Users, 
  FileText, Code, Layers
} from 'lucide-react';

interface TransactionDetails {
  hash: string;
  status: 'success' | 'failed' | 'pending';
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: number;
  nonce: number;
  input: string;
  logs: TransactionLog[];
  confirmations: number;
  type: number;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  effectiveGasPrice: string;
}

interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
}

export default function TransactionPage({ params }: { params: { hash: string } }) {
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'state' | 'comments'>('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Extract hash from params (in real Next.js this would come from router)
  const txHash = params?.hash || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock transaction data
        const mockTransaction: TransactionDetails = {
          hash: txHash,
          status: Math.random() > 0.1 ? 'success' : 'failed',
          blockNumber: 1247589,
          blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          transactionIndex: Math.floor(Math.random() * 100),
          from: `0x${Math.random().toString(16).substr(2, 40)}`,
          to: `0x${Math.random().toString(16).substr(2, 40)}`,
          value: (Math.random() * 10).toFixed(6),
          gasPrice: `${(Math.random() * 50 + 20).toFixed(0)}`,
          gasLimit: '21000',
          gasUsed: '21000',
          timestamp: Date.now() - Math.floor(Math.random() * 3600000),
          nonce: Math.floor(Math.random() * 1000),
          input: '0x',
          confirmations: Math.floor(Math.random() * 100) + 12,
          type: 2,
          maxFeePerGas: `${(Math.random() * 100 + 50).toFixed(0)}`,
          maxPriorityFeePerGas: `${(Math.random() * 10 + 2).toFixed(0)}`,
          effectiveGasPrice: `${(Math.random() * 50 + 20).toFixed(0)}`,
          logs: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
            address: `0x${Math.random().toString(16).substr(2, 40)}`,
            topics: [
              `0x${Math.random().toString(16).substr(2, 64)}`,
              `0x${Math.random().toString(16).substr(2, 64)}`
            ],
            data: `0x${Math.random().toString(16).substr(2, 128)}`,
            blockNumber: 1247589,
            transactionHash: txHash,
            transactionIndex: 0,
            blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
            logIndex: i,
            removed: false
          }))
        };
        
        setTransaction(mockTransaction);
      } catch (err) {
        setError('Failed to fetch transaction details');
        console.error('Transaction fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [txHash]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeAgo = (timestamp: number) => {
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

  const formatEther = (wei: string) => {
    const eth = parseFloat(wei);
    return `${eth.toFixed(6)} ETH`;
  };

  const formatGwei = (wei: string) => {
    const gwei = parseFloat(wei);
    return `${gwei.toFixed(0)} Gwei`;
  };

  const truncateHash = (hash: string, start = 8, end = 6) => {
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-400">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Transaction Not Found</h2>
          <p className="text-green-500/70 mb-4">{error || 'The transaction you are looking for does not exist.'}</p>
          <Link href="/" className="text-green-400 hover:text-green-300 transition-colors">
            ← Back to Explorer
          </Link>
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
                { name: 'Transactions', href: '/transactions', icon: Activity, active: true },
                { name: 'Tokens', href: '/tokens', icon: Users },
                { name: 'Stats', href: '/stats', icon: Zap }
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
          <div className="flex items-center space-x-2 text-green-500/70 text-sm mb-4">
            <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
            <span>→</span>
            <Link href="/transactions" className="hover:text-green-400 transition-colors">Transactions</Link>
            <span>→</span>
            <span className="text-green-100">Transaction Details</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                Transaction Details
              </h1>
              <div className="flex items-center space-x-3">
                <p className="text-green-500/70 font-mono">{truncateHash(transaction.hash, 10, 8)}</p>
                <button
                  onClick={() => copyToClipboard(transaction.hash, 'hash')}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  {copiedField === 'hash' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${getStatusColor(transaction.status)}`}>
              {getStatusIcon(transaction.status)}
              <span className="font-semibold capitalize">{transaction.status}</span>
            </div>
          </div>
        </div>

        {/* Transaction Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Details */}
          <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-green-100 mb-6 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span>Transaction Information</span>
            </h2>
            
            <div className="space-y-6">
              {/* Transaction Hash */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-700/50">
                <span className="text-green-500/70 font-medium mb-2 sm:mb-0">Transaction Hash</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-green-100 text-sm break-all">{transaction.hash}</span>
                  <button
                    onClick={() => copyToClipboard(transaction.hash, 'hash-full')}
                    className="text-green-400 hover:text-green-300 transition-colors flex-shrink-0"
                  >
                    {copiedField === 'hash-full' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-700/50">
                <span className="text-green-500/70 font-medium mb-2 sm:mb-0">Status</span>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  <span className="font-semibold capitalize">{transaction.status}</span>
                  {transaction.status === 'success' && (
                    <span className="text-xs">({transaction.confirmations} confirmations)</span>
                  )}
                </div>
              </div>

              {/* Block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-700/50">
                <span className="text-green-500/70 font-medium mb-2 sm:mb-0">Block</span>
                <div className="flex items-center space-x-2">
                  <Link 
                    href={`/block/${transaction.blockNumber}`}
                    className="text-green-400 hover:text-green-300 transition-colors font-mono"
                  >
                    {formatNumber(transaction.blockNumber)}
                  </Link>
                  <span className="text-green-500/70">({formatTimeAgo(transaction.timestamp)})</span>
                </div>
              </div>

              {/* From and To */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-700/50">
                <span className="text-green-500/70 font-medium mb-2 sm:mb-0">From</span>
                <div className="flex items-center space-x-2">
                  <Link 
                    href={`/address/${transaction.from}`}
                    className="text-green-400 hover:text-green-300 transition-colors font-mono text-sm"
                  >
                    {truncateHash(transaction.from)}
                  </Link>
                  <button
                    onClick={() => copyToClipboard(transaction.from, 'from')}
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    {copiedField === 'from' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-5 h-5 text-green-400" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-700/50">
                <span className="text-green-500/70 font-medium mb-2 sm:mb-0">To</span>
                <div className="flex items-center space-x-2">
                  <Link 
                    href={`/address/${transaction.to}`}
                    className="text-green-400 hover:text-green-300 transition-colors font-mono text-sm"
                  >
                    {truncateHash(transaction.to)}
                  </Link>
                  <button
                    onClick={() => copyToClipboard(transaction.to, 'to')}
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    {copiedField === 'to' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Value */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-700/50">
                <span className="text-green-500/70 font-medium mb-2 sm:mb-0">Value</span>
                <div className="text-right">
                  <p className="text-green-100 font-semibold">{formatEther(transaction.value)}</p>
                  <p className="text-green-500/70 text-sm">≈ ${(parseFloat(transaction.value) * 2500).toFixed(2)} USD</p>
                </div>
              </div>

              {/* Transaction Fee */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3">
                <span className="text-green-500/70 font-medium mb-2 sm:mb-0">Transaction Fee</span>
                <div className="text-right">
                  <p className="text-green-100 font-semibold">
                    {formatEther((parseFloat(transaction.gasUsed) * parseFloat(transaction.effectiveGasPrice) / 1e9).toString())}
                  </p>
                  <p className="text-green-500/70 text-sm">
                    Gas: {formatNumber(parseInt(transaction.gasUsed))} @ {formatGwei(transaction.effectiveGasPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Gas Information */}
            <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-100 mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-400" />
                <span>Gas Information</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-green-500/70">Gas Limit</span>
                  <span className="text-green-100">{formatNumber(parseInt(transaction.gasLimit))}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-500/70">Gas Used</span>
                  <div className="text-right">
                    <span className="text-green-100">{formatNumber(parseInt(transaction.gasUsed))}</span>
                    <div className="w-24 bg-gray-700/50 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-400 h-2 rounded-full" 
                        style={{ width: `${(parseInt(transaction.gasUsed) / parseInt(transaction.gasLimit)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-500/70">Gas Price</span>
                  <span className="text-green-100">{formatGwei(transaction.effectiveGasPrice)}</span>
                </div>
                
                {transaction.maxFeePerGas && (
                  <div className="flex justify-between">
                    <span className="text-green-500/70">Max Fee</span>
                    <span className="text-green-100">{formatGwei(transaction.maxFeePerGas)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-100 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-400" />
                <span>Additional Details</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-green-500/70">Nonce</span>
                  <span className="text-green-100">{transaction.nonce}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-500/70">Position in Block</span>
                  <span className="text-green-100">{transaction.transactionIndex}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-500/70">Transaction Type</span>
                  <span className="text-green-100">Type {transaction.type} (EIP-1559)</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-500/70">Timestamp</span>
                  <div className="text-right">
                    <span className="text-green-100 text-sm">{formatTime(transaction.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-green-500/20">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: FileText },
                { id: 'logs', name: `Event Logs (${transaction.logs.length})`, icon: Code },
                { id: 'state', name: 'State Changes', icon: Activity },
                { id: 'comments', name: 'Comments', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-400 text-green-400'
                      : 'border-transparent text-green-500/70 hover:text-green-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-100 mb-4">Input Data</h3>
                {transaction.input === '0x' ? (
                  <p className="text-green-500/70">No input data (simple transfer)</p>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <code className="text-green-100 text-sm font-mono break-all">{transaction.input}</code>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-4">
                {transaction.logs.length > 0 ? (
                  transaction.logs.map((log, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-green-100 font-semibold">Log {index}</h4>
                        <span className="text-green-500/70 text-sm">Index: {log.logIndex}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-green-400 text-sm">Address:</span>
                          <Link 
                            href={`/address/${log.address}`}
                            className="ml-2 text-green-300 hover:text-green-200 font-mono text-sm"
                          >
                            {log.address}
                          </Link>
                        </div>
                        
                        <div>
                          <span className="text-green-400 text-sm">Topics:</span>
                          {log.topics.map((topic, i) => (
                            <div key={i} className="ml-4 font-mono text-xs text-green-100 break-all">
                              [{i}] {topic}
                            </div>
                          ))}
                        </div>
                        
                        <div>
                          <span className="text-green-400 text-sm">Data:</span>
                          <div className="ml-4 font-mono text-xs text-green-100 break-all">{log.data}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-green-500/70">No event logs for this transaction</p>
                )}
              </div>
            )}

            {activeTab === 'state' && (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-green-400/50 mx-auto mb-4" />
                <p className="text-green-500/70">State changes information coming soon</p>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-green-400/50 mx-auto mb-4" />
                <p className="text-green-500/70">Community comments feature coming soon</p>
              </div>
            )}
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