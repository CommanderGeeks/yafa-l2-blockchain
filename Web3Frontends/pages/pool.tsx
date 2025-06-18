import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CreatePosition from '../src/components/CreatePosition';
import ViewPositions from '../src/components/ViewPositions';

const PoolPage = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');

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
              YAFA POOLS
            </h1>
            <p className="text-green-500/80 text-sm font-medium mt-1">Provide liquidity and earn fees</p>
          </div>
        </div>
        
        <ConnectButton />
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-2xl mx-auto mb-8">
        <div className="flex bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/20'
                : 'text-green-500/70 hover:text-green-400 hover:bg-gray-800/50'
            }`}
          >
            💧 Add Liquidity
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'view'
                ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/20'
                : 'text-green-500/70 hover:text-green-400 hover:bg-gray-800/50'
            }`}
          >
            📊 Your Positions
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
        {activeTab === 'create' ? <CreatePosition /> : <ViewPositions />}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-12 text-center">
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
  );
};

export default PoolPage;