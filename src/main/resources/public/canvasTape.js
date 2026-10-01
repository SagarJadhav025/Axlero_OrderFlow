// canvasTape.js
// Member 5 - Week 2
// Draws a simple scrolling trade tape - most recent trades at the top.

const tapeCanvas = document.getElementById('tape');
const tapeCtx = tapeCanvas.getContext('2d');
const rows = [];

function drawTape(newTrades) {
  rows.unshift(...newTrades.reverse());
  rows.length = Math.min(rows.length, 18);

  tapeCtx.clearRect(0, 0, tapeCanvas.width, tapeCanvas.height);
  tapeCtx.font = '14px monospace';

  rows.forEach((t, i) => {
    tapeCtx.fillStyle = t.side === 'BUY' ? '#16a34a' : '#dc2626';
    tapeCtx.fillText(
      `${t.side}  ${t.price.toFixed(2)}  x${t.quantity}`,
      10,
      20 + i * 20
    );
  });
}