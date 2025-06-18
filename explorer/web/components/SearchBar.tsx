import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, X } from 'lucide-react';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    type: 'block' | 'transaction' | 'address';
    value: string;
    display: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-detect search type and navigate
  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const trimmedQuery = searchQuery.trim();
    
    // Detect search type
    if (/^\d+$/.test(trimmedQuery)) {
      // Block number
      router.push(`/block/${trimmedQuery}`);
    } else if (/^0x[a-fA-F0-9]{64}$/.test(trimmedQuery)) {
      // Transaction hash or block hash
      router.push(`/tx/${trimmedQuery}`);
    } else if (/^0x[a-fA-F0-9]{40}$/.test(trimmedQuery)) {
      // Address
      router.push(`/address/${trimmedQuery}`);
    } else {
      // Try to search in API
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${encodeURIComponent(trimmedQuery)}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          const result = data.data[0];
          switch (result.type) {
            case 'block':
              router.push(`/block/${result.value}`);
              break;
            case 'transaction':
              router.push(`/tx/${result.value}`);
              break;
            case 'address':
              router.push(`/address/${result.value}`);
              break;
          }
        } else {
          // Show error or no results found
          alert('No results found. Please check your search term.');
        }
      } catch (error) {
        console.error('Search error:', error);
        alert('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    setQuery('');
    setIsOpen(false);
  };

  // Generate search suggestions
  const generateSuggestions = (value: string) => {
    const suggestions = [];
    
    if (/^\d+$/.test(value)) {
      suggestions.push({
        type: 'block' as const,
        value: value,
        display: `Block #${value}`
      });
    }
    
    if (/^0x[a-fA-F0-9]+$/.test(value)) {
      if (value.length <= 42) {
        suggestions.push({
          type: 'address' as const,
          value: value,
          display: `Address: ${value}`
        });
      }
      if (value.length <= 66) {
        suggestions.push({
          type: 'transaction' as const,
          value: value,
          display: `Transaction: ${value.slice(0, 10)}...${value.slice(-8)}`
        });
      }
    }
    
    return suggestions;
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    
    if (value.length > 2) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-green-500/70" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by address, transaction hash, or block number..."
          className="w-full pl-10 pr-12 py-3 bg-gray-800/40 border border-green-500/30 rounded-xl text-green-400 placeholder-green-600/50 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all"
          disabled={isLoading}
        />
        
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500/70 hover:text-green-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-400 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Search Suggestions */}
      {isOpen && (query.length > 0 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-green-500/30 rounded-xl shadow-2xl shadow-green-500/20 overflow-hidden z-50">
          
          {/* Auto-detected suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-green-500/70 text-xs uppercase tracking-wide mb-2 px-3">Suggestions</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion.value)}
                  className="w-full text-left px-3 py-2 hover:bg-green-500/10 rounded-lg transition-all group flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    {suggestion.type === 'block' && (
                      <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-sm">
                        📦
                      </div>
                    )}
                    {suggestion.type === 'transaction' && (
                      <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center text-sm">
                        💸
                      </div>
                    )}
                    {suggestion.type === 'address' && (
                      <div className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center text-sm">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-400 font-medium truncate group-hover:text-green-300">
                      {suggestion.display}
                    </p>
                    <p className="text-green-500/60 text-sm capitalize">
                      {suggestion.type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search examples when no suggestions */}
          {query.length === 0 && suggestions.length === 0 && (
            <div className="p-4">
              <p className="text-green-500/70 text-xs uppercase tracking-wide mb-3">Examples</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-3 text-green-500/60">
                  <span className="w-6 text-center">📦</span>
                  <span>Block: 12345</span>
                </div>
                <div className="flex items-center space-x-3 text-green-500/60">
                  <span className="w-6 text-center">💸</span>
                  <span>Transaction: 0x1234...abcd</span>
                </div>
                <div className="flex items-center space-x-3 text-green-500/60">
                  <span className="w-6 text-center">👤</span>
                  <span>Address: 0x1234...abcd</span>
                </div>
              </div>
            </div>
          )}

          {/* No results */}
          {query.length > 2 && suggestions.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-green-500/60 text-sm">
                No suggestions found. Press Enter to search.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;