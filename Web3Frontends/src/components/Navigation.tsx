import Link from 'next/link';
import { useRouter } from 'next/router';

const Navigation = () => {
  const router = useRouter();
  
  return (
    <div className="flex items-center space-x-4 mb-8">
      <Link 
        href="/"
        className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
          router.pathname === '/' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
            : 'bg-gray-900/50 text-green-500/70 border border-green-500/20 hover:bg-gray-800/50 hover:text-green-400'
        }`}
      >
        🌉 Bridge
      </Link>
      <Link 
        href="/dex"
        className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
          router.pathname === '/dex' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
            : 'bg-gray-900/50 text-green-500/70 border border-green-500/20 hover:bg-gray-800/50 hover:text-green-400'
        }`}
      >
        🔄 DEX
      </Link>
      <Link 
        href="/pool"
        className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
          router.pathname === '/pool' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
            : 'bg-gray-900/50 text-green-500/70 border border-green-500/20 hover:bg-gray-800/50 hover:text-green-400'
        }`}
      >
        💧 Pools
      </Link>
    </div>
  );
};

export default Navigation;