import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudinary performs image transformations at delivery time.
    // The custom loader prevents Vercel Image Optimization usage.
    loader: "custom",
    loaderFile: "./lib/cloudinary-image-loader.ts",
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
