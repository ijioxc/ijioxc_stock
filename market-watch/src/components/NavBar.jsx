import { useState } from 'react'
import { useWatchlistStore } from '../store/watchlistStore'

export default function NavBar({ darkMode, onToggleDark }) {
  const apiKey = useWatchlistStore(s => s.apiKey)
  const setApiKey = useWatchlistStore(s => s.setApiKey)
  const [showKey, setShowKey] = useState(false)
  const [draft, setDraft] = useState(apiKey)
  const triggeredAlerts = useWatchlistStore(s => s.triggeredAlerts)
  const clearTriggered = useWatchlistStore(s => s.clearTriggered)

  return (
    <nav className="navbar">
      <div className="logo">
        <div className="logo-mark">
          <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
        </div>
        <div>
          <div className="logo-txt">MarketWatch</div>
          <div className="logo-sub">自動盯盤 · 投資顧問</div>
        </div>
      </div>

      <div className="live-badge">
        <span className="live-dot" />
        LIVE
      </div>

      {triggeredAlerts.length > 0 && (
        <button className="alert-badge" onClick={clearTriggered} title="點擊清除">
          ⚠ {triggeredAlerts.length} 個警示
        </button>
      )}

      <div className="nav-right">
        <button className="ibtn" onClick={() => setShowKey(v => !v)} title="設定 API Key">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
        <button className="ibtn" onClick={onToggleDark} title={darkMode ? '切換亮色' : '切換暗色'}>
          {darkMode ? '☀' : '🌙'}
        </button>
      </div>

      {showKey && (
        <div className="key-modal" onClick={() => setShowKey(false)}>
          <div className="key-panel" onClick={e => e.stopPropagation()}>
            <h3>設定 Claude API Key</h3>
            <p className="key-hint">Key 僅存於本機 localStorage，不會上傳</p>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={draft}
              onChange={e => setDraft(e.target.value)}
            />
            <div className="key-actions">
              <button onClick={() => { setApiKey(draft); setShowKey(false) }}>儲存</button>
              <button className="ghost" onClick={() => setShowKey(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
