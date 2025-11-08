import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import SensorsPage from "./pages/SensorsPage";
import SensorDataPointsPage from "./pages/SensorDataPointsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
        <Header />
        <Routes>
          <Route path="/" element={<SensorsPage />} />
          <Route path="/sensors/:id/datapoints" element={<SensorDataPointsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
