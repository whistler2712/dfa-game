#!/bin/bash
# 실행: bash fix_commands.sh (프로젝트 루트에서)

# ── 1. useTutorial.ts ──────────────────────────────────────────
cat > src/hooks/useTutorial.ts << 'EOF'
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
    } catch { /* SSR */ }
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
EOF

echo "✅ useTutorial.ts 완료"

# ── 2. DFACanvas.tsx onConnect 패치 ───────────────────────────
python3 - << 'PYEOF'
with open('src/components/DFACanvas.tsx', 'r') as f:
    content = f.read()

old = """  // ── 새 연결 ──────────────────────────────────────────────
  const onConnect = useCallback((connection: Connection) => {
    const isSelfLoop = connection.source === connection.target
    let sh = connection.sourceHandle ?? 'h-e'
    let th = connection.targetHandle ?? 'h-w'

    if (!isSelfLoop) {
      const srcNode = nodes.find(n => n.id === connection.source)
      const tgtNode = nodes.find(n => n.id === connection.target)
      if (srcNode && tgtNode) {
        // 64쌍 전체 비교해서 가장 짧은 핸들 쌍 선택
        const best = getBestHandlePair(
          srcNode.position.x, srcNode.position.y,
          tgtNode.position.x, tgtNode.position.y,
        )
        sh = best.sourceHandle
        th = best.targetHandle
      }
    }

    setPendingEdge({ ...connection, sourceHandle: sh, targetHandle: th })
    setEdgeLabel([])
  }, [nodes])"""

new = """  // ── 새 연결 ──────────────────────────────────────────────
  const onConnect = useCallback((connection: Connection) => {
    const isSelfLoop = connection.source === connection.target

    // 같은 방향 기존 엣지가 있으면 → 수정 모드로 전환 (중복 방지)
    const sameEdge = edges.find(
      e => e.source === connection.source && e.target === connection.target
    )
    if (sameEdge) {
      setEditingEdge(sameEdge)
      const current = typeof sameEdge.label === 'string'
        ? (sameEdge.label.split(',').map(s => s.trim()).filter(Boolean) as Shape[])
        : []
      setEdgeLabel(current)
      return
    }

    let sh = connection.sourceHandle ?? 'h-e'
    let th = connection.targetHandle ?? 'h-w'

    if (!isSelfLoop) {
      const srcNode = nodes.find(n => n.id === connection.source)
      const tgtNode = nodes.find(n => n.id === connection.target)
      if (srcNode && tgtNode) {
        // 역방향 엣지가 있으면 그 핸들을 피해서 선택
        const reverseEdge = edges.find(
          e => e.source === connection.target && e.target === connection.source
        )
        const best = getBestHandlePair(
          srcNode.position.x, srcNode.position.y,
          tgtNode.position.x, tgtNode.position.y,
          reverseEdge ? reverseEdge.targetHandle ?? undefined : undefined,
          reverseEdge ? reverseEdge.sourceHandle ?? undefined : undefined,
        )
        sh = best.sourceHandle
        th = best.targetHandle
      }
    }

    setPendingEdge({ ...connection, sourceHandle: sh, targetHandle: th })
    setEdgeLabel([])
  }, [nodes, edges])"""

if old in content:
    content = content.replace(old, new)
    with open('src/components/DFACanvas.tsx', 'w') as f:
        f.write(content)
    print("✅ DFACanvas.tsx 완료")
else:
    print("❌ DFACanvas.tsx: 패턴을 찾지 못했어요 — 수동으로 확인 필요")
PYEOF

echo ""
echo "모두 완료! 아래 명령으로 커밋하세요:"
echo "git add src/hooks/useTutorial.ts src/components/DFACanvas.tsx"
echo "git commit -m \"fix: prevent duplicate edges, fix tutorial timing\""
echo "git push origin main"
