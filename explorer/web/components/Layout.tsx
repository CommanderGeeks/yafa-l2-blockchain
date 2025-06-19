'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, Globe, Activity, Layers, BarChart3, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const navigation = [
    { name: 'Explorer', href: '/', icon: Search },
    { name: 'Blocks', href: '/blocks', icon: Layers },
    { name: 'Transactions', href: '/transactions', icon: Activity },
    { name: 'Tokens', href: '/tokens', icon: Users },
    { name: 'Stats', href: '/stats', icon: BarChart3 }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Detect search type and redirect
    if (/^\d+$/.test(searchQuery)) {
      window.location.href = `/block/${searchQuery}`;
    } else if (/^0x[a-fA-F0-9]{64}$/.test(searchQuery)) {
      window.location.href = `/tx/${searchQuery}`;
    } else if (/^0x[a-fA-F0-9]{40}$/.test(searchQuery)) {
      window.location.href = `/address/${searchQuery}`;
    } else {
      alert('Invalid search format. Enter a block number, transaction hash, or address.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse-slow pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 bg-gray-900/60 backdrop-blur-xl border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo - Matching YAFA DEX Style */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform">
                  <span className="text-black font-bold text-xl">Y</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  YAFA Explorer
                </h1>
                <p className="text-green-500/70 text-sm font-medium">L2 Block Explorer</p>
              </div>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/20'
                        : 'text-green-500/70 hover:text-green-400 hover:bg-gray-800/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side - Search + Wallet Info */}
            <div className="flex items-center space-x-4">
              {/* Search Bar - Desktop */}
              <form onSubmit={handleSearch} className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search blocks, txs, addresses..."
                    className="w-80 bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-xl pl-10 pr-4 py-2.5 text-green-100 placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                  />
                </div>
              </form>

              {/* Network Status */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>

              {/* Chain Info */}
              <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-gray-900/50 border border-green-500/30 rounded-xl">
                <Globe className="w-4 h-4 text-green-400" />
                <div className="text-right">
                  <p className="text-green-400 text-sm font-semibold">Yafa L2</p>
                  <p className="text-green-500/70 text-xs">Chain ID: 42069</p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-green-400 hover:text-green-300 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-green-500/20">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="lg:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search blocks, txs, addresses..."
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-xl pl-10 pr-4 py-2.5 text-green-100 placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="grid grid-cols-2 gap-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'text-green-500/70 hover:text-green-400 hover:bg-gray-800/50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Status */}
              <div className="flex items-center justify-between pt-4 border-t border-green-500/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Network Live</span>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm font-semibold">Yafa L2</p>
                  <p className="text-green-500/70 text-xs">Chain ID: 42069</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 bg-gray-900/60 backdrop-blur-xl border-t border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <span className="text-black font-bold">Y</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    YAFA Explorer
                  </h3>
                  <p className="text-green-500/70 text-sm">L2 Block Explorer</p>
                </div>
              </div>
              <p className="text-green-500/70 text-sm max-w-md">
                Real-time blockchain explorer for the YAFA Layer 2 network. 
                Track transactions, explore blocks, and monitor network activity.
              </p>
            </div>

            {/* Explorer Links */}
            <div>
              <h4 className="text-green-400 font-semibold mb-4">Explorer</h4>
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href} 
                    className="block text-green-500/70 hover:text-green-400 text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-green-400 font-semibold mb-4">Resources</h4>
              <div className="space-y-2">
                <a href="#" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">
                  Documentation
                </a>
                <a href="#" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">
                  GitHub
                </a>
                <a href="#" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">
                  Official Site
                </a>
                <a href="#" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">
                  Bridge
                </a>
                <a href="#" className="block text-green-500/70 hover:text-green-400 text-sm transition-colors">
                  DEX
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-8 border-t border-green-500/20 flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-500/60 text-sm">
              © 2024 YAFA Explorer. Powered by YAFA Technology.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-500/70 text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, rgba(34, 197, 94, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to));
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default Layout;