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

  it("WHEN user clicks delete button and confirms THEN sensor is removed from list", async () => {
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

    // Click delete button
    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    // Confirmation dialog should appear
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro de que deseas eliminar el sensor "Temperature Sensor"? Esta acción no se puede deshacer.')).toBeInTheDocument();

    // Confirm deletion
    await user.click(screen.getByRole("button", { name: "Eliminar" }));

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

    // Click delete button
    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    // Confirm deletion
    await user.click(screen.getByRole("button", { name: "Eliminar" }));

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

    // Click delete button
    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    // Confirm deletion
    await user.click(screen.getByRole("button", { name: "Eliminar" }));

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

    // Click delete button
    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    // Confirm deletion
    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(screen.getByRole("button", { name: "Eliminar Temperature Sensor" })).toBeDisabled();
  });

  it("WHEN user cancels deletion THEN sensor remains in list", async () => {
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

    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { sensors: mockSensors } }),
    });

    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Sensores Activos (2 sensores)" });

    // Click delete button
    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    // Confirmation dialog should appear
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro de que deseas eliminar el sensor "Temperature Sensor"? Esta acción no se puede deshacer.')).toBeInTheDocument();

    // Cancel deletion
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    // Dialog should be closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Both sensors should still be present
    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();
    expect(screen.getByText("Pressure Sensor")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sensores Activos (2 sensores)" })).toBeInTheDocument();

    // Delete API should not have been called
    expect(fetch).toHaveBeenCalledTimes(1); // Only the initial fetch for sensors list
  });

  it("WHEN user clicks outside confirmation dialog THEN dialog closes and sensor remains", async () => {
    const mockSensors = [
      {
        _id: "1",
        alias: "Temperature Sensor",
        type: "float",
      },
    ];

    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { sensors: mockSensors } }),
    });

    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Sensores Activos (1 sensor)" });

    // Click delete button
    await user.click(screen.getByRole("button", { name: "Eliminar Temperature Sensor" }));

    // Confirmation dialog should appear
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Click on the overlay (outside the dialog)
    await user.click(dialog.parentElement);

    // Dialog should be closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Sensor should still be present
    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    // Delete API should not have been called
    expect(fetch).toHaveBeenCalledTimes(1); // Only the initial fetch for sensors list
  });

  it("WHEN confirmation dialog is shown THEN displays correct sensor name", async () => {
    const mockSensors = [
      {
        _id: "1",
        alias: "My Custom Sensor Name",
        type: "float",
      },
    ];

    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { sensors: mockSensors } }),
    });

    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("My Custom Sensor Name");

    // Click delete button
    await user.click(screen.getByRole("button", { name: "Eliminar My Custom Sensor Name" }));

    // Confirmation dialog should show the exact sensor name
    expect(screen.getByText('¿Estás seguro de que deseas eliminar el sensor "My Custom Sensor Name"? Esta acción no se puede deshacer.')).toBeInTheDocument();
  });
});
