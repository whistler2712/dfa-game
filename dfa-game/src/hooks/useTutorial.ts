'use client'

import { useCallback, useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'

const STORAGE_KEY = 'dfa-tutorial-done'

// ── 튜토리얼 단계 정의 ───────────────────────────────────────────
export const TUTORIAL_STEPS = [
  'intro',           // 1단계: 게임 소개
  'mission',         // 2단계: 미션 읽는 법
  'add-node',        // 3단계: 방 추가 (실제 인터랙션 대기)
  'set-states',      // 4단계: 정답 방 지정 (실제 인터랙션 대기)
  'add-edge',        // 5단계: 통로 연결 (실제 인터랙션 대기)
  'self-loop',       // 6단계: 제자리 통로 (실제 인터랙션 대기)
  'check-solution',  // 7단계: 정답 확인
] as const

export type TutorialStep = (typeof TUTORIAL_STEPS)[number]

export interface TutorialState {
  isActive: boolean
  stepIndex: number
  currentStep: TutorialStep
  totalSteps: number
  /** 이 단계를 진행하기 위한 인터랙션 조건 달성 여부 */
  conditionMet: boolean
  advance: () => void
  skip: () => void
  /** 마지막 단계에서 완료 처리 */
  complete: () => void
}

// ── 훅 ──────────────────────────────────────────────────────────
export function useTutorial(): TutorialState {
  const [isActive, setIsActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // 게임 상태 구독 (인터랙션 조건 감지용)
  const nodes = useGameStore(s => s.nodes)
  const edges = useGameStore(s => s.edges)

  // 하이드레이션: localStorage에서 완료 여부 읽기
  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY) === 'true'
      if (!done) setIsActive(true)
    } catch {
      // localStorage를 못 읽는 환경(e.g. SSR) 이면 튜토리얼 표시하지 않음
    }
  }, [])

  const markDone = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch { /* ignore */ }
    setIsActive(false)
  }, [])

  const skip = useCallback(() => markDone(), [markDone])

  const complete = useCallback(() => markDone(), [markDone])

  const advance = useCallback(() => {
    setStepIndex(prev => {
      const next = prev + 1
      if (next >= TUTORIAL_STEPS.length) {
        markDone()
        return prev
      }
      return next
    })
  }, [markDone])

  const currentStep = TUTORIAL_STEPS[stepIndex]

  // ── 단계별 진행 조건 ─────────────────────────────────────────
  const conditionMet = ((): boolean => {
    switch (currentStep) {
      case 'intro':           return true
      case 'mission':         return true
      case 'add-node':        return nodes.length > 1
      case 'set-states':      return nodes.some(n => n.data?.isAccepting)
      case 'add-edge':        return edges.some(e => e.source !== e.target)
      case 'self-loop':       return edges.some(e => e.source === e.target)
      case 'check-solution':  return true
      default:                return true
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
