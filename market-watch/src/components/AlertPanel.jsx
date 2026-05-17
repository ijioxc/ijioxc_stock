import { useState } from 'react'
import { useWatchlistStore } from '../store/watchlistStore'

export default function AlertPanel() {
  const selected = useWatchlistStore(s => s.selected)
  const alerts = useWatchlistStore(s => s.alerts)
  const setAlert = useWatchlistStore(s => s.setAlert)
  const triggeredAlerts = useWatchlistStore(s => s.triggeredAlerts)
  const clearTriggered = useWatchlistStore(s => s.clearTriggered)
  const quotes = useWatchlistStore(s => s.quotes)

  const current = alerts[selected] ?? { target: '', stop: '' }
  const [target, setTarget] = useState(current.target ?? '')
  const [stop, setStop] = useState(current.stop ?? '')

  const q = quotes[selected]
  const hasTarget = current.target != null && current.target !== ''
  const hasStop = current.stop != null && current.stop !== ''

  function save() {
    setAlert(selected, target !== '' ? Number(target) : null, stop !== '' ? Number(stop) : null)
  }

  return (
    <div className="alert-panel">
      <div className="ap-header">
        <span className="ap-title">盯盤警示</span>
        {triggeredAlerts.length > 0 && (
          <button className="ghost-sm" onClick={clearTriggered}>清除({triggeredAlerts.length})</button>
        )}
      </div>

      {q && (
        <div className="ap-current mono">現價 <span className={q.change >= 0 ? 'up' : 'dn'}>{q.price?.toFixed(2)}</span></div>
      )}

      <div className="ap-row">
        <label>目標價</label>
        <input type="number" placeholder="e.g. 1000" value={target} onChange={e => setTarget(e.target.value)} />
        {hasTarget && <span className="ap-set up">已設 {current.target}</span>}
      </div>
      <div className="ap-row">
        <label>停損價</label>
        <input type="number" placeholder="e.g. 800" value={stop} onChange={e => setStop(e.target.value)} />
        {hasStop && <span className="ap-set dn">已設 {current.stop}</span>}
      </div>
      <button className="save-btn" onClick={save}>儲存設定</button>

      {triggeredAlerts.length > 0 && (
        <ul className="triggered-list">
          {triggeredAlerts.slice(0, 5).map((a, i) => (
            <li key={i} className={a.type === 'target' ? 'up' : 'dn'}>
              {a.type === 'target' ? '📈' : '📉'} {a.symbol} {a.type === 'target' ? '突破目標' : '跌破停損'}
              <span className="mono"> {a.price?.toFixed(2)}</span>
              <span className="ts">{new Date(a.ts).toLocaleTimeString('zh-TW')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
