// File: pages/pools/all.tsx
import React, { useState, useEffect } from 'react';
import EnhancedNavigation from '@/components/UnifiedNavigation';

interface Pool {
  id: string;
  tokenA: { symbol: string; address: string; logoUrl?: string };
  tokenB: { symbol: string; address: string; logoUrl?: string };
  tvl: number;
  volume24h: number;
  apr: number;
  fee: number;
}

export default function AllPools() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      setPools([
        {
          id: '1',
          tokenA: { symbol: 'ETH', address: '0x...', logoUrl: '/tokens/eth.png' },
          tokenB: { symbol: 'USDC', address: '0x...', logoUrl: '/tokens/usdc.png' },
          tvl: 1250000,
          volume24h: 50000,
          apr: 12.5,
          fee: 0.3
        },
        {
          id: '2', 
          tokenA: { symbol: 'YAFA', address: '0x...', logoUrl: '/tokens/yafa.png' },
          tokenB: { symbol: 'ETH', address: '0x...', logoUrl: '/tokens/eth.png' },
          tvl: 750000,
          volume24h: 25000,
          apr: 18.2,
          fee: 0.3
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Navigation */}
      <EnhancedNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto mt-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              All Liquidity Pools
            </h1>
            <p className="text-green-500/80 text-lg font-medium mt-2">
              Discover and invest in available liquidity pools
            </p>
          </div>

          {/* Pool List */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 shadow-2xl shadow-green-500/10">
            
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 pb-4 border-b border-green-500/20 text-green-500/70 text-sm font-semibold uppercase tracking-wide">
              <div>Pool</div>
              <div className="text-right">TVL</div>
              <div className="text-right">24h Volume</div>
              <div className="text-right">APR</div>
              <div className="text-right">Action</div>
            </div>

            {/* Pool Rows */}
            <div className="space-y-4 mt-6">
              {loading ? (
                // Loading skeleton
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="grid grid-cols-5 gap-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                          <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-700 rounded w-20 ml-auto"></div>
                      <div className="h-4 bg-gray-700 rounded w-16 ml-auto"></div>
                      <div className="h-4 bg-gray-700 rounded w-12 ml-auto"></div>
                      <div className="h-8 bg-gray-700 rounded w-20 ml-auto"></div>
                    </div>
                  </div>
                ))
              ) : pools.length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💧</div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">No Pools Available</h3>
                  <p className="text-green-500/70">Be the first to create a liquidity pool!</p>
                </div>
              ) : (
                // Pool list
                pools.map((pool) => (
                  <div key={pool.id} className="grid grid-cols-5 gap-4 py-4 hover:bg-gray-800/30 rounded-xl transition-colors">
                    
                    {/* Pool Name */}
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        <img 
                          src={pool.tokenA.logoUrl || '/tokens/default.png'} 
                          alt={pool.tokenA.symbol}
                          className="w-8 h-8 rounded-full border-2 border-gray-800"
                        />
                        <img 
                          src={pool.tokenB.logoUrl || '/tokens/default.png'} 
                          alt={pool.tokenB.symbol}
                          className="w-8 h-8 rounded-full border-2 border-gray-800"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-green-400">
                          {pool.tokenA.symbol}/{pool.tokenB.symbol}
                        </div>
                        <div className="text-xs text-green-500/60">
                          {pool.fee}% fee
                        </div>
                      </div>
                    </div>

                    {/* TVL */}
                    <div className="text-right">
                      <div className="font-semibold text-green-400">
                        ${pool.tvl.toLocaleString()}
                      </div>
                    </div>

                    {/* 24h Volume */}
                    <div className="text-right">
                      <div className="font-semibold text-green-400">
                        ${pool.volume24h.toLocaleString()}
                      </div>
                    </div>

                    {/* APR */}
                    <div className="text-right">
                      <div className="font-semibold text-emerald-400">
                        {pool.apr}%
                      </div>
                    </div>

                    {/* Action */}
                    <div className="text-right">
                      <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold rounded-lg hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105">
                        Add Liquidity
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}