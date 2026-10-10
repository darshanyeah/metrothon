// src/components/SettlementDashboard.jsx
import { useState, useMemo } from 'react'
import { useTransit } from '../context/TransitContext'
import { OPERATORS, MODE_META } from '../data/mockRoutes'

// ─── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    Cleared: 'bg-green-500/20 text-green-400 border-green-500/30',
    Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Disputed: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.Pending}`}>
      {status === 'Cleared' ? '✓' : status === 'Pending' ? '⏳' : '⚠'} {status}
    </span>
  )
}

// ─── Revenue simulator row ─────────────────────────────────────────────────────
function OperatorRow({ operator, unifiedFare, feederDiscount, totalDistance }) {
  const meta = MODE_META[operator.id === 'gmrc' ? 'metro' : operator.id === 'ajl' ? 'brts' : 'amts']

  // Adjust share for feeder operators when discount is applied
  const isFeeder = operator.id !== 'gmrc'
  const effectiveShare = isFeeder
    ? Math.max(operator.distanceShare - (feederDiscount * operator.distanceShare) / 200, 5)
    : operator.distanceShare + (feederDiscount * (OPERATORS.filter(o => o.id !== 'gmrc').reduce((s, o) => s + o.distanceShare, 0))) / (200)

  const rawFare = parseFloat(((operator.distanceShare / 100) * unifiedFare).toFixed(2))
  const distributedCut = parseFloat(((effectiveShare / 100) * unifiedFare).toFixed(2))
  const revenue30Days = Math.round(distributedCut * 142000 * 30)

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors group">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: meta.color + '22' }}>
            {meta.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{operator.name}</p>
            <p className="text-xs text-slate-500">{operator.fullName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${operator.distanceShare}%`, backgroundColor: meta.color }} />
          </div>
          <span className="text-sm font-semibold text-slate-200">{operator.distanceShare}%</span>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-slate-300">₹{rawFare}</td>
      <td className="px-4 py-4">
        <span className={`text-sm font-bold ${distributedCut > rawFare ? 'text-green-400' : distributedCut < rawFare ? 'text-amber-400' : 'text-slate-200'}`}>
          ₹{distributedCut}
          {distributedCut !== rawFare && (
            <span className="text-xs ml-1 opacity-70">
              {distributedCut > rawFare ? '▲' : '▼'}
            </span>
          )}
        </span>
      </td>
      <td className="px-4 py-4 text-xs text-slate-400">
        ₹{(revenue30Days / 1e6).toFixed(2)}M <span className="text-slate-600">/mo</span>
      </td>
      <td className="px-4 py-4">
        <StatusBadge status="Cleared" />
      </td>
    </tr>
  )
}

// ─── Live ledger entries ───────────────────────────────────────────────────────
function LedgerRow({ trip }) {
  const ts = trip.timestamp ? new Date(trip.timestamp) : new Date()
  const isRecent = Date.now() - ts.getTime() < 60000

  return (
    <div className={`flex items-center justify-between py-3 border-b border-slate-800/80 text-sm ${isRecent ? 'animate-slide-up' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isRecent ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
        <div>
          <p className="text-slate-200 font-medium">{trip.passenger || 'Anonymous'}</p>
          <p className="text-xs text-slate-500">{trip.route}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-green-400 font-semibold">₹{trip.fare}</p>
        <p className="text-xs text-slate-600">
          {ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function SettlementDashboard() {
  const { trips, feederDiscount, setFeederDiscount, effectivelyOnline, settlementLoading } = useTransit()

  const SAMPLE_FARE = 32  // representative average unified fare for simulator
  const totalRevenue30d = useMemo(() => {
    return Math.round(SAMPLE_FARE * 142000 * 30)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Revenue Clearinghouse
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Automated multi-operator fare distribution · Real-time ledger
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              effectivelyOnline
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${effectivelyOnline ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
              {effectivelyOnline ? 'Firestore Live Sync' : 'Local Cache · Offline'}
            </div>
            {settlementLoading && (
              <span className="text-xs text-slate-500 animate-pulse">Processing settlement…</span>
            )}
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Monthly Revenue Pool', value: `₹${(totalRevenue30d / 1e6).toFixed(1)}M`, icon: '💰', color: 'text-orange-400' },
          { label: 'Trips Logged (Today)', value: trips.length.toString(), icon: '🎫', color: 'text-cyan-400' },
          { label: 'Clearinghouse Latency', value: '<2ms', icon: '⚡', color: 'text-green-400' },
          { label: 'Settlement Accuracy', value: '99.97%', icon: '✅', color: 'text-purple-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card p-4">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Settlement simulator + table */}
      <div className="glass-card overflow-hidden">
        {/* Simulator controls */}
        <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-0.5">
                🎛️ Feeder Discount Incentive Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Adjust the discount offered to BRTS/AMTS feeder operators to see real-time revenue impact.
                Higher discounts incentivize connectivity but reduce feeder operator cut.
              </p>
            </div>
            <div className="sm:w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Feeder Discount</span>
                <span className="text-sm font-bold text-orange-400">{feederDiscount}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={feederDiscount}
                onChange={(e) => setFeederDiscount(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>0% (No incentive)</span>
                <span>30% (Max)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Operator</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Distance Share</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Standalone Fare</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unified Cut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">30-Day Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {OPERATORS.map((op) => (
                <OperatorRow
                  key={op.id}
                  operator={op}
                  unifiedFare={SAMPLE_FARE}
                  feederDiscount={feederDiscount}
                  totalDistance={28}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-700 bg-slate-800/30">
                <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-slate-400">Total (avg. unified fare ₹{SAMPLE_FARE})</td>
                <td className="px-4 py-3 text-sm font-bold text-red-400 line-through opacity-60">₹{OPERATORS.reduce((s,o) => s + parseFloat(((o.distanceShare/100)*SAMPLE_FARE).toFixed(2)),0).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-400">₹{SAMPLE_FARE}.00</td>
                <td className="px-4 py-3 text-xs text-slate-400">₹{(totalRevenue30d / 1e6).toFixed(2)}M</td>
                <td className="px-4 py-3"><StatusBadge status="Cleared" /></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Algorithm explainer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            step: '1',
            title: 'Fare Collection',
            desc: 'Citizen taps QR at first gate. Full unified fare collected by GMRC central clearing node.',
            color: 'text-orange-400',
            border: 'border-orange-500/30',
          },
          {
            step: '2',
            title: 'Distance Metering',
            desc: 'GPS + tap-in/out data computes each operator\'s distance share in real-time (< 2ms latency).',
            color: 'text-cyan-400',
            border: 'border-cyan-500/30',
          },
          {
            step: '3',
            title: 'Auto Settlement',
            desc: 'Funds transferred to operator wallets within 24 h. Dispute dashboard available to AMC.',
            color: 'text-green-400',
            border: 'border-green-500/30',
          },
        ].map((card) => (
          <div key={card.step} className={`glass-card p-4 border-l-4 ${card.border}`}>
            <div className={`text-lg font-black ${card.color} mb-1`}>Step {card.step}</div>
            <h4 className="text-sm font-semibold text-white mb-1">{card.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Live ledger */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            📋 Live Transaction Ledger
          </h3>
          <span className="text-xs text-slate-500">
            {trips.length} trips · {effectivelyOnline ? 'Firestore' : 'Local cache'}
          </span>
        </div>
        {trips.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            No trips yet — buy a ticket from the Journey Planner to see a live entry here.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {trips.map((trip) => (
              <LedgerRow key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
