import { useEffect } from "react";

export default function App() {

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL, { method: "GET", headers: { "Content-Type": "application/json" } })
      .then((response) => response.json())
      .then((data) => console.log("Data from backend: ", data))
      .catch((error) => console.error("Error fetching: ", error));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🌾 Collitap</h1>
    </div>
  );
}
