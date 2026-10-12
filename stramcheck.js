

const stats = { count: 0, totalDelay: 0, maxDelay: 0 };

let queue = [];       
let prevCount = 0;    
let frames = 0;      
let prevPrice = null; 

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}


function recordTrade(trade) {
  
  const delay = Math.max(0, Date.now() - trade.timestamp);
  stats.count++;
  stats.totalDelay += delay;
  if (delay > stats.maxDelay) stats.maxDelay = delay;

  queue.push(trade);

  
  if (queue.length > 500) queue.splice(0, queue.length - 500);
}

function showLastPrice(price) {
  const el = document.getElementById('lastPrice');
  if (!el) return;
  el.textContent = price.toFixed(2);
  if (prevPrice !== null && price !== prevPrice) {
    const up = price > prevPrice;
    el.className = 'value ' + (up ? 'up' : 'down');
    setText('lastChange', (up ? '▲ ' : '▼ ') + Math.abs(price - prevPrice).toFixed(2));
  }
  prevPrice = price;
}

// one render per screen frame, no matter how many messages arrived in between
function renderLoop() {
  frames++;
  if (queue.length) {
    if (!isPaused) showLastPrice(queue[queue.length - 1].price);
    drawTape(queue);
    queue = [];
  }
  requestAnimationFrame(renderLoop);
}
requestAnimationFrame(renderLoop);

// refresh the numbers once a second
setInterval(() => {
  const rate = stats.count - prevCount;
  prevCount = stats.count;
  const avg = stats.count ? stats.totalDelay / stats.count : 0;

  setText('msgRate', String(rate));
  setText('msgCount', stats.count + ' total');
  setText('avgDelay', avg.toFixed(1) + ' ms');
  setText('maxDelay', 'max ' + stats.maxDelay + ' ms');
  setText('fps', frames + ' FPS');
  frames = 0;

  // obDrawMs is measured in orderBookCanvas.js
  if (typeof obDrawMs !== 'undefined') {
    setText('drawMs', 'draw ' + obDrawMs.toFixed(2) + ' ms');
  }
}, 1000);