const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

module.exports = function(pluginManager) {
  router.post('/navigate', async (req, res) => {
    const { url, tabId } = req.body;

    if (!url) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'INVALID_URL', message: 'URL is required' }
      });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        status: 'error',
        error: { code: 'INVALID_URL', message: 'Invalid URL format' }
      });
    }

    const plugin = pluginManager.getAvailablePlugin();
    if (!plugin) {
      return res.status(503).json({
        status: 'error',
        error: { code: 'PLUGIN_DISCONNECTED', message: 'No browser plugin connected' }
      });
    }

    const commandId = uuidv4();
    try {
      const result = await pluginManager.sendCommand(plugin.id, {
        id: commandId,
        type: 'navigate',
        params: { url, tabId }
      });
      res.json({ status: 'ok', data: result });
    } catch (err) {
      res.status(504).json({
        status: 'error',
        error: { code: err.code || 'COMMAND_TIMEOUT', message: err.message }
      });
    }
  });

  router.get('/content', async (req, res) => {
    const plugin = pluginManager.getAvailablePlugin();
    if (!plugin) {
      return res.status(503).json({
        status: 'error',
        error: { code: 'PLUGIN_DISCONNECTED', message: 'No browser plugin connected' }
      });
    }

    const commandId = uuidv4();
    try {
      const result = await pluginManager.sendCommand(plugin.id, {
        id: commandId,
        type: 'getContent',
        params: {}
      });
      res.json({ status: 'ok', data: result });
    } catch (err) {
      res.status(504).json({
        status: 'error',
        error: { code: err.code || 'COMMAND_TIMEOUT', message: err.message }
      });
    }
  });

  router.get('/text', async (req, res) => {
    const plugin = pluginManager.getAvailablePlugin();
    if (!plugin) {
      return res.status(503).json({
        status: 'error',
        error: { code: 'PLUGIN_DISCONNECTED', message: 'No browser plugin connected' }
      });
    }

    const commandId = uuidv4();
    try {
      const result = await pluginManager.sendCommand(plugin.id, {
        id: commandId,
        type: 'getText',
        params: {}
      });
      res.json({ status: 'ok', data: result });
    } catch (err) {
      res.status(504).json({
        status: 'error',
        error: { code: err.code || 'COMMAND_TIMEOUT', message: err.message }
      });
    }
  });

  router.post('/click', async (req, res) => {
    const { selector, tabId } = req.body;

    if (!selector) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'INVALID_SELECTOR', message: 'Selector is required' }
      });
    }

    const plugin = pluginManager.getAvailablePlugin();
    if (!plugin) {
      return res.status(503).json({
        status: 'error',
        error: { code: 'PLUGIN_DISCONNECTED', message: 'No browser plugin connected' }
      });
    }

    const commandId = uuidv4();
    try {
      const result = await pluginManager.sendCommand(plugin.id, {
        id: commandId,
        type: 'click',
        params: { selector, tabId }
      });
      res.json({ status: 'ok', data: result });
    } catch (err) {
      res.status(err.code === 'ELEMENT_NOT_FOUND' ? 404 : 504).json({
        status: 'error',
        error: { code: err.code || 'COMMAND_TIMEOUT', message: err.message }
      });
    }
  });

  router.get('/plugins', (req, res) => {
    const plugins = pluginManager.getPlugins();
    res.json({ status: 'ok', data: plugins });
  });

  return router;
};
