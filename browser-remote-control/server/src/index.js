const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const WebSocketHandler = require('./websocket/handler');
const PluginManager = require('./services/plugin-manager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

const pluginManager = new PluginManager();
const wsHandler = new WebSocketHandler(wss, pluginManager);

app.use('/api', apiRoutes(pluginManager));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    plugins: pluginManager.getPluginCount(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}`);
});

module.exports = { app, server };
