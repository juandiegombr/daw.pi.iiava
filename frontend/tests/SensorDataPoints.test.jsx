import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SensorDataPointsPage from "../src/pages/SensorDataPointsPage";

global.fetch = vi.fn();

describe("SensorDataPoints Page", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "http://test.com/api");
  });

  afterEach(() => {
    fetch.mockClear();
  });

  it("WHEN page loads THEN shows loading spinner", () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("status", { name: "Cargando sensores" })
    ).toBeInTheDocument();
  });

  it("WHEN datapoints are loaded THEN displays sensor info and datapoints table", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Temperature Sensor",
          type: "float",
        },
        datapoints: [
          {
            _id: "dp1",
            sensorId: "sensor123",
            value: 23.5,
            timestamp: "2024-01-15T10:00:00.000Z",
          },
          {
            _id: "dp2",
            sensorId: "sensor123",
            value: 24.1,
            timestamp: "2024-01-15T10:05:00.000Z",
          },
        ],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Temperature Sensor")).toBeInTheDocument();
    expect(screen.getByText("Tipo:")).toBeInTheDocument();
    expect(screen.getByText("float")).toBeInTheDocument();
    expect(screen.getByText("ID:")).toBeInTheDocument();
    expect(screen.getByText("sensor123")).toBeInTheDocument();
    expect(screen.getByText("2 lecturas registradas")).toBeInTheDocument();
    expect(screen.getByText("23.50")).toBeInTheDocument();
    expect(screen.getByText("24.10")).toBeInTheDocument();
  });

  it("WHEN sensor has no datapoints THEN displays empty state", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Temperature Sensor",
          type: "float",
        },
        datapoints: [],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Temperature Sensor")).toBeInTheDocument();
    expect(screen.getByText("0 lecturas registradas")).toBeInTheDocument();
    expect(screen.getByText("No hay datos")).toBeInTheDocument();
    expect(
      screen.getByText("Este sensor aún no tiene lecturas registradas.")
    ).toBeInTheDocument();
  });

  it("WHEN API call fails THEN displays error message with back link", async () => {
    fetch.mockRejectedValueOnce(new Error("Error al cargar los datos del sensor"));

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Error al cargar los datos del sensor")
    ).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: "Volver a Sensores" });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("WHEN page loads THEN fetches datapoints from correct API endpoint", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Temperature Sensor",
          type: "float",
        },
        datapoints: [],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Temperature Sensor");

    expect(fetch).toHaveBeenCalledWith(
      "http://test.com/api/sensors/sensor123/datapoints",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
  });

  it("WHEN float sensor datapoints THEN formats values with 2 decimals", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Temperature Sensor",
          type: "float",
        },
        datapoints: [
          {
            _id: "dp1",
            sensorId: "sensor123",
            value: 23.456789,
            timestamp: "2024-01-15T10:00:00.000Z",
          },
        ],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Temperature Sensor");
    expect(screen.getByText("23.46")).toBeInTheDocument();
  });

  it("WHEN boolean sensor datapoints THEN formats values as True/False", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Valve Status",
          type: "boolean",
        },
        datapoints: [
          {
            _id: "dp1",
            sensorId: "sensor123",
            value: true,
            timestamp: "2024-01-15T10:00:00.000Z",
          },
          {
            _id: "dp2",
            sensorId: "sensor123",
            value: false,
            timestamp: "2024-01-15T10:05:00.000Z",
          },
        ],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Valve Status");
    expect(screen.getByText("True")).toBeInTheDocument();
    expect(screen.getByText("False")).toBeInTheDocument();
  });

  it("WHEN int sensor datapoints THEN displays integer values", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Pressure Sensor",
          type: "int",
        },
        datapoints: [
          {
            _id: "dp1",
            sensorId: "sensor123",
            value: 150,
            timestamp: "2024-01-15T10:00:00.000Z",
          },
        ],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Pressure Sensor");
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("WHEN string sensor datapoints THEN displays string values", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Error Code",
          type: "string",
        },
        datapoints: [
          {
            _id: "dp1",
            sensorId: "sensor123",
            value: "E001",
            timestamp: "2024-01-15T10:00:00.000Z",
          },
          {
            _id: "dp2",
            sensorId: "sensor123",
            value: "OK",
            timestamp: "2024-01-15T10:05:00.000Z",
          },
        ],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Error Code");
    expect(screen.getByText("E001")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("WHEN datapoints displayed THEN shows formatted timestamps", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Temperature Sensor",
          type: "float",
        },
        datapoints: [
          {
            _id: "dp1",
            sensorId: "sensor123",
            value: 23.5,
            timestamp: "2024-01-15T14:30:45.000Z",
          },
        ],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Temperature Sensor");
    // Check that timestamp is formatted (exact format depends on locale)
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
  });

  it("WHEN multiple datapoints THEN displays all in table rows", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Temperature Sensor",
          type: "float",
        },
        datapoints: [
          {
            _id: "dp1",
            sensorId: "sensor123",
            value: 20.0,
            timestamp: "2024-01-15T10:00:00.000Z",
          },
          {
            _id: "dp2",
            sensorId: "sensor123",
            value: 21.5,
            timestamp: "2024-01-15T10:05:00.000Z",
          },
          {
            _id: "dp3",
            sensorId: "sensor123",
            value: 22.3,
            timestamp: "2024-01-15T10:10:00.000Z",
          },
        ],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Temperature Sensor");
    expect(screen.getByText("3 lecturas registradas")).toBeInTheDocument();
    expect(screen.getByText("20.00")).toBeInTheDocument();
    expect(screen.getByText("21.50")).toBeInTheDocument();
    expect(screen.getByText("22.30")).toBeInTheDocument();
  });

  it("WHEN table is displayed THEN has correct column headers", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Temperature Sensor",
          type: "float",
        },
        datapoints: [
          {
            _id: "dp1",
            sensorId: "sensor123",
            value: 23.5,
            timestamp: "2024-01-15T10:00:00.000Z",
          },
        ],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter initialEntries={["/sensors/sensor123/datapoints"]}>
        <Routes>
          <Route
            path="/sensors/:id/datapoints"
            element={<SensorDataPointsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Temperature Sensor");
    expect(screen.getByText("Fecha y Hora")).toBeInTheDocument();
    expect(screen.getByText("Valor")).toBeInTheDocument();
  });
});
