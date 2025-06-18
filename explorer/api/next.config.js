/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Custom port for the API server
  env: {
    CUSTOM_PORT: process.env.API_PORT || '3001',
  },
  
  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.CORS_ORIGINS || 'http://localhost:3002,http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Handle preflight requests
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
      {
        source: '/status',
        destination: '/api/health',
      },
    ];
  },
  
  // Webpack configuration for API
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude client-side code from server bundle
    if (isServer) {
      config.externals.push('_http_common');
    }
    
    // Add support for importing .sql files
    config.module.rules.push({
      test: /\.sql$/,
      use: 'raw-loader',
    });
    
    // Optimize for server-side rendering
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib': path.resolve(__dirname, 'lib'),
    };
    
    return config;
  },
  
  // Experimental features for API
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: [
      'prisma',
      '@prisma/client',
      'bcryptjs',
      'jsonwebtoken',
    ],
    // Optimize for API routes
    runtime: 'nodejs',
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'lib'],
  },
  
  // Disable image optimization for API-only app
  images: {
    unoptimized: true,
  },
  
  // Output configuration
  output: 'standalone',
  
  // Disable static optimization for API routes
  staticOptimization: false,
  
  // API route configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '50mb',
    externalResolver: true,
  },
  
  // Environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    LOG_LEVEL: process.env.LOG_LEVEL,
    NODE_ENV: process.env.NODE_ENV,
  },
  
  // Disable power by header
  poweredByHeader: false,
  
  // Disable ETags for API responses (optional)
  generateEtags: false,
  
  // Compression
  compress: true,
  
  // Trailing slash configuration
  trailingSlash: false,
  
  // Page extensions (API routes only)
  pageExtensions: ['ts', 'js'],
  
  // Disable static file serving since this is API-only
  assetPrefix: '',
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

// Add path import
const path = require('path');

module.exports = nextConfig;