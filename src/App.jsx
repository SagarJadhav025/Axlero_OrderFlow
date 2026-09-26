import { useEffect, useMemo, useState } from 'react'
import OrderEntryForm from './components/OrderEntryForm.jsx'

const buildInitialCandles = () => {
  const candles = []
  let price = 245.2

  for (let i = 0; i < 30; i += 1) {
    const open = price
    const drift = (Math.random() - 0.45) * 1.6
    const close = Number(Math.max(240, Math.min(250, open + drift)).toFixed(2))
    const high = Number(Math.max(open, close) + Math.random() * 1.2 + 0.2)
    const low = Number(Math.min(open, close) - (Math.random() * 1.1 + 0.2))

    candles.push({ id: i, open, high, low, close })
    price = close
  }

  return candles
}

const initialBook = {
  bids: [
    { price: 245.92, size: 220 },
    { price: 245.90, size: 180 },
    { price: 245.88, size: 140 },
    { price: 245.85, size: 330 },
    { price: 245.82, size: 210 },
  ],
  asks: [
    { price: 245.97, size: 190 },
    { price: 245.99, size: 250 },
    { price: 246.02, size: 130 },
    { price: 246.05, size: 160 },
    { price: 246.09, size: 90 },
  ],
}

const buildTrade = (side, price, quantity, time = new Date()) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  side,
  price: Number(price).toFixed(2),
  quantity,
  time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
})

function App() {
  const [candles, setCandles] = useState(buildInitialCandles)
  const [price, setPrice] = useState(245.84)
  const [status, setStatus] = useState('Market Open')
  const [trades, setTrades] = useState([
    buildTrade('BUY', 245.82, 110),
    buildTrade('SELL', 245.9, 90),
    buildTrade('BUY', 245.76, 175),
    buildTrade('SELL', 245.96, 210),
  ])
  const [orderBook, setOrderBook] = useState(initialBook)
  const [selectedLevel, setSelectedLevel] = useState({ side: 'buy', price: 245.9 })

  useEffect(() => {
    const timer = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1]
        const nextOpen = last.close
        const variance = (Math.random() - 0.48) * 2.2
        const nextClose = Number(Math.max(240, Math.min(250, nextOpen + variance)).toFixed(2))
        const next = {
          id: Date.now(),
          open: nextOpen,
          high: Number(Math.max(nextOpen, nextClose) + Math.random() * 1.1 + 0.2),
          low: Number(Math.min(nextOpen, nextClose) - (Math.random() * 1.1 + 0.2)),
          close: nextClose,
        }

        return [...prev.slice(-29), next]
      })

      setPrice((prev) => {
        const next = Number(Math.max(240, Math.min(250, prev + (Math.random() - 0.5) * 1.6)).toFixed(2))
        setStatus(next > 245.8 ? 'Momentum Up' : next < 245.3 ? 'Pressure Down' : 'Market Open')
        return next
      })

      setTrades((prev) => {
        const side = Math.random() > 0.5 ? 'BUY' : 'SELL'
        const nextTrade = buildTrade(side, price + (Math.random() - 0.5) * 0.8, 80 + Math.floor(Math.random() * 120))
        return [nextTrade, ...prev].slice(0, 6)
      })

      setOrderBook((prev) => {
        const adjustLevel = (arr, factor) =>
          arr.map((item) => ({
            ...item,
            price: Number((item.price + (Math.random() - 0.5) * factor).toFixed(2)),
            size: Math.max(40, item.size + Math.floor(Math.random() * 25) - 10),
          }))

        return {
          bids: adjustLevel(prev.bids, 0.18).sort((a, b) => b.price - a.price).slice(0, 5),
          asks: adjustLevel(prev.asks, 0.18).sort((a, b) => a.price - b.price).slice(0, 5),
        }
      })
    }, 1800)

    return () => clearInterval(timer)
  }, [price])

  const chartPoints = useMemo(() => {
    const width = 760
    const height = 210
    const min = Math.min(...candles.map((c) => c.low)) - 0.8
    const max = Math.max(...candles.map((c) => c.high)) + 0.8

    return candles.map((candle, index) => {
      const x = 18 + index * 22
      const openY = ((max - candle.open) / (max - min)) * height
      const closeY = ((max - candle.close) / (max - min)) * height
      const highY = ((max - candle.high) / (max - min)) * height
      const lowY = ((max - candle.low) / (max - min)) * height
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.max(Math.abs(closeY - openY), 4)

      return {
        ...candle,
        x,
        openY,
        closeY,
        highY,
        lowY,
        bodyTop,
        bodyHeight,
      }
    })
  }, [candles])

  const handleOrderSubmit = (order) => {
    const trade = buildTrade(order.side, order.price ?? price, order.quantity)
    setTrades((prev) => [trade, ...prev].slice(0, 6))
    setOrderBook((prev) => {
      const sideKey = order.side === 'BUY' ? 'bids' : 'asks'
      const next = [...prev[sideKey]]
      const entry = { price: Number(order.price ?? price), size: Number(order.quantity) }
      const existingIndex = next.findIndex((level) => Math.abs(level.price - entry.price) < 0.01)

      if (existingIndex >= 0) {
        next[existingIndex] = { ...next[existingIndex], size: next[existingIndex].size + entry.size }
      } else {
        next.push(entry)
      }

      return {
        ...prev,
        [sideKey]: next.sort((a, b) => (sideKey === 'bids' ? b.price - a.price : a.price - b.price)).slice(0, 5),
      }
    })
  }

  const changePercent = ((price - candles[0].open) / candles[0].open) * 100

  return (
    <div className="terminal-shell">
      <header className="terminal-header">
        <div className="brand-wrap">
          <div className="brand-mark">OF</div>
          <div>
            <h1>OrderFlow</h1>
            <span className="terminal-subtitle">Trading Terminal</span>
          </div>
        </div>

        <div className="market-status">
          <span className="status-dot" />
          {status}
        </div>
      </header>

      <main className="terminal-main">
        <section className="panel hero-panel">
          <div className="hero-top">
            <div>
              <p className="eyebrow">NASDAQ • AAPL</p>
              <h2>Apple Inc.</h2>
            </div>
            <div className="price-block">
              <span className="current-price">${price.toFixed(2)}</span>
              <span className={`price-change ${changePercent >= 0 ? 'positive' : 'negative'}`}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">Last</span>
              <strong>${price.toFixed(2)}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Change</span>
              <strong className={changePercent >= 0 ? 'positive' : 'negative'}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Volume</span>
              <strong>8.4M</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Spread</span>
              <strong>0.07</strong>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-legend">
              <span>1M</span>
              <span>5M</span>
              <span className="active">15M</span>
              <span>1H</span>
            </div>

            <svg className="chart-svg" viewBox="0 0 760 220" preserveAspectRatio="none" aria-label="Price chart">
              <defs>
                <linearGradient id="chartGlow" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(125,211,252,0.4)" />
                  <stop offset="100%" stopColor="rgba(125,211,252,0.02)" />
                </linearGradient>
              </defs>

              {Array.from({ length: 5 }).map((_, index) => (
                <line
                  key={index}
                  x1="0"
                  x2="760"
                  y1={20 + index * 44}
                  y2={20 + index * 44}
                  stroke="rgba(148,163,184,0.16)"
                  strokeDasharray="4 6"
                />
              ))}

              {[...chartPoints].map((candle) => (
                <g key={candle.id}>
                  <line x1={candle.x} x2={candle.x} y1={candle.highY} y2={candle.lowY} stroke={candle.close >= candle.open ? '#4ade80' : '#f87171'} strokeWidth="2" />
                  <rect
                    x={candle.x - 6}
                    y={candle.bodyTop}
                    width={12}
                    height={Math.max(candle.bodyHeight, 6)}
                    rx="3"
                    fill={candle.close >= candle.open ? '#4ade80' : '#f87171'}
                    opacity="0.9"
                  />
                </g>
              ))}

              <path
                d={chartPoints
                  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${((Math.max(...chartPoints.map((c) => c.high)) - point.close) / (Math.max(...chartPoints.map((c) => c.high)) - Math.min(...chartPoints.map((c) => c.low))) * 200) + 10}`)
                  .join(' ')}
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </section>

        <section className="panel order-entry-panel">
          <OrderEntryForm onSubmitOrder={handleOrderSubmit} />
        </section>

        <section className="panel his-panel">
          <div className="panel-header">
            <h2>Recent Trades</h2>
            <span className="live-pill">Live</span>
          </div>

          <div className="trade-list">
            {trades.map((trade) => (
              <div key={trade.id} className="trade-row">
                <span className={`trade-side ${trade.side.toLowerCase()}`}>{trade.side}</span>
                <span className="trade-price">${trade.price}</span>
                <span className="trade-qty">{trade.quantity}</span>
                <span className="trade-time">{trade.time}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel book-panel">
          <div className="panel-header">
            <h2>Order Book</h2>
            <span className="book-tag">Depth</span>
          </div>

          <div className="book-grid">
            <div className="book-column">
              <div className="book-header">
                <span>Bids</span>
                <span>Qty</span>
                <span>Price</span>
              </div>
              {orderBook.bids.map((level) => (
                <button
                  key={`${level.price}-bid`}
                  type="button"
                  className={`book-row buy-row ${selectedLevel.side === 'buy' && selectedLevel.price === level.price ? 'selected' : ''}`}
                  onClick={() => setSelectedLevel({ side: 'buy', price: level.price })}
                >
                  <span>{level.size}</span>
                  <span>${level.price.toFixed(2)}</span>
                </button>
              ))}
            </div>

            <div className="book-column sell-column">
              <div className="book-header">
                <span>Asks</span>
                <span>Qty</span>
                <span>Price</span>
              </div>
              {orderBook.asks.map((level) => (
                <button
                  key={`${level.price}-ask`}
                  type="button"
                  className={`book-row sell-row ${selectedLevel.side === 'sell' && selectedLevel.price === level.price ? 'selected' : ''}`}
                  onClick={() => setSelectedLevel({ side: 'sell', price: level.price })}
                >
                  <span>{level.size}</span>
                  <span>${level.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
