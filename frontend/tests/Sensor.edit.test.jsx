import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SensorsPage from "../pages/index";
import Header from "../components/Header";
import Footer from "../components/Footer";

global.fetch = vi.fn();

// Helper to render the full app layout
function renderApp(pageProps) {
  return render(
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col">
      <Header />
      <SensorsPage {...pageProps} />
      <Footer />
    </div>
  );
}

describe("Sensor Edit", () => {
  const mockSensors = [
    {
      _id: "1",
      alias: "Temperature Sensor",
      type: "float",
      createdAt: "2024-01-01T10:00:00.000Z",
    },
    {
      _id: "2",
      alias: "Pressure Sensor",
      type: "int",
      createdAt: "2024-01-01T11:00:00.000Z",
    },
  ];

  afterEach(() => {
    fetch.mockClear();
  });

  it("WHEN user clicks edit button THEN displays sensor edit form", async () => {
    const user = userEvent.setup();
    renderApp({
      initialSensors: mockSensors,
      error: null,
    });

    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    const editButton = screen.getByRole("button", {
      name: "Editar Temperature Sensor",
    });
    await user.click(editButton);

    expect(
      screen.getByRole("dialog", { name: "Editar Sensor" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Nombre del Sensor *" })
    ).toHaveValue("Temperature Sensor");
    expect(
      screen.getByRole("combobox", { name: "Tipo de Dato *" })
    ).toHaveValue("float");
  });

  it("WHEN user edits sensor alias THEN updates sensor in list", async () => {
    const user = userEvent.setup();
    renderApp({
      initialSensors: mockSensors,
      error: null,
    });

    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Editar Temperature Sensor" })
    );

    const aliasInput = screen.getByRole("textbox", {
      name: "Nombre del Sensor *",
    });
    await user.clear(aliasInput);
    await user.type(aliasInput, "Updated Temperature Sensor");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          sensor: {
            _id: "1",
            alias: "Updated Temperature Sensor",
            type: "float",
            createdAt: "2024-01-01T10:00:00.000Z",
          },
        },
      }),
    });

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Updated Temperature Sensor")).toBeInTheDocument();
    expect(screen.queryByText("Temperature Sensor")).not.toBeInTheDocument();
  });

  it("WHEN user edits sensor type THEN updates sensor in list", async () => {
    const user = userEvent.setup();
    renderApp({
      initialSensors: mockSensors,
      error: null,
    });

    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    const editButton = screen.getByRole("button", {
      name: "Editar Temperature Sensor",
    });
    await user.click(editButton);

    const typeSelect = screen.getByRole("combobox", { name: "Tipo de Dato *" });
    await user.selectOptions(typeSelect, "int");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          sensor: {
            _id: "1",
            alias: "Temperature Sensor",
            type: "int",
            createdAt: "2024-01-01T10:00:00.000Z",
          },
        },
      }),
    });

    const saveButton = screen.getByRole("button", { name: "Guardar" });
    await user.click(saveButton);

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const sensorCard = screen.getByRole("article", {
      name: "Sensor Temperature Sensor",
    });
    expect(within(sensorCard).getByText("int")).toBeInTheDocument();
  });

  it("WHEN user edits both alias and type THEN updates both fields", async () => {
    const user = userEvent.setup();
    renderApp({
      initialSensors: mockSensors,
      error: null,
    });

    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    const editButton = screen.getByRole("button", {
      name: "Editar Temperature Sensor",
    });
    await user.click(editButton);

    const aliasInput = screen.getByRole("textbox", {
      name: "Nombre del Sensor *",
    });
    await user.clear(aliasInput);
    await user.type(aliasInput, "Updated Sensor");

    const typeSelect = screen.getByRole("combobox", { name: "Tipo de Dato *" });
    await user.selectOptions(typeSelect, "boolean");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          sensor: {
            _id: "1",
            alias: "Updated Sensor",
            type: "boolean",
            createdAt: "2024-01-01T10:00:00.000Z",
          },
        },
      }),
    });

    const saveButton = screen.getByRole("button", { name: "Guardar" });
    await user.click(saveButton);

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const sensorCard = screen.getByRole("article", {
      name: "Sensor Updated Sensor",
    });
    expect(within(sensorCard).getByText("Updated Sensor")).toBeInTheDocument();
    expect(within(sensorCard).getByText("boolean")).toBeInTheDocument();
  });

  it("WHEN user clicks cancel THEN closes edit form without saving", async () => {
    const user = userEvent.setup();
    renderApp({
      initialSensors: mockSensors,
      error: null,
    });

    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    const editButton = screen.getByRole("button", {
      name: "Editar Temperature Sensor",
    });
    await user.click(editButton);

    expect(
      screen.getByRole("dialog", { name: "Editar Sensor" })
    ).toBeInTheDocument();

    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    await user.click(cancelButton);

    expect(
      screen.queryByRole("dialog", { name: "Editar Sensor" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();
  });

  it("WHEN edit request fails THEN displays error message", async () => {
    const user = userEvent.setup();
    renderApp({
      initialSensors: mockSensors,
      error: null,
    });

    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    const editButton = screen.getByRole("button", {
      name: "Editar Temperature Sensor",
    });
    await user.click(editButton);

    const aliasInput = screen.getByRole("textbox", {
      name: "Nombre del Sensor *",
    });
    await user.clear(aliasInput);
    await user.type(aliasInput, "Updated Sensor");

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        data: { errors: ["Error al actualizar el sensor"] },
      }),
    });

    const saveButton = screen.getByRole("button", { name: "Guardar" });
    await user.click(saveButton);

    expect(
      await screen.findByText("Error al actualizar el sensor")
    ).toBeInTheDocument();
  });

  it("WHEN editing sensor THEN calls PUT endpoint with correct data", async () => {
    const user = userEvent.setup();
    renderApp({
      initialSensors: mockSensors,
      error: null,
    });

    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    const editButton = screen.getByRole("button", {
      name: "Editar Temperature Sensor",
    });
    await user.click(editButton);

    const aliasInput = screen.getByRole("textbox", {
      name: "Nombre del Sensor *",
    });
    await user.clear(aliasInput);
    await user.type(aliasInput, "New Name");

    const typeSelect = screen.getByRole("combobox", { name: "Tipo de Dato *" });
    await user.selectOptions(typeSelect, "string");

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          sensor: {
            _id: "1",
            alias: "New Name",
            type: "string",
            createdAt: "2024-01-01T10:00:00.000Z",
          },
        },
      }),
    });

    const saveButton = screen.getByRole("button", { name: "Guardar" });
    await user.click(saveButton);

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );

    expect(fetch).toHaveBeenCalledWith(
      "/api/sensors/1",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: "New Name", type: "string" }),
      })
    );
  });
});
