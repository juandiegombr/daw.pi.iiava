export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const apiUrl = process.env.API_URL || "http://localhost:3000";

  const response = await fetch(`${apiUrl}/api/sensors/events`, {
    headers: {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      Cookie: req.headers.get("cookie") || "",
    },
  });

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
