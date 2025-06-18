import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { formatUnits } from 'viem';

// Contract addresses
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x70cC81e15229fe9A016D147438A8D1a737268328';

// ABIs
const FACTORY_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' }
    ],
    name: 'getPair',
    outputs: [{ name: 'pair', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const PAIR_ABI = [
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: 'reserve0', type: 'uint112' },
      { name: 'reserve1', type: 'uint112' },
      { name: 'blockTimestampLast', type: 'uint32' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export interface PairInfo {
  pairAddress: string;
  exists: boolean;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  userLpBalance: string;
  userSharePercentage: number;
  userPooledToken0: string;
  userPooledToken1: string;
  token0Address: string;
  token1Address: string;
  loading: boolean;
  error: string | null;
}

export interface UsePairInfoParams {
  tokenA: string;
  tokenB: string;
  enabled?: boolean;
}

export const usePairInfo = ({ tokenA, tokenB, enabled = true }: UsePairInfoParams): PairInfo => {
  const [pairInfo, setPairInfo] = useState<PairInfo>({
    pairAddress: '',
    exists: false,
    reserve0: '0',
    reserve1: '0',
    totalSupply: '0',
    userLpBalance: '0',
    userSharePercentage: 0,
    userPooledToken0: '0',
    userPooledToken1: '0',
    token0Address: '',
    token1Address: '',
    loading: false,
    error: null
  });

  const publicClient = usePublicClient();
  const { address } = useAccount();

  const fetchPairInfo = useCallback(async () => {
    if (!publicClient || !tokenA || !tokenB || tokenA === tokenB || !enabled) {
      return;
    }

    try {
      setPairInfo(prev => ({ ...prev, loading: true, error: null }));

      // Get pair address from factory
      const pairAddress = await publicClient.readContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'getPair',
        args: [tokenA, tokenB]
      }) as string;

      // Check if pair exists
      const exists = pairAddress !== '0x0000000000000000000000000000000000000000';

      if (!exists) {
        setPairInfo({
          pairAddress: '',
          exists: false,
          reserve0: '0',
          reserve1: '0',
          totalSupply: '0',
          userLpBalance: '0',
          userSharePercentage: 0,
          userPooledToken0: '0',
          userPooledToken1: '0',
          token0Address: '',
          token1Address: '',
          loading: false,
          error: null
        });
        return;
      }

      // Use multicall to fetch all pair data in parallel
      const multicallData = await Promise.all([
        // Get reserves
        publicClient.readContract({
          address: pairAddress as `0x${string}`,
          abi: PAIR_ABI,
          functionName: 'getReserves'
        }),
        // Get total supply
        publicClient.readContract({
          address: pairAddress as `0x${string}`,
          abi: PAIR_ABI,
          functionName: 'totalSupply'
        }),
        // Get user LP balance (if address available)
        address ? publicClient.readContract({
          address: pairAddress as `0x${string}`,
          abi: PAIR_ABI,
          functionName: 'balanceOf',
          args: [address]
        }) : Promise.resolve(0n),
        // Get token0 address
        publicClient.readContract({
          address: pairAddress as `0x${string}`,
          abi: PAIR_ABI,
          functionName: 'token0'
        }),
        // Get token1 address
        publicClient.readContract({
          address: pairAddress as `0x${string}`,
          abi: PAIR_ABI,
          functionName: 'token1'
        })
      ]);

      const [reserves, totalSupply, userLpBalance, token0Address, token1Address] = multicallData;
      const [reserve0, reserve1] = reserves as [bigint, bigint, number];

      // Format values
      const formattedReserve0 = formatUnits(reserve0, 18);
      const formattedReserve1 = formatUnits(reserve1, 18);
      const formattedTotalSupply = formatUnits(totalSupply as bigint, 18);
      const formattedUserLpBalance = formatUnits(userLpBalance as bigint, 18);

      // Calculate user's share percentage
      const userSharePercentage = parseFloat(formattedTotalSupply) > 0 
        ? (parseFloat(formattedUserLpBalance) / parseFloat(formattedTotalSupply)) * 100 
        : 0;

      // Calculate user's pooled tokens
      const userPooledToken0 = (parseFloat(formattedReserve0) * userSharePercentage / 100).toString();
      const userPooledToken1 = (parseFloat(formattedReserve1) * userSharePercentage / 100).toString();

      setPairInfo({
        pairAddress,
        exists: true,
        reserve0: formattedReserve0,
        reserve1: formattedReserve1,
        totalSupply: formattedTotalSupply,
        userLpBalance: formattedUserLpBalance,
        userSharePercentage,
        userPooledToken0,
        userPooledToken1,
        token0Address: token0Address as string,
        token1Address: token1Address as string,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching pair info:', error);
      setPairInfo(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pair info'
      }));
    }
  }, [publicClient, tokenA, tokenB, address, enabled]);

  useEffect(() => {
    fetchPairInfo();
  }, [fetchPairInfo]);

  return pairInfo;
};

// Helper hook for multiple pairs (for positions view)
export const useMultiplePairInfo = (pairs: Array<{ tokenA: string; tokenB: string }>) => {
  const [pairsInfo, setPairsInfo] = useState<Record<string, PairInfo>>({});
  const [loading, setLoading] = useState(false);

  const publicClient = usePublicClient();
  const { address } = useAccount();

  const fetchMultiplePairs = useCallback(async () => {
    if (!publicClient || pairs.length === 0) return;

    try {
      setLoading(true);
      const results: Record<string, PairInfo> = {};

      // Fetch all pairs in parallel
      await Promise.all(
        pairs.map(async ({ tokenA, tokenB }) => {
          const pairKey = `${tokenA}-${tokenB}`;
          
          try {
            // Get pair address
            const pairAddress = await publicClient.readContract({
              address: FACTORY_ADDRESS as `0x${string}`,
              abi: FACTORY_ABI,
              functionName: 'getPair',
              args: [tokenA, tokenB]
            }) as string;

            const exists = pairAddress !== '0x0000000000000000000000000000000000000000';

            if (exists) {
              // Fetch pair data
              const [reserves, totalSupply, userLpBalance, token0Address, token1Address] = await Promise.all([
                publicClient.readContract({
                  address: pairAddress as `0x${string}`,
                  abi: PAIR_ABI,
                  functionName: 'getReserves'
                }),
                publicClient.readContract({
                  address: pairAddress as `0x${string}`,
                  abi: PAIR_ABI,
                  functionName: 'totalSupply'
                }),
                address ? publicClient.readContract({
                  address: pairAddress as `0x${string}`,
                  abi: PAIR_ABI,
                  functionName: 'balanceOf',
                  args: [address]
                }) : Promise.resolve(0n),
                publicClient.readContract({
                  address: pairAddress as `0x${string}`,
                  abi: PAIR_ABI,
                  functionName: 'token0'
                }),
                publicClient.readContract({
                  address: pairAddress as `0x${string}`,
                  abi: PAIR_ABI,
                  functionName: 'token1'
                })
              ]);

              const [reserve0, reserve1] = reserves as [bigint, bigint, number];
              const formattedReserve0 = formatUnits(reserve0, 18);
              const formattedReserve1 = formatUnits(reserve1, 18);
              const formattedTotalSupply = formatUnits(totalSupply as bigint, 18);
              const formattedUserLpBalance = formatUnits(userLpBalance as bigint, 18);

              const userSharePercentage = parseFloat(formattedTotalSupply) > 0 
                ? (parseFloat(formattedUserLpBalance) / parseFloat(formattedTotalSupply)) * 100 
                : 0;

              results[pairKey] = {
                pairAddress,
                exists: true,
                reserve0: formattedReserve0,
                reserve1: formattedReserve1,
                totalSupply: formattedTotalSupply,
                userLpBalance: formattedUserLpBalance,
                userSharePercentage,
                userPooledToken0: (parseFloat(formattedReserve0) * userSharePercentage / 100).toString(),
                userPooledToken1: (parseFloat(formattedReserve1) * userSharePercentage / 100).toString(),
                token0Address: token0Address as string,
                token1Address: token1Address as string,
                loading: false,
                error: null
              };
            } else {
              results[pairKey] = {
                pairAddress: '',
                exists: false,
                reserve0: '0',
                reserve1: '0',
                totalSupply: '0',
                userLpBalance: '0',
                userSharePercentage: 0,
                userPooledToken0: '0',
                userPooledToken1: '0',
                token0Address: '',
                token1Address: '',
                loading: false,
                error: null
              };
            }
          } catch (error) {
            results[pairKey] = {
              pairAddress: '',
              exists: false,
              reserve0: '0',
              reserve1: '0',
              totalSupply: '0',
              userLpBalance: '0',
              userSharePercentage: 0,
              userPooledToken0: '0',
              userPooledToken1: '0',
              token0Address: '',
              token1Address: '',
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch pair'
            };
          }
        })
      );

      setPairsInfo(results);
    } catch (error) {
      console.error('Error fetching multiple pairs:', error);
    } finally {
      setLoading(false);
    }
  }, [publicClient, pairs, address]);

  useEffect(() => {
    fetchMultiplePairs();
  }, [fetchMultiplePairs]);

  return { pairsInfo, loading, refetch: fetchMultiplePairs };
};