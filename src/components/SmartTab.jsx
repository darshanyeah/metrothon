// src/components/SmartTab.jsx
// Orchestrates the three unique "differentiator" features:
//  1. Live Animated Network Map
//  2. Green Miles Loyalty Engine
//  3. AI Smart Departure Advisor

import { useState } from 'react'
import NetworkMap from './NetworkMap'
import GreenMiles from './GreenMiles'
import SmartAdvisor from './SmartAdvisor'

const SUB_TABS = [
  {
    id: 'map',
    icon: '🗺️',
    label: 'Live Network Map',
    desc: 'Animated real-time transit vehicles',
    badge: 'Unique',
    badgeColor: 'bg-orange-500/20 text-orange-400',
  },
  {
    id: 'green',
    icon: '🌿',
    label: 'Green Miles',
    desc: 'Carbon credit loyalty system',
    badge: 'Gamified',
    badgeColor: 'bg-green-500/20 text-green-400',
  },
  {
    id: 'advisor',
    icon: '🧠',
    label: 'Smart Advisor',
    desc: 'AI departure timer with crowd prediction',
    badge: 'Live AI',
    badgeColor: 'bg-purple-500/20 text-purple-400',
  },
]

export default function SmartTab() {
  const [active, setActive] = useState('map')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Section header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
          ✨ Hackathon Differentiators — Features no other team will have
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Smart Features
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Three judge-ready innovations that go beyond the brief — live transit visualization,
          gamified carbon loyalty, and AI departure intelligence.
        </p>
      </div>

      {/* Feature cards (also act as tab switchers) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
              active === tab.id
                ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{tab.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tab.badgeColor}`}>
                {tab.badge}
              </span>
            </div>
            <p className={`text-sm font-semibold ${active === tab.id ? 'text-purple-300' : 'text-white'}`}>
              {tab.label}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{tab.desc}</p>
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div className="animate-slide-up" key={active}>
        {active === 'map'     && <NetworkMap />}
        {active === 'green'   && <GreenMiles />}
        {active === 'advisor' && <SmartAdvisor />}
      </div>
    </div>
  )
}
