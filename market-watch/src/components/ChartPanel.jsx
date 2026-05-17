import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'
import { fetchOHLC } from '../api/yahoo'
import { useWatchlistStore } from '../store/watchlistStore'
import { useTechIndicators } from '../hooks/useTechIndicators'
import TechSignal from './TechSignal'

const RANGES = ['1mo', '3mo', '6mo', '1y']

export default function ChartPanel() {
  const selected = useWatchlistStore(s => s.selected)
  const symbols = useWatchlistStore(s => s.symbols)
  const info = symbols.find(s => s.symbol === selected)
  const chartRef = useRef(null)
  const containerRef = useRef(null)
  const seriesRef = useRef(null)
  const [range, setRange] = useState('3mo')
  const [candles, setCandles] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  const tech = useTechIndicators(candles)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#5F5F5F',
        fontSize: 11,
      },
      grid: { vertLines: { color: 'rgba(0,0,0,.06)' }, horzLines: { color: 'rgba(0,0,0,.06)' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      handleScroll: true,
      handleScale: true,
    })
    chartRef.current = chart
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26A69A', downColor: '#EF5350',
      borderUpColor: '#26A69A', borderDownColor: '#EF5350',
      wickUpColor: '#26A69A', wickDownColor: '#EF5350',
    })
    seriesRef.current = series

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight })
      }
    })
    ro.observe(containerRef.current)
    return () => { ro.disconnect(); chart.remove() }
  }, [])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setLoading(true)
    setFetchError(null)
    fetchOHLC(selected, range)
      .then(data => {
        if (cancelled) return
        const sorted = data.sort((a, b) => a.time - b.time)
        setCandles(sorted)
        if (seriesRef.current) {
          seriesRef.current.setData(sorted.map(c => ({ ...c, time: c.time })))
          chartRef.current?.timeScale().fitContent()
        }
      })
      .catch(e => {
        if (!cancelled) setFetchError(e.message)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selected, range, retryKey])

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <div>
          <span className="chart-title">{info?.name ?? selected}</span>
          <span className="chart-symbol mono"> {selected}</span>
        </div>
        <div className="range-tabs">
          {RANGES.map(r => (
            <button key={r} className={`range-tab ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="chart-container">
        {loading && <div className="chart-overlay">載入中…</div>}
        {!loading && fetchError && (
          <div className="chart-error-overlay">
            <div className="chart-error-msg">⚠ {fetchError.includes('429') ? 'Yahoo Finance 暫時限流，請稍後重試' : fetchError}</div>
            <button className="retry-btn" onClick={() => setRetryKey(k => k + 1)}>重試</button>
          </div>
        )}
      </div>
      {tech && <TechSignal tech={tech} />}
    </div>
  )
}
