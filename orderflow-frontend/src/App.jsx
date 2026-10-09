import { useMemo, useState } from 'react'
import OrderEntryForm from './components/OrderEntryForm.jsx'
import RecentTrades from './components/RecentTrades.jsx'
import { useTradeFeed } from './hooks/useTradeFeed.js'
import OrderBook from './components/OrderBook'

const watchlist = [
  { symbol: 'AAPL', price: 246.84, change: 1.42, volume: '8.4M' },
  { symbol: 'MSFT', price: 429.12, change: 0.88, volume: '4.2M' },
  { symbol: 'NVDA', price: 138.23, change: -0.34, volume: '12.8M' },
  { symbol: 'AMZN', price: 188.95, change: 1.07, volume: '6.1M' },
  { symbol: 'TSLA', price: 214.06, change: -1.12, volume: '9.7M' }
]

const positions = [
  { symbol: 'AAPL', side: 'Long', qty: 241, avg: 243.10, value: 58700 },
  { symbol: 'MSFT', side: 'Long', qty: 61, avg: 418.90, value: 25134 },
  { symbol: 'NVDA', side: 'Short', qty: 81, avg: 143.60, value: -11488 }
]

function buildInitialCandles() {
  const values = []
  let current = 245.2

  for (let i = 0; i < 28; i += 1) {
    const next = Number(Math.max(240, Math.min(250, current + (Math.random() - 0.45) * 2.2)).toFixed(2))
    values.push(next)
    current = next
  }

  return values
}

function App() {
  const { trades, status, sendOrder, orderBook, orderBookError, tradeError } = useTradeFeed()
  const [demoChartValues] = useState(buildInitialCandles)

  const level2 = useMemo(() => {
    const aggregate = (orders, descending) => {
      const levels = new Map()
      orders.forEach((order) => {
        const price = Number(order.price)
        const key = price.toFixed(2)
        const current = levels.get(key) ?? { price, size: 0, orders: 0 }
        current.size += Number(order.size ?? order.quantity ?? 0)
        current.orders += 1
        levels.set(key, current)
      })
      return Array.from(levels.values())
          .sort((left, right) => descending ? right.price - left.price : left.price - right.price)
          .slice(0, 5)
    }

    return {
      bids: aggregate(orderBook.bids, true),
      asks: aggregate(orderBook.asks, false)
    }
  }, [orderBook])

  const chartCandles = useMemo(() => {
    if (trades.length === 0) {
      return demoChartValues.map((close, index, values) => {
        const open = index === 0 ? close : values[index - 1]
        return {
          open,
          high: Math.max(open, close) + 0.35,
          low: Math.min(open, close) - 0.35,
          close,
          volume: 0
        }
      })
    }

    const buckets = new Map()
    trades.slice().reverse().forEach((trade) => {
      const time = new Date(trade.timestamp)
      const bucketTime = new Date(time)
      bucketTime.setSeconds(0, 0)
      const key = bucketTime.toISOString()
      const price = Number(trade.price)
      const candle = buckets.get(key)

      if (candle) {
        candle.high = Math.max(candle.high, price)
        candle.low = Math.min(candle.low, price)
        candle.close = price
        candle.volume += Number(trade.quantity)
      } else {
        buckets.set(key, {
          open: price,
          high: price,
          low: price,
          close: price,
          volume: Number(trade.quantity),
          timestamp: bucketTime
        })
      }
    })

    return Array.from(buckets.values()).slice(-28)
  }, [demoChartValues, trades])

  const chartValues = useMemo(() => chartCandles.map((candle) => candle.close), [chartCandles])
  const hasLivePrices = trades.length > 0
  const recentTradedQuantity = trades.reduce((total, trade) => total + Number(trade.quantity), 0)

  const chartPoints = useMemo(() => {
    const width = 720
    const height = 180
    const padding = 18
    const min = Math.min(...chartCandles.map((candle) => candle.low)) - 1
    const max = Math.max(...chartCandles.map((candle) => candle.high)) + 1

    return chartCandles.map((candle, index) => {
      const value = candle.close
      const x = chartCandles.length === 1
          ? width / 2
          : padding + (index * (width - padding - 2)) / (chartCandles.length - 1)
      const y = height - padding - ((value - min) / (max - min || 1)) * (height - padding - 2)
      return { x, y, value }
    })
  }, [chartCandles])

  const candles = useMemo(() => {
    const width = 720
    const height = 180
    const padding = 18
    const min = Math.min(...chartCandles.map((candle) => candle.low)) - 1
    const max = Math.max(...chartCandles.map((candle) => candle.high)) + 1
    const volumeMax = Math.max(...chartCandles.map((candle) => candle.volume), 1)

    return chartCandles.map((candle, index) => {
      const { open, high, low, close, volume } = candle
      const x = chartCandles.length === 1
          ? width / 2
          : padding + (index * (width - padding - 2)) / (chartCandles.length - 1)
      const yOpen = height - padding - ((open - min) / (max - min || 1)) * (height - padding - 2)
      const yClose = height - padding - ((close - min) / (max - min || 1)) * (height - padding - 2)
      const yHigh = height - padding - ((high - min) / (max - min || 1)) * (height - padding - 2)
      const yLow = height - padding - ((low - min) / (max - min || 1)) * (height - padding - 2)
      const volumeHeight = (volume / volumeMax) * 28
      const yVolume = 170 - volumeHeight
      const isUp = close >= open

      return {
        x,
        yOpen,
        yClose,
        yHigh,
        yLow,
        open,
        close,
        isUp,
        volume,
        yVolume
      }
    })
  }, [chartCandles])

  const chartSegments = useMemo(() => {
    if (chartPoints.length < 2) return []

    const segments = []

    for (let i = 1; i < chartPoints.length; i += 1) {
      const start = chartPoints[i - 1]
      const end = chartPoints[i]
      const color = end.value >= start.value ? 'green' : 'red'

      segments.push({
        d: `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
        color
      })
    }

    return segments
  }, [chartPoints])

  const areaPath = useMemo(() => {
    if (chartPoints.length === 0) return ''

    if (chartPoints.length === 1) return ''
    return `${chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)}${point.y.toFixed(2)}`).join(' ')} L ${chartPoints[chartPoints.length - 1].x.toFixed(2)} 162 L ${chartPoints[0].x.toFixed(2)} 162 Z`
  }, [chartPoints])

  const minPoint = chartPoints.reduce((lowest, point) => (point.value < lowest.value ? point : lowest), chartPoints[0])
  const maxPoint = chartPoints.reduce((highest, point) => (point.value > highest.value ? point : highest), chartPoints[0])
  const lastPrice = chartValues[chartValues.length - 1]
  const changePercent = chartValues.length > 1 && chartValues[0] !== 0
      ? ((lastPrice - chartValues[0]) / chartValues[0]) * 100
      : null
  const bestBid = level2.bids[0]?.price
  const bestAsk = level2.asks[0]?.price
  const spread = bestBid != null && bestAsk != null ? (bestAsk - bestBid).toFixed(2) : '—'
  const firstTrade = trades[0]

  return (
      <div className="dashboard-shell">
        <header className="topbar panel">
          <div className="brand-group">
            <div className="brand-mark">OF</div>
            <div>
              <div className="brand-title">OrderFlow</div>
              <div className="brand-subtitle">Trading Terminal</div>
            </div>
          </div>

          <div className="topbar-center">
            <div className={`market-chip ${status === 'live' ? 'market-open' : ''}`}>
              {status === 'live' ? 'Engine Live' : 'Engine Disconnected'}
            </div>
            <div className="mini-stat">
              <span>Spread</span>
              <strong>{spread === '—' ? spread : `$${spread}`}</strong>
            </div>
          </div>

          <div className="account-panel">
            <span>Account</span>
            <strong>$248,430 <small>Demo</small></strong>
          </div>
        </header>

        <main className="dashboard-body">
          <aside className="left-rail panel">
            <div className="section-header">
              <h3>Watchlist <span className="demo-label">Demo</span></h3>
              <button type="button" className="ghost-btn">Add</button>
            </div>

            <div className="watchlist">
              {watchlist.map((item) => (
                  <button type="button" key={item.symbol} className="watch-item">
                    <div>
                      <span className="watch-symbol">{item.symbol}</span>
                      <small>{item.volume}</small>
                    </div>
                    <div className="watch-price-group">
                      <strong>{item.price.toFixed(2)}</strong>
                      <span className={item.change >= 0 ? 'positive' : 'negative'}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </span>
                    </div>
                  </button>
              ))}
            </div>
          </aside>

          <section className="main-panel">
            <div className="panel hero-panel">
              <div className="hero-header">
                <div>
                  <p className="eyebrow">OrderFlow • Matching Engine</p>
                  <h2>{hasLivePrices ? 'Executed Trade Prices' : 'Demo Market Preview'}</h2>
                </div>

                <div className="price-summary">
                  <span className="current-price">${lastPrice.toFixed(2)}</span>
                  {changePercent != null && (
                      <span className={`price-change ${changePercent >= 0 ? 'positive' : 'negative'}`}>
                    {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}% window
                  </span>
                  )}
                </div>
              </div>

              <div className="market-grid">
                <div className="metric-card">
                  <span>Last</span>
                  <strong>${lastPrice.toFixed(2)}</strong>
                </div>
                <div className="metric-card">
                  <span>Change (window)</span>
                  <strong className={changePercent == null ? '' : changePercent >= 0 ? 'positive' : 'negative'}>
                    {changePercent == null ? '—' : `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
                  </strong>
                </div>
                <div className="metric-card">
                  <span>Recent qty ({trades.length} fills)</span>
                  <strong>{hasLivePrices ? recentTradedQuantity.toLocaleString() : '—'}</strong>
                </div>
                <div className="metric-card">
                  <span>VWAP (recent)</span>
                  <strong>{hasLivePrices
                      ? `$${(trades.reduce((total, trade) => total + Number(trade.price) * Number(trade.quantity), 0) / recentTradedQuantity).toFixed(2)}`
                      : '—'}</strong>
                </div>
              </div>

              <div className="chart-surface" aria-label={hasLivePrices ? 'Executed trade price chart' : 'Demo market chart'}>
              <span className={`chart-data-label ${hasLivePrices ? 'live-data-label' : ''}`}>
                {hasLivePrices ? 'Backend execution data · 1 min candles' : 'Simulated preview · waiting for executions'}
              </span>
                <svg viewBox="0 0 720 180" preserveAspectRatio="none" className="chart-svg">
                  <defs>
                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(100, 210, 255, 0.35)" />
                      <stop offset="100%" stopColor="rgba(100, 210, 255, 0.02)" />
                    </linearGradient>
                  </defs>
                  {areaPath && <path d={areaPath} fill="url(#chartFill)" opacity="0.9" />}

                  {candles.map((candle, index) => (
                      <g key={`${candle.open}-${candle.close}-${index}`}>
                        {hasLivePrices && candle.volume > 0 && (
                            <rect
                                x={candle.x - 7}
                                y={candle.yVolume}
                                width="14"
                                height={170 - candle.yVolume}
                                rx="2"
                                fill={candle.isUp ? 'rgba(34, 197, 94, 0.2)' : 'rgba(248, 113, 113, 0.2)'}
                            />
                        )}
                        <line
                            x1={candle.x}
                            x2={candle.x}
                            y1={candle.yHigh}
                            y2={candle.yLow}
                            stroke={candle.isUp ? '#22c55e' : '#f87171'}
                            strokeWidth="1.5"
                        />
                        <rect
                            x={candle.x - 5}
                            y={Math.min(candle.yOpen, candle.yClose)}
                            width="10"
                            height={Math.max(Math.abs(candle.yClose - candle.yOpen), 4)}
                            rx="2"
                            fill={candle.isUp ? '#22c55e' : '#f87171'}
                        />
                      </g>
                  ))}

                  {chartSegments.map((segment, index) => (
                      <path
                          key={`${segment.color}-${index}`}
                          d={segment.d}
                          fill="none"
                          stroke={segment.color === 'green' ? '#22c55e' : '#f87171'}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.9"
                      />
                  ))}

                  {chartPoints.length > 1 && <circle cx={maxPoint.x} cy={maxPoint.y} r="5" fill="#22c55e" />}
                  {chartPoints.length > 1 && <circle cx={minPoint.x} cy={minPoint.y} r="5" fill="#f87171" />}
                  <circle cx={chartPoints[chartPoints.length - 1].x} cy={chartPoints[chartPoints.length - 1].y} r="6" fill="#64d2ff" />
                </svg>
              </div>
            </div>

            <div className="detail-grid">
              <section className="panel orderbook-panel">
                <div className="section-header">
                  <h3>Order Book</h3>
                  <span className="section-pill">Level 2 · aggregated</span>
                </div>
                {orderBookError && <p className="form-error">{orderBookError}</p>}

                <OrderBook bids={level2.bids} asks={level2.asks} />
              </section>

              <section className="panel positions-panel">
                <div className="section-header">
                  <h3>Positions <span className="demo-label">Demo</span></h3>
                  <span className="section-pill">Sample portfolio</span>
                </div>

                <div className="positions-list">
                  {positions.map((item) => (
                      <div key={item.symbol} className="position-row">
                        <div>
                          <strong>{item.symbol}</strong>
                          <small>{item.side}</small>
                        </div>
                        <div>
                          <strong>{item.qty}</strong>
                          <small>Qty</small>
                        </div>
                        <div>
                          <strong>{item.avg.toFixed(2)}</strong>
                          <small>Avg</small>
                        </div>
                        <div className={item.side === 'Short' ? 'negative' : 'positive'}>
                          <strong>${Math.abs(item.value).toLocaleString()}</strong>
                        </div>
                      </div>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <aside className="right-rail">
            <div className="panel action-panel">
              <OrderEntryForm onSubmitOrder={sendOrder} />
            </div>

            <div className="panel activity-panel">
              <RecentTrades trades={trades} status={status} error={tradeError} />
            </div>

            <div className="panel snapshot-panel">
              <div className="section-header">
                <h3>Market Snapshot</h3>
              </div>
              <div className="snapshot-grid">
                <div>
                  <span>Last trade</span>
                  <strong>{firstTrade ? `$${Number(firstTrade.price).toFixed(2)}` : '—'}</strong>
                </div>
                <div>
                  <span>Bid</span>
                  <strong>{bestBid == null ? '—' : `$${bestBid.toFixed(2)}`}</strong>
                </div>
                <div>
                  <span>Ask</span>
                  <strong>{bestAsk == null ? '—' : `$${bestAsk.toFixed(2)}`}</strong>
                </div>
                <div>
                  <span>Recent qty ({trades.length} fills)</span>
                  <strong>{hasLivePrices ? recentTradedQuantity.toLocaleString() : '—'}</strong>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
  )
}

export default App