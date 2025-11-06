export default function FieldCard({ field }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {field.imageUrl && (
        <img
          src={field.imageUrl}
          alt={`Campo de ${field.farmerName}`}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">{field.farmerName}</h3>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
            Disponible
          </span>
        </div>

        <div className="mb-3">
          <p className="text-gray-600 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {field.location}
          </p>
        </div>

        {field.description && (
          <p className="text-gray-700 mb-4">{field.description}</p>
        )}

        {field.products && field.products.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Productos disponibles:</h4>
            <div className="flex flex-wrap gap-2">
              {field.products.map((product, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-2 text-sm text-gray-600">
            {field.contactEmail && (
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {field.contactEmail}
              </p>
            )}
            {field.contactPhone && (
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {field.contactPhone}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
