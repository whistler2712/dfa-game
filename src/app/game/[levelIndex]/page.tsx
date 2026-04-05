'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/store/gameStore'
import { LEVELS } from '@/lib/levels'
import HUD from '@/components/HUD'
import MissionCard from '@/components/MissionCard'
import ClearModal from '@/components/ClearModal'
import GameOverModal from '@/components/GameOverModal'
import TutorialOverlay from '@/components/TutorialOverlay'

const DFACanvas = dynamic(() => import('@/components/DFACanvas'), { ssr: false })

export default function LevelPage() {
  const params = useParams()
  const router = useRouter()
  const { loadLevel } = useGameStore()

  const levelIndex = parseInt(params.levelIndex as string, 10)

  useEffect(() => {
    if (isNaN(levelIndex) || levelIndex < 0 || levelIndex >= LEVELS.length) {
      router.replace('/world')
      return
    }
    loadLevel(levelIndex)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex])

  if (isNaN(levelIndex) || levelIndex < 0 || levelIndex >= LEVELS.length) {
    return null
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FDF6EC]">
      <HUD />

      <div className="flex flex-1 min-h-0">
        {/* MissionCard가 데스크탑/모바일 레이아웃을 자체 처리 */}
        <MissionCard />

        {/* 캔버스 */}
        <main className="flex-1 min-w-0 relative">
          <DFACanvas />
          <ClearModal />
          <GameOverModal />
        </main>
      </div>

      {/* 튜토리얼 — 최초 1회만 표시, fixed 포지션으로 전체 화면 위에 렌더링 */}
      <TutorialOverlay />
    </div>
  )
}
