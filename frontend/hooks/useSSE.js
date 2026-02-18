import { useEffect, useRef, useState } from "react";

export default function useSSE() {
  const [lastDatapoint, setLastDatapoint] = useState(null);
  const [lastAlert, setLastAlert] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eventSource = new EventSource("/api/sensors/events");
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("datapoint-created", (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastDatapoint(data);
      } catch {
        // ignore parse errors
      }
    });

    eventSource.addEventListener("alert-triggered", (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastAlert(data);
      } catch {
        // ignore parse errors
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return { lastDatapoint, lastAlert };
}
