import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

interface Transaction {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: string;
  age?: number;
  method?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  className?: string;
  compact?: boolean;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  className = '',
  compact = false
}) => {
  const formatHash = (hash: string): string => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatValue = (value: string): string => {
    const ethValue = parseFloat(value);
    if (ethValue === 0) return '0';
    if (ethValue < 0.001) return '<0.001';
    if (ethValue < 1) return ethValue.toFixed(6);
    return ethValue.toFixed(4);
  };

  const formatGwei = (wei: string): string => {
    const gwei = parseInt(wei) / 1e9;
    if (gwei < 1) return gwei.toFixed(2);
    return Math.round(gwei).toString();
  };

  const formatAge = (age?: number): string => {
    if (!age) return 'Just now';
    if (age < 60) return `${age}s ago`;
    if (age < 3600) return `${Math.floor(age / 60)}m ago`;
    if (age < 86400) return `${Math.floor(age / 3600)}h ago`;
    return `${Math.floor(age / 86400)}d ago`;
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'success':
      case '1':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed':
      case '0':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'success':
      case '1':
        return 'text-emerald-400 bg-emerald-500/20';
      case 'failed':
      case '0':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getMethodDisplay = () => {
    if (!transaction.method) return 'Transfer';
    if (transaction.method === '0x') return 'Transfer';
    return transaction.method;
  };

  if (compact) {
    return (
      <div className={`yafa-card py-3 px-4 hover:border-green-400/50 transition-all duration-300 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getStatusIcon()}
            <Link 
              href={`/tx/${transaction.hash}`}
              className="text-green-400 hover:text-green-300 transition-colors font-mono text-sm truncate"
            >
              {formatHash(transaction.hash)}
            </Link>
            <span className="text-green-500/60 text-xs">
              {getMethodDisplay()}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-400 font-medium">
              {formatValue(transaction.value)} ETH
            </span>
            <span className="text-green-500/60">
              {formatAge(transaction.age)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`yafa-card group hover:border-green-400/50 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
            {getStatusIcon()}
          </div>
          <div>
            <Link 
              href={`/tx/${transaction.hash}`}
              className="text-lg font-bold text-green-400 hover:text-green-300 transition-colors font-mono"
            >
              {formatHash(transaction.hash)}
            </Link>
            <p className="text-green-500/60 text-sm">
              {formatAge(transaction.age)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {transaction.status === '1' || transaction.status === 'success' ? 'Success' : 
             transaction.status === '0' || transaction.status === 'failed' ? 'Failed' : 'Pending'}
          </div>
          <div className="text-sm text-green-500/70 mt-1">
            Block #{transaction.blockNumber}
          </div>
        </div>
      </div>

      {/* Transaction Flow */}
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <p className="text-green-500/70 text-xs uppercase tracking-wide mb-1">
              From
            </p>
            <Link 
              href={`/address/${transaction.from}`}
              className="text-green-400 text-sm font-mono hover:text-green-300 transition-colors"
            >
              {formatAddress(transaction.from)}
            </Link>
          </div>
          
          <ArrowRight className="w-5 h-5 text-green-500/60 flex-shrink-0" />
          
          <div className="flex-1">
            <p className="text-green-500/70 text-xs uppercase tracking-wide mb-1">
              To
            </p>
            <Link 
              href={`/address/${transaction.to}`}
              className="text-green-400 text-sm font-mono hover:text-green-300 transition-colors"
            >
              {formatAddress(transaction.to)}
            </Link>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-500/70 text-xs uppercase tracking-wide">
              Value
            </span>
          </div>
          <p className="text-green-400 text-sm font-medium">
            {formatValue(transaction.value)} ETH
          </p>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-green-500/70" />
            <span className="text-green-500/70 text-xs uppercase tracking-wide">
              Gas Price
            </span>
          </div>
          <p className="text-green-400 text-sm font-medium">
            {formatGwei(transaction.gasPrice)} Gwei
          </p>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-500/70 text-xs uppercase tracking-wide">
              Method
            </span>
          </div>
          <p className="text-green-400 text-sm font-medium">
            {getMethodDisplay()}
          </p>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
};

export default TransactionCard;