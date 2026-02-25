import { useEffect, useState } from "react";
import useSSE from "../hooks/useSSE";

export default function NotificationListener() {
  const { lastDatapoint, lastAlert } = useSSE();
  const [toast, setToast] = useState(null);

  // Request notification permission
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Handle datapoint notifications (declared first so alert toast takes priority)
  useEffect(() => {
    if (!lastDatapoint) return;

    const { sensor } = lastDatapoint;
    const message = `New data received for ${sensor?.alias || "sensor"}`;

    setToast({ message, type: "info" });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [lastDatapoint]);

  // Handle alert notifications (declared last so it overwrites info toast)
  useEffect(() => {
    if (!lastAlert) return;

    const { alert, sensor } = lastAlert;
    const message = `Alert: ${sensor?.alias || "Sensor"} - ${alert?.description || `Value ${alert?.condition} ${alert?.value}`}`;

    // Browser notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Industrial Monitor Alert", { body: message });
    }

    // In-app toast
    setToast({ message, type: "alert" });
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [lastAlert]);

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`px-4 py-3 rounded-lg shadow-lg text-white max-w-sm ${
          toast.type === "alert" ? "bg-orange-500" : "bg-blue-500"
        }`}
      >
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
}
