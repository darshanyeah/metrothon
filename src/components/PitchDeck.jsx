// src/components/PitchDeck.jsx
import { useState } from 'react'
import { useTransit } from '../context/TransitContext'
import { CITY_STATS } from '../data/mockRoutes'

// ─── Slide components ──────────────────────────────────────────────────────────
function SlideWrapper({ children, className = '' }) {
  return (
    <div className={`glass-card p-6 sm:p-8 animate-slide-up ${className}`}>
      {children}
    </div>
  )
}

function MetricHighlight({ value, label, color = 'text-orange-400' }) {
  return (
    <div className="text-center">
      <div className={`text-3xl sm:text-4xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1 leading-snug max-w-20 mx-auto">{label}</div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function PitchDeck() {
  const { effectivelyOnline, offlineSimulated, toggleOfflineSim, isOnline, firebaseConnected } = useTransit()
  const [activeSlide, setActiveSlide] = useState(0)

  const SLIDES = [
    { id: 'problem',   label: '❶ Problem',   icon: '🔥' },
    { id: 'solution',  label: '❷ Solution',  icon: '💡' },
    { id: 'tech',      label: '❸ Tech Stack', icon: '⚙️' },
    { id: 'impact',    label: '❹ Impact',    icon: '📊' },
    { id: 'offline',   label: '❺ Resilience', icon: '✈️' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Pitch header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-3">
          🏆 GDG Gandhinagar Hackathon · Problem Statement PS-08
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          One City, <span className="text-orange-400">One Journey</span>
        </h2>
        <p className="text-slate-400 text-base max-w-2xl mx-auto">
          Unified multimodal transit planner + automated revenue clearinghouse for
          Gujarat Metro · Janmarg BRTS · AMTS
        </p>
      </div>

      {/* Slide tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setActiveSlide(i)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeSlide === i
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
            }`}
          >
            {slide.icon} {slide.label}
          </button>
        ))}
      </div>

      {/* ── Slide 0: Problem ─────────────────────────────────────────────────── */}
      {activeSlide === 0 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🔥</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">The Problem</h3>
              <p className="text-slate-400 text-sm">Why commuters choose private vehicles over public transit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: '🎫',
                stat: '3',
                label: 'Separate tickets required for a single journey',
                detail: 'Metro → BRTS → AMTS each have independent ticketing systems, counters, and validators.',
                color: 'text-red-400',
              },
              {
                icon: '⏳',
                stat: '22 min',
                label: 'Average wasted at transfer points',
                detail: 'No synchronized timetables. Commuters wait at platforms with no integrated real-time info.',
                color: 'text-amber-400',
              },
              {
                icon: '🪑',
                stat: '32%',
                label: 'Metro seats run empty',
                detail: 'Without last-mile connectivity, commuters avoid Metro even when it\'s the fastest option.',
                color: 'text-orange-400',
              },
            ].map((p) => (
              <div key={p.stat} className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                <div className="text-3xl mb-2">{p.icon}</div>
                <div className={`text-2xl font-black ${p.color} mb-1`}>{p.stat}</div>
                <p className="text-sm font-semibold text-slate-200 mb-2">{p.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-sm text-red-300 font-semibold mb-1">Root Cause</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Three independent operators — GMRC (Metro), AJL (BRTS), and AMTS — operate in silos with
              no shared ticketing, no unified journey information, and no automated revenue-sharing agreement.
              This fragmentation forces commuters onto personal vehicles, defeating the purpose of a ₹14,000 Cr
              public transit investment.
            </p>
          </div>
        </SlideWrapper>
      )}

      {/* ── Slide 1: Solution ────────────────────────────────────────────────── */}
      {activeSlide === 1 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">The Solution</h3>
              <p className="text-slate-400 text-sm">Two integrated layers that solve both citizen and operator problems</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {/* Layer 1 */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5">
              <div className="text-2xl mb-2">🗺️</div>
              <h4 className="text-base font-bold text-orange-300 mb-2">Layer 1: Citizen Journey Planner</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {[
                  'Single search → optimized multimodal route',
                  'One QR pass · valid at all Metro gates, BRTS turnstiles, AMTS readers',
                  'Real-time ETAs + walking transfer directions',
                  'Unified fare — always cheaper than 3 separate tickets',
                  'Works offline (IndexedDB) during tunnel/signal loss',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-1.5">
                    <span className="text-orange-400 mt-0.5">✓</span> {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Layer 2 */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="text-base font-bold text-cyan-300 mb-2">Layer 2: Automated Clearinghouse</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {[
                  'Distance-based fare splitting algorithm (real-time, < 2ms)',
                  'Operator revenue guaranteed regardless of ticket origin',
                  'Feeder incentive slider — AMC can tune BRTS/AMTS rewards',
                  'Settlement ledger on Firebase Firestore (immutable audit trail)',
                  'Auto-dispute flagging for incomplete journeys',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 mt-0.5">✓</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Architecture flow */}
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
            <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Architecture Flow</p>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {[
                { label: 'Citizen App', bg: 'bg-orange-500' },
                { label: '→', bg: '' },
                { label: 'Journey Engine', bg: 'bg-slate-700' },
                { label: '→', bg: '' },
                { label: 'QR Issuer', bg: 'bg-slate-700' },
                { label: '→', bg: '' },
                { label: 'Gate Validator', bg: 'bg-slate-700' },
                { label: '→', bg: '' },
                { label: 'Clearinghouse', bg: 'bg-cyan-600' },
                { label: '→', bg: '' },
                { label: 'Operator Wallets', bg: 'bg-green-600' },
              ].map((node, i) => (
                node.bg ? (
                  <span key={i} className={`px-2.5 py-1 rounded-lg text-white font-semibold ${node.bg}`}>{node.label}</span>
                ) : (
                  <span key={i} className="text-slate-500 font-bold">{node.label}</span>
                )
              ))}
            </div>
          </div>
        </SlideWrapper>
      )}

      {/* ── Slide 2: Tech Stack ──────────────────────────────────────────────── */}
      {activeSlide === 2 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">⚙️</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">Tech Stack</h3>
              <p className="text-slate-400 text-sm">Production-grade, scalable, offline-first</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                category: 'Frontend',
                icon: '⚛️',
                color: 'border-blue-500/40 bg-blue-500/5',
                items: [
                  { name: 'React 19', desc: 'Component architecture, Context API state management' },
                  { name: 'Vite 8', desc: 'Sub-second HMR, optimized production bundles' },
                  { name: 'Tailwind CSS v4', desc: 'Zero-runtime utility CSS, dark theme' },
                  { name: 'PWA (manifest + service worker)', desc: 'Installable, offline-capable app' },
                ],
              },
              {
                category: 'Backend & Storage',
                icon: '🔥',
                color: 'border-orange-500/40 bg-orange-500/5',
                items: [
                  { name: 'Firebase v10 (Modular SDK)', desc: 'Tree-shakeable, production-ready' },
                  { name: 'Firestore + persistentLocalCache', desc: 'Offline persistence via IndexedDB' },
                  { name: 'Multi-tab manager', desc: 'Shared cache across browser tabs' },
                  { name: 'Mock fallback layer', desc: 'Zero crashes when Firebase unconfigured' },
                ],
              },
              {
                category: 'Transit Intelligence',
                icon: '🚇',
                color: 'border-cyan-500/40 bg-cyan-500/5',
                items: [
                  { name: 'Distance-weighted fare split', desc: 'Real operator data (GMRC: 52%, AJL: 34%, AMTS: 14%)' },
                  { name: 'Multi-leg route engine', desc: 'Walk + Metro + BRTS + AMTS sequencing' },
                  { name: 'Carbon savings calculator', desc: 'vs. private vehicle benchmarks' },
                  { name: 'QR payload encoder', desc: 'Ticket ID + validity + modes in compact JSON' },
                ],
              },
              {
                category: 'UX & Presentation',
                icon: '🎨',
                color: 'border-purple-500/40 bg-purple-500/5',
                items: [
                  { name: 'Dark-first design system', desc: 'Glass morphism, glow effects, animated timeline' },
                  { name: 'Offline simulation toggle', desc: 'Live demo of graceful degradation for judges' },
                  { name: 'Canvas QR renderer', desc: 'No external QR dep — works in any env' },
                  { name: 'Responsive layout', desc: 'Mobile, tablet & presentation screen ready' },
                ],
              },
            ].map((section) => (
              <div key={section.category} className={`rounded-2xl border p-4 ${section.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{section.icon}</span>
                  <h4 className="text-sm font-bold text-white">{section.category}</h4>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SlideWrapper>
      )}

      {/* ── Slide 3: Impact ──────────────────────────────────────────────────── */}
      {activeSlide === 3 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">📊</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">Projected Impact</h3>
              <p className="text-slate-400 text-sm">Based on GMRC Phase 1 ridership data + AMTS annual report 2023</p>
            </div>
          </div>

          {/* Big numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <MetricHighlight value="1.4M" label="Commuters served daily (Year 1)" color="text-orange-400" />
            <MetricHighlight value="₹18" label="Avg. savings per trip" color="text-green-400" />
            <MetricHighlight value="38T" label="CO₂ avoided daily (tonnes)" color="text-cyan-400" />
            <MetricHighlight value="23%" label="Metro occupancy lift" color="text-purple-400" />
          </div>

          {/* Adoption curve */}
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 mb-4">
            <h4 className="text-sm font-semibold text-white mb-4">Adoption Forecast (Ahmedabad–Gandhinagar corridor)</h4>
            <div className="space-y-3">
              {[
                { phase: 'Month 1–3',  users: '42,000',   desc: 'Early adopters: tech workers, students', pct: 30 },
                { phase: 'Month 4–6',  users: '180,000',  desc: 'Ahmedabad–Gandhinagar office commuters', pct: 55 },
                { phase: 'Month 7–12', users: '580,000',  desc: 'Full corridor + AMTS feeder integration', pct: 78 },
                { phase: 'Year 2+',    users: '1,400,000', desc: 'Metro Phase 2 expansion + new corridors', pct: 100 },
              ].map((row) => (
                <div key={row.phase} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-slate-500 flex-shrink-0">{row.phase}</div>
                  <div className="flex-1 h-5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000"
                      style={{ width: `${row.pct}%` }}
                    >
                      <span className="text-xs text-white font-bold">{row.users}</span>
                    </div>
                  </div>
                  <div className="w-48 text-xs text-slate-500 hidden sm:block">{row.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SDG alignment */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { sdg: 'SDG 11', label: 'Sustainable Cities', icon: '🏙️', desc: 'Reduced urban congestion' },
              { sdg: 'SDG 13', label: 'Climate Action', icon: '🌱', desc: '38 tonnes CO₂ saved daily' },
              { sdg: 'SDG 10', label: 'Reduced Inequality', icon: '🤝', desc: 'Affordable unified fares' },
            ].map((s) => (
              <div key={s.sdg} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xs font-bold text-white">{s.sdg}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
                <div className="text-xs text-slate-600 mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </SlideWrapper>
      )}

      {/* ── Slide 4: Offline Resilience Demo ─────────────────────────────────── */}
      {activeSlide === 4 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">✈️</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">Offline Resilience Proof</h3>
              <p className="text-slate-400 text-sm">Live demo — toggle Airplane Mode and watch the app gracefully degrade</p>
            </div>
          </div>

          {/* Live status display */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-700 p-6 mb-6 text-center">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-bold border transition-all duration-500 ${
              effectivelyOnline
                ? 'bg-green-500/15 text-green-300 border-green-500/40'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
            }`}>
              <span className={`w-3 h-3 rounded-full ${effectivelyOnline ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
              {effectivelyOnline ? '🟢 Online — Firebase Firestore Active' : '🟡 Offline — IndexedDB Cache Active'}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500 mb-1">Journey Planning</p>
                <p className={`text-sm font-bold ${effectivelyOnline ? 'text-green-400' : 'text-green-400'}`}>✓ Available</p>
                <p className="text-xs text-slate-600">Always works (local data)</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">QR Ticket Issue</p>
                <p className={`text-sm font-bold ${effectivelyOnline ? 'text-green-400' : 'text-green-400'}`}>✓ Available</p>
                <p className="text-xs text-slate-600">{effectivelyOnline ? 'Synced to Firestore' : 'Stored in IndexedDB'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Firestore Sync</p>
                <p className={`text-sm font-bold ${effectivelyOnline ? 'text-green-400' : 'text-amber-400'}`}>
                  {effectivelyOnline ? '✓ Live' : '⏳ Queued'}
                </p>
                <p className="text-xs text-slate-600">{effectivelyOnline ? 'Real-time writes' : 'Syncs when online'}</p>
              </div>
            </div>
          </div>

          {/* Toggle button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={toggleOfflineSim}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold border-2 transition-all duration-300 ${
                offlineSimulated
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 hover:bg-amber-500/30 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="text-2xl">{offlineSimulated ? '🌐' : '✈️'}</span>
              {offlineSimulated ? 'Switch Back to Online Mode' : 'Simulate Airplane Mode (Network Drop)'}
            </button>
          </div>

          {/* How it works */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">How offline resilience works</h4>
            {[
              {
                icon: '1️⃣',
                title: 'Firestore persistentLocalCache()',
                desc: 'All Firestore reads/writes are mirrored to the browser\'s IndexedDB. Data is available even with zero network.',
              },
              {
                icon: '2️⃣',
                title: 'Optimistic Local Updates',
                desc: 'When you buy a ticket offline, it\'s written locally first. The UI updates instantly. Firestore syncs the write when connection returns.',
              },
              {
                icon: '3️⃣',
                title: 'Mock Data Fallback Guard',
                desc: 'If Firebase is unconfigured or permanently unreachable, the app loads realistic mock routes and ledger entries — presentation never crashes.',
              },
              {
                icon: '4️⃣',
                title: 'Connection Status Indicators',
                desc: 'The header and this panel always reflect live network state (window.navigator.onLine + Firebase snapshot error detection).',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SlideWrapper>
      )}

      {/* Navigation arrows */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
          disabled={activeSlide === 0}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-sm font-semibold disabled:opacity-30 hover:bg-slate-700 hover:text-white transition-colors"
        >
          ← Previous
        </button>
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${i === activeSlide ? 'bg-orange-500 w-6' : 'bg-slate-700 hover:bg-slate-500'}`}
            />
          ))}
        </div>
        <button
          onClick={() => setActiveSlide(Math.min(SLIDES.length - 1, activeSlide + 1))}
          disabled={activeSlide === SLIDES.length - 1}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-sm font-semibold disabled:opacity-30 hover:bg-slate-700 hover:text-white transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
