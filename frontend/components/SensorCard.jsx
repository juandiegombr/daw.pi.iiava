import { Link } from "react-router-dom";

export default function SensorCard({ sensor, onDelete, deleting, onEdit }) {
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'int':
        return 'bg-blue-100 text-blue-800';
      case 'float':
        return 'bg-emerald-100 text-emerald-800';
      case 'boolean':
        return 'bg-sky-100 text-sky-800';
      case 'string':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('es-ES');
  };

  return (
    <article
      className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200"
      aria-label={`Sensor ${sensor.alias}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">{sensor.alias}</h3>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(sensor)}
                className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                aria-label={`Editar ${sensor.alias}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(sensor._id)}
                disabled={deleting}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label={`Eliminar ${sensor.alias}`}
              >
                {deleting ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-slate-600">
            <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="text-sm">Tipo de dato: </span>
            <span className={`ml-2 inline-block px-2 py-0.5 text-xs font-mono font-medium rounded ${getTypeColor(sensor.type)}`}>
              {sensor.type}
            </span>
          </div>
          <div className="flex items-center text-slate-600">
            <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span className="text-sm"><span>Sensor ID:</span> <span className="ml-1 font-mono font-medium text-slate-800 tracking-[0.04em]">{sensor._id}</span></span>
          </div>

          {sensor.createdAt && (
            <div className="flex items-center text-slate-600">
              <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm"><span>Creado:</span> <span className="ml-1 font-mono text-slate-700 tracking-[0.02em]">{formatTimestamp(sensor.createdAt)}</span></span>
            </div>
          )}
        </div>

        <Link
          to={`/sensors/${sensor._id}/datapoints`}
          className="mt-5 block w-full px-4 py-2 bg-blue-600 text-white text-center text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Datos
        </Link>
      </div>
    </article>
  );
}
