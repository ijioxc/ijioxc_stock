import { useMemo } from 'react'

function ema(arr, period) {
  const k = 2 / (period + 1)
  const result = []
  let prev = null
  for (const v of arr) {
    if (v == null) { result.push(null); continue }
    if (prev === null) { prev = v; result.push(v); continue }
    prev = v * k + prev * (1 - k)
    result.push(prev)
  }
  return result
}

function sma(arr, period) {
  return arr.map((_, i) => {
    if (i < period - 1) return null
    const slice = arr.slice(i - period + 1, i + 1)
    if (slice.some(v => v == null)) return null
    return slice.reduce((a, b) => a + b, 0) / period
  })
}

export function useTechIndicators(candles) {
  return useMemo(() => {
    if (!candles || candles.length < 26) return null
    const closes = candles.map(c => c.close)
    const highs = candles.map(c => c.high)
    const lows = candles.map(c => c.low)

    // MACD
    const ema12 = ema(closes, 12)
    const ema26 = ema(closes, 26)
    const macdLine = ema12.map((v, i) => (v != null && ema26[i] != null) ? v - ema26[i] : null)
    const signalLine = ema(macdLine.filter(v => v != null), 9)
    const lastMacd = macdLine.filter(v => v != null).slice(-1)[0] ?? 0
    const lastSignal = signalLine.slice(-1)[0] ?? 0
    const macdSignal = lastMacd > lastSignal ? '金叉（看多）' : lastMacd < lastSignal ? '死叉（看空）' : '中立'

    // KD (9-day)
    const period = 9
    const rsvArr = closes.map((_, i) => {
      if (i < period - 1) return 50
      const sliceH = highs.slice(i - period + 1, i + 1)
      const sliceL = lows.slice(i - period + 1, i + 1)
      const hh = Math.max(...sliceH)
      const ll = Math.min(...sliceL)
      return hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100
    })
    let K = 50, D = 50
    const Ks = [], Ds = []
    for (const rsv of rsvArr) {
      K = (2 / 3) * K + (1 / 3) * rsv
      D = (2 / 3) * D + (1 / 3) * K
      Ks.push(K)
      Ds.push(D)
    }
    const lastK = Ks[Ks.length - 1]
    const lastD = Ds[Ds.length - 1]
    const prevK = Ks[Ks.length - 2]
    const prevD = Ds[Ds.length - 2]
    let kdSignal = '中立'
    if (prevK <= prevD && lastK > lastD && lastK < 50) kdSignal = '低檔金叉（買訊）'
    else if (prevK >= prevD && lastK < lastD && lastK > 50) kdSignal = '高檔死叉（賣訊）'
    else if (lastK > lastD) kdSignal = 'K>D（偏多）'
    else kdSignal = 'K<D（偏空）'

    // MA
    const ma5 = sma(closes, 5).slice(-1)[0]
    const ma20 = sma(closes, 20).slice(-1)[0]
    const ma60 = closes.length >= 60 ? sma(closes, 60).slice(-1)[0] : null
    const lastClose = closes[closes.length - 1]
    let maStatus = '均線多頭排列'
    if (ma5 && ma20) {
      if (lastClose > ma5 && ma5 > ma20) maStatus = '多頭排列（均線支撐）'
      else if (lastClose < ma5 && ma5 < ma20) maStatus = '空頭排列（均線壓力）'
      else maStatus = '均線糾結（盤整）'
    }

    const trend = lastClose > (ma20 ?? lastClose) ? '中期上升趨勢' : '中期下降趨勢'

    return {
      trend,
      kdSignal,
      macdSignal,
      maStatus,
      lastK: lastK.toFixed(1),
      lastD: lastD.toFixed(1),
      lastMacd: lastMacd.toFixed(3),
      lastSignal: lastSignal.toFixed(3),
      ma5: ma5?.toFixed(2),
      ma20: ma20?.toFixed(2),
      ma60: ma60?.toFixed(2),
    }
  }, [candles])
}
