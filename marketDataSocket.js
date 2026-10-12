const WebSocket = require('ws');

function createMarketSocket(url, onMessage, onStatus) {
  let ws, retry = 0;
  function connect() {
    ws = new WebSocket(url);
    ws.on('open', () => { retry = 0; onStatus('connected'); });
    ws.on('message', (data) => onMessage(JSON.parse(data)));
    ws.on('error', (err) => { 
      console.error('WebSocket error:', err);
      onStatus('error'); 
    });
    ws.on('close', () => {
      onStatus('disconnected');
      const delay = Math.min(1000 * 2 ** retry++, 10000);
      setTimeout(connect, delay);
    });
  }
  connect();
}

// Usage
createMarketSocket('ws://localhost:3000', 
  (msg) => console.log('Message:', msg),
  (status) => console.log('Status:', status)
);
