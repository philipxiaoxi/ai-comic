const { v4: uuidv4 } = require('uuid');

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.pendingCommands = new Map();
    this.commandTimeout = parseInt(process.env.COMMAND_TIMEOUT) || 10000;
  }

  registerPlugin(ws, pluginInfo) {
    const pluginId = pluginInfo.pluginId || uuidv4();
    const plugin = {
      id: pluginId,
      ws,
      browserInfo: pluginInfo.browserInfo || {},
      connectedAt: Date.now(),
      lastPing: Date.now()
    };
    this.plugins.set(pluginId, plugin);
    console.log(`Plugin registered: ${pluginId}`);
    return pluginId;
  }

  unregisterPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      this.plugins.delete(pluginId);
      console.log(`Plugin unregistered: ${pluginId}`);

      for (const [cmdId, pending] of this.pendingCommands) {
        if (pending.pluginId === pluginId) {
          clearTimeout(pending.timeout);
          pending.reject(new Error('Plugin disconnected'));
          this.pendingCommands.delete(cmdId);
        }
      }
    }
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  getAvailablePlugin() {
    for (const [id, plugin] of this.plugins) {
      if (plugin.ws.readyState === 1) {
        return plugin;
      }
    }
    return null;
  }

  getPlugins() {
    const result = [];
    for (const [id, plugin] of this.plugins) {
      result.push({
        id,
        browserInfo: plugin.browserInfo,
        connectedAt: plugin.connectedAt,
        status: plugin.ws.readyState === 1 ? 'connected' : 'disconnected'
      });
    }
    return result;
  }

  getPluginCount() {
    return this.plugins.size;
  }

  sendCommand(pluginId, command) {
    return new Promise((resolve, reject) => {
      const plugin = this.plugins.get(pluginId);
      if (!plugin || plugin.ws.readyState !== 1) {
        return reject(new Error('Plugin not connected'));
      }

      const timeout = setTimeout(() => {
        this.pendingCommands.delete(command.id);
        const err = new Error('Command execution timed out');
        err.code = 'COMMAND_TIMEOUT';
        reject(err);
      }, this.commandTimeout);

      this.pendingCommands.set(command.id, {
        pluginId,
        resolve,
        reject,
        timeout
      });

      plugin.ws.send(JSON.stringify(command));
    });
  }

  handleCommandResult(result) {
    const pending = this.pendingCommands.get(result.id);
    if (!pending) {
      console.warn(`No pending command found for id: ${result.id}`);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingCommands.delete(result.id);

    if (result.status === 'ok') {
      pending.resolve(result.result);
    } else {
      const err = new Error(result.error?.message || 'Command failed');
      err.code = result.error?.code;
      pending.reject(err);
    }
  }

  updatePluginPing(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.lastPing = Date.now();
    }
  }

  startHeartbeat(interval = 30000) {
    setInterval(() => {
      const now = Date.now();
      for (const [id, plugin] of this.plugins) {
        if (now - plugin.lastPing > interval * 2) {
          console.log(`Plugin ${id} heartbeat timeout, removing`);
          this.unregisterPlugin(id);
        } else if (plugin.ws.readyState === 1) {
          plugin.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }
    }, interval);
  }
}

module.exports = PluginManager;
