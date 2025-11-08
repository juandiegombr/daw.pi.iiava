import SensorCard from "./SensorCard";

export default function SensorList({ sensors, onDeleteSensor, deletingSensorId }) {
  return (
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
          <SensorCard
            key={sensor._id}
            sensor={sensor}
            onDelete={onDeleteSensor}
            deleting={deletingSensorId === sensor._id}
          />
        ))}
      </div>
    </>
  );
}
