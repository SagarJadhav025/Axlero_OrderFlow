const STATUS_LABEL = {
  connecting: 'Connecting…',
  live: 'Live',
  disconnected: 'Disconnected'
}

export default function RecentTrades({ trades, status, error }) {
  return (
    <div className="recent-trades">
      <div className="recent-trades-header">
        <h2>Recent Trades</h2>
        <span className={`status-badge status-${status}`}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      {error && <p className="form-error">{error}</p>}
      {trades.length === 0 ? (
        <p className="placeholder-text">
          {status === 'live' ? 'Connected — waiting for an executed trade…' : 'Connecting to backend trade stream…'}
        </p>
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
