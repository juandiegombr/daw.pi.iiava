import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

describe("Sensor Creation", () => {
  afterEach(() => {
    fetch.mockClear();
  });

  it("WHEN user clicks add button THEN displays sensor creation form", async () => {
    const user = userEvent.setup();
    renderApp({
      initialSensors: [],
      error: null,
    });

    expect(screen.getByText("No hay sensores disponibles en este momento")).toBeInTheDocument();

    const addButton = screen.getByRole("button", { name: "Nuevo Sensor" });
    await user.click(addButton);

    expect(
      screen.getByRole("dialog", { name: "Nuevo Sensor" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Nombre del Sensor *" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Tipo de Dato *" })
    ).toBeInTheDocument();
  });

  it("WHEN user fills form and submits THEN creates new sensor", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          sensor: {
            _id: "123",
            alias: "Temperature Sensor",
            type: "float",
          },
        },
      }),
    });

    const user = userEvent.setup();
    renderApp({
      initialSensors: [],
      error: null,
    });

    expect(screen.getByText("No hay sensores disponibles en este momento")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nuevo Sensor" }));

    const aliasInput = screen.getByRole("textbox", {
      name: "Nombre del Sensor *",
    });
    const typeSelect = screen.getByRole("combobox", { name: "Tipo de Dato *" });

    await user.type(aliasInput, "Temperature Sensor");
    await user.selectOptions(typeSelect, "float");
    await user.click(screen.getByRole("button", { name: "Crear Sensor" }));

    expect(await screen.findByText("Temperature Sensor")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/sensors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias: "Temperature Sensor", type: "float" }),
    });
  });

  it("WHEN user clicks cancel THEN closes sensor creation form", async () => {
    const user = userEvent.setup();
    renderApp({
      initialSensors: [],
      error: null,
    });

    expect(screen.getByText("No hay sensores disponibles en este momento")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nuevo Sensor" }));

    expect(
      screen.getByRole("dialog", { name: "Nuevo Sensor" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Nuevo Sensor" })
      ).not.toBeInTheDocument();
    });
  });

  it("WHEN sensor creation fails THEN displays error message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const user = userEvent.setup();
    renderApp({
      initialSensors: [],
      error: null,
    });

    expect(screen.getByText("No hay sensores disponibles en este momento")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nuevo Sensor" }));

    const aliasInput = screen.getByRole("textbox", {
      name: "Nombre del Sensor *",
    });

    await user.type(aliasInput, "Test Sensor");
    await user.click(screen.getByRole("button", { name: "Crear Sensor" }));

    expect(
      await screen.findByText("Error al crear el sensor")
    ).toBeInTheDocument();
  });

  it("WHEN creating sensor THEN shows loading state", async () => {
    fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  data: {
                    sensor: { _id: "123", alias: "Test", type: "int" },
                  },
                }),
              }),
            100
          )
        )
    );

    const user = userEvent.setup();
    renderApp({
      initialSensors: [],
      error: null,
    });

    expect(screen.getByText("No hay sensores disponibles en este momento")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nuevo Sensor" }));

    const aliasInput = screen.getByRole("textbox", {
      name: "Nombre del Sensor *",
    });

    await user.type(aliasInput, "Test Sensor");
    await user.click(screen.getByRole("button", { name: "Crear Sensor" }));

    expect(screen.getByText("Creando...")).toBeInTheDocument();
  });

  it("WHEN sensor is created THEN form is reset and closed", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          sensor: {
            _id: "123",
            alias: "New Sensor",
            type: "int",
          },
        },
      }),
    });

    const user = userEvent.setup();
    renderApp({
      initialSensors: [],
      error: null,
    });

    expect(screen.getByText("No hay sensores disponibles en este momento")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nuevo Sensor" }));

    const aliasInput = screen.getByRole("textbox", {
      name: "Nombre del Sensor *",
    });
    await user.type(aliasInput, "New Sensor");

    await user.click(screen.getByRole("button", { name: "Crear Sensor" }));

    expect(await screen.findByText("New Sensor")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Nuevo Sensor" })).not.toBeInTheDocument();
  });
});
