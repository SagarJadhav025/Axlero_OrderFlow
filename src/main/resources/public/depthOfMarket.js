

const domCanvas = document.getElementById('domCanvas');
const domCtx = domCanvas.getContext('2d');

let domSnapshot = null;


let smoothBidTotal = 0;
let smoothAskTotal = 0;
const SMOOTHING = 0.2; // lower = smoother but slower to react

function updateDOM(snapshot) {
  domSnapshot = snapshot;
}


function toCumulative(levels) {
  let running = 0;
  return levels.map(level => {
    running += level.qty;
    return { price: level.price, total: running };
  });
}

function drawDOM() {
  if (!domSnapshot) {
    requestAnimationFrame(drawDOM);
    return;
  }

  const bidsCum = toCumulative(domSnapshot.bids);
  const asksCum = toCumulative(domSnapshot.asks);

  const maxTotal = Math.max(
    bidsCum.length ? bidsCum[bidsCum.length - 1].total : 0,
    asksCum.length ? asksCum[asksCum.length - 1].total : 1
  );

  domCtx.clearRect(0, 0, domCanvas.width, domCanvas.height);

  const midX = domCanvas.width / 2;
  const chartHeight = domCanvas.height - 60; // leave room for the pressure bar at top

 
  domCtx.fillStyle = 'rgba(22, 163, 74, 0.5)';
  domCtx.beginPath();
  domCtx.moveTo(midX, chartHeight);
  bidsCum.forEach((level, i) => {
    const x = midX - (level.total / maxTotal) * midX;
    const y = chartHeight - (i / bidsCum.length) * chartHeight;
    domCtx.lineTo(x, y);
  });
  domCtx.lineTo(midX, 0);
  domCtx.closePath();
  domCtx.fill();

  // --- ask side, mirrored to the right ---
  domCtx.fillStyle = 'rgba(220, 38, 38, 0.5)';
  domCtx.beginPath();
  domCtx.moveTo(midX, chartHeight);
  asksCum.forEach((level, i) => {
    const x = midX + (level.total / maxTotal) * midX;
    const y = chartHeight - (i / asksCum.length) * chartHeight;
    domCtx.lineTo(x, y);
  });
  domCtx.lineTo(midX, 0);
  domCtx.closePath();
  domCtx.fill();

  
  const rawBidTotal = bidsCum.length ? bidsCum[bidsCum.length - 1].total : 0;
  const rawAskTotal = asksCum.length ? asksCum[asksCum.length - 1].total : 0;
  smoothBidTotal += (rawBidTotal - smoothBidTotal) * SMOOTHING;
  smoothAskTotal += (rawAskTotal - smoothAskTotal) * SMOOTHING;

  const totalVol = smoothBidTotal + smoothAskTotal || 1;
  const bidPct = smoothBidTotal / totalVol;

  domCtx.fillStyle = '#16a34a';
  domCtx.fillRect(0, 0, domCanvas.width * bidPct, 20);
  domCtx.fillStyle = '#dc2626';
  domCtx.fillRect(domCanvas.width * bidPct, 0, domCanvas.width * (1 - bidPct), 20);

  domCtx.fillStyle = '#fff';
  domCtx.font = '12px monospace';
  domCtx.fillText(`Buy pressure ${(bidPct * 100).toFixed(0)}%`, 10, 14);
  domCtx.fillText(`Sell pressure ${((1 - bidPct) * 100).toFixed(0)}%`, domCanvas.width - 130, 14);

  requestAnimationFrame(drawDOM);
}

requestAnimationFrame(drawDOM);

