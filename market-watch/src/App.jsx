import { useState } from 'react'
import NavBar from './components/NavBar'
import WatchList from './components/WatchList'
import ChartPanel from './components/ChartPanel'
import AdvisorChat from './components/AdvisorChat'
import AlertPanel from './components/AlertPanel'
import { useQuotes } from './hooks/useQuotes'
import { useWatchlistStore } from './store/watchlistStore'
import './App.css'

function QuotesRunner() {
  useQuotes()
  return null
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [rightTab, setRightTab] = useState('advisor')
  const triggeredAlerts = useWatchlistStore(s => s.triggeredAlerts)

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <QuotesRunner />
      {triggeredAlerts.length > 0 && (
        <div className="alert-banner">
          {triggeredAlerts[0].type === 'target' ? '📈' : '📉'}&nbsp;
          {triggeredAlerts[0].symbol}&nbsp;
          {triggeredAlerts[0].type === 'target' ? '突破目標價' : '跌破停損價'}&nbsp;
          {triggeredAlerts[0].price?.toFixed(2)}
        </div>
      )}
      <NavBar darkMode={darkMode} onToggleDark={() => setDarkMode(v => !v)} />
      <div className="main-layout">
        <WatchList />
        <div className="center-col">
          <ChartPanel />
        </div>
        <div className="right-col">
          <div className="right-tabs">
            <button className={`r-tab ${rightTab === 'advisor' ? 'active' : ''}`} onClick={() => setRightTab('advisor')}>AI 顧問</button>
            <button className={`r-tab ${rightTab === 'alert' ? 'active' : ''}`} onClick={() => setRightTab('alert')}>盯盤警示</button>
          </div>
          {rightTab === 'advisor' ? <AdvisorChat /> : <AlertPanel />}
        </div>
      </div>
    </div>
  )
}
