import { useState } from 'react'
import { useWatchlistStore } from '../store/watchlistStore'

const CATS = ['ALL', 'TW', 'US', 'IDX', 'FX']

export default function WatchList() {
  const symbols = useWatchlistStore(s => s.symbols)
  const quotes = useWatchlistStore(s => s.quotes)
  const selected = useWatchlistStore(s => s.selected)
  const setSelected = useWatchlistStore(s => s.setSelected)
  const addSymbol = useWatchlistStore(s => s.addSymbol)
  const removeSymbol = useWatchlistStore(s => s.removeSymbol)
  const [cat, setCat] = useState('ALL')
  const [addDraft, setAddDraft] = useState({ symbol: '', name: '', category: 'TW' })
  const [showAdd, setShowAdd] = useState(false)

  const filtered = cat === 'ALL' ? symbols : symbols.filter(s => s.category === cat)

  return (
    <aside className="watchlist">
      <div className="wl-header">
        <span className="wl-title">自選清單</span>
        <button className="ibtn-sm" onClick={() => setShowAdd(v => !v)}>＋</button>
      </div>

      <div className="cat-tabs">
        {CATS.map(c => (
          <button key={c} className={`cat-tab ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="add-form">
          <input placeholder="代號 e.g. 0050.TW" value={addDraft.symbol} onChange={e => setAddDraft(d => ({ ...d, symbol: e.target.value }))} />
          <input placeholder="名稱 e.g. 元大50" value={addDraft.name} onChange={e => setAddDraft(d => ({ ...d, name: e.target.value }))} />
          <select value={addDraft.category} onChange={e => setAddDraft(d => ({ ...d, category: e.target.value }))}>
            <option value="TW">台股</option><option value="US">美股</option>
            <option value="IDX">指數</option><option value="FX">外匯</option>
          </select>
          <button onClick={() => {
            if (addDraft.symbol && addDraft.name) {
              addSymbol(addDraft.symbol.trim().toUpperCase(), addDraft.name, addDraft.category)
              setAddDraft({ symbol: '', name: '', category: 'TW' })
              setShowAdd(false)
            }
          }}>新增</button>
        </div>
      )}

      <ul className="wl-list">
        {filtered.map(({ symbol, name }) => {
          const q = quotes[symbol]
          const up = q && q.change >= 0
          return (
            <li key={symbol} className={`wl-item ${selected === symbol ? 'active' : ''}`} onClick={() => setSelected(symbol)}>
              <div className="wl-left">
                <div className="wl-name">{name}</div>
                <div className="wl-symbol mono">{symbol}</div>
              </div>
              <div className="wl-right">
                {q ? (
                  <>
                    <div className={`wl-price mono ${up ? 'up' : 'dn'}`}>{q.price?.toFixed(2)}</div>
                    <div className={`wl-chg ${up ? 'up' : 'dn'}`}>
                      {up ? '▲' : '▼'}{Math.abs(q.changePct).toFixed(2)}%
                    </div>
                  </>
                ) : <div className="loading-dot" />}
              </div>
              <button className="del-btn" onClick={e => { e.stopPropagation(); removeSymbol(symbol) }}>✕</button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
