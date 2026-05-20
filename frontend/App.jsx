import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NotificationListener from "./components/NotificationListener";
import SensorsPage from "./pages/index";
import LoginPage from "./pages/login";
import AlertsPage from "./pages/alerts";
import SendDataPage from "./pages/send-data";
import GeolocationPage from "./pages/geolocation";
import SensorDataPointsPage from "./pages/sensors/[id]/datapoints";
import StyleGuidePage from "./pages/styleguide";

export default function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col">
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<SensorsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/send-data" element={<SendDataPage />} />
        <Route path="/geolocation" element={<GeolocationPage />} />
        <Route path="/sensors/:id/datapoints" element={<SensorDataPointsPage />} />
        <Route path="/styleguide" element={<StyleGuidePage />} />
      </Routes>
      <Footer />
      <NotificationListener />
    </div>
  );
}
