// File: src/components/PoolCard.tsx
import React from 'react';
import Link from 'next/link';

interface TokenInfo {
  symbol: string;
  address: string;
  logoUrl?: string;
  decimals: number;
  price: number;
}

interface Pool {
  id: string;
  address: string;
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  tvl: number;
  volume24h: number;
  volume7d: number;
  fees24h: number;
  apr: number;
  apy: number;
  fee: number;
  liquidity: number;
  lpTokens: number;
  reserve0: number;
  reserve1: number;
  poolShare: number;
  priceChange24h: number;
  volumeChange24h: number;
  transactions24h: number;
  uniqueUsers24h: number;
  createdAt: string;
  lastActivity: string;
}

interface PoolCardProps {
  pool: Pool;
}

const PoolCard: React.FC<PoolCardProps> = ({ pool }) => {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (num: number) => {
    const isPositive = num >= 0;
    return (
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
        {isPositive ? '+' : ''}{num.toFixed(2)}%
      </span>
    );
  };

  return (
    <>
      {/* Desktop Table Row */}
      <div className="hidden md:grid grid-cols-6 gap-6 items-center py-4 px-6 hover:bg-green-500/5 transition-colors group border-b border-green-500/10">
        
        {/* Pool Pair */}
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2">
            <img 
              src="/tokens/default.svg"
              alt={pool.tokenA.symbol}
              className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800"
            />
            <img 
              src="/tokens/default.svg"
              alt={pool.tokenB.symbol}
              className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800"
            />
          </div>
          <div>
            <div className="font-mono font-bold text-green-400 text-lg">
              {pool.tokenA.symbol}/{pool.tokenB.symbol}
            </div>
            <div className="text-green-500/60 text-xs">
              {pool.fee}% fee
            </div>
          </div>
        </div>

        {/* TVL */}
        <div className="text-right">
          <div className="font-mono font-bold text-green-400 text-lg">
            {formatNumber(pool.tvl)}
          </div>
          <div className="text-green-500/60 text-xs">
            Total Value Locked
          </div>
        </div>

        {/* 24h Volume */}
        <div className="text-right">
          <div className="font-mono font-bold text-green-400 text-lg">
            {formatNumber(pool.volume24h)}
          </div>
          <div className="text-xs">
            {formatPercentage(pool.volumeChange24h)}
          </div>
        </div>

        {/* 24h Fees */}
        <div className="text-right">
          <div className="font-mono font-bold text-green-400 text-lg">
            {formatNumber(pool.fees24h)}
          </div>
          <div className="text-green-500/60 text-xs">
            {pool.transactions24h} txns
          </div>
        </div>

        {/* APR */}
        <div className="text-right">
          <div className="font-mono font-bold text-green-400 text-xl">
            {pool.apr.toFixed(1)}%
          </div>
          <div className="text-green-500/60 text-xs">
            APR
          </div>
        </div>

        {/* Action */}
        <div className="text-right">
          <Link
            href={`/pools/new?pair=${pool.tokenA.symbol}_${pool.tokenB.symbol}`}
            className="inline-flex items-center px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 hover:border-green-400 rounded-lg text-green-400 font-mono font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
            aria-label={`Add liquidity to ${pool.tokenA.symbol}/${pool.tokenB.symbol} pool`}
          >
            Add Liquidity
          </Link>
        </div>
      </div>

      {/* Mobile Card */}
      <div className="md:hidden bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-xl p-4 mb-4 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              <img 
                src="/tokens/default.svg"
                alt={pool.tokenA.symbol}
                className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-800"
              />
              <img 
                src="/tokens/default.svg"
                alt={pool.tokenB.symbol}
                className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-800"
              />
            </div>
            <div>
              <div className="font-mono font-bold text-green-400 text-lg">
                {pool.tokenA.symbol}/{pool.tokenB.symbol}
              </div>
              <div className="text-green-500/60 text-xs">
                {pool.fee}% fee
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-green-400 text-lg">
              {pool.apr.toFixed(1)}%
            </div>
            <div className="text-green-500/60 text-xs">APR</div>
          </div>
        </div>

        {/* Mobile Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-950/50 rounded-lg p-3">
            <div className="text-green-500/60 text-xs mb-1">TVL</div>
            <div className="font-mono font-bold text-green-400">
              {formatNumber(pool.tvl)}
            </div>
          </div>
          <div className="bg-gray-950/50 rounded-lg p-3">
            <div className="text-green-500/60 text-xs mb-1">24h Volume</div>
            <div className="font-mono font-bold text-green-400">
              {formatNumber(pool.volume24h)}
            </div>
          </div>
          <div className="bg-gray-950/50 rounded-lg p-3">
            <div className="text-green-500/60 text-xs mb-1">24h Fees</div>
            <div className="font-mono font-bold text-green-400">
              {formatNumber(pool.fees24h)}
            </div>
          </div>
          <div className="bg-gray-950/50 rounded-lg p-3">
            <div className="text-green-500/60 text-xs mb-1">Transactions</div>
            <div className="font-mono font-bold text-green-400">
              {pool.transactions24h}
            </div>
          </div>
        </div>

        {/* Mobile Action */}
        <Link
          href={`/pools/new?pair=${pool.tokenA.symbol}_${pool.tokenB.symbol}`}
          className="block w-full text-center py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 hover:border-green-400 rounded-lg text-green-400 font-mono font-bold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
          aria-label={`Add liquidity to ${pool.tokenA.symbol}/${pool.tokenB.symbol} pool`}
        >
          Add Liquidity
        </Link>
      </div>
    </>
  );
};

export default PoolCard;