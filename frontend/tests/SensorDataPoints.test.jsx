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

  it("WHEN datapoints are loaded THEN displays sensor info and chart", async () => {
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
    expect(screen.getByText("Datos del Sensor")).toBeInTheDocument();
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
    fetch.mockRejectedValueOnce(
      new Error("Error al cargar los datos del sensor")
    );

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

  it("WHEN datapoints with different sensor types THEN displays chart", async () => {
    const mockData = {
      data: {
        sensor: {
          _id: "sensor123",
          alias: "Temperature",
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

    expect(await screen.findByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("1 lecturas registradas")).toBeInTheDocument();
  });

  it("WHEN multiple datapoints THEN displays count correctly", async () => {
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
    expect(screen.getByText("Datos del Sensor")).toBeInTheDocument();
  });
});
