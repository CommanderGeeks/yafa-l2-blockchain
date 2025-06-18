import '@rainbow-me/rainbowkit/styles.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { 
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  base,
} from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { http } from 'viem';
import { SolanaWalletProvider } from '@/components/SolanaWalletProvider';

const BRIDGE_ADDRESS = "0x70cC81e15229fe9A016D147438A8D1a737268328";
const DEX_ADDRESS = "0x2E51daEaaF8497fC725900c9f46caDbC0a1d01f5";

// Configure chains
const supportedChains = [mainnet, sepolia, polygon, arbitrum, base] as const;

// Configure transports for each chain
const transports = {
  [mainnet.id]: http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
  [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
  [polygon.id]: http(`https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
  [arbitrum.id]: http(`https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
  [base.id]: http('https://mainnet.base.org'), // Base public RPC
};

// Configure with all chains
const config = getDefaultConfig({
  appName: 'Yafa Bridge',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: supportedChains,
  transports,
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SolanaWalletProvider>
            <Component {...pageProps} />
          </SolanaWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}