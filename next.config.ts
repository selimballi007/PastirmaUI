import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint and TypeScript errors during build for Railway deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'external-content.duckduckgo.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.kayserihaber38.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'trthaberstatic.cdn.wp.trt.com.tr',
        pathname: '/**',
      },
    ],
  },
  // Allow cross-origin requests from local network devices in development
  allowedDevOrigins: ['192.168.1.104'],

  // Rewrites for same-domain API proxy (Railway test/production)
  async rewrites() {
    // Only use rewrites in non-development environments (Railway)
    if (process.env.NODE_ENV === 'production' && process.env.BACKEND_INTERNAL_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `https://${process.env.BACKEND_INTERNAL_URL}/api/:path*`,
        },
        {
          source: '/hubs/:path*',
          destination: `https://${process.env.BACKEND_INTERNAL_URL}/hubs/:path*`,
        },
      ];
    }

    // In development, no rewrites (use full backend URL)
    return [];
  },
};

export default nextConfig;
