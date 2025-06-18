import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, formatEther } from 'viem';

// Mock token list - replace with your actual deployed tokens
const TOKEN_LIST = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000', // ETH placeholder
    decimals: 18,
    logoUrl: '/tokens/eth.png'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: process.env.NEXT_PUBLIC_WETH_ADDRESS || '0x...', // Your WETH address
    decimals: 18,
    logoUrl: '/tokens/weth.png'
  },
  {
    symbol: 'TKA',
    name: 'Test Token A',
    address: process.env.NEXT_PUBLIC_TKA_ADDRESS || '0x...', // Your Test Token A address
    decimals: 18,
    logoUrl: '/tokens/tka.png'
  },
  {
    symbol: 'TKB',
    name: 'Test Token B',
    address: process.env.NEXT_PUBLIC_TKB_ADDRESS || '0x...', // Your Test Token B address
    decimals: 18,
    logoUrl: '/tokens/tkb.png'
  }
];

// Contract addresses from your deployment
const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || '0x2E51daEaaF8497fC725900c9f46caDbC0a1d01f5';
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x70cC81e15229fe9A016D147438A8D1a737268328';

// Router ABI (simplified for swapping)
const ROUTER_ABI = [
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    name: 'swapExactTokensForTokens',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' }
    ],
    name: 'getAmountsOut',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const ERC20_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const YafaSwap = () => {
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [balanceA, setBalanceA] = useState('0');
  const [balanceB, setBalanceB] = useState('0');
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');
  
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Fetch token balances
  const fetchBalance = useCallback(async (token: typeof TOKEN_LIST[0], userAddress: string) => {
    if (!publicClient || !userAddress) return '0';
    
    try {
      if (token.address === '0x0000000000000000000000000000000000000000') {
        // ETH balance
        const balance = await publicClient.getBalance({ address: userAddress as `0x${string}` });
        return formatEther(balance);
      } else {
        // ERC20 balance
        const balance = await publicClient.readContract({
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [userAddress]
        });
        return formatUnits(balance as bigint, token.decimals);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }, [publicClient]);

  // Update balances when tokens or address change
  useEffect(() => {
    if (address && isConnected) {
      fetchBalance(tokenA, address).then(setBalanceA);
      fetchBalance(tokenB, address).then(setBalanceB);
    }
  }, [address, isConnected, tokenA, tokenB, fetchBalance]);

  // Get output amount from Router
  const getOutputAmount = useCallback(async (inputAmount: string, fromToken: typeof TOKEN_LIST[0], toToken: typeof TOKEN_LIST[0]) => {
    if (!publicClient || !inputAmount || parseFloat(inputAmount) <= 0) return '0';
    
    try {
      setIsLoadingPrice(true);
      const amountIn = parseUnits(inputAmount, fromToken.decimals);
      const path = [fromToken.address, toToken.address];
      
      const amounts = await publicClient.readContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'getAmountsOut',
        args: [amountIn, path]
      }) as bigint[];
      
      const outputAmount = formatUnits(amounts[1], toToken.decimals);
      
      // Calculate price impact (simplified)
      const inputValue = parseFloat(inputAmount);
      const outputValue = parseFloat(outputAmount);
      const impact = Math.abs((inputValue - outputValue) / inputValue) * 100;
      setPriceImpact(impact);
      
      return outputAmount;
    } catch (error) {
      console.error('Error getting output amount:', error);
      return '0';
    } finally {
      setIsLoadingPrice(false);
    }
  }, [publicClient]);

  // Handle input changes
  useEffect(() => {
    if (swapDirection === 'AtoB' && amountA) {
      getOutputAmount(amountA, tokenA, tokenB).then(setAmountB);
    } else if (swapDirection === 'BtoA' && amountB) {
      getOutputAmount(amountB, tokenB, tokenA).then(setAmountA);
    }
  }, [amountA, amountB, tokenA, tokenB, swapDirection, getOutputAmount]);

  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    setSwapDirection('AtoB');
    if (!value) setAmountB('');
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    setSwapDirection('BtoA');
    if (!value) setAmountA('');
  };

  const handleTokenSwap = () => {
    const tempToken = tokenA;
    const tempAmount = amountA;
    const tempBalance = balanceA;
    
    setTokenA(tokenB);
    setTokenB(tempToken);
    setAmountA(amountB);
    setAmountB(tempAmount);
    setBalanceA(balanceB);
    setBalanceB(tempBalance);
  };

  const handleMaxClick = (isTokenA: boolean) => {
    const balance = isTokenA ? balanceA : balanceB;
    const token = isTokenA ? tokenA : tokenB;
    
    if (parseFloat(balance) > 0) {
      // Leave small amount for gas if ETH
      const maxAmount = token.symbol === 'ETH' 
        ? Math.max(0, parseFloat(balance) - 0.01).toString()
        : balance;
      
      if (isTokenA) {
        handleAmountAChange(maxAmount);
      } else {
        handleAmountBChange(maxAmount);
      }
    }
  };

  const executeSwap = async () => {
    if (!address || !amountA || !amountB) return;
    
    try {
      const inputAmount = parseUnits(amountA, tokenA.decimals);
      const outputAmountMin = parseUnits(
        (parseFloat(amountB) * (1 - slippage / 100)).toString(),
        tokenB.decimals
      );
      const path = [tokenA.address, tokenB.address];
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
      
      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [inputAmount, outputAmountMin, path, address, deadline]
      });
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  const canSwap = () => {
    return (
      isConnected &&
      amountA &&
      amountB &&
      parseFloat(amountA) > 0 &&
      parseFloat(amountA) <= parseFloat(balanceA) &&
      !isPending &&
      !isConfirming
    );
  };

  const TokenSelector = ({ 
    token, 
    onSelect, 
    label 
  }: { 
    token: typeof TOKEN_LIST[0]; 
    onSelect: (token: typeof TOKEN_LIST[0]) => void;
    label: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-gray-800/60 hover:bg-gray-700/60 border border-green-500/30 hover:border-green-400/50 rounded-xl px-4 py-3 transition-all group"
        >
          <img 
            src={token.logoUrl || '/tokens/default.png'} 
            alt={token.symbol}
            className="w-6 h-6 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/tokens/default.png';
            }}
          />
          <span className="text-green-400 font-bold text-lg">{token.symbol}</span>
          <svg 
            className={`w-4 h-4 text-green-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-green-500/30 rounded-xl overflow-hidden z-50 shadow-2xl shadow-green-500/20">
            <div className="p-2">
              <p className="text-green-500/70 text-xs uppercase tracking-wide mb-2 px-2">{label}</p>
              {TOKEN_LIST.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => {
                    onSelect(t);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-green-500/10 rounded-lg transition-all group"
                >
                  <img 
                    src={t.logoUrl || '/tokens/default.png'} 
                    alt={t.symbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/tokens/default.png';
                    }}
                  />
                  <div className="flex-1 text-left">
                    <div className="text-green-400 font-bold">{t.symbol}</div>
                    <div className="text-green-500/70 text-sm">{t.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10">
        
        {/* Swap Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent animate-gradient">
            Swap Tokens
          </h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-gray-900/50 border border-green-500/20 rounded-xl hover:bg-gray-800/50 hover:border-green-500/40 transition-all group"
          >
            <svg className="w-5 h-5 text-green-400 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
            <h3 className="text-green-400 font-semibold mb-3">Slippage Tolerance</h3>
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
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                className="px-3 py-2 bg-gray-800/50 border border-green-500/20 rounded-lg text-green-400 text-sm w-20"
                step="0.1"
                min="0"
                max="50"
              />
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
                <p className="text-green-400 font-bold">{parseFloat(balanceA).toFixed(6)} {tokenA.symbol}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <TokenSelector token={tokenA} onSelect={setTokenA} label="Select token to swap from" />
              <button 
                onClick={() => handleMaxClick(true)}
                className="px-3 py-1.5 text-green-400 hover:text-green-300 text-sm font-bold bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-all"
              >
                MAX
              </button>
            </div>
            
            <input
              type="text"
              value={amountA}
              onChange={(e) => handleAmountAChange(e.target.value)}
              placeholder="0.0"
              className="w-full bg-gray-800/40 border border-green-500/30 rounded-xl px-6 py-5 text-green-400 text-2xl font-bold focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder-green-600/40 hover:bg-gray-700/40"
              disabled={!isConnected}
            />
          </div>
        </div>

        {/* Swap Direction Arrow */}
        <div className="flex justify-center my-4">
          <button 
            onClick={handleTokenSwap}
            className="bg-gray-900/60 border-2 border-green-400/30 rounded-full p-4 shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 hover:scale-110 hover:rotate-180 group"
          >
            <svg className="w-6 h-6 text-green-400 group-hover:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Section */}
        <div className="mb-8">
          <div className="bg-gray-950/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
            <div className="flex justify-between items-center mb-4">
              <label className="text-green-400 text-sm font-bold uppercase tracking-wider opacity-80">
                To
              </label>
              <div className="text-right">
                <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1">Balance</p>
                <p className="text-green-400 font-bold">{parseFloat(balanceB).toFixed(6)} {tokenB.symbol}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <TokenSelector token={tokenB} onSelect={setTokenB} label="Select token to receive" />
              {isLoadingPrice && (
                <div className="text-green-400 text-sm animate-pulse">Calculating...</div>
              )}
            </div>
            
            <input
              type="text"
              value={amountB}
              onChange={(e) => handleAmountBChange(e.target.value)}
              placeholder="0.0"
              className="w-full bg-gray-800/40 border border-green-500/30 rounded-xl px-6 py-5 text-green-400 text-2xl font-bold focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder-green-600/40 hover:bg-gray-700/40"
              disabled={!isConnected}
            />
          </div>
        </div>

        {/* Swap Details */}
        {amountA && amountB && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 mb-6">
            <h3 className="text-green-400 font-semibold text-sm mb-4 uppercase tracking-wide">
              Swap Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-green-500/70">Price Impact:</span>
                <span className={`font-semibold ${priceImpact > 5 ? 'text-red-400' : priceImpact > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Slippage:</span>
                <span className="text-green-400 font-semibold">{slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Minimum Received:</span>
                <span className="text-green-400 font-semibold">
                  {(parseFloat(amountB) * (1 - slippage / 100)).toFixed(6)} {tokenB.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Route:</span>
                <span className="text-green-400 font-semibold">{tokenA.symbol} → {tokenB.symbol}</span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button 
          onClick={executeSwap}
          disabled={!canSwap()}
          className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
            canSwap()
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!isConnected 
            ? 'Connect Wallet' 
            : !amountA || parseFloat(amountA) <= 0
            ? 'Enter Amount'
            : parseFloat(amountA) > parseFloat(balanceA)
            ? `Insufficient ${tokenA.symbol} Balance`
            : isPending || isConfirming
            ? 'Swapping...'
            : '🔄 Swap Tokens'
          }
        </button>

        {/* Transaction Status */}
        {hash && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 text-sm">
              {isConfirming ? 'Confirming transaction...' : isSuccess ? 'Swap successful!' : 'Transaction submitted'}
            </p>
            {hash && (
              <p className="text-green-500/70 text-xs mt-2 break-all">
                Tx: {hash}
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          <button className="py-3 px-4 bg-gray-900/50 border border-green-500/20 rounded-xl text-green-400 hover:bg-gray-800/50 hover:border-green-500/40 transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </button>
          <button className="py-3 px-4 bg-gray-900/50 border border-green-500/20 rounded-xl text-green-400 hover:bg-gray-800/50 hover:border-green-500/40 transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics</span>
          </button>
          <button className="py-3 px-4 bg-gray-900/50 border border-green-500/20 rounded-xl text-green-400 hover:bg-gray-800/50 hover:border-green-500/40 transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span>Pools</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium">Fast Swaps</span>
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
            <span className="font-medium">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YafaSwap;