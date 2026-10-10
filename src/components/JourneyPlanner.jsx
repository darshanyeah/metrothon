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

function LegCard({ leg, index, isLast }) {
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
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-200">
              {leg.from} → {leg.to}
            </p>
          </div>
          <span className="text-slate-600 text-xs mt-0.5">{expanded ? '▲' : '▼'}</span>
        </div>

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
  const { routes, selectedRouteId, selectedRoute, selectRoute, buyTicket, qrModalOpen } = useTransit()
  const [buying, setBuying] = useState(false)

  const modesUsed = selectedRoute
    ? [...new Set(selectedRoute.legs.map((l) => l.mode).filter((m) => m !== 'walk'))]
    : []

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
          Plan Your Multimodal Journey
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          One unified ticket across Gujarat Metro, Janmarg BRTS & AMTS City Bus.
          Save money. Save time. Save the planet. 🌱
        </p>
      </div>

      {/* City impact stats */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Today's City Impact
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon="👥" label="Daily Unified Riders" value={CITY_STATS.dailyRiders.toLocaleString()} color="text-orange-400" />
          <StatCard icon="🌿" label="CO₂ Saved (Tonnes)" value={`${CITY_STATS.co2SavedTonnes}T`} color="text-green-400" />
          <StatCard icon="💰" label="Avg. Savings / Ride" value={`₹${CITY_STATS.avgSavingsPerRide}`} color="text-cyan-400" />
          <StatCard icon="🚇" label="Metro Seat Occupancy" value={`${CITY_STATS.metroOccupancy}%`} subValue={`BRTS: ${CITY_STATS.brtsOccupancy}% · AMTS: ${CITY_STATS.amtsOccupancy}%`} color="text-purple-400" />
        </div>
      </div>

      {/* Route selector */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Select Commute Corridor
        </h3>
        <RouteSelector routes={routes} selectedRouteId={selectedRouteId} onSelect={selectRoute} />
      </div>

      {/* Journey details */}
      {selectedRoute && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" key={selectedRoute.id}>
          {/* Left — timeline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Step-by-step Journey
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
              <span className="text-slate-600">· Tap a leg to expand details</span>
            </div>

            {/* Legs timeline */}
            <div className="pt-2">
              {selectedRoute.legs.map((leg, i) => (
                <LegCard
                  key={leg.id}
                  leg={leg}
                  index={i}
                  isLast={i === selectedRoute.legs.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Right — fare & actions panel */}
          <div className="space-y-4">
            {/* Fare comparison */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Unified Fare Breakdown
              </h3>

              {/* Fare comparison visual */}
              <div className="space-y-3 mb-5">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>❌ Unintegrated (3 tickets)</span>
                    <span className="text-red-400 font-semibold">₹{selectedRoute.unintegratedFare}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500/60 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>✅ Unified Pass</span>
                    <span className="text-green-400 font-semibold">₹{selectedRoute.unifiedFare}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(selectedRoute.unifiedFare / selectedRoute.unintegratedFare) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/60 rounded-xl p-2.5">
                  <div className="text-lg font-bold text-white">{selectedRoute.totalTime}</div>
                  <div className="text-xs text-slate-500">mins total</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-2.5 border border-green-500/20">
                  <div className="text-lg font-bold text-green-400">₹{selectedRoute.savings}</div>
                  <div className="text-xs text-slate-500">saved</div>
                </div>
                <div className="bg-cyan-500/10 rounded-xl p-2.5 border border-cyan-500/20">
                  <div className="text-lg font-bold text-cyan-400">{selectedRoute.carbonSaved}</div>
                  <div className="text-xs text-slate-500">kg CO₂</div>
                </div>
              </div>
            </div>

            {/* QR ticket generator */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Digital Multimodal Pass
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                One QR code · Valid at all Metro gates, BRTS turnstiles & AMTS readers for this journey.
              </p>
              <button
                onClick={handleBuyTicket}
                disabled={buying}
                className="btn-primary w-full animate-pulse-glow disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none"
              >
                {buying ? '⏳ Generating Pass...' : '🎫 Get Unified QR Pass — ₹' + selectedRoute.unifiedFare}
              </button>
              <p className="text-xs text-slate-600 text-center mt-2">
                Ticket stored locally · Works offline
              </p>
            </div>

            {/* Distance breakdown */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Distance by Operator
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
