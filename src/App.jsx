// src/App.jsx
import { TransitProvider, useTransit } from './context/TransitContext'
import Header from './components/Header'
import JourneyPlanner from './components/JourneyPlanner'
import SettlementDashboard from './components/SettlementDashboard'
import PitchDeck from './components/PitchDeck'

// ─── Inner app (needs context) ─────────────────────────────────────────────────
function AppContent() {
  const { activeView } = useTransit()

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {activeView === 'planner'    && <JourneyPlanner />}
        {activeView === 'settlement' && <SettlementDashboard />}
        {activeView === 'pitch'      && <PitchDeck />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center">
        <p className="text-xs text-slate-600">
          One City, One Journey · GDG Gandhinagar Hackathon 2026 · Problem Statement PS-08 ·{' '}
          <span className="text-slate-500">Gujarat Metro + Janmarg BRTS + AMTS</span>
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
