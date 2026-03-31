'use client'

import { memo, useState, useMemo, useEffect, useRef } from 'react'
import { Handle, NodeProps, useStore } from 'reactflow'
import { HANDLES, HANDLE_STYLE, NODE_SIZE } from '@/lib/handles'
import { useGameStore } from '@/store/gameStore'

interface NodeData {
  label: string
  isInitial: boolean
  isAccepting: boolean
}

const SIZE = NODE_SIZE  // 44px

const SHAPE_COLOR: Record<string, string> = {
  '★': '#F5A623',
  '●': '#5B9BD5',
  '■': '#5BB87A',
}

function getEdgeShapeColor(label: unknown): string {
  if (typeof label !== 'string') return '#B0ABA6'
  const first = label.split(',')[0]?.trim()
  return SHAPE_COLOR[first] ?? '#B0ABA6'
}

function DFAStateNode({ id, data, selected }: NodeProps<NodeData>) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  const connectionStartHandle = useStore(s => s.connectionStartHandle)
  const isConnecting = !!connectionStartHandle

  const edges = useGameStore(s => s.edges)
  const nodes = useGameStore(s => s.nodes)
  const toggleAccepting = useGameStore(s => s.toggleAccepting)
  const setInitial    = useGameStore(s => s.setInitial)
  const saveHistory   = useGameStore(s => s.saveHistory)
  const setNodes      = useGameStore(s => s.setNodes)
  const setEdges      = useGameStore(s => s.setEdges)

  const connectedHandles = useMemo(() => {
    const map = new Map<string, string>()
    for (const e of edges) {
      if (e.source === id && e.sourceHandle) map.set(e.sourceHandle, typeof e.label === 'string' ? e.label : '')
      if (e.target === id && e.targetHandle) map.set(e.targetHandle, typeof e.label === 'string' ? e.label : '')
    }
    return map
  }, [edges, id])

  // 메뉴 외부 클릭 닫기
  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  function handleMenuToggle(e: React.MouseEvent) {
    e.stopPropagation()
    // 롱프레스로 이미 열었다면 click 이벤트 무시
    if (longPressFired.current) {
      longPressFired.current = false
      return
    }
    setMenuOpen(v => !v)
  }

  function handleTouchStart(e: React.TouchEvent) {
    longPressFired.current = false
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      setMenuOpen(true)
    }, 500)
  }

  function handleTouchEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handleSetInitial() {
    saveHistory(); setInitial(id); setMenuOpen(false)
  }
  function handleToggleAccepting() {
    toggleAccepting(id); setMenuOpen(false)
  }
  function handleRename() {
    const next = window.prompt('방 이름 변경', data.label)
    if (next && next.trim()) {
      saveHistory()
      setNodes(nodes.map(n => n.id === id ? { ...n, data: { ...n.data, label: next.trim() } } : n))
    }
    setMenuOpen(false)
  }
  function handleDelete() {
    saveHistory()
    setNodes(nodes.filter(n => n.id !== id))
    setEdges(edges.filter(e => e.source !== id && e.target !== id))
    setMenuOpen(false)
  }

  const borderColor = data.isInitial ? '#5B9BD5' : data.isAccepting ? '#5BB87A' : '#D4CFC9'
  const bgColor     = data.isInitial ? '#DAEAF8' : data.isAccepting ? '#D9F2E3' : '#FFFFFF'
  const borderWidth = (data.isInitial || data.isAccepting) ? 2 : 1

  return (
    <div
      style={{ position: 'relative', width: SIZE, height: SIZE }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 버블 메뉴 */}
      {menuOpen && (
        <div
          ref={menuRef}
          onPointerDown={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: SIZE + 10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            border: '1px solid #E5E0DA',
            borderRadius: 12,
            zIndex: 9999,
            minWidth: 140,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {[
            { label: '시작 방 설정', action: handleSetInitial },
            { label: data.isAccepting ? '정답 방 해제' : '정답 방 설정', action: handleToggleAccepting },
            { label: '이름 변경', action: handleRename },
            { label: '삭제', action: handleDelete, danger: true },
          ].map(({ label, action, danger }) => (
            <button
              key={label}
              onClick={(e) => { e.stopPropagation(); action() }}
              style={{
                minHeight: 40,
                padding: '0 14px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid #F0EDE9',
                textAlign: 'left',
                fontFamily: 'Nunito, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: danger ? '#e05a47' : '#5a5047',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 시작 방 화살표 */}
      {data.isInitial && (
        <svg width="28" height="20" style={{
          position: 'absolute', right: '100%', top: '50%',
          transform: 'translateY(-50%)', marginRight: 2, overflow: 'visible',
        }}>
          <defs>
            <marker id="init-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#5B9BD5" />
            </marker>
          </defs>
          <line x1="0" y1="10" x2="24" y2="10" stroke="#5B9BD5" strokeWidth="1.5" markerEnd="url(#init-arrow)" />
        </svg>
      )}

      {/* 정답 방 이중 원 */}
      {data.isAccepting && (
        <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '2px solid #5BB87A', pointerEvents: 'none' }} />
      )}

      {/* 선택 링 */}
      {selected && (
        <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid #FF7E6B', pointerEvents: 'none' }} />
      )}

      {/* 노드 본체 */}
      <div
        onClick={handleMenuToggle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        style={{
          width: SIZE, height: SIZE, borderRadius: '50%',
          background: bgColor, border: `${borderWidth}px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', userSelect: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', boxSizing: 'border-box',
        }}
      >
        <span style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11,
          color: data.isInitial ? '#2a6ba8' : data.isAccepting ? '#2a7a4a' : '#5a5047',
          letterSpacing: '-0.2px',
        }}>
          {data.label}
        </span>
      </div>

      {/* 8방향 핸들 */}
      {HANDLES.map(h => {
        const isConnected = connectedHandles.has(h.id)
        const edgeLabel = connectedHandles.get(h.id) ?? ''

        let size: number, bg: string, border: string, opacity: number

        if (isConnecting && !hovered) {
          size = 8; bg = '#FF7E6B'; border = '2px solid white'; opacity = 1
        } else if (hovered) {
          size = 6; bg = 'white'; border = '1.5px solid #B0ABA6'; opacity = 1
        } else if (isConnected) {
          size = 4; bg = getEdgeShapeColor(edgeLabel); border = 'none'; opacity = 0.85
        } else {
          size = 1; bg = 'transparent'; border = 'none'; opacity = 0
        }

        const { top, left, transform } = HANDLE_STYLE[h.id]
        return (
          <Handle
            key={h.id}
            id={h.id}
            type="source"
            position={h.rfPosition}
            style={{
              position: 'absolute', top, left, transform,
              width: size, height: size, minWidth: size, minHeight: size,
              borderRadius: '50%', background: bg, border, opacity,
              transition: 'opacity 0.15s ease, width 0.15s ease, height 0.15s ease, background 0.15s ease',
              zIndex: 10, cursor: 'crosshair', boxSizing: 'border-box',
            }}
          />
        )
      })}
    </div>
  )
}

export default memo(DFAStateNode)