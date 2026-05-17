import { useEffect, useRef } from 'react'
import { fetchQuote } from '../api/yahoo'
import { useWatchlistStore } from '../store/watchlistStore'

const INTERVAL_MS = 30_000

export function useQuotes() {
  const symbols = useWatchlistStore(s => s.symbols)
  const alerts = useWatchlistStore(s => s.alerts)
  const quotes = useWatchlistStore(s => s.quotes)
  const setQuote = useWatchlistStore(s => s.setQuote)
  const pushTriggered = useWatchlistStore(s => s.pushTriggered)
  const prevQuotesRef = useRef({})

  async function poll() {
    await Promise.allSettled(
      symbols.map(async ({ symbol }, i) => {
        await new Promise(r => setTimeout(r, i * 300))
        try {
          const q = await fetchQuote(symbol)
          const prev = prevQuotesRef.current[symbol]
          setQuote(symbol, q)
          prevQuotesRef.current[symbol] = q

          const alert = alerts[symbol]
          if (alert && prev) {
            if (alert.target && prev.price < alert.target && q.price >= alert.target) {
              const entry = { symbol, type: 'target', price: q.price, ts: Date.now() }
              pushTriggered(entry)
              notify(`📈 ${symbol} 突破目標價 ${alert.target}！現價 ${q.price.toFixed(2)}`)
            }
            if (alert.stop && prev.price > alert.stop && q.price <= alert.stop) {
              const entry = { symbol, type: 'stop', price: q.price, ts: Date.now() }
              pushTriggered(entry)
              notify(`📉 ${symbol} 跌破停損價 ${alert.stop}！現價 ${q.price.toFixed(2)}`)
            }
          }
        } catch (_) { /* ignore per-symbol errors */ }
      })
    )
  }

  useEffect(() => {
    poll()
    const id = setInterval(poll, INTERVAL_MS)
    return () => clearInterval(id)
  }, [symbols.map(s => s.symbol).join(',')])
}

function notify(msg) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'granted') {
    new Notification('市場警示', { body: msg, icon: '/favicon.ico' })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') new Notification('市場警示', { body: msg })
    })
  }
}
