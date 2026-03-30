'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore, STAR_SCORE } from '@/store/gameStore'
import { LEVELS } from '@/lib/levels'
import { soundManager } from '@/lib/sounds'

export default function ClearModal() {
  const { phase, stars, currentLevelIndex, totalScore, loadLevel, resetGame } = useGameStore()
  const router = useRouter()
  const [visibleStars, setVisibleStars] = useState(0)

  const isLastLevel = currentLevelIndex >= LEVELS.length - 1
  const points = STAR_SCORE[stars as 1 | 2 | 3] ?? 0

  useEffect(() => {
    if (phase !== 'cleared') { setVisibleStars(0); return }
    setVisibleStars(0)

    // 팡파레 + 별점 등장음 (별이 나타나는 타이밍에 맞춤)
    soundManager.playClear()
    const starDelays = [200, 500, 800]
    const starTimers = starDelays.slice(0, stars).map((delay, i) =>
      setTimeout(() => {
        setVisibleStars(i + 1)
        soundManager.playStar(0)
      }, delay)
    )

    return () => starTimers.forEach(clearTimeout)
  }, [phase, stars])

  if (phase !== 'cleared') return null

  // 마지막 레벨 전체 클리어 화면
  if (isLastLevel) {
    const totalStars = Object.values(useGameStore.getState().clearedLevels)
      .reduce((a, b) => a + b, 0)

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
        <div className="bg-white rounded-3xl shadow-2xl px-8 py-8 flex flex-col items-center gap-5 max-w-sm w-full mx-4">
          <div className="text-5xl">🎉</div>
          <h2 className="font-['Gaegu'] text-3xl font-bold text-stone-800 text-center">
            전체 클리어!
          </h2>
          <p className="font-['Nunito'] text-sm text-stone-500 text-center">
            모든 미로를 정복했어요. 대단해요!
          </p>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-['Nunito'] text-xs text-stone-400">총 점수</p>
              <p className="font-['Nunito'] text-2xl font-bold text-stone-800">
                {totalScore.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="font-['Nunito'] text-xs text-stone-400">획득 별</p>
              <p className="font-['Nunito'] text-2xl font-bold" style={{ color: '#F5A623' }}>
                {totalStars}
                <span className="text-stone-400 text-sm font-normal"> / {LEVELS.length * 3}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => { resetGame(); router.push('/') }}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 font-['Nunito'] text-sm hover:bg-stone-50 transition-colors"
            >
              처음으로
            </button>
            <button
              onClick={() => router.push('/world')}
              className="flex-1 py-2.5 rounded-xl bg-[#FF7E6B] text-white font-['Nunito'] font-bold text-sm hover:bg-[#e86d5a] transition-colors"
            >
              월드 선택
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-8 flex flex-col items-center gap-5 max-w-sm w-full mx-4">
        <h2 className="font-['Gaegu'] text-3xl font-bold text-stone-800">클리어!</h2>

        {/* 별 애니메이션 */}
        <div className="flex gap-3">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className="text-4xl transition-all duration-300"
              style={{
                color: n <= visibleStars ? '#F5A623' : '#E5E0DA',
                transform: n <= visibleStars ? 'scale(1.2)' : 'scale(0.8)',
                opacity: n <= visibleStars ? 1 : 0.4,
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* 점수 */}
        <div className="text-center">
          <p className="font-['Nunito'] text-sm text-stone-500">획득 점수</p>
          <p className="font-['Nunito'] text-2xl font-bold text-[#FF7E6B]">+{points}</p>
          <p className="font-['Nunito'] text-xs text-stone-400 mt-0.5">
            누적 {totalScore.toLocaleString()}점
          </p>
        </div>

        {stars === 1 && (
          <p className="font-['Nunito'] text-xs text-stone-400 text-center">
            힌트 없이 도전하면 더 높은 점수를 받을 수 있어요!
          </p>
        )}
        {stars === 2 && (
          <p className="font-['Nunito'] text-xs text-stone-400 text-center">
            방을 줄이면 별 3개를 받을 수 있어요!
          </p>
        )}

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => router.push('/game/' + (currentLevelIndex + 1))}
            className="w-full py-2.5 rounded-xl bg-[#FF7E6B] text-white font-['Nunito'] font-bold text-sm hover:bg-[#e86d5a] transition-colors"
          >
            다음 스테이지 →
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => loadLevel(currentLevelIndex)}
              className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-500 font-['Nunito'] text-sm hover:bg-stone-50 transition-colors"
            >
              다시 도전
            </button>
            <button
              onClick={() => router.push('/world')}
              className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-500 font-['Nunito'] text-sm hover:bg-stone-50 transition-colors"
            >
              월드 선택
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
