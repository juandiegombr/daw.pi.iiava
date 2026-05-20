import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ErrorMessage from "../../../components/ErrorMessage";
import SensorDataChart from "../../../components/SensorDataChart";

function toDatetimeLocal(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function SensorDataPointsPage({
  sensor: sensorProp = null,
  datapoints: datapointsProp = null,
  error: errorProp = null,
}) {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const shouldFetch = sensorProp === null && errorProp === null;

  const [sensor, setSensor] = useState(sensorProp);
  const [datapoints, setDatapoints] = useState(datapointsProp || []);
  const [error, setError] = useState(errorProp);
  const [loading, setLoading] = useState(shouldFetch);
  const [filtering, setFiltering] = useState(false);

  const [from, setFrom] = useState(toDatetimeLocal(searchParams.get("from") || ""));
  const [to, setTo] = useState(toDatetimeLocal(searchParams.get("to") || ""));

  useEffect(() => {
    if (!shouldFetch) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      const fromParam = searchParams.get("from");
      const toParam = searchParams.get("to");
      if (fromParam) params.set("from", fromParam);
      if (toParam) params.set("to", toParam);
      const qs = params.toString();

      const response = await fetch(
        `/api/sensors/${id}/datapoints${qs ? `?${qs}` : ""}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Error al cargar los datos del sensor");

      const result = await response.json();
      setSensor(result.data.sensor);
      setDatapoints(result.data.datapoints);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

        const newParams = {};
        if (from) newParams.from = new Date(from).toISOString();
        if (to) newParams.to = new Date(to).toISOString();
        setSearchParams(newParams, { replace: true });
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
        setSearchParams({}, { replace: true });
      }
    } catch {
      // Keep current datapoints on error
    } finally {
      setFiltering(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error} />
        <Link
          to="/"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver a Sensores
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        to="/"
        className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors"
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
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {sensor.alias}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Tipo: <span className="font-semibold">{sensor.type}</span>
            </span>
            <span className="text-sm text-slate-600">
              ID: <span className="font-mono text-xs">{sensor._id}</span>
            </span>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-sm font-medium text-slate-700 mb-3">Filtrar por fecha</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Desde</label>
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Hasta</label>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={applyFilter}
            disabled={filtering || (!from && !to)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400"
          >
            {filtering ? "Filtrando..." : "Filtrar"}
          </button>
          {(from || to) && (
            <button
              onClick={clearFilter}
              disabled={filtering}
              className="px-4 py-2 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors disabled:bg-slate-100"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Datapoints Chart */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Datos del Sensor
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {datapoints.length} lecturas registradas
          </p>
        </div>

        {datapoints.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
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
            <h3 className="mt-2 text-sm font-medium text-slate-900">
              No hay datos
            </h3>
            <p className="mt-1 text-sm text-slate-500">
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
  );
}
