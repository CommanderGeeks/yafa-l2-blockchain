import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useSwitchChain } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { 
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  base,
} from 'wagmi/chains';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { MultiWalletButton } from './MultiWalletButton';

// Chain configurations
const SUPPORTED_CHAINS = [
  { id: sepolia.id, name: 'Sepolia', symbol: 'ETH', type: 'evm' },
  { id: mainnet.id, name: 'Ethereum', symbol: 'ETH', type: 'evm' },
  { id: polygon.id, name: 'Polygon', symbol: 'MATIC', type: 'evm' },
  { id: arbitrum.id, name: 'Arbitrum', symbol: 'ETH', type: 'evm' },
  { id: base.id, name: 'Base', symbol: 'ETH', type: 'evm' },
  { id: 999999, name: 'Solana', symbol: 'SOL', type: 'solana' }, // Custom ID for Solana
];

const Bridge = () => {
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('Sepolia');
  const [toChain, setToChain] = useState('Yafa L2');
  const [balance, setBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // EVM wallet hooks
  const { address: evmAddress, isConnected: isEvmConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();

  // Solana wallet hooks
  const { publicKey: solanaAddress, connected: isSolanaConnected } = useWallet();
  const { connection } = useConnection();

  // Determine which wallet is connected
  const isConnected = isEvmConnected || isSolanaConnected;
  const address = evmAddress || (solanaAddress?.toBase58());
  const walletType = isEvmConnected ? 'evm' : isSolanaConnected ? 'solana' : null;

  // Get current chain info
  const currentChainInfo = walletType === 'evm' 
    ? SUPPORTED_CHAINS.find(c => c.id === chain?.id)
    : walletType === 'solana' 
    ? SUPPORTED_CHAINS.find(c => c.name === 'Solana')
    : null;
    
  const selectedFromChain = SUPPORTED_CHAINS.find(c => c.name === fromChain);

  // Ensure client-side only rendering for wallet-dependent content
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update fromChain when wallet chain changes
  useEffect(() => {
    if (currentChainInfo) {
      setFromChain(currentChainInfo.name);
    }
  }, [currentChainInfo]);

  // Fetch balance using publicClient for EVM or connection for Solana
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address || !isConnected) {
        setBalance('0');
        return;
      }

      setIsLoadingBalance(true);
      setBalanceError(null);

      try {
        if (walletType === 'evm' && publicClient && evmAddress) {
          console.log('Fetching EVM balance for:', evmAddress);
          const balanceWei = await publicClient.getBalance({ address: evmAddress });
          const balanceEth = formatEther(balanceWei);
          setBalance(balanceEth);
          console.log('EVM Balance fetched:', balanceEth);
        } else if (walletType === 'solana' && connection && solanaAddress) {
          console.log('Fetching Solana balance for:', solanaAddress.toBase58());
          const balanceLamports = await connection.getBalance(solanaAddress);
          const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
          setBalance(balanceSol.toString());
          console.log('Solana Balance fetched:', balanceSol);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalanceError('Failed to fetch balance');
        setBalance('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
    
    // Refetch balance every 10 seconds if connected
    const interval = setInterval(() => {
      if (isConnected) {
        fetchBalance();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [address, publicClient, isConnected, walletType, evmAddress, solanaAddress, connection]);

  // Debug logging
  useEffect(() => {
    console.log('=== Wallet State ===');
    console.log('Connected:', isConnected);
    console.log('Address:', address);
    console.log('Chain:', chain?.name, '(ID:', chain?.id, ')');
    console.log('Balance:', balance, 'ETH');
    console.log('Loading:', isLoadingBalance);
    console.log('Error:', balanceError);
    console.log('Public Client:', !!publicClient);
    console.log('===================');
  }, [isConnected, address, chain, balance, isLoadingBalance, balanceError, publicClient]);

  const handleMaxClick = () => {
    if (balance && parseFloat(balance) > 0) {
      // Leave a small amount for gas
      const maxAmount = Math.max(0, parseFloat(balance) - 0.001);
      setAmount(maxAmount.toString());
    }
  };

  // Handle chain switching when dropdown changes
  const handleFromChainChange = async (newChain: string) => {
    setFromChain(newChain);
    const targetChain = SUPPORTED_CHAINS.find(c => c.name === newChain);
    
    // Only switch for EVM chains
    if (targetChain && targetChain.type === 'evm' && chain?.id !== targetChain.id && switchChain) {
      try {
        await switchChain({ chainId: targetChain.id });
      } catch (error) {
        console.error('Failed to switch chain:', error);
      }
    } else if (targetChain && targetChain.type === 'solana' && walletType !== 'solana') {
      // Show message to connect Solana wallet
      alert('Please connect a Solana wallet (like Phantom) to use Solana network');
      setFromChain(currentChainInfo?.name || 'Sepolia');
    }
  };

  const getBalanceDisplay = () => {
    if (!isMounted) return 'Loading...';
    if (!isConnected) return 'Not Connected';
    if (isLoadingBalance) return 'Loading...';
    if (balanceError) return 'Error';
    const symbol = currentChainInfo?.symbol || 'ETH';
    return `${parseFloat(balance).toFixed(4)} ${symbol}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-12 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 blur-lg opacity-50"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
              <span className="text-black font-bold text-2xl">Y</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              YAFA Bridge
            </h1>
            <p className="text-green-500/80 text-sm font-medium mt-1">Cross-chain asset transfer</p>
          </div>
        </div>
        
        <MultiWalletButton />
      </div>

      {/* Main Bridge Card */}
      <div className="relative z-10 max-w-2xl mx-auto">
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
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm text-center">
                Please switch to a supported network (Ethereum, Sepolia, Polygon, Arbitrum, or Base)
              </p>
            </div>
          )}

          {/* From Section */}
          <div className="mb-6">
            <div className="bg-gray-950/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300 group">
              <label className="block text-green-400 text-sm font-bold mb-4 uppercase tracking-wider opacity-80">
                From
              </label>
              
              <div className="flex items-center justify-between mb-4">
                <select 
                  className="bg-gray-800/60 backdrop-blur-sm border border-green-500/30 rounded-xl px-4 py-3 text-green-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all text-base font-medium min-w-[160px] hover:bg-gray-700/60"
                  value={fromChain}
                  onChange={(e) => handleFromChainChange(e.target.value)}
                >
                  <option value="Sepolia" className="bg-gray-900">Sepolia</option>
                  <option value="Ethereum" className="bg-gray-900">Ethereum</option>
                  <option value="Polygon" className="bg-gray-900">Polygon</option>
                  <option value="Arbitrum" className="bg-gray-900">Arbitrum</option>
                  <option value="Base" className="bg-gray-900">Base</option>
                  <option value="Solana" className="bg-gray-900">Solana</option>
                </select>
                
                <div className="text-right">
                  <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1 font-medium">Balance</p>
                  <p className={`font-bold text-lg ${balanceError ? 'text-red-400' : 'text-green-400'}`}>
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
              
              <div className="flex items-center justify-between mb-4">
                <select 
                  className="bg-gray-800/60 backdrop-blur-sm border border-green-500/30 rounded-xl px-4 py-3 text-green-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all text-base font-medium min-w-[160px] hover:bg-gray-700/60"
                  value={toChain}
                  onChange={(e) => setToChain(e.target.value)}
                >
                  <option value="Yafa L2" className="bg-gray-900">Yafa L2</option>
                  <option value="Sepolia" className="bg-gray-900">Sepolia</option>
                  <option value="Ethereum" className="bg-gray-900">Ethereum</option>
                  <option value="Polygon" className="bg-gray-900">Polygon</option>
                  <option value="Arbitrum" className="bg-gray-900">Arbitrum</option>
                  <option value="Base" className="bg-gray-900">Base</option>
                  <option value="Solana" className="bg-gray-900">Solana</option>
                </select>
                
                <div className="text-right">
                  <p className="text-green-500/60 text-xs uppercase tracking-wide mb-1 font-medium">You'll receive</p>
                  <p className="text-green-400 font-bold text-lg">
                    {amount ? `~${amount}` : '0.0'} {toChain === 'Polygon' ? 'MATIC' : toChain === 'Solana' ? 'SOL' : 'ETH'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-800/40 backdrop-blur-sm border border-green-500/30 rounded-xl px-6 py-5 text-green-300 text-2xl font-bold">
                {amount || '0.0'}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-green-500/5 backdrop-blur-sm border border-green-500/20 rounded-xl p-5 mb-6">
            <h3 className="text-green-400 font-semibold text-sm mb-4 uppercase tracking-wide flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Transaction Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-500/5 transition-colors">
                <span className="text-green-500/70">Bridge Fee:</span>
                <span className="text-green-400 font-semibold">0.1%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-500/5 transition-colors">
                <span className="text-green-500/70">Gas Estimate:</span>
                <span className="text-green-400 font-semibold">~$2.50</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-500/5 transition-colors">
                <span className="text-green-500/70">Transfer Time:</span>
                <span className="text-green-400 font-semibold">~2 min</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-500/5 transition-colors">
                <span className="text-green-500/70">Route:</span>
                <span className="text-green-400 font-semibold flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Optimal
                </span>
              </div>
            </div>
          </div>

          {/* Bridge Button */}
          <button 
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
              isConnected && amount && parseFloat(amount) > 0
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-green-500/70 text-sm font-medium">Powered by YAFA L2 Technology</p>
          </div>
          <div className="flex justify-center items-center space-x-6 text-xs text-green-600/60">
            <div className="flex items-center space-x-1 hover:text-green-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
    </div>
  );
};

export default Bridge;