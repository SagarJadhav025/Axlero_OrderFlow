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
- **Mock feed** — `genBook()` / `tick()` simulate order book updates locally so this runs standalone before the backend is ready.
- **Live FPS counters** — shown per panel, updated twice a second.

## Using it

1. Click **Start feed**.
2. Drag the **rate** slider up (1–200 updates/sec).
3. Watch the two FPS counters — Canvas should hold close to 60fps well past the point where the DOM panel starts dropping frames.

## Swapping in the real backend

The mock feed lives in two functions: `tick()` and `genBook()`. Once Member 3's WebSocket/SSE endpoint is live, replace the interval with:

    const ws = new WebSocket("wss://<backend-url>/market-data");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      book = { bids: data.bids, asks: data.asks };
    };

No renderer code needs to change — it only depends on `book.bids` / `book.asks` having `{ price, qty }` entries.

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
- [ ] Live feed integration (pending Member 3's backend)
