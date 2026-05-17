const distDir = process.env.NEXT_DIST_DIR || '.next';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://kinmel-q453.onrender.com';

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir,
  generateBuildId: async () => 'kinmel-client',
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    webpackBuildWorker: false,
    devtoolSegmentExplorer: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud', pathname: '/**' },
    ],
    domains: ['images.unsplash.com', 'gateway.pinata.cloud'],
  },
  // Same-origin proxy: browser hits /api/v1/* on Vercel domain,
  // Vercel forwards to Render backend. Refresh cookie stays first-party.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
