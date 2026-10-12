
const tapeCanvas = document.getElementById('tape');
const tapeCtx = tapeCanvas.getContext('2d');

const TAPE_ROWS = 17;   
const TAPE_ROW_H = 22;  
const TAPE_TOP = 30;    

const tapeRows = [];

let isPaused = false;

function drawTape(newTrades) {
  if (isPaused) return;

  for (const t of newTrades) {
    t.timeStr = new Date(t.timestamp).toTimeString().slice(0, 8);
    tapeRows.unshift(t);
  }
  if (tapeRows.length > TAPE_ROWS) tapeRows.length = TAPE_ROWS;

  tapeCtx.clearRect(0, 0, tapeCanvas.width, tapeCanvas.height);

  tapeCtx.font = '11px monospace';
  tapeCtx.fillStyle = '#7b8aa3';
  tapeCtx.fillText('SIDE', 12, 18);
  tapeCtx.fillText('PRICE', 80, 18);
  tapeCtx.fillText('QTY', 175, 18);
  tapeCtx.fillText('TIME', 300, 18);
  tapeCtx.strokeStyle = '#222d3f';
  tapeCtx.beginPath();
  tapeCtx.moveTo(0, 24);
  tapeCtx.lineTo(tapeCanvas.width, 24);
  tapeCtx.stroke();


  tapeCtx.font = '14px monospace';
  tapeRows.forEach((t, i) => {
    const y = TAPE_TOP + i * TAPE_ROW_H;
    const isBuy = t.side === 'BUY';

    
    if (i === 0) {
      tapeCtx.fillStyle = isBuy ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)';
      tapeCtx.fillRect(0, y - 4, tapeCanvas.width, TAPE_ROW_H);
    }

    tapeCtx.fillStyle = isBuy ? '#4ade80' : '#f87171';
    tapeCtx.fillText(t.side, 12, y + 14);
    tapeCtx.fillText(t.price.toFixed(2), 80, y + 14);

    tapeCtx.fillStyle = '#d6deeb';
    tapeCtx.fillText(String(t.quantity), 175, y + 14);

    tapeCtx.fillStyle = '#7b8aa3';
    tapeCtx.fillText(t.timeStr, 300, y + 14);
  });
}

function togglePause() {
  isPaused = !isPaused;
  const btn = document.getElementById('pauseBtn');
  if (btn) btn.textContent = isPaused ? 'Resume Live Feed' : 'Pause Live Feed';
  const badge = document.getElementById('pausedBadge');
  if (badge) badge.hidden = !isPaused;
}

const pauseButton = document.getElementById('pauseBtn');
if (pauseButton) pauseButton.addEventListener('click', togglePause);

drawTape([]);