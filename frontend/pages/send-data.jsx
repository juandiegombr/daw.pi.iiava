import { useState, useEffect } from "react";
import Head from "next/head";
import ProtectedRoute from "../components/ProtectedRoute";

export default function SendDataPage() {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await fetch("/api/sensors", { credentials: "include" });
      if (!response.ok) throw new Error("Error loading sensors");
      const result = await response.json();
      setSensors(result.data.sensors);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSensor) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let parsedValue = value;
      switch (selectedSensor.type) {
        case "int":
          parsedValue = parseInt(value, 10);
          break;
        case "float":
          parsedValue = parseFloat(value);
          break;
        case "boolean":
          parsedValue = value === "true";
          break;
      }

      const response = await fetch(`/api/sensors/${selectedSensor._id}/datapoints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value: parsedValue }),
      });

      if (!response.ok) throw new Error("Error sending data");

      setSuccess(`Data sent successfully to ${selectedSensor.alias}`);
      setValue("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSensorChange = (e) => {
    const sensor = sensors.find((s) => s._id.toString() === e.target.value);
    setSelectedSensor(sensor || null);
    setValue("");
  };

  const renderValueInput = () => {
    if (!selectedSensor) return null;

    switch (selectedSensor.type) {
      case "boolean":
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar valor</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      case "string":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter text value"
          />
        );
      default:
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            step={selectedSensor.type === "float" ? "any" : "1"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${selectedSensor.type} value`}
          />
        );
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <Head>
        <title>Enviar Datos - Industrial Monitor</title>
      </Head>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Enviar Datos</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="sensor" className="block text-sm font-semibold text-gray-700 mb-2">
                Sensor
              </label>
              <select
                id="sensor"
                value={selectedSensor?._id || ""}
                onChange={handleSensorChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar sensor</option>
                {sensors.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.alias} ({s.type})
                  </option>
                ))}
              </select>
            </div>

            {selectedSensor && (
              <div>
                <label htmlFor="value" className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor ({selectedSensor.type})
                </label>
                {renderValueInput()}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedSensor}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar Dato"}
            </button>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}
