import OrderEntryForm from './components/OrderEntryForm.jsx'

function App() {
  return (
    <div className="terminal-shell">
      <header className="terminal-header">
        <h1>OrderFlow</h1>
        <span className="terminal-subtitle">Trading Terminal</span>
      </header>

      <main className="terminal-main">
        <section className="panel order-entry-panel">
          <OrderEntryForm />
        </section>

        {/* Week 2: live-updating recent trades list goes here */}
        <section className="panel placeholder-panel">
          <h2>Recent Trades</h2>
          <p className="placeholder-text">
            Live trade feed will connect here in Week 2 once the WebSocket
            integration is wired up.
          </p>
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
