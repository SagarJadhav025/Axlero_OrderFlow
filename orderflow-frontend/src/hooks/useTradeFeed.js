import { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'

const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`
const MAX_TRADES = 25
const EMPTY_ORDERBOOK = { bids: [], asks: [] }

function normalizeOrderBook(payload = EMPTY_ORDERBOOK) {
  const normalize = (entries = []) => (entries || []).slice(0, 5).map((entry) => ({
    orderId: entry.orderId ?? `${entry.side ?? 'order'}-${entry.price}`,
    side: entry.side ?? 'BUY',
    price: Number(entry.price),
    size: Number(entry.quantity ?? entry.size ?? 0),
    quantity: Number(entry.quantity ?? entry.size ?? 0)
  }))

  return {
    bids: normalize(payload.bids),
    asks: normalize(payload.asks)
  }
}

export function useTradeFeed({ connectTimeoutMs = 3000 } = {}) {
  const [trades, setTrades] = useState([])
  const [status, setStatus] = useState('connecting')
  const [orderBook, setOrderBook] = useState(EMPTY_ORDERBOOK)
  const [orderBookError, setOrderBookError] = useState('')
  const [tradeError, setTradeError] = useState('')

  function addTrade(trade) {
    setTrades((previous) => [trade, ...previous.filter((item) => item.id !== trade.id)].slice(0, MAX_TRADES))
  }

  function loadTrades(entries) {
    setTrades((previous) => {
      const merged = new Map(entries.map((trade) => [trade.id, trade]))
      previous.forEach((trade) => {
        if (!merged.has(trade.id)) merged.set(trade.id, trade)
      })
      return [...merged.values()].slice(0, MAX_TRADES)
    })
  }

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: connectTimeoutMs,
      onConnect: () => {
        setStatus('live')

        client.subscribe('/topic/orderbook', (message) => {
          const orderBookData = normalizeOrderBook(JSON.parse(message.body))
          setOrderBook(orderBookData)
        })

        client.subscribe('/topic/trades', (message) => {
          const execution = JSON.parse(message.body)
          if (!execution.tradeId || !execution.timestamp || !Number.isFinite(Number(execution.price))) {
            return
          }
          addTrade({
            id: execution.tradeId,
            side: execution.side,
            price: Number(execution.price).toFixed(2),
            quantity: execution.quantity,
            timestamp: execution.timestamp
          })
        })
      },
      onStompError: () => setStatus('disconnected'),
      onWebSocketError: () => setStatus('disconnected'),
      onWebSocketClose: () => setStatus('disconnected')
    })

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [connectTimeoutMs])

  useEffect(() => {
    fetch('/api/orderbook')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Order book request failed (${response.status})`)
        return response.json()
      })
      .then((payload) => {
        setOrderBook(normalizeOrderBook(payload))
        setOrderBookError('')
      })
      .catch((error) => {
        setOrderBookError(error.message)
      })
  }, [])

  useEffect(() => {
    fetch('/api/trades')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Recent trades request failed (${response.status})`)
        return response.json()
      })
      .then((entries) => {
        loadTrades(entries.map((execution) => ({
          id: execution.tradeId,
          side: execution.side,
          price: Number(execution.price).toFixed(2),
          quantity: execution.quantity,
          timestamp: execution.timestamp
        })))
        setTradeError('')
      })
      .catch((error) => setTradeError(error.message))
  }, [])

  async function sendOrder(order) {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: `web-${crypto.randomUUID()}`,
        side: order.side,
        orderType: order.orderType,
        price: order.price ?? 0,
        quantity: order.quantity
      })
    })
    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || `Order submission failed (${response.status})`)
    }
    return response.text()
  }

  return { trades, status, sendOrder, orderBook, orderBookError, tradeError }
}