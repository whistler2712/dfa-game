'use client'

import { useGameStore } from '@/store/gameStore'
import { ShapeIcon } from './ShapeIcon'
import { Shape } from '@/lib/levels'

const SHAPE_BG: Record<Shape, string> = {
  '★': 'bg-[#FFF8E8] border-[#F5A623] text-[#c47d00]',
  '●': 'bg-[#EAF3FB] border-[#5B9BD5] text-[#3a74a8]',
  '■': 'bg-[#E8F7EE] border-[#5BB87A] text-[#2a7a4a]',
}

export default function ShapePad() {
  const {
    level,
    testSequence,
    testSeqResult,
    phase,
    addToSequence,
    removeFromSequence,
    clearSequence,
    runSequence,
  } = useGameStore()

  if (phase !== 'playing' && phase !== 'failed') return null

  return (
    <div className="flex flex-col gap-2">
      <p className="font-['Nunito'] text-[10px] font-bold uppercase tracking-wider text-stone-400">
        내 순서 테스트
      </p>

      {/* 도형 버튼 */}
      <div className="flex gap-2">
        {level.alpha.map((s) => (
          <button
            key={s}
            onClick={() => addToSequence(s)}
            className={`flex-1 py-2 rounded-xl border-2 flex items-center justify-center gap-1.5 font-['Nunito'] text-xs font-bold transition-all hover:scale-105 active:scale-95 ${SHAPE_BG[s]}`}
          >
            <ShapeIcon shape={s} size={16} />
          </button>
        ))}
      </div>

      {/* 시퀀스 칩 */}
      {testSequence.length > 0 && (
        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
          {testSequence.map((s, i) => (
            <button
              key={i}
              onClick={() => removeFromSequence(i)}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs transition-all hover:opacity-70 active:scale-90 ${SHAPE_BG[s]}`}
              title="클릭해서 제거"
            >
              <ShapeIcon shape={s} size={14} />
            </button>
          ))}
        </div>
      )}

      {/* 결과 */}
      {testSeqResult && (
        <div className={`px-3 py-1.5 rounded-lg text-xs font-['Nunito'] font-bold text-center
          ${testSeqResult === 'accept' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : ''}
          ${testSeqResult === 'reject' ? 'bg-red-50 text-red-500 border border-red-200' : ''}
          ${testSeqResult === 'invalid' ? 'bg-amber-50 text-amber-600 border border-amber-200' : ''}
        `}>
          {testSeqResult === 'accept' && '✓ 통과'}
          {testSeqResult === 'reject' && '✗ 막힘'}
          {testSeqResult === 'invalid' && '⚠ 미로 구조가 올바르지 않아'}
        </div>
      )}

      {/* 실행 / 초기화 */}
      <div className="flex gap-2">
        <button
          onClick={clearSequence}
          disabled={testSequence.length === 0}
          className="py-1.5 px-3 rounded-xl border border-stone-200 text-stone-400 font-['Nunito'] text-xs hover:bg-stone-50 disabled:opacity-40 transition-colors"
        >
          지우기
        </button>
        <button
          onClick={runSequence}
          disabled={testSequence.length === 0}
          className="flex-1 py-1.5 rounded-xl bg-[#5B9BD5] text-white font-['Nunito'] font-bold text-xs hover:bg-[#4a87bf] disabled:opacity-40 transition-colors"
        >
          테스트 실행
        </button>
      </div>
    </div>
  )
}
