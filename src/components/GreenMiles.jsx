// src/components/GreenMiles.jsx
// Carbon credit loyalty engine — gamified reward system for public transit use
// Unique differentiator: turns every transit trip into an environmental act

import { useState, useEffect, useRef } from 'react'
import { useTransit } from '../context/TransitContext'

// ─── Badge definitions ─────────────────────────────────────────────────────────
const BADGES = [
  { id: 'first_ride',    icon: '🎫', label: 'First Journey',     desc: 'Completed your first unified trip',    threshold: 1,   type: 'trips'   },
  { id: 'eco_starter',   icon: '🌱', label: 'Eco Starter',       desc: 'Saved 1 kg CO₂ vs private car',        threshold: 1,   type: 'carbon'  },
  { id: 'metro_fan',     icon: '🚇', label: 'Metro Enthusiast',  desc: 'Took Metro 5 times',                   threshold: 5,   type: 'trips'   },
  { id: 'green_commuter',icon: '🍃', label: 'Green Commuter',    desc: 'Saved 10 kg CO₂ total',               threshold: 10,  type: 'carbon'  },
  { id: 'saver',         icon: '💰', label: 'Smart Saver',       desc: 'Saved ₹100 in unified fares',          threshold: 100, type: 'savings' },
  { id: 'eco_warrior',   icon: '🌍', label: 'Eco Warrior',       desc: 'Saved 50 kg CO₂ — equivalent to planting a tree', threshold: 50, type: 'carbon' },
  { id: 'multimodal',    icon: '🔀', label: 'Multimodal Master', desc: 'Used all 3 transit modes in one trip', threshold: 1,   type: 'modes'   },
  { id: 'centurion',     icon: '💎', label: 'Century Rider',     desc: 'Completed 100 unified trips',          threshold: 100, type: 'trips'   },
]

// ─── Mock leaderboard data ─────────────────────────────────────────────────────
const LEADERBOARD = [
  { rank: 1, name: 'Priya Shah',    miles: 4820, carbon: 96.4, city: 'Ahmedabad', avatar: '👩' },
  { rank: 2, name: 'Rahul Patel',   miles: 3950, carbon: 79.0, city: 'Gandhinagar', avatar: '👨' },
  { rank: 3, name: 'Meera Joshi',   miles: 3640, carbon: 72.8, city: 'Ahmedabad', avatar: '👩' },
  { rank: 4, name: 'Arjun Mehta',   miles: 2890, carbon: 57.8, city: 'Ahmedabad', avatar: '🧑' },
  { rank: 5, name: 'Kavya Desai',   miles: 2210, carbon: 44.2, city: 'Gandhinagar', avatar: '👩' },
]

// ─── Carbon comparison data ────────────────────────────────────────────────────
const CO2_EQUIV = [
  { label: 'Smartphone charged',   perKg: 122,   icon: '📱' },
  { label: 'LED bulb hours',        perKg: 200,   icon: '💡' },
  { label: 'Tree days of breathing',perKg: 0.048, icon: '🌳' },
  { label: 'Km walked',             perKg: 4.2,   icon: '🚶' },
]

// ─── Progress ring ────────────────────────────────────────────────────────────
function ProgressRing({ value, max, color, size = 80, strokeWidth = 6, children }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / max, 1)
  const offset = circumference * (1 - pct)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '', className = '' }) {
  const [current, setCurrent] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    startRef.current = performance.now()
    const duration = 1200
    const animate = (now) => {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCurrent(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target])

  return (
    <span className={className}>
      {prefix}{current.toLocaleString()}{suffix}
    </span>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function GreenMiles() {
  const { trips } = useTransit()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Compute user stats from trip history
  const tripCount      = Math.max(trips.length, 4)  // seed with at least 4 for demo
  const carbonSaved    = parseFloat((tripCount * 1.8).toFixed(1))
  const moneySaved     = tripCount * 16
  const greenMiles     = Math.round(carbonSaved * 100 + moneySaved * 5 + tripCount * 50)
  const level          = greenMiles < 500 ? 1 : greenMiles < 2000 ? 2 : greenMiles < 5000 ? 3 : 4
  const levelNames     = ['', '🌱 Seedling', '🌿 Sprout', '🌳 Canopy', '🌍 Guardian']
  const nextLevelAt    = [500, 2000, 5000, 10000][level - 1] || 10000
  const usedModes      = new Set(trips.flatMap((t) => t.modes || []))

  // Badge eligibility
  const earnedBadges = BADGES.filter((badge) => {
    if (badge.type === 'trips')   return tripCount   >= badge.threshold
    if (badge.type === 'carbon')  return carbonSaved >= badge.threshold
    if (badge.type === 'savings') return moneySaved  >= badge.threshold
    if (badge.type === 'modes')   return usedModes.size >= 3
    return false
  })

  const TABS = [
    { id: 'dashboard',   label: 'My Dashboard' },
    { id: 'leaderboard', label: 'City Leaderboard' },
    { id: 'badges',      label: `Badges (${earnedBadges.length}/${BADGES.length})` },
    { id: 'impact',      label: 'My CO₂ Impact' },
  ]

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="relative glass-card p-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-cyan-500/5 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Level ring */}
          <div className="flex-shrink-0 text-center">
            <ProgressRing value={greenMiles} max={nextLevelAt} color="#22c55e" size={96} strokeWidth={7}>
              <div className="text-center">
                <div className="text-xs font-black text-green-400">Lv.{level}</div>
              </div>
            </ProgressRing>
            <p className="text-xs text-green-400 font-semibold mt-1">{levelNames[level]}</p>
          </div>

          {/* Stats */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-extrabold text-white">Arjun Mehta</h3>
            <p className="text-xs text-slate-500 mb-3">Green Commuter · Ahmedabad</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                <AnimatedNumber target={greenMiles} className="text-xl font-black text-green-400 block" />
                <p className="text-xs text-slate-500">Green Miles</p>
              </div>
              <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20">
                <AnimatedNumber target={tripCount} className="text-xl font-black text-cyan-400 block" />
                <p className="text-xs text-slate-500">Trips</p>
              </div>
              <div className="bg-orange-500/10 rounded-xl p-3 border border-orange-500/20">
                <AnimatedNumber target={moneySaved} prefix="₹" className="text-xl font-black text-orange-400 block" />
                <p className="text-xs text-slate-500">Saved</p>
              </div>
            </div>
          </div>

          {/* Next level progress */}
          <div className="sm:text-right text-center flex-shrink-0">
            <p className="text-xs text-slate-500 mb-1">Next level at</p>
            <p className="text-sm font-bold text-white">{nextLevelAt.toLocaleString()} miles</p>
            <div className="w-32 h-1.5 bg-slate-700 rounded-full mt-2 mx-auto sm:ml-auto sm:mr-0">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((greenMiles / nextLevelAt) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">{nextLevelAt - greenMiles} more needed</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard tab ─────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
          {/* Weekly trip chart */}
          <div className="glass-card p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Weekly Transit Usage
            </h4>
            <div className="flex items-end gap-2 h-28">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                const heights = [75, 90, 60, 100, 85, 40, 55]
                const pct = heights[i]
                const isToday = i === new Date().getDay() - 1
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ${isToday ? 'bg-green-500' : 'bg-slate-700'}`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className={`text-xs ${isToday ? 'text-green-400 font-bold' : 'text-slate-600'}`}>{day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mode breakdown */}
          <div className="glass-card p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Mode Usage Breakdown
            </h4>
            {[
              { mode: 'Metro',  pct: 52, color: '#f97316', icon: '🚇' },
              { mode: 'BRTS',   pct: 34, color: '#06b6d4', icon: '🚌' },
              { mode: 'AMTS',   pct: 14, color: '#22c55e', icon: '🚍' },
            ].map((m) => (
              <div key={m.mode} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{m.icon} {m.mode}</span>
                  <span className="font-semibold" style={{ color: m.color }}>{m.pct}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent trips */}
          <div className="glass-card p-5 sm:col-span-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Recent Trips
            </h4>
            {trips.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Buy a ticket from Journey Planner to see trips here!
              </p>
            ) : (
              <div className="space-y-2">
                {trips.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between py-2 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎫</span>
                      <div>
                        <p className="text-sm font-medium text-white">{trip.route}</p>
                        <p className="text-xs text-slate-500">{new Date(trip.timestamp || Date.now()).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">+{Math.round(1.8 * 100 + 50)} miles</p>
                      <p className="text-xs text-slate-500">₹{trip.fare} unified</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Leaderboard tab ───────────────────────────────────────────────── */}
      {activeTab === 'leaderboard' && (
        <div className="glass-card overflow-hidden animate-slide-up">
          <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-green-500/5 to-transparent">
            <h4 className="text-sm font-bold text-white">🏆 Ahmedabad City Green Miles Leaderboard</h4>
            <p className="text-xs text-slate-500 mt-0.5">This week · 142,000 active commuters</p>
          </div>
          <div className="divide-y divide-slate-800">
            {[...LEADERBOARD, { rank: 4, name: 'Arjun Mehta', miles: greenMiles, carbon: carbonSaved, city: 'Ahmedabad', avatar: '🧑', isYou: true }]
              .sort((a, b) => b.miles - a.miles)
              .map((user, i) => {
                const rankDisplay = i + 1
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div
                    key={user.name}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors ${user.isYou ? 'bg-green-500/5 border-l-2 border-green-500' : 'hover:bg-slate-800/30'}`}
                  >
                    <div className="w-8 text-center">
                      {rankDisplay <= 3
                        ? <span className="text-xl">{medals[rankDisplay - 1]}</span>
                        : <span className="text-sm font-bold text-slate-500">#{rankDisplay}</span>
                      }
                    </div>
                    <span className="text-2xl">{user.avatar}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${user.isYou ? 'text-green-400' : 'text-white'}`}>
                        {user.name} {user.isYou && <span className="text-xs text-green-600">(You)</span>}
                      </p>
                      <p className="text-xs text-slate-500">{user.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">{user.miles.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{user.carbon} kg CO₂</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── Badges tab ────────────────────────────────────────────────────── */}
      {activeTab === 'badges' && (
        <div className="animate-slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BADGES.map((badge) => {
              const earned = earnedBadges.some((b) => b.id === badge.id)
              return (
                <div
                  key={badge.id}
                  className={`glass-card p-4 text-center transition-all duration-200 ${
                    earned
                      ? 'border-green-500/40 bg-green-500/5 shadow-lg shadow-green-500/10'
                      : 'opacity-40 grayscale'
                  }`}
                >
                  <div className={`text-3xl mb-2 ${earned ? '' : 'opacity-30'}`}>{badge.icon}</div>
                  <p className={`text-xs font-bold ${earned ? 'text-white' : 'text-slate-500'}`}>{badge.label}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-tight">{badge.desc}</p>
                  {earned && (
                    <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                      Earned ✓
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Impact tab ───────────────────────────────────────────────────── */}
      {activeTab === 'impact' && (
        <div className="space-y-4 animate-slide-up">
          {/* Hero carbon number */}
          <div className="glass-card p-6 text-center bg-gradient-to-br from-green-500/10 to-transparent">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total CO₂ Avoided</p>
            <AnimatedNumber
              target={Math.round(carbonSaved * 10) / 10}
              suffix=" kg"
              className="text-5xl font-black text-green-400 block"
            />
            <p className="text-xs text-slate-400 mt-2">
              vs. travelling the same journeys by private car
            </p>
          </div>

          {/* Equivalencies */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CO2_EQUIV.map((eq) => {
              const value = eq.perKg < 1
                ? (carbonSaved * (1 / eq.perKg)).toFixed(1)
                : Math.round(carbonSaved * eq.perKg)
              return (
                <div key={eq.label} className="glass-card p-4 text-center">
                  <div className="text-3xl mb-2">{eq.icon}</div>
                  <p className="text-base font-black text-white">{Number(value).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{eq.label}</p>
                </div>
              )
            })}
          </div>

          {/* City total */}
          <div className="glass-card p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Ahmedabad Unified Transit — City-wide Impact
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-green-400">38.4T</p>
                <p className="text-xs text-slate-500">Tonnes CO₂ daily</p>
              </div>
              <div>
                <p className="text-2xl font-black text-orange-400">14,016</p>
                <p className="text-xs text-slate-500">Tonnes monthly</p>
              </div>
              <div>
                <p className="text-2xl font-black text-cyan-400">280K</p>
                <p className="text-xs text-slate-500">Trees equivalent/yr</p>
              </div>
            </div>
          </div>

          {/* How miles are earned */}
          <div className="glass-card p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              How Green Miles Are Calculated
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              {[
                { formula: '100 kg CO₂ saved = 100 Green Miles',    desc: 'Primary environmental reward' },
                { formula: '₹1 saved on fares = 5 Green Miles',     desc: 'Economic efficiency bonus' },
                { formula: 'Each completed trip = 50 Green Miles',  desc: 'Participation reward' },
                { formula: 'Multimodal trip = 1.5× multiplier',     desc: 'Intermodal connectivity bonus' },
              ].map((item) => (
                <div key={item.formula} className="flex items-start gap-3 py-2 border-b border-slate-800">
                  <span className="text-green-400 font-mono font-bold flex-shrink-0">+</span>
                  <div>
                    <p className="text-slate-200 font-medium">{item.formula}</p>
                    <p className="text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
