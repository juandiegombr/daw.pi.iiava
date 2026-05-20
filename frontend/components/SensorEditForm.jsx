import { useState } from "react";

export default function SensorEditForm({ sensor, onSensorUpdated, onClose }) {
  const [formData, setFormData] = useState({
    alias: sensor.alias,
    type: sensor.type,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sensors/${sensor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el sensor");
      }

      const result = await response.json();

      // Notify parent component
      if (onSensorUpdated) {
        onSensorUpdated(result.data.sensor);
      }

      // Close form
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-6" role="dialog" aria-labelledby="edit-dialog-title">
        <div className="flex justify-between items-center mb-6">
          <h2 id="edit-dialog-title" className="text-2xl font-semibold text-slate-900 tracking-tight">Editar Sensor</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-alias" className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
              Nombre del Sensor *
            </label>
            <input
              type="text"
              id="edit-alias"
              name="alias"
              value={formData.alias}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              placeholder="Ej: Sensor de Temperatura"
            />
          </div>

          <div>
            <label htmlFor="edit-type" className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
              Tipo de Dato *
            </label>
            <select
              id="edit-type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            >
              <option value="int">Integer (Entero)</option>
              <option value="float">Float (Decimal)</option>
              <option value="boolean">Boolean (Verdadero/Falso)</option>
              <option value="string">String (Texto)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
