// src/firebase.js
// Firebase v10 modular SDK with offline persistence
// Falls back gracefully if env vars are missing

import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore'

// ─── Config ───────────────────────────────────────────────────────────────────
// Replace with your Firebase project values, or set VITE_ env variables.
// App works fully offline / with mock data when these are absent.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
}

const IS_CONFIGURED = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

// ─── Initialise ───────────────────────────────────────────────────────────────
let db = null

if (IS_CONFIGURED) {
  try {
    const app = initializeApp(firebaseConfig)
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
    console.info('[Firebase] Connected with offline persistence enabled.')
  } catch (err) {
    console.warn('[Firebase] Init failed – running in mock mode.', err)
    db = null
  }
} else {
  console.info('[Firebase] No config – running in mock/offline mode.')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Write a trip to Firestore (noop in mock mode) */
export async function writeTrip(tripData) {
  if (!db) return { id: `mock-${Date.now()}`, ...tripData }
  try {
    const ref = await addDoc(collection(db, 'trips'), {
      ...tripData,
      createdAt: serverTimestamp(),
    })
    return { id: ref.id, ...tripData }
  } catch (err) {
    console.warn('[Firebase] writeTrip failed:', err)
    return { id: `mock-${Date.now()}`, ...tripData }
  }
}

/** Write a settlement entry to Firestore (noop in mock mode) */
export async function writeSettlement(settlementData) {
  if (!db) return { id: `mock-${Date.now()}`, ...settlementData }
  try {
    const ref = await addDoc(collection(db, 'settlements'), {
      ...settlementData,
      settledAt: serverTimestamp(),
    })
    return { id: ref.id, ...settlementData }
  } catch (err) {
    console.warn('[Firebase] writeSettlement failed:', err)
    return { id: `mock-${Date.now()}`, ...settlementData }
  }
}

/** Subscribe to the trips collection (returns mock data if offline) */
export function subscribeTrips(callback) {
  if (!db) {
    // Return mock ledger entries immediately
    callback(MOCK_TRIPS)
    return () => {} // unsubscribe noop
  }
  const q = collection(db, 'trips')
  return onSnapshot(q, (snap) => {
    const trips = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(trips.length ? trips : MOCK_TRIPS)
  }, (err) => {
    console.warn('[Firebase] subscribeTrips error – using mock data:', err)
    callback(MOCK_TRIPS)
  })
}

/** Subscribe to settlements collection */
export function subscribeSettlements(callback) {
  if (!db) {
    callback(MOCK_SETTLEMENTS)
    return () => {}
  }
  const q = collection(db, 'settlements')
  return onSnapshot(q, (snap) => {
    const settlements = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(settlements.length ? settlements : MOCK_SETTLEMENTS)
  }, (err) => {
    console.warn('[Firebase] subscribeSettlements error – using mock data:', err)
    callback(MOCK_SETTLEMENTS)
  })
}

// ─── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_TRIPS = [
  {
    id: 'trip-001',
    passenger: 'Arjun Mehta',
    route: 'Thaltej → Infocity',
    fare: 30,
    unifiedFare: true,
    modes: ['Metro', 'BRTS'],
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'trip-002',
    passenger: 'Priya Shah',
    route: 'Kalupur → GIFT City',
    fare: 38,
    unifiedFare: true,
    modes: ['Metro', 'BRTS', 'AMTS'],
    timestamp: new Date(Date.now() - 1000 * 60 * 27).toISOString(),
  },
  {
    id: 'trip-003',
    passenger: 'Rahul Patel',
    route: 'ISKCON → Sector 21',
    fare: 25,
    unifiedFare: true,
    modes: ['Metro', 'AMTS'],
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
]

const MOCK_SETTLEMENTS = [
  {
    id: 'settle-001',
    operator: 'GMRC',
    amount: 18.5,
    trips: 3,
    status: 'Cleared',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'settle-002',
    operator: 'AJL/BRTS',
    amount: 9.2,
    trips: 2,
    status: 'Cleared',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'settle-003',
    operator: 'AMTS',
    amount: 5.1,
    trips: 1,
    status: 'Pending',
    timestamp: new Date().toISOString(),
  },
]

export { db, IS_CONFIGURED }
