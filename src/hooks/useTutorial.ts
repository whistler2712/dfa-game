'use client'

import { useCallback, useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'

const STORAGE_KEY = 'dfa-tutorial-done'

export const TUTORIAL_STEPS = [
  'intro',
  'mission',
  'add-node',
  'set-states',
  'add-edge',
  'how-it-works',
  'self-loop',
  'check-solution',
] as const

export type TutorialStep = (typeof TUTORIAL_STEPS)[number]

export interface TutorialState {
  isActive: boolean
  stepIndex: number
  currentStep: TutorialStep
  totalSteps: number
  conditionMet: boolean
  advance: () => void
  skip: () => void
  complete: () => void
}

export function useTutorial(): TutorialState {
  const [isActive, setIsActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const nodes = useGameStore(s => s.nodes)
  const edges = useGameStore(s => s.edges)

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY) === 'true'
      if (!done) setIsActive(true)
    } catch { /* SSR 환경 */ }
  }, [])

  const markDone = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, 'true') } catch { /* ignore */ }
    setIsActive(false)
  }, [])

  const skip     = useCallback(() => markDone(), [markDone])
  const complete = useCallback(() => markDone(), [markDone])

  const advance = useCallback(() => {
    setStepIndex(prev => {
      const next = prev + 1
      if (next >= TUTORIAL_STEPS.length) { markDone(); return prev }
      return next
    })
  }, [markDone])

  const currentStep = TUTORIAL_STEPS[stepIndex]

  const conditionMet = ((): boolean => {
    switch (currentStep) {
      case 'intro':          return true
      case 'mission':        return true
      case 'add-node':       return nodes.length > 1
      case 'set-states':     return nodes.some(n => n.data?.isAccepting)
      case 'add-edge':       return edges.some(e => e.source !== e.target && !!e.label)
      case 'how-it-works':   return true
      case 'self-loop':      return edges.some(e => e.source === e.target)
      case 'check-solution': return true
      default:               return true
    }
  })()

  return {
    isActive,
    stepIndex,
    currentStep,
    totalSteps: TUTORIAL_STEPS.length,
    conditionMet,
    advance,
    skip,
    complete,
  }
}
