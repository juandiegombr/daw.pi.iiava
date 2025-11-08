import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

global.fetch = vi.fn();

describe("SensorDataPoints Navigation", () => {
  const mockSensors = [
    {
      _id: "sensor123",
      alias: "Temperature Sensor",
      type: "float",
      createdAt: "2024-01-01T10:00:00.000Z",
    },
    {
      _id: "sensor456",
      alias: "Pressure Sensor",
      type: "int",
      createdAt: "2024-01-01T11:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "http://test.com/api");
  });

  afterEach(() => {
    fetch.mockClear();
  });

  it("WHEN sensor card displayed THEN shows 'Ver Datos' button", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { sensors: mockSensors } }),
    });

    render(<App />);
    await screen.findByText("Temperature Sensor");

    const sensorCard = screen.getByRole("article", {
      name: "Sensor Temperature Sensor",
    });
    expect(within(sensorCard).getByText("Ver Datos")).toBeInTheDocument();
  });

  it("WHEN 'Ver Datos' button clicked THEN navigates to datapoints page", async () => {
    const user = userEvent.setup();

    // Mock sensors list response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { sensors: mockSensors } }),
    });

    render(<App />);
    await screen.findByText("Temperature Sensor");

    const sensorCard = screen.getByRole("article", {
      name: "Sensor Temperature Sensor",
    });
    const verDatosButton = within(sensorCard).getByText("Ver Datos");

    // Mock datapoints response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
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
      }),
    });

    await user.click(verDatosButton);

    // Should navigate to datapoints page
    expect(await screen.findByText("Datos del Sensor")).toBeInTheDocument();
    expect(screen.getByText("1 lecturas registradas")).toBeInTheDocument();
  });
});
