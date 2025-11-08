export default function SensorCard({ sensor, onDelete, deleting }) {
  // Get type badge color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'int':
        return 'bg-blue-100 text-blue-800';
      case 'float':
        return 'bg-green-100 text-green-800';
      case 'boolean':
        return 'bg-purple-100 text-purple-800';
      case 'string':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('es-ES');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800">{sensor.alias}</h3>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(sensor.type)}`}>
            {sensor.type}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span className="text-sm">Sensor ID: <span className="font-mono font-semibold">{sensor._id}</span></span>
          </div>

          {sensor.createdAt && (
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Creado: {formatTimestamp(sensor.createdAt)}</span>
            </div>
          )}

          {sensor.updatedAt && (
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Actualizado: {formatTimestamp(sensor.updatedAt)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Tipo de Dato</p>
            <p className="text-lg font-semibold text-gray-800 capitalize">{sensor.type}</p>
          </div>
        </div>

        {onDelete && (
          <div className="mt-4">
            <button
              onClick={() => onDelete(sensor._id)}
              disabled={deleting}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
              aria-label={`Eliminar ${sensor.alias}`}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
