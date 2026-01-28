export default function EmptyState() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-8 rounded-lg text-center">
      <p className="text-lg font-semibold mb-2">
        No hay sensores disponibles en este momento
      </p>
      <p className="text-sm">Esperando configuración de sensores...</p>
    </div>
  );
}
