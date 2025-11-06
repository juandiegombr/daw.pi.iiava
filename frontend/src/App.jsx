import { useEffect, useState } from "react";
import SensorCard from "./components/SensorCard";

export default function App() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(API_URL + "/sensors", { method: "GET", headers: { "Content-Type": "application/json" } })
      .then((response) => response.json())
      .then((result) => {
        setSensors(result.data.sensors);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error al cargar los sensores</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : sensors.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-8 rounded-lg text-center">
            <p className="text-lg font-semibold mb-2">No hay sensores disponibles en este momento</p>
            <p className="text-sm">Esperando configuración de sensores...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800">
                Sensores Activos
                <span className="ml-3 text-lg font-normal text-gray-600">
                  ({sensors.length} {sensors.length === 1 ? "sensor" : "sensores"})
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sensors.map((sensor) => (
                <SensorCard key={sensor._id} sensor={sensor} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
