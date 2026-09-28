import OrderEntryForm from './components/OrderEntryForm.jsx'
import RecentTrades from './components/RecentTrades.jsx'
import { useTradeFeed } from './hooks/useTradeFeed.js'

function App() {
  const { trades, status, sendOrder } = useTradeFeed()

  return (
    <div className="terminal-shell">
      <header className="terminal-header">
        <h1>OrderFlow</h1>
        <span className="terminal-subtitle">Trading Terminal</span>
      </header>

      <main className="terminal-main">
        <section className="panel order-entry-panel">
          <OrderEntryForm onSubmitOrder={sendOrder} />
        </section>

        <section className="panel">
          <RecentTrades trades={trades} status={status} />
        </section>

        {/* Week 3: Order Book (standard DOM rendering) goes here */}
        <section className="panel placeholder-panel">
          <h2>Order Book</h2>
          <p className="placeholder-text">
            Level 2 order book (standard React DOM rendering) will render
            here in Week 3.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
