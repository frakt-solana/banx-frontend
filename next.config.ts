import withBundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  webpack: (config, options) => {
    if (options.dev) {
      Object.defineProperty(config, 'devtool', {
        get: () => 'source-map',
        set: () => null,
      })
    }

    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      assert: require.resolve('assert'),
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: false,
    }
    return config
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default withAnalyzer(nextConfig)
