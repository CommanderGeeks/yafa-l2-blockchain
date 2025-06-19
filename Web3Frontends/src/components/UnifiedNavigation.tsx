// Enhanced Navigation with Explorer Integration
// File: src/components/UnifiedNavigation.tsx

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  active?: boolean;
  dropdown?: NavigationItem[];
}

const UnifiedNavigation: React.FC = () => {
  const router = useRouter();
  const [showExplorerDropdown, setShowExplorerDropdown] = useState(false);
  const [showPoolsDropdown, setShowPoolsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isExplorerActive = router.pathname.includes('/explorer');
  const isPoolsActive = router.pathname.includes('/pools');

  // Main navigation items
  const navigationItems: NavigationItem[] = [
    { name: 'Bridge', href: '/', icon: '🌉' },
    { name: 'DEX', href: '/dex', icon: '💱' },
  ];

  // Explorer dropdown items
  const explorerItems: NavigationItem[] = [
    { name: 'Overview', href: '/explorer', icon: '📊' },
    { name: 'Blocks', href: '/explorer/blocks', icon: '📦' },
    { name: 'Transactions', href: '/explorer/transactions', icon: '💸' },
    { name: 'Stats', href: '/explorer/stats', icon: '📈' },
    { name: 'Tokens', href: '/explorer/tokens', icon: '🪙' },
  ];

  // Pools dropdown items
  const poolsItems: NavigationItem[] = [
    { name: 'Create Position', href: '/pools', icon: '➕' },
    { name: 'My Positions', href: '/pools/positions', icon: '📊' },
    { name: 'All Pools', href: '/pools/all', icon: '💧' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExplorerDropdown(false);
        setShowPoolsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-green-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform">
                  <span className="text-black font-bold text-lg">Y</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  YAFA Protocol
                </h1>
              </div>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center space-x-1" ref={dropdownRef}>
            
            {/* Regular Navigation Items */}
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  router.pathname === item.href
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'text-green-500/70 hover:text-green-400 hover:bg-green-500/10'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Explorer Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowExplorerDropdown(!showExplorerDropdown);
                  setShowPoolsDropdown(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isExplorerActive
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'text-green-500/70 hover:text-green-400 hover:bg-green-500/10'
                }`}
              >
                <span className="text-sm">🔍</span>
                <span>Explorer</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showExplorerDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Explorer Dropdown Menu */}
              {showExplorerDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-green-500/30 rounded-xl shadow-2xl shadow-green-500/20 overflow-hidden z-50">
                  <div className="p-2">
                    {explorerItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 text-green-500/70 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                        onClick={() => setShowExplorerDropdown(false)}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Quick Stats in Dropdown */}
                  <div className="border-t border-green-500/20 p-3 bg-green-500/5">
                    <div className="text-xs text-green-500/60 uppercase tracking-wider mb-2">Quick Stats</div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-green-500/70">Latest Block</span>
                        <span className="text-green-400 font-semibold">#1,234,567</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-green-500/70">TPS</span>
                        <span className="text-green-400 font-semibold">847</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pools Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowPoolsDropdown(!showPoolsDropdown);
                  setShowExplorerDropdown(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isPoolsActive
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'text-green-500/70 hover:text-green-400 hover:bg-green-500/10'
                }`}
              >
                <span className="text-sm">💧</span>
                <span>Pools</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showPoolsDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Pools Dropdown Menu */}
              {showPoolsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-green-500/30 rounded-xl shadow-2xl shadow-green-500/20 overflow-hidden z-50">
                  <div className="p-2">
                    {poolsItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 text-green-500/70 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                        onClick={() => setShowPoolsDropdown(false)}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Pool Stats in Dropdown */}
                  <div className="border-t border-green-500/20 p-3 bg-green-500/5">
                    <div className="text-xs text-green-500/60 uppercase tracking-wider mb-2">Pool Stats</div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-green-500/70">Total TVL</span>
                        <span className="text-green-400 font-semibold">$0.00</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-green-500/70">Active Pairs</span>
                        <span className="text-green-400 font-semibold">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Connect Wallet */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UnifiedNavigation;