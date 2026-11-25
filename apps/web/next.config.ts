import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@vserve/calc', '@vserve/ui'],
};

export default nextConfig;
