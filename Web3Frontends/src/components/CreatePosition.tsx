import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, formatEther } from 'viem';

// Token list - update with your actual deployed tokens
const TOKEN_LIST = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    logoUrl: '/tokens/eth.png'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: process.env.NEXT_PUBLIC_WETH_ADDRESS || '0x...',
    decimals: 18,
    logoUrl: '/tokens/weth.png'
  },
  {
    symbol: 'TKA',
    name: 'Test Token A',
    address: process.env.NEXT_PUBLIC_TKA_ADDRESS || '0x...',
    decimals: 18,
    logoUrl: '/tokens/tka.png'
  },
  {
    symbol: 'TKB',
    name: 'Test Token B',
    address: process.env.NEXT_PUBLIC_TKB_ADDRESS || '0x...',
    decimals: 18,
    logoUrl: '/tokens/tkb.png'
  }
];

// Contract addresses
const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || '0x2E51daEaaF8497fC725900c9f46caDbC0a1d01f5';
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x70cC81e15229fe9A016D147438A8D1a737268328';

// Router ABI for liquidity functions
const ROUTER_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'amountADesired', type: 'uint256' },
      { name: 'amountBDesired', type: 'uint256' },
      { name: 'amountAMin', type: 'uint256' },
      { name: 'amountBMin', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    name: 'addLiquidity',
    outputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' },
      { name: 'liquidity', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' }
    ],
    name: 'getPair',
    outputs: [{ name: 'pair', type: 'address' }],
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
  }
];

const CreatePosition = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [balanceA, setBalanceA] = useState('0');
  const [balanceB, setBalanceB] = useState('0');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [pairExists, setPairExists] = useState(false);
  const [isLoadingPair, setIsLoadingPair] = useState(false);

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Fetch token balances
  const fetchBalance = useCallback(async (token: typeof TOKEN_LIST[0], userAddress: string) => {
    if (!publicClient || !userAddress) return '0';
    
    try {
      if (token.address === '0x0000000000000000000000000000000000000000') {
        const balance = await publicClient.getBalance({ address: userAddress as `0x${string}` });
        return formatEther(balance);
      } else {
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

  // Check if pair exists
  const checkPairExists = useCallback(async () => {
    if (!publicClient || tokenA.address === tokenB.address) return;
    
    try {
      setIsLoadingPair(true);
      const pairAddress = await publicClient.readContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'getPair',
        args: [tokenA.address, tokenB.address]
      }) as string;
      
      setPairExists(pairAddress !== '0x0000000000000000000000000000000000000000');
    } catch (error) {
      console.error('Error checking pair:', error);
      setPairExists(false);
    } finally {
      setIsLoadingPair(false);
    }
  }, [publicClient, tokenA.address, tokenB.address]);

  // Update balances when tokens or address change
  useEffect(() => {
    if (address && isConnected) {
      fetchBalance(tokenA, address).then(setBalanceA);
      fetchBalance(tokenB, address).then(setBalanceB);
    }
  }, [address, isConnected, tokenA, tokenB, fetchBalance]);

  // Check pair existence when tokens change
  useEffect(() => {
    checkPairExists();
  }, [checkPairExists]);

  const handleMaxClick = (isTokenA: boolean) => {
    const balance = isTokenA ? balanceA : balanceB;
    const token = isTokenA ? tokenA : tokenB;
    
    if (parseFloat(balance) > 0) {
      const maxAmount = token.symbol === 'ETH' 
        ? Math.max(0, parseFloat(balance) - 0.01).toString()
        : balance;
      
      if (isTokenA) {
        setAmountA(maxAmount);
      } else {
        setAmountB(maxAmount);
      }
    }
  };

  const addLiquidity = async () => {
    if (!address || !amountA || !amountB) return;
    
    try {
      const amountADesired = parseUnits(amountA, tokenA.decimals);
      const amountBDesired = parseUnits(amountB, tokenB.decimals);
      const amountAMin = parseUnits(
        (parseFloat(amountA) * (1 - slippage / 100)).toString(),
        tokenA.decimals
      );
      const amountBMin = parseUnits(
        (parseFloat(amountB) * (1 - slippage / 100)).toString(),
        tokenB.decimals
      );
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
      
      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'addLiquidity',
        args: [
          tokenA.address,
          tokenB.address,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          address,
          deadline
        ]
      });
    } catch (error) {
      console.error('Add liquidity failed:', error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return tokenA.address !== tokenB.address;
      case 2:
        return amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0 &&
               parseFloat(amountA) <= parseFloat(balanceA) && parseFloat(amountB) <= parseFloat(balanceB);
      case 3:
        return isConnected && !isPending && !isConfirming;
      default:
        return false;
    }
  };

  const TokenSelector = ({ 
    token, 
    onSelect, 
    label,
    excludeToken
  }: { 
    token: typeof TOKEN_LIST[0]; 
    onSelect: (token: typeof TOKEN_LIST[0]) => void;
    label: string;
    excludeToken?: typeof TOKEN_LIST[0];
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
              {TOKEN_LIST.filter(t => t.address !== excludeToken?.address).map((t) => (
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

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent animate-gradient">
              Select Token Pair
            </h2>
            <p className="text-green-500/70 text-lg">Choose the tokens you want to provide liquidity for</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-green-400 text-sm font-bold mb-4 uppercase tracking-wider opacity-80">
                First Token
              </label>
              <TokenSelector 
                token={tokenA} 
                onSelect={setTokenA} 
                label="Select first token"
                excludeToken={tokenB}
              />
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-green-400 text-sm font-bold mb-4 uppercase tracking-wider opacity-80">
                Second Token
              </label>
              <TokenSelector 
                token={tokenB} 
                onSelect={setTokenB} 
                label="Select second token"
                excludeToken={tokenA}
              />
            </div>

            {tokenA.address !== tokenB.address && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
                <div className="flex items-center space-x-3">
                  {isLoadingPair ? (
                    <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : pairExists ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  <div>
                    <p className="text-green-400 font-semibold">
                      {isLoadingPair ? 'Checking pair...' : pairExists ? 'Pool exists' : 'New pool'}
                    </p>
                    <p className="text-green-500/70 text-sm">
                      {isLoadingPair ? 'Please wait...' : pairExists ? 
                        `${tokenA.symbol}/${tokenB.symbol} pool already exists` : 
                        `You'll create the first ${tokenA.symbol}/${tokenB.symbol} pool`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setStep(2)}
            disabled={!canProceed()}
            className={`w-full py-5 rounded-2xl font-bold text-lg mt-8 transition-all duration-300 transform ${
              canProceed()
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next: Enter Amounts
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent animate-gradient">
              Add Amounts
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
              </div>
            </div>
          )}

          {/* Token A Input */}
          <div className="mb-6">
            <div className="bg-gray-950/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={tokenA.logoUrl || '/tokens/default.png'} 
                    alt={tokenA.symbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/tokens/default.png';
                    }}
                  />
                  <span className="text-green-400 font-bold text-lg">{tokenA.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1">Balance</p>
                  <p className="text-green-400 font-bold">{parseFloat(balanceA).toFixed(6)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
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
                onChange={(e) => setAmountA(e.target.value)}
                placeholder="0.0"
                className="w-full bg-gray-800/40 border border-green-500/30 rounded-xl px-6 py-5 text-green-400 text-2xl font-bold focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder-green-600/40 hover:bg-gray-700/40"
                disabled={!isConnected}
              />
            </div>
          </div>

          {/* Plus Icon */}
          <div className="flex justify-center my-4">
            <div className="bg-green-500/20 rounded-full p-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          {/* Token B Input */}
          <div className="mb-8">
            <div className="bg-gray-950/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={tokenB.logoUrl || '/tokens/default.png'} 
                    alt={tokenB.symbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/tokens/default.png';
                    }}
                  />
                  <span className="text-green-400 font-bold text-lg">{tokenB.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1">Balance</p>
                  <p className="text-green-400 font-bold">{parseFloat(balanceB).toFixed(6)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={() => handleMaxClick(false)}
                  className="px-3 py-1.5 text-green-400 hover:text-green-300 text-sm font-bold bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-all"
                >
                  MAX
                </button>
              </div>
              
              <input
                type="text"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                placeholder="0.0"
                className="w-full bg-gray-800/40 border border-green-500/30 rounded-xl px-6 py-5 text-green-400 text-2xl font-bold focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder-green-600/40 hover:bg-gray-700/40"
                disabled={!isConnected}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={() => setStep(1)}
              className="flex-1 py-5 rounded-2xl font-bold text-lg bg-gray-800/50 text-green-400 border border-green-500/30 hover:bg-gray-700/50 hover:border-green-500/50 transition-all duration-300"
            >
              Back
            </button>
            <button 
              onClick={() => setStep(3)}
              disabled={!canProceed()}
              className={`flex-1 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                canProceed()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
              }`}
            >
              Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Review & Confirm
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent animate-gradient">
            Review & Confirm
          </h2>
          <p className="text-green-500/70 text-lg">Double-check your liquidity provision details</p>
        </div>

        {/* Summary */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6 mb-8">
          <h3 className="text-green-400 font-semibold text-lg mb-4">You will provide</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src={tokenA.logoUrl || '/tokens/default.png'} 
                  alt={tokenA.symbol}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/tokens/default.png';
                  }}
                />
                <span className="text-green-400 font-bold">{tokenA.symbol}</span>
              </div>
              <span className="text-green-400 font-bold text-lg">{amountA}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src={tokenB.logoUrl || '/tokens/default.png'} 
                  alt={tokenB.symbol}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/tokens/default.png';
                  }}
                />
                <span className="text-green-400 font-bold">{tokenB.symbol}</span>
              </div>
              <span className="text-green-400 font-bold text-lg">{amountB}</span>
            </div>
          </div>

          <div className="border-t border-green-500/20 mt-6 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-green-500/70">Pool:</span>
                <span className="text-green-400 font-semibold">{tokenA.symbol}/{tokenB.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Slippage:</span>
                <span className="text-green-400 font-semibold">{slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Status:</span>
                <span className={`font-semibold ${pairExists ? 'text-green-400' : 'text-yellow-400'}`}>
                  {pairExists ? 'Existing Pool' : 'New Pool'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Min {tokenA.symbol}:</span>
                <span className="text-green-400 font-semibold">
                  {(parseFloat(amountA) * (1 - slippage / 100)).toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Status */}
        {hash && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 text-sm">
              {isConfirming ? 'Confirming transaction...' : isSuccess ? 'Liquidity added successfully!' : 'Transaction submitted'}
            </p>
            {hash && (
              <p className="text-green-500/70 text-xs mt-2 break-all">
                Tx: {hash}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => setStep(2)}
            disabled={isPending || isConfirming}
            className="flex-1 py-5 rounded-2xl font-bold text-lg bg-gray-800/50 text-green-400 border border-green-500/30 hover:bg-gray-700/50 hover:border-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button 
            onClick={addLiquidity}
            disabled={!canProceed()}
            className={`flex-1 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
              canProceed()
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!isConnected 
              ? 'Connect Wallet' 
              : isPending || isConfirming
              ? 'Adding Liquidity...'
              : '💧 Add Liquidity'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePosition;