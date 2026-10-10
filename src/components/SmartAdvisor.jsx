// src/components/SmartAdvisor.jsx
// AI-powered (time-aware + rule-based) departure advisor
// Tells the commuter exactly when to leave, which vehicle to catch, and shows a live countdown

import { useState, useEffect, useCallback } from 'react'
import { useTransit } from '../context/TransitContext'
import { ROUTES } from '../data/mockRoutes'

// ─── Timetable simulation ─────────────────────────────────────────────────────
// Generates the next N departures from "now" at a given interval (minutes)
function getNextDepartures(intervalMin, count = 4) {
  const now = new Date()
  const result = []
  let base = new Date(now)
  // Snap to next interval boundary
  const minutesSinceHour = base.getMinutes()
  const nextSlot = Math.ceil(minutesSinceHour / intervalMin) * intervalMin
  base.setMinutes(nextSlot, 0, 0)

  for (let i = 0; i < count; i++) {
    const dep = new Date(base.getTime() + i * intervalMin * 60000)
    const waitMs = dep.getTime() - now.getTime()
    if (waitMs < 0) continue
    result.push({
      time: dep,
      waitMs,
      label: dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      waitMin: Math.floor(waitMs / 60000),
      waitSec: Math.floor((waitMs % 60000) / 1000),
    })
  }
  return result
}

// ─── Personalized advice engine ───────────────────────────────────────────────
function generateAdvice(route, hour, waitMin) {
  const adviceBank = {
    peak: [
      `Peak hour congestion detected. Take the next Metro — standing room expected.`,
      `Crowd alert: Kalupur interchange busy. Arrive 3 min early for platform access.`,
      `High demand on Route J-11 BRTS. Next bus may be standing-only. Consider waiting one more.`,
    ],
    offPeak: [
      `Great timing! Off-peak — expect comfortable seating across all segments.`,
      `Smooth ride ahead. Metro occupancy at 38% — plenty of seats available.`,
      `Ideal travel window. BRTS running ahead of schedule by 2 minutes.`,
    ],
    lateNight: [
      `Late services running. Frequency reduced — next departure in ${waitMin} min. Plan accordingly.`,
      `Night mode: AMTS feeders switch to 30-min intervals after 22:00.`,
    ],
  }

  const isPeak     = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)
  const isLateNight = hour >= 22 || hour < 6
  const pool = isLateNight ? adviceBank.lateNight : isPeak ? adviceBank.peak : adviceBank.offPeak
  return pool[Math.floor(Date.now() / 10000) % pool.length]
}

// ─── Countdown display ────────────────────────────────────────────────────────
function Countdown({ departure }) {
  const [remaining, setRemaining] = useState(departure.waitMs)

  useEffect(() => {
    const id = setInterval(() => {
      const diff = departure.time.getTime() - Date.now()
      setRemaining(Math.max(0, diff))
    }, 1000)
    return () => clearInterval(id)
  }, [departure.time])

  const min = Math.floor(remaining / 60000)
  const sec = Math.floor((remaining % 60000) / 1000)
  const urgent = min < 3

  return (
    <span className={`font-mono font-black text-2xl tabular-nums ${urgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
      {String(min).padStart(2,'0')}:{String(sec).padStart(2,'0')}
    </span>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function SmartAdvisor() {
  const { routes, selectedRoute, selectRoute, effectivelyOnline } = useTransit()
  const [now, setNow]               = useState(new Date())
  const [selectedRouteId, setRouteId] = useState(routes[0].id)
  const [departures, setDepartures]  = useState([])

  const route = routes.find((r) => r.id === selectedRouteId) || routes[0]

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Recompute departures each minute
  useEffect(() => {
    const compute = () => {
      const interval = route.legs.find((l) => l.mode === 'metro')?.frequency
        ? parseInt(route.legs.find((l) => l.mode === 'metro').frequency) : 8
      setDepartures(getNextDepartures(interval, 4))
    }
    compute()
    const id = setInterval(compute, 60000)
    return () => clearInterval(id)
  }, [selectedRouteId, route])

  const hour    = now.getHours()
  const isPeak  = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)
  const nextDep = departures[0]
  const advice  = nextDep ? generateAdvice(route, hour, nextDep.waitMin) : ''

  // Walk time to station (first walk leg)
  const walkMin = route.legs.find((l) => l.mode === 'walk')?.duration || 3

  // Should leave
  const leaveInMin = nextDep ? Math.max(0, nextDep.waitMin - walkMin) : 0
  const urgent = leaveInMin <= 2

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-white">🧠 Smart Departure Advisor</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-powered, time-aware · Updates every second
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white tabular-nums font-mono">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-xs text-slate-500">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Route selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {routes.map((r) => (
          <button
            key={r.id}
            onClick={() => setRouteId(r.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              r.id === selectedRouteId
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'bg-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Main recommendation card */}
      {nextDep && (
        <div className={`relative glass-card p-5 overflow-hidden border-2 transition-all duration-500 ${
          urgent
            ? 'border-red-500/60 bg-red-500/5 shadow-lg shadow-red-500/20'
            : 'border-purple-500/30 bg-purple-500/5'
        }`}>
          {/* Peak/offpeak badge */}
          <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold ${
            isPeak ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {isPeak ? '🔴 Peak Hour' : '🟢 Off-Peak'}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Countdown */}
            <div className="flex-shrink-0 text-center sm:text-left">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Depart platform in</p>
              {nextDep.waitMs > 0 ? <Countdown departure={nextDep} /> : (
                <span className="font-mono font-black text-2xl text-red-400">Boarding!</span>
              )}
              <p className="text-xs text-slate-500 mt-1">First Metro at {nextDep.label}</p>
            </div>

            {/* Advice */}
            <div className="flex-1">
              <div className={`text-sm font-semibold mb-2 ${urgent ? 'text-red-300' : 'text-white'}`}>
                {urgent
                  ? `⚡ Leave NOW — Metro departs in ${leaveInMin} min!`
                  : `Leave in ${leaveInMin} min for comfortable boarding`
                }
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{advice}</p>
            </div>
          </div>

          {/* Journey snapshot */}
          <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <p className="text-slate-500">Walk to station</p>
              <p className="font-semibold text-white mt-0.5">{walkMin} min</p>
            </div>
            <div>
              <p className="text-slate-500">Journey time</p>
              <p className="font-semibold text-white mt-0.5">{route.totalTime} min</p>
            </div>
            <div>
              <p className="text-slate-500">Arrive by</p>
              <p className="font-semibold text-green-400 mt-0.5">
                {new Date(nextDep.time.getTime() + route.totalTime * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming departures */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            🚇 Upcoming Departures — {route.origin.split(' ')[0]}
          </h4>
        </div>
        <div className="divide-y divide-slate-800">
          {departures.map((dep, i) => {
            const isNext    = i === 0
            const arriveBy  = new Date(dep.time.getTime() + route.totalTime * 60000)
            const crowdLvl  = ['Low', 'Medium', 'High', 'Medium'][i] // simulated
            const crowdColors = { Low: 'text-green-400', Medium: 'text-amber-400', High: 'text-red-400' }
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3 transition-colors ${isNext ? 'bg-purple-500/5' : 'hover:bg-slate-800/30'}`}
              >
                <div className="flex items-center gap-3">
                  {isNext
                    ? <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    : <span className="w-2 h-2 rounded-full bg-slate-600" />
                  }
                  <div>
                    <p className={`text-sm font-bold tabular-nums font-mono ${isNext ? 'text-white' : 'text-slate-400'}`}>
                      {dep.label}
                    </p>
                    <p className="text-xs text-slate-600">
                      {dep.waitMin > 0 ? `in ${dep.waitMin} min` : 'Boarding now'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    Arrives <span className="text-slate-200 font-medium">{arriveBy.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                  <p className={`text-xs font-semibold mt-0.5 ${crowdColors[crowdLvl]}`}>
                    {crowdLvl} crowd
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Intelligent insights panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: '🚗',
            title: 'vs. Auto Rickshaw',
            value: `₹${route.unifiedFare} vs ₹${Math.round(route.distance * 1.8 * 12)}`,
            sub: `Save ₹${Math.round(route.distance * 1.8 * 12) - route.unifiedFare} on this trip`,
            color: 'text-green-400',
          },
          {
            icon: '🚕',
            title: 'vs. Cab/Ola',
            value: `₹${route.unifiedFare} vs ₹${Math.round(route.distance * 14)}`,
            sub: `Save ₹${Math.round(route.distance * 14) - route.unifiedFare}`,
            color: 'text-cyan-400',
          },
          {
            icon: '🌿',
            title: 'CO₂ Avoided',
            value: `${route.carbonSaved} kg`,
            sub: `= ${Math.round(route.carbonSaved * 4.2)} km walked`,
            color: 'text-green-400',
          },
        ].map((card) => (
          <div key={card.title} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{card.icon}</span>
              <p className="text-xs text-slate-500">{card.title}</p>
            </div>
            <p className={`text-sm font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
