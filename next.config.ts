import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // For Tauri desktop apps, use static export
  // Set STATIC_EXPORT=true to enable static export mode
  ...(process.env.STATIC_EXPORT === 'true' && {
    output: 'export',
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
