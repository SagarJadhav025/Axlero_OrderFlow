# OrderFlow Frontend — Member 4 (Week 1)

This is the Week 1 deliverable for Member 4 (Standard UI): a React (Vite)
scaffold for the OrderFlow trading terminal, with a working Order Entry
form.

## What's in here
- `src/App.jsx` — terminal layout: Order Entry panel + placeholders for
  Recent Trades (Week 2) and Order Book (Week 3).
- `src/components/OrderEntryForm.jsx` — Buy/Sell toggle, Limit/Market
  toggle, Price, Quantity, with basic client-side validation.
- `src/index.css` — dark financial-terminal styling.

## How to run it
```
npm install
npm run dev
```
Then open the printed URL (usually http://localhost:5173).

## Next steps (per the plan)
- Week 2: wire `OrderEntryForm`'s `onSubmitOrder` callback into the
  backend WebSocket/API, and build a live "Recent Trades" list.
- Week 3: build the Order Book UI using standard React DOM rendering
  (Member 5 does the Canvas version for comparison).
- Week 4: polish into a professional financial terminal.
