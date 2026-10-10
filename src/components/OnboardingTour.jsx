// src/components/OnboardingTour.jsx
// Production-grade Spotlight & Interactive Focus Tour
// Uses SVG Overlay with Mask Cutout + Retrying DOM Locator + Smooth View Transitions

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTransit } from '../context/TransitContext'

const TOUR_STEPS = [
  {
    targetView: 'planner',
    targetTourId: 'tour-corridors',
    badge: 'Step 1: Commute Corridors',
    icon: '📍',
    title: {
      en: 'Ahmedabad–Gandhinagar Corridors',
      gu: 'અમદાવાદ-ગાંધીનગર રૂટ્સ'
    },
    description: {
      en: 'Pick realistic corridors like Thaltej → Infocity or Kalupur → GIFT City. Each corridor combines Metro, BRTS, and AMTS with walking transfers.',
      gu: 'અહીંથી મુસાફર થલતેજ થી ઇન્ફોસિટી કે કાલુપુર થી ગિફ્ટ સિટી જેવા મુખ્ય કોરિડોર પસંદ કરી શકે છે.'
    },
    buttonHint: {
      en: 'Click any corridor card to preview the full transfer timeline.',
      gu: 'કોઈપણ રૂટ કાર્ડ પર ક્લિક કરીને મુસાફરીનો સંપૂર્ણ તબક્કો જોઈ શકો છો.'
    }
  },
  {
    targetView: 'planner',
    targetTourId: 'tour-access',
    badge: 'Step 2: Social Inclusivity',
    icon: '♿',
    title: {
      en: 'Divyangjan Accessibility Toggle',
      gu: 'દિવ્યાંગજન સુવિધા ટૉગલ'
    },
    description: {
      en: 'Inclusivity is a major judging criterion. Clicking this filters routes for working station elevators, wheelchair ramps, and low-floor AMTS buses.',
      gu: 'આ બટન દબાવવાથી રસ્તામાં ચાલુ લિફ્ટ, વ્હીલચેર રેમ્પ અને દિવ્યાંગ અનુકૂળ બસો ફિલ્ટર થઈને દેખાય છે.'
    },
    buttonHint: {
      en: 'Try clicking this button to activate step-free routing across stations.',
      gu: 'સ્ટેશનો પર સીડી-મુક્ત માર્ગ જોવા માટે આ બટન દબાવો.'
    }
  },
  {
    targetView: 'planner',
    targetTourId: 'tour-concession',
    badge: 'Step 3: State Subsidies',
    icon: '🏛️',
    title: {
      en: 'Govt Concession & Subsidy Buttons',
      gu: 'સરકારી કન્સેશન અને સબસિડી'
    },
    description: {
      en: 'Switch between Standard, Senior Citizen (30% off), or Divyangjan (50% state subsidy). The algorithm computes the discount and logs the subsidy claim.',
      gu: 'સીનિયર સિટીઝન (૩૦% છૂટ) અથવા દિવ્યાંગજન (૫૦% સબસિડી) પસંદ કરો. ભાડું આપોઆપ ગણાઈ જશે.'
    },
    buttonHint: {
      en: 'Select a subsidy category to see the discounted fare in real-time.',
      gu: 'સબસિડી કેટેગરી પસંદ કરીને ભાડાની બચત જુઓ.'
    }
  },
  {
    targetView: 'planner',
    targetTourId: 'tour-pass-btn',
    badge: 'Step 4: Unified Pass Generator',
    icon: '🎫',
    title: {
      en: 'Single Cryptographic QR Pass Button',
      gu: 'સંકલિત QR પાસ બટન'
    },
    description: {
      en: 'The core citizen action! Issues a single digital pass signed with HMAC-SHA256, valid across Gujarat Metro, Janmarg BRTS, and AMTS turnstiles.',
      gu: 'આ મુખ્ય બટન છે! તેનાથી એક જ ડિજિટલ QR પાસ મળે છે જે મેટ્રો, બીઆરટીએસ અને એએમટીએસ ત્રણેયમાં ચાલે છે.'
    },
    buttonHint: {
      en: 'Clicking this issues the digital pass and opens the boarding pass modal.',
      gu: 'આના પર ક્લિક કરવાથી ડિજિટલ પાસ જનરેટ થઈને સ્ક્રીન પર દેખાય છે.'
    }
  },
  {
    targetView: 'settlement',
    targetTourId: 'tour-feeder-slider',
    badge: 'Step 5: Clearinghouse Simulator',
    icon: '🎛️',
    title: {
      en: 'Feeder Incentive Bonus Slider',
      gu: 'ફીડર પ્રોત્સાહન સ્લાઇડર'
    },
    description: {
      en: 'The municipal breakthrough! Drag this slider to see how AMC and GMRC dynamically adjust feeder bus revenue cuts to maximize metro ridership.',
      gu: 'આ મ્યુનિસિપલ સ્લાઇડરથી મેટ્રો અને બસ વચ્ચેની આવકનું ગતિશીલ વિભાજન લાઈવ બદલાય છે.'
    },
    buttonHint: {
      en: 'Drag the slider to adjust the revenue cut for last-mile feeder buses.',
      gu: 'સ્લાઇડર ખસેડીને બસ ઓપરેટરોનો હિસ્સો બદલીને જુઓ.'
    }
  },
  {
    targetView: 'inspector',
    targetTourId: 'tour-gate-tap-btn',
    badge: 'Step 6: Gate Hardware Validator',
    icon: '🛡️',
    title: {
      en: 'Turnstile Reader Tap-In Simulator',
      gu: 'સ્ટેશન ગેટ ટેપ-ઇન સિમ્યુલેટર'
    },
    description: {
      en: 'Demonstrates offline gate verification! Click this to simulate a tap at Metro AFC Gate 2. The barrier unlocks, or Anti-Passback blocks duplicate taps.',
      gu: 'મેટ્રો ગેટ પર ટિકિટ ટેપ કરો: ગ્રીન બેરિયર ખુલશે. ફરી ટેપ કરશો તો એન્ટી-પાસબેક સુરક્ષા બ્લોક દેખાશે.'
    },
    buttonHint: {
      en: 'Click to simulate a real passenger scanning their QR code at the turnstile.',
      gu: 'ટર્નસ્ટાઇલ પર QR સ્કેન કરવાનું લાઈવ સિમ્યુલેશન ચલાવવા ક્લિક કરો.'
    }
  },
  {
    targetView: 'smart',
    targetTourId: 'tour-nav-smart',
    badge: 'Step 7: Winning Differentiators',
    icon: '✨',
    title: {
      en: 'Animated Map, Green Miles & AI Clock',
      gu: 'લાઈવ મેપ, ગ્રીન માઇલ્સ અને એઆઈ સલાહકાર'
    },
    description: {
      en: 'Shows judges our 3 unique features: the animated Sabarmati river transit map, Green Miles carbon credit loyalty, and the AI countdown departure advisor.',
      gu: 'સાબરમતી નદી પર ટ્રેનોનો લાઈવ મેપ, ગ્રીન માઇલ્સ લોયલ્ટી અને એઆઈ કાઉન્ટડાઉન ઘડિયાળ જુઓ.'
    },
    buttonHint: {
      en: 'Explore the 3 distinctive innovations that elevate this above simple routing apps.',
      gu: 'અન્ય સામાન્ય પ્રોજેક્ટ્સ કરતાં આગળ લઈ જતી ૩ મુખ્ય સુવિધાઓ જુઓ.'
    }
  },
  {
    targetView: 'planner',
    targetTourId: 'tour-airplane',
    badge: 'Step 8: Offline Resilience Proof',
    icon: '✈️',
    title: {
      en: 'Tunnel / Network Drop Simulator',
      gu: 'ઓફલાઇન નેટવર્ક ડ્રોપ સિમ્યુલેટર'
    },
    description: {
      en: 'The clincher: Click this airplane mode button anytime during your pitch to prove the app never crashes when cell connection drops in underground metro tunnels.',
      gu: 'પ્રસ્તુતિ વખતે આ બટન દબાવીને બતાવો કે અંડરગ્રાઉન્ડ ટનલમાં નેટવર્ક વગર પણ ઍપ વિના અડચણ ચાલે છે.'
    },
    buttonHint: {
      en: 'You are now ready to give a winning demo! Click Finish to explore freely.',
      gu: 'હવે તમે વિજેતા ડેમો આપવા માટે તૈયાર છો! પૂર્ણ કરો પર ક્લિક કરો.'
    }
  }
]

export default function OnboardingTour({ isOpen, onClose }) {
  const { setView, language } = useTransit()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 100, left: 100, isBelow: true })
  const pollTimerRef = useRef(null)

  const step = TOUR_STEPS[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === TOUR_STEPS.length - 1

  // Robust element locator with polling to survive React view unmount/mount cycles
  const locateElement = useCallback(() => {
    if (!step) return

    let attempts = 0
    const maxAttempts = 15 // Poll up to ~750ms

    const tryFind = () => {
      const element = document.querySelector(`[data-tour="${step.targetTourId}"]`)
      if (element) {
        // Found element: scroll smoothly into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })

        // Allow scroll animation to settle before measuring
        setTimeout(() => {
          const rect = element.getBoundingClientRect()
          setTargetRect({
            top: Math.max(0, rect.top),
            left: Math.max(0, rect.left),
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right
          })

          // Calculate ideal tooltip placement
          const cardWidth = Math.min(window.innerWidth - 32, 420)
          const cardHeight = 240
          const spaceBelow = window.innerHeight - rect.bottom
          const isBelow = spaceBelow >= cardHeight || rect.top < cardHeight

          // Center horizontally over target element, bounded by viewport
          let idealLeft = rect.left + rect.width / 2 - cardWidth / 2
          idealLeft = Math.max(16, Math.min(idealLeft, window.innerWidth - cardWidth - 16))

          const idealTop = isBelow
            ? Math.min(window.innerHeight - cardHeight - 16, rect.bottom + 16)
            : Math.max(16, rect.top - cardHeight - 16)

          setTooltipPos({
            top: idealTop,
            left: idealLeft,
            isBelow
          })
        }, 120)
      } else if (attempts < maxAttempts) {
        attempts++
        pollTimerRef.current = setTimeout(tryFind, 50)
      } else {
        // Fallback: center in viewport if element is truly missing
        setTargetRect(null)
        setTooltipPos({
          top: Math.max(40, window.innerHeight / 2 - 120),
          left: Math.max(16, window.innerWidth / 2 - 200),
          isBelow: true
        })
      }
    }

    tryFind()
  }, [step])

  // Sync active view and trigger element locator
  useEffect(() => {
    if (!isOpen || !step) return

    clearTimeout(pollTimerRef.current)
    setView(step.targetView)

    // Wait 100ms for React view mounting before looking for DOM node
    const initTimer = setTimeout(() => {
      locateElement()
    }, 100)

    return () => {
      clearTimeout(initTimer)
      clearTimeout(pollTimerRef.current)
    }
  }, [currentStepIndex, isOpen, step, setView, locateElement])

  // Reposition on window resize or scroll
  useEffect(() => {
    if (!isOpen) return
    const handleReposition = () => locateElement()
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)
    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [isOpen, locateElement])

  if (!isOpen || !step) return null

  function handleNext() {
    if (isLast) {
      onClose()
    } else {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  function handleTryAction() {
    const element = document.querySelector(`[data-tour="${step.targetTourId}"]`)
    if (element) {
      element.click()
      setTimeout(() => locateElement(), 200)
    }
  }

  const PADDING = 8
  const cutoutX = targetRect ? Math.max(0, targetRect.left - PADDING) : 0
  const cutoutY = targetRect ? Math.max(0, targetRect.top - PADDING) : 0
  const cutoutW = targetRect ? targetRect.width + PADDING * 2 : 0
  const cutoutH = targetRect ? targetRect.height + PADDING * 2 : 0

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* ── 1. SVG Backdrop Overlay with Physical Cutout Mask ── */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-40">
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White background: reveals the dark tint */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black rectangle cutout: punches a clean hole through to the real button */}
            {targetRect && (
              <rect
                x={cutoutX}
                y={cutoutY}
                width={cutoutW}
                height={cutoutH}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Full-screen tinted layer with mask cutout */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(10, 15, 29, 0.82)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* ── 2. Clickable Backdrop (Dismiss on click outside) ── */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose} 
      />

      {/* ── 3. Highlighting Glowing Halo Ring Around Cutout ── */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-2xl z-50 transition-all duration-300 ease-out"
          style={{
            top: cutoutY,
            left: cutoutX,
            width: cutoutW,
            height: cutoutH,
            border: '2px solid rgba(249, 115, 22, 0.95)',
            boxShadow: '0 0 24px 6px rgba(249, 115, 22, 0.55), inset 0 0 12px rgba(249, 115, 22, 0.25)',
          }}
        >
          {/* Animated "FOCUS" tag */}
          <span className="absolute -top-3.5 left-3 px-2 py-0.5 rounded-full bg-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider animate-bounce shadow-lg">
            Focus Here
          </span>
        </div>
      )}

      {/* ── 4. Anchored Floating Guidance Tooltip Card ── */}
      <div
        className="fixed z-50 w-[calc(100vw-32px)] sm:w-[420px] bg-slate-900/98 border border-slate-700/90 rounded-3xl shadow-2xl p-5 space-y-3.5 transition-all duration-300 ease-out backdrop-blur-xl"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
        }}
      >
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <span>{step.icon}</span>
            <span>{step.badge}</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 font-semibold">
            {currentStepIndex + 1} / {TOUR_STEPS.length}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base sm:text-lg font-black text-white leading-tight">
          {step.title[language] || step.title.en}
        </h4>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {step.description[language] || step.description.en}
        </p>

        {/* Interactive Action Trigger Bar */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-300">
            <span>👉</span>
            <span className="text-[11px] sm:text-xs font-medium">
              {step.buttonHint[language] || step.buttonHint.en}
            </span>
          </div>
          <button
            onClick={handleTryAction}
            className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-[10px] uppercase whitespace-nowrap shadow-sm shadow-orange-500/30 active:scale-95 transition-all"
          >
            Trigger
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-semibold px-2 py-1 transition-colors"
          >
            Exit Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-black shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>{isLast ? 'Complete ✓' : 'Next Step →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
