import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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

export default defineConfig(({ mode }) => {
  const commitHash = getGitCommitHash();
  const buildTime = new Date().toISOString();

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __BUILD_TIME__: JSON.stringify(buildTime),
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './tests/setup.js',
      css: true,
    },
  };
});
