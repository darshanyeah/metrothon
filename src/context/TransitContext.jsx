// src/context/TransitContext.jsx
import { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { ROUTES, OPERATORS } from '../data/mockRoutes'
import { writeTrip, writeSettlement, subscribeTrips, subscribeSettlements } from '../firebase'

// ─── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  // Navigation
  activeView: 'planner',          // 'planner' | 'settlement' | 'pitch'

  // Journey planner
  selectedRouteId: ROUTES[0].id,
  selectedRoute: ROUTES[0],
  qrModalOpen: false,
  purchasedTicket: null,

  // Network / offline simulation
  isOnline: navigator.onLine,
  offlineSimulated: false,        // judge-facing toggle

  // Settlement dashboard
  feederDiscount: 10,             // % discount on feeder services
  trips: [],
  settlements: [],
  settlementLoading: false,

  // Firebase status
  firebaseConnected: false,
}

// ─── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload }

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

    case 'SET_SETTLEMENT_LOADING':
      return { ...state, settlementLoading: action.payload }

    case 'SET_FIREBASE_CONNECTED':
      return { ...state, firebaseConnected: action.payload }

    default:
      return state
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────
const TransitContext = createContext(null)

export function TransitProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const unsubTripsRef = useRef(null)
  const unsubSettlementsRef = useRef(null)

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
    const ticket = {
      ticketId: `GJ-${Date.now().toString(36).toUpperCase()}`,
      passenger: 'Arjun Mehta',
      route: route.name,
      origin: route.origin,
      destination: route.destination,
      fare: route.unifiedFare,
      modes: route.legs.map((l) => l.mode).filter((m, i, a) => a.indexOf(m) === i && m !== 'walk'),
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 1000 * 60 * 120).toISOString(), // 2 hrs
    }
    // Write to Firestore (optimistic local update if offline)
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
      const written = await writeSettlement(settlement)
      dispatch({ type: 'ADD_SETTLEMENT', payload: written })
    } finally {
      dispatch({ type: 'SET_SETTLEMENT_LOADING', payload: false })
    }
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

  function setFeederDiscount(value) {
    dispatch({ type: 'SET_FEEDER_DISCOUNT', payload: value })
  }

  const effectivelyOnline = state.isOnline && !state.offlineSimulated

  return (
    <TransitContext.Provider
      value={{
        ...state,
        effectivelyOnline,
        routes: ROUTES,
        operators: OPERATORS,
        // Actions
        selectRoute,
        buyTicket,
        closeQRModal,
        setView,
        toggleOfflineSim,
        setFeederDiscount,
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
