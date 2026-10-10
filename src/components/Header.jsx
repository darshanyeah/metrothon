// src/components/Header.jsx
import { useTransit } from '../context/TransitContext'

export default function Header() {
  const { 
    activeView, 
    setView, 
    effectivelyOnline, 
    offlineSimulated, 
    toggleOfflineSim, 
    firebaseConnected,
    language,
    toggleLanguage,
    accessibilityMode,
    toggleAccessibility,
    offlineQueue,
    isReconciling,
    t
  } = useTransit()

  const NAV_TABS = [
    { id: 'planner',    label: t('nav.planner'),       icon: '🗺️',  subtitle: t('subtitles.citizen')       },
    { id: 'settlement', label: t('nav.clearinghouse'), icon: '⚖️',  subtitle: t('subtitles.operator')      },
    { id: 'inspector',  label: t('nav.inspector'),     icon: '🛡️',  subtitle: t('subtitles.inspector')     },
    { id: 'smart',      label: t('nav.smart'),         icon: '✨',  subtitle: t('subtitles.differentiators')},
    { id: 'pitch',      label: t('nav.pitch'),         icon: '🏆',  subtitle: t('subtitles.pitch')          },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      {/* Offline simulation banner */}
      {offlineSimulated && (
        <div className="offline-bar animate-fade-in flex items-center justify-center gap-2">
          <span>✈️</span>
          <span>
            {language === 'gu'
              ? 'નેટવર્ક ડ્રોપ સિમ્યુલેટેડ — ઍપ IndexedDB ઑફલાઇન કેશથી કાર્યરત છે'
              : 'AIRPLANE MODE SIMULATED — App running from IndexedDB cache · Outbox queue active'}
          </span>
          {offlineQueue.length > 0 && (
            <span className="bg-amber-900 text-amber-100 text-xs px-2 py-0.5 rounded-full font-bold ml-2">
              {offlineQueue.length} tx queued
            </span>
          )}
        </div>
      )}

      {/* Auto-reconciling banner */}
      {isReconciling && (
        <div className="bg-cyan-500 text-slate-950 text-xs font-bold py-1 text-center animate-pulse">
          🔄 {t('status.reconciling')}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Govt Banner */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-lg shadow-lg shadow-orange-500/30">
              🚇
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white leading-tight tracking-tight">
                  {t('appTitle')}
                </h1>
                <span className="hidden md:inline-block text-[10px] bg-slate-800 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md font-semibold">
                  {t('govBadge')}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-tight">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Divyangjan / Accessibility Toggle */}
            <button
              onClick={toggleAccessibility}
              title="Toggle Divyangjan / Step-Free Accessible Transit Mode"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                accessibilityMode
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              <span>♿</span>
              <span className="hidden md:inline">{accessibilityMode ? 'દિવ્યાંગજન Mode' : 'Accessibility'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              title="Switch Language: English / ગુજરાતી"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all"
            >
              <span>🌐</span>
              <span>{language === 'en' ? 'ગુજરાતી' : 'English'}</span>
            </button>

            {/* Firebase / network status pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-500 ${
              effectivelyOnline
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${effectivelyOnline ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
              {effectivelyOnline
                ? (firebaseConnected ? t('status.online') : 'Cache Active')
                : t('status.offline')}
            </div>

            {/* Offline simulate toggle */}
            <button
              onClick={toggleOfflineSim}
              title="Simulate network drop for hackathon presentation"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                offlineSimulated
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              <span>✈️</span>
              <span className="hidden sm:inline">{offlineSimulated ? t('status.goOnline') : t('status.airplane')}</span>
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
                className={`flex items-center gap-2 px-3.5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${
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
