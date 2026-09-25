import { useEffect, useRef, useState } from 'react'

// Update this once the backend team (Member 3) shares the real Market Data
// Gateway URL. It can also be overridden with an env var:
//   VITE_WS_URL=ws://your-backend-host:8080/ws/trades
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/trades'

const MAX_TRADES = 25
const SIDES = ['BUY', 'SELL']

function randomTrade() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    side: SIDES[Math.floor(Math.random() * SIDES.length)],
    price: (100 + Math.random() * 50).toFixed(2),
    quantity: Math.floor(1 + Math.random() * 50),
    timestamp: new Date().toISOString()
  }
}

/**
 * Connects to the backend trade feed over WebSocket.
 * If the connection can't be established within `connectTimeoutMs`,
 * it falls back to a simulated feed so the UI is still demoable
 * before the real Market Data Gateway is ready.
 */
export function useTradeFeed({ connectTimeoutMs = 3000 } = {}) {
  const [trades, setTrades] = useState([])
  const [status, setStatus] = useState('connecting') // connecting | live | simulated | error
  const socketRef = useRef(null)
  const simulatorRef = useRef(null)

  function addTrade(trade) {
    setTrades((prev) => [trade, ...prev].slice(0, MAX_TRADES))
  }

  function startSimulation() {
    if (simulatorRef.current) return
    setStatus('simulated')
    simulatorRef.current = setInterval(() => {
      addTrade(randomTrade())
    }, 1200)
  }

  function stopSimulation() {
    if (simulatorRef.current) {
      clearInterval(simulatorRef.current)
      simulatorRef.current = null
    }
  }

  useEffect(() => {
    let fallbackTimer = setTimeout(startSimulation, connectTimeoutMs)

    try {
      const socket = new WebSocket(WS_URL)
      socketRef.current = socket

      socket.onopen = () => {
        clearTimeout(fallbackTimer)
        stopSimulation()
        setStatus('live')
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          addTrade({
            id: data.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            side: data.side,
            price: data.price,
            quantity: data.quantity,
            timestamp: data.timestamp ?? new Date().toISOString()
          })
        } catch {
          // Ignore malformed messages rather than crashing the feed
        }
      }

      socket.onerror = () => {
        setStatus('error')
        startSimulation()
      }

      socket.onclose = () => {
        startSimulation()
      }
    } catch {
      startSimulation()
    }

    return () => {
      clearTimeout(fallbackTimer)
      stopSimulation()
      socketRef.current?.close()
    }
  }, [connectTimeoutMs])

  function sendOrder(order) {
    const socket = socketRef.current
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(order))
      return true
    }
    // Backend not connected yet — reflect the order locally so the
    // Recent Trades panel still demonstrates the flow.
    addTrade({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      side: order.side,
      price: order.price ?? '(market)',
      quantity: order.quantity,
      timestamp: order.timestamp
    })
    return false
  }

  return { trades, status, sendOrder }
}
