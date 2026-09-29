
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3030 });
const RATE = 1000; 

wss.on('connection', (ws) => {
  console.log('Client connected');
  let price = 100;
  const timer = setInterval(() => {
    const batch = Math.max(1, Math.floor(RATE / 100));
    for (let i = 0; i < batch; i++) {
      price += (Math.random() - 0.5) * 0.2;
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
  ws.on('close', () => clearInterval(timer));
});
console.log('Mock market data server on ws://localhost:3030');