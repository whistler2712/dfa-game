'use client'

import { useGameStore } from '@/store/gameStore'
import { LEVELS } from '@/lib/levels'

export default function LevelPanel() {
  const { level, phase, testResults, validationErrors, checkSolution, nextLevel, resetLevel } =
    useGameStore()

  const passCount = testResults.filter((r) => r.pass).length

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto px-1">
      {/* 레벨 헤더 */}
      <div>
        <div className="text-xs font-['Nunito'] text-stone-400 mb-0.5">
          Level {level.id} / {LEVELS.length}
        </div>
        <h2 className="font-['Gaegu'] text-2xl font-bold text-stone-800">
          {level.title}
        </h2>
        <p className="font-['Nunito'] text-sm text-stone-600 mt-1">
          {level.description}
        </p>
        {level.hint && (
          <p className="text-xs text-stone-400 mt-1 italic">{level.hint}</p>
        )}
      </div>

      {/* 테스트케이스 미리보기 */}
      <div>
        <div className="text-xs font-['Nunito'] font-semibold text-stone-500 mb-2">
          테스트 케이스
        </div>
        <div className="flex flex-col gap-1.5">
          {level.testCases.map((tc, i) => {
            const result = testResults[i]
            const bg = result
              ? result.pass
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
              : 'bg-white border-stone-200'
            return (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${bg}`}
              >
                <span className="font-['Nunito'] text-stone-500 w-4">{i + 1}.</span>
                <span className="flex-1 tracking-wide">
                  {tc.input.length === 0 ? (
                    <span className="text-stone-300 italic">빈 열</span>
                  ) : (
                    tc.input.join(' ')
                  )}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    tc.expected ? 'text-[#5BB87A]' : 'text-stone-400'
                  }`}
                >
                  {tc.expected ? '수락 ✓' : '거부 ✗'}
                </span>
                {result && (
                  <span className="text-lg">{result.pass ? '🎯' : '❌'}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 검증 에러 */}
      {validationErrors.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <div className="text-xs font-bold text-orange-600 mb-1">미로가 완성되지 않았어!</div>
          {validationErrors.map((e, i) => (
            <div key={i} className="text-xs text-orange-500">
              • {e.message}
            </div>
          ))}
        </div>
      )}

      {/* 결과 배너 */}
      {phase === 'cleared' && (
        <div className="bg-[#5BB87A] rounded-2xl p-4 text-white text-center">
          <div className="font-['Gaegu'] text-2xl font-bold">클리어! 🎉</div>
          <div className="font-['Nunito'] text-sm mt-1">
            {passCount} / {level.testCases.length} 통과
          </div>
        </div>
      )}
      {phase === 'failed' && testResults.length > 0 && (
        <div className="bg-[#FF7E6B] rounded-2xl p-4 text-white text-center">
          <div className="font-['Gaegu'] text-2xl font-bold">아직 아니야!</div>
          <div className="font-['Nunito'] text-sm mt-1">
            {passCount} / {level.testCases.length} 통과
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex flex-col gap-2 mt-auto pt-2">
        {phase !== 'cleared' && (
          <button
            onClick={checkSolution}
            className="w-full py-3 rounded-2xl bg-[#FF7E6B] text-white font-['Nunito'] font-bold text-base hover:bg-[#e86d5a] transition-colors"
          >
            채점하기 ✓
          </button>
        )}
        {phase === 'cleared' && level.id < LEVELS.length && (
          <button
            onClick={nextLevel}
            className="w-full py-3 rounded-2xl bg-[#5B9BD5] text-white font-['Nunito'] font-bold text-base hover:bg-[#4a87bf] transition-colors"
          >
            다음 레벨 →
          </button>
        )}
        <button
          onClick={resetLevel}
          className="w-full py-2 rounded-2xl border border-stone-200 text-stone-500 font-['Nunito'] text-sm hover:bg-stone-50 transition-colors"
        >
          초기화
        </button>
      </div>
    </div>
  )
}
