import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'websocket-chat';

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
  // For GitHub Pages deployment
  ...(isGitHubPages && {
    output: 'export',
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
  }),
};

export default nextConfig;
