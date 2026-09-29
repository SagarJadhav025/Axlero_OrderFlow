


const obCanvas = document.getElementById('orderBookCanvas');
const obCtx = obCanvas.getContext('2d');

// keep track of the last snapshot so we only redraw when something new comes in
let lastSnapshot = null;

// simple settings so I can tweak the look without touching the draw logic
const ROW_HEIGHT = 22;
const MAX_ROWS = 10;
const BID_COLOR = '#16a34a';
const ASK_COLOR = '#dc2626';
const BAR_MAX_WIDTH = 150; // pixels, volume bars won't go past this

// this gets called whenever the backend sends a new order book snapshot
// snapshot looks like: { bids: [{price, qty}, ...], asks: [{price, qty}, ...] }
function updateOrderBook(snapshot) {
  lastSnapshot = snapshot;
}


function drawOrderBook() {
  if (!lastSnapshot) {
    requestAnimationFrame(drawOrderBook);
    return;
  }

  obCtx.clearRect(0, 0, obCanvas.width, obCanvas.height);

  const bids = lastSnapshot.bids.slice(0, MAX_ROWS);
  const asks = lastSnapshot.asks.slice(0, MAX_ROWS);

  // find the biggest qty so we can scale the bars, otherwise one huge
  // order makes every other bar invisible
  const allQty = [...bids, ...asks].map(l => l.qty);
  const maxQty = Math.max(...allQty, 1);

  obCtx.font = '13px monospace';

  // draw bid side (left half of canvas)
  
  bids.forEach((level, i) => {
    const y = i * ROW_HEIGHT + 20;
    const barWidth = (level.qty / maxQty) * BAR_MAX_WIDTH;

    obCtx.fillStyle = BID_COLOR;
    // bar grows from the middle line outward to the left
    obCtx.fillRect(200 - barWidth, y - 12, barWidth, 16);

    obCtx.fillStyle = '#111';
    obCtx.fillText(level.price.toFixed(2), 10, y);
    obCtx.fillText(String(level.qty), 100, y);
  });

  // draw ask side (right half of canvas)
  asks.forEach((level, i) => {
    const y = i * ROW_HEIGHT + 20;
    const barWidth = (level.qty / maxQty) * BAR_MAX_WIDTH;

    obCtx.fillStyle = ASK_COLOR;
    obCtx.fillRect(220, y - 12, barWidth, 16);

    obCtx.fillStyle = '#111';
    obCtx.fillText(level.price.toFixed(2), 380, y);
    obCtx.fillText(String(level.qty), 470, y);
  });

  // best bid / best ask highlight - just a thin line under row 0
  obCtx.strokeStyle = '#999';
  obCtx.beginPath();
  obCtx.moveTo(0, 8);
  obCtx.lineTo(obCanvas.width, 8);
  obCtx.stroke();

  requestAnimationFrame(drawOrderBook);
}

requestAnimationFrame(drawOrderBook);

