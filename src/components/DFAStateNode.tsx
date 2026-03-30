'use client'

import { memo, useState, useMemo } from 'react'
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

  // 연결 드래그 중 여부
  const connectionStartHandle = useStore(s => s.connectionStartHandle)
  const isConnecting = !!connectionStartHandle

  // 이 노드에 연결된 핸들 ID → 엣지 label 맵
  const edges = useGameStore(s => s.edges)
  const connectedHandles = useMemo(() => {
    const map = new Map<string, string>() // handleId → edge label
    for (const e of edges) {
      if (e.source === id && e.sourceHandle) {
        map.set(e.sourceHandle, typeof e.label === 'string' ? e.label : '')
      }
      if (e.target === id && e.targetHandle) {
        map.set(e.targetHandle, typeof e.label === 'string' ? e.label : '')
      }
    }
    return map
  }, [edges, id])

  const borderColor = data.isInitial
    ? '#5B9BD5' : data.isAccepting ? '#5BB87A' : '#D4CFC9'
  const bgColor = data.isInitial
    ? '#DAEAF8' : data.isAccepting ? '#D9F2E3' : '#FFFFFF'
  const borderWidth = (data.isInitial || data.isAccepting) ? 2 : 1

  return (
    <div
      style={{ position: 'relative', width: SIZE, height: SIZE }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 시작 방 화살표 */}
      {data.isInitial && (
        <svg
          width="28" height="20"
          style={{
            position: 'absolute', right: '100%', top: '50%',
            transform: 'translateY(-50%)', marginRight: 2, overflow: 'visible',
          }}
        >
          <defs>
            <marker id="init-arrow" markerWidth="6" markerHeight="6"
              refX="5" refY="3" orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="#5B9BD5" />
            </marker>
          </defs>
          <line x1="0" y1="10" x2="24" y2="10"
            stroke="#5B9BD5" strokeWidth="1.5" markerEnd="url(#init-arrow)" />
        </svg>
      )}

      {/* 수락 방 이중 원 */}
      {data.isAccepting && (
        <div style={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          border: '2px solid #5BB87A', pointerEvents: 'none',
        }} />
      )}

      {/* 선택 링 */}
      {selected && (
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: '2px solid #FF7E6B', pointerEvents: 'none',
        }} />
      )}

      {/* 노드 본체 */}
      <div style={{
        width: SIZE, height: SIZE, borderRadius: '50%',
        background: bgColor, border: `${borderWidth}px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', userSelect: 'none',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', boxSizing: 'border-box',
      }}>
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

        // 상태별 스타일 결정
        let size: number
        let bg: string
        let border: string
        let opacity: number

        if (isConnecting && !hovered) {
          // 연결 드래그 중 — target 노드 핸들 강조
          size = 8
          bg = '#FF7E6B'
          border = '2px solid white'
          opacity = 1
        } else if (hovered) {
          // hover — 연결 중에도 포함
          size = 6
          bg = 'white'
          border = '1.5px solid #B0ABA6'
          opacity = 1
        } else if (isConnected) {
          // 연결된 핸들 — 항상 작은 점으로 표시
          size = 4
          bg = getEdgeShapeColor(edgeLabel)
          border = 'none'
          opacity = 0.85
        } else {
          // 기본 — 완전히 숨김
          size = 1
          bg = 'transparent'
          border = 'none'
          opacity = 0
        }

        // HANDLE_STYLE 의 top/left/%와 transform을 그대로 쓰고,
        // 나머지 시각 속성만 상태에 따라 덮어씀.
        // transform은 HANDLE_STYLE 값을 그대로 유지해야 위치가 정확함.
        const { top, left, transform } = HANDLE_STYLE[h.id]
        return (
          <Handle
            key={h.id}
            id={h.id}
            type="source"
            position={h.rfPosition}
            style={{
              position: 'absolute',
              top,
              left,
              transform,
              width: size,
              height: size,
              minWidth: size,
              minHeight: size,
              borderRadius: '50%',
              background: bg,
              border,
              opacity,
              transition: 'opacity 0.15s ease, width 0.15s ease, height 0.15s ease, background 0.15s ease',
              zIndex: 10,
              cursor: 'crosshair',
              boxSizing: 'border-box',
            }}
          />
        )
      })}
    </div>
  )
}

export default memo(DFAStateNode)
