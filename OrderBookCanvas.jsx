

const obCanvas = document.getElementById('orderBookCanvas');
const obCtx = obCanvas.getContext('2d');

const OB_ROW_H = 22;
const OB_MAX_ROWS = 10;
const OB_TOP = 28;        // first row starts below the header
const OB_BAR_MAX = 165;   // longest bar in pixels

let lastSnapshot = null;
let obDirty = false;      
let obDrawMs = 0;         

function updateOrderBook(snapshot) {
  lastSnapshot = snapshot;
  obDirty = true;
}

function setObText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function drawOrderBook() {
  requestAnimationFrame(drawOrderBook);
  if (!lastSnapshot || !obDirty || isPaused) return;
  obDirty = false;

  const t0 = performance.now();

  const bids = lastSnapshot.bids.slice(0, OB_MAX_ROWS);
  const asks = lastSnapshot.asks.slice(0, OB_MAX_ROWS);
  const maxQty = Math.max(...bids.map(l => l.qty), ...asks.map(l => l.qty), 1);
  const mid = obCanvas.width / 2;

  obCtx.clearRect(0, 0, obCanvas.width, obCanvas.height);

  // headers
  obCtx.font = '11px monospace';
  obCtx.fillStyle = '#7b8aa3';
  obCtx.fillText('BID PRICE', 10, 16);
  obCtx.fillText('QTY', 100, 16);
  obCtx.fillText('ASK PRICE', 490, 16);
  obCtx.fillText('QTY', 548, 16);

  // centre divider
  obCtx.strokeStyle = '#222d3f';
  obCtx.beginPath();
  obCtx.moveTo(mid, 22);
  obCtx.lineTo(mid, obCanvas.height - 6);
  obCtx.stroke();

  obCtx.font = '13px monospace';

  // bids: bars grow left from the centre
  bids.forEach((lv, i) => {
    const y = OB_TOP + i * OB_ROW_H;
    const w = (lv.qty / maxQty) * OB_BAR_MAX;
    obCtx.fillStyle = i === 0 ? 'rgba(22,163,74,0.85)' : 'rgba(22,163,74,0.45)';
    obCtx.fillRect(mid - w, y + 2, w, 18);
    obCtx.fillStyle = i === 0 ? '#ffffff' : '#d6deeb';
    obCtx.fillText(lv.price.toFixed(2), 10, y + 16);
    obCtx.fillText(String(lv.qty), 100, y + 16);
  });

  // asks: bars grow right from the centre
  asks.forEach((lv, i) => {
    const y = OB_TOP + i * OB_ROW_H;
    const w = (lv.qty / maxQty) * OB_BAR_MAX;
    obCtx.fillStyle = i === 0 ? 'rgba(220,38,38,0.85)' : 'rgba(220,38,38,0.45)';
    obCtx.fillRect(mid, y + 2, w, 18);
    obCtx.fillStyle = i === 0 ? '#ffffff' : '#d6deeb';
    obCtx.fillText(lv.price.toFixed(2), 490, y + 16);
    obCtx.fillText(String(lv.qty), 548, y + 16);
  });

  // best bid / best ask / spread cards at the top of the page
  if (bids.length) setObText('bestBid', bids[0].price.toFixed(2));
  if (asks.length) setObText('bestAsk', asks[0].price.toFixed(2));
  if (bids.length && asks.length) {
    setObText('spread', (asks[0].price - bids[0].price).toFixed(2));
  }

  // smoothed draw time, so the number on screen doesn't jitter
  obDrawMs = obDrawMs * 0.9 + (performance.now() - t0) * 0.1;
}

requestAnimationFrame(drawOrderBook);