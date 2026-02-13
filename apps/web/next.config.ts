import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['shared-types', '@cadence/api'],
};

export default nextConfig;
