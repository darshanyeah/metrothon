// src/context/TransitContext.jsx
import { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { ROUTES, OPERATORS } from '../data/mockRoutes'
import { writeTrip, writeSettlement, subscribeTrips, subscribeSettlements } from '../firebase'
import { TRANSLATIONS } from '../data/translations'

// ─── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  // Navigation
  activeView: 'planner',          // 'planner' | 'settlement' | 'smart' | 'inspector' | 'pitch'

  // Language & Localization
  language: 'en',                 // 'en' | 'gu'

  // Inclusivity & Accessibility
  accessibilityMode: false,       // Divyangjan step-free / elevator route
  concessionType: 'standard',     // 'standard' | 'senior' | 'divyang'

  // Journey planner
  selectedRouteId: ROUTES[0].id,
  selectedRoute: ROUTES[0],
  qrModalOpen: false,
  purchasedTicket: null,

  // Network / offline simulation
  isOnline: navigator.onLine,
  offlineSimulated: false,        // judge-facing toggle
  offlineQueue: [],               // Outbox queue for offline transactions
  isReconciling: false,

  // Settlement dashboard
  feederDiscount: 10,             // % discount on feeder services
  trips: [],
  settlements: [],
  settlementLoading: false,

  // Firebase status
  firebaseConnected: false,

  // Gate validation state (Inspector mode)
  gateScans: []
}

// ─── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload }

    case 'TOGGLE_LANGUAGE':
      return { ...state, language: state.language === 'en' ? 'gu' : 'en' }

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload }

    case 'TOGGLE_ACCESSIBILITY':
      return { ...state, accessibilityMode: !state.accessibilityMode }

    case 'SET_CONCESSION':
      return { ...state, concessionType: action.payload }

    case 'SELECT_ROUTE': {
      const route = ROUTES.find((r) => r.id === action.payload)
      return { ...state, selectedRouteId: action.payload, selectedRoute: route }
    }

    case 'OPEN_QR_MODAL':
      return { ...state, qrModalOpen: true, purchasedTicket: action.payload }

    case 'CLOSE_QR_MODAL':
      return { ...state, qrModalOpen: false }

    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload }

    case 'TOGGLE_OFFLINE_SIM':
      return { ...state, offlineSimulated: !state.offlineSimulated }

    case 'QUEUE_OFFLINE_TRANSACTION':
      return { ...state, offlineQueue: [...state.offlineQueue, action.payload] }

    case 'CLEAR_OFFLINE_QUEUE':
      return { ...state, offlineQueue: [] }

    case 'SET_RECONCILING':
      return { ...state, isReconciling: action.payload }

    case 'SET_FEEDER_DISCOUNT':
      return { ...state, feederDiscount: action.payload }

    case 'SET_TRIPS':
      return { ...state, trips: action.payload }

    case 'ADD_TRIP':
      return { ...state, trips: [action.payload, ...state.trips] }

    case 'SET_SETTLEMENTS':
      return { ...state, settlements: action.payload }

    case 'ADD_SETTLEMENT':
      return { ...state, settlements: [action.payload, ...state.settlements] }

    case 'RECORD_GATE_SCAN':
      return { ...state, gateScans: [action.payload, ...state.gateScans] }

    case 'SET_SETTLEMENT_LOADING':
      return { ...state, settlementLoading: action.payload }

    case 'SET_FIREBASE_CONNECTED':
      return { ...state, firebaseConnected: action.payload }

    default:
      return state
  }
}

// ─── Simple SHA-like deterministic cryptographic token simulator ──────────────
function generateCryptoToken(ticketId, fare, timestamp) {
  const secretKey = "GJ-TRANSIT-AUTH-SALT-2026";
  let hash = 0;
  const raw = `${ticketId}:${fare}:${timestamp}:${secretKey}`;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `HMAC-${hex}-GJ99`;
}

// ─── Context ───────────────────────────────────────────────────────────────────
const TransitContext = createContext(null)

export function TransitProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const unsubTripsRef = useRef(null)
  const unsubSettlementsRef = useRef(null)

  // Translation helper
  const t = (path) => {
    const keys = path.split('.')
    let current = TRANSLATIONS[state.language] || TRANSLATIONS.en
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        return path
      }
    }
    return current
  }

  // Online/offline detection
  useEffect(() => {
    const handleOnline  = () => dispatch({ type: 'SET_ONLINE', payload: true })
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', payload: false })
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Offline queue auto-reconciliation when reconnecting
  const effectivelyOnline = state.isOnline && !state.offlineSimulated

  useEffect(() => {
    if (effectivelyOnline && state.offlineQueue.length > 0 && !state.isReconciling) {
      reconcileOfflineQueue()
    }
  }, [effectivelyOnline, state.offlineQueue.length])

  async function reconcileOfflineQueue() {
    dispatch({ type: 'SET_RECONCILING', payload: true })
    try {
      for (const item of state.offlineQueue) {
        if (item.type === 'trip') {
          await writeTrip(item.data)
        } else if (item.type === 'settlement') {
          await writeSettlement(item.data)
        }
      }
      dispatch({ type: 'CLEAR_OFFLINE_QUEUE' })
    } catch (err) {
      console.warn("Reconciliation delayed:", err)
    } finally {
      setTimeout(() => {
        dispatch({ type: 'SET_RECONCILING', payload: false })
      }, 800)
    }
  }

  // Firestore real-time subscriptions
  useEffect(() => {
    unsubTripsRef.current = subscribeTrips((trips) => {
      dispatch({ type: 'SET_TRIPS', payload: trips })
      dispatch({ type: 'SET_FIREBASE_CONNECTED', payload: true })
    })
    unsubSettlementsRef.current = subscribeSettlements((settlements) => {
      dispatch({ type: 'SET_SETTLEMENTS', payload: settlements })
    })
    return () => {
      unsubTripsRef.current?.()
      unsubSettlementsRef.current?.()
    }
  }, [])

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function buyTicket(route) {
    // Apply concession calculation
    let discountMultiplier = 1.0;
    if (state.concessionType === 'senior') discountMultiplier = 0.70; // 30% off
    if (state.concessionType === 'divyang') discountMultiplier = 0.50; // 50% off

    const calculatedFare = Math.round(route.unifiedFare * discountMultiplier)
    const ticketId = `GJ-${Date.now().toString(36).toUpperCase()}`
    const issuedAt = new Date().toISOString()
    const cryptoToken = generateCryptoToken(ticketId, calculatedFare, issuedAt)

    const ticket = {
      ticketId,
      passenger: state.concessionType === 'divyang' 
        ? 'Arjun Mehta (Divyangjan Pass)' 
        : state.concessionType === 'senior' 
        ? 'Arjun Mehta (Senior Concession)' 
        : 'Arjun Mehta',
      route: route.name,
      origin: route.origin,
      destination: route.destination,
      fare: calculatedFare,
      originalFare: route.unifiedFare,
      concessionType: state.concessionType,
      accessibilityAssistance: state.accessibilityMode,
      cryptoToken,
      modes: route.legs.map((l) => l.mode).filter((m, i, a) => a.indexOf(m) === i && m !== 'walk'),
      issuedAt,
      validUntil: new Date(Date.now() + 1000 * 60 * 120).toISOString(), // 2 hrs
      taps: []
    }

    if (!effectivelyOnline) {
      dispatch({ type: 'QUEUE_OFFLINE_TRANSACTION', payload: { type: 'trip', data: ticket } })
    }

    const written = await writeTrip(ticket)
    dispatch({ type: 'ADD_TRIP', payload: written })
    dispatch({ type: 'OPEN_QR_MODAL', payload: written })

    // Auto-generate settlement
    await generateSettlement(written, route)
  }

  async function generateSettlement(ticket, route) {
    dispatch({ type: 'SET_SETTLEMENT_LOADING', payload: true })
    try {
      const totalFare = ticket.fare
      const distribution = OPERATORS.map((op) => ({
        operatorId: op.id,
        operator: op.name,
        share: op.distanceShare,
        cut: parseFloat(((op.distanceShare / 100) * totalFare).toFixed(2)),
        status: 'Cleared',
      }))
      const settlement = {
        ticketId: ticket.ticketId,
        route: ticket.route,
        totalFare,
        distribution,
        settledAt: new Date().toISOString(),
      }

      if (!effectivelyOnline) {
        dispatch({ type: 'QUEUE_OFFLINE_TRANSACTION', payload: { type: 'settlement', data: settlement } })
      }

      const written = await writeSettlement(settlement)
      dispatch({ type: 'ADD_SETTLEMENT', payload: written })
    } finally {
      dispatch({ type: 'SET_SETTLEMENT_LOADING', payload: false })
    }
  }

  function recordGateScan(ticketId, gateOperator, stationName) {
    const scanRecord = {
      scanId: `SCAN-${Date.now().toString(36).toUpperCase()}`,
      ticketId,
      gateOperator,
      stationName,
      timestamp: new Date().toISOString(),
      antiPassbackCleared: true
    }
    dispatch({ type: 'RECORD_GATE_SCAN', payload: scanRecord })
    return scanRecord
  }

  function selectRoute(routeId) {
    dispatch({ type: 'SELECT_ROUTE', payload: routeId })
  }

  function closeQRModal() {
    dispatch({ type: 'CLOSE_QR_MODAL' })
  }

  function setView(view) {
    dispatch({ type: 'SET_VIEW', payload: view })
  }

  function toggleOfflineSim() {
    dispatch({ type: 'TOGGLE_OFFLINE_SIM' })
  }

  function toggleLanguage() {
    dispatch({ type: 'TOGGLE_LANGUAGE' })
  }

  function toggleAccessibility() {
    dispatch({ type: 'TOGGLE_ACCESSIBILITY' })
  }

  function setConcession(type) {
    dispatch({ type: 'SET_CONCESSION', payload: type })
  }

  function setFeederDiscount(value) {
    dispatch({ type: 'SET_FEEDER_DISCOUNT', payload: value })
  }

  return (
    <TransitContext.Provider
      value={{
        ...state,
        effectivelyOnline,
        routes: ROUTES,
        operators: OPERATORS,
        t,
        // Actions
        selectRoute,
        buyTicket,
        recordGateScan,
        closeQRModal,
        setView,
        toggleOfflineSim,
        toggleLanguage,
        toggleAccessibility,
        setConcession,
        setFeederDiscount,
        reconcileOfflineQueue
      }}
    >
      {children}
    </TransitContext.Provider>
  )
}

export function useTransit() {
  const ctx = useContext(TransitContext)
  if (!ctx) throw new Error('useTransit must be used within TransitProvider')
  return ctx
}
