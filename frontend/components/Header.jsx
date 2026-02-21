import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { pathname } = useRouter();

  const linkClass = (href) =>
    `text-sm transition-colors ${
      pathname === href
        ? "text-blue-600 font-semibold"
        : "text-gray-700 hover:text-blue-600"
    }`;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-2xl font-bold text-blue-800 flex items-center"
            >
              <span className="mr-2">⚙️</span>
              Industrial Monitor
            </Link>
            <p className="mt-1 text-sm text-gray-600">
              Monitor de señales de sensores de máquinas industriales en tiempo
              real
            </p>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-3">
                <Link href="/" className={linkClass("/")}>
                  Sensores
                </Link>
                <Link href="/alerts" className={linkClass("/alerts")}>
                  Alertas
                </Link>
                {isAdmin && (
                  <>
                    <Link href="/send-data" className={linkClass("/send-data")}>
                      Enviar Datos
                    </Link>
                    <Link href="/geolocation" className={linkClass("/geolocation")}>
                      Geolocalización
                    </Link>
                  </>
                )}
              </nav>
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-600">
                  {user?.username}
                  {isAdmin && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      admin
                    </span>
                  )}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
