import React, { useEffect, useRef } from 'react';
import { fmtPrice } from './format.js';

const ROW = 20;
const LEVELS = 15;

export default function OrderBookCanvas({ depth }) {
  const canvasRef = useRef(null);
  const perfRef = useRef(null);
  const avg = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !depth) return;
    const t0 = performance.now();

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = (LEVELS * 2 + 2) * ROW;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.font = '12px ui-monospace, Menlo, Consolas, monospace';
    ctx.textBaseline = 'middle';

    const bids = depth.bids;
    const asks = depth.asks;
    const max = Math.max(1, ...bids.map((l) => l[1]), ...asks.map((l) => l[1]));

    const drawRow = (level, y, color, bar) => {
      ctx.fillStyle = bar;
      ctx.fillRect(w - (level[1] / max) * w, y, (level[1] / max) * w, ROW - 2);
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.fillText(fmtPrice(level[0]), 8, y + ROW / 2);
      ctx.fillStyle = '#d6dbe0';
      ctx.textAlign = 'right';
      ctx.fillText(String(level[1]), w - 8, y + ROW / 2);
    };

    // asks: best ask sits just above the spread line, worse prices further up
    for (let i = 0; i < Math.min(LEVELS, asks.length); i++) {
      drawRow(asks[i], (LEVELS - 1 - i) * ROW, '#ef5350', 'rgba(239,83,80,0.25)');
    }
    const spreadY = LEVELS * ROW;
    ctx.fillStyle = '#8b949e';
    ctx.textAlign = 'center';
    if (bids.length && asks.length) ctx.fillText(`Spread ${fmtPrice(asks[0][0] - bids[0][0])}`, w / 2, spreadY + ROW / 2);
    for (let i = 0; i < Math.min(LEVELS, bids.length); i++) {
      drawRow(bids[i], spreadY + ROW + i * ROW, '#26a69a', 'rgba(38,166,154,0.25)');
    }

    const ms = performance.now() - t0;
    avg.current = avg.current ? avg.current * 0.9 + ms * 0.1 : ms;
    if (perfRef.current) perfRef.current.textContent = `Canvas draw: ${ms.toFixed(2)} ms (avg ${avg.current.toFixed(2)} ms)`;
  }, [depth]);

  return (
    <section className="panel">
      <h2>Order Book <small>(HTML5 Canvas)</small></h2>
      <canvas ref={canvasRef} className="book-canvas" />
      <div className="perf" ref={perfRef} />
    </section>
  );
}
