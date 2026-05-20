export default function Footer() {
  const commitHash = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'dev';
  const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();

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
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-slate-600">
          <div className="mb-2 sm:mb-0">
            <span className="font-semibold text-slate-800">Industrial Monitor</span>
            <span className="mx-2 text-slate-400">·</span>
            <span suppressHydrationWarning>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-mono text-slate-700 tracking-[0.06em]" title="Git Commit Hash">
                {commitHash}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-slate-600 tracking-[0.04em]" title={`Build Time: ${buildTime}`} suppressHydrationWarning>
                {formatBuildTime(buildTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
