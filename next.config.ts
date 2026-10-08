import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Vercel Image Optimization/Transformations.
    // Images are served from their original configured sources.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
