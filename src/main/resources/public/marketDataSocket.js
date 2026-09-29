
function createMarketSocket(url, onMessage, onStatus) {
  let ws, retry = 0;
  function connect() {
    ws = new WebSocket(url);
    ws.onopen = () => { retry = 0; onStatus('connected'); };
    ws.onmessage = (e) => onMessage(JSON.parse(e.data));
    ws.onerror = () => onStatus('error');
    ws.onclose = () => {
      onStatus('disconnected');
      const delay = Math.min(1000 * 2 ** retry++, 10000);
      setTimeout(connect, delay);
    };
  }
  connect();
}