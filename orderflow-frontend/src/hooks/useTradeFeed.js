import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'

const WS_URL = 'ws://localhost:8081/ws'
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

export function useTradeFeed({ connectTimeoutMs = 3000 } = {}) {
  const [trades, setTrades] = useState([])
  const [status, setStatus] = useState('connecting')
  const clientRef = useRef(null)
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

    const client = new Client({
      brokerURL: WS_URL,
      onConnect: () => {
        clearTimeout(fallbackTimer)
        stopSimulation()
        setStatus('live')

        // Listen to the exact OrderBook channel we built in Spring Boot!
        client.subscribe('/topic/orderbook', (message) => {
          const orderBookData = JSON.parse(message.body)
          console.log("LIVE ENGINE UPDATE:", orderBookData)

          // Push a trade to the UI to prove the live connection is working
          if (orderBookData.bids.length > 0) {
            const topBid = orderBookData.bids[0];
            addTrade({
              id: topBid.orderId,
              side: topBid.side,
              price: topBid.price,
              quantity: topBid.quantity,
              timestamp: new Date().toISOString()
            });
          }
        })
      },
      onWebSocketError: () => {
        setStatus('error')
        startSimulation()
      },
      onWebSocketClose: () => {
        startSimulation()
      }
    })

    client.activate()
    clientRef.current = client

    return () => {
      clearTimeout(fallbackTimer)
      stopSimulation()
      client.deactivate()
    }
  }, [connectTimeoutMs])

  function sendOrder(order) {
    // Reflect the order locally so the Recent Trades panel demonstrates the flow
    addTrade({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      side: order.side,
      price: order.price ?? '(market)',
      quantity: order.quantity,
      timestamp: order.timestamp || new Date().toISOString()
    })
    return true
  }

  return { trades, status, sendOrder }
}