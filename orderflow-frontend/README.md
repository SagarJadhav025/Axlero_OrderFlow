 OrderFlow Frontend — Member 5 (Weeks 1–4)

This is the Weeks 1–4 deliverable for Member 5 (High-Performance UI): a WebSocket-driven, Canvas-rendered live market data view for the OrderFlow trading terminal, benchmarked against the standard React DOM approach.

 What's in here

- `public/marketDataSocket.js` — WebSocket client with auto-reconnect (Week 1).
- `public/canvasTape.js` — live scrolling trade tape (Week 2).
- `public/streamCheck.js` — frame-batched rendering + delay/FPS stats (Week 2).
- `public/orderBookCanvas.js` — Canvas order book, benchmarked vs. DOM (Week 3).
- `public/depthOfMarket.js` — Depth of Market visualizer with buy/sell pressure bar (Week 4).
- `mock-server.js` — standalone WebSocket server for local testing (not part of the final backend).

 How to run it

npm install
node mockserver.js

In a second terminal:

npx serve public

Then open the printed URL (usually http://localhost:3000).
