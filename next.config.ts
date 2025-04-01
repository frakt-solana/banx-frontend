import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
      include: path.resolve(__dirname, 'src'),
    })

    return config
  },
}

export default nextConfig
