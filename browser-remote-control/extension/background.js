const DEFAULT_SERVER_URL = 'ws://localhost:3000';
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;

let ws = null;
let pluginId = null;
let reconnectAttempts = 0;
let reconnectTimer = null;
let connectionState = 'disconnected';

function generatePluginId() {
  return 'plugin-' + Math.random().toString(36).substr(2, 9);
}

function connect() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return;
  }

  connectionState = 'connecting';
  updateBadge();

  try {
    ws = new WebSocket(DEFAULT_SERVER_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      connectionState = 'connected';
      reconnectAttempts = 0;
      updateBadge();

      if (!pluginId) {
        pluginId = generatePluginId();
      }

      ws.send(JSON.stringify({
        type: 'register',
        pluginId: pluginId,
        browserInfo: {
          name: 'Chrome',
          version: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown'
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      connectionState = 'disconnected';
      updateBadge();
      scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  } catch (err) {
    console.error('Failed to connect:', err);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    const delay = RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttempts - 1);
    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
    reconnectTimer = setTimeout(connect, delay);
  }
}

async function handleMessage(message) {
  switch (message.type) {
    case 'registered':
      pluginId = message.pluginId;
      console.log('Registered as:', pluginId);
      break;

    case 'ping':
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
      break;

    case 'navigate':
    case 'getContent':
    case 'getText':
    case 'click':
      await executeCommand(message);
      break;

    default:
      console.warn('Unknown message type:', message.type);
  }
}

async function executeCommand(command) {
  try {
    let result;

    switch (command.type) {
      case 'navigate':
        result = await executeNavigate(command.params);
        break;
      case 'getContent':
        result = await executeGetContent();
        break;
      case 'getText':
        result = await executeGetText();
        break;
      case 'click':
        result = await executeClick(command.params);
        break;
      default:
        throw new Error(`Unknown command: ${command.type}`);
    }

    sendResult(command.id, 'ok', result);
  } catch (err) {
    sendResult(command.id, 'error', null, {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message
    });
  }
}

function sendResult(commandId, status, result, error = null) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      id: commandId,
      type: 'result',
      status,
      result,
      error
    }));
  }
}

async function executeNavigate(params) {
  const { url, tabId } = params;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const err = new Error('Navigation timed out');
      err.code = 'NAVIGATION_TIMEOUT';
      reject(err);
    }, 30000);

    const callback = (tab) => {
      clearTimeout(timeout);
      resolve({
        title: tab.title,
        url: tab.url,
        status: tab.status
      });
    };

    if (tabId) {
      chrome.tabs.update(parseInt(tabId), { url }, callback);
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.update(tabs[0].id, { url }, callback);
        } else {
          clearTimeout(timeout);
          reject(new Error('No active tab found'));
        }
      });
    }
  });
}

async function executeGetContent() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        return reject(new Error('No active tab found'));
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => document.documentElement.outerHTML
        },
        (results) => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }
          resolve({
            html: results[0]?.result || '',
            url: tabs[0].url
          });
        }
      );
    });
  });
}

async function executeGetText() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        return reject(new Error('No active tab found'));
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            const clone = document.body.cloneNode(true);
            const scripts = clone.querySelectorAll('script, style, noscript');
            scripts.forEach(el => el.remove());
            return clone.innerText;
          }
        },
        (results) => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }
          resolve({
            text: results[0]?.result || '',
            url: tabs[0].url
          });
        }
      );
    });
  });
}

async function executeClick(params) {
  const { selector, tabId } = params;

  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] && !tabId) {
        return reject(new Error('No active tab found'));
      }

      const targetTabId = tabId ? parseInt(tabId) : tabs[0].id;

      chrome.scripting.executeScript(
        {
          target: { tabId: targetTabId },
          func: (sel) => {
            const el = document.querySelector(sel);
            if (!el) {
              return { error: 'ELEMENT_NOT_FOUND', message: `No element found: ${sel}` };
            }
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
              return { error: 'ELEMENT_NOT_VISIBLE', message: `Element not visible: ${sel}` };
            }
            el.click();
            return {
              clicked: true,
              elementTag: el.tagName.toLowerCase(),
              elementText: el.textContent?.trim().substring(0, 100)
            };
          },
          args: [selector]
        },
        (results) => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }
          const result = results[0]?.result;
          if (result?.error) {
            const err = new Error(result.message);
            err.code = result.error;
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  });
}

function updateBadge() {
  const colors = {
    connected: '#4CAF50',
    connecting: '#FFC107',
    disconnected: '#F44336'
  };

  const texts = {
    connected: 'ON',
    connecting: '..',
    disconnected: 'OFF'
  };

  chrome.action.setBadgeBackgroundColor({ color: colors[connectionState] });
  chrome.action.setBadgeText({ text: texts[connectionState] });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  connect();
});

chrome.runtime.onStartup.addListener(() => {
  connect();
});

connect();
