import { useState, useEffect } from "react";
import Head from "next/head";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    sensorId: "",
    condition: ">",
    value: "",
    description: "",
    enabled: true,
  });

  useEffect(() => {
    fetchAlerts();
    fetchSensors();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts");
      if (!response.ok) throw new Error("Error loading alerts");
      const result = await response.json();
      setAlerts(result.data.alerts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensors = async () => {
    try {
      const response = await fetch("/api/sensors");
      if (!response.ok) throw new Error("Error loading sensors");
      const result = await response.json();
      setSensors(result.data.sensors);
    } catch {
      // Sensors load error handled silently
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingAlert ? `/api/alerts/${editingAlert._id}` : "/api/alerts";
      const method = editingAlert ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
        }),
      });

      if (!response.ok) throw new Error("Error saving alert");

      setShowForm(false);
      setEditingAlert(null);
      resetForm();
      fetchAlerts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/alerts/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error deleting alert");
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setFormData({
      sensorId: alert.sensorId,
      condition: alert.condition,
      value: alert.value.toString(),
      description: alert.description || "",
      enabled: alert.enabled,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      sensorId: sensors[0]?._id || "",
      condition: ">",
      value: "",
      description: "",
      enabled: true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <>
      <Head>
        <title>Alertas - Industrial Monitor</title>
      </Head>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Alertas</h1>
          <button
            onClick={() => {
              setEditingAlert(null);
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nueva Alerta
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No hay alertas configuradas</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <div key={alert._id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${alert.enabled ? "bg-green-500" : "bg-gray-300"}`}></span>
                    <span className="font-medium text-gray-800">
                      {alert.Sensor?.alias || `Sensor ${alert.sensorId}`}
                    </span>
                    <span className="text-sm text-gray-500">
                      {alert.condition} {alert.value}
                    </span>
                  </div>
                  {alert.description && (
                    <p className="text-sm text-gray-600 mt-1 ml-4">{alert.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(alert)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(alert._id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingAlert ? "Editar Alerta" : "Nueva Alerta"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="sensorId" className="block text-sm font-semibold text-gray-700 mb-1">
                    Sensor
                  </label>
                  <select
                    id="sensorId"
                    name="sensorId"
                    value={formData.sensorId}
                    onChange={handleChange}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="condition" className="block text-sm font-semibold text-gray-700 mb-1">
                      Condición
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value=">">&gt; Mayor que</option>
                      <option value="<">&lt; Menor que</option>
                      <option value=">=">&gt;= Mayor o igual</option>
                      <option value="<=">&lt;= Menor o igual</option>
                      <option value="==">== Igual a</option>
                      <option value="!=">!= Diferente de</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="value" className="block text-sm font-semibold text-gray-700 mb-1">
                      Valor
                    </label>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      required
                      step="any"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción de la alerta"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="enabled" className="text-sm text-gray-700">
                    Habilitada
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAlert(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingAlert ? "Guardar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
