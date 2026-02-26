import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { pathname } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
              Monitor de máquinas industriales en tiempo real
            </p>
          </div>

          {isAuthenticated && (
            <>
              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-4">
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

              {/* Hamburger button */}
              <button
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {isAuthenticated && menuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200 flex flex-col gap-3">
            <nav className="flex flex-col gap-2">
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
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
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
    </header>
  );
}
