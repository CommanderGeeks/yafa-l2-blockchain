import React from 'react';
import Link from 'next/link';
import { Clock, Zap, Database } from 'lucide-react';

interface Block {
  number: string;
  hash: string;
  timestamp: string;
  gasUsed: string;
  gasLimit: string;
  gasUsedPercent?: string;
  miner?: string;
  transactionCount: number;
  age?: number;
}

interface BlockCardProps {
  block: Block;
  className?: string;
}

const BlockCard: React.FC<BlockCardProps> = ({ block, className = '' }) => {
  const formatHash = (hash: string): string => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatAge = (timestamp: string): string => {
    const now = Date.now();
    const blockTime = new Date(timestamp).getTime();
    const diffSeconds = Math.floor((now - blockTime) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  const formatGas = (gas: string): string => {
    const gasNum = parseInt(gas);
    if (gasNum >= 1000000) {
      return `${(gasNum / 1000000).toFixed(2)}M`;
    }
    if (gasNum >= 1000) {
      return `${(gasNum / 1000).toFixed(1)}K`;
    }
    return gasNum.toString();
  };

  const getUtilizationColor = (percent: number): string => {
    if (percent >= 90) return 'text-red-400 bg-red-500/20';
    if (percent >= 70) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const utilizationPercent = block.gasUsedPercent 
    ? parseFloat(block.gasUsedPercent)
    : Math.floor((parseInt(block.gasUsed) / parseInt(block.gasLimit)) * 100);

  return (
    <div className={`yafa-card group hover:border-green-400/50 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
            <Database className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <Link 
              href={`/block/${block.number}`}
              className="text-lg font-bold text-green-400 hover:text-green-300 transition-colors"
            >
              #{block.number}
            </Link>
            <p className="text-green-500/60 text-sm">
              {formatAge(block.timestamp)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-green-500/70">
            {block.transactionCount} txs
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${getUtilizationColor(utilizationPercent)}`}>
            {utilizationPercent}% gas
          </div>
        </div>
      </div>

      {/* Block Hash */}
      <div className="mb-4">
        <p className="text-green-500/70 text-xs uppercase tracking-wide mb-1">
          Block Hash
        </p>
        <Link 
          href={`/block/${block.number}`}
          className="text-green-400 text-sm font-mono hover:text-green-300 transition-colors"
        >
          {formatHash(block.hash)}
        </Link>
      </div>

      {/* Block Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-green-500/70" />
            <span className="text-green-500/70 text-xs uppercase tracking-wide">
              Gas Used
            </span>
          </div>
          <p className="text-green-400 text-sm font-medium">
            {formatGas(block.gasUsed)} / {formatGas(block.gasLimit)}
          </p>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-green-500/70" />
            <span className="text-green-500/70 text-xs uppercase tracking-wide">
              Timestamp
            </span>
          </div>
          <p className="text-green-400 text-sm font-medium">
            {new Date(block.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Miner (if available) */}
      {block.miner && (
        <div className="mt-4 pt-4 border-t border-green-500/20">
          <p className="text-green-500/70 text-xs uppercase tracking-wide mb-1">
            Miner
          </p>
          <Link 
            href={`/address/${block.miner}`}
            className="text-green-400 text-sm font-mono hover:text-green-300 transition-colors"
          >
            {formatHash(block.miner)}
          </Link>
        </div>
      )}

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
};

export default BlockCard;