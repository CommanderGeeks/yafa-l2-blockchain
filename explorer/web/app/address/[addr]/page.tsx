'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Activity, Clock, Zap, Copy, Check, Users, 
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft,
  ExternalLink, Filter, Download, Layers, FileText,
  Globe, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

interface AddressDetails {
  address: string;
  balance: string;
  balanceUSD: string;
  nonce: number;
  transactionCount: number;
  type: 'EOA' | 'Contract';
  contractCode?: string;
  isVerified?: boolean;
  contractName?: string;
  firstSeen: number;
  lastSeen: number;
}

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
  type: 'in' | 'out' | 'self';
  method?: string;
}

interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  value: string;
  price: string;
}

export default function AddressPage({ params }: { params: { addr: string } }) {
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'tokens' | 'internal' | 'analytics'>('transactions');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [totalPages, setTotalPages] = useState(1);

  // Extract address from params
  const address = params?.addr || '0x1234567890abcdef1234567890abcdef12345678';

  useEffect(() => {
    const fetchAddressDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validate address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          throw new Error('Invalid address format');
        }
        
        // Mock address details
        const mockAddress: AddressDetails = {
          address: address,
          balance: (Math.random() * 100 + 10).toFixed(6),
          balanceUSD: (Math.random() * 250000 + 25000).toFixed(2),
          nonce: Math.floor(Math.random() * 1000),
          transactionCount: Math.floor(Math.random() * 5000) + 100,
          type: Math.random() > 0.7 ? 'Contract' : 'EOA',
          isVerified: Math.random() > 0.5,
          contractName: Math.random() > 0.5 ? 'YafaToken' : undefined,
          firstSeen: Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
          lastSeen: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
        };
        
        // Mock transactions
        const mockTransactions: Transaction[] = Array.from({ length: 25 }, (_, i) => {
          const isIncoming = Math.random() > 0.5;
          const isSelf = Math.random() > 0.9;
          
          return {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            blockNumber: 1247589 - i,
            timestamp: Date.now() - (i * 3600000) - Math.floor(Math.random() * 3600000),
            from: isSelf ? address : (isIncoming ? `0x${Math.random().toString(16).substr(2, 40)}` : address),
            to: isSelf ? address : (isIncoming ? address : `0x${Math.random().toString(16).substr(2, 40)}`),
            value: (Math.random() * 50).toFixed(6),
            gasUsed: `${Math.floor(Math.random() * 100000) + 21000}`,
            gasPrice: `${Math.floor(Math.random() * 50) + 20}`,
            status: Math.random() > 0.05 ? 'success' : 'failed',
            type: isSelf ? 'self' : (isIncoming ? 'in' : 'out'),
            method: Math.random() > 0.5 ? ['Transfer', 'Approve', 'Swap', 'Mint', 'Burn'][Math.floor(Math.random() * 5)] : undefined
          };
        });
        
        // Mock token balances
        const mockTokens: TokenBalance[] = Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, i) => ({
          contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          symbol: ['YAFA', 'USDC', 'WETH', 'DAI', 'LINK', 'UNI', 'AAVE'][i % 7],
          name: ['Yafa Token', 'USD Coin', 'Wrapped Ether', 'Dai Stablecoin', 'Chainlink', 'Uniswap', 'Aave'][i % 7],
          balance: (Math.random() * 10000).toFixed(2),
          decimals: 18,
          value: (Math.random() * 50000).toFixed(2),
          price: (Math.random() * 100).toFixed(4)
        }));
        
        setAddressDetails(mockAddress);
        setTransactions(mockTransactions);
        setTokenBalances(mockTokens);
        setTotalPages(Math.ceil(mockAddress.transactionCount / 25));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch address details');
        console.error('Address fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddressDetails();
  }, [address, currentPage]);

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

  const formatBalance = (balance: string, decimals: number = 18) => {
    const value = parseFloat(balance);
    if (value === 0) return '0';
    if (value < 0.000001) return '< 0.000001';
    if (value < 1) return value.toFixed(6);
    if (value < 1000) return value.toFixed(4);
    if (value < 1000000) return `${(value / 1000).toFixed(2)}K`;
    return `${(value / 1000000).toFixed(2)}M`;
  };

  const truncateHash = (hash: string, start = 8, end = 6) => {
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-400" />;
    
    switch (type) {
      case 'in':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'out':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case 'self':
        return <Activity className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'all') return true;
    if (filterType === 'in') return tx.type === 'in';
    if (filterType === 'out') return tx.type === 'out';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-400">Loading address details...</p>
        </div>
      </div>
    );
  }

  if (error || !addressDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Address Not Found</h2>
          <p className="text-green-500/70 mb-4">{error || 'The address you are looking for does not exist.'}</p>
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
                { name: 'Transactions', href: '/transactions', icon: Activity },
                { name: 'Tokens', href: '/tokens', icon: Users },
                { name: 'Stats', href: '/stats', icon: Zap }
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-green-500/70 hover:text-green-400 transition-colors group"
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
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-green-500/70 text-sm mb-6">
          <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
          <span>→</span>
          <span className="text-green-100">Address Details</span>
        </div>

        {/* Address Header */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <Wallet className="w-6 h-6 text-green-400" />
                <h1 className="text-2xl font-bold text-green-100">
                  {addressDetails.type === 'Contract' ? 'Contract' : 'Address'}
                </h1>
                {addressDetails.type === 'Contract' && addressDetails.isVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono text-green-400 text-sm lg:text-base break-all">
                  {addressDetails.address}
                </span>
                <button
                  onClick={() => copyToClipboard(addressDetails.address, 'address')}
                  className="text-green-400 hover:text-green-300 transition-colors flex-shrink-0"
                >
                  {copiedField === 'address' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              {addressDetails.contractName && (
                <p className="text-green-500/70">Contract: {addressDetails.contractName}</p>
              )}
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-green-100 mb-1">
                {formatBalance(addressDetails.balance)} ETH
              </div>
              <div className="text-green-500/70 text-lg">
                ≈ ${formatNumber(parseFloat(addressDetails.balanceUSD))} USD
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Transactions', 
              value: formatNumber(addressDetails.transactionCount), 
              icon: Activity,
              color: 'blue'
            },
            { 
              label: 'Current Nonce', 
              value: formatNumber(addressDetails.nonce), 
              icon: Clock,
              color: 'green'
            },
            { 
              label: 'First Seen', 
              value: formatTimeAgo(addressDetails.firstSeen), 
              icon: Users,
              color: 'purple'
            },
            { 
              label: 'Last Seen', 
              value: formatTimeAgo(addressDetails.lastSeen), 
              icon: Zap,
              color: 'yellow'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 bg-${stat.color}-400/20 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-100 mb-1">{stat.value}</div>
              <div className="text-green-500/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Tabs */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-green-500/20 rounded-xl overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-green-500/20">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'transactions', name: `Transactions (${addressDetails.transactionCount})`, icon: Activity },
                { id: 'tokens', name: `Tokens (${tokenBalances.length})`, icon: Globe },
                { id: 'internal', name: 'Internal Txns', icon: FileText },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp }
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
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <select 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="bg-gray-800/50 border border-green-500/30 text-green-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50"
                    >
                      <option value="all">All Transactions</option>
                      <option value="in">Incoming</option>
                      <option value="out">Outgoing</option>
                    </select>
                    
                    <button className="flex items-center space-x-2 bg-gray-800/50 border border-green-500/30 text-green-400 px-3 py-2 rounded-lg hover:bg-gray-800/70 transition-all text-sm">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>

                  <div className="text-sm text-green-500/70">
                    Showing {filteredTransactions.length} of {addressDetails.transactionCount} transactions
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-green-500/20">
                        <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Txn Hash</th>
                        <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Method</th>
                        <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Block</th>
                        <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Age</th>
                        <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">From/To</th>
                        <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Value</th>
                        <th className="text-left py-3 text-xs font-medium text-green-400 uppercase tracking-wider">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.hash} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getTransactionIcon(tx.type, tx.status)}
                              <Link 
                                href={`/tx/${tx.hash}`}
                                className="text-green-400 hover:text-green-300 font-mono text-sm transition-colors"
                              >
                                {truncateHash(tx.hash, 6, 4)}
                              </Link>
                            </div>
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            {tx.method ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                {tx.method}
                              </span>
                            ) : (
                              <span className="text-green-500/70 text-sm">Transfer</span>
                            )}
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <Link 
                              href={`/block/${tx.blockNumber}`}
                              className="text-green-400 hover:text-green-300 transition-colors text-sm"
                            >
                              {formatNumber(tx.blockNumber)}
                            </Link>
                          </td>
                          <td className="py-4 whitespace-nowrap text-green-500/70 text-sm">
                            {formatTimeAgo(tx.timestamp)}
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <span className="text-green-500/70 text-xs">From:</span>
                                <Link 
                                  href={`/address/${tx.from}`}
                                  className="text-green-400 hover:text-green-300 font-mono text-xs transition-colors"
                                >
                                  {truncateHash(tx.from, 6, 4)}
                                </Link>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-green-500/70 text-xs">To:</span>
                                <Link 
                                  href={`/address/${tx.to}`}
                                  className="text-green-400 hover:text-green-300 font-mono text-xs transition-colors"
                                >
                                  {truncateHash(tx.to, 6, 4)}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              tx.type === 'in' ? 'text-green-400' : 
                              tx.type === 'out' ? 'text-red-400' : 'text-blue-400'
                            }`}>
                              {tx.type === 'in' ? '+' : tx.type === 'out' ? '-' : ''}{formatBalance(tx.value)} ETH
                            </div>
                          </td>
                          <td className="py-4 whitespace-nowrap text-green-500/70 text-sm">
                            {formatBalance((parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice) / 1e9).toString())} ETH
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-green-500/70">
                    Page {currentPage} of {formatNumber(totalPages)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-gray-800/50 border border-green-500/30 text-green-400 rounded-lg hover:bg-gray-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-gray-800/50 border border-green-500/30 text-green-400 rounded-lg hover:bg-gray-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="space-y-4">
                {tokenBalances.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {tokenBalances.map((token, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-green-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                              <span className="text-green-400 font-bold text-sm">{token.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-green-100 font-semibold">{token.symbol}</p>
                              <p className="text-green-500/70 text-sm">{token.name}</p>
                            </div>
                          </div>
                          <Link 
                            href={`/token/${token.contractAddress}`}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-green-500/70">Balance</span>
                            <span className="text-green-100 font-medium">{formatBalance(token.balance)} {token.symbol}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-500/70">Value</span>
                            <span className="text-green-100">${formatNumber(parseFloat(token.value))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-500/70">Price</span>
                            <span className="text-green-100">${token.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 text-green-400/50 mx-auto mb-4" />
                    <p className="text-green-500/70">No token balances found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'internal' && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-green-400/50 mx-auto mb-4" />
                <p className="text-green-500/70">Internal transactions coming soon</p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-green-400/50 mx-auto mb-4" />
                <p className="text-green-500/70">Address analytics coming soon</p>
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