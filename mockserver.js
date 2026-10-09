const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  let price = 100;

  // send a new trade every 10 ms
  const tradeTimer = setInterval(() => {
    price += (Math.random() - 0.5) * 0.2;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'trade',
        symbol: 'AAPL',
        price: +price.toFixed(2),
        quantity: Math.floor(Math.random() * 100) + 1,
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        timestamp: Date.now()
      }));
    }
  }, 10);

  // send an order book snapshot every 100 ms
  const bookTimer = setInterval(() => {
    const mid = 100 + Math.random() * 2;
    const bids = Array.from({ length: 10 }, (_, i) => ({
      price: +(mid - i * 0.05).toFixed(2),
      qty: Math.floor(Math.random() * 500) + 50
    }));
    const asks = Array.from({ length: 10 }, (_, i) => ({
      price: +(mid + i * 0.05).toFixed(2),
      qty: Math.floor(Math.random() * 500) + 50
    }));
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'orderbook', bids, asks }));
    }
  }, 100);

  // stop the timers when the browser disconnects
  ws.on('close', () => {
    clearInterval(tradeTimer);
    clearInterval(bookTimer);
    console.log('Client disconnected');
  });
});

console.log('Mock market data server on ws://localhost:8081');