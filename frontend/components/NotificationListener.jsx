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

  const isAlert = toast.type === "alert";

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`px-4 py-3 rounded-lg shadow-lg border max-w-sm ${
          isAlert
            ? "bg-red-50 border-red-200 text-red-900"
            : "bg-sky-50 border-sky-200 text-sky-900"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`block h-2 w-2 rounded-full ${
              isAlert ? "bg-red-500 animate-pulse" : "bg-sky-500"
            }`}
          />
          <span
            className={`text-[10px] font-mono tracking-[0.22em] ${
              isAlert ? "text-red-700" : "text-sky-700"
            }`}
          >
            {isAlert ? "ALERT" : "INFO"}
          </span>
        </div>
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
}
