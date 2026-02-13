import { useState } from "react";
import Head from "next/head";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import SensorList from "../components/SensorList";
import SensorForm from "../components/SensorForm";
import SensorEditForm from "../components/SensorEditForm";
import ConfirmDialog from "../components/ConfirmDialog";

export async function getServerSideProps() {
  try {
    const apiUrl = process.env.API_URL || "http://localhost:3000";
    const response = await fetch(`${apiUrl}/api/sensors`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Error al cargar los sensores");
    }

    const result = await response.json();
    return {
      props: {
        initialSensors: result.data.sensors,
        error: null,
      },
    };
  } catch (error) {
    return {
      props: {
        initialSensors: [],
        error: error.message,
      },
    };
  }
}

export default function SensorsPage({ initialSensors, error: initialError }) {
  const [sensors, setSensors] = useState(initialSensors);
  const [error, setError] = useState(initialError);
  const [deletingSensorId, setDeletingSensorId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [editingSensor, setEditingSensor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sensorToDelete, setSensorToDelete] = useState(null);

  const handleSensorAdded = (newSensor) => {
    setSensors((prev) => [...prev, newSensor]);
  };

  const handleDeleteSensor = (sensorId) => {
    const sensor = sensors.find((s) => s._id === sensorId);
    setSensorToDelete(sensor);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSensor = async () => {
    if (!sensorToDelete) return;

    setDeletingSensorId(sensorToDelete._id);
    setDeleteError(null);
    setShowDeleteConfirm(false);

    try {
      const apiUrl = process.env.API_URL || "http://localhost:3000";
      const response = await fetch(apiUrl + `/api/sensors/${sensorToDelete._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el sensor");
      }

      setSensors((prev) =>
        prev.filter((sensor) => sensor._id !== sensorToDelete._id)
      );
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingSensorId(null);
      setSensorToDelete(null);
    }
  };

  const cancelDeleteSensor = () => {
    setShowDeleteConfirm(false);
    setSensorToDelete(null);
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
      <Head>
        <title>Industrial Monitor</title>
      </Head>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {deleteError && (
          <div className="mb-4">
            <ErrorMessage message={deleteError} />
          </div>
        )}
        {error && <ErrorMessage message={error} />}
        {!error && sensors.length === 0 && <EmptyState />}
        {!error && sensors.length > 0 && (
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
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={confirmDeleteSensor}
        onCancel={cancelDeleteSensor}
        title="Eliminar Sensor"
        message={`¿Estás seguro de que deseas eliminar el sensor "${sensorToDelete?.alias}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
