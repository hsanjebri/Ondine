import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Drive C: is nearly full — Turbopack's on-disk cache (~170 MB) filled it.
    // Set both back to true (the default) once there is space again.
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Unsplash photos are hotlinked: <UnsplashImage> uses its own loader that
    // builds imgix URLs on images.unsplash.com, so the browser fetches them
    // straight from Unsplash. The pattern below is kept for any plain usage.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    deviceSizes: [640, 750, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [96, 160, 256, 384, 480],
    qualities: [70, 75, 85],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
