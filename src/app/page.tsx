'use client'

import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { LEVELS } from '@/lib/levels'
import { ShapeIcon } from '@/components/ShapeIcon'

const TUTORIAL_STORAGE_KEY = 'dfa-tutorial-done'

export default function MainMenu() {
  const router = useRouter()
  const { clearedLevels, totalScore } = useGameStore()

  function handleStart() {
    let tutorialDone = false
    try {
      tutorialDone = localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true'
    } catch { /* ignore */ }
    // 튜토리얼 미완료 → 게임 0번 레벨로 (튜토리얼 오버레이가 거기서 표시)
    // 완료 → 월드 선택으로
    router.push(tutorialDone ? '/world' : '/game/0')
  }

  const totalStars = Object.values(clearedLevels).reduce((a, b) => a + b, 0)
  const maxStars = LEVELS.length * 3
  const clearedCount = Object.keys(clearedLevels).length

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col items-center justify-center relative overflow-hidden px-4 py-10">
      {/* 배경 데코 도형 */}
      <div className="absolute top-8 left-8 opacity-10 pointer-events-none select-none rotate-12">
        <ShapeIcon shape="★" size={90} />
      </div>
      <div className="absolute top-24 right-10 opacity-10 pointer-events-none select-none">
        <ShapeIcon shape="●" size={64} />
      </div>
      <div className="absolute bottom-24 left-14 opacity-10 pointer-events-none select-none -rotate-6">
        <ShapeIcon shape="■" size={72} />
      </div>
      <div className="absolute bottom-10 right-16 opacity-10 pointer-events-none select-none rotate-12">
        <ShapeIcon shape="★" size={52} />
      </div>
      <div className="absolute top-1/2 left-4 opacity-6 pointer-events-none select-none -translate-y-1/2">
        <ShapeIcon shape="●" size={40} />
      </div>
      <div className="absolute top-1/3 right-4 opacity-6 pointer-events-none select-none">
        <ShapeIcon shape="■" size={44} />
      </div>

      {/* 로고 */}
      <div className="flex items-center gap-3 mb-5">
        <ShapeIcon shape="★" size={36} />
        <ShapeIcon shape="●" size={36} />
        <ShapeIcon shape="■" size={36} />
      </div>

      <h1 className="font-['Gaegu'] text-6xl sm:text-7xl font-bold text-stone-800 mb-2 text-center leading-tight">
        도형 미로
      </h1>
      <p className="font-['Nunito'] text-sm text-stone-500 mb-10 text-center">
        방과 통로를 연결하는 퍼즐 게임
      </p>

      <button
        onClick={handleStart}
        className="px-12 py-4 rounded-2xl bg-[#FF7E6B] text-white font-['Nunito'] font-bold text-lg hover:bg-[#e86d5a] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#FF7E6B]/20"
      >
        시작하기
      </button>

      {/* 통계 */}
      <div className="mt-12 flex gap-0 bg-white/70 backdrop-blur px-2 py-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex flex-col items-center px-6">
          <p className="font-['Nunito'] text-xl font-bold text-stone-800">
            {totalScore.toLocaleString()}
          </p>
          <p className="font-['Nunito'] text-xs text-stone-400 mt-0.5">총 점수</p>
        </div>
        <div className="w-px bg-stone-100 self-stretch" />
        <div className="flex flex-col items-center px-6">
          <p className="font-['Nunito'] text-xl font-bold" style={{ color: '#F5A623' }}>
            {totalStars}
            <span className="text-stone-400 text-sm font-normal"> / {maxStars}</span>
          </p>
          <p className="font-['Nunito'] text-xs text-stone-400 mt-0.5">획득 별</p>
        </div>
        <div className="w-px bg-stone-100 self-stretch" />
        <div className="flex flex-col items-center px-6">
          <p className="font-['Nunito'] text-xl font-bold text-stone-800">
            {clearedCount}
            <span className="text-stone-400 text-sm font-normal"> / {LEVELS.length}</span>
          </p>
          <p className="font-['Nunito'] text-xs text-stone-400 mt-0.5">클리어</p>
        </div>
      </div>
    </div>
  )
}
