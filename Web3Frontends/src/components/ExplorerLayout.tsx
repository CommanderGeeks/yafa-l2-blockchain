// 1. Updated ExplorerLayout.tsx - Remove duplicate ConnectButton
import React from 'react';
import UnifiedNavigation from '@/components/UnifiedNavigation';
import { RefreshCw } from 'lucide-react';

interface ExplorerLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  rightContent?: React.ReactNode;
}

const ExplorerLayout: React.FC<ExplorerLayoutProps> = ({
  children,
  title,
  subtitle,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  rightContent
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      
      {/* Navigation - UnifiedNavigation already includes ConnectButton */}
      <UnifiedNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        
        {/* Header Section - NO ConnectButton here since it's in navigation */}
        <div className="flex justify-between items-center mb-12 max-w-7xl mx-auto mt-8">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-green-500/80 text-lg font-medium mt-2">
                {subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {showRefresh && onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-green-500/30 rounded-lg transition-all duration-200 disabled:opacity-50"
                title="Refresh data"
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              </button>
            )}
            {rightContent}
            {/* NO ConnectButton here - it's in UnifiedNavigation */}
          </div>
        </div>

        {/* Search Bar - Common to all explorer pages */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-green-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by Address / Txn Hash / Block"
              className="block w-full pl-10 pr-3 py-4 border border-green-500/30 rounded-xl bg-gray-900/60 backdrop-blur-xl text-green-400 placeholder-green-500/60 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
              aria-label="Search blockchain data"
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ExplorerLayout;