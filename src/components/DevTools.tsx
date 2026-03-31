'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { LEVELS } from '@/lib/levels'

const TUTORIAL_KEY = 'dfa-tutorial-done'

export default function DevTools() {
  // 개발 환경에서만 렌더
  if (process.env.NODE_ENV !== 'development') return null

  return <DevPanel />
}

function DevPanel() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const {
    currentLevelIndex,
    level,
    clearedLevels,
    totalScore,
    set,
    nextLevel,
    loadLevel,
  } = useGameStore()

  // ── 튜토리얼 리셋 ──────────────────────────────────────────────
  function resetTutorial() {
    try { localStorage.removeItem(TUTORIAL_KEY) } catch { /* ignore */ }
    router.push('/game/0')
    router.refresh()
  }

  // ── 현재 스테이지 자동 클리어 (별 3개) ───────────────────────
  function autoClear() {
    const idx = currentLevelIndex
    useGameStore.setState((s) => ({
      phase: 'cleared',
      stars: 3,
      totalScore: s.totalScore + 100,
      clearedLevels: {
        ...s.clearedLevels,
        [idx]: Math.max(s.clearedLevels[idx] ?? 0, 3),
      },
    }))
  }

  // ── 전체 진행도 초기화 ─────────────────────────────────────────
  function resetAll() {
    try { localStorage.clear() } catch { /* ignore */ }
    useGameStore.setState({
      clearedLevels: {},
      totalScore: 0,
    })
    router.push('/')
  }

  // ── 특정 레벨로 이동 ──────────────────────────────────────────
  function goToLevel(idx: number) {
    loadLevel(idx)
    router.push(`/game/${idx}`)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 9999,
      fontFamily: 'monospace',
    }}>
      {/* 토글 버튼 */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#1a1a2e',
          color: '#00ff88',
          border: '1.5px solid #00ff88',
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(0,255,136,0.3)',
        }}
        title="DevTools"
      >
        🛠
      </button>

      {/* 패널 */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 44,
          right: 0,
          width: 240,
          background: '#1a1a2e',
          border: '1px solid #2a2a4e',
          borderRadius: 10,
          padding: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {/* 헤더 */}
          <div style={{ color: '#00ff88', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 2 }}>
            ⚙ DEV TOOLS
          </div>

          {/* 현재 레벨 정보 */}
          <div style={{
            background: '#0d0d1e', borderRadius: 6, padding: '6px 8px',
            color: '#8888aa', fontSize: 10,
          }}>
            <span style={{ color: '#ffffff' }}>레벨 {currentLevelIndex + 1}</span>
            {' '}— {level.title}<br />
            <span>클리어: {Object.keys(clearedLevels).length} / {LEVELS.length}</span>
            {'  '}
            <span>점수: {totalScore}</span>
          </div>

          {/* 버튼들 */}
          <Btn color="#00ff88" onClick={autoClear}>
            ⚡ 현재 스테이지 클리어
          </Btn>

          <Btn color="#ffaa00" onClick={resetTutorial}>
            🔄 튜토리얼 리셋
          </Btn>

          {/* 레벨 점프 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#8888aa', fontSize: 10 }}>레벨 이동</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {[0, 5, 10, 20, 30, 40, 50].map(idx => (
                <button
                  key={idx}
                  onClick={() => goToLevel(idx)}
                  style={{
                    padding: '3px 7px',
                    borderRadius: 4,
                    background: currentLevelIndex === idx ? '#00ff88' : '#2a2a4e',
                    color: currentLevelIndex === idx ? '#000' : '#aaaacc',
                    border: 'none',
                    fontSize: 10,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: '#2a2a4e' }} />

          <Btn color="#ff4466" onClick={resetAll}>
            🗑 전체 초기화 (localStorage)
          </Btn>
        </div>
      )}
    </div>
  )
}

function Btn({
  children,
  onClick,
  color,
}: {
  children: React.ReactNode
  onClick: () => void
  color: string
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        padding: '6px 10px',
        borderRadius: 6,
        background: hover ? color + '22' : 'transparent',
        border: `1px solid ${color}44`,
        color,
        fontSize: 11,
        fontFamily: 'monospace',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  )
}