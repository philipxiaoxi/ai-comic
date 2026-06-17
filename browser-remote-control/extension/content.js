(function() {
  'use strict';

  let isConnected = false;

  function checkConnection() {
    chrome.runtime.sendMessage({ type: 'getStatus' }, (response) => {
      if (chrome.runtime.lastError) {
        isConnected = false;
      } else if (response) {
        isConnected = response.connected || false;
      }
    });
  }

  checkConnection();

  setInterval(checkConnection, 5000);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'ping':
        sendResponse({ pong: true });
        break;

      case 'getStatus':
        sendResponse({ connected: isConnected });
        break;

      case 'connectionState':
        isConnected = message.connected || false;
        sendResponse({ received: true });
        break;
    }
    return true;
  });
})();
