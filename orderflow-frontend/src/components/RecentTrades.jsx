const STATUS_LABEL = {
  connecting: 'Connecting…',
  live: 'Live',
  simulated: 'Simulated (backend not connected)',
  error: 'Connection error — showing simulated data'
}

export default function RecentTrades({ trades, status }) {
  return (
    <div className="recent-trades">
      <div className="recent-trades-header">
        <h2>Recent Trades</h2>
        <span className={`status-badge status-${status}`}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      {trades.length === 0 ? (
        <p className="placeholder-text">Waiting for trades…</p>
      ) : (
        <table className="trades-table">
          <thead>
            <tr>
              <th>Side</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td>
                  <span className={`pill ${trade.side.toLowerCase()}`}>
                    {trade.side}
                  </span>
                </td>
                <td>{trade.price}</td>
                <td>{trade.quantity}</td>
                <td className="trade-time">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
