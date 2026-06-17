(function() {
  'use strict';

  let isConnected = false;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'ping':
        sendResponse({ pong: true });
        break;

      case 'getStatus':
        sendResponse({ connected: isConnected });
        break;
    }
    return true;
  });
})();
