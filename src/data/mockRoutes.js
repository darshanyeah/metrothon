// src/data/mockRoutes.js
// Realistic Ahmedabad–Gandhinagar multimodal corridors
// Data based on GMRC Phase 1/2, Janmarg BRTS, and AMTS network

export const STATIONS = {
  // Metro stations
  thaltej:       { name: 'Thaltej Metro Station',        lat: 23.0505, lng: 72.5092, type: 'metro' },
  sg_highway:    { name: 'S.G. Highway Metro',           lat: 23.0412, lng: 72.5115, type: 'metro' },
  bodakdev:      { name: 'Bodakdev Metro Station',       lat: 23.0312, lng: 72.5210, type: 'metro' },
  commerce_six:  { name: 'Commerce Six Roads Metro',     lat: 23.0240, lng: 72.5178, type: 'metro' },
  kalupur:       { name: 'Kalupur Railway Station',      lat: 23.0225, lng: 72.5984, type: 'interchange' },
  gita_mandir:   { name: 'Gita Mandir Metro',            lat: 23.0158, lng: 72.5840, type: 'metro' },
  paldi:         { name: 'Paldi Metro Station',          lat: 23.0050, lng: 72.5700, type: 'metro' },
  iskcon:        { name: 'ISKCON Cross Road',            lat: 23.0330, lng: 72.5070, type: 'interchange' },
  chandkheda:    { name: 'Chandkheda Metro Station',     lat: 23.1050, lng: 72.5720, type: 'metro' },
  // BRTS stops
  infocity:      { name: 'Infocity BRTS Stop',          lat: 23.2005, lng: 72.6310, type: 'brts' },
  gift_city:     { name: 'GIFT City Terminal',           lat: 23.1620, lng: 72.6792, type: 'brts' },
  kh_road:       { name: 'Koba Highway BRTS',           lat: 23.1332, lng: 72.6218, type: 'brts' },
  akshardham:    { name: 'Akshardham BRTS Stop',        lat: 23.2168, lng: 72.6530, type: 'brts' },
  // AMTS stops
  sector21:      { name: 'Sector 21 Secretariat',       lat: 23.2170, lng: 72.6850, type: 'amts' },
  gandhinagar_bs:{ name: 'Gandhinagar Bus Station',     lat: 23.2215, lng: 72.6980, type: 'amts' },
}

// ─── Mode metadata ─────────────────────────────────────────────────────────────
export const MODE_META = {
  metro: {
    label: 'Gujarat Metro',
    shortLabel: 'Metro',
    color: '#f97316',
    bgClass: 'badge-metro',
    trackClass: 'track-metro',
    icon: '🚇',
    operatorCode: 'GMRC',
  },
  brts: {
    label: 'Janmarg BRTS',
    shortLabel: 'BRTS',
    color: '#06b6d4',
    bgClass: 'badge-brts',
    trackClass: 'track-brts',
    icon: '🚌',
    operatorCode: 'AJL',
  },
  amts: {
    label: 'AMTS City Bus',
    shortLabel: 'AMTS',
    color: '#22c55e',
    bgClass: 'badge-amts',
    trackClass: 'track-amts',
    icon: '🚍',
    operatorCode: 'AMTS',
  },
  walk: {
    label: 'Walking Transfer',
    shortLabel: 'Walk',
    color: '#94a3b8',
    bgClass: 'badge-walk',
    trackClass: 'track-walk',
    icon: '🚶',
    operatorCode: null,
  },
}

// ─── Route definitions ─────────────────────────────────────────────────────────
export const ROUTES = [
  // ── Route 1: Thaltej Metro → Infocity (Gandhinagar) ──────────────────────────
  {
    id: 'route-001',
    name: 'Thaltej → Infocity',
    origin: 'Thaltej Metro Station',
    destination: 'Infocity (Gandhinagar)',
    totalTime: 52,          // minutes
    unifiedFare: 30,        // ₹
    unintegratedFare: 45,   // ₹ (buying separate tickets)
    savings: 15,            // ₹
    carbonSaved: 1.8,       // kg CO₂ vs private car
    distance: 28.5,         // km
    popularity: 'High',
    legs: [
      {
        id: 'leg-1a',
        mode: 'walk',
        from: 'Thaltej Metro Entry Gate 1',
        to: 'Thaltej Metro Platform',
        duration: 3,
        distance: 0.2,
        instruction: 'Enter from SG Highway side gate. Platform on ground floor.',
        fare: 0,
      },
      {
        id: 'leg-1b',
        mode: 'metro',
        from: 'Thaltej Metro Station',
        to: 'Chandkheda Metro Station',
        duration: 22,
        distance: 14.2,
        instruction: 'Board Metro Line 1 (East–West Corridor) towards Motera. 8 stops direct.',
        line: 'Line 1 – East–West',
        frequency: '8 min',
        fareComponent: 18,
        stops: ['SG Highway', 'Bodakdev', 'Commerce Six Roads', 'Navrangpura', 'Gheekanta', 'Kalupur', 'Naroda Patiya', 'Chandkheda'],
      },
      {
        id: 'leg-1c',
        mode: 'walk',
        from: 'Chandkheda Metro Exit Gate 2',
        to: 'Janmarg BRTS Chandkheda Bay',
        duration: 5,
        distance: 0.35,
        instruction: 'Use dedicated Skywalk connector from Metro Gate 2 → BRTS Bay 4. Follow orange signage.',
        fare: 0,
      },
      {
        id: 'leg-1d',
        mode: 'brts',
        from: 'Chandkheda BRTS',
        to: 'Infocity BRTS Stop',
        duration: 18,
        distance: 12.8,
        instruction: 'Board Janmarg Route J-11 (Chandkheda → Infocity). AC BRT rapid bus.',
        line: 'J-11 Chandkheda–Infocity Express',
        frequency: '12 min',
        fareComponent: 12,
        stops: ['Koba Circle', 'Kudasan', 'Infocity Gate 2'],
      },
      {
        id: 'leg-1e',
        mode: 'walk',
        from: 'Infocity BRTS Stop',
        to: 'Infocity Tech Park Main Gate',
        duration: 4,
        distance: 0.3,
        instruction: 'Walk along footpath toward main entrance. Security check required at Gate 1.',
        fare: 0,
      },
    ],
  },

  // ── Route 2: Kalupur Railway Station → GIFT City ─────────────────────────────
  {
    id: 'route-002',
    name: 'Kalupur → GIFT City',
    origin: 'Kalupur Railway Station',
    destination: 'GIFT City, Gandhinagar',
    totalTime: 68,
    unifiedFare: 38,
    unintegratedFare: 58,
    savings: 20,
    carbonSaved: 2.6,
    distance: 35.4,
    popularity: 'Medium',
    legs: [
      {
        id: 'leg-2a',
        mode: 'walk',
        from: 'Kalupur Railway Station',
        to: 'Kalupur Metro Station',
        duration: 4,
        distance: 0.3,
        instruction: 'Exit railway station from Platform 1 bridge → Metro entry is 300 m north. Follow blue signs.',
        fare: 0,
      },
      {
        id: 'leg-2b',
        mode: 'metro',
        from: 'Kalupur Metro Station',
        to: 'Chandkheda Metro Station',
        duration: 18,
        distance: 12.1,
        instruction: 'Board Metro Line 1 towards Motera / Chandkheda. 5 stops.',
        line: 'Line 1 – East–West',
        frequency: '8 min',
        fareComponent: 15,
        stops: ['Gheekanta', 'Naroda Patiya', 'Visat', 'Sabarmati', 'Chandkheda'],
      },
      {
        id: 'leg-2c',
        mode: 'walk',
        from: 'Chandkheda Metro Gate 3',
        to: 'Koba Highway BRTS Stop',
        duration: 6,
        distance: 0.45,
        instruction: 'Exit Gate 3 → cross via zebra crossing → BRTS stop on service road. Shelter provided.',
        fare: 0,
      },
      {
        id: 'leg-2d',
        mode: 'brts',
        from: 'Koba Highway BRTS',
        to: 'GIFT City Entry Terminal',
        duration: 24,
        distance: 18.5,
        instruction: 'Board Janmarg Route J-15 (Koba → GIFT City). Limited stops express service.',
        line: 'J-15 Koba–GIFT City Express',
        frequency: '20 min',
        fareComponent: 15,
        stops: ['Kudasan', 'PDPU Campus', 'GIFT City Sec 1'],
      },
      {
        id: 'leg-2e',
        mode: 'amts',
        from: 'GIFT City Sec 1 Stop',
        to: 'GIFT City Financial District',
        duration: 8,
        distance: 2.2,
        instruction: 'AMTS Shuttle Bus Route 501 (GIFT City Internal Loop). Free feeder service.',
        line: 'AMTS 501 – GIFT Internal',
        frequency: '10 min',
        fareComponent: 8,
        stops: ['GIFT City Sec 3', 'GIFT Financial Tower'],
      },
    ],
  },

  // ── Route 3: ISKCON Cross Road → Sector 21 Secretariat ───────────────────────
  {
    id: 'route-003',
    name: 'ISKCON → Sector 21',
    origin: 'ISKCON Cross Road',
    destination: 'Sector 21, Gandhinagar Secretariat',
    totalTime: 44,
    unifiedFare: 25,
    unintegratedFare: 40,
    savings: 15,
    carbonSaved: 1.4,
    distance: 22.8,
    popularity: 'High',
    legs: [
      {
        id: 'leg-3a',
        mode: 'walk',
        from: 'ISKCON Cross Road',
        to: 'ISKCON Metro Station',
        duration: 2,
        distance: 0.15,
        instruction: 'ISKCON Metro Station is adjacent to the crossroad. Take elevator to platform.',
        fare: 0,
      },
      {
        id: 'leg-3b',
        mode: 'metro',
        from: 'ISKCON Cross Road Metro',
        to: 'Chandkheda Metro Station',
        duration: 14,
        distance: 9.5,
        instruction: 'Board Metro Line 1 towards Chandkheda. 4 stops to northern terminal.',
        line: 'Line 1 – East–West',
        frequency: '8 min',
        fareComponent: 12,
        stops: ['Thaltej', 'SP Ring Road', 'Sabarmati', 'Chandkheda'],
      },
      {
        id: 'leg-3c',
        mode: 'walk',
        from: 'Chandkheda Metro Exit',
        to: 'BRTS Chandkheda Bay',
        duration: 4,
        distance: 0.28,
        instruction: 'Covered walkway connects Metro exit to BRTS Bay 2. 4-minute comfortable walk.',
        fare: 0,
      },
      {
        id: 'leg-3d',
        mode: 'brts',
        from: 'Chandkheda BRTS',
        to: 'Akshardham BRTS',
        duration: 16,
        distance: 10.4,
        instruction: 'Board Janmarg Route J-08 towards Gandhinagar. Seated AC bus.',
        line: 'J-08 Chandkheda–Gandhinagar',
        frequency: '15 min',
        fareComponent: 10,
        stops: ['Koba Circle', 'CRPF Camp', 'Akshardham'],
      },
      {
        id: 'leg-3e',
        mode: 'amts',
        from: 'Akshardham BRTS Stop',
        to: 'Sector 21 Secretariat Gate',
        duration: 8,
        distance: 2.5,
        instruction: 'AMTS Route 98G (Akshardham → Gandhinagar Secretariat). 2 stops.',
        line: 'AMTS 98G – Gandhinagar Loop',
        frequency: '20 min',
        fareComponent: 5,
        stops: ['Sector 16', 'Sector 21 Secretariat'],
      },
    ],
  },
]

// ─── Operator clearinghouse configuration ──────────────────────────────────────
export const OPERATORS = [
  {
    id: 'gmrc',
    name: 'GMRC',
    fullName: 'Gujarat Metro Rail Corporation',
    color: '#f97316',
    distanceShare: 52,
    standaloneRate: 2.1,   // ₹ per km
    operatingCost: 1.4,    // ₹ per km
  },
  {
    id: 'ajl',
    name: 'AJL / BRTS',
    fullName: 'Ahmedabad Janmarg Ltd.',
    color: '#06b6d4',
    distanceShare: 34,
    standaloneRate: 1.2,
    operatingCost: 0.8,
  },
  {
    id: 'amts',
    name: 'AMTS',
    fullName: 'Ahmedabad Municipal Transport Service',
    color: '#22c55e',
    distanceShare: 14,
    standaloneRate: 0.8,
    operatingCost: 0.55,
  },
]

// ─── Impact stats ──────────────────────────────────────────────────────────────
export const CITY_STATS = {
  dailyRiders:       142000,
  co2SavedTonnes:    38.4,
  avgSavingsPerRide: 18,
  metroOccupancy:    68,   // % seats filled
  brtsOccupancy:     54,
  amtsOccupancy:     42,
}
