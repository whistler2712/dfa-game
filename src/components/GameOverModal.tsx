'use client'

import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'

export default function GameOverModal() {
  const { phase, totalScore, resetGame } = useGameStore()
  const router = useRouter()

  if (phase !== 'gameover') return null

  function handleRestart() {
    resetGame()
    router.push('/')
  }

  function handleWorldSelect() {
    resetGame()
    router.push('/world')
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-8 flex flex-col items-center gap-5 max-w-sm w-full mx-4">
        <div className="text-5xl">💀</div>
        <h2 className="font-['Gaegu'] text-3xl font-bold text-stone-800">게임 오버</h2>
        <p className="font-['Nunito'] text-sm text-stone-500 text-center">
          목숨을 모두 잃었어요.
        </p>

        <div className="text-center">
          <p className="font-['Nunito'] text-xs text-stone-400">최종 점수</p>
          <p className="font-['Nunito'] text-3xl font-bold text-stone-800">
            {totalScore.toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={handleWorldSelect}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 font-['Nunito'] text-sm hover:bg-stone-50 transition-colors"
          >
            월드 선택
          </button>
          <button
            onClick={handleRestart}
            className="flex-1 py-2.5 rounded-xl bg-[#FF7E6B] text-white font-['Nunito'] font-bold text-sm hover:bg-[#e86d5a] transition-colors"
          >
            처음부터 다시
          </button>
        </div>
      </div>
    </div>
  )
}
