import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function SensorDataChart({ datapoints, sensor }) {
  // Format timestamp for chart display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("es-ES", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format value for tooltip
  const formatValue = (value, type) => {
    switch (type) {
      case "float":
        return typeof value === "number" ? value.toFixed(2) : value;
      case "boolean":
        return value ? "True" : "False";
      case "int":
        return value;
      case "string":
        return value;
      default:
        return value;
    }
  };

  // Prepare data for chart (reverse to show oldest to newest)
  const chartData = [...datapoints].reverse().map((dp) => ({
    timestamp: dp.timestamp,
    value: dp.value,
    fullTimestamp: new Date(dp.timestamp).toLocaleString("es-ES"),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{payload[0].payload.fullTimestamp}</p>
          <p className="text-sm font-semibold text-gray-900">
            Valor: {formatValue(payload[0].value, sensor.type)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Choose chart type based on sensor type
  const renderChart = () => {
    switch (sensor.type) {
      case "boolean":
        // Bar chart for boolean values
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              domain={[0, 1]}
              ticks={[0, 1]}
              tickFormatter={(value) => (value ? "True" : "False")}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" name="Estado" />
          </BarChart>
        );

      case "float":
        // Area chart for float values
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              fill="url(#colorValue)"
              name="Valor"
              strokeWidth={2}
            />
          </AreaChart>
        );

      case "int":
      default:
        // Line chart for integer values
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 3 }}
              activeDot={{ r: 5 }}
              name="Valor"
            />
          </LineChart>
        );
    }
  };

  // Handle string type separately (no chart needed)
  if (sensor.type === "string") {
    return (
      <div className="w-full h-96">
        <div className="flex items-center justify-center h-full">
          <div className="text-center px-6 py-8">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-base font-medium text-gray-900">
              Visualización no disponible
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Los datos de tipo texto no se pueden visualizar en gráficos.
              Los valores se almacenan como cadenas de texto.
            </p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm font-medium">
                {datapoints.length} lecturas registradas
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
