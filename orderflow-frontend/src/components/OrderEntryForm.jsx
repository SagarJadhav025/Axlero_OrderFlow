import { useState } from 'react'

const initialState = {
  side: 'BUY',       // BUY | SELL
  orderType: 'LIMIT', // LIMIT | MARKET
  price: '',
  quantity: ''
}

export default function OrderEntryForm({ onSubmitOrder }) {
  const [form, setForm] = useState(initialState)
  const [error, setError] = useState('')
  const [lastSubmitted, setLastSubmitted] = useState(null)

  const isMarket = form.orderType === 'MARKET'

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    const qty = Number(form.quantity)
    if (!form.quantity || qty <= 0) {
      return 'Quantity must be a positive number.'
    }
    if (!isMarket) {
      const price = Number(form.price)
      if (!form.price || price <= 0) {
        return 'Price must be a positive number for limit orders.'
      }
    }
    return ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const order = {
      side: form.side,
      orderType: form.orderType,
      price: isMarket ? null : Number(form.price),
      quantity: Number(form.quantity),
      timestamp: new Date().toISOString()
    }

    setError('')
    setLastSubmitted(order)

    // Week 2 will wire this into the WebSocket/API call to the backend.
    if (onSubmitOrder) {
      onSubmitOrder(order)
    } else {
      console.log('Order submitted:', order)
    }

    setForm((prev) => ({ ...initialState, side: prev.side, orderType: prev.orderType }))
  }

  return (
    <div className="order-entry-card">
      <h2 className="order-entry-title">Order Entry</h2>

      <form onSubmit={handleSubmit} className="order-entry-form">
        <div className="side-toggle">
          <button
            type="button"
            className={`side-btn buy ${form.side === 'BUY' ? 'active' : ''}`}
            onClick={() => update('side', 'BUY')}
          >
            BUY
          </button>
          <button
            type="button"
            className={`side-btn sell ${form.side === 'SELL' ? 'active' : ''}`}
            onClick={() => update('side', 'SELL')}
          >
            SELL
          </button>
        </div>

        <div className="field-group">
          <label htmlFor="orderType">Order Type</label>
          <select
            id="orderType"
            value={form.orderType}
            onChange={(e) => update('orderType', e.target.value)}
          >
            <option value="LIMIT">Limit</option>
            <option value="MARKET">Market</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder={isMarket ? 'Market order — no price' : '0.00'}
            value={form.price}
            disabled={isMarket}
            onChange={(e) => update('price', e.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={form.quantity}
            onChange={(e) => update('quantity', e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className={`submit-btn ${form.side.toLowerCase()}`}>
          {form.side === 'BUY' ? 'Place Buy Order' : 'Place Sell Order'}
        </button>
      </form>

      {lastSubmitted && (
        <div className="last-order">
          <span className="last-order-label">Last submitted:</span>
          <span className={`pill ${lastSubmitted.side.toLowerCase()}`}>
            {lastSubmitted.side}
          </span>
          <span>{lastSubmitted.orderType}</span>
          {lastSubmitted.price !== null && <span>@ {lastSubmitted.price}</span>}
          <span>x {lastSubmitted.quantity}</span>
        </div>
      )}
    </div>
  )
}
