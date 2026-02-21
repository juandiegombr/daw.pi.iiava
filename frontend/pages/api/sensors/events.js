import http from "http";

export const config = {
  api: {
    // Disable body parsing and response size limit for streaming
    bodyParser: false,
    responseLimit: false,
  },
};

export default function handler(req, res) {
  const apiUrl = process.env.API_URL || "http://localhost:3000";
  const url = new URL(`${apiUrl}/api/sensors/events`);
  /* eslint-disable */ console.log('apiUrl', apiUrl)

  // Forward cookies for authentication
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: "GET",
    headers: {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
    },
  };

  /* eslint-disable */ console.log('eeeee', )

  const backendReq = http.request(options, (backendRes) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    backendRes.on("data", (chunk) => {
      res.write(chunk);
      if (typeof res.flush === "function") {
        res.flush();
      }
    });

    backendRes.on("end", () => {
      res.end();
    });
  });

  backendReq.on("error", () => {
    if (!res.headersSent) {
      res.status(502).end();
    }
  });

  req.on("close", () => {
    backendReq.destroy();
  });

  backendReq.end();
}
