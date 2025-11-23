import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import App from "../src/App";

global.fetch = vi.fn();

describe("Sensor List", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "http://test.com/api");
  });

  afterEach(() => {
    fetch.mockClear();
  });

  it("WHEN sensors are loaded THEN renders app header with title and description", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        data: {
          sensors: [
            {
              _id: "1",
              alias: "Temperature Sensor",
              type: "float",
              createdAt: "2024-01-01T10:00:00.000Z",
              updatedAt: "2024-01-02T15:30:00.000Z",
            },
          ],
        },
      }),
    });

    render(<App />);
    await screen.findByText("Sensores Activos");

    expect(screen.getByRole("heading", { name: "⚙️ Industrial Monitor" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Monitor de señales de sensores de máquinas industriales en tiempo real"
      )
    ).toBeInTheDocument();
  });

  it("WHEN no sensors exist THEN renders header and empty state message", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { sensors: [] } }),
    });

    render(<App />);
    await screen.findByText("No hay sensores disponibles en este momento");

    expect(screen.getByRole("heading", { name: "⚙️ Industrial Monitor" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Monitor de señales de sensores de máquinas industriales en tiempo real"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Esperando configuración de sensores...")
    ).toBeInTheDocument();
  });

  it("WHEN fetching sensors THEN shows loading spinner", () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(<App />);

    expect(
      screen.getByRole("status", { name: "Cargando sensores" })
    ).toBeInTheDocument();
  });

  it("WHEN API call succeeds THEN displays sensors", async () => {
    const mockSensors = [
      {
        _id: "1",
        alias: "Temperature Sensor",
        type: "float",
        createdAt: "2024-01-01T10:00:00.000Z",
        updatedAt: "2024-01-02T15:30:00.000Z",
      },
      {
        _id: "2",
        alias: "Pressure Sensor",
        type: "int",
        createdAt: "2024-01-01T11:00:00.000Z",
        updatedAt: "2024-01-02T16:30:00.000Z",
      },
    ];

    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { sensors: mockSensors } }),
    });

    render(<App />);
    await screen.findByText("Sensores Activos");

    expect(screen.getByText("(2 sensores)")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Sensor Temperature Sensor" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Sensor Pressure Sensor" })).toBeInTheDocument();
  });

  it("WHEN no sensors exist THEN displays empty state", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { sensors: [] } }),
    });

    render(<App />);
    await screen.findByText("No hay sensores disponibles en este momento");

    expect(
      screen.getByText("Esperando configuración de sensores...")
    ).toBeInTheDocument();
  });

  it("WHEN API call fails THEN displays error message", async () => {
    const errorMessage = "Network error";
    fetch.mockRejectedValueOnce(new Error(errorMessage));

    render(<App />);
    await screen.findByText("Error al cargar los sensores");

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("WHEN app loads THEN fetches sensors from correct API endpoint", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { sensors: [] } }),
    });

    render(<App />);
    await screen.findByText("No hay sensores disponibles en este momento");

    expect(fetch).toHaveBeenCalledWith("http://test.com/api/sensors", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("WHEN sensor is displayed THEN shows all sensor card details", async () => {
    const mockSensor = {
      _id: "sensor123",
      alias: "Temperature Sensor",
      type: "float",
      createdAt: "2024-01-15T14:30:00.000Z",
    };

    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { sensors: [mockSensor] } }),
    });

    render(<App />);
    await screen.findByText("Temperature Sensor");

    const sensorCard = screen.getByRole("article", { name: "Sensor Temperature Sensor" });

    // Check sensor alias
    expect(within(sensorCard).getByText("Temperature Sensor")).toBeInTheDocument();

    // Check type label and value
    expect(within(sensorCard).getByText("Tipo de dato:")).toBeInTheDocument();
    expect(within(sensorCard).getByText("float")).toBeInTheDocument();

    // Check sensor ID
    expect(within(sensorCard).getByText("Sensor ID:")).toBeInTheDocument();
    expect(within(sensorCard).getByText("sensor123")).toBeInTheDocument();

    // Check created timestamp
    expect(within(sensorCard).getByText("Creado:")).toBeInTheDocument();
    expect(within(sensorCard).getByText("15/1/2024, 15:30:00")).toBeInTheDocument();
  });

  it("WHEN multiple sensors with different types THEN displays correct type badges", async () => {
    const mockSensors = [
      { _id: "1", alias: "Int Sensor", type: "int", createdAt: "2024-01-01T10:00:00.000Z" },
      { _id: "2", alias: "Float Sensor", type: "float", createdAt: "2024-01-01T10:00:00.000Z" },
      { _id: "3", alias: "Boolean Sensor", type: "boolean", createdAt: "2024-01-01T10:00:00.000Z" },
      { _id: "4", alias: "String Sensor", type: "string", createdAt: "2024-01-01T10:00:00.000Z" },
    ];

    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { sensors: mockSensors } }),
    });

    render(<App />);
    await screen.findByText("Sensores Activos");

    // Int Sensor card
    const intSensorCard = screen.getByRole("article", { name: "Sensor Int Sensor" });
    expect(within(intSensorCard).getByText("Int Sensor")).toBeInTheDocument();
    expect(within(intSensorCard).getByText("int")).toBeInTheDocument();

    // Float Sensor card
    const floatSensorCard = screen.getByRole("article", { name: "Sensor Float Sensor" });
    expect(within(floatSensorCard).getByText("Float Sensor")).toBeInTheDocument();
    expect(within(floatSensorCard).getByText("float")).toBeInTheDocument();

    // Boolean Sensor card
    const booleanSensorCard = screen.getByRole("article", { name: "Sensor Boolean Sensor" });
    expect(within(booleanSensorCard).getByText("Boolean Sensor")).toBeInTheDocument();
    expect(within(booleanSensorCard).getByText("boolean")).toBeInTheDocument();

    // String Sensor card
    const stringSensorCard = screen.getByRole("article", { name: "Sensor String Sensor" });
    expect(within(stringSensorCard).getByText("String Sensor")).toBeInTheDocument();
    expect(within(stringSensorCard).getByText("string")).toBeInTheDocument();
  });
});
