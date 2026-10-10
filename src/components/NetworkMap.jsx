// src/components/NetworkMap.jsx
// Animated SVG transit network map — Ahmedabad–Gandhinagar corridor
// Shows live-simulated trains/buses moving along routes

import { useEffect, useRef, useState } from 'react'
import { useTransit } from '../context/TransitContext'

// ─── Network topology ─────────────────────────────────────────────────────────
// Positions are in a 800×500 SVG viewport, manually placed to approximate
// the real geography of Ahmedabad–Gandhinagar.

const NODES = [
  // Metro Line 1 — East–West (bottom arc)
  { id: 'vastral',      label: 'Vastral',          x: 720, y: 340, type: 'metro' },
  { id: 'apparel',      label: 'Apparel Park',      x: 670, y: 320, type: 'metro' },
  { id: 'gyaspur',      label: 'Gyaspur',           x: 620, y: 305, type: 'metro' },
  { id: 'rabari',       label: 'Rabari Colony',     x: 570, y: 295, type: 'metro' },
  { id: 'kalupur',      label: 'Kalupur',           x: 510, y: 290, type: 'metro', isHub: true },
  { id: 'gheekanta',    label: 'Gheekanta',         x: 460, y: 295, type: 'metro' },
  { id: 'paldi',        label: 'Paldi',             x: 400, y: 305, type: 'metro' },
  { id: 'ambawadi',     label: 'Ambawadi',          x: 350, y: 300, type: 'metro' },
  { id: 'gujarat_uni',  label: 'Gujarat Uni.',      x: 300, y: 290, type: 'metro' },
  { id: 'stadium',      label: 'Stadium',           x: 255, y: 280, type: 'metro' },
  { id: 'commerce',     label: 'Commerce Six Rds',  x: 200, y: 268, type: 'metro' },
  { id: 'sg_highway',   label: 'SG Highway',        x: 155, y: 255, type: 'metro' },
  { id: 'thaltej',      label: 'Thaltej',           x: 110, y: 242, type: 'metro', isHub: true },

  // Metro Line 2 — North–South (vertical)
  { id: 'motera',       label: 'Motera Stadium',    x: 340, y: 120, type: 'metro' },
  { id: 'sabarmati',    label: 'Sabarmati',         x: 340, y: 158, type: 'metro' },
  { id: 'ranip',        label: 'Ranip',             x: 340, y: 195, type: 'metro' },
  { id: 'chandkheda',   label: 'Chandkheda',        x: 340, y: 232, type: 'metro', isHub: true },
  { id: 'visat',        label: 'Visat',             x: 340, y: 264, type: 'metro' },
  // (joins E-W at Commerce Six Roads level conceptually)

  // BRTS Network
  { id: 'koba',         label: 'Koba Circle',       x: 420, y: 158, type: 'brts' },
  { id: 'infocity',     label: 'Infocity',          x: 530, y: 110, type: 'brts', isHub: true },
  { id: 'kudasan',      label: 'Kudasan',           x: 480, y: 130, type: 'brts' },
  { id: 'pdpu',         label: 'PDPU Campus',       x: 570, y: 95,  type: 'brts' },
  { id: 'gift',         label: 'GIFT City',         x: 660, y: 80,  type: 'brts', isHub: true },

  // AMTS Gandhinagar
  { id: 'akshardham',   label: 'Akshardham',        x: 560, y: 142, type: 'amts' },
  { id: 'sector16',     label: 'Sector 16',         x: 610, y: 140, type: 'amts' },
  { id: 'sector21',     label: 'Sector 21 Sec.',    x: 650, y: 145, type: 'amts', isHub: true },
]

const EDGES = [
  // Metro Line 1 (East-West)
  { from: 'vastral',    to: 'apparel',    type: 'metro', line: 'L1' },
  { from: 'apparel',    to: 'gyaspur',   type: 'metro', line: 'L1' },
  { from: 'gyaspur',    to: 'rabari',    type: 'metro', line: 'L1' },
  { from: 'rabari',     to: 'kalupur',   type: 'metro', line: 'L1' },
  { from: 'kalupur',    to: 'gheekanta', type: 'metro', line: 'L1' },
  { from: 'gheekanta',  to: 'paldi',     type: 'metro', line: 'L1' },
  { from: 'paldi',      to: 'ambawadi',  type: 'metro', line: 'L1' },
  { from: 'ambawadi',   to: 'gujarat_uni', type: 'metro', line: 'L1' },
  { from: 'gujarat_uni', to: 'stadium',  type: 'metro', line: 'L1' },
  { from: 'stadium',    to: 'commerce',  type: 'metro', line: 'L1' },
  { from: 'commerce',   to: 'sg_highway', type: 'metro', line: 'L1' },
  { from: 'sg_highway', to: 'thaltej',   type: 'metro', line: 'L1' },

  // Metro Line 2 (North corridor)
  { from: 'motera',     to: 'sabarmati', type: 'metro', line: 'L2' },
  { from: 'sabarmati',  to: 'ranip',     type: 'metro', line: 'L2' },
  { from: 'ranip',      to: 'chandkheda', type: 'metro', line: 'L2' },
  { from: 'chandkheda', to: 'visat',     type: 'metro', line: 'L2' },

  // BRTS
  { from: 'chandkheda', to: 'koba',      type: 'brts' },
  { from: 'koba',       to: 'kudasan',   type: 'brts' },
  { from: 'kudasan',    to: 'infocity',  type: 'brts' },
  { from: 'infocity',   to: 'pdpu',      type: 'brts' },
  { from: 'pdpu',       to: 'gift',      type: 'brts' },
  { from: 'koba',       to: 'akshardham', type: 'brts' },

  // AMTS
  { from: 'akshardham', to: 'sector16',  type: 'amts' },
  { from: 'sector16',   to: 'sector21',  type: 'amts' },
  { from: 'infocity',   to: 'sector21',  type: 'amts' },
]

const TYPE_COLOR = {
  metro: '#f97316',
  brts:  '#06b6d4',
  amts:  '#22c55e',
}

// ─── Animated vehicle along a path ────────────────────────────────────────────
function Vehicle({ from, to, type, progress }) {
  const fromNode = NODES.find((n) => n.id === from)
  const toNode   = NODES.find((n) => n.id === to)
  if (!fromNode || !toNode) return null

  const x = fromNode.x + (toNode.x - fromNode.x) * progress
  const y = fromNode.y + (toNode.y - fromNode.y) * progress

  return (
    <circle
      cx={x} cy={y} r={4}
      fill={TYPE_COLOR[type]}
      stroke="#0f172a"
      strokeWidth={1.5}
      style={{ filter: `drop-shadow(0 0 4px ${TYPE_COLOR[type]})` }}
    />
  )
}

// ─── Main map component ────────────────────────────────────────────────────────
export default function NetworkMap() {
  const { effectivelyOnline } = useTransit()
  const [vehicles, setVehicles] = useState([])
  const [tick, setTick]         = useState(0)
  const [hoveredNode, setHoveredNode] = useState(null)
  const rafRef = useRef(null)
  const startRef = useRef(Date.now())

  // Initialise a fleet of vehicles — one per edge, staggered
  useEffect(() => {
    const fleet = EDGES.map((edge, i) => ({
      ...edge,
      id: `v-${i}`,
      offset: i / EDGES.length,   // stagger start
      speed: edge.type === 'metro' ? 0.04 : edge.type === 'brts' ? 0.025 : 0.018,
    }))
    setVehicles(fleet)
  }, [])

  // Animation loop
  useEffect(() => {
    let animId
    const animate = () => {
      setTick(Date.now())
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  function getProgress(vehicle) {
    const elapsed = (Date.now() - startRef.current) / 1000
    const raw = ((elapsed * vehicle.speed + vehicle.offset) % 1)
    // ping-pong: go forward then backward
    return raw < 0.5 ? raw * 2 : 2 - raw * 2
  }

  const nodeLookup = Object.fromEntries(NODES.map((n) => [n.id, n]))

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div>
          <h3 className="text-sm font-bold text-white">🗺️ Live Network Map</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time animated transit — Ahmedabad · Gandhinagar corridor
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {Object.entries(TYPE_COLOR).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1.5 text-slate-400 capitalize">
              <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              {type === 'metro' ? 'Metro' : type === 'brts' ? 'BRTS' : 'AMTS'}
            </span>
          ))}
          <span className={`flex items-center gap-1 ${effectivelyOnline ? 'text-green-400' : 'text-amber-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${effectivelyOnline ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
            {effectivelyOnline ? 'Live' : 'Cached'}
          </span>
        </div>
      </div>

      {/* SVG Map */}
      <div className="bg-slate-950/60 relative overflow-hidden" style={{ minHeight: 380 }}>
        <svg
          viewBox="0 0 800 420"
          className="w-full"
          style={{ maxHeight: 420 }}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="800" height="420" fill="url(#grid)" />

          {/* Sabarmati River (decorative) */}
          <path
            d="M 330 80 Q 310 140 290 200 Q 275 260 260 340"
            fill="none" stroke="#1d4ed8" strokeWidth="6" opacity="0.15" strokeLinecap="round"
          />
          <text x="268" y="200" fontSize="8" fill="#3b82f6" opacity="0.4" transform="rotate(-70, 268, 200)">
            Sabarmati River
          </text>

          {/* Edges */}
          {EDGES.map((edge, i) => {
            const from = nodeLookup[edge.from]
            const to   = nodeLookup[edge.to]
            if (!from || !to) return null
            const color = TYPE_COLOR[edge.type]
            const isDashed = edge.type === 'amts'
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke={color}
                strokeWidth={edge.type === 'metro' ? 3 : 2}
                strokeOpacity={0.5}
                strokeDasharray={isDashed ? '6 3' : undefined}
              />
            )
          })}

          {/* Animated vehicles */}
          {vehicles.map((v) => (
            <Vehicle key={v.id} from={v.from} to={v.to} type={v.type} progress={getProgress(v)} />
          ))}

          {/* Station nodes */}
          {NODES.map((node) => {
            const color    = TYPE_COLOR[node.type]
            const isHovered = hoveredNode === node.id
            const r = node.isHub ? 6 : 4
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle cx={node.x} cy={node.y} r={r + 6} fill={color} opacity={0.15} />
                )}
                <circle
                  cx={node.x} cy={node.y} r={r}
                  fill={isHovered ? color : '#0f172a'}
                  stroke={color}
                  strokeWidth={node.isHub ? 2.5 : 1.5}
                />
                {/* Label */}
                <text
                  x={node.x}
                  y={node.y - r - 3}
                  textAnchor="middle"
                  fontSize={node.isHub ? 8 : 7}
                  fill={isHovered ? color : '#94a3b8'}
                  fontWeight={node.isHub ? 'bold' : 'normal'}
                >
                  {node.label}
                </text>
              </g>
            )
          })}

          {/* City labels */}
          <text x="360" y="400" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">
            Ahmedabad
          </text>
          <text x="600" y="60" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">
            Gandhinagar
          </text>
        </svg>

        {/* Hover tooltip */}
        {hoveredNode && (() => {
          const node = NODES.find((n) => n.id === hoveredNode)
          if (!node) return null
          const color = TYPE_COLOR[node.type]
          return (
            <div
              className="absolute bottom-4 left-4 glass-card px-3 py-2 text-xs pointer-events-none animate-fade-in"
              style={{ borderLeftColor: color, borderLeftWidth: 3 }}
            >
              <p className="font-bold text-white">{node.label}</p>
              <p className="text-slate-400 capitalize mt-0.5">{node.type} station{node.isHub ? ' · Interchange Hub' : ''}</p>
            </div>
          )
        })()}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 divide-x divide-slate-800 border-t border-slate-700/50">
        {[
          { label: 'Active Trains',   value: vehicles.filter((v) => v.type === 'metro').length, color: 'text-orange-400' },
          { label: 'BRTS Buses',      value: vehicles.filter((v) => v.type === 'brts').length,  color: 'text-cyan-400'   },
          { label: 'AMTS Feeders',    value: vehicles.filter((v) => v.type === 'amts').length,  color: 'text-green-400'  },
          { label: 'Total Stations',  value: NODES.length, color: 'text-purple-400'                                      },
        ].map((s) => (
          <div key={s.label} className="py-3 text-center">
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
