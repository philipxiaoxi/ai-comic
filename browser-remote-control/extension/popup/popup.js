document.addEventListener('DOMContentLoaded', () => {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const pluginInfo = document.getElementById('pluginInfo');
  const reconnectBtn = document.getElementById('reconnectBtn');

  function updateUI(state) {
    statusDot.className = 'status-dot ' + state;
    const labels = {
      connected: 'Connected',
      connecting: 'Connecting...',
      disconnected: 'Disconnected'
    };
    statusText.textContent = labels[state] || state;
    reconnectBtn.disabled = state === 'connected';
  }

  chrome.runtime.sendMessage({ type: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      updateUI('disconnected');
      return;
    }
    if (response) {
      updateUI(response.connected ? 'connected' : 'disconnected');
    }
  });

  reconnectBtn.addEventListener('click', () => {
    updateUI('connecting');
    chrome.runtime.sendMessage({ type: 'reconnect' }, (response) => {
      if (response?.connected) {
        updateUI('connected');
      }
    });
  });
});
