// src/data/translations.js
// Bilingual English & Gujarati localization dictionary

export const TRANSLATIONS = {
  en: {
    appTitle: "One City, One Journey",
    appSubtitle: "Gujarat Multimodal Transit · PS-08",
    govBadge: "Government of Gujarat · Urban Mobility Mission",
    nav: {
      planner: "Journey Planner",
      clearinghouse: "Clearinghouse",
      smart: "Smart Features",
      inspector: "Gate Validator",
      pitch: "Executive Pitch"
    },
    subtitles: {
      citizen: "Citizen Flow",
      operator: "Operator Flow",
      differentiators: "Innovations",
      inspector: "Turnstile Hardware",
      pitch: "Judging Showcase"
    },
    status: {
      online: "Firebase Live Sync",
      offline: "Offline Cache (IndexedDB)",
      airplane: "Simulate Tunnel / Drop",
      goOnline: "Reconnect Network",
      reconciling: "Reconciling Offline Ledger..."
    },
    planner: {
      title: "Plan Your Multimodal Journey",
      subtitle: "Unified ticketing across Gujarat Metro, Janmarg BRTS & AMTS. Optimized for speed, cost & accessibility.",
      corridorLabel: "Select Commute Corridor",
      stepByStep: "Step-by-step Journey",
      accessibilityToggle: "Divyangjan (Wheelchair / Step-Free) Mode",
      accessibilityActive: "Step-free route with verified working elevators & ramps active",
      unintegratedLabel: "Unintegrated (3 separate tickets)",
      unifiedPassLabel: "Unified Pass",
      getPass: "Get Unified QR Pass — ₹",
      totalMins: "mins total",
      saved: "saved",
      co2: "kg CO₂ saved",
      distanceByOp: "Distance Share by Operator",
      freeFeeder: "Concession Applied"
    },
    inspector: {
      title: "Turnstile & Gate Inspector",
      subtitle: "Offline Cryptographic Verification & Anti-Passback Security Engine",
      scanPrompt: "Verify Unified QR Ticket at Metro AFC Gate / Bus Validator",
      validStatus: "CRYPTOGRAPHICALLY VERIFIED",
      invalidStatus: "INVALID / EXPIRED TICKET",
      operatorSim: "Simulate Gate Entry at:",
      tapIn: "Tap In at Gate",
      antiPassback: "Anti-Passback Rule: Active",
      signatureHash: "HMAC-SHA256 Token",
      turnstileUnlocked: "TURNSTILE UNLOCKED - ENTRY ALLOWED"
    },
    operator: {
      title: "Multi-Operator Clearinghouse & Settlement",
      subtitle: "Automated revenue allocation algorithm for GMRC, AJL (BRTS) & AMTS",
      feederSliderTitle: "Feeder Discount & Last-Mile Incentive Rate",
      tableOp: "Operator",
      tableShare: "Distance Share",
      tableRaw: "Standalone Rate",
      tableCut: "Unified Distributed Cut",
      tableRevenue: "Est. Monthly Inflow",
      tableStatus: "Clearing Status"
    }
  },
  gu: {
    appTitle: "એક શહેર, એક સફર",
    appSubtitle: "ગુજરાત મલ્ટીમોડલ ટ્રાન્સપોર્ટ · PS-08",
    govBadge: "ગુજરાત સરકાર · શહેરી પરિવહન મિશન",
    nav: {
      planner: "મુસાફરી આયોજક",
      clearinghouse: "ક્લિયરિંગહાઉસ",
      smart: "સ્માર્ટ સુવિધાઓ",
      inspector: "ગેટ વેરિફાયર",
      pitch: "નિર્ણાયક પ્રસ્તુતિ"
    },
    subtitles: {
      citizen: "નાગરિક સુવિધા",
      operator: "ઓપરેટર વ્યવસ્થાપન",
      differentiators: "નવાચાર",
      inspector: "ટર્નસ્ટાઇલ સિસ્ટમ",
      pitch: "નિર્ણાયક પ્રદર્શન"
    },
    status: {
      online: "ફાયરબેઝ લાઇવ સિંક",
      offline: "ઑફલાઇન કેશ (IndexedDB)",
      airplane: "નેટવર્ક ડ્રોપ સિમ્યુલેટ કરો",
      goOnline: "ઓનલાઇન કનેક્ટ કરો",
      reconciling: "ઑફલાઇન લેજર મેળવણી..."
    },
    planner: {
      title: "તમારી સંકલિત મુસાફરીનું આયોજન કરો",
      subtitle: "ગુજરાત મેટ્રો, જનમાર્ગ બીઆરટીએસ અને એએમટીએસ માટે એક સમાન ટિકિટ. ઝડપ, બચત અને દિવ્યાંગજન અનુકૂળ.",
      corridorLabel: "મુસાફરી માર્ગ પસંદ કરો",
      stepByStep: "તબક્કાવાર મુસાફરી વિગત",
      accessibilityToggle: "દિવ્યાંગજન (વ્હીલચેર / લિફ્ટ) મોડ",
      accessibilityActive: "લિફ્ટ અને રેમ્પ સુવિધા સાથેનો સુરક્ષિત માર્ગ સક્રિય છે",
      unintegratedLabel: "અસંકલિત (૩ અલગ ટિકિટ)",
      unifiedPassLabel: "સંકલિત પાસ",
      getPass: "સંકલિત QR પાસ મેળવો — ₹",
      totalMins: "કુલ મિનિટ",
      saved: "રૂપિયા બચ્યા",
      co2: "કિ.ગ્રા. CO₂ બચત",
      distanceByOp: "ઓપરેટર મુજબ અંતર હિસ્સો",
      freeFeeder: "સરકારી કન્સેશન લાગુ"
    },
    inspector: {
      title: "ટર્નસ્ટાઇલ અને ગેટ ઇન્સ્પેક્ટર",
      subtitle: "ઓફલાઇન ક્રિપ્ટોગ્રાફિક પ્રમાણીકરણ અને એન્ટી-પાસબેક સુરક્ષા એન્જિન",
      scanPrompt: "મેટ્રો ગેટ / બીઆરટીએસ વેલિડેટર પર QR ચકાસો",
      validStatus: "સફળતાપૂર્વક ચકાસાયેલ છે",
      invalidStatus: "અમાન્ય અથવા એક્સપાયર્ડ ટિકિટ",
      operatorSim: "ગેટ એન્ટ્રી સિમ્યુલેટ કરો:",
      tapIn: "ગેટ પર ટેપ-ઇન કરો",
      antiPassback: "એન્ટી-પાસબેક નિયમ: સક્રિય",
      signatureHash: "HMAC-SHA256 સુરક્ષા ટોકન",
      turnstileUnlocked: "ટર્નસ્ટાઇલ ખૂલ્યો - પ્રવેશ માન્ય"
    },
    operator: {
      title: "મલ્ટી-ઓપરેટર ક્લિયરિંગહાઉસ અને સેટલમેન્ટ",
      subtitle: "GMRC, AJL (BRTS) અને AMTS વચ્ચે સ્વચાલિત ભાડું વિભાજન",
      feederSliderTitle: "ફીડર ડિસ્કાઉન્ટ પ્રોત્સાહન દર",
      tableOp: "ઓપરેટર",
      tableShare: "અંતર હિસ્સો",
      tableRaw: "મૂળ ભાડું",
      tableCut: "સંકલિત હિસ્સો",
      tableRevenue: "અંદાજિત માસિક આવક",
      tableStatus: "સેટલમેન્ટ સ્થિતિ"
    }
  }
};
