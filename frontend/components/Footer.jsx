export default function Footer() {
  // These variables are injected at build time by Next.js
  const commitHash = process.env.NEXT_PUBLIC_COMMIT_HASH || 'dev';
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

  const formatBuildTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'unknown';
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <div className="mb-2 sm:mb-0">
            <span className="font-semibold">Industrial Monitor</span>
            <span className="mx-2">·</span>
            <span suppressHydrationWarning>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-mono" title="Git Commit Hash">
                {commitHash}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span title={`Build Time: ${buildTime}`} suppressHydrationWarning>
                {formatBuildTime(buildTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
