export default function TechSignal({ tech }) {
  if (!tech) return null
  const { trend, kdSignal, macdSignal, maStatus, lastK, lastD, lastMacd, lastSignal, ma5, ma20, ma60 } = tech

  const isBull = trend.includes('上升')

  return (
    <div className="tech-panel">
      <div className={`trend-badge ${isBull ? 'up-bg up' : 'dn-bg dn'}`}>
        {isBull ? '↑' : '↓'} {trend}
      </div>
      <div className="tech-grid">
        <div className="tech-item">
          <div className="tech-label">KD</div>
          <div className="tech-val mono">K:{lastK} D:{lastD}</div>
          <div className="tech-sig">{kdSignal}</div>
        </div>
        <div className="tech-item">
          <div className="tech-label">MACD</div>
          <div className="tech-val mono">{lastMacd} / {lastSignal}</div>
          <div className="tech-sig">{macdSignal}</div>
        </div>
        <div className="tech-item">
          <div className="tech-label">均線</div>
          <div className="tech-val mono">5:{ma5 ?? '-'} 20:{ma20 ?? '-'}{ma60 ? ` 60:${ma60}` : ''}</div>
          <div className="tech-sig">{maStatus}</div>
        </div>
      </div>
    </div>
  )
}
