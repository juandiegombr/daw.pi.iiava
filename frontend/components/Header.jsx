export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-4xl font-bold text-blue-800 flex items-center">
          <span className="mr-3">⚙️</span>
          Industrial Monitor
        </h1>
        <p className="mt-2 text-gray-600">
          Monitor de señales de sensores de máquinas industriales en tiempo real
        </p>
      </div>
    </header>
  );
}
