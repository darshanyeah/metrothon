// src/components/Header.jsx
import { useTransit } from '../context/TransitContext'

const NAV_TABS = [
  { id: 'planner',    label: 'Journey Planner',  icon: '🗺️',  subtitle: 'Citizen Flow'    },
  { id: 'settlement', label: 'Clearinghouse',    icon: '⚖️',  subtitle: 'Operator Flow'   },
  { id: 'smart',      label: 'Smart Features',   icon: '✨',  subtitle: 'Differentiators' },
  { id: 'pitch',      label: 'Pitch Deck',       icon: '🏆',  subtitle: 'Judging Showcase' },
]

export default function Header() {
  const { activeView, setView, effectivelyOnline, isOnline, offlineSimulated, toggleOfflineSim, firebaseConnected } = useTransit()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      {/* Offline simulation banner */}
      {offlineSimulated && (
        <div className="offline-bar animate-fade-in">
          ✈️ &nbsp;AIRPLANE MODE SIMULATED — App running from IndexedDB cache &nbsp;·&nbsp; Real-time sync paused
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-lg shadow-lg shadow-orange-500/30">
              🚇
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">
                One City, One Journey
              </h1>
              <p className="text-xs text-slate-500 leading-tight">
                Gujarat Multimodal Transit · PS-08
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Firebase / network status pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-500 ${
              effectivelyOnline
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${effectivelyOnline ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
              {effectivelyOnline
                ? (firebaseConnected ? 'Firebase Live' : 'Cache Mode')
                : 'Offline — IndexedDB'}
            </div>

            {/* Offline simulate toggle */}
            <button
              onClick={toggleOfflineSim}
              title="Simulate Airplane Mode for judges"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                offlineSimulated
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              ✈️ <span className="hidden sm:inline">{offlineSimulated ? 'Go Online' : 'Airplane Mode'}</span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-1 pb-0 -mb-px overflow-x-auto">
          {NAV_TABS.map((tab) => {
            const isActive = activeView === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`hidden sm:inline text-xs px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-600'
                }`}>
                  {tab.subtitle}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
