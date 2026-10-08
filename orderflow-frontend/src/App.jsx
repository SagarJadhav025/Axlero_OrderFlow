import { useEffect, useMemo, useState } from 'react'
import OrderEntryForm from './components/OrderEntryForm.jsx'
import RecentTrades from './components/RecentTrades.jsx'
import { useTradeFeed } from './hooks/useTradeFeed.js'

const watchlist = [
  { symbol: 'AAPL', price: 245.84, change: 1.42, volume: '8.4M' },
  { symbol: 'MSFT', price: 428.12, change: 0.88, volume: '4.2M' },
  { symbol: 'NVDA', price: 138.23, change: -0.34, volume: '12.8M' },
  { symbol: 'AMZN', price: 188.95, change: 1.07, volume: '6.1M' },
  { symbol: 'TSLA', price: 214.06, change: -1.12, volume: '9.7M' }
]

const positions = [
  { symbol: 'AAPL', side: 'Long', qty: 240, avg: 243.10, value: 58700 },
  { symbol: 'MSFT', side: 'Long', qty: 60, avg: 418.90, value: 25134 },
  { symbol: 'NVDA', side: 'Short', qty: 80, avg: 143.60, value: -11488 }
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
  const [chartValues, setChartValues] = useState(buildInitialCandles)
  const [price, setPrice] = useState(245.84)

  useEffect(() => {
    const timer = setInterval(() => {
      setChartValues((previous) => {
        const nextValue = Number(Math.max(240, Math.min(250, (previous[previous.length - 1] || 245.84) + (Math.random() - 0.45) * 1.6)).toFixed(2))
        const next = [...previous.slice(-27), nextValue]
        setPrice(next[next.length - 1])
        return next
      })
    }, 1600)

    return () => clearInterval(timer)
  }, [])

  const chartPoints = useMemo(() => {
    const width = 720
    const height = 180
    const padding = 18
    const min = Math.min(...chartValues) - 1
    const max = Math.max(...chartValues) + 1

    return chartValues.map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / (chartValues.length - 1)
      const y = height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2)
      return { x, y, value }
    })
  }, [chartValues])

  const candles = useMemo(() => {
    const width = 720
    const height = 180
    const padding = 18
    const min = Math.min(...chartValues) - 1
    const max = Math.max(...chartValues) + 1
    const volumeMax = 1200

    return chartValues.map((value, index) => {
      const previous = index === 0 ? value : chartValues[index - 1]
      const open = Number(previous.toFixed(2))
      const high = Number(Math.max(open, value) + 0.35)
      const low = Number(Math.min(open, value) - 0.35)
      const close = Number(value.toFixed(2))
      const x = padding + (index * (width - padding * 2)) / (chartValues.length - 1)
      const yOpen = height - padding - ((open - min) / (max - min || 1)) * (height - padding * 2)
      const yClose = height - padding - ((close - min) / (max - min || 1)) * (height - padding * 2)
      const yHigh = height - padding - ((high - min) / (max - min || 1)) * (height - padding * 2)
      const yLow = height - padding - ((low - min) / (max - min || 1)) * (height - padding * 2)
      const volume = 650 + Math.abs(close - open) * 1200 + (index % 5) * 110
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
        yVolume,
      }
    })
  }, [chartValues])

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

    return `${chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')} L ${chartPoints[chartPoints.length - 1].x.toFixed(2)} 162 L ${chartPoints[0].x.toFixed(2)} 162 Z`
  }, [chartPoints])

  const minPoint = chartPoints.reduce((lowest, point) => (point.value < lowest.value ? point : lowest), chartPoints[0])
  const maxPoint = chartPoints.reduce((highest, point) => (point.value > highest.value ? point : highest), chartPoints[0])
  const lastPrice = chartValues[chartValues.length - 1] ?? price
  const changePercent = (((lastPrice - chartValues[0]) / chartValues[0]) * 100)
  const bestBid = orderBook.bids[0]?.price
  const bestAsk = orderBook.asks[0]?.price
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
          <div className="market-chip market-open">Market Open</div>
          <div className="mini-stat">
            <span>Spread</span>
            <strong>{spread === '—' ? spread : `$${spread}`}</strong>
          </div>
        </div>

        <div className="account-panel">
          <span>Account</span>
          <strong>$248,430</strong>
        </div>
      </header>

      <main className="dashboard-body">
        <aside className="left-rail panel">
          <div className="section-header">
            <h3>Watchlist</h3>
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
                <p className="eyebrow">NASDAQ • AAPL</p>
                <h2>Apple Inc.</h2>
              </div>

              <div className="price-summary">
                <span className="current-price">${lastPrice.toFixed(2)}</span>
                <span className={`price-change ${changePercent >= 0 ? 'positive' : 'negative'}`}>
                  {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="market-grid">
              <div className="metric-card">
                <span>Last</span>
                <strong>${lastPrice.toFixed(2)}</strong>
              </div>
              <div className="metric-card">
                <span>Change</span>
                <strong className={changePercent >= 0 ? 'positive' : 'negative'}>
                  {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </strong>
              </div>
              <div className="metric-card">
                <span>Volume</span>
                <strong>8.4M</strong>
              </div>
              <div className="metric-card">
                <span>VWAP</span>
                <strong>${(lastPrice - 0.12).toFixed(2)}</strong>
              </div>
            </div>

            <div className="chart-surface" aria-label="Market chart">
              <svg viewBox="0 0 720 180" preserveAspectRatio="none" className="chart-svg">
                <defs>
                  <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(100, 210, 255, 0.35)" />
                    <stop offset="100%" stopColor="rgba(100, 210, 255, 0.02)" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#chartFill)" opacity="0.9" />

                {candles.map((candle, index) => (
                  <g key={`${candle.open}-${candle.close}-${index}`}>
                    <rect
                      x={candle.x - 7}
                      y={candle.yVolume}
                      width="14"
                      height={170 - candle.yVolume}
                      rx="2"
                      fill={candle.isUp ? 'rgba(34, 197, 94, 0.2)' : 'rgba(248, 113, 113, 0.2)'}
                    />
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

                <circle cx={maxPoint.x} cy={maxPoint.y} r="5" fill="#22c55e" />
                <circle cx={minPoint.x} cy={minPoint.y} r="5" fill="#f87171" />
                <circle cx={chartPoints[chartPoints.length - 1].x} cy={chartPoints[chartPoints.length - 1].y} r="6" fill="#64d2ff" />
              </svg>
            </div>
          </div>

          <div className="detail-grid">
            <section className="panel orderbook-panel">
              <div className="section-header">
                <h3>Order Book</h3>
                <span className="section-pill">Depth</span>
              </div>
              {orderBookError && <p className="form-error">{orderBookError}</p>}

              <div className="book-grid">
                <div className="book-column">
                  <div className="book-column-header">
                    <span>Bids</span>
                    <span>Qty</span>
                    <span>Price</span>
                  </div>
                  {orderBook.bids.map((level) => (
                    <div key={level.orderId} className="book-row buy-row">
                      <span>{level.size}</span>
                      <span>{level.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="book-column">
                  <div className="book-column-header">
                    <span>Asks</span>
                    <span>Qty</span>
                    <span>Price</span>
                  </div>
                  {orderBook.asks.map((level) => (
                    <div key={level.orderId} className="book-row sell-row">
                      <span>{level.size}</span>
                      <span>{level.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel positions-panel">
              <div className="section-header">
                <h3>Positions</h3>
                <span className="section-pill positive">P&L +2.6%</span>
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
                <span>Volume</span>
                <strong>8.4M</strong>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
