/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Sentry Configuration
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },

  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // Bundle optimization
  experimental: {
    optimizeCss: true,
    // Modern JS features for better tree shaking
    esmExternals: 'loose',
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Bundle analysis optimizations
    if (!dev && !isServer) {
      // Enable tree shaking for better bundle size
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Chunk splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk for third-party libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 20,
            chunks: 'all',
          },
          // TanStack Query chunk (large library)
          tanstack: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            name: 'tanstack',
            priority: 30,
            chunks: 'all',
          },
          // Lucide icons chunk
          icons: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'icons',
            priority: 30,
            chunks: 'all',
          },
          // Common chunk for shared code
          common: {
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);