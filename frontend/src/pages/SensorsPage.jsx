import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import SensorList from "../components/SensorList";
import SensorForm from "../components/SensorForm";
import SensorEditForm from "../components/SensorEditForm";

export default function SensorsPage() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingSensorId, setDeletingSensorId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [editingSensor, setEditingSensor] = useState(null);

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

  const handleSensorAdded = (newSensor) => {
    setSensors((prev) => [...prev, newSensor]);
  };

  const handleDeleteSensor = async (sensorId) => {
    setDeletingSensorId(sensorId);
    setDeleteError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/sensors/${sensorId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el sensor");
      }

      setSensors((prev) => prev.filter((sensor) => sensor._id !== sensorId));
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingSensorId(null);
    }
  };

  const handleEditSensor = (sensor) => {
    setEditingSensor(sensor);
  };

  const handleSensorUpdated = (updatedSensor) => {
    setSensors((prev) =>
      prev.map((sensor) =>
        sensor._id === updatedSensor._id ? updatedSensor : sensor
      )
    );
  };

  const handleCloseEditForm = () => {
    setEditingSensor(null);
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {deleteError && (
          <div className="mb-4">
            <ErrorMessage message={deleteError} />
          </div>
        )}
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && sensors.length === 0 && <EmptyState />}
        {!loading && !error && sensors.length > 0 && (
          <SensorList
            sensors={sensors}
            onDeleteSensor={handleDeleteSensor}
            onEditSensor={handleEditSensor}
            deletingSensorId={deletingSensorId}
          />
        )}
      </main>
      <SensorForm onSensorAdded={handleSensorAdded} />
      {editingSensor && (
        <SensorEditForm
          sensor={editingSensor}
          onSensorUpdated={handleSensorUpdated}
          onClose={handleCloseEditForm}
        />
      )}
    </>
  );
}
