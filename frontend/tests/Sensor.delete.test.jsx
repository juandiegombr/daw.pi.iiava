import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

global.fetch = vi.fn();

describe("Sensor Deletion", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "http://test.com/api");
  });

  afterEach(() => {
    fetch.mockClear();
  });

  it("WHEN user clicks delete button THEN sensor is removed from list", async () => {
    const mockSensors = [
      {
        _id: "1",
        alias: "Temperature Sensor",
        type: "float",
      },
      {
        _id: "2",
        alias: "Pressure Sensor",
        type: "int",
      },
    ];

    fetch
      .mockResolvedValueOnce({
        json: async () => ({ data: { sensors: mockSensors } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Sensores Activos (2 sensores)" });

    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    await screen.findByRole("heading", { name: "Sensores Activos (1 sensor)" });

    expect(screen.queryByText("Temperature Sensor")).not.toBeInTheDocument();
    expect(screen.getByText("Pressure Sensor")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("http://test.com/api/sensors/1", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("WHEN delete fails THEN sensor remains in list and shows error", async () => {
    const mockSensors = [
      {
        _id: "1",
        alias: "Temperature Sensor",
        type: "float",
      },
    ];

    fetch
      .mockResolvedValueOnce({
        json: async () => ({ data: { sensors: mockSensors } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Sensores Activos (1 sensor)" });

    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    expect(await screen.findByText("Error al eliminar el sensor")).toBeInTheDocument();
    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();
  });

  it("WHEN last sensor is deleted THEN shows empty state", async () => {
    const mockSensors = [
      {
        _id: "1",
        alias: "Temperature Sensor",
        type: "float",
      },
    ];

    fetch
      .mockResolvedValueOnce({
        json: async () => ({ data: { sensors: mockSensors } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Sensores Activos (1 sensor)" });

    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    await screen.findByText("No hay sensores disponibles en este momento");
  });

  it("WHEN deleting sensor THEN shows loading state", async () => {
    const mockSensors = [
      {
        _id: "1",
        alias: "Temperature Sensor",
        type: "float",
      },
    ];

    fetch
      .mockResolvedValueOnce({
        json: async () => ({ data: { sensors: mockSensors } }),
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              100
            )
          )
      );

    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Sensores Activos (1 sensor)" });

    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    expect(screen.getByRole("button", { name: "Eliminar Temperature Sensor" })).toBeDisabled();
  });
});
