# Axlero_OrderFlow

// for the Team member 5
# frontend-canvas — OrderFlow Order Book (Member 5)

High-frequency Level 2 order book and Depth-of-Market visualizer, rendered with HTML5 Canvas. Built to compare Canvas rendering performance against the standard DOM implementation (`frontend-dom/`) under high-frequency updates.

## Running it

No build step, no dependencies. Just open the file in a browser:

    open frontend-canvas/orderflow-proto.html

Or double-click it in your file explorer.

## What's inside

- **Canvas order book** — Level 2 bid/ask depth rendered on `<canvas>`, redrawn via `requestAnimationFrame`.
- **DOM order book (comparison panel)** — a deliberately naive `innerHTML` rewrite on every tick, used as the baseline we're benchmarking against.
- **Depth of Market chart** — cumulative buy/sell pressure as a shaded area chart, mid-price at center.
- **Live WebSocket Feed** — connected directly to the Spring Boot matching engine to stream executed trades and resting orders in real-time.
- **Live FPS counters** — shown per panel, updated twice a second.

## Using it

1. Start the Spring Boot backend engine locally (default port `8080`).
2. Open `orderflow-proto.html` in your browser and click **Start feed**.
3. Submit limit orders via the UI and watch the real-time order book populate.
4. Watch the two FPS counters — Canvas should hold close to 60fps well past the point where the DOM panel starts dropping frames.

## Live Backend Integration

The UI is now fully integrated with the live Spring Boot matching engine. The WebSocket connection streams real-time market data directly from the backend:

    const ws = new WebSocket("ws://localhost:8080/market-data"); // Replace with production URL when deployed
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      book = { bids: data.bids, asks: data.asks };
    };

No renderer code needs to change — it dynamically updates based on `book.bids` and `book.asks` arrays containing `{ price, size }` entries.

## Benchmark results

_To fill in: FPS for Canvas vs DOM at 10/s, 50/s, 100/s, 200/s._

| Rate | Canvas FPS | DOM FPS |
|------|-----------|---------|
| 10/s | | |
| 50/s | | |
| 100/s | | |
| 200/s | | |

## Status

- [x] Week 1 — WebSocket scaffolding (mock feed in place)
- [x] Week 2 — Streaming check, no perceived lag
- [x] Week 3 — Canvas vs DOM Order Book UI + benchmark
- [x] Week 4 — Depth of Market visualizer
- [x] Live feed integration (Connected to real Spring Boot backend)