import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_SYMBOLS = [
  { symbol: '2330.TW', name: '台積電', category: 'TW' },
  { symbol: '2317.TW', name: '鴻海', category: 'TW' },
  { symbol: 'AAPL', name: '蘋果', category: 'US' },
  { symbol: 'NVDA', name: '輝達', category: 'US' },
  { symbol: '^GSPC', name: 'S&P 500', category: 'IDX' },
  { symbol: '^IXIC', name: 'NASDAQ', category: 'IDX' },
  { symbol: 'TWDUSD=X', name: '台幣/美元', category: 'FX' },
]

export const useWatchlistStore = create(
  persist(
    (set, get) => ({
      symbols: DEFAULT_SYMBOLS,
      selected: '2330.TW',
      quotes: {},       // { symbol: { price, change, changePct, open, high, low, prev, ts } }
      alerts: {},       // { symbol: { target: null, stop: null } }
      triggeredAlerts: [],
      apiKey: '',

      setSelected: (symbol) => set({ selected: symbol }),
      setApiKey: (key) => set({ apiKey: key }),

      addSymbol: (symbol, name, category) =>
        set(s => ({
          symbols: s.symbols.find(x => x.symbol === symbol)
            ? s.symbols
            : [...s.symbols, { symbol, name, category }],
        })),

      removeSymbol: (symbol) =>
        set(s => ({
          symbols: s.symbols.filter(x => x.symbol !== symbol),
          selected: s.selected === symbol ? (s.symbols[0]?.symbol ?? '') : s.selected,
        })),

      setQuote: (symbol, data) =>
        set(s => ({ quotes: { ...s.quotes, [symbol]: data } })),

      setAlert: (symbol, target, stop) =>
        set(s => ({ alerts: { ...s.alerts, [symbol]: { target, stop } } })),

      pushTriggered: (entry) =>
        set(s => ({ triggeredAlerts: [entry, ...s.triggeredAlerts].slice(0, 50) })),

      clearTriggered: () => set({ triggeredAlerts: [] }),
    }),
    { name: 'market-watch-store', partialize: s => ({ symbols: s.symbols, alerts: s.alerts, apiKey: s.apiKey }) }
  )
)
