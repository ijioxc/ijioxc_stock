import { useState } from 'react'
import { askAdvisor } from '../api/claude'
import { useWatchlistStore } from '../store/watchlistStore'
import { fetchOHLC } from '../api/yahoo'

export default function AdvisorChat() {
  const selected = useWatchlistStore(s => s.selected)
  const symbols = useWatchlistStore(s => s.symbols)
  const quotes = useWatchlistStore(s => s.quotes)
  const apiKey = useWatchlistStore(s => s.apiKey)
  const info = symbols.find(s => s.symbol === selected)

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [input, setInput] = useState('')

  async function ask() {
    if (!selected) return
    setLoading(true)
    setError('')
    try {
      const candles = await fetchOHLC(selected, '3mo')
      const tech = computeTech(candles)
      const quote = quotes[selected] ?? {}
      const reply = await askAdvisor({
        apiKey,
        name: info?.name ?? selected,
        symbol: selected,
        quote,
        techSignal: tech ?? { trend: '-', kdSignal: '-', macdSignal: '-', maStatus: '-' },
        recentCandles: candles,
      })
      setMessages(m => [...m, { role: 'user', text: `分析 ${info?.name ?? selected}` }, { role: 'ai', text: reply }])
      setInput('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function sendCustom() {
    if (!input.trim() || !apiKey) return
    setLoading(true)
    setError('')
    const userMsg = input
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: '你是一位專業的台灣股市與全球金融市場投資顧問，擅長技術分析與基本面分析，回覆使用繁體中文，語氣專業但親切。',
          messages: [{ role: 'user', content: userMsg }],
        }),
      })
      if (!res.ok) throw new Error(`API 錯誤 ${res.status}`)
      const data = await res.json()
      setMessages(m => [...m, { role: 'ai', text: data.content?.[0]?.text ?? '無回應' }])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="advisor-panel">
      <div className="adv-header">
        <span className="adv-title">AI 投資顧問</span>
        <span className="adv-model mono">claude-sonnet-4-6</span>
      </div>

      {!apiKey && (
        <div className="adv-notice">請點右上角設定 Claude API Key 後使用顧問功能</div>
      )}

      <div className="adv-messages">
        {messages.length === 0 && (
          <div className="adv-empty">點擊「分析當前標的」獲取 AI 投資建議</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`adv-msg ${m.role}`}>
            <div className="msg-role">{m.role === 'user' ? '你' : '顧問'}</div>
            <div className="msg-text">{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="adv-msg ai">
            <div className="msg-role">顧問</div>
            <div className="msg-text typing">分析中<span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span></div>
          </div>
        )}
      </div>

      {error && <div className="adv-error">{error}</div>}

      <div className="adv-actions">
        <button className="analyze-btn" onClick={ask} disabled={loading || !apiKey}>
          📊 分析當前標的
        </button>
      </div>

      <div className="adv-input-row">
        <input
          placeholder="自訂問題…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendCustom()}
          disabled={loading || !apiKey}
        />
        <button onClick={sendCustom} disabled={loading || !apiKey || !input.trim()}>送出</button>
      </div>
    </div>
  )
}

function computeTech(candles) {
  if (!candles || candles.length < 26) return null
  const closes = candles.map(c => c.close)
  const k = 2 / (26 + 1)
  let e = closes[0]
  const ema26 = closes.map(v => { e = v * k + e * (1 - k); return e })
  const k2 = 2 / (12 + 1)
  let e2 = closes[0]
  const ema12 = closes.map(v => { e2 = v * k2 + e2 * (1 - k2); return e2 })
  const macd = ema12.map((v, i) => v - ema26[i])
  const k3 = 2 / 10
  let sig = macd[0]
  const signal = macd.map(v => { sig = v * k3 + sig * (1 - k3); return sig })
  const lastMacd = macd[macd.length - 1]
  const lastSig = signal[signal.length - 1]
  const macdSignal = lastMacd > lastSig ? '金叉（看多）' : '死叉（看空）'
  const last = closes[closes.length - 1]
  const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20
  const trend = last > ma20 ? '中期上升趨勢' : '中期下降趨勢'
  return { trend, kdSignal: '-', macdSignal, maStatus: '-' }
}
