import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow canvas-based image processing (runs fully client-side)
  // No image domains needed since we use data URLs
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
