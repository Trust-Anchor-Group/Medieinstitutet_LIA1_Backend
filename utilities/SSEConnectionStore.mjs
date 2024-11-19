class SSEConnectionStore {
  constructor() {
    this.connections = new Map();
  }

  setConnection(id, res) {
    this.connections.set(id, res);
  }

  removeConnection(id) {
    this.connections.delete(id);
  }

  hasConnection(id) {
    return this.connections.has(id);
  }

  notifyClient(id, event) {
    const connection = this.connections.get(id);
    if (connection) {
      try {
        
        connection.write(`data: ${JSON.stringify(event)}\n\n`);
      } catch (error) {
        console.error("Error sending SSE", error);
        this.removeConnection(id);
      }
    }
  }
}

export const sseConnectionStore = new SSEConnectionStore();