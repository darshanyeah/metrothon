// src/components/QRPassModal.jsx
import { useEffect, useRef } from 'react'
import { useTransit } from '../context/TransitContext'
import { MODE_META } from '../data/mockRoutes'

// ─── Minimal inline QR renderer (no external dep needed for demo) ──────────────
function FallbackQR({ value, size = 160 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cells = 21
    const cellSize = size / cells

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Generate a deterministic bit-pattern from the value string
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
    }

    ctx.fillStyle = '#0f172a'
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        // Finder pattern corners
        const inFinder =
          (r < 8 && c < 8) ||
          (r < 8 && c >= cells - 8) ||
          (r >= cells - 8 && c < 8)

        if (inFinder) {
          const border =
            (r === 0 || r === 6 || r === 7) ||
            (c === 0 || c === 6 || c === 7) ||
            (r === cells - 8 || r === cells - 1) ||
            (c === cells - 8 || c === cells - 1)
          const inner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                        (r >= 2 && r <= 4 && c >= cells - 6 && c <= cells - 4) ||
                        (r >= cells - 6 && r <= cells - 4 && c >= 2 && c <= 4)
          if (border || inner) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5)
          }
          continue
        }

        // Data modules
        const bit = ((hash ^ (r * 31 + c * 17)) & 1) === 1
        if (bit) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5)
        }
      }
    }
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg shadow-sm"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

// ─── QR Pass Modal ─────────────────────────────────────────────────────────────
export default function QRPassModal() {
  const { purchasedTicket, closeQRModal, effectivelyOnline, language } = useTransit()

  if (!purchasedTicket) return null

  const ticket = purchasedTicket
  const modes = (ticket.modes || []).map((m) => MODE_META[m]).filter(Boolean)
  const issuedDate = new Date(ticket.issuedAt)
  const validUntil = new Date(ticket.validUntil)

  const qrPayload = JSON.stringify({
    id: ticket.ticketId,
    r: ticket.route,
    f: ticket.fare,
    v: ticket.validUntil,
    t: ticket.cryptoToken || 'HMAC-GJ99',
    a: ticket.accessibilityAssistance ? 1 : 0
  })

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) closeQRModal()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Ticket card */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Header stripe with Gujarat branding */}
          <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-5 py-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest">
                  {language === 'gu' ? 'ગુજરાત પરિવહન પ્રાધિકરણ' : 'Gujarat Urban Mobility Authority'}
                </p>
                <h3 className="text-white text-base font-extrabold">
                  {language === 'gu' ? 'સંકલિત ડિજિટલ મુસાફરી પાસ' : 'Unified Multimodal QR Pass'}
                </h3>
              </div>
              <div className="text-2xl">🎫</div>
            </div>
          </div>

          {/* Ticket body */}
          <div className="px-5 pt-4 pb-3 space-y-3.5">
            {/* Passenger & Verification Token */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Passenger</p>
                <p className="text-sm font-bold text-white leading-tight">{ticket.passenger}</p>
                {ticket.accessibilityAssistance && (
                  <span className="inline-block mt-1 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-semibold">
                    ♿ Divyang Assistance Enabled
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ticket ID</p>
                <p className="text-xs font-mono text-orange-400 font-bold">{ticket.ticketId}</p>
              </div>
            </div>

            {/* Route */}
            <div className="bg-slate-800/70 border border-slate-700/50 rounded-xl px-3.5 py-2.5">
              <p className="text-[10px] text-slate-400">Permitted Transit Corridor</p>
              <p className="text-xs font-semibold text-white mt-0.5">{ticket.origin}</p>
              <p className="text-orange-400 text-[11px] my-0.5">↓ multimodal transit connector</p>
              <p className="text-xs font-semibold text-white">{ticket.destination}</p>
            </div>

            {/* Mode badges */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500">Authorized Networks:</span>
                <span className="text-[10px] text-cyan-400 font-mono">HMAC Valid</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {modes.map((meta) => (
                  <span
                    key={meta.operatorCode}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${meta.bgClass}`}
                  >
                    {meta.icon} {meta.shortLabel}
                  </span>
                ))}
              </div>
            </div>

            {/* Dashed divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-dashed border-slate-700" />
              <span className="text-slate-600 text-xs">✂</span>
              <div className="flex-1 border-t border-dashed border-slate-700" />
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-slate-700">
                <FallbackQR value={qrPayload} size={150} />
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-[11px] font-mono text-cyan-400 font-bold">
                  {ticket.cryptoToken || 'HMAC-43FA8B91-GJ99'}
                </p>
                <p className="text-[10px] text-slate-500">
                  Scannable at all Metro AFC gates, BRTS & AMTS readers
                </p>
              </div>
            </div>

            {/* Fare & validity */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-green-500/10 rounded-xl p-2 border border-green-500/20">
                <p className="text-base font-extrabold text-green-400">₹{ticket.fare}</p>
                <p className="text-[10px] text-slate-500">Paid Fare</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2">
                <p className="text-xs font-semibold text-white">
                  {issuedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[10px] text-slate-500">Issued</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2">
                <p className="text-xs font-semibold text-white">
                  {validUntil.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[10px] text-slate-500">Valid Till</p>
              </div>
            </div>

            {/* Offline notice */}
            {!effectivelyOnline && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                <span className="text-amber-400 text-sm">✈️</span>
                <p className="text-[10px] text-amber-300 leading-tight">
                  Cryptographically active in offline cache · Will sync with central ledger when reconnected
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-4">
            <button
              onClick={closeQRModal}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
