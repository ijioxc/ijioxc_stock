const BASE = '/api/yahoo'
const ohlcCache = new Map()
const CACHE_TTL = 5 * 60 * 1000

export async function fetchQuote(symbol) {
  const url = `${BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Yahoo Finance error ${res.status}`)
  const json = await res.json()
  const meta = json?.chart?.result?.[0]?.meta
  if (!meta) throw new Error('No data')
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice
  const price = meta.regularMarketPrice
  const change = price - prev
  const changePct = prev ? (change / prev) * 100 : 0
  return {
    price,
    change,
    changePct,
    open: meta.regularMarketOpen,
    high: meta.regularMarketDayHigh,
    low: meta.regularMarketDayLow,
    prev,
    volume: meta.regularMarketVolume,
    currency: meta.currency,
    ts: meta.regularMarketTime,
  }
}

export async function fetchOHLC(symbol, range = '3mo', interval = '1d', retries = 3) {
  const cacheKey = `${symbol}|${range}|${interval}`
  const cached = ohlcCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const url = `${BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`
  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
    const res = await fetch(url)
    if (res.status === 429 && attempt < retries - 1) continue
    if (!res.ok) throw new Error(`Yahoo Finance error ${res.status}`)
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) throw new Error('No OHLC data')
    const { timestamp, indicators } = result
    const q = indicators.quote[0]
    const data = timestamp.map((t, i) => ({
      time: t,
      open: q.open[i],
      high: q.high[i],
      low: q.low[i],
      close: q.close[i],
      volume: q.volume[i],
    })).filter(c => c.open != null)
    ohlcCache.set(cacheKey, { data, ts: Date.now() })
    return data
  }
  throw new Error('Yahoo Finance 請求次數過多，請稍後再試')
}

