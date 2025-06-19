// 4. Updated PoolPage.tsx (Create Position) - Remove duplicate ConnectButton
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedNavigation from '@/components/UnifiedNavigation';
import CreatePosition from '@/components/CreatePosition';

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

  // Update URL when tab changes or navigate to dedicated positions page
  const handleTabChange = (newTab: 'create' | 'view') => {
    if (newTab === 'view') {
      // Navigate to the dedicated positions page instead of just changing tabs
      router.push('/pools/positions');
    } else {
      setActiveTab(newTab);
      router.push(`/pools?tab=${newTab}`, undefined, { shallow: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      
      {/* Enhanced Navigation - Already includes ConnectButton */}
      <EnhancedNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        
        {/* Header Section - NO ConnectButton since it's in navigation */}
        <div className="flex justify-between items-center mb-12 max-w-7xl mx-auto mt-8">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Liquidity Pools
              </h1>
              <p className="text-green-500/80 text-lg font-medium mt-2">
                Add liquidity to earn trading fees
              </p>
            </div>
          </div>
          {/* NO ConnectButton here */}
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
              className="flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 text-green-500/70 hover:text-green-400 hover:bg-gray-800/50"
            >
              <span>📊</span>
              <span>Your Positions</span>
            </button>
          </div>
        </div>

        {/* Tab Content - Only show CreatePosition since ViewPositions has its own page */}
        <div className="relative z-10">
          <CreatePosition />
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

        {/* Enhanced Call-to-Action Section */}
        <div className="relative z-10 max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-900/60 via-gray-900/40 to-gray-900/60 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 md:p-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                Start Earning with Liquidity Pools
              </h2>
              <p className="text-green-500/80 text-lg max-w-2xl mx-auto">
                Provide liquidity to trading pairs and earn a share of trading fees. Your tokens work for you 24/7.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => handleTabChange('create')}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
              >
                Add Liquidity Now
              </button>
              <button 
                onClick={() => router.push('/pools/positions')}
                className="px-8 py-4 bg-gray-800/50 border border-green-500/30 text-green-400 font-bold rounded-xl hover:bg-gray-700/50 hover:border-green-400/50 transition-all duration-300"
              >
                View My Positions
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-16 text-center">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-green-500/70 text-sm font-medium">Powered by YAFA L2 Technology</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolPage;