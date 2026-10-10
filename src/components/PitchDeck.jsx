// src/components/PitchDeck.jsx
import { useState } from 'react'
import { useTransit } from '../context/TransitContext'

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
      <div className="text-xs text-slate-500 mt-1 leading-snug max-w-24 mx-auto">{label}</div>
    </div>
  )
}

export default function PitchDeck() {
  const { effectivelyOnline, offlineSimulated, toggleOfflineSim, language } = useTransit()
  const [activeSlide, setActiveSlide] = useState(0)

  const SLIDES = [
    { id: 'problem',       label: '❶ Policy Dilemma',     icon: '🔥' },
    { id: 'solution',      label: '❷ Unified Solution',   icon: '💡' },
    { id: 'inclusivity',   label: '❸ Inclusivity & Govt', icon: '♿' },
    { id: 'architecture',  label: '❹ Crypto & Tech',      icon: '🛡️' },
    { id: 'resilience',    label: '❺ Offline Proof',      icon: '✈️' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Pitch header */}
      <div className="text-center space-y-2 py-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-2">
          🏆 Gujarat Metro & Urban Mobility Hackathon · PS-08 Grand Jury Presentation
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          One City, <span className="text-orange-400">One Journey</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Resolving the Inter-Agency Deadlock: Ahmedabad Janmarg (BRTS) + GMRC Metro + AMTS into a Single Seamless Public Transit Spine
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

      {/* ── Slide 0: The Policy Dilemma ────────────────────────────────────────── */}
      {activeSlide === 0 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🔥</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">The ₹14,000 Crore Mobility Dilemma</h3>
              <p className="text-slate-400 text-sm">Why world-class infrastructure is operating at only 40% passenger capacity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: '🏛️',
                stat: '3 Siloed Agencies',
                label: 'Zero Interoperability',
                detail: 'GMRC (State/Central Metro), AJL (AMC BRTS), and AMTS (Municipal Buses) run separate fare rules and ticketing backends.',
                color: 'text-red-400',
              },
              {
                icon: '🚶',
                stat: '18–25 Mins',
                label: 'Interchange Friction',
                detail: 'No synchronized schedules or skywalk guidance between Metro gates and Janmarg stops (e.g. Chandkheda / Kalupur).',
                color: 'text-amber-400',
              },
              {
                icon: '💸',
                stat: '₹45 vs ₹30',
                label: 'Unintegrated Cost Penalty',
                detail: 'A commuter pays minimum base fare three times for one simple 22 km trip, making private two-wheelers cheaper.',
                color: 'text-orange-400',
              },
            ].map((p) => (
              <div key={p.stat} className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                <div className="text-3xl mb-2">{p.icon}</div>
                <div className={`text-xl font-black ${p.color} mb-1`}>{p.stat}</div>
                <p className="text-sm font-semibold text-slate-200 mb-2">{p.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-sm text-red-300 font-semibold mb-1">The Core Municipal Problem</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Without an automated clearinghouse, each agency fears revenue leakage if they offer cross-transit discounts. 
              Our platform provides the mathematical settlement bridge that protects operator balance sheets while providing citizens with a single ticket.
            </p>
          </div>
        </SlideWrapper>
      )}

      {/* ── Slide 1: The Solution ────────────────────────────────────────────── */}
      {activeSlide === 1 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">The Dual-Engine Solution</h3>
              <p className="text-slate-400 text-sm">Empowering both the daily commuter and the municipal finance officer</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5">
              <div className="text-2xl mb-2">📲</div>
              <h4 className="text-base font-bold text-orange-300 mb-2">Engine 1: Citizen Mobility Layer</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-1.5"><span className="text-orange-400 font-bold">✓</span> One multimodal QR pass accepted across all three systems</li>
                <li className="flex items-start gap-1.5"><span className="text-orange-400 font-bold">✓</span> Full Gujarati & English bilingual interface for grassroots accessibility</li>
                <li className="flex items-start gap-1.5"><span className="text-orange-400 font-bold">✓</span> Precise transfer walking directions (e.g., Skywalk Gate 2 to BRTS Platform 4)</li>
                <li className="flex items-start gap-1.5"><span className="text-orange-400 font-bold">✓</span> Guaranteed fare savings: ₹30 unified vs. ₹45 separate tickets</li>
              </ul>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="text-base font-bold text-cyan-300 mb-2">Engine 2: Municipal Clearinghouse</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-1.5"><span className="text-cyan-400 font-bold">✓</span> Real-time distance-weighted revenue allocation (GMRC: 52%, AJL: 34%, AMTS: 14%)</li>
                <li className="flex items-start gap-1.5"><span className="text-cyan-400 font-bold">✓</span> Dynamic Feeder Incentive Slider to reward last-mile bus operators</li>
                <li className="flex items-start gap-1.5"><span className="text-cyan-400 font-bold">✓</span> Cryptographic double-spend & anti-passback security</li>
                <li className="flex items-start gap-1.5"><span className="text-cyan-400 font-bold">✓</span> Compliant with RBI National Common Mobility Card (NCMC) standards</li>
              </ul>
            </div>
          </div>
        </SlideWrapper>
      )}

      {/* ── Slide 2: Inclusivity & Gujarat Govt Relevance ────────────────────────── */}
      {activeSlide === 2 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">♿</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">Inclusivity & Localized Governance</h3>
              <p className="text-slate-400 text-sm">Built for all citizens — regardless of language, age, or physical ability</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
              <span className="text-3xl mb-2 block">♿</span>
              <h4 className="text-sm font-bold text-blue-300 mb-1">દિવ્યાંગજન (Divyang) Transit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-free journey routing filtering for certified working elevators, tactile ground indicators, and low-floor accessible buses.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30">
              <span className="text-3xl mb-2 block">🌐</span>
              <h4 className="text-sm font-bold text-green-300 mb-1">ગુજરાતી Localization</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full native Gujarati support across stations, instructions, and ticket passes so non-English speaking citizens can navigate with dignity.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
              <span className="text-3xl mb-2 block">🏛️</span>
              <h4 className="text-sm font-bold text-purple-300 mb-1">State Concession Linkage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic calculation and ledger recording of Senior Citizen (30%) & Divyang (50%) state transport subsidies with audit trails.
              </p>
            </div>
          </div>
        </SlideWrapper>
      )}

      {/* ── Slide 3: Cryptography & Architecture ────────────────────────────── */}
      {activeSlide === 3 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🛡️</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">Cryptographic Security & Gate Protocol</h3>
              <p className="text-slate-400 text-sm">How tickets are validated in underground stations without cloud connectivity</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {[
              {
                step: '1. HMAC-SHA256 Tokenization',
                desc: 'Every issued ticket embeds a digitally signed cryptographic hash containing ticket ID, route parameters, and timestamp. The gate verifies mathematical authenticity locally with a pre-shared master key.',
              },
              {
                step: '2. Offline Anti-Passback Algorithm',
                desc: 'Turnstile AFC gates maintain a rolling 60-second local cache to prevent ticket sharing (passing the same QR back to a friend behind in line).',
              },
              {
                step: '3. Outbox Eventual Consistency',
                desc: 'When mobile data drops in tunnels, transactions are stored in an IndexedDB Outbox and automatically reconciled to Firestore when connectivity resumes.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                <p className="text-xs font-bold text-cyan-400">{item.step}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </SlideWrapper>
      )}

      {/* ── Slide 4: Live Offline Resilience Proof ────────────────────────────── */}
      {activeSlide === 4 && (
        <SlideWrapper>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">✈️</span>
            <div>
              <h3 className="text-xl font-extrabold text-white">Live Hackathon Proof of Resilience</h3>
              <p className="text-slate-400 text-sm">Toggle network drop live in front of the judges</p>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-700 p-6 mb-6 text-center">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-bold border transition-all duration-500 ${
              effectivelyOnline
                ? 'bg-green-500/15 text-green-300 border-green-500/40'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
            }`}>
              <span className={`w-3 h-3 rounded-full ${effectivelyOnline ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
              {effectivelyOnline ? '🟢 Live Firestore Sync' : '🟡 Offline IndexedDB & Local Cache Active'}
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={toggleOfflineSim}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold border transition-all ${
                  offlineSimulated
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{offlineSimulated ? '🌐' : '✈️'}</span>
                <span>{offlineSimulated ? 'Reconnect Network (Sync Outbox)' : 'Simulate Metro Underground Tunnel Network Drop'}</span>
              </button>
            </div>
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
