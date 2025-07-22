/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

// Sentry configuration (Official Next.js Integration)
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  // Source map handling (secure by default)
  sourcemaps: {
    deleteSourcemapsAfterUpload: process.env.NODE_ENV === 'production',
    disable: false, // Keep enabled for better error tracking
  },
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);