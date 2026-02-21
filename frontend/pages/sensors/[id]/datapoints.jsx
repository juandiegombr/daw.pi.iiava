import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import ErrorMessage from "../../../components/ErrorMessage";
import SensorDataChart from "../../../components/SensorDataChart";

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const apiUrl = process.env.API_URL;
    const response = await fetch(`${apiUrl}/api/sensors/${id}/datapoints`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: context.req.headers.cookie || "",
      },
    });

    if (!response.ok) {
      throw new Error("Error al cargar los datos del sensor");
    }

    const result = await response.json();
    return {
      props: {
        sensor: result.data.sensor,
        initialDatapoints: result.data.datapoints,
        error: null,
      },
    };
  } catch (error) {
    return {
      props: {
        sensor: null,
        initialDatapoints: [],
        error: error.message,
      },
    };
  }
}

export default function SensorDataPointsPage({ sensor, initialDatapoints, error }) {
  const [datapoints, setDatapoints] = useState(initialDatapoints);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtering, setFiltering] = useState(false);

  const applyFilter = async () => {
    setFiltering(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());

      const response = await fetch(
        `/api/sensors/${sensor._id}/datapoints?${params.toString()}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const result = await response.json();
        setDatapoints(result.data.datapoints);
      }
    } catch {
      // Keep current datapoints on error
    } finally {
      setFiltering(false);
    }
  };

  const clearFilter = async () => {
    setFrom("");
    setTo("");
    setFiltering(true);
    try {
      const response = await fetch(
        `/api/sensors/${sensor._id}/datapoints`,
        { credentials: "include" }
      );
      if (response.ok) {
        const result = await response.json();
        setDatapoints(result.data.datapoints);
      }
    } catch {
      // Keep current datapoints on error
    } finally {
      setFiltering(false);
    }
  };

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Industrial Monitor</title>
        </Head>
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorMessage message={error} />
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Sensores
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{sensor?.alias || "Sensor"} - Industrial Monitor</title>
      </Head>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a Sensores
        </Link>

        {/* Sensor Info */}
        {sensor && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {sensor.alias}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Tipo: <span className="font-semibold">{sensor.type}</span>
              </span>
              <span className="text-sm text-gray-600">
                ID: <span className="font-mono text-xs">{sensor._id}</span>
              </span>
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Filtrar por fecha</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Desde</label>
              <input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hasta</label>
              <input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={applyFilter}
              disabled={filtering || (!from && !to)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {filtering ? "Filtrando..." : "Filtrar"}
            </button>
            {(from || to) && (
              <button
                onClick={clearFilter}
                disabled={filtering}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Datapoints Chart */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Datos del Sensor
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {datapoints.length} lecturas registradas
            </p>
          </div>

          {datapoints.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay datos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {from || to
                  ? "No hay lecturas en el rango seleccionado."
                  : "Este sensor aún no tiene lecturas registradas."}
              </p>
            </div>
          ) : (
            <div className="px-6 py-6">
              <SensorDataChart datapoints={datapoints} sensor={sensor} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
