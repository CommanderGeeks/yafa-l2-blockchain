export const TOKEN_LIST = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    logoUrl: '/tokens/eth.png'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: process.env.NEXT_PUBLIC_WETH_ADDRESS || '0x...',
    decimals: 18,
    logoUrl: '/tokens/weth.png'
  },
  {
    symbol: 'TKA',
    name: 'Test Token A',
    address: process.env.NEXT_PUBLIC_TKA_ADDRESS || '0x...',
    decimals: 18,
    logoUrl: '/tokens/tka.png'
  },
  {
    symbol: 'TKB',
    name: 'Test Token B',
    address: process.env.NEXT_PUBLIC_TKB_ADDRESS || '0x...',
    decimals: 18,
    logoUrl: '/tokens/tkb.png'
  }
];