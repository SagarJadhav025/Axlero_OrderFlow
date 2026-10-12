// depthOfMarket.js
// Member 5 - Week 4
// Depth of Market: cumulative volume for each side as a mirrored area chart,
// plus a buy/sell pressure bar. Values ease toward new data so the chart
// doesn't flicker every 100 ms.

const domCanvas = document.getElementById('domCanvas');
const domCtx = domCanvas.getContext('2d');

let domSnapshot = null;

// displayed totals ease toward the real totals instead of jumping
let smoothBidTotal = 0;
let smoothAskTotal = 0;
const SMOOTHING = 0.2; // lower = smoother but slower to react

// called by index.html whenever an 'orderbook' message arrives
function updateDOM(snapshot) {
  domSnapshot = snapshot;
}

// running total: level 5 shows all the volume from level 1 through level 5
function toCumulative(levels) {
  let running = 0;
  return levels.map(lv => {
    running += lv.qty;
    return { price: lv.price, total: running };
  });
}

function lastTotal(levels) {
  return levels.length ? levels[levels.length - 1].total : 0;
}

function drawArea(levels, dir, maxTotal, midX, top, bottom, fill, line) {
  if (!levels.length) return;
  const chartH = bottom - top;
  domCtx.beginPath();
  domCtx.moveTo(midX, bottom);
  levels.forEach((lv, i) => {
    const x = midX + dir * (lv.total / maxTotal) * midX;
    const y = bottom - ((i + 1) / levels.length) * chartH;
    domCtx.lineTo(x, y);
  });
  domCtx.lineTo(midX, top);
  domCtx.closePath();
  domCtx.fillStyle = fill;
  domCtx.fill();
  domCtx.strokeStyle = line;
  domCtx.lineWidth = 1.5;
  domCtx.stroke();
}

function drawDOM() {
  requestAnimationFrame(drawDOM);
  if (!domSnapshot || isPaused) return;

  const W = domCanvas.width;
  const H = domCanvas.height;
  const midX = W / 2;
  const top = 34;       // below the pressure bar
  const bottom = H - 24; // above the labels

  const bidsCum = toCumulative(domSnapshot.bids);
  const asksCum = toCumulative(domSnapshot.asks);
  // never divide by zero on an empty book
  const maxTotal = Math.max(lastTotal(bidsCum), lastTotal(asksCum), 1);

  domCtx.clearRect(0, 0, W, H);

  // centre line
  domCtx.strokeStyle = '#222d3f';
  domCtx.lineWidth = 1;
  domCtx.beginPath();
  domCtx.moveTo(midX, top);
  domCtx.lineTo(midX, bottom);
  domCtx.stroke();

  // the two depth areas
  drawArea(bidsCum, -1, maxTotal, midX, top, bottom, 'rgba(22,163,74,0.45)', '#4ade80');
  drawArea(asksCum, 1, maxTotal, midX, top, bottom, 'rgba(220,38,38,0.45)', '#f87171');

  // buy/sell pressure bar across the top
  smoothBidTotal += (lastTotal(bidsCum) - smoothBidTotal) * SMOOTHING;
  smoothAskTotal += (lastTotal(asksCum) - smoothAskTotal) * SMOOTHING;
  const totalVol = smoothBidTotal + smoothAskTotal || 1;
  const bidPct = smoothBidTotal / totalVol;

  domCtx.fillStyle = '#16a34a';
  domCtx.fillRect(0, 0, W * bidPct, 22);
  domCtx.fillStyle = '#dc2626';
  domCtx.fillRect(W * bidPct, 0, W * (1 - bidPct), 22);

  domCtx.font = '12px monospace';
  domCtx.fillStyle = '#ffffff';
  domCtx.fillText('Buy pressure ' + (bidPct * 100).toFixed(0) + '%', 10, 15);
  domCtx.textAlign = 'right';
  domCtx.fillText('Sell pressure ' + ((1 - bidPct) * 100).toFixed(0) + '%', W - 10, 15);

  // labels under the chart
  domCtx.fillStyle = '#7b8aa3';
  domCtx.font = '11px monospace';
  domCtx.textAlign = 'left';
  domCtx.fillText('BID DEPTH', 10, H - 8);
  domCtx.textAlign = 'center';
  domCtx.fillText('best price', midX, H - 8);
  domCtx.textAlign = 'right';
  domCtx.fillText('ASK DEPTH', W - 10, H - 8);
  domCtx.textAlign = 'left'; // reset for the next frame
}

requestAnimationFrame(drawDOM);

// edge cases handled:
// - empty book: maxTotal falls back to 1, nothing is drawn, no crash
// - one-sided book: the empty side draws nothing
// - huge single order: smoothing stops the pressure bar jumping straight to 100%