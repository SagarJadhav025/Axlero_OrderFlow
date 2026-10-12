

const PORT = Number(process.env.PORT) || 8081;

import('ws').then(({ WebSocketServer }) => {
  const wss = new WebSocketServer({ port: PORT });

  wss.on('listening', () => {
    console.log('Mock market data server on ws://localhost:' + PORT);
    console.log('Leave this window open. Waiting for the browser...');
  });

 
  wss.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error('Port ' + PORT + ' is already in use.');
      console.error('Close the old mock server window, or run: taskkill /F /IM node.exe');
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });

  const OPEN = 1; // WebSocket "open" state

  wss.on('connection', (ws, req) => {
    console.log('Client connected from ' + (req.socket.remoteAddress || 'unknown'));
    let price = 100;

  
    const tradeTimer = setInterval(() => {
      if (ws.readyState !== OPEN) return;
      price += (Math.random() - 0.5) * 0.2;
      ws.send(JSON.stringify({
        type: 'trade',
        symbol: 'AAPL',
        price: +price.toFixed(2),
        quantity: Math.floor(Math.random() * 100) + 1,
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        timestamp: Date.now()
      }));
    }, 10);

   
    const bookTimer = setInterval(() => {
      if (ws.readyState !== OPEN) return;
      const mid = 100 + Math.random() * 2;
      // asks start one step above the mid, so best ask is always above best bid
      const bids = Array.from({ length: 10 }, (_, i) => ({
        price: +(mid - i * 0.05).toFixed(2),
        qty: Math.floor(Math.random() * 500) + 50
      }));
      const asks = Array.from({ length: 10 }, (_, i) => ({
        price: +(mid + (i + 1) * 0.05).toFixed(2),
        qty: Math.floor(Math.random() * 500) + 50
      }));
      ws.send(JSON.stringify({ type: 'orderbook', bids, asks }));
    }, 100);

    const stop = () => {
      clearInterval(tradeTimer);
      clearInterval(bookTimer);
    };
    ws.on('close', () => { stop(); console.log('Client disconnected'); });
    ws.on('error', (err) => { stop(); console.log('Client error: ' + err.message); });
  });
}).catch((err) => {
  console.error("Could not load the 'ws' package: " + err.message);
  console.error('Run this once in this folder:  npm install ws');
  process.exit(1);
});