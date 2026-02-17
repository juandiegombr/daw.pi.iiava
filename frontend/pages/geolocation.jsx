import { useState } from "react";
import Head from "next/head";
import ProtectedRoute from "../components/ProtectedRoute";

export default function GeolocationPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState("");
  const [success, setSuccess] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        setLoading(false);
      }
    );
  };

  const fetchSensors = async () => {
    try {
      const response = await fetch("/api/sensors", { credentials: "include" });
      if (response.ok) {
        const result = await response.json();
        setSensors(result.data.sensors.filter((s) => s.type === "string"));
      }
    } catch {
      // Silently handle
    }
  };

  const sendLocation = async () => {
    if (!location || !selectedSensor) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const value = `${location.latitude},${location.longitude}`;
      const response = await fetch(`/api/sensors/${selectedSensor}/datapoints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value }),
      });

      if (!response.ok) throw new Error("Error sending location");
      setSuccess("Location sent successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
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

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <button
              onClick={getLocation}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {loading ? "Obteniendo ubicación..." : "Obtener Ubicación"}
            </button>
          </div>

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

              <div className="mt-4 space-y-2">
                <select
                  value={selectedSensor}
                  onChange={(e) => setSelectedSensor(e.target.value)}
                  onFocus={fetchSensors}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar sensor (tipo string)</option>
                  {sensors.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.alias}
                    </option>
                  ))}
                </select>

                <button
                  onClick={sendLocation}
                  disabled={sending || !selectedSensor}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  {sending ? "Enviando..." : "Enviar Ubicación"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
