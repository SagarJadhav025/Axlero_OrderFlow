const stats = { count: 0, totalDelay: 0, maxDelay: 0 };
let queue = [];

function recordTrade(trade) {
  const delay = Date.now() - trade.timestamp;
  stats.count++;
  stats.totalDelay += delay;
  stats.maxDelay = Math.max(stats.maxDelay, delay);
  queue.push(trade);
}
function renderLoop() {
  if (queue.length) {
    drawTape(queue);      
    queue = [];
  }
  requestAnimationFrame(renderLoop);
}
requestAnimationFrame(renderLoop);

setInterval(() => {
  const avg = stats.count ? (stats.totalDelay / stats.count).toFixed(1) : 0;
  document.getElementById('stats').textContent =
    `Messages: ${stats.count} | Avg delay: ${avg} ms | Max delay: ${stats.maxDelay} ms`;
}, 1000);
