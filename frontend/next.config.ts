import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
    unoptimized: true,
  },
  // Use webpack on platforms where Turbopack native bindings may not be available
  webpack: (config) => config,
};

export default nextConfig;
