/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Custom port for the web frontend
  env: {
    CUSTOM_PORT: process.env.WEB_PORT || '3002',
  },
  
  // Image optimization configuration
  images: {
    domains: [
      'localhost',
      // Add any external image domains here
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO and user experience
  async redirects() {
    return [
      {
        source: '/blocks',
        destination: '/?tab=blocks',
        permanent: false,
      },
      {
        source: '/transactions',
        destination: '/?tab=transactions',
        permanent: false,
      },
      {
        source: '/tokens',
        destination: '/?tab=tokens',
        permanent: false,
      },
    ];
  },
  
  // Rewrites for API proxying if needed
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack rules if needed
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // Optimize bundle size
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/components': path.resolve(__dirname, 'components'),
        '@/lib': path.resolve(__dirname, 'lib'),
        '@/app': path.resolve(__dirname, 'app'),
      };
    }
    
    return config;
  },
  
  // Experimental features
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
    // Optimize CSS
    optimizeCss: true,
    // Enable edge runtime for some pages
    runtime: 'nodejs',
  },
  
  // TypeScript configuration
  typescript: {
    // Allow production builds to successfully complete even if there are type errors
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Allow production builds to successfully complete even if there are lint errors
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib'],
  },
  
  // Output configuration for deployment
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Power by header
  poweredByHeader: false,
  
  // Generate ETags for better caching
  generateEtags: true,
  
  // Page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_CHAIN_NAME: process.env.NEXT_PUBLIC_CHAIN_NAME,
  },
  
  // Standalone build for Docker
  output: 'standalone',
};

// Add path import for alias resolution
const path = require('path');

module.exports = nextConfig;