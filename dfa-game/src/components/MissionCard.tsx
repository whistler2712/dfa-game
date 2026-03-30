'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { ShapeLabel } from './ShapeIcon'

export default function MissionCard() {
  const {
    level,
    phase,
    testResults,
    validationErrors,
    hintUsed,
    showHint,
    history,
    checkSolution,
    useHint,
    resetLevel,
    undo,
  } = useGameStore()

  // Cmd+Z / Ctrl+Z 단축키
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo])

  const isPlaying = phase === 'playing' || phase === 'failed'

  return (
    <div className="flex flex-col h-full">

      {/* ── 스크롤 영역 ─────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-2 flex flex-col gap-3">

        {/* 미션 제목 */}
        <div>
          <span className="font-['Nunito'] text-[10px] font-bold uppercase tracking-wider text-stone-400">
            스테이지 {level.id}
          </span>
          <h2 className="font-['Gaegu'] text-xl font-bold text-stone-800 leading-tight">
            {level.title}
          </h2>
          <p className="font-['Nunito'] text-xs text-stone-500 mt-1 leading-relaxed">
            {level.story}
          </p>
        </div>

        {/* 예시 */}
        <div className="flex flex-col gap-1.5">
          <p className="font-['Nunito'] text-[10px] font-bold uppercase tracking-wider text-stone-400">
            예시
          </p>
          {level.testCases.map((tc, i) => {
            const result = testResults[i]
            const inputStr = tc.input.join(',')

            // 결과 없음 → expected 색상 / 테스트 완료 → 실제 결과 색상
            let chipBg: string
            let resultIcon: React.ReactNode

            if (!result) {
              chipBg = tc.expected
                ? 'bg-emerald-50 border-emerald-100'
                : 'bg-red-50 border-red-100'
              resultIcon = tc.expected
                ? <span className="text-emerald-300 font-bold text-xs ml-auto shrink-0">✓</span>
                : <span className="text-red-300 font-bold text-xs ml-auto shrink-0">✗</span>
            } else if (result.pass) {
              chipBg = 'bg-emerald-50 border-emerald-200'
              resultIcon = <span className="text-emerald-500 font-bold text-xs ml-auto shrink-0">✓</span>
            } else {
              chipBg = 'bg-red-50 border-red-200'
              resultIcon = <span className="text-red-500 font-bold text-xs ml-auto shrink-0">✗</span>
            }

            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-['Nunito'] ${chipBg}`}
              >
                {inputStr
                  ? <ShapeLabel label={inputStr} />
                  : <span className="text-[10px] text-stone-400 italic">(빈 순서)</span>
                }
                {resultIcon}
              </div>
            )
          })}
        </div>

        {/* 유효성 오류 */}
        {validationErrors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="font-['Nunito'] text-xs font-bold text-amber-700 mb-1">미로 구조 오류</p>
            {validationErrors.map((e, i) => (
              <p key={i} className="font-['Nunito'] text-xs text-amber-600">• {e.message}</p>
            ))}
          </div>
        )}

        {/* 힌트 */}
        {showHint && level.hint && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <p className="font-['Nunito'] text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-0.5">
              힌트
            </p>
            <p className="font-['Nunito'] text-xs text-blue-700">{level.hint}</p>
          </div>
        )}
      </div>

      {/* ── 하단 고정 버튼 ───────────────────────────────────── */}
      {isPlaying && (
        <div className="shrink-0 px-4 pb-4 pt-2 border-t border-stone-100 flex flex-col gap-2">
          <button
            onClick={checkSolution}
            className="w-full py-2.5 rounded-xl bg-[#FF7E6B] text-white font-['Nunito'] font-bold text-sm hover:bg-[#e86d5a] transition-colors"
          >
            정답 확인
          </button>
          <div className="flex gap-2">
            {!hintUsed && level.hint && (
              <button
                onClick={useHint}
                className="flex-1 py-2 rounded-xl border border-blue-200 text-blue-500 font-['Nunito'] text-xs hover:bg-blue-50 transition-colors"
              >
                💡 힌트 (별 1개 손해)
              </button>
            )}
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-500 font-['Nunito'] text-xs hover:bg-stone-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ↩ 되돌리기
            </button>
            <button
              onClick={resetLevel}
              className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-500 font-['Nunito'] text-xs hover:bg-stone-50 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
