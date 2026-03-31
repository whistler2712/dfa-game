'use client'

import DevTools from './DevTools'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { WORLD_TITLES } from '@/lib/levels'
import { soundManager } from '@/lib/sounds'

export default function HUD() {
  const { currentLevelIndex, level, lives, totalScore } = useGameStore()
  const router = useRouter()
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  // SSR hydration 불일치 방지: 초기값 고정 후 클라이언트에서 동기화
  const [soundEnabled, setSoundEnabled] = useState(true)
  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled())
  }, [])

  function toggleSound() {
    soundManager.toggle()
    setSoundEnabled(soundManager.isEnabled())
  }

  const stageNum = currentLevelIndex + 1
  const totalStages = 10
  const worldTitle = WORLD_TITLES[level.world] ?? ''

  function handleExit() {
    setShowExitConfirm(false)
    router.push('/world')
  }

  return (
    <>
      <header className="w-full flex items-center justify-between px-4 py-2.5 bg-white/80 backdrop-blur border-b border-stone-200 shrink-0">
        {/* 왼쪽: 나가기 + 스테이지 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="font-['Nunito'] text-xs text-stone-400 hover:text-stone-600 transition-colors px-2 py-1 rounded-lg hover:bg-stone-100"
          >
            ← 나가기
          </button>
          <span className="text-stone-200 select-none">|</span>
          <span className="font-['Nunito'] text-sm text-stone-500">
            스테이지{' '}
            <span className="font-bold text-stone-700">{stageNum}</span>
            {' '}/ {totalStages}
          </span>
          <span
            className="font-['Nunito'] text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 hidden sm:inline"
          >
            {worldTitle}
          </span>
        </div>

        {/* 오른쪽: 점수 + 목숨 + 사운드 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block font-['Nunito'] text-sm text-stone-600">
            <span className="text-xs text-stone-400 mr-1">점수</span>
            <span className="font-bold text-stone-800">{totalScore.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className="text-base leading-none"
                style={{ color: i < lives ? '#FF7E6B' : '#D4CFC9' }}
              >
                ♥
              </span>
            ))}
          </div>
          <button
            onClick={toggleSound}
            title={soundEnabled ? '소리 끄기' : '소리 켜기'}
            className="text-base leading-none px-1.5 py-1 rounded-lg hover:bg-stone-100 transition-colors"
            style={{ color: soundEnabled ? '#5a5047' : '#D4CFC9' }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      {/* 나가기 확인 모달 */}
      {showExitConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-2xl shadow-xl px-7 py-6 flex flex-col items-center gap-4 max-w-xs w-full mx-4">
            <p className="font-['Gaegu'] text-xl font-bold text-stone-800 text-center">
              정말 나가시겠어요?
            </p>
            <p className="font-['Nunito'] text-sm text-stone-500 text-center">
              진행 중인 풀이는 저장되지 않아요.
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 font-['Nunito'] text-sm hover:bg-stone-50 transition-colors"
              >
                계속 풀기
              </button>
              <button
                onClick={handleExit}
                className="flex-1 py-2.5 rounded-xl bg-[#FF7E6B] text-white font-['Nunito'] font-bold text-sm hover:bg-[#e86d5a] transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
      <DevTools />
    </>
  )
}