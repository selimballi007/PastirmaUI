import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
