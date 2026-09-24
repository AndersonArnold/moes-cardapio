import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edzcezjkshefeotgtxnt.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/product-images/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/storage-cdn/:path*',
        destination: 'https://edzcezjkshefeotgtxnt.supabase.co/storage/v1/object/public/:path*',
      },
    ];
  },
};

export default nextConfig;
