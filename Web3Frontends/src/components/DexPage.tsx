import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import EnhancedNavigation from '@/components/UnifiedNavigation';
import YafaSwap from '@/components/YafaSwap';

const DexPage = () => {
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
                Token Swap
              </h1>
              <p className="text-green-500/80 text-lg font-medium mt-2">Trade tokens instantly with low fees</p>
            </div>
          </div>
          
          <ConnectButton />
        </div>

        {/* Swap Interface */}
        <YafaSwap />
      </div>
    </div>
  );
};

export default DexPage;