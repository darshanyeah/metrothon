// src/components/OnboardingTour.jsx
// Interactive Guided Walkthrough for Hackathon Judges & First-time Users
// Switches tabs automatically and spotlights the features

import { useState, useEffect } from 'react'
import { useTransit } from '../context/TransitContext'

const TOUR_STEPS = [
  {
    targetView: 'planner',
    icon: '👋',
    badge: 'Welcome to One City, One Journey',
    title: {
      en: 'The Problem Statement (PS-08)',
      gu: 'સમસ્યા નિવારણ (PS-08)'
    },
    description: {
      en: 'Ahmedabad & Gandhinagar have 3 fragmented transit networks: Gujarat Metro (GMRC), Janmarg (BRTS), and AMTS buses. This platform unites them into a single journey and automated clearinghouse.',
      gu: 'અમદાવાદ અને ગાંધીનગરમાં ૩ અલગ ટ્રાન્સપોર્ટ છે: મેટ્રો, બીઆરટીએસ અને એએમટીએસ. આ પ્લેટફોર્મ તમામને એક મુસાફરી અને સ્વચાલિત ભાડા-હિસ્સા સિસ્ટમમાં જોડે છે.'
    },
    actionPrompt: {
      en: 'Let’s explore how a commuter plans their trip across all 3 operators in 1 click.',
      gu: 'ચાલો જોઈએ કે કેવી રીતે નાગરિક ફક્ત ૧ ક્લિકમાં તમામ ૩ ઓપરેટરોમાં મુસાફરી કરી શકે છે.'
    }
  },
  {
    targetView: 'planner',
    icon: '🗺️',
    badge: 'Pillar 1: Multimodal Journey Planner',
    title: {
      en: 'Unified Corridors & Cost Savings',
      gu: 'સંકલિત રૂટ્સ અને ભાડા બચત'
    },
    description: {
      en: 'Select realistic Ahmedabad–Gandhinagar routes (e.g. Kalupur to GIFT City). See the step-by-step breakdown: Walking → Metro → Skywalk Transfer → Janmarg Bus → AMTS Feeder, saving up to ₹20 per trip.',
      gu: 'વાસ્તવિક અમદાવાદ-ગાંધીનગર રૂટ પસંદ કરો (જેમ કે કાલુપુર થી ગિફ્ટ સિટી). પગપાળા, મેટ્રો, બીઆરટીએસ અને એએમટીએસનું સ્ટેપ-બાય-સ્ટેપ સંકલન અને ₹૨૦ સુધીની બચત જુઓ.'
    },
    actionPrompt: {
      en: 'Try toggling "♿ Divyangjan Mode" or selecting Senior Citizen concessions on the top bar!',
      gu: 'ઉપરના બારમાંથી "♿ દિવ્યાંગજન મોડ" અથવા સીનિયર સિટીઝન કન્સેશન પસંદ કરી શકો છો!'
    }
  },
  {
    targetView: 'planner',
    icon: '🎫',
    badge: 'Pillar 2: Cryptographic QR Pass',
    title: {
      en: 'One Ticket for All Turnstiles',
      gu: 'બધા ટર્નસ્ટાઇલ માટે એક જ ટિકિટ'
    },
    description: {
      en: 'Clicking "Get Unified QR Pass" generates an HMAC-SHA256 digitally signed token. It works at Metro flap barriers, BRTS turnstiles, and bus handheld conductors — completely offline without internet.',
      gu: '"સંકલિત QR પાસ મેળવો" પર ક્લિક કરવાથી HMAC-SHA256 સુરક્ષિત ટોકન જનરેટ થાય છે, જે મેટ્રો ગેટ, બીઆરટીએસ અને બસ કંડક્ટર મશીન પર ઇન્ટરનેટ વગર પણ ચાલે છે.'
    },
    actionPrompt: {
      en: 'Next, let’s see the Municipal Back-Office Clearinghouse.',
      gu: 'હવે મ્યુનિસિપલ બેક-ઓફિસ ક્લિયરિંગહાઉસ જોઈએ.'
    }
  },
  {
    targetView: 'settlement',
    icon: '⚖️',
    badge: 'Pillar 3: Automated Clearinghouse',
    title: {
      en: 'Inter-Agency Revenue Settlement',
      gu: 'સ્વચાલિત આવક વિભાજન (સેટલમેન્ટ)'
    },
    description: {
      en: 'How do GMRC, AJL (BRTS), and AMTS split the money? Our clearinghouse computes distance shares in real-time (< 2ms) and features a Feeder Discount Slider allowing the city to incentivize last-mile bus connections.',
      gu: 'મેટ્રો, બીઆરટીએસ અને એએમટીએસ વચ્ચે પૈસાની વહેંચણી કેવી રીતે થાય? અમારું ક્લિયરિંગહાઉસ રિયલ-ટાઇમમાં અંતર મુજબ ભાડું વહેંચે છે અને ફીડર ઇન્સેન્ટિવ સ્લાઇડર પ્રદાન કરે છે.'
    },
    actionPrompt: {
      en: 'Now, let’s inspect the physical Turnstile AFC hardware simulator.',
      gu: 'હવે ફિઝિકલ ટર્નસ્ટાઇલ એએફસી ગેટ સિમ્યુલેટર જોઈએ.'
    }
  },
  {
    targetView: 'inspector',
    icon: '🛡️',
    badge: 'Pillar 4: Gate Inspector & Anti-Passback',
    title: {
      en: 'Hardware Gate Validator Simulator',
      gu: 'ટર્નસ્ટાઇલ એએફસી હાર્ડવેર ચકાસણી'
    },
    description: {
      en: 'Demonstrates physical gate turnstile scanners. Test tapping a ticket at Thaltej Metro or BRTS turnstiles: watch the green flap open. Tapping the same pass again triggers the Anti-Passback security block!',
      gu: 'વાસ્તવિક સ્ટેશન ગેટ સિમ્યુલેટર. થલતેજ મેટ્રો અથવા બીઆરટીએસ ગેટ પર ટિકિટ ટેપ કરો: ગ્રીન બેરિયર ખુલશે. ફરીથી ટેપ કરશો તો એન્ટી-પાસબેક સુરક્ષા બ્લોક થશે!'
    },
    actionPrompt: {
      en: 'Finally, explore our live animated corridor map and gamification.',
      gu: 'છેલ્લે, અમારો લાઇવ એનિમેટેડ મેપ અને ગ્રીન માઇલ્સ જુઓ.'
    }
  },
  {
    targetView: 'smart',
    icon: '✨',
    badge: 'Pillar 5: Live Map, Green Miles & AI Advisor',
    title: {
      en: 'Hackathon Winning Differentiators',
      gu: 'વિશિષ્ટ અને આકર્ષક સુવિધાઓ'
    },
    description: {
      en: '1) Live animated transit map with moving trains along Sabarmati river. 2) Green Miles carbon credit loyalty system for citizens. 3) AI departure advisor with a real-time countdown clock.',
      gu: '૧) સાબરમતી નદી પર ટ્રેનોનો લાઇવ એનિમેટેડ મેપ. ૨) ગ્રીન માઇલ્સ કાર્બન લોયલ્ટી રિવોર્ડ્સ. ૩) રિયલ-ટાઇમ કાઉન્ટડાઉન સાથે એઆઈ પ્રસ્થાન સલાહકાર.'
    },
    actionPrompt: {
      en: 'You are all set! You can restart this tour anytime using the "🎯 Tour" button in the header.',
      gu: 'તમે તૈયાર છો! હેડરમાં "🎯 ટૂર" બટન દબાવીને ગમે ત્યારે આ ગાઇડ ફરી જોઈ શકો છો.'
    }
  }
]

export default function OnboardingTour({ isOpen, onClose }) {
  const { setView, language } = useTransit()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      // Auto-switch view to match current step
      const step = TOUR_STEPS[currentStepIndex]
      if (step && step.targetView) {
        setView(step.targetView)
      }
    }
  }, [currentStepIndex, isOpen])

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === TOUR_STEPS.length - 1

  function handleNext() {
    if (isLast) {
      onClose()
    } else {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Progress indicator bar */}
        <div className="h-1.5 bg-slate-800 w-full">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Modal content */}
        <div className="p-6 sm:p-7 space-y-4">
          
          {/* Badge & Step Count */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <span>{step.icon}</span>
              <span>{step.badge}</span>
            </span>
            <span className="text-xs font-mono text-slate-500">
              Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {step.title[language] || step.title.en}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {step.description[language] || step.description.en}
          </p>

          {/* Action Callout */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <span className="text-lg">💡</span>
            <p className="text-xs text-amber-300 font-medium leading-relaxed">
              {step.actionPrompt[language] || step.actionPrompt.en}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 font-semibold px-3 py-2 transition-colors"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>{isLast ? 'Complete & Explore' : 'Next Step →'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
