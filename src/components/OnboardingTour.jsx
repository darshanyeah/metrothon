// src/components/OnboardingTour.jsx
// Spotlight & Interactive Moving Focus Onboarding Tour
// Computes real element bounding boxes, places a glowing cutout spotlight,
// scrolls into view, and anchors a floating guidance tooltip directly beside the target button.

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
      en: 'These cards let commuters pick major corridors like Thaltej → Infocity or Kalupur → GIFT City. Each corridor calculates unified multimodal legs automatically.',
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
      en: 'Government judges care deeply about inclusivity. Clicking this button filters the journey for certified elevators, wheelchair ramps, and low-floor accessible buses.',
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
      en: 'Switch between Standard, Senior Citizen (30% off), or Divyangjan (50% state subsidy). The algorithm computes the discount and logs the state subsidy claim.',
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
      en: 'This is the core citizen action! Clicking this generates ONE digital pass signed with HMAC-SHA256, valid across Gujarat Metro, Janmarg BRTS, and AMTS turnstiles.',
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
      en: 'Here is the municipal breakthrough for judges! Drag this slider to see how AMC and GMRC can dynamically adjust feeder bus incentives to maximize metro ridership.',
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
      en: 'Judges want to know: "How does it work at an offline gate?" Click this button to simulate scanning a pass at Metro AFC Gate 2. Watch the barrier open, or see Anti-Passback block a double-tap!',
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
      en: 'In this tab, judges will see the animated SVG transit map with moving trains, the citizen carbon credit gamification engine, and the live AI departure countdown advisor.',
      gu: 'આ ટેબમાં સાબરમતી નદી પર ટ્રેનોનો લાઈવ મેપ, ગ્રીન માઇલ્સ લોયલ્ટી અને એઆઈ કાઉન્ટડાઉન ઘડિયાળ છે.'
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
      en: 'The ultimate presentation clincher: Click this airplane mode button anytime during your pitch to prove the app never crashes in underground tunnels, gracefully relying on IndexedDB.',
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
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, placement: 'bottom' })

  const updateTargetPosition = useCallback(() => {
    const step = TOUR_STEPS[currentStepIndex]
    if (!step) return

    const element = document.querySelector(`[data-tour="${step.targetTourId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      
      setTimeout(() => {
        const rect = element.getBoundingClientRect()
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom,
        })

        const spaceBelow = window.innerHeight - rect.bottom
        const isBelow = spaceBelow > 260
        
        let leftPos = Math.max(16, rect.left + rect.width / 2 - 200)
        if (leftPos + 400 > window.innerWidth) {
          leftPos = window.innerWidth - 416
        }

        setTooltipPos({
          top: isBelow ? rect.bottom + 14 : Math.max(16, rect.top - 240),
          left: leftPos,
          placement: isBelow ? 'bottom' : 'top'
        })
      }, 250)
    } else {
      setTargetRect(null)
    }
  }, [currentStepIndex])

  useEffect(() => {
    if (!isOpen) return
    const step = TOUR_STEPS[currentStepIndex]
    if (step) {
      setView(step.targetView)
      const timer = setTimeout(() => {
        updateTargetPosition()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [currentStepIndex, isOpen, updateTargetPosition, setView])

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('resize', updateTargetPosition)
    window.addEventListener('scroll', updateTargetPosition, true)
    return () => {
      window.removeEventListener('resize', updateTargetPosition)
      window.removeEventListener('scroll', updateTargetPosition, true)
    }
  }, [isOpen, updateTargetPosition])

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === TOUR_STEPS.length - 1

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
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* Dark overlay backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-[2px] transition-all duration-300"
        onClick={onClose}
      />

      {/* Spotlight cutout border around focused button */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-2xl transition-all duration-300 ease-out z-50"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.78), 0 0 24px 6px rgba(249, 115, 22, 0.65)',
            border: '2px solid rgba(249, 115, 22, 0.9)',
          }}
        >
          {/* Pulsing indicator tag */}
          <span className="absolute -top-3.5 left-3 px-2 py-0.5 rounded-full bg-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider animate-bounce shadow-md">
            Focus
          </span>
        </div>
      )}

      {/* Floating Guidance Tooltip Card */}
      <div
        className="fixed z-50 w-full max-w-[390px] sm:max-w-[420px] bg-slate-900/95 border border-slate-700 rounded-3xl shadow-2xl p-5 space-y-3.5 transition-all duration-300 animate-slide-up"
        style={{
          top: targetRect ? tooltipPos.top : '35%',
          left: targetRect ? tooltipPos.left : '50%',
          transform: targetRect ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        {/* Step Header */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <span>{step.icon}</span>
            <span>{step.badge}</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {currentStepIndex + 1} / {TOUR_STEPS.length}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base sm:text-lg font-black text-white leading-tight">
          {step.title[language] || step.title.en}
        </h4>

        {/* Explanation */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {step.description[language] || step.description.en}
        </p>

        {/* Button Hint / Interaction Prompt */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <span>👉</span>
            <span className="line-clamp-2 text-[11px] sm:text-xs">
              {step.buttonHint[language] || step.buttonHint.en}
            </span>
          </div>
          <button
            onClick={handleTryAction}
            className="px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-[10px] font-bold uppercase whitespace-nowrap transition-colors"
          >
            Trigger
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-semibold px-2 py-1 transition-colors"
          >
            Skip Tour
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
              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-black shadow-md shadow-orange-500/20 transition-all flex items-center gap-1"
            >
              <span>{isLast ? 'Finish Tour ✓' : 'Next Step →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
