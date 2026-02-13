import { execSync } from 'child_process';

// Get git commit hash
const getGitCommitHash = () => {
  // Try to get from environment variable first (for Docker)
  if (process.env.GIT_COMMIT_HASH) {
    return process.env.GIT_COMMIT_HASH;
  }

  // Otherwise try to get from git command (for local development)
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_COMMIT_HASH: getGitCommitHash(),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
