
import { useMarketData } from './useMarketData.js';
import OrderEntry from './OrderEntry.jsx';
import TradesList from './TradesList.jsx';
import OrderBookDom from './OrderBookDom.jsx';
import OrderBookCanvas from './OrderBookCanvas.jsx';

export default function App()
 {
  const { trades, depth, connected } = useMarketData();
  return (
    <div className="terminal">
      <header>
        <strong>ORDERFLOW</strong>
        <span className="sym">SIM/USD</span>
        <span className={`conn ${connected ? 'on' : 'off'}`}>{connected ? '● LIVE' : '○ OFFLINE'}</span>
      </header>
      <main>
        <OrderEntry />
        <OrderBookDom depth={depth} />
        <OrderBookCanvas depth={depth} />
        <TradesList trades={trades} />
        <DepthChart depth={depth} />
      </main>
    </div>
  );
}
