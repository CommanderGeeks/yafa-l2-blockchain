import { type ClassValue, clsx } from 'clsx';

// Utility function for combining class names (similar to Tailwind's approach)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format numbers with appropriate suffixes
export function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  
  return n.toString();
}

// Format Wei to ETH with appropriate precision
export function formatEther(wei: string | bigint, decimals: number = 18): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = weiValue / divisor;
  const fractionalPart = weiValue % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  // Convert fractional part to decimal string
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${trimmedFractional}`;
}

// Format hash strings with ellipsis
export function formatHash(hash: string, startLength: number = 6, endLength: number = 4): string {
  if (!hash) return '';
  if (hash.length <= startLength + endLength) return hash;
  
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

// Format address with ENS support (placeholder for future ENS integration)
export function formatAddress(address: string, length: number = 8): string {
  if (!address) return '';
  return formatHash(address, length / 2, length / 2);
}

// Format time ago from timestamp
export function formatTimeAgo(timestamp: string | number | Date): string {
  const now = Date.now();
  const time = typeof timestamp === 'string' 
    ? new Date(timestamp).getTime()
    : typeof timestamp === 'number'
    ? timestamp * 1000
    : timestamp.getTime();
    
  const diff = Math.floor((now - time) / 1000);
  
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  
  return `${Math.floor(diff / 31536000)}y ago`;
}

// Format gas amounts
export function formatGas(gas: string | number): string {
  const gasNum = typeof gas === 'string' ? parseInt(gas) : gas;
  
  if (gasNum >= 1e9) return `${(gasNum / 1e9).toFixed(2)}B`;
  if (gasNum >= 1e6) return `${(gasNum / 1e6).toFixed(2)}M`;
  if (gasNum >= 1e3) return `${(gasNum / 1e3).toFixed(1)}K`;
  
  return gasNum.toLocaleString();
}

// Format Gwei from Wei
export function formatGwei(wei: string | number): string {
  const weiNum = typeof wei === 'string' ? parseFloat(wei) : wei;
  const gwei = weiNum / 1e9;
  
  if (gwei < 0.01) return '< 0.01';
  if (gwei < 1) return gwei.toFixed(2);
  if (gwei < 100) return gwei.toFixed(1);
  
  return Math.round(gwei).toString();
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate transaction hash
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

// Validate block number
export function isValidBlockNumber(block: string): boolean {
  return /^\d+$/.test(block);
}

// Detect search query type
export function detectSearchType(query: string): 'block' | 'transaction' | 'address' | 'unknown' {
  const trimmed = query.trim();
  
  if (isValidBlockNumber(trimmed)) return 'block';
  if (isValidTxHash(trimmed)) return 'transaction';
  if (isValidAddress(trimmed)) return 'address';
  
  return 'unknown';
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy to clipboard:', fallbackError);
      return false;
    }
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Format duration in seconds to human readable
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  
  return `${secs}s`;
}

// Calculate percentage change
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// Generate random ID
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format large numbers with K, M, B suffixes
export function formatLargeNumber(num: number, decimals: number = 1): string {
  if (num === 0) return '0';
  
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(decimals)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(decimals)}K`;
  
  return num.toString();
}

// Get status color based on transaction status
export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'success':
    case '1':
      return 'text-emerald-400 bg-emerald-500/20';
    case 'failed':
    case '0':
      return 'text-red-400 bg-red-500/20';
    case 'pending':
      return 'text-yellow-400 bg-yellow-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
}

// Get trend color and icon
export function getTrendInfo(value: number): { color: string; icon: string } {
  if (value > 0) {
    return { color: 'text-emerald-400', icon: '↗' };
  } else if (value < 0) {
    return { color: 'text-red-400', icon: '↘' };
  }
  return { color: 'text-gray-400', icon: '→' };
}

// Local storage helpers
export const storage = {
  get: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};