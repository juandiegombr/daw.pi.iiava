import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import ProtectedRoute from "../components/ProtectedRoute";

export default function GeolocationPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("latlon");
  const [tracking, setTracking] = useState(false);
  const [sendCount, setSendCount] = useState(0);
  const watchIdRef = useRef(null);

  useEffect(() => {
    async function fetchSensors() {
      try {
        const response = await fetch("/api/sensors", { credentials: "include" });
        if (response.ok) {
          const result = await response.json();
          setSensors(result.data.sensors);
        }
      } catch {
        // Silently handle
      }
    }
    fetchSensors();
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const PROPERTIES = [
    { value: "latlon", label: "Latitud, Longitud" },
    { value: "latitude", label: "Latitud" },
    { value: "longitude", label: "Longitud" },
    { value: "accuracy", label: "Precisión (m)" },
    { value: "altitude", label: "Altitud (m)" },
    { value: "speed", label: "Velocidad (m/s)" },
    { value: "heading", label: "Rumbo (°)" },
  ];

  const getPropertyValue = (coords) => {
    switch (selectedProperty) {
      case "latlon":
        return `${coords.latitude},${coords.longitude}`;
      case "latitude":
        return String(coords.latitude);
      case "longitude":
        return String(coords.longitude);
      case "accuracy":
        return String(coords.accuracy);
      case "altitude":
        return coords.altitude != null ? String(coords.altitude) : null;
      case "speed":
        return coords.speed != null ? String(coords.speed) : null;
      case "heading":
        return coords.heading != null ? String(coords.heading) : null;
      default:
        return null;
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    if (!selectedSensor) return;

    setError(null);
    setSendCount(0);
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
        };
        setLocation(coords);

        const value = getPropertyValue(coords);
        if (value === null) return;

        try {
          const response = await fetch(`/api/sensors/${selectedSensor}/datapoints`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ value }),
          });
          if (response.ok) {
            setSendCount((c) => c + 1);
          }
        } catch {
          // Send errors are non-fatal during tracking
        }
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        stopTracking();
      },
      { enableHighAccuracy: true }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  return (
    <ProtectedRoute adminOnly>
      <Head>
        <title>Geolocalización - Industrial Monitor</title>
      </Head>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Geolocalización</h1>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensor
            </label>
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              disabled={tracking}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Seleccionar sensor</option>
              {sensors.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.alias}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Propiedad a enviar
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              disabled={tracking}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              {PROPERTIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={tracking ? stopTracking : startTracking}
            disabled={!tracking && !selectedSensor}
            className={`w-full px-4 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 ${
              tracking
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {tracking ? "Detener envío" : "Iniciar envío"}
          </button>

          {location && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Ubicación actual</h3>
              <p className="text-sm text-gray-600">
                Latitud: <span className="font-mono">{location.latitude.toFixed(6)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Longitud: <span className="font-mono">{location.longitude.toFixed(6)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Precisión: <span className="font-mono">{location.accuracy.toFixed(1)}m</span>
              </p>
              <p className="text-sm text-gray-600">
                Altitud: <span className="font-mono">{location.altitude != null ? `${location.altitude.toFixed(1)}m` : "N/A"}</span>
              </p>
              <p className="text-sm text-gray-600">
                Velocidad: <span className="font-mono">{location.speed != null ? `${location.speed.toFixed(2)} m/s` : "N/A"}</span>
              </p>
              <p className="text-sm text-gray-600">
                Rumbo: <span className="font-mono">{location.heading != null ? `${location.heading.toFixed(1)}°` : "N/A"}</span>
              </p>
              {tracking && (
                <p className="text-sm text-green-700 mt-2 font-medium">
                  Envíos realizados: {sendCount}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
