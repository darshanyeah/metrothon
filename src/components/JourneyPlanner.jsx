// src/components/JourneyPlanner.jsx
import { useState } from 'react'
import { useTransit } from '../context/TransitContext'
import { MODE_META, CITY_STATS } from '../data/mockRoutes'
import QRPassModal from './QRPassModal'

// ─── Small sub-components ──────────────────────────────────────────────────────

function ModeBadge({ mode }) {
  const meta = MODE_META[mode]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.bgClass}`}>
      {meta.icon} {meta.shortLabel}
    </span>
  )
}

function StatCard({ icon, label, value, subValue, color }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-1">
      <div className="text-2xl">{icon}</div>
      <div className={`text-xl font-bold ${color || 'text-white'}`}>{value}</div>
      {subValue && <div className="text-xs text-slate-500">{subValue}</div>}
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}

function LegCard({ leg, index, isLast, accessibilityMode }) {
  const meta = MODE_META[leg.mode]
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex gap-3">
      {/* Timeline track */}
      <div className="flex flex-col items-center">
        {/* Circle node */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 border-2 border-slate-900 flex-shrink-0"
          style={{ backgroundColor: meta.color + '33', borderColor: meta.color, color: meta.color }}
        >
          {meta.icon}
        </div>
        {/* Vertical connector */}
        {!isLast && (
          <div className={`w-0.5 flex-1 my-1 ${meta.trackClass} opacity-60`} style={{ minHeight: '2rem' }} />
        )}
      </div>

      {/* Card content */}
      <div
        className={`flex-1 glass-card p-3.5 mb-3 cursor-pointer hover:border-slate-600 transition-all duration-200 ${expanded ? 'border-slate-600' : ''}`}
        onClick={() => setExpanded(!expanded)}
        style={{ borderLeftWidth: '3px', borderLeftColor: meta.color }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <ModeBadge mode={leg.mode} />
              {leg.duration > 0 && (
                <span className="text-xs text-slate-400">⏱ {leg.duration} min</span>
              )}
              {leg.distance > 0 && (
                <span className="text-xs text-slate-400">📍 {leg.distance} km</span>
              )}
              {leg.fareComponent > 0 && (
                <span className="text-xs text-green-400 font-semibold">₹{leg.fareComponent}</span>
              )}
              {accessibilityMode && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ♿ Step-Free / Ramp
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-200">
              {leg.from} → {leg.to}
            </p>
          </div>
          <span className="text-slate-600 text-xs mt-0.5">{expanded ? '▲' : '▼'}</span>
        </div>

        {/* Accessibility Note when active */}
        {accessibilityMode && leg.mode === 'walk' && (
          <div className="mt-2 text-[11px] text-blue-300 bg-blue-900/30 px-2.5 py-1.5 rounded-lg border border-blue-800/50 flex items-center gap-1.5">
            <span>🛗</span>
            <span>Station Elevator Operational: Take Lift A directly to Platform Level. Zero stairs required.</span>
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2 animate-slide-up">
            <p className="text-xs text-slate-300 leading-relaxed">
              💬 {leg.instruction}
            </p>
            {leg.line && (
              <p className="text-xs text-slate-400">
                🚏 <span className="text-slate-300 font-medium">{leg.line}</span>
                {leg.frequency && <span className="text-slate-500"> · Every {leg.frequency}</span>}
              </p>
            )}
            {leg.stops && (
              <div className="text-xs text-slate-500">
                Stops: {leg.stops.join(' → ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function RouteSelector({ routes, selectedRouteId, onSelect }) {
  return (
    <div data-tour="tour-corridors" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {routes.map((route) => {
        const isSelected = route.id === selectedRouteId
        const modesUsed = [...new Set(route.legs.map((l) => l.mode).filter((m) => m !== 'walk'))]
        return (
          <button
            key={route.id}
            onClick={() => onSelect(route.id)}
            className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
              isSelected
                ? 'border-orange-500/60 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-orange-300' : 'text-slate-200'}`}>
                  {route.origin}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">↓</p>
                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-orange-300' : 'text-slate-200'}`}>
                  {route.destination}
                </p>
              </div>
              {isSelected && (
                <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs flex-shrink-0 ml-2">✓</span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {modesUsed.map((m) => (
                <ModeBadge key={m} mode={m} />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <span>⏱ {route.totalTime} min</span>
              <span>📏 {route.distance} km</span>
              <span className="text-green-400 font-semibold">₹{route.unifiedFare}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function JourneyPlanner() {
  const { 
    routes, 
    selectedRouteId, 
    selectedRoute, 
    selectRoute, 
    buyTicket, 
    qrModalOpen,
    accessibilityMode,
    concessionType,
    setConcession,
    language,
    t
  } = useTransit()

  const [buying, setBuying] = useState(false)

  const modesUsed = selectedRoute
    ? [...new Set(selectedRoute.legs.map((l) => l.mode).filter((m) => m !== 'walk'))]
    : []

  // Calculated concession fare
  let discountPct = 0
  if (concessionType === 'senior') discountPct = 30
  if (concessionType === 'divyang') discountPct = 50

  const payableFare = selectedRoute 
    ? Math.round(selectedRoute.unifiedFare * (1 - discountPct / 100))
    : 0

  async function handleBuyTicket() {
    setBuying(true)
    await buyTicket(selectedRoute)
    setBuying(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hero section */}
      <div className="hero-gradient text-center py-6 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('planner.title')}
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          {t('planner.subtitle')}
        </p>

        {/* Accessibility Notification Bar */}
        {accessibilityMode && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-semibold animate-fade-in mt-2">
            <span>♿</span>
            <span>{t('planner.accessibilityActive')}</span>
          </div>
        )}
      </div>

      {/* City impact stats */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          {language === 'gu' ? 'આજનો પરિવહન પ્રભાવ' : "Today's City Impact"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon="👥" label={language === 'gu' ? 'દૈનિક મુસાફરો' : "Daily Unified Riders"} value={CITY_STATS.dailyRiders.toLocaleString()} color="text-orange-400" />
          <StatCard icon="🌿" label={language === 'gu' ? 'CO₂ બચત (ટન)' : "CO₂ Saved (Tonnes)"} value={`${CITY_STATS.co2SavedTonnes}T`} color="text-green-400" />
          <StatCard icon="💰" label={language === 'gu' ? 'સરેરાશ બચત/ટ્રિપ' : "Avg. Savings / Ride"} value={`₹${CITY_STATS.avgSavingsPerRide}`} color="text-cyan-400" />
          <StatCard icon="🚇" label={language === 'gu' ? 'મેટ્રો સીટ ઓક્યુપન્સી' : "Metro Seat Occupancy"} value={`${CITY_STATS.metroOccupancy}%`} subValue={`BRTS: ${CITY_STATS.brtsOccupancy}% · AMTS: ${CITY_STATS.amtsOccupancy}%`} color="text-purple-400" />
        </div>
      </div>

      {/* Corridor Selection */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          {t('planner.corridorLabel')}
        </h3>
        <RouteSelector routes={routes} selectedRouteId={selectedRouteId} onSelect={selectRoute} />
      </div>

      {/* Journey details */}
      {selectedRoute && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" key={selectedRoute.id}>
          {/* Left — timeline */}
          <div data-tour="tour-timeline" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                {t('planner.stepByStep')}
              </h3>
              <div className="flex gap-2 flex-wrap justify-end">
                {modesUsed.map((m) => <ModeBadge key={m} mode={m} />)}
              </div>
            </div>

            {/* Mode legend */}
            <div className="flex gap-3 flex-wrap text-xs text-slate-500">
              {Object.entries(MODE_META).map(([key, meta]) => (
                <span key={key} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.shortLabel}
                </span>
              ))}
              <span className="text-slate-600">· Tap a leg to view interchange walking instructions</span>
            </div>

            {/* Legs timeline */}
            <div className="pt-2">
              {selectedRoute.legs.map((leg, i) => (
                <LegCard
                  key={leg.id}
                  leg={leg}
                  index={i}
                  isLast={i === selectedRoute.legs.length - 1}
                  accessibilityMode={accessibilityMode}
                />
              ))}
            </div>
          </div>

          {/* Right — fare & actions panel */}
          <div className="space-y-4">
            {/* Fare comparison & Concession */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Fare & Subsidy Category
              </h3>

              {/* Concession Selection Buttons */}
              <div data-tour="tour-concession" className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl mb-4 border border-slate-800 text-xs">
                <button
                  onClick={() => setConcession('standard')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${concessionType === 'standard' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setConcession('senior')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${concessionType === 'senior' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Senior (30%)
                </button>
                <button
                  onClick={() => setConcession('divyang')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${concessionType === 'divyang' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  દિવ્યાંગજન (50%)
                </button>
              </div>

              {/* Fare comparison visual */}
              <div data-tour="tour-fare-bars" className="space-y-3 mb-5">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>❌ {t('planner.unintegratedLabel')}</span>
                    <span className="text-red-400 font-semibold">₹{selectedRoute.unintegratedFare}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500/60 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>✅ {t('planner.unifiedPassLabel')} {discountPct > 0 ? `(${discountPct}% Subsidy)` : ''}</span>
                    <span className="text-green-400 font-semibold">₹{payableFare}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(payableFare / selectedRoute.unintegratedFare) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/60 rounded-xl p-2.5">
                  <div className="text-lg font-bold text-white">{selectedRoute.totalTime}</div>
                  <div className="text-xs text-slate-500">{t('planner.totalMins')}</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-2.5 border border-green-500/20">
                  <div className="text-lg font-bold text-green-400">₹{selectedRoute.unintegratedFare - payableFare}</div>
                  <div className="text-xs text-slate-500">{t('planner.saved')}</div>
                </div>
                <div className="bg-cyan-500/10 rounded-xl p-2.5 border border-cyan-500/20">
                  <div className="text-lg font-bold text-cyan-400">{selectedRoute.carbonSaved}</div>
                  <div className="text-xs text-slate-500">kg CO₂</div>
                </div>
              </div>
            </div>

            {/* QR ticket generator button */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Digital Multimodal Pass
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                HMAC-SHA256 signed · Valid at all Metro gates, Janmarg turnstiles & AMTS validators.
              </p>
              <button
                data-tour="tour-pass-btn"
                onClick={handleBuyTicket}
                disabled={buying}
                className="btn-primary w-full animate-pulse-glow disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none"
              >
                {buying ? '⏳ Generating Pass...' : `${t('planner.getPass')}${payableFare}`}
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Cryptographically signable offline · Anti-passback protected
              </p>
            </div>

            {/* Distance breakdown */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                {t('planner.distanceByOp')}
              </h3>
              {modesUsed.map((mode) => {
                const meta = MODE_META[mode]
                const modeDist = selectedRoute.legs
                  .filter((l) => l.mode === mode)
                  .reduce((s, l) => s + (l.distance || 0), 0)
                const pct = Math.round((modeDist / selectedRoute.distance) * 100)
                return (
                  <div key={mode} className="mb-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: meta.color }}>{meta.icon} {meta.label}</span>
                      <span className="text-slate-400">{modeDist.toFixed(1)} km ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModalOpen && <QRPassModal />}
    </div>
  )
}
