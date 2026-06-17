class WebSocketHandler {
  constructor(wss, pluginManager) {
    this.wss = wss;
    this.pluginManager = pluginManager;
    this.pluginIdMap = new WeakMap();

    this.wss.on('connection', (ws) => this.handleConnection(ws));
    this.pluginManager.startHeartbeat();
  }

  handleConnection(ws) {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (err) {
        console.error('Invalid message:', err.message);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid JSON message'
        }));
      }
    });

    ws.on('close', () => {
      const pluginId = this.pluginIdMap.get(ws);
      if (pluginId) {
        this.pluginManager.unregisterPlugin(pluginId);
      }
      console.log('WebSocket connection closed');
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });
  }

  handleMessage(ws, message) {
    switch (message.type) {
      case 'register': {
        const pluginId = this.pluginManager.registerPlugin(ws, {
          pluginId: message.pluginId,
          browserInfo: message.browserInfo
        });
        this.pluginIdMap.set(ws, pluginId);
        ws.send(JSON.stringify({
          type: 'registered',
          pluginId
        }));
        break;
      }

      case 'pong': {
        const pluginId = this.pluginIdMap.get(ws);
        if (pluginId) {
          this.pluginManager.updatePluginPing(pluginId);
        }
        break;
      }

      case 'result': {
        this.pluginManager.handleCommandResult(message);
        break;
      }

      default:
        console.warn('Unknown message type:', message.type);
    }
  }
}

module.exports = WebSocketHandler;
