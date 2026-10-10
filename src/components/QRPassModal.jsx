// src/components/QRPassModal.jsx
import { useEffect, useRef } from 'react'
import { useTransit } from '../context/TransitContext'
import { MODE_META } from '../data/mockRoutes'

// ─── Minimal inline QR renderer (no external dep needed for demo) ──────────────
// Uses a canvas to draw a visually convincing QR-style pattern from the ticket ID.
// When qrcode.react is installed, this is replaced by <QRCodeCanvas>.
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
      className="rounded-lg"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

// ─── QR Pass Modal ─────────────────────────────────────────────────────────────
export default function QRPassModal() {
  const { purchasedTicket, closeQRModal, effectivelyOnline } = useTransit()

  if (!purchasedTicket) return null

  const ticket = purchasedTicket
  const modes = (ticket.modes || []).map((m) => MODE_META[m]).filter(Boolean)
  const issuedDate = new Date(ticket.issuedAt)
  const validUntil = new Date(ticket.validUntil)

  // QR payload — a JSON string of key ticket fields
  const qrPayload = JSON.stringify({
    id: ticket.ticketId,
    r: ticket.route,
    f: ticket.fare,
    v: ticket.validUntil,
  })

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) closeQRModal()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Ticket card */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header stripe */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium uppercase tracking-widest">
                  Gujarat Transit Authority
                </p>
                <h3 className="text-white text-lg font-extrabold mt-0.5">
                  Unified Multimodal Pass
                </h3>
              </div>
              <div className="text-3xl">🎫</div>
            </div>
          </div>

          {/* Ticket body */}
          <div className="px-5 pt-5 pb-4 space-y-4">
            {/* Passenger info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Passenger</p>
                <p className="text-base font-bold text-white">{ticket.passenger}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Ticket ID</p>
                <p className="text-xs font-mono text-orange-400 font-bold">{ticket.ticketId}</p>
              </div>
            </div>

            {/* Route */}
            <div className="bg-slate-800/60 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500 mb-1">Journey</p>
              <p className="text-sm font-semibold text-white leading-snug">
                {ticket.origin}
              </p>
              <p className="text-orange-400 text-xs my-0.5">↓ {ticket.route.split('→')[0]?.includes('min') ? '' : 'via multimodal route'}</p>
              <p className="text-sm font-semibold text-white leading-snug">
                {ticket.destination}
              </p>
            </div>

            {/* Mode badges */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Valid on</p>
              <div className="flex gap-2 flex-wrap">
                {modes.map((meta) => (
                  <span
                    key={meta.operatorCode}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${meta.bgClass}`}
                  >
                    {meta.icon} {meta.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Dashed divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-dashed border-slate-700" />
              <span className="text-slate-700 text-xs">✂</span>
              <div className="flex-1 border-t border-dashed border-slate-700" />
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <FallbackQR value={qrPayload} size={156} />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Scan at any Metro gate, BRTS turnstile, or AMTS reader
              </p>
            </div>

            {/* Fare & validity */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-500/10 rounded-xl p-2.5 border border-green-500/20">
                <p className="text-base font-extrabold text-green-400">₹{ticket.fare}</p>
                <p className="text-xs text-slate-500">Total Fare</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5">
                <p className="text-xs font-semibold text-white">
                  {issuedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-slate-500">Issued</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5">
                <p className="text-xs font-semibold text-white">
                  {validUntil.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-slate-500">Expires</p>
              </div>
            </div>

            {/* Offline notice */}
            {!effectivelyOnline && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                <span className="text-amber-400 text-base">✈️</span>
                <p className="text-xs text-amber-300">
                  Stored in local cache · Valid offline · Will sync when online
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5">
            <button
              onClick={closeQRModal}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
