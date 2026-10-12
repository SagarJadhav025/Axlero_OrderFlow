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
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

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

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setSuccess('')
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
    setSuccess('')
    setSubmitting(true)
    try {
      await onSubmitOrder(order)
      setLastSubmitted(order)
      setSuccess('Order accepted by backend. Executed trades will appear here when matched.')
      setForm((prev) => ({ ...initialState, side: prev.side, orderType: prev.orderType }))
    } catch (submissionError) {
      setError(submissionError.message || 'Order could not be submitted.')
    } finally {
      setSubmitting(false)
    }
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
        {success && <p className="form-success">{success}</p>}

        <button type="submit" className={`submit-btn ${form.side.toLowerCase()}`} disabled={submitting}>
          {submitting ? 'Submitting…' : form.side === 'BUY' ? 'Place Buy Order' : 'Place Sell Order'}
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
