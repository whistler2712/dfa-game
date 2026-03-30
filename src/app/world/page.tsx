'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGameStore } from '@/store/gameStore'
import { LEVELS, WORLD_TITLES, Shape } from '@/lib/levels'
import { ShapeIcon } from '@/components/ShapeIcon'

interface WorldInfo {
  subtitle: string
  shape: Shape
  color: string
  bg: string
}

const WORLD_INFO: Record<number, WorldInfo> = {
  1: { subtitle: '길 찾기',   shape: '★', color: '#F5A623', bg: '#FFF8E8' },
  2: { subtitle: '개수 세기', shape: '●', color: '#5B9BD5', bg: '#EAF3FB' },
  3: { subtitle: '포함·금지', shape: '■', color: '#5BB87A', bg: '#E8F7EE' },
  4: { subtitle: '위치·길이', shape: '★', color: '#FF7E6B', bg: '#FFF0EC' },
  5: { subtitle: '복합 조건', shape: '●', color: '#9B7FD4', bg: '#F2EEFB' },
}

function getLevelIndices(world: number) {
  return LEVELS.map((l, i) => ({ w: l.world, i }))
    .filter(x => x.w === world)
    .map(x => x.i)
}

export default function WorldPage() {
  const router = useRouter()
  const { clearedLevels } = useGameStore()
  const [selectedWorld, setSelectedWorld] = useState<number | null>(null)

  function isWorldUnlocked(world: number): boolean {
    if (world === 1) return true
    return getLevelIndices(world - 1).some(i => clearedLevels[i] !== undefined)
  }

  function getWorldProgress(world: number) {
    const indices = getLevelIndices(world)
    const cleared = indices.filter(i => clearedLevels[i] !== undefined).length
    const stars = indices.reduce((s, i) => s + (clearedLevels[i] ?? 0), 0)
    return { cleared, total: indices.length, stars, maxStars: indices.length * 3 }
  }

  function isBossLevel(levelIndex: number, world: number) {
    const indices = getLevelIndices(world)
    return levelIndex === indices[indices.length - 1]
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] px-4 py-6">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="font-['Nunito'] text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← 메인
          </Link>
          <h1 className="font-['Gaegu'] text-2xl font-bold text-stone-800">
            월드 선택
          </h1>
        </div>

        {/* 월드 카드 목록 */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((world) => {
            const info = WORLD_INFO[world]
            const progress = getWorldProgress(world)
            const unlocked = isWorldUnlocked(world)
            const isSelected = selectedWorld === world
            const levelIndices = getLevelIndices(world)

            return (
              <div key={world}>
                {/* 월드 카드 */}
                <button
                  disabled={!unlocked}
                  onClick={() => setSelectedWorld(isSelected ? null : world)}
                  className={`
                    w-full rounded-2xl border p-4 text-left transition-all
                    ${isSelected ? 'shadow-md border-2' : 'border hover:shadow-sm'}
                    ${unlocked ? 'bg-white' : 'bg-stone-50 opacity-60 cursor-not-allowed'}
                  `}
                  style={isSelected ? { borderColor: info.color } : undefined}
                >
                  <div className="flex items-center gap-4">
                    {/* 아이콘 */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: info.bg }}
                    >
                      {unlocked
                        ? <ShapeIcon shape={info.shape} size={28} />
                        : <span className="text-lg">🔒</span>
                      }
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <span
                        className="font-['Nunito'] text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: info.color }}
                      >
                        {info.subtitle}
                      </span>
                      <p className="font-['Gaegu'] text-lg font-bold text-stone-800 leading-tight">
                        {WORLD_TITLES[world]}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-['Nunito'] text-xs text-stone-400">
                          {progress.cleared}/{progress.total} 클리어
                        </span>
                        <span className="font-['Nunito'] text-xs" style={{ color: '#F5A623' }}>
                          {'★'.repeat(progress.stars)}
                          <span style={{ color: '#D4CFC9' }}>
                            {'★'.repeat(progress.maxStars - progress.stars)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* 화살표 */}
                    {unlocked && (
                      <span
                        className="text-stone-300 text-2xl leading-none transition-transform duration-200"
                        style={{ transform: isSelected ? 'rotate(90deg)' : 'none' }}
                      >
                        ›
                      </span>
                    )}
                  </div>
                </button>

                {/* 레벨 격자 (펼쳐짐) */}
                {isSelected && unlocked && (
                  <div className="mt-2 bg-white/60 rounded-2xl border border-stone-100 p-3">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {levelIndices.map((levelIndex) => {
                        const level = LEVELS[levelIndex]
                        const stars = clearedLevels[levelIndex]
                        const cleared = stars !== undefined
                        const boss = isBossLevel(levelIndex, world)

                        return (
                          <button
                            key={levelIndex}
                            onClick={() => router.push('/game/' + levelIndex)}
                            className={`
                              aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                              transition-all hover:scale-105 active:scale-95
                              ${boss
                                ? 'border-2 border-[#FF7E6B] bg-[#FFF0EC]'
                                : 'border border-stone-200 bg-white'
                              }
                              ${cleared ? 'shadow-sm' : ''}
                            `}
                          >
                            <span
                              className="font-['Nunito'] text-sm font-bold"
                              style={{ color: boss ? '#FF7E6B' : '#5a5047' }}
                            >
                              {level.id}
                            </span>
                            <span
                              className="text-[9px] leading-none"
                              style={{ color: cleared ? '#F5A623' : '#D4CFC9' }}
                            >
                              {cleared
                                ? '★'.repeat(stars) + '☆'.repeat(3 - stars)
                                : '☆☆☆'
                              }
                            </span>
                            {boss && (
                              <span className="text-[8px] text-[#FF7E6B] font-['Nunito'] font-bold leading-none">
                                BOSS
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
