import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Define supported networks
const SUPPORTED_NETWORKS = {
  1: { name: 'Ethereum Mainnet', color: 'blue' },
  11155111: { name: 'Sepolia Testnet', color: 'purple' },
  137: { name: 'Polygon', color: 'purple' },
  42161: { name: 'Arbitrum', color: 'blue' },
  8453: { name: 'Base', color: 'blue' }
};

const Bridge = () => {
  const [amount, setAmount] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [balanceError, setBalanceError] = useState(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const { data: balanceData, error: balanceQueryError, refetch: refetchBalance } = useBalance({
    address: address,
  });

  const currentChainInfo = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
  const balance = balanceData ? formatEther(balanceData.value) : '0';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (balanceQueryError) {
      setBalanceError(true);
      console.error('Balance fetch error:', balanceQueryError);
    } else {
      setBalanceError(false);
    }
  }, [balanceQueryError]);

  const handleMaxClick = () => {
    if (balanceData) {
      const maxAmount = Math.max(0, parseFloat(balance) - 0.01).toString();
      setAmount(maxAmount);
    }
  };

  const getBalanceDisplay = () => {
    if (!isMounted) return 'Loading...';
    if (balanceError) return 'Error loading balance';
    if (!isConnected) return 'Connect wallet';
    return `${parseFloat(balance).toFixed(6)} ETH`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10">
        
        {/* Bridge Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent animate-gradient">
            Bridge Assets
          </h2>
          <p className="text-green-500/70 text-lg">Transfer tokens between Ethereum and Yafa L2</p>
        </div>

        {/* Network Warning */}
        {isConnected && !currentChainInfo && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-red-400 font-semibold">Unsupported Network</p>
                <p className="text-red-300/80 text-sm">Please switch to a supported network to continue.</p>
              </div>
            </div>
          </div>
        )}

        {/* Network Selector */}
        {isConnected && currentChainInfo && (
          <div className="mb-6 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full bg-${currentChainInfo.color}-400 animate-pulse`}></div>
                <div>
                  <p className="text-green-400 font-semibold">Connected to {currentChainInfo.name}</p>
                  <p className="text-green-500/70 text-sm">Ready to bridge assets</p>
                </div>
              </div>
              <button 
                onClick={() => refetchBalance()}
                className="text-green-400 hover:text-green-300 transition-colors p-2 rounded-lg hover:bg-green-500/10"
                title="Refresh balance"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* From Section */}
        <div className="mb-6">
          <div className="bg-gray-950/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
            <div className="flex justify-between items-center mb-4">
              <label className="text-green-400 text-sm font-bold uppercase tracking-wider opacity-80">
                From
              </label>
              <div className="text-right">
                <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1">Balance</p>
                <p className={`font-bold text-sm ${
                  balanceError || (!isMounted && isConnected) ? 'text-red-400' : 'text-green-400'
                }`}>
                  {getBalanceDisplay()}
                </p>
                {isMounted && balanceError && (
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-xs text-yellow-400 hover:text-yellow-300 underline mt-1"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                className="w-full bg-gray-800/40 backdrop-blur-sm border border-green-500/30 rounded-xl px-6 py-5 text-green-400 text-2xl font-bold focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder-green-600/40 hover:bg-gray-700/40 pr-20"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                disabled={!isConnected}
              />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 text-sm font-bold transition-colors px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMaxClick}
                disabled={!isConnected || parseFloat(balance) <= 0}
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* Bridge Direction Arrow */}
        <div className="flex justify-center my-4">
          <button className="bg-gray-900/60 backdrop-blur-sm border-2 border-green-400/30 rounded-full p-4 shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 hover:scale-110 hover:rotate-180 group">
            <svg className="w-6 h-6 text-green-400 group-hover:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Section */}
        <div className="mb-8">
          <div className="bg-gray-950/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
            <label className="block text-green-400 text-sm font-bold mb-4 uppercase tracking-wider opacity-80">
              To
            </label>
            
            <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-green-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">Y</span>
                </div>
                <div>
                  <p className="text-green-400 font-bold">Yafa L2</p>
                  <p className="text-green-500/70 text-xs">Chain ID: 42069</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold text-lg">{amount || '0.0'}</p>
                <p className="text-green-500/60 text-xs">Estimated receive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bridge Summary */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mb-8 p-5 bg-green-500/5 backdrop-blur-sm border border-green-500/20 rounded-xl">
            <h3 className="text-green-400 font-semibold text-sm mb-4 uppercase tracking-wide">
              Bridge Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-green-500/70">You send:</span>
                <span className="text-green-400 font-semibold">{amount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">You receive:</span>
                <span className="text-green-400 font-semibold">{amount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Bridge fee:</span>
                <span className="text-green-400 font-semibold">0.001 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Est. time:</span>
                <span className="text-green-400 font-semibold">~2-5 min</span>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Button */}
        <button 
          className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
            isConnected && amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(balance)
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isConnected || !amount || parseFloat(amount) <= 0}
        >
          {!isConnected ? 'Connect Wallet to Bridge' : !amount || parseFloat(amount) <= 0 ? 'Enter Amount' : '🚀 Bridge Assets'}
        </button>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-3 mt-6 text-sm">
          <div className={`w-2 h-2 rounded-full ${isMounted && isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'} shadow-lg ${isMounted && isConnected ? 'shadow-green-400/50' : 'shadow-yellow-500/50'}`}></div>
          <span className="text-green-500/70 font-medium">
            {!isMounted ? 'Loading...' : isConnected ? 'Ready to bridge' : 'Wallet not connected'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          <button className="py-3 px-4 bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl text-green-400 hover:bg-gray-800/50 hover:border-green-500/40 transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </button>
          <button className="py-3 px-4 bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl text-green-400 hover:bg-gray-800/50 hover:border-green-500/40 transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics</span>
          </button>
          <button className="py-3 px-4 bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl text-green-400 hover:bg-gray-800/50 hover:border-green-500/40 transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span>Support</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-green-500/70 text-sm font-medium">Powered by YAFA L2 Technology</p>
        </div>
        <div className="flex justify-center items-center space-x-6 text-xs text-green-600/60">
          <div className="flex items-center space-x-1 hover:text-green-500 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">Secure</span>
          </div>
          <div className="flex items-center space-x-1 hover:text-green-500 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium">Fast</span>
          </div>
          <div className="flex items-center space-x-1 hover:text-green-500 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Low Fees</span>
          </div>
          <div className="flex items-center space-x-1 hover:text-green-500 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">Audited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bridge;