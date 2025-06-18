import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { usePairInfo } from '@/hooks/usePairInfo';

// Contract addresses
const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || '0x2E51daEaaF8497fC725900c9f46caDbC0a1d01f5';

// Router ABI for remove liquidity
const ROUTER_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'liquidity', type: 'uint256' },
      { name: 'amountAMin', type: 'uint256' },
      { name: 'amountBMin', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    name: 'removeLiquidity',
    outputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

interface LiquidityPosition {
  pairAddress: string;
  tokenA: {
    symbol: string;
    address: string;
    decimals: number;
    logoUrl?: string;
  };
  tokenB: {
    symbol: string;
    address: string;
    decimals: number;
    logoUrl?: string;
  };
  lpBalance: string;
  totalSupply: string;
  reserve0: string;
  reserve1: string;
  sharePercentage: number;
  pooledTokenA: string;
  pooledTokenB: string;
  feesEarned?: string;
}

const ViewPositions = () => {
  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<LiquidityPosition | null>(null);
  const [removeAmount, setRemoveAmount] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Mock positions data - replace with actual contract calls
  const fetchPositions = useCallback(async () => {
    if (!address || !isConnected) {
      setPositions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // This is mock data - replace with actual multicall to fetch user's LP positions
      const mockPositions: LiquidityPosition[] = [
        {
          pairAddress: '0x1234...5678',
          tokenA: {
            symbol: 'ETH',
            address: '0x0000000000000000000000000000000000000000',
            decimals: 18,
            logoUrl: '/tokens/eth.png'
          },
          tokenB: {
            symbol: 'WETH',
            address: '0x...',
            decimals: 18,
            logoUrl: '/tokens/weth.png'
          },
          lpBalance: '1.234567',
          totalSupply: '100.000000',
          reserve0: '50.000000',
          reserve1: '50.000000',
          sharePercentage: 1.23,
          pooledTokenA: '0.617284',
          pooledTokenB: '0.617284',
          feesEarned: '0.0025'
        },
        {
          pairAddress: '0x9876...5432',
          tokenA: {
            symbol: 'TKA',
            address: '0x...',
            decimals: 18,
            logoUrl: '/tokens/tka.png'
          },
          tokenB: {
            symbol: 'TKB',
            address: '0x...',
            decimals: 18,
            logoUrl: '/tokens/tkb.png'
          },
          lpBalance: '5.678901',
          totalSupply: '200.000000',
          reserve0: '100.000000',
          reserve1: '200.000000',
          sharePercentage: 2.84,
          pooledTokenA: '2.839451',
          pooledTokenB: '5.678902',
          feesEarned: '0.0156'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPositions(mockPositions);
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const removeLiquidity = async () => {
    if (!selectedPosition || !removeAmount || !address) return;
    
    try {
      const liquidityToRemove = parseUnits(removeAmount, 18); // LP tokens are usually 18 decimals
      const amountAMin = parseUnits(
        (parseFloat(selectedPosition.pooledTokenA) * parseFloat(removeAmount) / parseFloat(selectedPosition.lpBalance) * (1 - slippage / 100)).toString(),
        selectedPosition.tokenA.decimals
      );
      const amountBMin = parseUnits(
        (parseFloat(selectedPosition.pooledTokenB) * parseFloat(removeAmount) / parseFloat(selectedPosition.lpBalance) * (1 - slippage / 100)).toString(),
        selectedPosition.tokenB.decimals
      );
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
      
      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'removeLiquidity',
        args: [
          selectedPosition.tokenA.address,
          selectedPosition.tokenB.address,
          liquidityToRemove,
          amountAMin,
          amountBMin,
          address,
          deadline
        ]
      });
    } catch (error) {
      console.error('Remove liquidity failed:', error);
    }
  };

  const handleRemoveClick = (position: LiquidityPosition) => {
    setSelectedPosition(position);
    setRemoveAmount('');
    setShowRemoveModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-green-400 text-lg">Loading your positions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10 text-center">
          <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-2xl font-bold text-green-400 mb-2">Connect Your Wallet</h3>
          <p className="text-green-500/70">Connect your wallet to view your liquidity positions</p>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10 text-center">
          <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-2xl font-bold text-green-400 mb-2">No Liquidity Positions</h3>
          <p className="text-green-500/70 mb-6">You haven't provided liquidity to any pools yet</p>
          <button 
            onClick={() => window.location.href = '/pool'}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105"
          >
            Add Your First Position
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
              Your Liquidity Positions
            </h2>
            <div className="text-right">
              <p className="text-green-500/60 text-sm uppercase tracking-wide">Total Positions</p>
              <p className="text-green-400 font-bold text-2xl">{positions.length}</p>
            </div>
          </div>

          <div className="space-y-4">
            {positions.map((position, index) => (
              <div 
                key={position.pairAddress}
                className="bg-gray-950/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Pool Info */}
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      <img 
                        src={position.tokenA.logoUrl || '/tokens/default.png'} 
                        alt={position.tokenA.symbol}
                        className="w-10 h-10 rounded-full border-2 border-gray-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/tokens/default.png';
                        }}
                      />
                      <img 
                        src={position.tokenB.logoUrl || '/tokens/default.png'} 
                        alt={position.tokenB.symbol}
                        className="w-10 h-10 rounded-full border-2 border-gray-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/tokens/default.png';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-green-400 font-bold text-xl">
                        {position.tokenA.symbol}/{position.tokenB.symbol}
                      </h3>
                      <p className="text-green-500/70 text-sm">Pool Share: {position.sharePercentage.toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* Position Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1">Pooled {position.tokenA.symbol}</p>
                      <p className="text-green-400 font-bold">{parseFloat(position.pooledTokenA).toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1">Pooled {position.tokenB.symbol}</p>
                      <p className="text-green-400 font-bold">{parseFloat(position.pooledTokenB).toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1">LP Tokens</p>
                      <p className="text-green-400 font-bold">{parseFloat(position.lpBalance).toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1">Fees Earned</p>
                      <p className="text-green-400 font-bold">{position.feesEarned || '0.0000'} ETH</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.location.href = `/pool?tokenA=${position.tokenA.address}&tokenB=${position.tokenB.address}`}
                      className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 hover:border-green-500/50 transition-all font-medium text-sm"
                    >
                      Add More
                    </button>
                    <button 
                      onClick={() => handleRemoveClick(position)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 transition-all font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Detailed Stats (Expandable) */}
                <div className="mt-4 pt-4 border-t border-green-500/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-500/70">Total Reserve A:</span>
                      <span className="text-green-400 font-semibold">{parseFloat(position.reserve0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-500/70">Total Reserve B:</span>
                      <span className="text-green-400 font-semibold">{parseFloat(position.reserve1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-500/70">Total Supply:</span>
                      <span className="text-green-400 font-semibold">{parseFloat(position.totalSupply).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-500/70">Pair Address:</span>
                      <span className="text-green-400 font-semibold">{position.pairAddress.slice(0, 6)}...{position.pairAddress.slice(-4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-green-500/70 text-sm mb-1">Total Value Locked</p>
              <p className="text-green-400 font-bold text-xl">$0.00</p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-green-500/70 text-sm mb-1">Total Fees Earned</p>
              <p className="text-green-400 font-bold text-xl">
                {positions.reduce((sum, pos) => sum + parseFloat(pos.feesEarned || '0'), 0).toFixed(4)} ETH
              </p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-green-500/70 text-sm mb-1">Average APY</p>
              <p className="text-green-400 font-bold text-xl">---%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Liquidity Modal */}
      {showRemoveModal && selectedPosition && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-green-400">Remove Liquidity</h3>
              <button 
                onClick={() => setShowRemoveModal(false)}
                className="text-green-500/70 hover:text-green-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex -space-x-2">
                  <img 
                    src={selectedPosition.tokenA.logoUrl || '/tokens/default.png'} 
                    alt={selectedPosition.tokenA.symbol}
                    className="w-8 h-8 rounded-full border-2 border-gray-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/tokens/default.png';
                    }}
                  />
                  <img 
                    src={selectedPosition.tokenB.logoUrl || '/tokens/default.png'} 
                    alt={selectedPosition.tokenB.symbol}
                    className="w-8 h-8 rounded-full border-2 border-gray-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/tokens/default.png';
                    }}
                  />
                </div>
                <span className="text-green-400 font-bold text-lg">
                  {selectedPosition.tokenA.symbol}/{selectedPosition.tokenB.symbol}
                </span>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <p className="text-green-500/70 text-sm mb-2">Amount to Remove</p>
                <div className="flex gap-2 mb-3">
                  {[25, 50, 75, 100].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setRemoveAmount((parseFloat(selectedPosition.lpBalance) * percent / 100).toString())}
                      className="flex-1 py-2 px-3 bg-gray-700/50 text-green-400 rounded-lg hover:bg-gray-600/50 transition-all text-sm font-medium"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={removeAmount}
                  onChange={(e) => setRemoveAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-gray-700/50 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 font-bold focus:border-green-400 focus:outline-none"
                />
                <p className="text-green-500/60 text-xs mt-2">
                  Available: {selectedPosition.lpBalance} LP tokens
                </p>
              </div>

              {removeAmount && parseFloat(removeAmount) > 0 && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  <p className="text-green-400 font-semibold mb-3">You will receive:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-500/70">{selectedPosition.tokenA.symbol}:</span>
                      <span className="text-green-400 font-bold">
                        {(parseFloat(selectedPosition.pooledTokenA) * parseFloat(removeAmount) / parseFloat(selectedPosition.lpBalance)).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-500/70">{selectedPosition.tokenB.symbol}:</span>
                      <span className="text-green-400 font-bold">
                        {(parseFloat(selectedPosition.pooledTokenB) * parseFloat(removeAmount) / parseFloat(selectedPosition.lpBalance)).toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="mb-6">
              <h4 className="text-green-400 font-semibold mb-3">Slippage Tolerance</h4>
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-3 py-2 rounded-lg transition-all ${
                      slippage === value
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-gray-800/50 text-green-500/70 border border-green-500/20 hover:bg-gray-700/50'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Status */}
            {hash && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm">
                  {isConfirming ? 'Confirming transaction...' : isSuccess ? 'Liquidity removed successfully!' : 'Transaction submitted'}
                </p>
                {hash && (
                  <p className="text-green-500/70 text-xs mt-1 break-all">
                    Tx: {hash}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRemoveModal(false)}
                disabled={isPending || isConfirming}
                className="flex-1 py-3 bg-gray-800/50 text-green-400 border border-green-500/30 rounded-xl hover:bg-gray-700/50 transition-all font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={removeLiquidity}
                disabled={!removeAmount || parseFloat(removeAmount) <= 0 || parseFloat(removeAmount) > parseFloat(selectedPosition.lpBalance) || isPending || isConfirming}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-400 hover:to-red-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? 'Removing...' : 'Remove Liquidity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewPositions;