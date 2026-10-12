import WebSocket, { WebSocketServer } from 'ws';

// Start WebSocket server on port 3000
const wss = new WebSocketServer({ port: 3000});

wss.on('connection', (ws) => {
  console.log('Browser client connected');

  // Send a welcome message
  ws.send(JSON.stringify({ type: "trade", price: 150, side: "buy", volume: 10 }));

  // Periodically send fake orderbook updates
  setInterval(() => {
    const orderbook = {
      type: "orderbook",
      bid: (140 + Math.random() * 10).toFixed(2),
      ask: (150 + Math.random() * 10).toFixed(2),
      bids: [{ price: 145, volume: 50 }, { price: 144, volume: 30 }],
      asks: [{ price: 146, volume: 40 }, { price: 147, volume: 25 }]
    };
    ws.send(JSON.stringify(orderbook));
  }, 2000);
});
