import React from 'react';

export default function OrderBook({ bids = [], asks = [] }) {
    return (
        <div style={{ display: 'flex', gap: '20px', fontFamily: 'monospace', padding: '20px', background: '#121212', color: '#fff', minHeight: '100vh' }}>
            {/* Asks Section (Sells) */}
            <div style={{ flex: 1, background: '#1e1e1e', border: '1px solid #ff5555', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ color: '#ff5555', borderBottom: '1px solid #ff5555', paddingBottom: '8px' }}>📉 Asks (Sells)</h3>
                <ul style={{ listStyleType: 'none', padding: 0, margin: '10px 0 0 0' }}>
                    {asks.length === 0 ? (
                        <li style={{ color: '#888' }}>No asks available</li>
                    ) : (
                        asks.map((ask, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2a2a2a' }}>
                                <span>Price: <strong style={{ color: '#ff7777' }}>{ask.price}</strong></span>
                                <span>Qty: <strong>{ask.size}</strong></span>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Bids Section (Buys) */}
            <div style={{ flex: 1, background: '#1e1e1e', border: '1px solid #55ff55', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ color: '#55ff55', borderBottom: '1px solid #55ff55', paddingBottom: '8px' }}>📈 Bids (Buys)</h3>
                <ul style={{ listStyleType: 'none', padding: 0, margin: '10px 0 0 0' }}>
                    {bids.length === 0 ? (
                        <li style={{ color: '#888' }}>No bids available</li>
                    ) : (
                        bids.map((bid, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2a2a2a' }}>
                                <span>Price: <strong style={{ color: '#77ff77' }}>{bid.price}</strong></span>
                                <span>Qty: <strong>{bid.size}</strong></span>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}