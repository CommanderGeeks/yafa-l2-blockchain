// File: pages/pools/positions.tsx
import React from 'react';
import EnhancedNavigation from '@/components/UnifiedNavigation';
import ViewPositions from '@/components/ViewPositions';

export default function MyPositions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Navigation */}
      <EnhancedNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto mt-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              My Liquidity Positions
            </h1>
            <p className="text-green-500/80 text-lg font-medium mt-2">
              Manage your active liquidity positions
            </p>
          </div>
          
          <ViewPositions />
        </div>
      </div>
    </div>
  );
}