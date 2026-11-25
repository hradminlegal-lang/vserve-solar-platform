import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Put <title> and meta description in <head> for every visitor, not only known crawlers
  // (answer engines and Lighthouse read the head). Pages here render fast, so nothing is lost.
  htmlLimitedBots: /.*/,
  transpilePackages: ['@vserve/calc', '@vserve/ui'],
};

export default nextConfig;
