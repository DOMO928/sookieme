import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  experimental: { globalNotFound: true },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  devIndicators: false,
  reactStrictMode: true,
};
export default nextConfig;
