import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const EnhancedNavigation = () => {
  const [showPoolsDropdown, setShowPoolsDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPoolsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isPoolsActive = router.pathname.startsWith('/pool') || router.pathname === '/pools';

  const navigationItems = [
    {
      name: 'Bridge',
      href: '/',
      icon: '🌉',
      active: router.pathname === '/'
    },
    {
      name: 'Swap',
      href: '/dex',
      icon: '🔄',
      active: router.pathname === '/dex'
    }
  ];

  const poolsDropdownItems = [
    {
      name: 'View Pools',
      href: '/pool?tab=view',
      description: 'Manage your liquidity positions',
      icon: '📊'
    },
    {
      name: 'Add Liquidity',
      href: '/pool?tab=create',
      description: 'Provide liquidity and earn fees',
      icon: '💧'
    }
  ];

  return (
    <nav className="relative z-20 bg-gray-900/60 backdrop-blur-xl border-b border-green-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform">
                  <span className="text-black font-bold text-lg">Y</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  YAFA DEX
                </h1>
              </div>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center space-x-1">
            
            {/* Regular Navigation Items */}
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  item.active
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'text-green-500/70 hover:text-green-400 hover:bg-green-500/10'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Pools Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowPoolsDropdown(!showPoolsDropdown)}
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

              {/* Dropdown Menu */}
              {showPoolsDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-green-500/30 rounded-xl shadow-2xl shadow-green-500/20 overflow-hidden">
                  <div className="py-2">
                    {poolsDropdownItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setShowPoolsDropdown(false)}
                        className="block px-4 py-3 hover:bg-green-500/10 transition-all duration-200 group"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg mt-0.5 group-hover:scale-110 transition-transform">
                            {item.icon}
                          </span>
                          <div className="flex-1">
                            <div className="text-green-400 font-semibold group-hover:text-green-300 transition-colors">
                              {item.name}
                            </div>
                            <div className="text-green-500/70 text-sm mt-1">
                              {item.description}
                            </div>
                          </div>
                          <svg 
                            className="w-4 h-4 text-green-500/40 group-hover:text-green-400 group-hover:translate-x-1 transition-all mt-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Quick Stats Footer */}
                  <div className="border-t border-green-500/20 px-4 py-3 bg-green-500/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-green-500/70">Total TVL</span>
                      <span className="text-green-400 font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-green-500/70">Active Pairs</span>
                      <span className="text-green-400 font-semibold">0</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analytics/More (Optional Future Expansion) */}
            <Link
              href="/analytics"
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-green-500/70 hover:text-green-400 hover:bg-green-500/10"
            >
              <span className="text-sm">📈</span>
              <span>Analytics</span>
            </Link>
          </div>

          {/* Right Side - Connect Wallet will be handled by each page */}
          <div className="flex items-center">
            {/* This space is reserved for the ConnectButton on each page */}
            <div id="connect-wallet-slot"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default EnhancedNavigation;