import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import EnhancedNavigation from '@/components/UnifiedNavigation';
import CreatePosition from '@/components/CreatePosition';
import ViewPositions from '@/components/ViewPositions';

const PoolPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');

  // Handle tab switching from URL parameter
  useEffect(() => {
    const { tab } = router.query;
    if (tab === 'view' || tab === 'create') {
      setActiveTab(tab);
    }
  }, [router.query]);

  // Update URL when tab changes
  const handleTabChange = (newTab: 'create' | 'view') => {
    setActiveTab(newTab);
    router.push(`/pool?tab=${newTab}`, undefined, { shallow: true });
  };

  // Handle Connect Wallet in header
  useEffect(() => {
    const connectWalletSlot = document.getElementById('connect-wallet-slot');
    if (connectWalletSlot) {
      // You can dynamically insert the ConnectButton here if needed
      // For now, we'll include it in the main content
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      
      {/* Enhanced Navigation */}
      <EnhancedNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12 max-w-7xl mx-auto mt-8">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Liquidity Pools
              </h1>
              <p className="text-green-500/80 text-lg font-medium mt-2">
                {activeTab === 'create' ? 'Add liquidity to earn trading fees' : 'Manage your liquidity positions'}
              </p>
            </div>
          </div>
          
          <ConnectButton />
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 max-w-2xl mx-auto mb-8">
          <div className="flex bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-2">
            <button
              onClick={() => handleTabChange('create')}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === 'create'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/20'
                  : 'text-green-500/70 hover:text-green-400 hover:bg-gray-800/50'
              }`}
            >
              <span>💧</span>
              <span>Add Liquidity</span>
            </button>
            <button
              onClick={() => handleTabChange('view')}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === 'view'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/20'
                  : 'text-green-500/70 hover:text-green-400 hover:bg-gray-800/50'
              }`}
            >
              <span>📊</span>
              <span>Your Positions</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="relative z-10">
          {activeTab === 'create' ? <CreatePosition /> : <ViewPositions />}
        </div>

        {/* Quick Access Cards */}
        <div className="relative z-10 max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pool Statistics */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <h3 className="text-lg font-bold text-green-400">Pool Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-500/70 text-sm">Total Value Locked</span>
                  <span className="text-green-400 font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-500/70 text-sm">24h Volume</span>
                  <span className="text-green-400 font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-500/70 text-sm">Active Pairs</span>
                  <span className="text-green-400 font-semibold">0</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🔄</span>
                </div>
                <h3 className="text-lg font-bold text-green-400">Recent Activity</h3>
              </div>
              <div className="text-center py-8">
                <p className="text-green-500/60 text-sm">No recent activity</p>
              </div>
            </div>

            {/* Top Pairs */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🔥</span>
                </div>
                <h3 className="text-lg font-bold text-green-400">Top Pairs</h3>
              </div>
              <div className="text-center py-8">
                <p className="text-green-500/60 text-sm">No pairs created yet</p>
                <button 
                  onClick={() => handleTabChange('create')}
                  className="mt-3 text-green-400 hover:text-green-300 text-sm font-medium underline transition-colors"
                >
                  Create the first pair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-16 text-center">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-green-500/70 text-sm font-medium">Powered by YAFA L2 Technology</p>
          </div>
          <div className="flex justify-center items-center space-x-6 text-xs text-green-600/60">
            <div className="flex items-center space-x-1 hover:text-green-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">Fast Pools</span>
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

export default PoolPage;