class SSEService {
  constructor() {
    this.clients = [];
  }

  addClient(res) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n");

    this.clients.push(res);

    res.on("close", () => {
      this.clients = this.clients.filter((client) => client !== res);
    });
  }

  sendEvent(type, data) {
    const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((client) => {
      client.write(payload);
    });
  }

  sendDatapointCreated(datapoint, sensor) {
    this.sendEvent("datapoint-created", { datapoint, sensor });
  }

  sendAlertTriggered(alert, datapoint, sensor) {
    this.sendEvent("alert-triggered", { alert, datapoint, sensor });
  }
}

const sseService = new SSEService();
export default sseService;
