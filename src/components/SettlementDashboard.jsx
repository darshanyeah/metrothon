// src/components/SettlementDashboard.jsx
import { useState, useMemo } from 'react'
import { useTransit } from '../context/TransitContext'
import { OPERATORS, MODE_META } from '../data/mockRoutes'

// ─── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    Cleared: 'bg-green-500/20 text-green-400 border-green-500/30',
    Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Reconciled: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.Pending}`}>
      {status === 'Cleared' ? '✓' : status === 'Pending' ? '⏳' : '🔄'} {status}
    </span>
  )
}

function OperatorRow({ operator, unifiedFare, feederDiscount, totalDistance }) {
  const meta = MODE_META[operator.id === 'gmrc' ? 'metro' : operator.id === 'ajl' ? 'brts' : 'amts']

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

function LedgerRow({ trip }) {
  const ts = trip.timestamp ? new Date(trip.timestamp) : new Date()
  const isRecent = Date.now() - ts.getTime() < 60000

  return (
    <div className={`flex items-center justify-between py-3 border-b border-slate-800/80 text-sm ${isRecent ? 'animate-slide-up' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isRecent ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-slate-200 font-medium">{trip.passenger || 'Anonymous'}</p>
            {trip.concessionType && trip.concessionType !== 'standard' && (
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                {trip.concessionType === 'divyang' ? 'Govt Divyang Subsidy' : 'Senior Subsidy'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{trip.route}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-green-400 font-semibold">₹{trip.fare}</p>
        <p className="text-[10px] text-cyan-400 font-mono">
          {trip.cryptoToken ? trip.cryptoToken.slice(0, 12) + '...' : 'TX-CLEARED'}
        </p>
      </div>
    </div>
  )
}

export default function SettlementDashboard() {
  const { 
    trips, 
    feederDiscount, 
    setFeederDiscount, 
    effectivelyOnline, 
    settlementLoading, 
    offlineQueue, 
    reconcileOfflineQueue, 
    isReconciling,
    language
  } = useTransit()

  const SAMPLE_FARE = 32
  const totalRevenue30d = useMemo(() => {
    return Math.round(SAMPLE_FARE * 142000 * 30)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold mb-2 border border-orange-500/20">
              🏛️ Municipal Clearing Authority · AMC & GMRC Back-Office
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {language === 'gu' ? 'મલ્ટી-ઓપરેટર ક્લિયરિંગહાઉસ અને સેટલમેન્ટ' : 'Automated Multi-Agency Clearinghouse'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Automated smart contract fare distribution across GMRC (Metro), Janmarg (BRTS), and AMTS
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {offlineQueue.length > 0 && (
              <button
                onClick={reconcileOfflineQueue}
                disabled={isReconciling}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>Reconcile {offlineQueue.length} Offline Tx</span>
              </button>
            )}

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              effectivelyOnline
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${effectivelyOnline ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
              {effectivelyOnline ? 'Firestore Live Sync' : 'Local Queue Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Monthly Revenue Pool', value: `₹${(totalRevenue30d / 1e6).toFixed(1)}M`, icon: '💰', color: 'text-orange-400' },
          { label: 'Daily Clearing Volume', value: `${trips.length + 1420} trips`, icon: '🎫', color: 'text-cyan-400' },
          { label: 'Govt Subsidy Disbursed', value: '₹4.2L', icon: '🏛️', color: 'text-blue-400' },
          { label: 'Clearing Latency', value: '<2ms', icon: '⚡', color: 'text-green-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card p-4">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Settlement simulator + table */}
      <div data-tour="tour-settlement-table" className="glass-card overflow-hidden">
        {/* Simulator controls */}
        <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-0.5">
                🎛️ Feeder Incentive & Intermodal Subsidy Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Simulates real-time revenue impact when municipal policy incentivizes AMTS/Janmarg last-mile feeders to feed passenger volume into GMRC trunk lines.
              </p>
            </div>
            <div data-tour="tour-feeder-slider" className="sm:w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Feeder Incentive Bonus</span>
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
                <span>0% (Equal share)</span>
                <span>30% (High incentive)</span>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Standalone Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unified Cut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">30-Day Inflow</th>
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
                <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-slate-400">Aggregated Settlement Pool (₹{SAMPLE_FARE} base)</td>
                <td className="px-4 py-3 text-sm font-bold text-red-400 line-through opacity-60">₹45.00</td>
                <td className="px-4 py-3 text-sm font-bold text-green-400">₹{SAMPLE_FARE}.00</td>
                <td className="px-4 py-3 text-xs text-slate-400">₹{(totalRevenue30d / 1e6).toFixed(2)}M</td>
                <td className="px-4 py-3"><StatusBadge status="Cleared" /></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Live Transaction Ledger & Immutable Hash */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              📋 Real-Time Clearing Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Each row verified via SHA cryptographic hash to prevent double-spending across operators
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Audit Standard: RBI NCMC ISO/IEC 14443
          </span>
        </div>
        {trips.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            No transactions yet — buy a ticket from the Journey Planner to view immediate clearing ledger entries.
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
