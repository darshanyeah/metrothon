// src/App.jsx
import { useState, useEffect } from 'react'
import { TransitProvider, useTransit } from './context/TransitContext'
import Header from './components/Header'
import JourneyPlanner from './components/JourneyPlanner'
import SettlementDashboard from './components/SettlementDashboard'
import GateInspector from './components/GateInspector'
import PitchDeck from './components/PitchDeck'
import SmartTab from './components/SmartTab'
import OnboardingTour from './components/OnboardingTour'

// ─── Inner app (needs context) ─────────────────────────────────────────────────
function AppContent() {
  const { activeView } = useTransit()
  const [isTourOpen, setIsTourOpen] = useState(false)

  // Auto-launch tour on first load (can be dismissed or reopened via header button)
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('transit_tour_completed')
    if (!hasSeenTour) {
      setIsTourOpen(true)
    }
  }, [])

  function closeTour() {
    setIsTourOpen(false)
    localStorage.setItem('transit_tour_completed', 'true')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header onStartTour={() => setIsTourOpen(true)} />

      <main className="flex-1">
        {activeView === 'planner'    && <JourneyPlanner />}
        {activeView === 'settlement' && <SettlementDashboard />}
        {activeView === 'inspector'  && <GateInspector />}
        {activeView === 'smart'      && <SmartTab />}
        {activeView === 'pitch'      && <PitchDeck />}
      </main>

      {/* Guided Walkthrough Tour Modal */}
      <OnboardingTour isOpen={isTourOpen} onClose={closeTour} />

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center">
        <p className="text-xs text-slate-600">
          One City, One Journey · Gujarat Urban Mobility Mission 2026 · Problem Statement PS-08 ·{' '}
          <span className="text-slate-500">GMRC Metro + Janmarg BRTS + AMTS Intermodal Architecture</span>
        </p>
      </footer>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <TransitProvider>
      <AppContent />
    </TransitProvider>
  )
}
