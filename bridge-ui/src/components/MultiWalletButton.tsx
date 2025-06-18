import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAccount } from 'wagmi';

export const MultiWalletButton = () => {
  const [walletType, setWalletType] = useState<'evm' | 'solana' | null>(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  
  // EVM wallet
  const { isConnected: isEvmConnected, address: evmAddress } = useAccount();
  
  // Solana wallet
  const { publicKey, connected: isSolanaConnected, disconnect: disconnectSolana } = useWallet();
  const { setVisible: setSolanaModalVisible } = useWalletModal();

  // Determine which wallet is connected
  useEffect(() => {
    if (isEvmConnected) {
      setWalletType('evm');
    } else if (isSolanaConnected) {
      setWalletType('solana');
    } else {
      setWalletType(null);
    }
  }, [isEvmConnected, isSolanaConnected]);

  const handleConnect = () => {
    setShowWalletSelector(true);
  };

  const connectEvm = () => {
    setShowWalletSelector(false);
    // RainbowKit will handle the connection
  };

  const connectSolana = () => {
    setShowWalletSelector(false);
    setSolanaModalVisible(true);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // If any wallet is connected, show the appropriate button
  if (walletType === 'evm') {
    return <ConnectButton />;
  }

  if (walletType === 'solana' && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <button
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          onClick={() => disconnectSolana()}
        >
          <div className="flex items-center gap-2">
            <img src="/phantom-icon.png" alt="Phantom" className="w-5 h-5" />
            {formatAddress(publicKey.toBase58())}
          </div>
        </button>
      </div>
    );
  }

  // Show wallet selector
  if (showWalletSelector) {
    return (
      <div className="relative">
        <div className="absolute right-0 top-12 bg-gray-900 border border-green-500/30 rounded-xl p-4 min-w-[200px] z-50">
          <h3 className="text-green-400 font-semibold mb-3">Select Wallet Type</h3>
          
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={() => {
                  connectEvm();
                  openConnectModal();
                }}
                className="w-full mb-2 bg-gray-800 hover:bg-gray-700 text-green-400 px-4 py-3 rounded-lg transition-all flex items-center justify-between group"
              >
                <span>EVM Wallets</span>
                <span className="text-xs text-green-500/70 group-hover:text-green-400">MetaMask, etc</span>
              </button>
            )}
          </ConnectButton.Custom>
          
          <button
            onClick={connectSolana}
            className="w-full bg-gray-800 hover:bg-gray-700 text-green-400 px-4 py-3 rounded-lg transition-all flex items-center justify-between group"
          >
            <span>Solana Wallets</span>
            <span className="text-xs text-green-500/70 group-hover:text-green-400">Phantom, etc</span>
          </button>
          
          <button
            onClick={() => setShowWalletSelector(false)}
            className="w-full mt-2 text-green-500/70 hover:text-green-400 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Default connect button
  return (
    <button
      onClick={handleConnect}
      className="bg-gradient-to-r from-green-500 to-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transform hover:scale-105"
    >
      Connect Wallet
    </button>
  );
};