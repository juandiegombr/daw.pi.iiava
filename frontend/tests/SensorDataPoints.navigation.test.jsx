import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
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

  afterEach(() => {
    fetch.mockClear();
  });

  it("WHEN sensor card displayed THEN shows 'Ver Datos' button", async () => {
    renderApp({
      initialSensors: mockSensors,
      error: null,
    });

    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    const sensorCard = screen.getByRole("article", {
      name: "Sensor Temperature Sensor",
    });
    expect(within(sensorCard).getByText("Ver Datos")).toBeInTheDocument();
  });

  it("WHEN 'Ver Datos' button exists THEN has correct href", async () => {
    renderApp({
      initialSensors: mockSensors,
      error: null,
    });

    expect(screen.getByText("Temperature Sensor")).toBeInTheDocument();

    const sensorCard = screen.getByRole("article", {
      name: "Sensor Temperature Sensor",
    });
    const verDatosLink = within(sensorCard).getByText("Ver Datos");

    // In Next.js, the Link component renders an anchor tag
    expect(verDatosLink).toHaveAttribute("href", "/sensors/sensor123/datapoints");
  });
});
